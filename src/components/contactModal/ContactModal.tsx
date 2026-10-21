import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useContactModal } from './ContactModalContext'
import { useScrollLock } from '../../hooks/useScrollLock'
import LeadForm from '../leadForm/LeadForm'
import './ContactModal.scss'

/** Модалка заявки (docs/design-spec.md §6.13): форма с намерениями LeadForm на всех страницах */
export default function ContactModal() {
	const { isOpen, topic, close } = useContactModal()
	const dialogRef = useRef<HTMLDivElement>(null)
	useScrollLock(isOpen)

	// Esc закрывает, фокус уходит в окно; прокрутку страницы держит useScrollLock
	useEffect(() => {
		if (!isOpen) return
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') close()
		}
		document.addEventListener('keydown', onKey)
		const t = window.setTimeout(() => {
			dialogRef.current?.querySelector<HTMLElement>('input, textarea, button')?.focus()
		}, 50)
		return () => {
			document.removeEventListener('keydown', onKey)
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

						<LeadForm key={topic} initialTopic={topic} onDone={close} compact />
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body
	)
}
