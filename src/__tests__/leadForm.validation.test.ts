import { afterEach, describe, expect, it, vi } from 'vitest'
import { CONTACT_ENDPOINT, HEALTH_ENDPOINT, submitContact } from '../api/contact'
import type { ContactPayload } from '../api/contact'
import { validateContact } from '../components/leadForm/validate'
import { CONSENT_VERSION, FORM_COPY, FORM_DELIVERY_READY, FORM_ENABLED, FORM_TEST_MODE } from '../data/leadForm'
import { LEGAL_DOCS } from '../data/legal'

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

	it('без согласия форма не уходит — ошибка по ТЗ от 22.10.2026', () => {
		expect(validateContact({ ...ok, consent: false }).consent).toBe('Для отправки заявки нужно согласие на обработку персональных данных')
	})

	it('пустая форма — три ошибки', () => {
		expect(Object.keys(validateContact({ contact: '', message: '', consent: false })).sort()).toEqual(['consent', 'contact', 'message'])
	})
})

describe('готовность формы', () => {
	it('обработчик подключён, документы есть: форма собрана, тестового режима нет; окончательно решает health', () => {
		expect(FORM_DELIVERY_READY).toBe(true)
		expect(FORM_ENABLED).toBe(true)
		expect(FORM_TEST_MODE).toBe(false)
		expect(CONSENT_VERSION).toBe(LEGAL_DOCS.consent.version)
		expect(FORM_COPY.testMode).toMatch(/Тестовый режим/)
	})
})

describe('submitContact — запрос к обработчику', () => {
	const payload: ContactPayload = {
		name: '',
		contact: '@test',
		message: 'Нужна страница под рекламу',
		topic: '',
		consent: true,
		consentVersion: CONSENT_VERSION,
		formId: 'modal',
		submissionId: '3f1a2b4c-0000-4000-8000-000000000001',
		website: '',
	}
	const reply = (status: number, body: unknown) =>
		vi.fn(async () => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } }))

	afterEach(() => vi.unstubAllGlobals())

	it('контракт: поля посетителя, контекст, согласие с редакцией, источник формы, ключ отправки и ловушка', () => {
		expect(Object.keys(payload).sort()).toEqual(['consent', 'consentVersion', 'contact', 'formId', 'message', 'name', 'submissionId', 'topic', 'website'])
	})

	it('шлёт POST JSON на /api/contact, успех только при 2xx с { ok: true }; возвращает номер заявки', async () => {
		const fetchMock = reply(200, { ok: true, requestId: 'MV-20261022-ABCDE' })
		vi.stubGlobal('fetch', fetchMock)
		await expect(submitContact(payload)).resolves.toEqual({ requestId: 'MV-20261022-ABCDE' })
		expect(fetchMock).toHaveBeenCalledTimes(1)
		const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
		expect(url).toBe(CONTACT_ENDPOINT)
		expect(init.method).toBe('POST')
		expect(init.headers).toEqual({ 'Content-Type': 'application/json' })
		expect(JSON.parse(init.body as string)).toEqual(payload)
	})

	it('редакция согласия в запросе — всегда действующая, что бы ни передали', async () => {
		const fetchMock = reply(200, { ok: true, requestId: 'x' })
		vi.stubGlobal('fetch', fetchMock)
		await submitContact({ ...payload, consentVersion: '0.1' })
		const [, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
		expect(JSON.parse(init.body as string).consentVersion).toBe(CONSENT_VERSION)
	})

	it('ошибка сервера, ответ без подтверждения или обрыв сети — исключение (форма покажет FORM_COPY.error)', async () => {
		vi.stubGlobal('fetch', reply(502, { ok: false, error: 'delivery_failed' }))
		await expect(submitContact(payload)).rejects.toThrow(/502/)
		vi.stubGlobal('fetch', reply(400, { ok: false, error: 'invalid', fields: ['consent'] }))
		await expect(submitContact(payload)).rejects.toThrow(/400/)
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

describe('готовность сервера по health (ТЗ §4: проверять на сервере)', () => {
	afterEach(() => {
		vi.unstubAllGlobals()
		vi.resetModules()
	})

	/** Свежий экземпляр модуля: состояние готовности живёт в модуле, один запрос на подписку */
	async function probe(response: () => Promise<Response>) {
		vi.unstubAllGlobals()
		vi.resetModules()
		const fetchMock = vi.fn(response)
		vi.stubGlobal('fetch', fetchMock)
		const api = await import('../api/contact')
		expect(api.getDeliveryReadiness()).toBe('unknown')
		const changes: string[] = []
		const off1 = api.subscribeDeliveryReadiness(() => changes.push(api.getDeliveryReadiness()))
		const off2 = api.subscribeDeliveryReadiness(() => {})
		await vi.waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1))
		await new Promise(r => setTimeout(r, 0))
		off1()
		off2()
		return { fetchMock, state: api.getDeliveryReadiness(), changes }
	}

	it('ready: true → форма; один GET /api/contact/health на все формы', async () => {
		const { fetchMock, state } = await probe(async () => new Response(JSON.stringify({ ok: true, ready: true }), { status: 200 }))
		expect(state).toBe('ready')
		expect((fetchMock.mock.calls[0] as unknown as [string])[0]).toBe(HEALTH_ENDPOINT)
	})

	it('ready: false — сервер не настроен → вместо формы запасной контакт', async () => {
		const { state, changes } = await probe(async () => new Response(JSON.stringify({ ok: true, ready: false, mail: false }), { status: 200 }))
		expect(state).toBe('off')
		expect(changes).toEqual(['off'])
	})

	it('обработчик недоступен или ответ не разобрать → unknown, форма остаётся', async () => {
		expect((await probe(async () => new Response('<html>502</html>', { status: 502 }))).state).toBe('unknown')
		expect(
			(
				await probe(async () => {
					throw new TypeError('Failed to fetch')
				})
			).state,
		).toBe('unknown')
	})
})
