import { describe, expect, it } from 'vitest'
import { AUDIENCES, HERO_FACTS } from '../data/home2'
import { OFFERS } from '../data/offers'

describe('home2: концепт H «Портрет»', () => {
	it('четыре аудитории с уникальными id, у каждой заголовок, текст, 3–4 пункта, кнопка и ссылка', () => {
		expect(AUDIENCES.length).toBe(4)
		const ids = AUDIENCES.map(a => a.id)
		expect(new Set(ids).size).toBe(ids.length)
		AUDIENCES.forEach(a => {
			expect(a.label).toBeTruthy()
			expect(a.title.length).toBeGreaterThan(20)
			expect(a.text.length).toBeGreaterThan(40)
			expect(a.items.length).toBeGreaterThanOrEqual(3)
			expect(a.items.length).toBeLessThanOrEqual(4)
			expect(a.cta.label).toBeTruthy()
			expect(a.link.to).toMatch(/^\//)
		})
	})

	it('темы кнопок ссылаются на существующие офферы, у резюме есть ссылка', () => {
		AUDIENCES.filter(a => a.cta.topic).forEach(a => {
			expect(OFFERS.some(o => o.title === a.cta.topic)).toBe(true)
		})
		expect(AUDIENCES.find(a => a.id === 'hr')?.cta.href).toBeTruthy()
	})

	it('два числа в hero — положительные и разные', () => {
		expect(HERO_FACTS.length).toBe(2)
		HERO_FACTS.forEach(f => {
			expect(f.value).toBeGreaterThan(0)
			expect(f.label).toBeTruthy()
		})
		expect(new Set(HERO_FACTS.map(f => f.value)).size).toBe(HERO_FACTS.length)
	})

	it('числа hero не повторяются в текстах аудиторий (content.md §6 п.8)', () => {
		const text = AUDIENCES.map(a => [a.title, a.text, ...a.items].join(' ')).join(' ')
		expect(text).not.toMatch(/6\s?000/)
		expect(text).not.toMatch(/8 лет/)
		expect(text).not.toMatch(/3\s?500/)
	})
})
