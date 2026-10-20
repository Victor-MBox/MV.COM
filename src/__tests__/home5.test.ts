import { describe, expect, it } from 'vitest'
import {
	ABOUT,
	BLOG_LIMIT,
	CONTACT_CHANNELS,
	CONTACT_HEAD,
	FEATURED_CASE,
	HERO,
	HOME_SERVICES,
	META,
	NAV,
	PROCESS_STEPS,
	PROJECTS_HEAD,
	SECTIONS,
	SIDE_PROJECTS_MAX,
	featuredProject,
	latestPosts,
	sideProjects,
} from '../data/home5'
import { PROOF } from '../data/home'
import { OFFERS, offerPath } from '../data/offers'
import { PROJECTS } from '../data/projects'
import { POSTS } from '../data/posts'
import { CONTACT_LINKS } from '../data/contacts'
import { ROUTE_PATHS } from '../app/routes'

describe('home5: главная по ТЗ «Minimal editorial»', () => {
	it('ссылки шапки и футера ведут на существующие маршруты и не повторяются', () => {
		const paths = ROUTE_PATHS as readonly string[]
		NAV.forEach(item => expect(paths).toContain(item.to))
		expect(new Set(NAV.map(item => item.to)).size).toBe(NAV.length)
		expect(NAV.map(item => item.label)).toEqual(['Проекты', 'Услуги', 'Обо мне', 'Блог', 'Контакты'])
	})

	it('подписи секций пронумерованы 01–06 без пропусков', () => {
		const nums = Object.values(SECTIONS).map(s => s.num)
		expect(nums).toEqual(['01', '02', '03', '04', '05', '06'])
		const ids = Object.values(SECTIONS).map(s => s.id)
		expect(new Set(ids).size).toBe(ids.length)
	})

	it('hero: H1 в две строки с акцентной второй, факты — из PROOF и не повторяются в остальных текстах', () => {
		expect(HERO.title.length).toBe(2)
		expect(HERO.title[HERO.accentLine]).toBe('Весь проект.')
		expect(HERO.facts.map(f => f.value)).toEqual([PROOF[0].value, PROOF[1].value])
		const elsewhere = [...ABOUT.paragraphs, FEATURED_CASE.description, ...HOME_SERVICES.map(s => s.text), ...PROCESS_STEPS.map(s => s.text)].join(' ')
		HERO.facts.forEach(f => expect(elsewhere).not.toContain(f.value))
	})

	it('главный кейс — реальная запись PROJECTS со скриншотами; дополнительных не больше двух и только из PROJECTS', () => {
		const main = featuredProject()
		expect(main?.slug).toBe(FEATURED_CASE.slug)
		expect(main?.showcase?.[0]?.src).toBeTruthy()
		expect(FEATURED_CASE.tech.length).toBeGreaterThanOrEqual(1)
		expect(FEATURED_CASE.tech.length).toBeLessThanOrEqual(3)
		const side = sideProjects()
		expect(side.length).toBeLessThanOrEqual(SIDE_PROJECTS_MAX)
		expect(side.length).toBe(Math.min(SIDE_PROJECTS_MAX, PROJECTS.length - 1))
		side.forEach(p => expect(p.slug).not.toBe(main?.slug))
		expect(PROJECTS_HEAD.title.length).toBe(2)
	})

	it('три услуги — направления, не технологии; ссылки ведут на /services или существующий оффер', () => {
		expect(HOME_SERVICES.length).toBe(3)
		expect(HOME_SERVICES.map(s => s.num)).toEqual(['01', '02', '03'])
		const offerPaths = OFFERS.map(o => offerPath(o))
		HOME_SERVICES.forEach(s => {
			expect(s.to === '/services' || offerPaths.includes(s.to)).toBe(true)
			expect(s.title).not.toMatch(/WordPress|Laravel|React|PHP|JavaScript/)
		})
	})

	it('процесс — четыре шага 01–04 с названием и одним предложением', () => {
		expect(PROCESS_STEPS.map(s => s.num)).toEqual(['01', '02', '03', '04'])
		PROCESS_STEPS.forEach(s => {
			expect(s.title.length).toBeGreaterThan(3)
			expect(s.text.length).toBeGreaterThan(20)
		})
	})

	it('блог показывает не больше трёх последних статей по убыванию даты', () => {
		const posts = latestPosts()
		expect(posts.length).toBe(Math.min(BLOG_LIMIT, POSTS.length))
		for (let i = 1; i < posts.length; i++) {
			expect(Date.parse(posts[i - 1].date)).toBeGreaterThanOrEqual(Date.parse(posts[i].date))
		}
	})

	it('каналы связи — ключи CONTACT_LINKS, заголовок финала в две строки, «Обо мне» без чисел', () => {
		CONTACT_CHANNELS.forEach(key => expect(CONTACT_LINKS[key]).toMatch(/^(https?:|mailto:)/))
		expect(new Set(CONTACT_CHANNELS).size).toBe(CONTACT_CHANNELS.length)
		expect(CONTACT_HEAD.title.length).toBe(2)
		ABOUT.paragraphs.forEach(p => expect(p).not.toMatch(/\d/))
		expect(ABOUT.stack.length).toBeGreaterThan(2)
	})

	it('SEO: title и description главной по ТЗ §18', () => {
		expect(META.title).toBe('Виктор Мацаков — разработка сайтов и веб-сервисов')
		expect(META.description.length).toBeLessThanOrEqual(160)
		expect(META.description).toContain('Виктор Мацаков')
	})
})
