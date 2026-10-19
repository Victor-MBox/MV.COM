import { describe, expect, it } from 'vitest'
import { SERVICES, SERVICE_GROUPS, getGroup, getService, getServicesByGroup } from '../data/services'

describe('services (справочник подуслуг)', () => {
	it('ключи услуг и групп уникальны', () => {
		const keys = SERVICES.map(s => s.key)
		const groups = SERVICE_GROUPS.map(g => g.key)
		expect(new Set(keys).size).toBe(keys.length)
		expect(new Set(groups).size).toBe(groups.length)
	})

	it('каждая услуга ссылается на существующую группу и у каждой группы есть услуги', () => {
		const groups = new Set(SERVICE_GROUPS.map(g => g.key))
		SERVICES.forEach(s => expect(groups.has(s.group)).toBe(true))
		SERVICE_GROUPS.forEach(g => expect(getServicesByGroup(g.key).length).toBeGreaterThan(0))
	})

	it('у каждой услуги есть цена, срок, состав, результат и стек', () => {
		SERVICES.forEach(s => {
			expect(s.priceFrom).toMatch(/₽/)
			expect(s.term).toBeTruthy()
			expect(s.includes.length).toBeGreaterThanOrEqual(3)
			expect(s.outcome.length).toBeGreaterThan(20)
			expect(s.stack.length).toBeGreaterThan(0)
		})
	})

	it('getService и getGroup находят по ключам и не находят чужие', () => {
		expect(getGroup('sites')?.title).toBe('Сайты и веб-приложения')
		expect(getGroup('nope')).toBeUndefined()
		expect(getService('landing')?.title).toBe('Лендинг / промо-сайт')
		expect(getService('nope')).toBeUndefined()
	})
})
