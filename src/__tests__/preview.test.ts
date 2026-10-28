import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import postcss from 'postcss'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PROJECTS } from '../data/projects'
import type { PreviewPlacement } from '../data/projects'
import { PREVIEW_CANVAS, PREVIEW_KITS } from '../components/floatingPreview/kits'

/**
 * Интерактивная обложка NoRandoms (ТЗ от 22.10.2026; 28.10.2026 скриншоты заменены живой вёрсткой norandoms.team).
 * Размеры элементов известны только в браузере: что слои целиком внутри холста и не закрывают текст главной карточки,
 * проверяется Playwright (code.md §9), здесь — данные, набор и стили
 */
describe('интерактивная обложка NoRandoms', () => {
	const preview = () => {
		const p = PROJECTS.find(p => p.slug === 'norandoms')?.preview
		if (!p) throw new Error('у кейса norandoms нет preview')
		return p
	}
	const kit = () => PREVIEW_KITS[preview().kit]

	it('сцена подписана, каждый слой — элемент из набора, без повторов', () => {
		const { label, layers } = preview()
		expect(label).toMatch(/NoRandoms/)
		expect(layers.length).toBeGreaterThanOrEqual(3)
		const keys = Object.keys(kit().elements)
		layers.forEach(l => {
			expect(keys).toContain(l.element)
			expect(l.name).toBeTruthy()
		})
		expect(new Set(layers.map(l => l.element)).size).toBe(layers.length)
	})

	it('одна главная карточка, она остаётся на телефоне; на телефоне слоёв меньше', () => {
		const { layers } = preview()
		const main = layers.filter(l => l.main)
		expect(main.length).toBe(1)
		expect(main[0].phone).toBeTruthy()
		const phone = layers.filter(l => l.phone)
		expect(phone.length).toBeGreaterThanOrEqual(2)
		expect(phone.length).toBeLessThan(layers.length)
	})

	it('левый верхний угол слоёв — на холсте, заданная ширина не выходит за край, масштаб разумный', () => {
		const check = (place: PreviewPlacement, canvas: { w: number; h: number }) => {
			expect(place.x).toBeGreaterThanOrEqual(0)
			expect(place.y).toBeGreaterThanOrEqual(0)
			expect(place.x).toBeLessThan(canvas.w)
			expect(place.y).toBeLessThan(canvas.h)
			if (place.width) expect(place.x + place.width * (place.scale ?? 1)).toBeLessThanOrEqual(canvas.w)
			if (place.scale) {
				expect(place.scale).toBeGreaterThan(0.5) // мельче — текст на телефоне снова станет нечитаемым
				expect(place.scale).toBeLessThanOrEqual(1.5)
			}
		}
		preview().layers.forEach(l => {
			check(l, PREVIEW_CANVAS.desktop)
			if (l.phone) check(l.phone, PREVIEW_CANVAS.phone)
		})
	})

	it('глубина 0…1, у всех разная (разная скорость покачивания и параллакса), порядок — от дальнего к ближнему', () => {
		const depths = preview().layers.map(l => l.depth)
		depths.forEach(d => {
			expect(d).toBeGreaterThanOrEqual(0)
			expect(d).toBeLessThanOrEqual(1)
		})
		expect(new Set(depths).size).toBe(depths.length)
		expect([...depths].sort((a, b) => a - b)).toEqual(depths)
	})

	it('элементы — живая вёрстка с текстом, без ссылок, кнопок и заголовков (вся карточка кейса — одна ссылка)', () => {
		Object.entries(kit().elements).forEach(([key, node]) => {
			const html = renderToStaticMarkup(node)
			expect(html, key).not.toMatch(/<(a|button|h[1-6]|article|ul|li)[\s>]/)
			expect(html.replace(/<[^>]+>/g, '').trim().length, key).toBeGreaterThan(0)
		})
	})

	it('стили обложки (nr-cover.css) целиком под корнем .nr-cover — не протекают на сайт', () => {
		const css = readFileSync(resolve('src/components/floatingPreview/norandoms/nr-cover.css'), 'utf8')
		expect(kit().className).toBe('nr-cover')
		let rules = 0
		postcss.parse(css).walkRules(rule => {
			if (rule.parent?.type === 'atrule' && /keyframes/.test((rule.parent as postcss.AtRule).name)) return
			rule.selectors.forEach(sel => expect(sel, sel).toMatch(/^\.nr-cover(?=[\s.:[]|$)/))
			rules++
		})
		expect(rules).toBeGreaterThan(50)
	})
})
