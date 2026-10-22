import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { clearSiteStorage, closeCookieSettings, isSettingsOpen, readStoredKeys, subscribeNotice } from '../../consent/privacyNotice'
import { useScrollLock } from '../../hooks/useScrollLock'
import { COOKIE_SETTINGS, LEGAL_DOCS, STORAGE_INVENTORY } from '../../data/legal'
import Button from '../button/Button'
import '../contactModal/ContactModal.scss'
import './CookieNotice.scss'

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
const serverSnapshot = () => false

/**
 * Окно «Настройки cookie» (кнопка футера и «Настройки» в уведомлении; ТЗ §10): перечень записей сайта с отметкой, есть ли
 * они на этом устройстве, честные строки «аналитика не подключена» и «реклама не используется» без пустых
 * переключателей, кнопка «Удалить сохранённые настройки» (тема → системная), ссылка на /cookies. Оверлей и диалог —
 * классы модалки обращения (ContactModal.scss); Esc закрывает, Tab по кругу, фокус возвращается на кнопку-открыватель
 */
export default function CookieSettings() {
	const open = useSyncExternalStore(subscribeNotice, isSettingsOpen, serverSnapshot)
	return (
		<AnimatePresence>
			{open && <SettingsDialog />}
		</AnimatePresence>
	)
}

function SettingsDialog() {
	const dialogRef = useRef<HTMLDivElement>(null)
	const [cleared, setCleared] = useState(false)
	useScrollLock(true)
	const stored = readStoredKeys()

	useEffect(() => {
		const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				closeCookieSettings()
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
		const t = window.setTimeout(() => dialogRef.current?.querySelector<HTMLElement>('h2')?.focus(), 50)
		return () => {
			document.removeEventListener('keydown', onKey)
			window.clearTimeout(t)
			opener?.focus({ preventScroll: true })
		}
	}, [])

	const clear = () => {
		clearSiteStorage()
		setCleared(true)
	}

	return createPortal(
		<motion.div
			className='modal'
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			transition={{ duration: 0.2 }}
			onMouseDown={e => {
				if (e.target === e.currentTarget) closeCookieSettings()
			}}
		>
			<motion.div
				ref={dialogRef}
				className='modal__dialog cookieSettings'
				role='dialog'
				aria-modal='true'
				aria-labelledby='cookie-settings-title'
				initial={{ opacity: 0, y: 24, scale: 0.98 }}
				animate={{ opacity: 1, y: 0, scale: 1 }}
				exit={{ opacity: 0, y: 16, scale: 0.98 }}
				transition={{ type: 'spring', stiffness: 320, damping: 28 }}
			>
				<button type='button' className='modal__close' onClick={closeCookieSettings} aria-label={COOKIE_SETTINGS.closeAria}>
					<svg viewBox='0 0 24 24' aria-hidden='true'>
						<path d='M6 6l12 12M18 6L6 18' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
					</svg>
				</button>

				<div className='modal__head'>
					<h2 id='cookie-settings-title' className='modal__title' tabIndex={-1}>
						{COOKIE_SETTINGS.title}
					</h2>
					<p className='modal__subtitle'>{COOKIE_SETTINGS.intro}</p>
				</div>

				<p className='cookieSettings__label'>
					<span aria-hidden='true'>//</span> {COOKIE_SETTINGS.necessary}
				</p>
				<ul className='cookieSettings__list'>
					{STORAGE_INVENTORY.map(s => (
						<li key={s.key}>
							<span className='cookieSettings__key'>{s.key}</span>
							<span className='cookieSettings__purpose'>{s.purpose}</span>
							<span className={`cookieSettings__state${stored.includes(s.key) ? ' is-present' : ''}`}>
								{stored.includes(s.key) ? COOKIE_SETTINGS.present : COOKIE_SETTINGS.absent}
							</span>
						</li>
					))}
				</ul>

				<p className='cookieSettings__label'>
					<span aria-hidden='true'>//</span> {COOKIE_SETTINGS.optional}
				</p>
				<ul className='cookieSettings__list cookieSettings__list--optional'>
					{[COOKIE_SETTINGS.analytics, COOKIE_SETTINGS.ads].map(row => (
						<li key={row.label}>
							<span className='cookieSettings__purpose'>{row.label}</span>
							<span className='cookieSettings__state'>{row.value}</span>
						</li>
					))}
				</ul>

				{cleared && (
					<p className='cookieSettings__done' role='status'>
						{COOKIE_SETTINGS.cleared}
					</p>
				)}

				<div className='cookieSettings__actions'>
					<Button variant='secondary' onClick={clear} disabled={stored.length === 0}>
						{COOKIE_SETTINGS.clear}
					</Button>
					<Button onClick={closeCookieSettings}>{COOKIE_SETTINGS.close}</Button>
				</div>
				<p className='cookieSettings__more'>
					<Link to={LEGAL_DOCS.cookies.path} onClick={closeCookieSettings}>
						{COOKIE_SETTINGS.more}
					</Link>
				</p>
			</motion.div>
		</motion.div>,
		document.body,
	)
}
