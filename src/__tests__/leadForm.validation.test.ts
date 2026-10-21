import { describe, expect, it } from 'vitest'
import { submitContact } from '../api/contact'
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
	it('пока нет обработчика и политики, форма не настоящая: в dev и тестах — только тестовый режим', () => {
		expect(FORM_DELIVERY_READY).toBe(false)
		expect(PRIVACY_POLICY_URL).toBeUndefined()
		expect(FORM_LIVE).toBe(false)
		// vitest работает как dev: форма видна в тестовом режиме; в прод-сборке FORM_ENABLED = false → «Написать в Telegram»
		expect(FORM_TEST_MODE).toBe(import.meta.env.DEV)
		expect(FORM_ENABLED).toBe(FORM_TEST_MODE)
		expect(FORM_COPY.testMode).toMatch(/Тестовый режим/)
	})
})

describe('submitContact', () => {
	it('в тестовом режиме — имитация без внешней отправки; контракт без услуги, бюджета и намерения', async () => {
		const payload: ContactPayload = { name: '', contact: '@test', message: 'Нужна страница под рекламу', topic: '' }
		expect(Object.keys(payload).sort()).toEqual(['contact', 'message', 'name', 'topic'])
		await expect(submitContact(payload)).resolves.toBeUndefined()
		await expect(submitContact({ ...payload, name: 'Тест', topic: 'Лендинг' })).resolves.toBeUndefined()
	})
})
