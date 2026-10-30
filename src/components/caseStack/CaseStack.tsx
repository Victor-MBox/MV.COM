import { Children, useEffect, useRef } from 'react'
import type { ReactNode } from 'react'
import Reveal from '../reveal/Reveal'
import { MQ, useMediaQuery } from '../../hooks/useMediaQuery'
import { coverShare, stackLayout } from './stackMath'
import './CaseStack.scss'

type Props = {
	/** Карточки кейсов сверху вниз (обычно CaseCard) — каждая оборачивается в ячейку стопки */
	children: ReactNode
	className?: string
}

/** На сколько следующая карточка залипает ниже предыдущей: из-под неё виден край стопки; на ≤992 — меньше */
const PEEK = 16
const PEEK_TABLET = 12
/** Зазор до шапки и до низа окна */
const GAP = 16
/** Стопка стоит чуть выше середины окна: подъём над центром, доля высоты окна */
const LIFT = 0.08
/** Когда последняя карточка легла, стопка ещё держится на месте столько прокрутки, доля окна */
const DWELL = 0.12

/**
 * Карточки кейсов стопкой (30.10.2026, правка владельца — главная и портфолио): при прокрутке первая карточка залипает
 * чуть выше середины окна, следующая наезжает на неё снизу и ложится сверху на `PEEK` ниже, закрытая карточка немного
 * уменьшается и темнеет — получается стопка. Залипание — CSS sticky (плавно и на телефоне), скрипт только раскладывает:
 * `top` и высоту ячеек, общую высоту карточек (по самой высокой) и `--cover` (насколько карточку закрыла следующая) — на
 * прокрутке, без React. Одна карточка, reduced-motion или карточка выше окна в 1,25 раза — обычный список
 */
export default function CaseStack({ children, className }: Props) {
	const listRef = useRef<HTMLUListElement>(null)
	const reduced = useMediaQuery(MQ.reduced)
	const items = Children.toArray(children)
	const count = items.length

	useEffect(() => {
		const list = listRef.current
		if (!list || reduced || count < 2) return
		const cells = Array.from(list.children) as HTMLElement[]
		const cards = cells.map(c => c.firstElementChild as HTMLElement)
		let card = 0
		let peek = PEEK
		let on = false
		let raf = 0
		let measureRaf = 0

		const reset = () => {
			list.classList.remove('is-stacked')
			list.style.removeProperty('--stack-card-h')
			list.style.removeProperty('--stack-dwell')
			cells.forEach(c => {
				c.style.removeProperty('top')
				c.style.removeProperty('height')
			})
			cards.forEach(c => c.style.removeProperty('--cover'))
		}

		// Насколько каждую карточку закрыла следующая — от текущих верхов ячеек
		const update = () => {
			raf = 0
			if (!on) return
			const tops = cells.map(c => c.getBoundingClientRect().top)
			cards.forEach((c, i) => {
				const p = i < cards.length - 1 ? coverShare(tops[i], card, tops[i + 1], peek) : 0
				c.style.setProperty('--cover', p.toFixed(3))
			})
		}

		// Раскладка: естественные высоты карточек (без общей высоты), затем top и высота ячеек
		const measure = () => {
			measureRaf = 0
			const vh = window.innerHeight
			const header = parseFloat(getComputedStyle(list).getPropertyValue('--header-h')) || 0
			peek = window.matchMedia(MQ.tablet).matches ? PEEK_TABLET : PEEK
			list.style.removeProperty('--stack-card-h')
			const layout = stackLayout({ cards: cards.map(c => c.offsetHeight), vh, header, peek, gap: GAP, lift: LIFT })
			on = !!layout
			if (!layout) return reset()
			card = layout.card
			list.classList.add('is-stacked')
			list.style.setProperty('--stack-card-h', `${card}px`)
			list.style.setProperty('--stack-dwell', `${Math.round(vh * DWELL)}px`)
			cells.forEach((c, i) => {
				c.style.top = `${layout.tops[i].toFixed(1)}px`
				c.style.height = `${layout.slots[i].toFixed(1)}px`
			})
			update()
		}

		const schedule = () => {
			if (!raf) raf = requestAnimationFrame(update)
		}
		// Размеры меняются от ширины и шрифтов; замер — в следующем кадре, а не прямо в колбэке ResizeObserver
		const remeasure = () => {
			if (!measureRaf) measureRaf = requestAnimationFrame(measure)
		}
		const ro = new ResizeObserver(remeasure)
		ro.observe(list)
		window.addEventListener('scroll', schedule, { passive: true })
		window.addEventListener('resize', remeasure)
		document.fonts?.ready.then(remeasure)
		measure()

		return () => {
			cancelAnimationFrame(raf)
			cancelAnimationFrame(measureRaf)
			ro.disconnect()
			window.removeEventListener('scroll', schedule)
			window.removeEventListener('resize', remeasure)
			reset()
		}
	}, [reduced, count])

	return (
		<ul className={['caseStack', className].filter(Boolean).join(' ')} ref={listRef}>
			{items.map((child, i) => (
				<Reveal as='li' className='caseStack__item' key={(child as { key?: string }).key ?? i} index={i}>
					<div className='caseStack__card'>{child}</div>
				</Reveal>
			))}
		</ul>
	)
}
