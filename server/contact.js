// @ts-check
/**
 * Обработчик формы первого обращения: принимает POST /api/contact с JSON ContactPayload (src/api/contact.ts),
 * проверяет поля и согласие (lib.js), доставляет заявку письмом (основной канал) и уведомляет в Telegram, пишет запись
 * о согласии в журнал на сервере. Слушает 127.0.0.1:3721 — снаружи доступен только через прокси nginx
 * (deploy/nginx/matsakov-victor.com.conf, location /api/), локально — через прокси Vite. На сервере работает службой
 * systemd mvcom-contact (deploy/systemd/), переменные — /etc/matsakov-victor.com/contact.env, журнал согласий —
 * StateDirectory /var/lib/mvcom-contact; локально — `npm run server` в корне проекта с server/.env (образец — .env.example).
 *
 * Ответы (JSON): 200 {ok:true, requestId} — содержимое заявки доставлено и запись о согласии сделана (или сработала
 * ловушка для ботов, или повтор уже принятой отправки); 400 invalid (+fields) / bad_json; 403 forbidden_origin;
 * 413 too_large; 429 rate_limited; 502 delivery_failed — содержимое не дошло ни по одному каналу; 503 not_configured —
 * нет канала с содержимым (почта или TELEGRAM_CONTENT=full) или некуда писать записи о согласии.
 * GET /api/contact/health — {ok, ready, telegram, mail, telegramContent, consentLog, versions} для проверки деплоя и формы
 */
import { createServer } from 'node:http'
import { accessSync, constants, mkdirSync, readFileSync } from 'node:fs'
import { appendFile, readFile, rename, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import nodemailer from 'nodemailer'
import {
	RateLimiter,
	SeenSubmissions,
	consentRecordLine,
	contentChannels,
	errorText,
	isAllowedOrigin,
	mailContent,
	makeRequestId,
	parseLead,
	pruneConsentLines,
	readConfig,
	readLegal,
	telegramNotice,
	telegramText,
} from './lib.js'

const MAX_BODY_BYTES = 32 * 1024
const UPSTREAM_TIMEOUT_MS = 15_000
const PRUNE_EVERY_MS = 24 * 60 * 60_000
const CONSENT_FILE = 'consents.jsonl'

const cfg = readConfig(process.env)
/** Редакции документов, которые принимает сервер; файл лежит рядом и попадает на сервер вместе с кодом */
const legal = readLegal(JSON.parse(readFileSync(new URL('./legal.json', import.meta.url), 'utf8')))
const limiter = new RateLimiter(cfg.rate)
/** @type {SeenSubmissions<{ ok: true, requestId: string }>} */
const seen = new SeenSubmissions(cfg.rate.windowMs)
setInterval(() => {
	limiter.prune()
	seen.prune()
}, 60_000).unref()

/**
 * Строка в журнал (journald на сервере). Содержимое заявки и контакт сюда не пишутся — только служебные данные
 * @param {string} event
 * @param {Record<string, unknown>} [data]
 */
function log(event, data = {}) {
	console.log(`[contact] ${event} ${JSON.stringify(data)}`)
}

// ---------- Журнал согласий ----------

/** Путь к файлу записей о согласии, если папка задана и доступна на запись; иначе null — заявки не принимаются */
const consentPath = (() => {
	if (!cfg.consentDir) return null
	try {
		mkdirSync(cfg.consentDir, { recursive: true, mode: 0o700 })
		accessSync(cfg.consentDir, constants.W_OK)
		return join(cfg.consentDir, CONSENT_FILE)
	} catch (err) {
		console.warn('[contact] папка записей о согласии недоступна:', cfg.consentDir, err instanceof Error ? err.message : err)
		return null
	}
})()

/** Удаляет записи старше срока хранения обращений (CONSENT_RETENTION_DAYS); файл переписывается атомарно */
async function pruneConsentLog() {
	if (!consentPath) return
	try {
		const text = await readFile(consentPath, 'utf8').catch(() => '')
		if (!text) return
		const next = pruneConsentLines(text, Date.now() - cfg.retentionDays * 86_400_000)
		if (next === text) return
		const tmp = `${consentPath}.tmp`
		await writeFile(tmp, next, { mode: 0o600 })
		await rename(tmp, consentPath)
		log('consent_log_pruned', { kept: next.split('\n').filter(Boolean).length })
	} catch (err) {
		log('consent_log_prune_failed', { error: err instanceof Error ? err.message : String(err) })
	}
}

const contentReady = contentChannels(cfg).length > 0
const ready = contentReady && consentPath !== null

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

/** @param {string | string[] | undefined} h */
function header(h) {
	return Array.isArray(h) ? h[0] : h
}

/**
 * Адрес посетителя. За nginx настоящий — в X-Real-IP (proxy_set_header в конфиге); служба слушает только 127.0.0.1,
 * так что подставить заголовок снаружи нельзя. Нужен только для лимита частоты — в журнал согласий не пишется
 * @param {import('node:http').IncomingMessage} req
 */
function clientIp(req) {
	return header(req.headers['x-real-ip']) || req.socket.remoteAddress || 'unknown'
}

/**
 * Страница, с которой отправлена форма: Referer без query (в письмо — с доменом, в запись о согласии — только путь);
 * нет или не разобрать — undefined
 * @param {string | undefined} referer
 */
function pageFrom(referer) {
	if (!referer) return { full: undefined, path: undefined }
	try {
		const u = new URL(referer)
		return { full: `${u.origin}${u.pathname}`, path: u.pathname }
	} catch {
		return { full: undefined, path: undefined }
	}
}

/**
 * Вызов Bot API; ответ не 2xx — ошибка с текстом Telegram (там причина: неверный токен, чат не найден, бот не запущен)
 * @param {{ token: string }} tg
 * @param {string} method
 * @param {Record<string, unknown>} params
 */
async function telegramCall(tg, method, params) {
	const res = await fetch(`https://api.telegram.org/bot${tg.token}/${method}`, {
		method: 'POST',
		headers: { 'content-type': 'application/json' },
		body: JSON.stringify(params),
		signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS),
	})
	if (!res.ok) throw new Error(`Telegram API ${res.status}: ${(await res.text()).slice(0, 300)}`)
}

/**
 * @param {{ token: string, chatId: string }} tg
 * @param {string} text
 */
function sendTelegram(tg, text) {
	return telegramCall(tg, 'sendMessage', { chat_id: tg.chatId, text, parse_mode: 'HTML', link_preview_options: { is_disabled: true } })
}

/**
 * Рассылает заявку по настроенным каналам параллельно. Заявка доставлена, если содержимое дошло хотя бы по одному
 * каналу с содержимым (почта; Telegram — только в режиме full). Уведомление без содержимого доставкой не считается;
 * отказы попадают в журнал, посетитель о них не узнаёт
 * @param {import('./lib.js').Lead} lead
 * @param {import('./lib.js').LeadMeta} meta
 */
async function deliver(lead, meta) {
	/** @type {{ channel: string, content: boolean, run: Promise<unknown> }[]} */
	const jobs = []
	if (cfg.telegram) {
		const full = cfg.telegram.content === 'full'
		const text = full ? telegramText(lead, meta) : telegramNotice({ ...meta, topic: lead.topic })
		jobs.push({ channel: 'telegram', content: full, run: sendTelegram(cfg.telegram, text) })
	}
	if (mailer && cfg.mail) {
		const { subject, text, replyTo } = mailContent(lead, meta)
		jobs.push({
			channel: 'mail',
			content: true,
			run: mailer.sendMail({ from: { name: 'Форма сайта', address: cfg.mail.from }, to: cfg.mail.to, replyTo, subject, text }),
		})
	}
	const results = await Promise.allSettled(jobs.map(j => j.run))
	/** @type {string[]} */
	const delivered = []
	/** @type {string[]} */
	const failed = []
	let contentDelivered = false
	results.forEach((r, i) => {
		const { channel, content } = jobs[i]
		if (r.status === 'fulfilled') {
			delivered.push(channel)
			if (content) contentDelivered = true
		} else {
			failed.push(channel)
			log('channel_failed', { channel, requestId: meta.requestId, error: errorText(r.reason) })
		}
	})
	return { delivered, failed, contentDelivered }
}

/**
 * @param {import('node:http').IncomingMessage} req
 * @param {import('node:http').ServerResponse} res
 */
async function handle(req, res) {
	const path = (req.url || '/').split('?')[0]
	if (path === '/api/contact/health' && req.method === 'GET') {
		return send(res, 200, {
			ok: true,
			ready,
			telegram: !!cfg.telegram,
			mail: !!cfg.mail,
			telegramContent: cfg.telegram?.content ?? 'off',
			consentLog: consentPath !== null,
			versions: { consent: legal.consent.version, policy: legal.policy.version },
		})
	}
	if (path !== '/api/contact') return send(res, 404, { ok: false, error: 'not_found' })
	if (req.method !== 'POST') {
		res.setHeader('allow', 'POST')
		return send(res, 405, { ok: false, error: 'method_not_allowed' })
	}
	if (!ready) return send(res, 503, { ok: false, error: 'not_configured' })

	if (
		!isAllowedOrigin({
			origin: header(req.headers.origin),
			host: header(req.headers.host),
			secFetchSite: header(req.headers['sec-fetch-site']),
			allowed: cfg.allowedOrigins,
		})
	) {
		log('forbidden_origin', { origin: header(req.headers.origin) })
		return send(res, 403, { ok: false, error: 'forbidden_origin' })
	}

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

	const parsed = parseLead(body, { consentVersion: legal.consent.version })
	if (!parsed.ok) {
		log('invalid', { ip, fields: parsed.fields })
		return send(res, 400, { ok: false, error: 'invalid', fields: parsed.fields })
	}
	if (parsed.trap) {
		// Бот заполнил скрытое поле: отвечаем как при успехе, но никуда не отправляем
		log('trap', { ip })
		return send(res, 200, { ok: true, requestId: makeRequestId() })
	}

	// Повтор уже принятой отправки (обрыв сети после успеха, двойной клик): прежний ответ, второй заявки нет
	const previous = parsed.submissionId ? seen.get(parsed.submissionId) : undefined
	if (previous) {
		log('duplicate', { ip, requestId: previous.requestId })
		return send(res, 200, previous)
	}

	const receivedAt = new Date()
	const requestId = makeRequestId(receivedAt)
	const page = pageFrom(header(req.headers.referer))
	/** @type {import('./lib.js').LeadMeta} */
	const meta = {
		requestId,
		receivedAt,
		formId: parsed.formId,
		page: page.full,
		consentVersion: legal.consent.version,
		policyVersion: legal.policy.version,
	}

	const { delivered, failed, contentDelivered } = await deliver(parsed.lead, meta)
	if (!contentDelivered) {
		log('delivery_failed', { ip, requestId, delivered, failed })
		return send(res, 502, { ok: false, error: 'delivery_failed' })
	}

	// Запись о согласии — после доставки, чтобы не плодить записи о заявках, которых оператор не получил. Сбой записи
	// в журнал (переполнение диска) не отменяет принятую заявку: её письмо само содержит номер, время и редакцию согласия
	if (consentPath) {
		const line = consentRecordLine({
			requestId,
			receivedAt,
			formId: parsed.formId,
			consentVersion: legal.consent.version,
			consentSha256: legal.consent.sha256,
			policyVersion: legal.policy.version,
			page: page.path,
			topic: parsed.lead.topic,
			delivered,
		})
		try {
			await appendFile(consentPath, line, { mode: 0o600 })
		} catch (err) {
			log('consent_log_failed', { requestId, error: err instanceof Error ? err.message : String(err) })
		}
	}

	/** @type {{ ok: true, requestId: string }} */
	const response = { ok: true, requestId }
	seen.set(parsed.submissionId, response)
	log('delivered', { ip, requestId, formId: parsed.formId, delivered, failed, topic: parsed.lead.topic, messageLength: parsed.lead.message.length })
	return send(res, 200, response)
}

const server = createServer((req, res) => {
	handle(req, res).catch(err => {
		log('error', { error: err instanceof Error ? err.message : String(err) })
		if (!res.headersSent) send(res, 500, { ok: false, error: 'internal' })
		else res.end()
	})
})

server.listen(cfg.port, cfg.host, () => {
	log('listening', {
		host: cfg.host,
		port: cfg.port,
		ready,
		telegram: cfg.telegram?.content ?? 'off',
		mail: !!cfg.mail,
		consentLog: consentPath,
		consentVersion: legal.consent.version,
	})
	if (!contentReady) {
		console.warn(
			'[contact] нет канала с содержимым заявки: задайте SMTP_HOST + SMTP_USER + SMTP_PASS (почта) или TELEGRAM_CONTENT=full — пока форма получает 503',
		)
	}
	if (!consentPath) {
		console.warn('[contact] не задана папка записей о согласии (CONSENT_LOG_DIR или StateDirectory systemd) — заявки не принимаются, форма получает 503')
	}
	// Проверка SMTP при старте — только в журнал: недоступная почта не должна мешать старту службы
	mailer?.verify().then(
		() => log('smtp_ok', { host: cfg.mail?.host }),
		err => console.warn('[contact] SMTP недоступен:', errorText(err)),
	)
	// Так же Telegram: getChat подтверждает сразу токен, chat_id и то, что бот может писать в этот чат
	if (cfg.telegram) {
		telegramCall(cfg.telegram, 'getChat', { chat_id: cfg.telegram.chatId }).then(
			() => log('telegram_ok'),
			err => console.warn('[contact] Telegram недоступен:', errorText(err)),
		)
	}
	void pruneConsentLog()
	setInterval(() => void pruneConsentLog(), PRUNE_EVERY_MS).unref()
})

for (const signal of /** @type {NodeJS.Signals[]} */ (['SIGINT', 'SIGTERM'])) {
	process.on(signal, () => {
		log('stopping', { signal })
		server.close(() => process.exit(0))
		setTimeout(() => process.exit(0), 5_000).unref()
	})
}
