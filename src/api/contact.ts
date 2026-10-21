import { FORM_DELIVERY_READY, FORM_TEST_MODE } from '../data/leadForm'

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

/**
 * Отправка заявки. Обработчика доставки пока нет (FORM_DELIVERY_READY = false):
 * - тестовый режим (dev-сервер, FORM_TEST_MODE) — имитация: задержка 900 мс и console.info с payload; сбой — через MOCK_KEY;
 * - иначе — ошибка: успех без подтверждения сервера не показывается. В публичной сборке форма до готовности и не
 *   выводится (FORM_ENABLED), вместо неё — «Написать в Telegram».
 * Для боевого режима: fetch к своему endpoint с проверкой res.ok здесь, затем FORM_DELIVERY_READY = true; серверную
 * проверку полей и защиту от спама держит обработчик. Интерфейс ContactPayload сохранить
 */
export async function submitContact(payload: ContactPayload): Promise<void> {
	if (FORM_TEST_MODE) {
		await new Promise(resolve => setTimeout(resolve, 900))
		if (mockShouldFail()) throw new Error('Тестовый режим: имитация сбоя отправки')
		console.info('[contact] тестовый режим, заявка не отправлена:', payload)
		return
	}
	if (!FORM_DELIVERY_READY) throw new Error('Отправка заявок не подключена: нужен обработчик, см. code.md §8')
	throw new Error('Обработчик доставки отмечен готовым, но запрос к нему не реализован в submitContact')
}
