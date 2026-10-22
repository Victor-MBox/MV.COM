import { describe, expect, it } from 'vitest'
import { PROJECTS } from '../data/projects'
import type { PreviewLayer, PreviewPlacement } from '../data/projects'

/** Сцена обложки — 16:10 (CaseCard.scss): высота слоя в % сцены = ширина% × 1.6 × (h / w) */
const STAGE_RATIO = 16 / 10

const bottomOf = (layer: PreviewLayer, place: PreviewPlacement) => place.top + place.width * STAGE_RATIO * (layer.h / layer.w)

const inside = (layer: PreviewLayer, place: PreviewPlacement) => {
	expect(place.width).toBeGreaterThan(0)
	expect(place.left).toBeGreaterThanOrEqual(0)
	expect(place.top).toBeGreaterThanOrEqual(0)
	expect(place.left + place.width).toBeLessThanOrEqual(100)
	expect(bottomOf(layer, place)).toBeLessThanOrEqual(100)
}

describe('интерактивная обложка NoRandoms на главной (ТЗ от 22.10.2026)', () => {
	const preview = () => {
		const p = PROJECTS.find(p => p.slug === 'norandoms')?.preview
		if (!p) throw new Error('у кейса norandoms нет preview')
		return p
	}

	it('сцена подписана, слои — настоящие элементы интерфейса из папки preview, у каждого размер файла', () => {
		const { label, layers } = preview()
		expect(label).toMatch(/NoRandoms/)
		expect(layers.length).toBeGreaterThanOrEqual(3)
		layers.forEach(l => {
			expect(l.src).toMatch(/norandoms\/preview\//)
			expect(l.name).toBeTruthy()
			expect(l.w).toBeGreaterThan(0)
			expect(l.h).toBeGreaterThan(0)
		})
		expect(new Set(layers.map(l => l.src)).size).toBe(layers.length)
	})

	it('одна главная карточка — самая крупная, остаётся на телефоне вместе с одним соседним слоем', () => {
		const { layers } = preview()
		const main = layers.filter(l => l.main)
		expect(main.length).toBe(1)
		const area = (l: PreviewLayer) => l.width * (bottomOf(l, l) - l.top)
		layers.forEach(l => expect(area(main[0])).toBeGreaterThanOrEqual(area(l)))
		expect(main[0].phone).toBeTruthy()
		const phone = layers.filter(l => l.phone)
		expect(phone.length).toBeGreaterThanOrEqual(2)
		expect(phone.length).toBeLessThan(layers.length) // на телефоне раскладка проще
	})

	it('слои не выходят за границы сцены ни на десктопе, ни на телефоне', () => {
		preview().layers.forEach(l => {
			inside(l, l)
			if (l.phone) inside(l, l.phone)
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

	it('главная карточка не закрыта другими слоями по ширине текста: соседи слева и справа не пересекают её', () => {
		const { layers } = preview()
		const main = layers.find(l => l.main)!
		const mainIndex = layers.indexOf(main)
		layers.forEach((l, i) => {
			if (l === main || i < mainIndex) return // слои позади главной могут уходить под неё
			// ближние слои могут касаться только нижней кромки главной карточки (отступ под текстом), не её текста
			const overlapsX = l.left < main.left + main.width && l.left + l.width > main.left
			if (!overlapsX) return
			const textBottom = main.top + (bottomOf(main, main) - main.top) * 0.92
			expect(l.top).toBeGreaterThanOrEqual(textBottom)
		})
	})
})
