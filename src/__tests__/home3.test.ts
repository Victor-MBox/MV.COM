import { describe, expect, it } from 'vitest'
import {
	CTA_MARQUEE,
	FEATURED_OFFERS,
	FINAL_STATS,
	FORM_COPY,
	H2,
	HERO_OFFER,
	HERO_STATS,
	HERO_TAGS,
	INTENTS,
	JOB_FORMATS,
	MOTTO,
	ROW_OFFERS,
	parseStat,
} from '../data/home3'
import { HERO_SUBTITLE } from '../data/home2'
import { PROOF } from '../data/home'
import { OFFERS } from '../data/offers'
import { PROJECTS } from '../data/projects'

describe('home3: дизайн-система 1.0', () => {
	it('parseStat разбирает число и суффикс, строки без числа оставляет текстом', () => {
		expect(parseStat('18 000+')).toEqual({ value: 18000, suffix: '+' })
		expect(parseStat('92%')).toEqual({ value: 92, suffix: '%' })
		expect(parseStat('8 лет')).toEqual({ value: 8, suffix: ' лет' })
		expect(parseStat('Февраль 2026')).toEqual({ value: 'Февраль 2026', suffix: '' })
	})

	it('девиз — две строки без акцента и без чисел', () => {
		expect(MOTTO.length).toBe(2)
		MOTTO.forEach(line => {
			expect(line.length).toBeGreaterThan(5)
			expect(line).not.toMatch(/\d/)
		})
		expect(HERO_TAGS.length).toBe(3)
	})

	it('H1 hero собран из HERO_SUBTITLE: последняя фраза — акцентной строкой', () => {
		expect(`${HERO_OFFER.lead} ${HERO_OFFER.accent}`).toBe(HERO_SUBTITLE)
		expect(HERO_OFFER.accent).toBe('Цена и срок — до старта.')
	})

	it('ряд цифр hero выводится из PROOF: три числа с подписями, второй факт разбит на два', () => {
		expect(HERO_STATS).toEqual([
			{ value: 8, suffix: ' лет', label: 'в разработке' },
			{ value: 6000, suffix: '+', label: 'пользователей NoRandoms' },
			{ value: 500, suffix: '+', label: 'посетителей в день из поиска без рекламы' },
		])
		expect(PROOF.length).toBe(2)
	})

	it('в каждом H2 не больше одного акцента, и он есть в тексте ровно один раз', () => {
		Object.values(H2).forEach(h => {
			expect(h.text.length).toBeGreaterThan(5)
			if (h.accent) {
				expect(h.text.split(h.accent).length).toBe(2)
			}
		})
	})

	it('три карточки и четыре строки услуг покрывают все семь офферов без повторов', () => {
		const keys = [...FEATURED_OFFERS, ...ROW_OFFERS]
		expect(new Set(keys).size).toBe(OFFERS.length)
		keys.forEach(k => expect(OFFERS.some(o => o.key === k)).toBe(true))
	})

	it('счётчики финала привязаны к источникам и не повторяют числа hero и кейса', () => {
		expect(FINAL_STATS.length).toBe(4)
		const [projects, call, days, month] = FINAL_STATS
		expect(projects.source).toContain(`${projects.value}${projects.suffix ?? ''}`)
		expect(call.source).toContain(`${call.value} минут`)
		expect(days.source).toContain('двух дней')
		expect(month.source).toMatch(/^Месяц правок/)

		const heroNumbers = HERO_STATS.map(s => s.value)
		const caseNumbers = (PROJECTS[0].highlights ?? []).map(h => parseStat(h.value).value)
		FINAL_STATS.forEach(s => {
			expect(heroNumbers).not.toContain(s.value)
			expect(caseNumbers).not.toContain(s.value)
			expect(s.label.length).toBeGreaterThan(5)
		})
	})

	it('форма: три намерения с уникальными ключами, форматы вакансии и три шага «что дальше»', () => {
		expect(INTENTS.map(i => i.key)).toEqual(['project', 'job', 'question'])
		expect(new Set(INTENTS.map(i => i.label)).size).toBe(3)
		expect(JOB_FORMATS.length).toBeGreaterThanOrEqual(2)
		expect(FORM_COPY.next.length).toBe(3)
		expect(FORM_COPY.success).toBeTruthy()
		expect(CTA_MARQUEE.length).toBe(2)
	})
})
