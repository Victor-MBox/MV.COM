import { describe, expect, it } from 'vitest'
import {
	CASE_FACTS,
	FINAL_TITLE,
	H2,
	HERO_STAT,
	NAME,
	NAV,
	PROCESS_WHY,
	SHOWCASE_ORDER,
	SOCIAL,
	STATS,
	STRIP,
	WATERMARK,
} from '../data/home4'
import { parseStat } from '../data/home3'
import { OFFERS } from '../data/offers'
import { PROCESS } from '../data/experience'
import { WHY_ME } from '../data/home'
import { PROJECTS } from '../data/projects'
import { CONTACT_LINKS } from '../data/contacts'
import { ROUTE_PATHS } from '../app/routes'

describe('home4: Portilo, меню в шапке', () => {
	it('витрина услуг содержит каждый оффер ровно один раз', () => {
		expect(SHOWCASE_ORDER.length).toBe(OFFERS.length)
		expect(new Set(SHOWCASE_ORDER).size).toBe(OFFERS.length)
		SHOWCASE_ORDER.forEach(key => expect(OFFERS.some(o => o.key === key)).toBe(true))
		expect(STRIP).toEqual(OFFERS.map(o => o.title))
	})

	it('под каждым шагом процесса — своё обещание «Почему со мной»', () => {
		expect(PROCESS_WHY.length).toBe(PROCESS.length)
		expect([...PROCESS_WHY].sort()).toEqual(WHY_ME.map((_, i) => i))
	})

	it('числа не повторяются: hero, карточка работы и счётчики — разные факты', () => {
		const main = PROJECTS.find(p => p.featured) ?? PROJECTS[0]
		const caseFacts = CASE_FACTS.map(i => parseStat(main.highlights?.[i]?.value ?? ''))
		const all = [HERO_STAT, ...caseFacts, ...STATS].map(s => `${s.value}${s.suffix ?? ''}`)
		expect(new Set(all).size).toBe(all.length)
		expect(HERO_STAT).toEqual({ value: 8, suffix: ' лет', label: 'в разработке' })
		expect(STATS.length).toBe(4)
		expect(STATS.map(s => s.value)).toEqual([6000, 500, 92, 20])
		STATS.forEach(s => {
			expect(s.value).not.toBe(8)
			expect(s.value).not.toBe(18000)
			expect(s.label.length).toBeGreaterThan(5)
		})
	})

	it('в каждом H2 не больше одного выделения, и оно — подстрока текста', () => {
		Object.values(H2).forEach(h => {
			expect(h.text.length).toBeGreaterThan(5)
			expect(h.accent && h.muted).toBeFalsy()
			const mark = h.accent ?? h.muted
			if (mark) expect(h.text.split(mark).length).toBe(2)
		})
	})

	it('имя, девиз финала и водяной знак — без цифр; девиз в две строки', () => {
		expect(FINAL_TITLE.length).toBe(2)
		;[NAME, WATERMARK, ...FINAL_TITLE].forEach(s => {
			expect(s.length).toBeGreaterThan(2)
			expect(s).not.toMatch(/\d/)
		})
	})

	it('ссылки шапки ведут на существующие маршруты, соцссылки — на ключи CONTACT_LINKS', () => {
		const paths = ROUTE_PATHS as readonly string[]
		NAV.forEach(n => expect(paths).toContain(n.to))
		expect(new Set(NAV.map(n => n.to)).size).toBe(NAV.length)
		SOCIAL.forEach(key => expect(CONTACT_LINKS[key]).toMatch(/^https?:/))
	})
})
