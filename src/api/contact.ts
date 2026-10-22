import { FORM_DELIVERY_READY, FORM_TEST_MODE } from '../data/leadForm'

/**
 * Адрес обработчика (server/contact.js). Относительный, тот же origin: на боевом сервере за прокси nginx
 * (deploy/nginx, location /api/), на dev-сервере — за прокси Vite (vite.config.ts → 127.0.0.1:3001, `npm run server`)
 */
export const CONTACT_ENDPOINT = '/api/contact'

export type ContactPayload = {
	/** Как обращаться — необязательно, пустая строка допустима */
	name: string
	contact: string
	/** Текст посетителя «Что нужно сделать» как есть */
	message: string
	/**
	 * Контекст обращения, подставляется сайтом, а не посетителем: название услуги на её странице, формат из блока цен;
	 * пустая строка — общее обращение
	 */
	topic: string
	/**
	 * Ловушка для ботов (TrapField): скрытое поле, человек его не видит и не заполняет. Непустое — сервер отвечает
	 * успехом, но заявку отбрасывает
	 */
	website?: string
}

/** Ключ localStorage, которым в тестовом режиме имитируется сбой отправки: `localStorage.setItem(MOCK_KEY, 'fail')` */
export const MOCK_KEY = 'contact-mock'

function mockShouldFail() {
	try {
		return localStorage.getItem(MOCK_KEY) === 'fail'
	} catch {
		return false
	}
}

function confirmsDelivery(data: unknown) {
	return typeof data === 'object' && data !== null && (data as { ok?: unknown }).ok === true
}

/**
 * Отправка заявки:
 * - боевой режим (FORM_DELIVERY_READY) — POST JSON на CONTACT_ENDPOINT; успех только при HTTP 2xx и `{ ok: true }`
 *   в ответе, иначе исключение — форма показывает FORM_COPY.error и сохраняет введённое. Проверку полей на сервере
 *   и защиту от спама (лимит по IP, ловушка `website`) держит обработчик, см. server/lib.js;
 * - тестовый режим (dev-сервер при выключенном FORM_DELIVERY_READY, FORM_TEST_MODE) — имитация: задержка 900 мс
 *   и console.info с payload; сбой — через MOCK_KEY
 */
export async function submitContact(payload: ContactPayload): Promise<void> {
	if (FORM_TEST_MODE) {
		await new Promise(resolve => setTimeout(resolve, 900))
		if (mockShouldFail()) throw new Error('Тестовый режим: имитация сбоя отправки')
		console.info('[contact] тестовый режим, заявка не отправлена:', payload)
		return
	}
	if (!FORM_DELIVERY_READY) throw new Error('Отправка заявок отключена (FORM_DELIVERY_READY), см. code.md §8')

	const res = await fetch(CONTACT_ENDPOINT, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
	})
	const data: unknown = await res.json().catch(() => null)
	if (!res.ok || !confirmsDelivery(data)) throw new Error(`Обработчик не подтвердил доставку: HTTP ${res.status}`)
}
