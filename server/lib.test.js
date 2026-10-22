// @ts-check
import { describe, expect, it } from 'vitest'
import {
	FORM_IDS,
	LIMITS,
	RateLimiter,
	SeenSubmissions,
	TELEGRAM_MESSAGE_MAX,
	consentRecordLine,
	contentChannels,
	errorText,
	formatUtc,
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

const legal = { consentVersion: '1.0' }
const ok = {
	name: 'Виктор',
	contact: '@victor',
	message: 'Нужен сайт компании',
	topic: 'Сайт компании',
	consent: true,
	consentVersion: '1.0',
	formId: 'modal',
	submissionId: '3f1a2b4c-0000-4000-8000-000000000001',
}
const lead = { name: 'Виктор', contact: '@victor', message: 'Нужен сайт компании', topic: 'Сайт компании' }
const received = new Date('2026-10-22T10:30:00Z')

describe('parseLead — проверка заявки на сервере', () => {
	it('принимает заполненную заявку; пробелы по краям, \\r\\n и управляющие символы вычищает', () => {
		expect(parseLead(ok, legal)).toEqual({ ok: true, trap: false, lead, formId: 'modal', submissionId: ok.submissionId })
		expect(parseLead({ ...ok, name: '  Виктор\u0000 ', message: 'Строка 1\r\nСтрока 2\t\u0007' }, legal)).toMatchObject({
			ok: true,
			lead: { ...lead, name: 'Виктор', message: 'Строка 1\nСтрока 2' },
		})
	})

	it('имя, тема и ключ отправки необязательны: отсутствуют или не строки → пустые', () => {
		expect(parseLead({ contact: 'name@company.ru', message: 'Сайт', consent: true, consentVersion: '1.0', formId: 'footer' }, legal)).toEqual({
			ok: true,
			trap: false,
			lead: { name: '', contact: 'name@company.ru', message: 'Сайт', topic: '' },
			formId: 'footer',
			submissionId: '',
		})
		expect(parseLead({ ...ok, name: 42, topic: null }, legal)).toMatchObject({ ok: true, lead: { name: '', topic: '' } })
	})

	it('контакт — почта, @ник или номер, как на клиенте', () => {
		for (const contact of ['name@company.ru', '@victor', 'victor_mbox', '+7 995 394-03-03', '89953940303']) {
			expect(parseLead({ ...ok, contact }, legal)).toMatchObject({ ok: true })
		}
		for (const contact of ['', '  ', 'ab', 'имя с пробелом', 'a@b']) {
			expect(parseLead({ ...ok, contact }, legal)).toEqual({ ok: false, fields: ['contact'] })
		}
	})

	it('согласие обязательно и проверяется на сервере: нужен consent: true и действующая редакция (ТЗ §8)', () => {
		expect(parseLead({ ...ok, consent: undefined }, legal)).toEqual({ ok: false, fields: ['consent'] })
		expect(parseLead({ ...ok, consent: 'true' }, legal)).toEqual({ ok: false, fields: ['consent'] })
		expect(parseLead({ ...ok, consent: false }, legal)).toEqual({ ok: false, fields: ['consent'] })
		expect(parseLead({ ...ok, consentVersion: '0.9' }, legal)).toEqual({ ok: false, fields: ['consentVersion'] })
		expect(parseLead({ ...ok, consentVersion: undefined }, legal)).toEqual({ ok: false, fields: ['consentVersion'] })
		expect(parseLead(ok, { consentVersion: '1.1' })).toEqual({ ok: false, fields: ['consentVersion'] }) // сервер обновили, клиент старый
	})

	it('источник формы — из FORM_IDS; ключ отправки, если есть, — 8–64 символа [A-Za-z0-9-]', () => {
		expect(FORM_IDS).toEqual(['modal', 'contacts', 'footer'])
		expect(parseLead({ ...ok, formId: 'popup' }, legal)).toEqual({ ok: false, fields: ['formId'] })
		expect(parseLead({ ...ok, formId: undefined }, legal)).toEqual({ ok: false, fields: ['formId'] })
		expect(parseLead({ ...ok, submissionId: 'short' }, legal)).toEqual({ ok: false, fields: ['submissionId'] })
		expect(parseLead({ ...ok, submissionId: 'x'.repeat(LIMITS.submissionId + 1) }, legal)).toEqual({ ok: false, fields: ['submissionId'] })
		expect(parseLead({ ...ok, submissionId: 'с пробелом и кириллицей' }, legal)).toEqual({ ok: false, fields: ['submissionId'] })
	})

	it('перечисляет все невалидные поля; длины ограничены LIMITS', () => {
		expect(parseLead({ contact: '', message: ' ' }, legal)).toEqual({ ok: false, fields: ['contact', 'message', 'consent', 'consentVersion', 'formId'] })
		expect(parseLead({ ...ok, message: 'x'.repeat(LIMITS.message + 1) }, legal)).toEqual({ ok: false, fields: ['message'] })
		expect(parseLead({ ...ok, message: 'x'.repeat(LIMITS.message) }, legal)).toMatchObject({ ok: true })
		expect(parseLead({ ...ok, name: 'x'.repeat(LIMITS.name + 1), topic: 'x'.repeat(LIMITS.topic + 1) }, legal)).toEqual({
			ok: false,
			fields: ['name', 'topic'],
		})
		expect(parseLead({ ...ok, contact: `@${'x'.repeat(LIMITS.contact)}` }, legal)).toEqual({ ok: false, fields: ['contact'] })
	})

	it('тело не объект — ошибка body', () => {
		for (const body of [null, undefined, 'строка', 7, [ok]]) expect(parseLead(body, legal)).toEqual({ ok: false, fields: ['body'] })
	})

	it('заполненная ловушка website — ok и trap, остальные поля (и согласие) не проверяются', () => {
		expect(parseLead({ ...ok, website: '' }, legal)).toMatchObject({ ok: true, trap: false })
		expect(parseLead({ ...ok, website: 'http://spam.example' }, legal)).toMatchObject({ ok: true, trap: true })
		expect(parseLead({ contact: '', message: '', website: 'x' }, legal)).toMatchObject({ ok: true, trap: true })
	})
})

describe('isAllowedOrigin — запросы только со своего сайта (ТЗ §8)', () => {
	it('Origin с тем же хостом, что у запроса, проходит; чужой, null и cross-site — нет; без Origin (curl) — проходит', () => {
		expect(isAllowedOrigin({ origin: 'https://matsakov-victor.com', host: 'matsakov-victor.com' })).toBe(true)
		expect(isAllowedOrigin({ origin: 'https://MATSAKOV-VICTOR.com', host: 'matsakov-victor.com', secFetchSite: 'same-origin' })).toBe(true)
		expect(isAllowedOrigin({ origin: 'http://localhost:5173', host: 'localhost:5173' })).toBe(true) // прокси Vite
		expect(isAllowedOrigin({ origin: 'https://evil.example', host: 'matsakov-victor.com' })).toBe(false)
		expect(isAllowedOrigin({ origin: 'https://matsakov-victor.com.evil.example', host: 'matsakov-victor.com' })).toBe(false)
		expect(isAllowedOrigin({ origin: 'null', host: 'matsakov-victor.com' })).toBe(false)
		expect(isAllowedOrigin({ origin: 'не адрес', host: 'matsakov-victor.com' })).toBe(false)
		expect(isAllowedOrigin({ origin: 'https://matsakov-victor.com', host: 'matsakov-victor.com', secFetchSite: 'cross-site' })).toBe(false)
		expect(isAllowedOrigin({ host: 'matsakov-victor.com' })).toBe(true)
		expect(isAllowedOrigin({ host: 'matsakov-victor.com', secFetchSite: 'none' })).toBe(true)
		expect(isAllowedOrigin({ origin: 'https://matsakov-victor.com', host: undefined })).toBe(false)
	})

	it('ALLOWED_ORIGINS добавляет адреса к совпадению с Host, но не открывает все подряд', () => {
		const allowed = ['https://preview.example.com']
		expect(isAllowedOrigin({ origin: 'https://preview.example.com', host: '127.0.0.1:3721', allowed })).toBe(true)
		expect(isAllowedOrigin({ origin: 'https://preview.example.com/', host: '127.0.0.1:3721', allowed })).toBe(true)
		expect(isAllowedOrigin({ origin: 'https://evil.example', host: '127.0.0.1:3721', allowed })).toBe(false)
		expect(readConfig({ ALLOWED_ORIGINS: ' https://a.example, https://b.example ,' }).allowedOrigins).toEqual(['https://a.example', 'https://b.example'])
		expect(readConfig({}).allowedOrigins).toEqual([])
	})
})

describe('makeRequestId и formatUtc', () => {
	it('номер «MV-ГГГГММДД-XXXXX» по дате UTC и пяти байтам из алфавита без похожих символов', () => {
		expect(makeRequestId(received, Uint8Array.from([0, 1, 31, 32, 255]))).toBe('MV-20261022-01Z0Z')
		expect(makeRequestId()).toMatch(/^MV-\d{8}-[0-9A-HJKMNP-TV-Z]{5}$/)
		expect(new Set(Array.from({ length: 50 }, () => makeRequestId())).size).toBe(50)
	})

	it('время — ДД.ММ.ГГГГ ЧЧ:ММ UTC', () => {
		expect(formatUtc(received)).toBe('22.10.2026 10:30 UTC')
		expect(formatUtc(new Date('2026-01-05T03:07:00Z'))).toBe('05.01.2026 03:07 UTC')
	})
})

describe('telegramText — полный текст (только TELEGRAM_CONTENT=full)', () => {
	it('строки по порядку с номером заявки, пустые имя и тема пропускаются, страница — курсивом в конце', () => {
		expect(telegramText(lead, { requestId: 'MV-20261022-ABCDE', page: 'https://matsakov-victor.com/services/corporate' })).toBe(
			[
				'<b>Заявка с сайта</b> · MV-20261022-ABCDE',
				'<b>Тема:</b> Сайт компании',
				'<b>Имя:</b> Виктор',
				'<b>Контакт:</b> @victor',
				'',
				'Нужен сайт компании',
				'',
				'<i>Страница: https://matsakov-victor.com/services/corporate</i>',
			].join('\n'),
		)
		expect(telegramText({ ...lead, name: '', topic: '' })).toBe('<b>Заявка с сайта</b>\n<b>Контакт:</b> @victor\n\nНужен сайт компании')
	})

	it('экранирует HTML посетителя и режет длинную задачу под лимит Telegram', () => {
		const text = telegramText({ ...lead, name: 'A & B', message: '<script>alert(1)</script>' })
		expect(text).toContain('<b>Имя:</b> A &amp; B')
		expect(text).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
		const long = telegramText({ ...lead, message: 'x'.repeat(TELEGRAM_MESSAGE_MAX + 500) })
		expect(long.length).toBeLessThan(4096)
		expect(long.endsWith('…')).toBe(true)
	})
})

describe('telegramNotice — уведомление по умолчанию без содержимого (ТЗ §8)', () => {
	it('номер, время и тема; имени, контакта и текста посетителя нет', () => {
		const text = telegramNotice({ requestId: 'MV-20261022-ABCDE', receivedAt: received, topic: 'Сайт <компании>' })
		expect(text).toBe('<b>Новая заявка</b> MV-20261022-ABCDE\nПолучена: 22.10.2026 10:30 UTC\nТема: Сайт &lt;компании&gt;\nПодробности — в письме на почте.')
		expect(text).not.toMatch(/Виктор|@victor|Нужен сайт/)
		expect(telegramNotice({ requestId: 'MV-1', receivedAt: received })).not.toMatch(/Тема/)
	})
})

describe('mailContent — письмо, основной канал', () => {
	it('тема с номером и контекстом, служебные строки, текст без HTML, Reply-To — только если контакт похож на почту', () => {
		const meta = {
			requestId: 'MV-20261022-ABCDE',
			receivedAt: received,
			formId: /** @type {const} */ ('footer'),
			page: 'https://matsakov-victor.com/contacts',
			consentVersion: '1.0',
			policyVersion: '1.0',
		}
		expect(mailContent({ ...lead, contact: 'name@company.ru' }, meta)).toEqual({
			subject: 'Заявка с сайта MV-20261022-ABCDE: Сайт компании',
			text: [
				'Номер заявки: MV-20261022-ABCDE',
				'Получена: 22.10.2026 10:30 UTC',
				'Форма: форма в подвале страницы',
				'Тема: Сайт компании',
				'Имя: Виктор',
				'Контакт: name@company.ru',
				'',
				'Нужен сайт компании',
				'',
				'Страница: https://matsakov-victor.com/contacts',
				'Согласие на обработку данных: отмечено, редакция 1.0 (политика 1.0)',
			].join('\n'),
			replyTo: 'name@company.ru',
		})
		expect(mailContent({ ...lead, name: '', topic: '' })).toEqual({
			subject: 'Заявка с сайта: общее обращение',
			text: 'Контакт: @victor\n\nНужен сайт компании',
			replyTo: undefined,
		})
	})
})

describe('consentRecordLine и pruneConsentLines — журнал согласий (ТЗ §8)', () => {
	const record = {
		requestId: 'MV-20261022-ABCDE',
		receivedAt: received,
		formId: /** @type {const} */ ('modal'),
		consentVersion: '1.0',
		consentSha256: 'a'.repeat(64),
		policyVersion: '1.0',
		page: '/services/corporate',
		topic: 'Сайт компании',
		delivered: ['mail', 'telegram'],
	}

	it('одна JSON-строка: серверное время UTC, редакции, факт согласия, путь страницы; без имени, контакта и текста', () => {
		const line = consentRecordLine(record)
		expect(line.endsWith('\n')).toBe(true)
		expect(JSON.parse(line)).toEqual({
			requestId: 'MV-20261022-ABCDE',
			receivedAt: '2026-10-22T10:30:00.000Z',
			formId: 'modal',
			consent: true,
			consentVersion: '1.0',
			consentSha256: 'a'.repeat(64),
			policyVersion: '1.0',
			page: '/services/corporate',
			topic: 'Сайт компании',
			delivered: ['mail', 'telegram'],
		})
		expect(line).not.toMatch(/Виктор|@victor|Нужен сайт/)
		expect(JSON.parse(consentRecordLine({ ...record, page: undefined })).page).toBeNull()
	})

	it('очистка по сроку: старые записи уходят, свежие и неразборчивые строки остаются', () => {
		const old = consentRecordLine({ ...record, requestId: 'OLD', receivedAt: new Date('2026-01-01T00:00:00Z') })
		const fresh = consentRecordLine({ ...record, requestId: 'NEW' })
		const text = `${old}${fresh}мусор\n\n`
		const cutoff = Date.parse('2026-06-01T00:00:00Z')
		expect(pruneConsentLines(text, cutoff)).toBe(`${fresh}мусор\n`)
		expect(pruneConsentLines(old, cutoff)).toBe('')
		expect(pruneConsentLines('', cutoff)).toBe('')
	})
})

describe('RateLimiter — заявки с одного адреса', () => {
	it('пускает limit попыток в окне, дальше отказывает, после окна пускает снова', () => {
		const limiter = new RateLimiter({ limit: 2, windowMs: 1000 })
		expect(limiter.take('ip', 0)).toBe(true)
		expect(limiter.take('ip', 100)).toBe(true)
		expect(limiter.take('ip', 200)).toBe(false)
		expect(limiter.take('other', 200)).toBe(true)
		expect(limiter.take('ip', 1001)).toBe(true)
	})

	it('prune убирает устаревшие ключи', () => {
		const limiter = new RateLimiter({ limit: 5, windowMs: 1000 })
		limiter.take('a', 0)
		limiter.take('b', 900)
		limiter.prune(1500)
		expect([...limiter.hits.keys()]).toEqual(['b'])
	})
})

describe('SeenSubmissions — повтор одной отправки не создаёт вторую заявку', () => {
	it('в окне отдаёт прежний ответ, после окна забывает; пустой ключ не запоминается', () => {
		/** @type {SeenSubmissions<{ ok: true, requestId: string }>} */
		const seen = new SeenSubmissions(1000)
		seen.set('key-1', { ok: true, requestId: 'MV-1' }, 0)
		seen.set('', { ok: true, requestId: 'MV-x' }, 0)
		expect(seen.get('key-1', 500)).toEqual({ ok: true, requestId: 'MV-1' })
		expect(seen.get('', 500)).toBeUndefined()
		expect(seen.get('key-2', 500)).toBeUndefined()
		expect(seen.get('key-1', 1500)).toBeUndefined()
		seen.set('key-3', { ok: true, requestId: 'MV-3' }, 2000)
		seen.prune(3500)
		expect([...seen.items.keys()]).toEqual([])
	})
})

describe('readLegal — редакции на сервере', () => {
	const doc = { version: '1.0', sha256: 'f'.repeat(64) }

	it('нужны consent, policy и cookies с версией и SHA-256; иначе ошибка при старте', () => {
		expect(readLegal({ consent: doc, policy: doc, cookies: doc })).toEqual({ consent: doc, policy: doc, cookies: doc })
		expect(() => readLegal(null)).toThrow(/объект/)
		expect(() => readLegal({ consent: doc, policy: doc })).toThrow(/cookies/)
		expect(() => readLegal({ consent: { version: '1.0', sha256: 'короткий' }, policy: doc, cookies: doc })).toThrow(/consent/)
		expect(() => readLegal({ consent: { version: '', sha256: doc.sha256 }, policy: doc, cookies: doc })).toThrow(/consent/)
	})
})

describe('readConfig — настройки из окружения', () => {
	it('без переменных: адрес и лимиты по умолчанию, каналы отключены, папки согласий нет', () => {
		expect(readConfig({})).toEqual({
			host: '127.0.0.1',
			port: 3721,
			telegram: null,
			mail: null,
			rate: { limit: 5, windowMs: 10 * 60_000 },
			consentDir: null,
			retentionDays: 180,
			allowedOrigins: [],
		})
		expect(contentChannels(readConfig({}))).toEqual([])
	})

	it('Telegram нужны обе переменные, по умолчанию режим notice; SMTP — хост, логин и пароль', () => {
		expect(readConfig({ TELEGRAM_BOT_TOKEN: 't' }).telegram).toBeNull()
		expect(readConfig({ TELEGRAM_BOT_TOKEN: 't', TELEGRAM_CHAT_ID: '1' }).telegram).toEqual({ token: 't', chatId: '1', content: 'notice' })
		expect(readConfig({ TELEGRAM_BOT_TOKEN: 't', TELEGRAM_CHAT_ID: '1', TELEGRAM_CONTENT: 'full' }).telegram).toMatchObject({ content: 'full' })
		expect(readConfig({ TELEGRAM_BOT_TOKEN: 't', TELEGRAM_CHAT_ID: '1', TELEGRAM_CONTENT: 'anything' }).telegram).toMatchObject({ content: 'notice' })
		expect(readConfig({ SMTP_HOST: 'smtp.beget.com', SMTP_USER: 'u' }).mail).toBeNull()
	})

	it('каналы с содержимым: почта всегда, Telegram — только full; одного уведомления для приёма заявок мало', () => {
		const base = { SMTP_HOST: 'smtp.beget.com', SMTP_USER: 'info@matsakov-victor.com', SMTP_PASS: 'p' }
		expect(contentChannels(readConfig(base))).toEqual(['mail'])
		expect(contentChannels(readConfig({ TELEGRAM_BOT_TOKEN: 't', TELEGRAM_CHAT_ID: '1' }))).toEqual([])
		expect(contentChannels(readConfig({ TELEGRAM_BOT_TOKEN: 't', TELEGRAM_CHAT_ID: '1', TELEGRAM_CONTENT: 'full' }))).toEqual(['telegram'])
		expect(contentChannels(readConfig({ ...base, TELEGRAM_BOT_TOKEN: 't', TELEGRAM_CHAT_ID: '1', TELEGRAM_CONTENT: 'full' }))).toEqual(['mail', 'telegram'])
	})

	it('папка согласий — CONSENT_LOG_DIR, иначе STATE_DIRECTORY от systemd; срок хранения настраивается', () => {
		expect(readConfig({ STATE_DIRECTORY: '/var/lib/mvcom-contact' })).toMatchObject({ consentDir: '/var/lib/mvcom-contact' })
		expect(readConfig({ STATE_DIRECTORY: '/var/lib/mvcom-contact', CONSENT_LOG_DIR: '.data' })).toMatchObject({ consentDir: '.data' })
		expect(readConfig({ CONSENT_RETENTION_DAYS: '90' })).toMatchObject({ retentionDays: 90 })
	})

	it('SMTP: порт 465 → secure, иначе STARTTLS; от кого и кому по умолчанию — логин', () => {
		const base = { SMTP_HOST: 'smtp.beget.com', SMTP_USER: 'info@matsakov-victor.com', SMTP_PASS: 'p' }
		expect(readConfig(base).mail).toEqual({
			host: 'smtp.beget.com',
			port: 465,
			secure: true,
			user: 'info@matsakov-victor.com',
			pass: 'p',
			from: 'info@matsakov-victor.com',
			to: 'info@matsakov-victor.com',
		})
		expect(readConfig({ ...base, SMTP_PORT: '587' }).mail).toMatchObject({ port: 587, secure: false })
		expect(readConfig({ ...base, SMTP_PORT: '587', SMTP_SECURE: 'true' }).mail).toMatchObject({ secure: true })
		expect(readConfig({ ...base, MAIL_FROM: 'site@x.ru', MAIL_TO: 'me@x.ru' }).mail).toMatchObject({ from: 'site@x.ru', to: 'me@x.ru' })
		expect(readConfig({ ...base, LISTEN_HOST: '0.0.0.0', PORT: '4000', RATE_LIMIT: '3', RATE_WINDOW_MIN: '1' })).toMatchObject({
			host: '0.0.0.0',
			port: 4000,
			rate: { limit: 3, windowMs: 60_000 },
		})
	})
})

describe('errorText', () => {
	it('достаёт причину сетевого сбоя fetch из cause и AggregateError', () => {
		expect(errorText(new Error('Telegram API 403: Forbidden'))).toBe('Telegram API 403: Forbidden')
		const timeout = Object.assign(new Error('connect ETIMEDOUT 149.154.167.220:443'), { code: 'ETIMEDOUT' })
		expect(errorText(new TypeError('fetch failed', { cause: timeout }))).toBe('fetch failed ← connect ETIMEDOUT 149.154.167.220:443')
		const v6 = Object.assign(new Error('connect ENETUNREACH 2001:67c:4e8:f004::9:443'), { code: 'ENETUNREACH' })
		const both = Object.assign(new AggregateError([timeout, v6], ''), { code: 'ETIMEDOUT' })
		expect(errorText(new TypeError('fetch failed', { cause: both }))).toBe(
			'fetch failed ← ETIMEDOUT [connect ETIMEDOUT 149.154.167.220:443; connect ENETUNREACH 2001:67c:4e8:f004::9:443]',
		)
		expect(errorText('строка')).toBe('строка')
	})
})
