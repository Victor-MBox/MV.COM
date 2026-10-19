import { useId, useState } from 'react'
import type { ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import './Accordion.scss'

export type AccordionItem = {
	key: string
	head: ReactNode
	body: ReactNode
	meta?: ReactNode
}

type Props = {
	items: AccordionItem[]
	defaultOpen?: string
	className?: string
}

export default function Accordion({ items, defaultOpen, className = '' }: Props) {
	const [openKey, setOpenKey] = useState<string | null>(defaultOpen ?? null)
	const baseId = useId()

	return (
		<ul className={`accordion ${className}`.trim()}>
			{items.map(item => {
				const isOpen = openKey === item.key
				const panelId = `${baseId}-${item.key}`
				return (
					<li key={item.key} className={`accordion__item${isOpen ? ' is-open' : ''}`}>
						<button
							type='button'
							className='accordion__head'
							aria-expanded={isOpen}
							aria-controls={panelId}
							onClick={() => setOpenKey(isOpen ? null : item.key)}
						>
							{item.meta && <span className='accordion__meta'>{item.meta}</span>}
							<span className='accordion__title'>{item.head}</span>
							<span className='accordion__icon' aria-hidden='true'>
								<svg viewBox='0 0 24 24'>
									<path d='M12 5v14M5 12h14' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
								</svg>
							</span>
						</button>
						<AnimatePresence initial={false}>
							{isOpen && (
								<motion.div
									id={panelId}
									className='accordion__panel'
									initial={{ height: 0, opacity: 0 }}
									animate={{ height: 'auto', opacity: 1 }}
									exit={{ height: 0, opacity: 0 }}
									transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
								>
									<div className='accordion__body'>{item.body}</div>
								</motion.div>
							)}
						</AnimatePresence>
					</li>
				)
			})}
		</ul>
	)
}
