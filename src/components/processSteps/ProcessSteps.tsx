import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { ProcessStep } from '../../data/services'
import './ProcessSteps.scss'

type Props = { steps: ProcessStep[] }

/** Интерактивные этапы работы: список слева, подробности и картинка справа */
export default function ProcessSteps({ steps }: Props) {
	const [active, setActive] = useState(0)
	const step = steps[active]

	return (
		<div className='steps'>
			<ol className='steps__list'>
				{steps.map((s, i) => (
					<li key={s.title}>
						<button
							type='button'
							className={`steps__item${i === active ? ' is-active' : ''}`}
							onClick={() => setActive(i)}
							aria-current={i === active ? 'step' : undefined}
						>
							<span className='steps__num'>{String(i + 1).padStart(2, '0')}</span>
							<span className='steps__title'>{s.title}</span>
						</button>
					</li>
				))}
			</ol>

			<div className='steps__panel'>
				<AnimatePresence mode='wait' initial={false}>
					<motion.div
						key={step.title}
						className='steps__content'
						initial={{ opacity: 0, x: 16 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -12 }}
						transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
					>
						<div className='steps__image'>
							<img src={step.image} alt='' loading='lazy' />
						</div>
						<div className='steps__text'>
							<span className='steps__label'>
								Этап {active + 1} из {steps.length}
							</span>
							<h3>{step.title}</h3>
							<p>{step.text}</p>
							<div className='steps__nav'>
								<button type='button' disabled={active === 0} onClick={() => setActive(a => a - 1)}>
									← Назад
								</button>
								<button
									type='button'
									disabled={active === steps.length - 1}
									onClick={() => setActive(a => a + 1)}
								>
									Дальше →
								</button>
							</div>
						</div>
					</motion.div>
				</AnimatePresence>
			</div>
		</div>
	)
}
