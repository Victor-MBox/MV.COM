import { clamp } from '../caseStory/storyMath'

/**
 * Чистая математика стопки карточек кейсов (CaseStack, 30.10.2026): где каждая карточка залипает, какой высоты её ячейка
 * и насколько её уже закрыла следующая. Всё в px окна; DOM и прокрутка — в компоненте
 */

export type StackInput = {
	/** Высоты карточек сверху вниз */
	cards: number[]
	/** Высота окна */
	vh: number
	/** Высота липкой шапки */
	header: number
	/** На сколько каждая следующая карточка залипает ниже предыдущей — из-под неё виден край стопки */
	peek: number
	/** Минимальный зазор до шапки и до низа окна */
	gap: number
	/** Подъём над центром, доля окна: стопка стоит чуть выше середины */
	lift: number
}

export type StackLayout = {
	/** Общая высота карточек в стопке — по самой высокой: нижняя карточка не торчит из-под верхней */
	card: number
	/** `top` залипания каждой ячейки */
	tops: number[]
	/**
	 * Высота ячейки: все ячейки кончаются на одной линии — стопка отпускает залипание целиком, и край нижних карточек
	 * виден до конца (иначе первая карточка уезжала бы на `peek` раньше последней)
	 */
	slots: number[]
}

/**
 * Раскладка стопки. Первая карточка встаёт по центру области под шапкой, поднятая на `lift`; каждая следующая — на `peek`
 * ниже. Если карточки не помещаются целиком, стопка поднимается так, чтобы был виден низ последней (верх высокой карточки
 * уходит под шапку — его уже прочитали). null — стопки нет: меньше двух карточек или карточка выше окна в 1,25 раза
 */
export function stackLayout({ cards, vh, header, peek, gap, lift }: StackInput): StackLayout | null {
	if (cards.length < 2 || cards.some(h => h > vh * 1.25)) return null
	const card = Math.max(...cards)
	const last = cards.length - 1
	const centered = header + Math.max(gap, (vh - header - card) / 2 - vh * lift)
	const base = Math.min(centered, vh - gap - card - last * peek)
	const tops = cards.map((_, i) => base + i * peek)
	const release = tops[last] + card
	return { card, tops, slots: tops.map(t => release - t) }
}

/**
 * Насколько карточку закрыла следующая, 0…1: 0 — следующая ещё не дошла до её низа, 1 — легла сверху (её верх на `peek`
 * ниже верха этой). Аргументы — текущие верхи обеих карточек в окне
 */
export const coverShare = (top: number, height: number, nextTop: number, peek: number) =>
	height > peek ? clamp((top + height - nextTop) / (height - peek)) : 0
