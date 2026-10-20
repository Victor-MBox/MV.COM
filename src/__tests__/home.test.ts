import { describe, expect, it } from 'vitest'
import {
	CASE_FACTS,
	FINAL_META,
	FINAL_TITLE,
	H2,
	HERO_OFFER,
	HERO_STAT,
	HR_BLOCK,
	HR_LINE,
	NAME,
	NAME_LINES,
	NAV,
	PROCESS_WHY,
	SHOWCASE_ORDER,
	SOCIAL,
	STATS,
	STRIP,
	WATERMARK,
	WHY_ME,
	WORK_PLACEHOLDERS,
	WORK_SLIDES,
} from '../data/home'
import { parseStat } from '../components/stat/formatStat'
import { OFFERS, offerPath } from '../data/offers'
import { PROCESS } from '../data/experience'
import { PROJECTS } from '../data/projects'
import { CONTACTS, CONTACT_LINKS } from '../data/contacts'
import { ROUTE_PATHS } from '../app/routes'

describe('главная: Portilo, меню в шапке', () => {
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

	it('слайдер работ: главный кейс первым с фактами по CASE_FACTS, затем примеры со ссылкой на оффер и векторной обложкой', () => {
		const main = PROJECTS.find(p => p.featured) ?? PROJECTS[0]
		expect(WORK_SLIDES.length).toBeGreaterThanOrEqual(2) // иначе слайдер не рендерится
		expect(WORK_SLIDES[0].slug).toBe(main.slug)
		expect(WORK_SLIDES[0].highlights?.map(h => h.value)).toEqual(CASE_FACTS.map(i => main.highlights?.[i]?.value))
		expect(new Set(WORK_SLIDES.map(s => s.slug)).size).toBe(WORK_SLIDES.length)
		WORK_SLIDES.forEach(s => expect(Boolean(s.cover) !== Boolean(s.art)).toBe(true)) // либо скриншот, либо иллюстрация
		WORK_PLACEHOLDERS.forEach(p => {
			expect(OFFERS.map(offerPath)).toContain(p.to) // ведёт на существующую страницу оффера, а не на 404 кейса
			expect(p.art).toBeTruthy()
			p.highlights?.forEach(h => expect(h.value).not.toMatch(/^\d/)) // без чисел — они только в 6.8 и карточке NoRandoms
		})
	})

	it('H1-абзац hero: лид и одна акцентная фраза', () => {
		expect(HERO_OFFER.lead.length).toBeGreaterThan(20)
		expect(HERO_OFFER.accent).toBe('Цена и срок — до старта.')
	})

	it('в каждом H2 не больше одного выделения, и оно — подстрока текста', () => {
		Object.values(H2).forEach(h => {
			expect(h.text.length).toBeGreaterThan(5)
			expect(h.accent && h.muted).toBeFalsy()
			const mark = h.accent ?? h.muted
			if (mark) expect(h.text.split(mark).length).toBe(2)
		})
	})

	it('имя в две строки, девиз финала и водяной знак — без цифр', () => {
		expect(FINAL_TITLE.length).toBe(2)
		expect(NAME_LINES).toEqual(['Виктор', 'Мацаков'])
		;[NAME, WATERMARK, ...FINAL_TITLE, ...NAME_LINES].forEach(s => {
			expect(s.length).toBeGreaterThan(2)
			expect(s).not.toMatch(/\d/)
		})
	})

	it('города и часового пояса на сайте нет (решение владельца от 20.10.2026)', () => {
		const strings = [...FINAL_META, HR_LINE.place, HR_BLOCK.text, CONTACTS.location]
		strings.forEach(s => expect(s).not.toMatch(/Тбилиси|Грузия|GMT|UTC/i))
		expect(FINAL_META.length).toBe(2)
	})

	it('ссылки шапки ведут на существующие маршруты, соцссылки — на ключи CONTACT_LINKS', () => {
		const paths = ROUTE_PATHS as readonly string[]
		NAV.forEach(n => expect(paths).toContain(n.to))
		expect(new Set(NAV.map(n => n.to)).size).toBe(NAV.length)
		SOCIAL.forEach(key => expect(CONTACT_LINKS[key]).toMatch(/^https?:/))
	})
})
