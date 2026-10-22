// @ts-check
/**
 * Чистая часть обработчика формы (contact.js): разбор и проверка заявки, тексты уведомлений, ограничение частоты,
 * чтение настроек. Без ввода-вывода и зависимостей — покрыта тестами lib.test.js. Правила контакта и задачи повторяют
 * клиентские (src/components/leadForm/validate.ts): сервер браузеру не доверяет
 */

/** @typedef {{ name: string, contact: string, message: string, topic: string }} Lead */
/** @typedef {{ page?: string }} LeadMeta — адрес страницы, с которой отправлена форма (из Referer) */

/** Предельные длины полей — защита от мусора, обычные заявки в них укладываются с запасом */
export const LIMITS = { name: 120, contact: 200, message: 5000, topic: 200 }

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RE_PHONE = /^\+?[\d\s()-]{7,}$/
const RE_HANDLE = /^@?[\w.]{3,}$/
/** Управляющие символы, кроме перевода строки и табуляции */
const RE_CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g

/** @param {string} contact */
export function isEmail(contact) {
	return RE_EMAIL.test(contact)
}

/**
 * Строковое поле тела запроса: не строка → пусто; переводы строк приводятся к \n, управляющие символы и пробелы по краям убираются
 * @param {Record<string, unknown>} raw
 * @param {string} key
 */
function field(raw, key) {
	const v = raw[key]
	return typeof v === 'string' ? v.replace(/\r\n?/g, '\n').replace(RE_CONTROL, '').trim() : ''
}

/**
 * Разбирает тело запроса в заявку (ContactPayload из src/api/contact.ts). Поле `website` — ловушка для ботов: в форме
 * оно скрыто и человек его не заполняет; непустое → `trap: true`, остальные поля не проверяются, заявку отвечают
 * успехом и отбрасывают (бот не узнает, что раскрыт)
 * @param {unknown} body
 * @returns {{ ok: true, lead: Lead, trap: boolean } | { ok: false, fields: string[] }}
 */
export function parseLead(body) {
	if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false, fields: ['body'] }
	const raw = /** @type {Record<string, unknown>} */ (body)
	const lead = { name: field(raw, 'name'), contact: field(raw, 'contact'), message: field(raw, 'message'), topic: field(raw, 'topic') }
	if (field(raw, 'website') !== '') return { ok: true, lead, trap: true }

	/** @type {string[]} */
	const fields = []
	const c = lead.contact
	if (c.length > LIMITS.contact || !(RE_EMAIL.test(c) || RE_PHONE.test(c) || RE_HANDLE.test(c))) fields.push('contact')
	if (lead.message.length < 2 || lead.message.length > LIMITS.message) fields.push('message')
	if (lead.name.length > LIMITS.name) fields.push('name')
	if (lead.topic.length > LIMITS.topic) fields.push('topic')
	return fields.length ? { ok: false, fields } : { ok: true, lead, trap: false }
}

/** @param {string} s */
export function escapeHtml(s) {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** @param {string} s @param {number} max */
export function truncate(s, max) {
	return s.length > max ? `${s.slice(0, max - 1)}…` : s
}

/** Telegram принимает до 4096 символов — текст задачи режется с запасом на остальные строки */
export const TELEGRAM_MESSAGE_MAX = 3500

/**
 * Текст уведомления в Telegram (parse_mode HTML; всё, что ввёл посетитель, экранировано)
 * @param {Lead} lead
 * @param {LeadMeta} [meta]
 */
export function telegramText(lead, meta = {}) {
	const lines = ['<b>Заявка с сайта</b>']
	if (lead.topic) lines.push(`<b>Тема:</b> ${escapeHtml(lead.topic)}`)
	if (lead.name) lines.push(`<b>Имя:</b> ${escapeHtml(lead.name)}`)
	lines.push(`<b>Контакт:</b> ${escapeHtml(lead.contact)}`)
	lines.push('', escapeHtml(truncate(lead.message, TELEGRAM_MESSAGE_MAX)))
	if (meta.page) lines.push('', `<i>Страница: ${escapeHtml(meta.page)}</i>`)
	return lines.join('\n')
}

/**
 * Письмо-дубль: тема и текст без HTML. Reply-To — контакт посетителя, если он оставил почту (ответ из клиента уходит сразу ему)
 * @param {Lead} lead
 * @param {LeadMeta} [meta]
 * @returns {{ subject: string, text: string, replyTo?: string }}
 */
export function mailContent(lead, meta = {}) {
	const head = []
	if (lead.topic) head.push(`Тема: ${lead.topic}`)
	if (lead.name) head.push(`Имя: ${lead.name}`)
	head.push(`Контакт: ${lead.contact}`)
	const tail = meta.page ? ['', `Страница: ${meta.page}`] : []
	return {
		subject: `Заявка с сайта: ${lead.topic || 'общее обращение'}`,
		text: [...head, '', lead.message, ...tail].join('\n'),
		replyTo: isEmail(lead.contact) ? lead.contact : undefined,
	}
}

/**
 * Скользящее окно: не больше `limit` заявок с одного ключа (IP) за `windowMs`. Состояние в памяти процесса —
 * перезапуск службы его сбрасывает, для защиты от скриптов этого достаточно
 */
export class RateLimiter {
	/** @param {{ limit: number, windowMs: number }} opts */
	constructor({ limit, windowMs }) {
		this.limit = limit
		this.windowMs = windowMs
		/** @type {Map<string, number[]>} */
		this.hits = new Map()
	}

	/**
	 * Учитывает попытку; false — лимит исчерпан (попытка не засчитывается)
	 * @param {string} key
	 * @param {number} [now]
	 */
	take(key, now = Date.now()) {
		const since = now - this.windowMs
		const recent = (this.hits.get(key) ?? []).filter(t => t > since)
		if (recent.length >= this.limit) {
			this.hits.set(key, recent)
			return false
		}
		recent.push(now)
		this.hits.set(key, recent)
		return true
	}

	/**
	 * Убирает устаревшие записи, чтобы карта не росла бесконечно
	 * @param {number} [now]
	 */
	prune(now = Date.now()) {
		const since = now - this.windowMs
		for (const [key, times] of this.hits) {
			const recent = times.filter(t => t > since)
			if (recent.length) this.hits.set(key, recent)
			else this.hits.delete(key)
		}
	}
}

/**
 * Настройки из переменных окружения (.env.example). Канал без своих переменных отключён (null); если отключены оба —
 * contact.js отвечает 503 и пишет предупреждение при старте
 * @param {NodeJS.ProcessEnv} env
 */
export function readConfig(env) {
	const telegram =
		env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID ? { token: env.TELEGRAM_BOT_TOKEN, chatId: env.TELEGRAM_CHAT_ID } : null

	/** @type {{ host: string, port: number, secure: boolean, user: string, pass: string, from: string, to: string } | null} */
	let mail = null
	if (env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS) {
		const port = Number(env.SMTP_PORT) || 465
		mail = {
			host: env.SMTP_HOST,
			port,
			// 465 — TLS с первого байта; на 587/25 — STARTTLS (nodemailer включит его сам, если сервер предложит)
			secure: env.SMTP_SECURE ? env.SMTP_SECURE === 'true' : port === 465,
			user: env.SMTP_USER,
			pass: env.SMTP_PASS,
			from: env.MAIL_FROM || env.SMTP_USER,
			to: env.MAIL_TO || env.SMTP_USER,
		}
	}

	return {
		host: env.LISTEN_HOST || '127.0.0.1',
		port: Number(env.PORT) || 3001,
		telegram,
		mail,
		rate: { limit: Number(env.RATE_LIMIT) || 5, windowMs: (Number(env.RATE_WINDOW_MIN) || 10) * 60_000 },
	}
}
