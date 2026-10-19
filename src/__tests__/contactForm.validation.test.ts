import { describe, expect, it } from 'vitest'
import { submitContact } from '../api/contact'

describe('submitContact', () => {
	it('резолвится без ошибки (заглушка до подключения бэкенда)', async () => {
		await expect(
			submitContact({ name: 'Тест', contact: '@test', topic: '', message: 'Привет, нужен сайт' })
		).resolves.toBeUndefined()
	})
})
