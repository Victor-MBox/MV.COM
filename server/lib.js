// @ts-check
/**
 * Чистая часть обработчика формы (contact.js): разбор и проверка заявки (поля, согласие и его редакция, origin),
 * номер заявки, тексты уведомлений, запись о согласии, ограничение частоты, защита от повторной отправки, чтение
 * настроек. Без ввода-вывода — покрыта тестами lib.test.js. Правила контакта и задачи повторяют клиентские
 * (src/components/leadForm/validate.ts): сервер браузеру не доверяет
 */
import { randomBytes } from 'node:crypto'

/** @typedef {{ name: string, contact: string, message: string, topic: string }} Lead */
/** @typedef {'modal' | 'contacts' | 'footer'} FormId — откуда отправлена форма (src/data/leadForm.ts LeadFormId) */
/**
 * @typedef {object} LeadMeta — что сервер знает о заявке помимо полей посетителя
 * @property {string} [requestId] номер заявки (makeRequestId)
 * @property {Date} [receivedAt] серверное время получения
 * @property {FormId} [formId]
 * @property {string} [page] адрес страницы, с которой отправлена форма (из Referer, без query)
 * @property {string} [consentVersion] редакция согласия, принятая сервером (server/legal.json)
 * @property {string} [policyVersion] редакция политики — для контекста записи, не отдельное «согласие с политикой»
 */
/** @typedef {{ version: string, sha256: string }} LegalDocRef */
/** @typedef {{ consent: LegalDocRef, policy: LegalDocRef, cookies: LegalDocRef }} Legal — server/legal.json */

/** Предельные длины полей — защита от мусора, обычные заявки в них укладываются с запасом */
export const LIMITS = { name: 120, contact: 200, message: 5000, topic: 200, submissionId: 64 }

/** Допустимые источники заявки и их подписи в письме */
export const FORM_IDS = /** @type {const} */ (['modal', 'contacts', 'footer'])
export const FORM_LABELS = { modal: 'окно «Обсудить задачу»', contacts: 'страница контактов', footer: 'форма в подвале страницы' }

const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RE_PHONE = /^\+?[\d\s()-]{7,}$/
const RE_HANDLE = /^@?[\w.]{3,}$/
const RE_SUBMISSION_ID = /^[A-Za-z0-9-]{8,64}$/
/** Управляющие символы, кроме перевода строки и табуляции — вычищаются из полей намеренно */
// eslint-disable-next-line no-control-regex
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
 * @param {unknown} v
 * @returns {v is FormId}
 */
function isFormId(v) {
	return typeof v === 'string' && /** @type {readonly string[]} */ (FORM_IDS).includes(v)
}

/**
 * Разбирает тело запроса в заявку (ContactPayload из src/api/contact.ts). Поле `website` — ловушка для ботов: в форме
 * оно скрыто и человек его не заполняет; непустое → `trap: true`, остальные поля не проверяются, заявку отвечают
 * успехом и отбрасывают (бот не узнает, что раскрыт). Согласие проверяется на сервере (ТЗ §8): нужен `consent: true`
 * и `consentVersion`, равная действующей редакции (server/legal.json); `formId` — из FORM_IDS; `submissionId` —
 * ключ одной отправки для защиты от дублей, необязателен
 * @param {unknown} body
 * @param {{ consentVersion: string }} legal действующая редакция согласия
 * @returns {{ ok: true, lead: Lead, trap: boolean, formId: FormId, submissionId: string } | { ok: false, fields: string[] }}
 */
export function parseLead(body, legal) {
	if (!body || typeof body !== 'object' || Array.isArray(body)) return { ok: false, fields: ['body'] }
	const raw = /** @type {Record<string, unknown>} */ (body)
	const lead = { name: field(raw, 'name'), contact: field(raw, 'contact'), message: field(raw, 'message'), topic: field(raw, 'topic') }
	const formId = isFormId(raw.formId) ? raw.formId : 'contacts'
	const submissionId = field(raw, 'submissionId')
	if (field(raw, 'website') !== '') return { ok: true, lead, trap: true, formId, submissionId }

	/** @type {string[]} */
	const fields = []
	const c = lead.contact
	if (c.length > LIMITS.contact || !(RE_EMAIL.test(c) || RE_PHONE.test(c) || RE_HANDLE.test(c))) fields.push('contact')
	if (lead.message.length < 2 || lead.message.length > LIMITS.message) fields.push('message')
	if (lead.name.length > LIMITS.name) fields.push('name')
	if (lead.topic.length > LIMITS.topic) fields.push('topic')
	if (raw.consent !== true) fields.push('consent')
	if (typeof raw.consentVersion !== 'string' || raw.consentVersion !== legal.consentVersion) fields.push('consentVersion')
	if (!isFormId(raw.formId)) fields.push('formId')
	if (submissionId !== '' && !RE_SUBMISSION_ID.test(submissionId)) fields.push('submissionId')
	return fields.length ? { ok: false, fields } : { ok: true, lead, trap: false, formId, submissionId }
}

/** @param {string} s */
export function escapeHtml(s) {
	return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/** @param {string} s @param {number} max */
export function truncate(s, max) {
	return s.length > max ? `${s.slice(0, max - 1)}…` : s
}

// ---------- Номер заявки и время ----------

/** Алфавит номера заявки без похожих символов (0/O, 1/I/L, U/V) */
const ID_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

/**
 * Номер заявки «MV-ГГГГММДД-XXXXX»: дата по UTC и пять случайных символов (32^5 ≈ 33 млн вариантов в день).
 * Показывается посетителю, уходит в письмо и в запись о согласии — по нему ищут обращение при отзыве согласия
 * @param {Date} [date]
 * @param {Buffer | Uint8Array} [bytes] пять случайных байт (в тестах — заданные)
 */
export function makeRequestId(date = new Date(), bytes = randomBytes(5)) {
	const d = date.toISOString().slice(0, 10).replace(/-/g, '')
	let tail = ''
	for (let i = 0; i < 5; i++) tail += ID_ALPHABET[bytes[i] & 31]
	return `MV-${d}-${tail}`
}

/**
 * «22.10.2026 10:30 UTC» — время получения в письме и уведомлении
 * @param {Date} date
 */
export function formatUtc(date) {
	const p = (/** @type {number} */ n) => String(n).padStart(2, '0')
	return `${p(date.getUTCDate())}.${p(date.getUTCMonth() + 1)}.${date.getUTCFullYear()} ${p(date.getUTCHours())}:${p(date.getUTCMinutes())} UTC`
}

// ---------- Origin ----------

/**
 * Запрос пришёл со своего сайта? Браузер ставит Origin на POST и Sec-Fetch-Site на любые запросы; curl и скрипты
 * без них проходят (CSRF — угроза из браузера, а межсайтовый JSON-POST без CORS-заголовков в ответе всё равно не
 * прочитает ответ). Host за nginx — `$host` (proxy_set_header), на dev — адрес dev-сервера (прокси Vite
 * с changeOrigin: false): сравниваем хост Origin с хостом запроса; дополнительно — явный список ALLOWED_ORIGINS.
 * Произвольные origins не разрешаются (ТЗ §8)
 * @param {{ origin?: string, host?: string, secFetchSite?: string, allowed?: string[] }} h
 */
export function isAllowedOrigin({ origin, host, secFetchSite, allowed = [] }) {
	if (secFetchSite === 'cross-site') return false
	if (origin === undefined || origin === '') return true
	if (origin === 'null') return false
	try {
		const url = new URL(origin)
		if (allowed.some(a => a.toLowerCase() === url.origin.toLowerCase())) return true
		return !!host && url.host.toLowerCase() === host.toLowerCase()
	} catch {
		return false
	}
}

// ---------- Тексты уведомлений ----------

/** Telegram принимает до 4096 символов — текст задачи режется с запасом на остальные строки */
export const TELEGRAM_MESSAGE_MAX = 3500

/**
 * Полный текст уведомления в Telegram (TELEGRAM_CONTENT=full; parse_mode HTML; всё, что ввёл посетитель, экранировано).
 * По умолчанию не используется: содержимое формы в Telegram не пересылается (ТЗ §8), см. telegramNotice
 * @param {Lead} lead
 * @param {LeadMeta} [meta]
 */
export function telegramText(lead, meta = {}) {
	const lines = [meta.requestId ? `<b>Заявка с сайта</b> · ${meta.requestId}` : '<b>Заявка с сайта</b>']
	if (lead.topic) lines.push(`<b>Тема:</b> ${escapeHtml(lead.topic)}`)
	if (lead.name) lines.push(`<b>Имя:</b> ${escapeHtml(lead.name)}`)
	lines.push(`<b>Контакт:</b> ${escapeHtml(lead.contact)}`)
	lines.push('', escapeHtml(truncate(lead.message, TELEGRAM_MESSAGE_MAX)))
	if (meta.page) lines.push('', `<i>Страница: ${escapeHtml(meta.page)}</i>`)
	return lines.join('\n')
}

/**
 * Уведомление в Telegram по умолчанию (TELEGRAM_CONTENT=notice): только номер заявки, время и тема — без имени,
 * контакта и текста посетителя. Содержимое — в письме
 * @param {LeadMeta & { topic?: string }} meta
 */
export function telegramNotice(meta) {
	const lines = [`<b>Новая заявка</b> ${meta.requestId ?? ''}`.trim()]
	if (meta.receivedAt) lines.push(`Получена: ${formatUtc(meta.receivedAt)}`)
	if (meta.topic) lines.push(`Тема: ${escapeHtml(meta.topic)}`)
	lines.push('Подробности — в письме на почте.')
	return lines.join('\n')
}

/**
 * Письмо — основной канал доставки заявки: тема с номером, текст без HTML, служебные строки (номер, время, форма,
 * страница, отметка о согласии с редакцией). Reply-To — контакт посетителя, если он оставил почту
 * @param {Lead} lead
 * @param {LeadMeta} [meta]
 * @returns {{ subject: string, text: string, replyTo?: string }}
 */
export function mailContent(lead, meta = {}) {
	const head = []
	if (meta.requestId) head.push(`Номер заявки: ${meta.requestId}`)
	if (meta.receivedAt) head.push(`Получена: ${formatUtc(meta.receivedAt)}`)
	if (meta.formId) head.push(`Форма: ${FORM_LABELS[meta.formId]}`)
	if (lead.topic) head.push(`Тема: ${lead.topic}`)
	if (lead.name) head.push(`Имя: ${lead.name}`)
	head.push(`Контакт: ${lead.contact}`)
	const tail = []
	if (meta.page) tail.push(`Страница: ${meta.page}`)
	if (meta.consentVersion) {
		tail.push(
			`Согласие на обработку данных: отмечено, редакция ${meta.consentVersion}${meta.policyVersion ? ` (политика ${meta.policyVersion})` : ''}`,
		)
	}
	return {
		subject: `Заявка с сайта${meta.requestId ? ` ${meta.requestId}` : ''}: ${lead.topic || 'общее обращение'}`,
		text: [...head, '', lead.message, ...(tail.length ? ['', ...tail] : [])].join('\n'),
		replyTo: isEmail(lead.contact) ? lead.contact : undefined,
	}
}

// ---------- Запись о согласии ----------

/**
 * Строка журнала согласий (JSON Lines, ТЗ §8): номер заявки, серверное время UTC, форма, редакция и контрольная сумма
 * согласия, редакция политики для контекста, факт явного согласия, страница (путь без query), тема и каналы доставки.
 * Имени, контакта и текста обращения здесь нет — они только в письме, которое ищется по номеру заявки
 * @param {{ requestId: string, receivedAt: Date, formId: FormId, consentVersion: string, consentSha256: string, policyVersion: string, page?: string, topic: string, delivered: string[] }} r
 */
export function consentRecordLine(r) {
	return `${JSON.stringify({
		requestId: r.requestId,
		receivedAt: r.receivedAt.toISOString(),
		formId: r.formId,
		consent: true,
		consentVersion: r.consentVersion,
		consentSha256: r.consentSha256,
		policyVersion: r.policyVersion,
		page: r.page ?? null,
		topic: r.topic,
		delivered: r.delivered,
	})}\n`
}

/**
 * Очистка журнала согласий по сроку хранения обращений: остаются записи не старше cutoff и строки, которые не удалось
 * разобрать (данные не теряем). Пустой результат — пустая строка
 * @param {string} text содержимое файла
 * @param {number} cutoffMs граница Date.now() − срок
 */
export function pruneConsentLines(text, cutoffMs) {
	const kept = text
		.split('\n')
		.filter(line => line.trim() !== '')
		.filter(line => {
			try {
				const at = Date.parse(JSON.parse(line).receivedAt)
				return Number.isNaN(at) || at >= cutoffMs
			} catch {
				return true
			}
		})
	return kept.length ? `${kept.join('\n')}\n` : ''
}

// ---------- Защита: частота и повторы ----------

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
 * Уже принятые отправки по submissionId (ТЗ §8: повтор после обрыва сети не создаёт вторую заявку): на повтор
 * отдаётся прежний ответ с тем же номером заявки. В памяти процесса, в пределах окна
 * @template T
 */
export class SeenSubmissions {
	/** @param {number} windowMs */
	constructor(windowMs) {
		this.windowMs = windowMs
		/** @type {Map<string, { at: number, value: T }>} */
		this.items = new Map()
	}

	/**
	 * @param {string} key
	 * @param {number} [now]
	 * @returns {T | undefined}
	 */
	get(key, now = Date.now()) {
		const item = this.items.get(key)
		if (!item) return undefined
		if (now - item.at > this.windowMs) {
			this.items.delete(key)
			return undefined
		}
		return item.value
	}

	/**
	 * @param {string} key
	 * @param {T} value
	 * @param {number} [now]
	 */
	set(key, value, now = Date.now()) {
		if (key) this.items.set(key, { at: now, value })
	}

	/** @param {number} [now] */
	prune(now = Date.now()) {
		for (const [key, item] of this.items) if (now - item.at > this.windowMs) this.items.delete(key)
	}
}

// ---------- Настройки ----------

/**
 * Редакции документов, которые знает сервер (server/legal.json): версия и SHA-256 текста. Тест legal.test.ts сверяет
 * их с src/data/legal.ts. Неполный файл — ошибка при старте, а не молчаливый приём заявок с любой редакцией
 * @param {unknown} raw
 * @returns {Legal}
 */
export function readLegal(raw) {
	if (!raw || typeof raw !== 'object') throw new Error('legal.json: ожидается объект')
	const out = /** @type {Record<string, unknown>} */ (raw)
	for (const key of ['consent', 'policy', 'cookies']) {
		const doc = /** @type {Record<string, unknown> | undefined} */ (out[key])
		if (!doc || typeof doc.version !== 'string' || !doc.version || typeof doc.sha256 !== 'string' || !/^[0-9a-f]{64}$/.test(doc.sha256)) {
			throw new Error(`legal.json: у ${key} нужны version и sha256 (64 hex)`)
		}
	}
	return /** @type {Legal} */ (raw)
}

/**
 * Настройки из переменных окружения (.env.example). Канал без своих переменных отключён (null). Telegram по умолчанию
 * получает только уведомление без содержимого (`content: 'notice'`, ТЗ §8); `TELEGRAM_CONTENT=full` — полный текст.
 * Папка записей о согласии — CONSENT_LOG_DIR, иначе STATE_DIRECTORY от systemd (StateDirectory=mvcom-contact);
 * без неё заявки не принимаются (health → ready: false)
 * @param {NodeJS.ProcessEnv} env
 */
export function readConfig(env) {
	const telegram =
		env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID
			? {
					token: env.TELEGRAM_BOT_TOKEN,
					chatId: env.TELEGRAM_CHAT_ID,
					content: /** @type {'notice' | 'full'} */ (env.TELEGRAM_CONTENT === 'full' ? 'full' : 'notice'),
				}
			: null

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
		port: Number(env.PORT) || 3721,
		telegram,
		mail,
		rate: { limit: Number(env.RATE_LIMIT) || 5, windowMs: (Number(env.RATE_WINDOW_MIN) || 10) * 60_000 },
		consentDir: env.CONSENT_LOG_DIR || env.STATE_DIRECTORY || null,
		retentionDays: Number(env.CONSENT_RETENTION_DAYS) || 180,
		/** Дополнительно разрешённые Origin (через запятую), помимо совпадения с Host запроса */
		allowedOrigins: (env.ALLOWED_ORIGINS || '')
			.split(',')
			.map(s => s.trim())
			.filter(Boolean),
	}
}

/**
 * Каналы, по которым до оператора доходит содержимое заявки: почта и Telegram в полном режиме. Заявка принята,
 * только если сработал хотя бы один из них; уведомление без содержимого — не доставка
 * @param {ReturnType<typeof readConfig>} cfg
 */
export function contentChannels(cfg) {
	/** @type {string[]} */
	const channels = []
	if (cfg.mail) channels.push('mail')
	if (cfg.telegram?.content === 'full') channels.push('telegram')
	return channels
}
