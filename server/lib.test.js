// @ts-check
import { describe, expect, it } from 'vitest'
import { LIMITS, RateLimiter, TELEGRAM_MESSAGE_MAX, mailContent, parseLead, readConfig, telegramText } from './lib.js'

const ok = { name: 'Виктор', contact: '@victor', message: 'Нужен сайт компании', topic: 'Сайт компании' }

describe('parseLead — проверка заявки на сервере', () => {
	it('принимает заполненную заявку; пробелы по краям, \\r\\n и управляющие символы вычищает', () => {
		expect(parseLead(ok)).toEqual({ ok: true, trap: false, lead: ok })
		expect(parseLead({ ...ok, name: '  Виктор\u0000 ', message: 'Строка 1\r\nСтрока 2\t\u0007' })).toEqual({
			ok: true,
			trap: false,
			lead: { ...ok, name: 'Виктор', message: 'Строка 1\nСтрока 2' },
		})
	})

	it('имя и тема необязательны: отсутствуют или не строки → пустые', () => {
		expect(parseLead({ contact: 'name@company.ru', message: 'Сайт' })).toEqual({
			ok: true,
			trap: false,
			lead: { name: '', contact: 'name@company.ru', message: 'Сайт', topic: '' },
		})
		expect(parseLead({ ...ok, name: 42, topic: null })).toMatchObject({ ok: true, lead: { name: '', topic: '' } })
	})

	it('контакт — почта, @ник или номер, как на клиенте', () => {
		for (const contact of ['name@company.ru', '@victor', 'victor_mbox', '+7 995 394-03-03', '89953940303']) {
			expect(parseLead({ ...ok, contact })).toMatchObject({ ok: true })
		}
		for (const contact of ['', '  ', 'ab', 'имя с пробелом', 'a@b']) {
			expect(parseLead({ ...ok, contact })).toEqual({ ok: false, fields: ['contact'] })
		}
	})

	it('перечисляет все невалидные поля; длины ограничены LIMITS', () => {
		expect(parseLead({ contact: '', message: ' ' })).toEqual({ ok: false, fields: ['contact', 'message'] })
		expect(parseLead({ ...ok, message: 'x'.repeat(LIMITS.message + 1) })).toEqual({ ok: false, fields: ['message'] })
		expect(parseLead({ ...ok, message: 'x'.repeat(LIMITS.message) })).toMatchObject({ ok: true })
		expect(parseLead({ ...ok, name: 'x'.repeat(LIMITS.name + 1), topic: 'x'.repeat(LIMITS.topic + 1) })).toEqual({
			ok: false,
			fields: ['name', 'topic'],
		})
		expect(parseLead({ ...ok, contact: `@${'x'.repeat(LIMITS.contact)}` })).toEqual({ ok: false, fields: ['contact'] })
	})

	it('тело не объект — ошибка body', () => {
		for (const body of [null, undefined, 'строка', 7, [ok]]) expect(parseLead(body)).toEqual({ ok: false, fields: ['body'] })
	})

	it('заполненная ловушка website — ok и trap, остальные поля не проверяются', () => {
		expect(parseLead({ ...ok, website: '' })).toMatchObject({ ok: true, trap: false })
		expect(parseLead({ ...ok, website: 'http://spam.example' })).toMatchObject({ ok: true, trap: true })
		expect(parseLead({ contact: '', message: '', website: 'x' })).toMatchObject({ ok: true, trap: true })
	})
})

describe('telegramText — уведомление в Telegram', () => {
	it('строки по порядку, пустые имя и тема пропускаются, страница — курсивом в конце', () => {
		expect(telegramText(ok, { page: 'https://matsakov-victor.com/services/company-site' })).toBe(
			[
				'<b>Заявка с сайта</b>',
				'<b>Тема:</b> Сайт компании',
				'<b>Имя:</b> Виктор',
				'<b>Контакт:</b> @victor',
				'',
				'Нужен сайт компании',
				'',
				'<i>Страница: https://matsakov-victor.com/services/company-site</i>',
			].join('\n'),
		)
		expect(telegramText({ ...ok, name: '', topic: '' })).toBe('<b>Заявка с сайта</b>\n<b>Контакт:</b> @victor\n\nНужен сайт компании')
	})

	it('экранирует HTML посетителя и режет длинную задачу под лимит Telegram', () => {
		const text = telegramText({ ...ok, name: 'A & B', message: '<script>alert(1)</script>' })
		expect(text).toContain('<b>Имя:</b> A &amp; B')
		expect(text).toContain('&lt;script&gt;alert(1)&lt;/script&gt;')
		const long = telegramText({ ...ok, message: 'x'.repeat(TELEGRAM_MESSAGE_MAX + 500) })
		expect(long.length).toBeLessThan(4096)
		expect(long.endsWith('…')).toBe(true)
	})
})

describe('mailContent — письмо-дубль', () => {
	it('тема из контекста, текст без HTML, Reply-To — только если контакт похож на почту', () => {
		expect(mailContent({ ...ok, contact: 'name@company.ru' }, { page: 'https://matsakov-victor.com/contacts' })).toEqual({
			subject: 'Заявка с сайта: Сайт компании',
			text: 'Тема: Сайт компании\nИмя: Виктор\nКонтакт: name@company.ru\n\nНужен сайт компании\n\nСтраница: https://matsakov-victor.com/contacts',
			replyTo: 'name@company.ru',
		})
		expect(mailContent({ ...ok, name: '', topic: '' })).toEqual({
			subject: 'Заявка с сайта: общее обращение',
			text: 'Контакт: @victor\n\nНужен сайт компании',
			replyTo: undefined,
		})
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

describe('readConfig — настройки из окружения', () => {
	it('без переменных: адрес и лимиты по умолчанию, каналы отключены', () => {
		expect(readConfig({})).toEqual({
			host: '127.0.0.1',
			port: 3001,
			telegram: null,
			mail: null,
			rate: { limit: 5, windowMs: 10 * 60_000 },
		})
	})

	it('Telegram нужны обе переменные; SMTP — хост, логин и пароль', () => {
		expect(readConfig({ TELEGRAM_BOT_TOKEN: 't' }).telegram).toBeNull()
		expect(readConfig({ TELEGRAM_BOT_TOKEN: 't', TELEGRAM_CHAT_ID: '1' }).telegram).toEqual({ token: 't', chatId: '1' })
		expect(readConfig({ SMTP_HOST: 'smtp.beget.com', SMTP_USER: 'u' }).mail).toBeNull()
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
