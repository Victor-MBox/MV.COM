import { describe, expect, it } from 'vitest'
import { coverShare, stackLayout } from '../components/caseStack/stackMath'

const base = { vh: 900, header: 72, peek: 16, gap: 16, lift: 0.08 }

describe('стопка карточек кейсов: раскладка', () => {
	it('одна карточка или карточка выше окна в 1,25 раза — стопки нет', () => {
		expect(stackLayout({ ...base, cards: [471] })).toBeNull()
		expect(stackLayout({ ...base, cards: [471, 1200] })).toBeNull()
	})

	it('десктоп: первая карточка чуть выше середины окна, следующая на peek ниже, высота общая — по самой высокой', () => {
		const l = stackLayout({ ...base, cards: [471, 493] })!
		expect(l.card).toBe(493)
		expect(l.tops[1] - l.tops[0]).toBe(16)
		// Центр стопки выше середины окна, но под шапкой
		expect(l.tops[0]).toBeGreaterThan(base.header + base.gap - 0.001)
		expect(l.tops[0] + l.card / 2).toBeLessThan(base.vh / 2)
	})

	it('ячейки кончаются на одной линии — стопка уходит целиком; низ последней карточки в окне', () => {
		const l = stackLayout({ ...base, cards: [471, 493, 480] })!
		const ends = l.tops.map((t, i) => t + l.slots[i])
		expect(new Set(ends.map(e => e.toFixed(6))).size).toBe(1)
		expect(l.slots.every(s => s >= l.card)).toBe(true)
		expect(l.tops[2] + l.card).toBeLessThanOrEqual(base.vh - base.gap)
	})

	it('высокая карточка (телефон): стопка поднимается, чтобы был виден низ последней', () => {
		const l = stackLayout({ vh: 844, header: 56, peek: 12, gap: 16, lift: 0.08, cards: [772, 772] })!
		expect(l.tops[1] + l.card).toBeCloseTo(844 - 16, 6)
		expect(l.tops[0]).toBeLessThan(56)
	})
})

describe('стопка карточек кейсов: насколько закрыта карточка', () => {
	it('0 — следующая ещё ниже её низа, 1 — легла на peek ниже, в пределах 0…1', () => {
		expect(coverShare(180, 470, 700, 16)).toBe(0)
		expect(coverShare(180, 470, 196, 16)).toBe(1)
		expect(coverShare(180, 470, 100, 16)).toBe(1)
		expect(coverShare(180, 470, 180 + 470 - 227, 16)).toBeCloseTo(0.5, 6)
		expect(coverShare(0, 10, 0, 16)).toBe(0)
	})
})
