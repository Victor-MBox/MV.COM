// @ts-check
/**
 * Обработчик формы первого обращения: принимает POST /api/contact с JSON ContactPayload (src/api/contact.ts),
 * проверяет поля (lib.js), шлёт заявку в Telegram и дублирует письмом. Слушает 127.0.0.1:3721 — снаружи доступен
 * только через прокси nginx (deploy/nginx/matsakov-victor.com.conf, location /api/), локально — через прокси Vite.
 * На сервере работает службой systemd mvcom-contact (deploy/systemd/), переменные — /etc/matsakov-victor.com/contact.env;
 * локально — `npm run server` в корне проекта с server/.env (образец — .env.example).
 *
 * Ответы (JSON): 200 {ok:true} — доставлено хотя бы по одному каналу (или сработала ловушка для ботов);
 * 400 invalid (+fields) / bad_json; 413 too_large; 429 rate_limited; 502 delivery_failed — отказали все каналы;
 * 503 not_configured — не задан ни Telegram, ни SMTP. GET /api/contact/health — {ok, telegram, mail} для проверки деплоя
 */
import { createServer } from 'node:http'
import nodemailer from 'nodemailer'
import { RateLimiter, mailContent, parseLead, readConfig, telegramText } from './lib.js'

const MAX_BODY_BYTES = 32 * 1024
const UPSTREAM_TIMEOUT_MS = 15_000

const cfg = readConfig(process.env)
const limiter = new RateLimiter(cfg.rate)
setInterval(() => limiter.prune(), 60_000).unref()

const mailer = cfg.mail
	? nodemailer.createTransport({
			host: cfg.mail.host,
			port: cfg.mail.port,
			secure: cfg.mail.secure,
			auth: { user: cfg.mail.user, pass: cfg.mail.pass },
			connectionTimeout: UPSTREAM_TIMEOUT_MS,
			greetingTimeout: UPSTREAM_TIMEOUT_MS,
			socketTimeout: UPSTREAM_TIMEOUT_MS,
		})
	: null

/**
 * Строка в журнал (journald на сервере). Содержимое заявки и контакт сюда не пишутся — только служебные данные
 * @param {string} event
 * @param {Record<string, unknown>} [data]
 */
function log(event, data = {}) {
	console.log(`[contact] ${event} ${JSON.stringify(data)}`)
}

/**
 * @param {import('node:http').ServerResponse} res
 * @param {number} status
 * @param {Record<string, unknown>} data
 */
function send(res, status, data) {
	const body = JSON.stringify(data)
	res.writeHead(status, {
		'content-type': 'application/json; charset=utf-8',
		'content-length': Buffer.byteLength(body),
		'cache-control': 'no-store',
	})
	res.end(body)
}

/**
 * Тело запроса как JSON, не больше MAX_BODY_BYTES: при переполнении чтение останавливается (ошибка too_large), ответ 413
 * уходит с Connection: close, и Node закрывает соединение, не дочитывая остаток
 * @param {import('node:http').IncomingMessage} req
 * @returns {Promise<unknown>}
 */
function readJson(req) {
	return new Promise((resolve, reject) => {
		/** @type {Buffer[]} */
		const chunks = []
		let size = 0
		req.on('data', chunk => {
			size += chunk.length
			if (size > MAX_BODY_BYTES) {
				reject(Object.assign(new Error('too_large'), { code: 'too_large' }))
				req.pause()
				return
			}
			chunks.push(chunk)
		})
		req.on('end', () => {
			try {
				resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))
			} catch {
				reject(Object.assign(new Error('bad_json'), { code: 'bad_json' }))
			}
		})
		req.on('error', err => reject(Object.assign(err, { code: 'bad_request' })))
	})
}

/**
 * Адрес посетителя. За nginx настоящий — в X-Real-IP (proxy_set_header в конфиге); служба слушает только 127.0.0.1,
 * так что подставить заголовок снаружи нельзя
 * @param {import('node:http').IncomingMessage} req
 */
function clientIp(req) {
	const real = req.headers['x-real-ip']
	return (Array.isArray(real) ? real[0] : real) || req.socket.remoteAddress || 'unknown'
}

/**
 * Страница, с которой отправлена форма: Referer без query; нет или не разобрать — undefined
 * @param {string | undefined} referer
 */
function pageFrom(referer) {
	if (!referer) return undefined
	try {
		const u = new URL(referer)
		return `${u.origin}${u.pathname}`
	} catch {
		return undefined
	}
}

/**
 * @param {{ token: string, chatId: string }} tg
 * @param {string} text
 */
async function sendTelegram(tg, text) {
	const res = await fetch(`https://api.telegram.org/bot${tg.token}/sendMessage`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify({ chat_id: tg.chatId, text, parse_mode: 'HTML', link_preview_options: { is_disabled: true } }),
		signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
	})
	if (!res.ok) throw new Error(`Telegram API ${res.status}: ${(await res.text()).slice(0, 300)}`)
}

/**
 * Рассылает заявку по всем настроенным каналам параллельно. Заявка считается доставленной, если дошёл хотя бы один
 * канал; отказ остальных попадает в журнал, посетитель о нём не узнаёт
 * @param {import('./lib.js').Lead} lead
 * @param {import('./lib.js').LeadMeta} meta
 */
async function deliver(lead, meta) {
	/** @type {{ channel: string, run: Promise<unknown> }[]} */
	const jobs = []
	if (cfg.telegram) jobs.push({ channel: 'telegram', run: sendTelegram(cfg.telegram, telegramText(lead, meta)) })
	if (mailer && cfg.mail) {
		const { subject, text, replyTo } = mailContent(lead, meta)
		jobs.push({
			channel: 'mail',
			run: mailer.sendMail({ from: { name: 'Форма сайта', address: cfg.mail.from }, to: cfg.mail.to, replyTo, subject, text }),
		})
	}
	const results = await Promise.allSettled(jobs.map(j => j.run))
	/** @type {string[]} */
	const delivered = []
	/** @type {string[]} */
	const failed = []
	results.forEach((r, i) => {
		const { channel } = jobs[i]
		if (r.status === 'fulfilled') {
			delivered.push(channel)
		} else {
			failed.push(channel)
			log('channel_failed', { channel, error: r.reason instanceof Error ? r.reason.message : String(r.reason) })
		}
	})
	return { delivered, failed }
}

/**
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 */
async function handle(req, res) {
	const path = (req.url || '/').split('?')[0]
	if (path === '/api/contact/health' && req.method === 'GET') {
		return send(res, 200, { ok: true, telegram: !!cfg.telegram, mail: !!cfg.mail })
	}
	if (path !== '/api/contact') return send(res, 404, { ok: false, error: 'not_found' })
	if (req.method !== 'POST') {
		res.setHeader('allow', 'POST')
		return send(res, 405, { ok: false, error: 'method_not_allowed' })
	}
	if (!cfg.telegram && !cfg.mail) return send(res, 503, { ok: false, error: 'not_configured' })

	const ip = clientIp(req)
	if (!limiter.take(ip)) {
		log('rate_limited', { ip })
		return send(res, 429, { ok: false, error: 'rate_limited' })
	}

	/** @type {unknown} */
	let body
	try {
		body = await readJson(req)
	} catch (err) {
		const code = /** @type {{ code?: string }} */ (err).code || 'bad_request'
		if (code === 'too_large') res.setHeader('connection', 'close')
		return send(res, code === 'too_large' ? 413 : 400, { ok: false, error: code })
	}

	const parsed = parseLead(body)
	if (!parsed.ok) return send(res, 400, { ok: false, error: 'invalid', fields: parsed.fields })
	if (parsed.trap) {
		// Бот заполнил скрытое поле: отвечаем как при успехе, но никуда не отправляем
		log('trap', { ip })
		return send(res, 200, { ok: true })
	}

	const { delivered, failed } = await deliver(parsed.lead, { page: pageFrom(req.headers.referer) })
	if (delivered.length === 0) {
		log('delivery_failed', { ip, failed })
		return send(res, 502, { ok: false, error: 'delivery_failed' })
	}
	log('delivered', { ip, delivered, failed, topic: parsed.lead.topic, messageLength: parsed.lead.message.length })
	return send(res, 200, { ok: true })
}

const server = createServer((req, res) => {
	handle(req, res).catch(err => {
		log('error', { error: err instanceof Error ? err.message : String(err) })
		if (!res.headersSent) send(res, 500, { ok: false, error: 'internal' })
		else res.end()
	})
})

server.listen(cfg.port, cfg.host, () => {
	log('listening', { host: cfg.host, port: cfg.port, telegram: !!cfg.telegram, mail: !!cfg.mail })
	if (!cfg.telegram && !cfg.mail) {
		console.warn('[contact] не заданы ни TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID, ни SMTP_HOST + SMTP_USER + SMTP_PASS — заявки принимать некуда, форма получит 503')
	}
	// Проверка SMTP при старте — только в журнал: недоступная почта не должна мешать принимать заявки в Telegram
	mailer?.verify().then(
		() => log('smtp_ok', { host: cfg.mail?.host }),
		err => console.warn('[contact] SMTP недоступен:', err instanceof Error ? err.message : err),
	)
})

for (const signal of /** @type {NodeJS.Signals[]} */ (['SIGINT', 'SIGTERM'])) {
	process.on(signal, () => {
		log('stopping', { signal })
		server.close(() => process.exit(0))
		setTimeout(() => process.exit(0), 5_000).unref()
	})
}
