import { describe, expect, it } from 'vitest'
import { NORANDOMS_STORY } from '../data/caseStory'
import type { StoryRange } from '../data/caseStory'
import { LAPTOP, PHONE, screenStyle } from '../data/devices'
import { PROJECTS } from '../data/projects'
import { activeChapter, cameraTransform, fitCamera, restCamera } from '../components/caseStory/storyMath'

const story = NORANDOMS_STORY
const screen = (key: string) => story.screens.find(s => s.key === key)
const validRange = (r: StoryRange) => {
	expect(r[0]).toBeGreaterThanOrEqual(0)
	expect(r[1]).toBeGreaterThan(r[0])
	expect(r[1]).toBeLessThanOrEqual(1.01)
}

describe('сюжет кейса NoRandoms', () => {
	it('подключён к проекту, семь глав с уникальными метками, цифры показываются один раз', () => {
		expect(PROJECTS.find(p => p.slug === 'norandoms')?.story).toBe(story)
		expect(story.chapters.length).toBe(7)
		const labels = story.chapters.map(c => c.label)
		expect(new Set(labels).size).toBe(labels.length)
		expect(story.chapters.filter(c => c.metrics).length).toBe(1)
		expect(story.chapters.at(-1)?.metrics).toBe(true)
		story.chapters.forEach(c => {
			expect(c.title.length).toBeGreaterThan(5)
			expect(c.text.length).toBeGreaterThan(0)
			c.text.forEach(t => expect(/\d{3,}/.test(t)).toBe(false)) // числа — только в метриках
		})
	})

	it('экраны уникальны, у каждого шага и подсветки существующий экран, прокрутка в пределах контента', () => {
		const keys = story.screens.map(s => s.key)
		expect(new Set(keys).size).toBe(keys.length)
		story.screens.forEach(s => {
			expect(s.view).toBeTruthy()
			if (s.content) expect(s.contentHeight).toBeGreaterThan(900)
		})
		story.chapters.forEach(c => {
			expect(c.steps.length).toBeGreaterThan(0)
			c.steps.forEach(st => {
				const s = screen(st.screen)
				expect(s).toBeTruthy()
				if (st.p) validRange(st.p)
				const max = (s?.contentHeight ?? 900) - 900
				;[st.from ?? 0, st.to ?? 0].forEach(v => {
					expect(v).toBeGreaterThanOrEqual(0)
					expect(v).toBeLessThanOrEqual(Math.max(max, 0))
				})
			})
			const stepScreens = c.steps.map(st => st.screen)
			c.highlights?.forEach(h => {
				expect(stepScreens).toContain(h.screen)
				validRange(h.p)
				expect(h.label).toBeTruthy()
				const s = screen(h.screen)!
				const [maxW, maxH] = h.view || !s.content ? [1440, 900] : [1099, s.contentHeight!]
				expect(h.x + h.w).toBeLessThanOrEqual(maxW)
				expect(h.y + h.h).toBeLessThanOrEqual(maxH)
			})
			c.camera?.forEach(cam => {
				validRange(cam.p)
				expect(cam.zoom).toBeGreaterThan(1)
				expect(cam.zoom).toBeLessThanOrEqual(2)
			})
			if (c.click) {
				expect(c.click.at).toBeGreaterThanOrEqual(c.click.p[1])
				expect(c.click.panel.x + c.click.panel.w).toBeLessThanOrEqual(1440)
				expect(c.click.panel.y + c.click.panel.h).toBeLessThanOrEqual(900)
			}
			// Экран телефона не должен уезжать за конец контента: видимая область холста — от низа шапки до низа холста
			const phoneMax = story.phone.contentHeight - (PHONE.canvas.h - PHONE.canvas.top - story.phone.headerHeight)
			;[...(c.phone ?? []), ...c.phoneMobile].forEach(v => {
				expect(v).toBeGreaterThanOrEqual(0)
				expect(v).toBeLessThanOrEqual(phoneMax)
			})
		})
	})

	it('телефон: шапка, контент и навигация на холсте', () => {
		const { phone } = story
		expect(phone.headerHeight).toBeGreaterThan(0)
		expect(phone.nav.y + phone.nav.h).toBeLessThanOrEqual(PHONE.canvas.h)
		expect(phone.nav.x + phone.nav.w).toBeLessThanOrEqual(PHONE.canvas.w)
		expect(PHONE.canvas.top + phone.headerHeight).toBeLessThan(phone.nav.y)
	})
})

describe('мокапы устройств', () => {
	it('холст повторяет пропорции дыры экрана, остров внутри экрана', () => {
		;[LAPTOP, PHONE].forEach(d => {
			const hole = d.screen.w / d.screen.h
			const canvas = d.canvas.w / d.canvas.h
			expect(Math.abs(hole - canvas) / hole).toBeLessThan(0.003)
			expect(d.screen.x + d.screen.w).toBeLessThanOrEqual(d.w)
			expect(d.screen.y + d.screen.h).toBeLessThanOrEqual(d.h)
			if (d.island) {
				expect(d.island.x).toBeGreaterThanOrEqual(d.screen.x)
				expect(d.island.x + d.island.w).toBeLessThanOrEqual(d.screen.x + d.screen.w)
				// зона под островом на холсте не меньше высоты острова в масштабе холста
				const k = d.canvas.w / d.screen.w
				expect(d.canvas.top).toBeGreaterThanOrEqual((d.island.y + d.island.h - d.screen.y) * k - 1)
			}
		})
		expect(screenStyle(PHONE).left).toMatch(/%$/)
	})
})

describe('математика сцены', () => {
	it('активная глава — последняя, прошедшая линию; p в её пределах', () => {
		const rects = [
			{ top: -500, height: 600 },
			{ top: 100, height: 600 },
			{ top: 700, height: 600 },
		]
		expect(activeChapter(rects, 400)).toEqual({ index: 1, p: 0.5 })
		expect(activeChapter(rects, 50)).toEqual({ index: 0, p: expect.closeTo(0.917, 2) })
		expect(activeChapter([{ top: 900, height: 600 }], 400)).toEqual({ index: 0, p: 0 })
	})

	it('камера не увеличивает сильнее zoom и не меньше 1, холст всегда покрывает экран', () => {
		const canvas = LAPTOP.canvas
		const screen = { w: 600, h: 361.7 }
		const rest = restCamera(canvas)
		const t0 = cameraTransform(rest, canvas, screen)
		expect(t0.s).toBeCloseTo(600 / 1440, 5)
		expect(t0.tx).toBeCloseTo(0, 5)
		expect(t0.ty).toBeCloseTo(0, 5)

		const small = fitCamera({ x: 1004, y: 307, w: 58, h: 50 }, canvas, 1.6)
		expect(small.z).toBe(1.6)
		const wide = fitCamera({ x: 0, y: 0, w: 1400, h: 800 }, canvas, 2)
		expect(wide.z).toBe(1)

		const corner = cameraTransform({ z: 1.5, cx: 1400, cy: 850 }, canvas, screen)
		expect(corner.tx).toBeCloseTo(screen.w - canvas.w * corner.s, 5)
		expect(corner.ty).toBeCloseTo(screen.h - canvas.h * corner.s, 5)
		const top = cameraTransform({ z: 1.5, cx: 40, cy: 20 }, canvas, screen)
		expect(top.tx).toBe(0)
		expect(top.ty).toBe(0)
	})
})
