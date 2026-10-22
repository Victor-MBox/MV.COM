import { afterEach, describe, expect, it, vi } from 'vitest'
import { CONTACT_ENDPOINT, submitContact } from '../api/contact'
import type { ContactPayload } from '../api/contact'
import { validateContact } from '../components/leadForm/validate'
import { FORM_COPY, FORM_DELIVERY_READY, FORM_ENABLED, FORM_LIVE, FORM_TEST_MODE, PRIVACY_POLICY_URL } from '../data/leadForm'

const ok = { contact: '@victor', message: 'Нужен сайт компании', consent: true }

describe('validateContact — форма первого обращения', () => {
	it('заполненная форма проходит; имя не проверяется', () => {
		expect(validateContact(ok)).toEqual({})
		expect(validateContact({ ...ok, contact: 'name@company.ru' })).toEqual({})
		expect(validateContact({ ...ok, contact: '+7 995 394-03-03' })).toEqual({})
	})

	it('пустой или невнятный контакт — «Укажите Telegram или почту…»', () => {
		expect(validateContact({ ...ok, contact: '' }).contact).toBe(FORM_COPY.errors.contact)
		expect(validateContact({ ...ok, contact: '  ' }).contact).toBe(FORM_COPY.errors.contact)
		expect(validateContact({ ...ok, contact: 'ab' }).contact).toBe(FORM_COPY.errors.contact)
	})

	it('пустая задача — «Коротко опишите, что нужно сделать»', () => {
		expect(validateContact({ ...ok, message: '' }).message).toBe(FORM_COPY.errors.message)
		expect(validateContact({ ...ok, message: '   ' }).message).toBe(FORM_COPY.errors.message)
		expect(validateContact({ ...ok, message: 'Сайт' })).toEqual({})
	})

	it('без согласия форма не уходит', () => {
		expect(validateContact({ ...ok, consent: false }).consent).toBe(FORM_COPY.errors.consent)
	})

	it('пустая форма — три ошибки', () => {
		expect(Object.keys(validateContact({ contact: '', message: '', consent: false })).sort()).toEqual(['consent', 'contact', 'message'])
	})
})

describe('готовность формы', () => {
	it('обработчик подключён, политики ещё нет: публичная сборка показывает «Написать в Telegram», dev — настоящую форму', () => {
		expect(FORM_DELIVERY_READY).toBe(true)
		expect(PRIVACY_POLICY_URL).toBeUndefined()
		expect(FORM_LIVE).toBe(false)
		// Тестовый режим (имитация отправки) — только при выключенном обработчике; с обработчиком форма шлёт по-настоящему
		expect(FORM_TEST_MODE).toBe(false)
		// vitest работает как dev: форма видна; в прод-сборке FORM_ENABLED = false, пока не задан PRIVACY_POLICY_URL
		expect(FORM_ENABLED).toBe(import.meta.env.DEV)
		expect(FORM_COPY.testMode).toMatch(/Тестовый режим/)
	})
})

describe('submitContact — запрос к обработчику', () => {
	const payload: ContactPayload = { name: '', contact: '@test', message: 'Нужна страница под рекламу', topic: '', website: '' }
	const reply = (status: number, body: unknown) =>
		vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }))

	afterEach(() => vi.unstubAllGlobals())

	it('контракт: имя, контакт, задача, контекст и ловушка website — без услуги, бюджета и намерения', () => {
		expect(Object.keys(payload).sort()).toEqual(['contact', 'message', 'name', 'topic', 'website'])
	})

	it('шлёт POST JSON на /api/contact и завершается успехом только при 2xx с { ok: true }', async () => {
		const fetchMock = reply(200, { ok: true })
		vi.stubGlobal('fetch', fetchMock)
		await expect(submitContact(payload)).resolves.toBeUndefined()
		expect(fetchMock).toHaveBeenCalledTimes(1)
		const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
		expect(url).toBe(CONTACT_ENDPOINT)
		expect(init.method).toBe('POST')
		expect(init.headers).toEqual({ 'Content-Type': 'application/json' })
		expect(JSON.parse(init.body as string)).toEqual(payload)
	})

	it('ошибка сервера, ответ без подтверждения или обрыв сети — исключение (форма покажет FORM_COPY.error)', async () => {
		vi.stubGlobal('fetch', reply(502, { ok: false, error: 'delivery_failed' }))
		await expect(submitContact(payload)).rejects.toThrow(/502/)
		vi.stubGlobal('fetch', reply(200, { ok: false }))
		await expect(submitContact(payload)).rejects.toThrow(/не подтвердил/)
		vi.stubGlobal('fetch', vi.fn(async () => new Response('<html>502</html>', { status: 502 })))
		await expect(submitContact(payload)).rejects.toThrow()
		vi.stubGlobal(
			'fetch',
			vi.fn(async () => {
				throw new TypeError('Failed to fetch')
			}),
		)
		await expect(submitContact(payload)).rejects.toThrow('Failed to fetch')
	})
})
