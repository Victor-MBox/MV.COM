import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useContactModal } from './ContactModalContext'
import { useScrollLock } from '../../hooks/useScrollLock'
import LeadForm from '../leadForm/LeadForm'
import { FORM_COPY } from '../../data/leadForm'
import './ContactModal.scss'

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * Модалка первого обращения (docs/design-spec.md §6.13): одна на сайт, форма LeadForm. Esc закрывает, Tab ходит по кругу
 * внутри окна, после закрытия фокус возвращается на кнопку, которая окно открыла
 */
export default function ContactModal() {
	const { isOpen, topic, close } = useContactModal()
	const dialogRef = useRef<HTMLDivElement>(null)
	useScrollLock(isOpen)

	// Esc закрывает, фокус уходит в первое поле и не выходит из окна; прокрутку страницы держит useScrollLock
	useEffect(() => {
		if (!isOpen) return
		const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				close()
				return
			}
			if (e.key !== 'Tab' || !dialogRef.current) return
			const ring = Array.from(dialogRef.current.querySelectorAll<HTMLElement>(FOCUSABLE))
			if (!ring.length) return
			const first = ring[0]
			const last = ring[ring.length - 1]
			const inside = dialogRef.current.contains(document.activeElement)
			if (e.shiftKey && (document.activeElement === first || !inside)) {
				e.preventDefault()
				last.focus()
			} else if (!e.shiftKey && (document.activeElement === last || !inside)) {
				e.preventDefault()
				first.focus()
			}
		}
		document.addEventListener('keydown', onKey)
		// Первое поле формы, а пока формы нет (публичная сборка) — ссылка «Написать в Telegram»
		const t = window.setTimeout(() => {
			dialogRef.current?.querySelector<HTMLElement>('input, textarea, a[href]')?.focus()
		}, 50)
		return () => {
			document.removeEventListener('keydown', onKey)
			window.clearTimeout(t)
			// Возврат фокуса без прокрутки: кнопка-открыватель и так на экране (а под Lenis прыжок был бы заметен)
			opener?.focus({ preventScroll: true })
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
								{FORM_COPY.title}
							</h2>
							<p className='modal__subtitle'>{FORM_COPY.lead}</p>
						</div>

						<LeadForm key={topic} topic={topic} formId='modal' onDone={close} compact />
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>,
		document.body
	)
}
