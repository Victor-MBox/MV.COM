import { CONSENT_VERSION, FORM_DELIVERY_READY, FORM_TEST_MODE } from '../data/leadForm'
import type { LeadFormId } from '../data/leadForm'

/**
 * Адрес обработчика (server/contact.js). Относительный, тот же origin: на боевом сервере за прокси nginx
 * (deploy/nginx, location /api/), на dev-сервере — за прокси Vite (vite.config.ts → 127.0.0.1:3721, `npm run server`)
 */
export const CONTACT_ENDPOINT = '/api/contact'
export const HEALTH_ENDPOINT = '/api/contact/health'

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
	/** Явное согласие на обработку данных — чекбокс формы. Сервер отклоняет заявку без `true` */
	consent: true
	/** Редакция согласия, которую видел посетитель (data/legal.ts); сервер сверяет со своей (server/legal.json) */
	consentVersion: string
	/** Откуда отправлено: окно обращения, страница контактов или форма футера — в запись о согласии */
	formId: LeadFormId
	/** Ключ одной отправки (новый после каждого успеха): повтор после обрыва сети не создаёт вторую заявку */
	submissionId: string
	/**
	 * Ловушка для ботов (TrapField): скрытое поле, человек его не видит и не заполняет. Непустое — сервер отвечает
	 * успехом, но заявку отбрасывает
	 */
	website?: string
}

export type ContactResult = {
	/** Номер заявки с сервера — показывается посетителю, по нему ищется обращение и запись о согласии */
	requestId: string
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

function confirmsDelivery(data: unknown): data is { ok: true; requestId?: unknown } {
	return typeof data === 'object' && data !== null && (data as { ok?: unknown }).ok === true
}

/**
 * Отправка заявки:
 * - боевой режим (FORM_DELIVERY_READY) — POST JSON на CONTACT_ENDPOINT; успех только при HTTP 2xx и `{ ok: true }`
 *   в ответе, иначе исключение — форма показывает FORM_COPY.error и сохраняет введённое. Проверку полей, согласия
 *   и защиту от спама (лимит по IP, ловушка `website`, origin) держит обработчик, см. server/lib.js;
 * - тестовый режим (dev-сервер при выключенном FORM_DELIVERY_READY, FORM_TEST_MODE) — имитация: задержка 900 мс;
 *   сбой — через MOCK_KEY. Содержимое полей в консоль не пишется (ТЗ §7)
 */
export async function submitContact(payload: ContactPayload): Promise<ContactResult> {
	if (FORM_TEST_MODE) {
		await new Promise(resolve => setTimeout(resolve, 900))
		if (mockShouldFail()) throw new Error('Тестовый режим: имитация сбоя отправки')
		console.info('[contact] тестовый режим, заявка не отправлена:', { topic: payload.topic, formId: payload.formId })
		return { requestId: 'TEST' }
	}
	if (!FORM_DELIVERY_READY) throw new Error('Отправка заявок отключена (FORM_DELIVERY_READY), см. code.md §8')

	const res = await fetch(CONTACT_ENDPOINT, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ ...payload, consentVersion: CONSENT_VERSION }),
	})
	const data: unknown = await res.json().catch(() => null)
	if (!res.ok || !confirmsDelivery(data)) throw new Error(`Обработчик не подтвердил доставку: HTTP ${res.status}`)
	return { requestId: typeof data.requestId === 'string' ? data.requestId : '' }
}

// ---------- Готовность сервера ----------

/**
 * Готов ли обработчик принимать заявки (ТЗ §4: проверять на сервере, не клиентским флагом): `ready` из health —
 * есть канал, доставляющий содержимое заявки (почта или Telegram в полном режиме), и место для записи о согласии.
 * `unknown` — ответа ещё нет или он не разобран (обработчик недоступен): форма остаётся, отправка покажет ошибку;
 * `off` — сервер явно не настроен: вместо формы FormFallback
 */
export type DeliveryReadiness = 'unknown' | 'ready' | 'off'

let readiness: DeliveryReadiness = 'unknown'
let probing = false
const listeners = new Set<() => void>()

function setReadiness(next: DeliveryReadiness) {
	if (next === readiness) return
	readiness = next
	listeners.forEach(l => l())
}

async function probe() {
	try {
		const res = await fetch(HEALTH_ENDPOINT, { cache: 'no-store' })
		const data: unknown = await res.json().catch(() => null)
		const ready = (data as { ready?: unknown } | null)?.ready
		if (ready === true) setReadiness('ready')
		else if (ready === false || res.status === 503) setReadiness('off')
	} catch {
		// сеть или обработчик недоступны — остаёмся в unknown, форма покажет ошибку при отправке
	}
}

/** Один запрос health на загрузку приложения — при первой подписке (все формы делят результат) */
export function subscribeDeliveryReadiness(listener: () => void) {
	listeners.add(listener)
	if (!probing && FORM_DELIVERY_READY) {
		probing = true
		void probe()
	}
	return () => {
		listeners.delete(listener)
	}
}

export function getDeliveryReadiness() {
	return readiness
}
