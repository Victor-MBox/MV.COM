import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { EXPERIENCE, STACK_COPY, STACK_GROUPS, formatPeriod } from '../data/experience'
import { ABOUT_AREAS, ABOUT_INTRO, ABOUT_TEAMS } from '../data/about'
import { SITE_META } from '../data/meta'

describe('«Обо мне»: опыт по резюме (ТЗ от 21.10.2026)', () => {
	it('периоды: обратная хронология, без длительностей, «настоящее время» — только у текущей работы', () => {
		expect(EXPERIENCE.map(e => e.title)).toEqual(['Logicode', 'Grids', 'Мульти Бокс', 'Разработка сайтов на WordPress'])
		EXPERIENCE.forEach((e, i) => {
			if (e.to) expect(e.from < e.to).toBe(true)
			if (i > 0) expect(e.from < EXPERIENCE[i - 1].from).toBe(true)
			if (i > 0) expect(e.to).toBeTruthy()
		})
		expect(EXPERIENCE.map(formatPeriod)).toEqual([
			'Март 2025 — настоящее время',
			'Июль 2024 — март 2025',
			'Сентябрь 2022 — июль 2024',
			'Декабрь 2019 — сентябрь 2022',
		])
	})

	it('нет снятых шаблонных утверждений и неподтверждённых технологий', () => {
		const text = [
			...Object.values(ABOUT_INTRO).map(v => (typeof v === 'string' ? v : v.label)),
			...ABOUT_AREAS.flatMap(a => [a.title, a.text]),
			...EXPERIENCE.flatMap(e => [e.title, e.role, ...e.details]),
			...STACK_GROUPS.flatMap(g => [g.title, ...g.items]),
			...Object.values(STACK_COPY),
			ABOUT_TEAMS.text,
		].join('\n')
		expect(text).not.toMatch(/Senior|Lead|ментор|руководител|основател|фриланс|2017|2018|\d\s?%|\d+\+/i)
		expect(text).not.toMatch(/PostgreSQL|Redis|TypeScript|Alpine|Vite|Framer|WooCommerce|CI\/CD|amoCRM|Битрикс24|Reverb|Steam/)
		expect(text).not.toMatch(/NoRandoms/) // проекты — в портфолио, в представлении продукт отдельно не выделяется
	})

	it('мета — тексты ТЗ', () => {
		expect(SITE_META.about.title).toBe('Виктор Мацаков — веб-разработчик PHP, Laravel и React')
		expect(SITE_META.about.description).toMatch(/^Виктор Мацаков — full-stack разработчик\./)
	})

	it('ссылка на резюме — только на существующий PDF в public/', () => {
		// Публичной версии резюме нет — ссылки нет; когда владелец положит файл, указать путь в ABOUT_TEAMS.cv
		const cv = ABOUT_TEAMS.cv
		if (cv === undefined) return
		expect(cv).toMatch(/^\/[\w.-]+\.pdf$/)
		expect(existsSync(resolve(process.cwd(), 'public', cv.slice(1)))).toBe(true)
	})
})
