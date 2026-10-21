import { describe, expect, it } from 'vitest'
import { OFFERS, getOffer, offerPath } from '../data/offers'
import { SERVICES } from '../data/services'
import { BUDGET_RANGES, PRICING, PRICING_MODELS } from '../data/pricing'

describe('offers', () => {
	it('ровно семь офферов с уникальными URL-ключами', () => {
		expect(OFFERS.length).toBe(7)
		const keys = OFFERS.map(o => o.key)
		expect(new Set(keys).size).toBe(keys.length)
		keys.forEach(k => expect(k).toMatch(/^[a-z0-9-]+$/))
	})

	it('каждый services[] ссылается на существующую услугу, и каждая услуга попала хотя бы в один оффер', () => {
		const known = new Set(SERVICES.map(s => s.key))
		const used = new Set<string>()
		OFFERS.forEach(o => {
			expect(o.services.length).toBeGreaterThan(0)
			o.services.forEach(k => {
				expect(known.has(k)).toBe(true)
				used.add(k)
			})
		})
		SERVICES.forEach(s => expect(used.has(s.key)).toBe(true))
	})

	it('у каждого оффера есть цена в рублях, срок, подпись кнопки и неровный, но полный контент', () => {
		OFFERS.forEach(o => {
			expect(o.priceFrom).toMatch(/₽/)
			expect(o.term).toBeTruthy()
			expect(o.cta).toMatch(/^Обсудить /)
			expect(o.audience.length).toBe(3)
			expect(o.notFor.length).toBeGreaterThanOrEqual(1)
			expect(o.notFor.length).toBeLessThanOrEqual(2)
			expect(o.outcomes.length).toBeGreaterThanOrEqual(5)
			expect(o.outcomes.length).toBeLessThanOrEqual(8)
			expect(o.priceFactors.length).toBe(3)
			expect(o.notIncluded.length).toBeGreaterThan(0)
			expect(o.faq.length).toBeGreaterThanOrEqual(3)
			expect(o.faq.length).toBeLessThanOrEqual(5)
			expect(o.tech.stack.length).toBeGreaterThan(0)
			expect(o.tech.notes.length).toBeGreaterThan(0)
			expect(o.categories.length).toBeGreaterThan(0)
		})
	})

	it('у оффера с несколькими ценами первая совпадает с priceFrom, остальные не ниже', () => {
		const rub = (s: string) => Number(s.replace(/\D/g, ''))
		OFFERS.filter(o => o.prices).forEach(o => {
			const prices = o.prices ?? []
			expect(prices.length).toBeGreaterThanOrEqual(2)
			expect(prices[0].price).toBe(o.priceFrom)
			prices.forEach(p => expect(rub(p.price)).toBeGreaterThanOrEqual(rub(o.priceFrom)))
		})
		expect(getOffer('web-service')?.prices?.map(p => p.price)).toEqual(['от 150 000 ₽', 'от 300 000 ₽'])
	})

	it('1С-Битрикс упоминается только внутри оффера поддержки, отдельного оффера нет', () => {
		expect(OFFERS.some(o => /битрикс/i.test(o.title))).toBe(false)
		const support = getOffer('support')
		expect(support?.outcomes.some(t => /1С-Битрикс/.test(t))).toBe(true)
	})

	it('getOffer и offerPath', () => {
		expect(getOffer('landing')?.title).toBe('Лендинг и промо-сайт')
		expect(getOffer('nope')).toBeUndefined()
		expect(getOffer(undefined)).toBeUndefined()
		expect(offerPath({ key: 'support' })).toBe('/services/support')
	})
})

describe('pricing', () => {
	it('форматы оплаты и списки «Сколько стоит» заполнены', () => {
		expect(PRICING_MODELS.length).toBe(3)
		expect(PRICING.included.length).toBeGreaterThanOrEqual(5)
		expect(PRICING.factors.length).toBeGreaterThan(0)
		expect(PRICING.reading.length).toBe(3)
		expect(PRICING.terms.length).toBe(5)
		expect(PRICING.notDoing.length).toBe(3)
	})

	it('вилки бюджета заканчиваются вариантом «пока не знаю»', () => {
		expect(BUDGET_RANGES.length).toBe(4)
		expect(BUDGET_RANGES[BUDGET_RANGES.length - 1]).toBe('пока не знаю')
	})
})
