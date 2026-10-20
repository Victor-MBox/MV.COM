import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Experience } from '../../../data/experience'

type Props = {
	item: Experience
	number: string
}

const EASE = [0.2, 0.7, 0.2, 1] as const

/** Строка опыта по Zolt (docs/design-spec.md §7.5): номер · период / должность · компания / резюме, детали в аккордеоне «подробнее» без пригашивания */
export default function ExperienceRow({ item, number }: Props) {
	const [open, setOpen] = useState(false)
	const id = `exp-${number}`

	return (
		<div className='expRow'>
			<p className='expRow__meta'>
				<span className='expRow__num'>{number}</span>
				<span className='expRow__period'>{item.period}</span>
			</p>
			<div className='expRow__body'>
				<h3 className='expRow__position'>{item.position}</h3>
				<p className='expRow__company'>{item.company}</p>
				<p className='expRow__summary'>{item.summary}</p>
				<button
					type='button'
					className='expRow__more'
					aria-expanded={open}
					aria-controls={id}
					onClick={() => setOpen(v => !v)}
				>
					подробнее
					<span aria-hidden='true'>{open ? '−' : '+'}</span>
				</button>
				<AnimatePresence initial={false}>
					{open && (
						<motion.div
							id={id}
							className='expRow__panel'
							initial={{ height: 0, opacity: 0 }}
							animate={{ height: 'auto', opacity: 1 }}
							exit={{ height: 0, opacity: 0 }}
							transition={{ duration: 0.36, ease: EASE }}
						>
							<ul className='expRow__details'>
								{item.details.map(d => (
									<li key={d}>{d}</li>
								))}
							</ul>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	)
}
