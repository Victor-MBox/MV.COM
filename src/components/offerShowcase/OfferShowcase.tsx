import { useEffect, useRef, useState } from 'react'
import type { MouseEvent, PointerEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { Offer } from '../../data/offers'
import { offerPath } from '../../data/offers'
import { MQ, useMediaQuery } from '../../hooks/useMediaQuery'
import Button from '../button/Button'
import Chip from '../chip/Chip'
import MiniUi from '../miniUi/MiniUi'
import type { MiniUiVariant } from '../miniUi/MiniUi'
import './OfferShowcase.scss'

export type ShowcaseItem = { key: MiniUiVariant; offer: Offer }

type Props = {
	/** Офферы в порядке SHOWCASE_ORDER; ключ — вариант мини-интерфейса */
	items: ShowcaseItem[]
	initial?: MiniUiVariant
}

/** Задержка переключения по ховеру против дрожания при проезде курсора через список */
const HOVER_DELAY = 60
const EASE_OUT = [0.2, 0.7, 0.2, 1] as const
const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const

/**
 * Витрина услуг по Portilo «What I do» (docs/design-spec-home4.md §5.2): слева список-переключатель, справа панель
 * активного оффера — номер маской, срок, мини-интерфейс и три строки. Переключение: pointerenter при pointer: fine,
 * focus и первый тап на тач-устройствах; все пункты — ссылки на страницу оффера. При reduced-motion — мгновенная подмена.
 */
export default function OfferShowcase({ items, initial }: Props) {
	const reduced = useMediaQuery(MQ.reduced)
	const hoverable = useMediaQuery(MQ.hover)
	const coarse = useMediaQuery(MQ.coarse)
	const [active, setActive] = useState<MiniUiVariant | undefined>(initial ?? items[0]?.key)
	const timer = useRef(0)
	// Последнее нажатие было пальцем (страхует media query pointer: coarse на гибридных устройствах)
	// и был ли пункт активен в момент нажатия: focus по тапу переключает панель раньше, чем придёт click
	const touch = useRef(false)
	const tapWasActive = useRef(false)

	useEffect(() => () => window.clearTimeout(timer.current), [])

	const current = items.find(i => i.key === active) ?? items[0]
	if (!current) return null
	const num = String(items.indexOf(current) + 1).padStart(2, '0')

	const select = (key: MiniUiVariant) => {
		window.clearTimeout(timer.current)
		setActive(key)
	}
	const onEnter = (key: MiniUiVariant) => {
		if (!hoverable || coarse) return
		window.clearTimeout(timer.current)
		timer.current = window.setTimeout(() => setActive(key), HOVER_DELAY)
	}
	const onLeave = () => window.clearTimeout(timer.current)
	const onPointerDown = (key: MiniUiVariant, e: PointerEvent) => {
		touch.current = e.pointerType === 'touch'
		tapWasActive.current = key === current.key
	}
	// На тач-устройствах первый тап только переключает панель, переход — вторым тапом или по «Подробнее»
	const onClick = (key: MiniUiVariant, e: MouseEvent) => {
		if ((coarse || touch.current) && !tapWasActive.current) {
			e.preventDefault()
			select(key)
		}
	}

	const fade = reduced
		? { initial: { opacity: 1 }, animate: { opacity: 1 }, exit: { opacity: 1 }, transition: { duration: 0 } }
		: {
				initial: { opacity: 0, y: 8 },
				animate: { opacity: 1, y: 0 },
				exit: { opacity: 0, transition: { duration: 0.12 } },
				transition: { duration: 0.24, ease: EASE_OUT },
			}

	return (
		<div className='offerShowcase'>
			<ul className='offerShowcase__list' role='list'>
				{items.map(({ key, offer }) => (
					<li key={key}>
						<Link
							to={offerPath(offer)}
							className={key === current.key ? 'offerShowcase__item is-active' : 'offerShowcase__item'}
							aria-current={key === current.key ? 'true' : undefined}
							onPointerEnter={() => onEnter(key)}
							onPointerLeave={onLeave}
							onPointerDown={e => onPointerDown(key, e)}
							onFocus={() => select(key)}
							onClick={e => onClick(key, e)}
						>
							{offer.title}
						</Link>
					</li>
				))}
			</ul>

			<div className='offerShowcase__panel miniUiHost' aria-live='polite'>
				<div className='offerShowcase__head'>
					<span className='offerShowcase__num' aria-hidden='true'>
						<AnimatePresence mode='wait' initial={false}>
							<motion.span
								key={num}
								className='offerShowcase__numInner'
								initial={reduced ? false : { y: '110%' }}
								animate={{ y: 0 }}
								exit={reduced ? { y: 0 } : { y: '-110%', transition: { duration: 0.2, ease: EASE_IN_OUT } }}
								transition={{ duration: 0.36, ease: EASE_IN_OUT }}
							>
								<span className='offerShowcase__digits'>{num}</span>
								<span className='offerShowcase__slash'>/</span>
							</motion.span>
						</AnimatePresence>
					</span>
					<AnimatePresence mode='wait' initial={false}>
						<motion.span key={current.key} className='offerShowcase__term' {...fade}>
							{current.offer.term}
						</motion.span>
					</AnimatePresence>
				</div>

				<AnimatePresence mode='wait' initial={false}>
					<motion.div key={current.key} className='offerShowcase__body' {...fade}>
						<div className='offerShowcase__slot'>
							<MiniUi variant={current.key} />
						</div>
						<dl className='offerShowcase__rows'>
							<div>
								<dt>что это</dt>
								<dd>{current.offer.line}</dd>
							</div>
							<div>
								<dt>цена</dt>
								<dd>
									{current.offer.prices
										? current.offer.prices.map(p => (
												<span key={p.label} className='offerShowcase__price'>
													{p.label} — {p.price}
												</span>
											))
										: current.offer.priceFrom}
								</dd>
							</div>
							<div>
								<dt>для кого</dt>
								<dd className='offerShowcase__chips'>
									{current.offer.forWhom.split(', ').map(w => (
										<Chip key={w}>{w}</Chip>
									))}
								</dd>
							</div>
						</dl>
						<Button variant='text' to={offerPath(current.offer)} className='offerShowcase__more'>
							Подробнее
						</Button>
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	)
}
