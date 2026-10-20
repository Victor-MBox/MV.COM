import { describe, expect, it } from 'vitest'
import { submitContact } from '../api/contact'

describe('submitContact', () => {
	it('резолвится без ошибки (заглушка до подключения бэкенда)', async () => {
		await expect(
			submitContact({ name: 'Тест', contact: '@test', topic: '', message: 'Привет, нужен сайт' })
		).resolves.toBeUndefined()
		await expect(
			submitContact({
				name: 'Тест',
				contact: '@test',
				topic: 'Лендинг и промо-сайт',
				budget: 'до 100 000 ₽ — лендинг или доработка',
				message: 'Нужна страница под рекламу',
			})
		).resolves.toBeUndefined()
	})
})
