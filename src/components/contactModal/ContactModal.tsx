import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useContactModal } from './ContactModalContext'
import ContactForm from '../contactForm/ContactForm'
import LeadForm from '../leadForm/LeadForm'
import { isV2Route } from '../../app/routes'
import './ContactModal.scss'

export default function ContactModal() {
	const { isOpen, topic, close } = useContactModal()
	const dialogRef = useRef<HTMLDivElement>(null)
	// /home3 и /home4 живут на дизайн-системе 1.0 — форма с намерениями (docs/design-spec.md §6.13)
	const isV2 = isV2Route(useLocation().pathname)

	// Esc закрывает, скролл страницы блокируется, фокус уходит в окно
	useEffect(() => {
		if (!isOpen) return
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') close()
		}
		document.addEventListener('keydown', onKey)
		const prevOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		const t = window.setTimeout(() => {
			dialogRef.current?.querySelector<HTMLElement>('input, textarea, button')?.focus()
		}, 50)
		return () => {
			document.removeEventListener('keydown', onKey)
			document.body.style.overflow = prevOverflow
			window.clearTimeout(t)
		}
	}, [isOpen, close])

	return createPortal(
		<AnimatePresence>
			{isOpen && (
				<motion.div
					className='modal'
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.2 }}
					onMouseDown={e => {
						if (e.target === e.currentTarget) close()
					}}
				>
					<motion.div
						ref={dialogRef}
						className='modal__dialog'
						role='dialog'
						aria-modal='true'
						aria-labelledby='contact-modal-title'
						initial={{ opacity: 0, y: 24, scale: 0.98 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 16, scale: 0.98 }}
						transition={{ type: 'spring', stiffness: 320, damping: 28 }}
					>
						<button
							type='button'
							className='modal__close'
							onClick={close}
							aria-label='Закрыть окно'
						>
							<svg viewBox='0 0 24 24' aria-hidden='true'>
								<path
									d='M6 6l12 12M18 6L6 18'
									stroke='currentColor'
									strokeWidth='2'
									strokeLinecap='round'
								/>
							</svg>
						</button>

						<div className='modal__head'>
							<h2 id='contact-modal-title' className='modal__title'>
								Обсудим проект?
							</h2>
							<p className='modal__subtitle'>
								Опишите задачу в двух словах — отвечу в течение рабочего дня.
							</p>
						</div>

						{isV2 ? (
							<LeadForm key={topic} initialTopic={topic} onDone={close} compact />
						) : (
							<ContactForm key={topic} initialTopic={topic} onDone={close} compact />
						)}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body
	)
}
