import { useState } from 'react'
import type { PointerEvent, ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './DimAccordion.scss'

export type DimItem = {
	id: string
	/** Номер слева, моно: «01» */
	number?: string
	title: string
	content: ReactNode
}

type Props = {
	items: DimItem[]
	/** Можно открыть несколько (FAQ); иначе открыт один (процесс) */
	multiple?: boolean
	defaultOpen?: string[]
	className?: string
	/** Префикс id панелей для aria-controls */
	idPrefix?: string
}

const EASE_OUT = [0.2, 0.7, 0.2, 1] as const

/**
 * Аккордеон с пригашиванием соседей по OKC (docs/design-spec.md §6.10): пока один пункт открыт или под курсором,
 * заголовки остальных уходят в --text-dim; панель раскрывается по высоте за 360 мс, текст — opacity/y с задержкой 120 мс.
 */
export default function DimAccordion({ items, multiple = false, defaultOpen = [], className, idPrefix = 'acc' }: Props) {
	const [open, setOpen] = useState<string[]>(defaultOpen)
	const [hovered, setHovered] = useState<string | null>(null)
	const dimmed = open.length > 0 || hovered !== null
	const numbered = items.some(i => i.number)

	const toggle = (id: string) => {
		setOpen(prev => {
			const isOpen = prev.includes(id)
			if (multiple) return isOpen ? prev.filter(x => x !== id) : [...prev, id]
			return isOpen ? [] : [id]
		})
	}

	const enter = (id: string) => (e: PointerEvent) => {
		if (e.pointerType === 'mouse') setHovered(id)
	}
	const leave = (e: PointerEvent) => {
		if (e.pointerType === 'mouse') setHovered(null)
	}

	return (
		<div className={['dimAcc', numbered ? '' : 'dimAcc--plain', className ?? ''].filter(Boolean).join(' ')} data-dimmed={dimmed}>
			{items.map(item => {
				const isOpen = open.includes(item.id)
				const panelId = `${idPrefix}-${item.id}`
				return (
					<div
						key={item.id}
						className={`dimAcc__item${isOpen ? ' is-open' : ''}`}
						onPointerEnter={enter(item.id)}
						onPointerLeave={leave}
					>
						<h3 className='dimAcc__head'>
							<button
								type='button'
								className='dimAcc__btn'
								aria-expanded={isOpen}
								aria-controls={panelId}
								onClick={() => toggle(item.id)}
							>
								{item.number && <span className='dimAcc__num'>{item.number}</span>}
								<span className='dimAcc__title'>{item.title}</span>
								<span className='dimAcc__icon' aria-hidden='true'>
									<i />
									<i />
								</span>
							</button>
						</h3>
						<AnimatePresence initial={false}>
							{isOpen && (
								<motion.div
									id={panelId}
									className='dimAcc__panel'
									initial={{ height: 0 }}
									animate={{ height: 'auto' }}
									exit={{ height: 0 }}
									transition={{ duration: 0.36, ease: EASE_OUT }}
								>
									<motion.div
										className='dimAcc__body'
										initial={{ opacity: 0, y: 8 }}
										animate={{ opacity: 1, y: 0, transition: { duration: 0.24, delay: 0.12, ease: EASE_OUT } }}
										exit={{ opacity: 0, y: 0, transition: { duration: 0.18 } }}
									>
										{item.content}
									</motion.div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				)
			})}
		</div>
	)
}
