export type ContactPayload = {
	name: string
	contact: string
	topic: string
	/** Вилка бюджета из BUDGET_RANGES, необязательно */
	budget?: string
	message: string
}

/**
 * Отправка заявки. Сейчас — имитация запроса, чтобы форма работала без бэкенда.
 * Замените тело функции на реальный fetch к вашему API или сервису форм.
 */
export async function submitContact(payload: ContactPayload): Promise<void> {
	await new Promise(resolve => setTimeout(resolve, 900))
	if (import.meta.env.DEV) {
		console.info('[contact] заявка отправлена (имитация):', payload)
	}
}
