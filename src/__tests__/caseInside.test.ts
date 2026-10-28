import { describe, expect, it } from 'vitest'
import { ARCH_NODES, INSIDE_CHAPTERS, INSIDE_STORIES, getInside, insidePath } from '../data/caseInside'
import type { InsideSceneKey } from '../data/caseInside'
import { PROJECTS } from '../data/projects'
import { ROUTE_PATHS } from '../app/routes'
import { chapterOf, clamp, seg, timelineAt } from '../components/caseInside/timeline'

const SCENE_KEYS: InsideSceneKey[] = ['problem', 'filters', 'match', 'seo', 'party', 'live', 'steam', 'mobile']

describe('кейс изнутри: NoRandoms', () => {
	it('страница есть у проекта norandoms и доступна по маршруту', () => {
		expect(getInside('norandoms')?.chapters).toBe(INSIDE_CHAPTERS)
		expect(getInside('nope')).toBeUndefined()
		expect(getInside(undefined)).toBeUndefined()
		expect(PROJECTS.some(p => p.slug === 'norandoms')).toBe(true)
		expect(insidePath('norandoms')).toBe('/portfolio/norandoms/inside')
		expect(ROUTE_PATHS as readonly string[]).toContain('/portfolio/:slug/inside')
		Object.keys(INSIDE_STORIES).forEach(slug => expect(PROJECTS.some(p => p.slug === slug)).toBe(true))
	})

	it('восемь глав: уникальные ключи со сценами, тексты без чисел, у каждой «как устроено» и «почему так»', () => {
		expect(INSIDE_CHAPTERS.length).toBe(8)
		const keys = INSIDE_CHAPTERS.map(c => c.key)
		expect(new Set(keys).size).toBe(keys.length)
		keys.forEach(k => expect(SCENE_KEYS).toContain(k))
		const labels = INSIDE_CHAPTERS.map(c => c.label)
		expect(new Set(labels).size).toBe(labels.length)
		INSIDE_CHAPTERS.forEach(c => {
			expect(c.title.length).toBeGreaterThan(10)
			expect(c.text.length).toBeGreaterThan(0)
			expect(c.how.length).toBeGreaterThanOrEqual(2)
			expect(c.why.length).toBeGreaterThan(20)
			expect(c.path).toMatch(/^\//)
			expect(c.scene.length).toBeGreaterThan(20)
			// Числа — только в финале страницы (content.md §4.7)
			;[...c.text, ...c.how, c.why, c.title].forEach(s => expect(/\d{3,}/.test(s)).toBe(false))
		})
	})

	it('архитектура: уникальные узлы, путь запроса из четырёх колонок подряд, у каждого узла причина', () => {
		const keys = ARCH_NODES.map(n => n.key)
		expect(new Set(keys).size).toBe(keys.length)
		const main = ARCH_NODES.filter(n => n.lane === 'main').map(n => n.col)
		expect(main).toEqual([0, 1, 2, 3])
		ARCH_NODES.forEach(n => {
			expect(n.col).toBeGreaterThanOrEqual(0)
			expect(n.col).toBeLessThanOrEqual(3)
			expect(n.what.length).toBeGreaterThan(10)
			expect(n.why.length).toBeGreaterThan(10)
		})
	})
})

describe('время сюжета', () => {
	it('clamp и seg', () => {
		expect(clamp(-1)).toBe(0)
		expect(clamp(2)).toBe(1)
		expect(seg(0.5, 0.25, 0.75)).toBe(0.5)
		expect(seg(0, 0.25, 0.75)).toBe(0)
		expect(seg(1, 0.25, 0.75)).toBe(1)
	})

	it('timelineAt: индекс главы плюс доля за линией; до первой главы — 0, после последней — число глав', () => {
		const rects = [
			{ top: 500, height: 400 },
			{ top: 900, height: 400 },
			{ top: 1300, height: 400 },
		]
		expect(timelineAt(rects, 300)).toBe(0)
		expect(timelineAt(rects, 500)).toBe(0)
		expect(timelineAt(rects, 700)).toBe(0.5)
		expect(timelineAt(rects, 1000)).toBe(1.25)
		expect(timelineAt(rects, 2000)).toBe(3)
	})

	it('chapterOf держит индекс в пределах глав', () => {
		expect(chapterOf(0, 3)).toBe(0)
		expect(chapterOf(1.9, 3)).toBe(1)
		expect(chapterOf(3, 3)).toBe(2)
		expect(chapterOf(-1, 3)).toBe(0)
	})
})
