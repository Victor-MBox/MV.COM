import { useState } from 'react'
import type { KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useContactModal } from '../contactModal/ContactModalContext'
import { AUDIENCES } from '../../data/home2'
import './AudienceTabs.scss'

const EASE = [0.2, 0.7, 0.2, 1] as const

/**
 * «Кому я нужен» (концепт H): табы аудиторий слева, панель с цветным свечением справа.
 * Панель тёмная в обеих темах, как цветные плитки офферов. Кнопка панели открывает форму с темой
 * оффера или ведёт на резюме (HR). Стрелки на клавиатуре переключают табы
 */
export default function AudienceTabs() {
	const [index, setIndex] = useState(0)
	const { open } = useContactModal()
	const active = AUDIENCES[index]

	const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
		const step = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0
		if (!step) return
		e.preventDefault()
		const next = (index + step + AUDIENCES.length) % AUDIENCES.length
		setIndex(next)
		document.getElementById(`audience-tab-${AUDIENCES[next].id}`)?.focus()
	}

	return (
		<div className='audienceTabs'>
			<div className='audienceTabs__list' role='tablist' aria-label='Кому я нужен' onKeyDown={onKeyDown}>
				{AUDIENCES.map((a, i) => {
					const on = i === index
					return (
						<button
							key={a.id}
							id={`audience-tab-${a.id}`}
							role='tab'
							type='button'
							aria-selected={on}
							aria-controls={`audience-panel-${a.id}`}
							tabIndex={on ? 0 : -1}
							className={`audienceTabs__tab audienceTabs__tab--${a.tone}${on ? ' is-active' : ''}`}
							onClick={() => setIndex(i)}
						>
							{a.label}
						</button>
					)
				})}
			</div>

			<div
				className={`audienceTabs__panel audienceTabs__panel--${active.tone}`}
				role='tabpanel'
				id={`audience-panel-${active.id}`}
				aria-labelledby={`audience-tab-${active.id}`}
			>
				{AUDIENCES.map(a => (
					<motion.div
						key={a.id}
						className={`audienceTabs__glow audienceTabs__glow--${a.tone}`}
						initial={false}
						animate={{ opacity: a.id === active.id ? 1 : 0 }}
						transition={{ duration: 0.6 }}
						aria-hidden='true'
					/>
				))}
				<div className='audienceTabs__grain' aria-hidden='true' />

				<motion.div
					key={active.id}
					className='audienceTabs__content'
					initial={{ opacity: 0, y: 12 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.45, ease: EASE }}
				>
					<div className='audienceTabs__body'>
						<h3 className='audienceTabs__title'>{active.title}</h3>
						<p className='audienceTabs__text'>{active.text}</p>
						<div className='audienceTabs__actions'>
							{active.cta.href ? (
								<a className='audienceTabs__cta' href={active.cta.href} download={active.cta.download}>
									{active.cta.label}
								</a>
							) : (
								<button className='audienceTabs__cta' type='button' onClick={() => open(active.cta.topic)}>
									{active.cta.label}
								</button>
							)}
							<Link to={active.link.to} className='audienceTabs__link'>
								{active.link.label}
							</Link>
						</div>
					</div>

					<ul className='audienceTabs__items'>
						{active.items.map(item => (
							<li key={item}>
								<svg
									viewBox='0 0 24 24'
									fill='none'
									stroke='currentColor'
									strokeWidth='2.2'
									strokeLinecap='round'
									strokeLinejoin='round'
									aria-hidden='true'
								>
									<path d='M5 12.5l4.5 4.5L19 7.5' />
								</svg>
								{item}
							</li>
						))}
					</ul>
				</motion.div>
			</div>
		</div>
	)
}
