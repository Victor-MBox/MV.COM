import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { CONTACTS, CONTACT_LINKS } from '../../data/contacts'
import { HOME5_PATH, PERSON, navItems } from '../../data/home5'
import { useContactModal } from '../contactModal/ContactModalContext'
import { MQ, useMediaQuery } from '../../hooks/useMediaQuery'
import ThemeToggle from '../themeToggle/ThemeToggle'
import Button from '../button/Button'
import './SiteHeader.scss'

/** Прокрутка, после которой шапка получает фон и блюр (ТЗ §7) */
const SCROLLED_AT = 16
const EASE = [0.2, 0.7, 0.2, 1] as const

/**
 * Шапка /home5 (ТЗ §7): слева «VM.» с именем и ролью, по центру ссылки, справа переключатель темы и «Обсудить проект ↗».
 * Липкая, прозрачная над hero, после 16px прокрутки — полупрозрачный фон с blur на псевдоэлементе (сама шапка без
 * backdrop-filter, иначе она стала бы containing block для fixed-потомков). На ≤992 ссылки и кнопка уходят
 * в раскрывающееся меню (портал в body, role=dialog, ловушка фокуса, Esc), переключатель темы остаётся в шапке
 */
export default function SiteHeader() {
	const { pathname } = useLocation()
	const { open } = useContactModal()
	const tablet = useMediaQuery(MQ.tablet)
	const reduced = useMediaQuery(MQ.reduced)
	const [scrolled, setScrolled] = useState(false)
	const [menuOpen, setMenuOpen] = useState(false)
	const toggleRef = useRef<HTMLButtonElement>(null)
	const panelRef = useRef<HTMLDivElement>(null)
	const showMenu = tablet && menuOpen
	const items = navItems()
	const isActive = (to: string) => pathname.startsWith(to)

	useEffect(() => {
		let raf = 0
		const update = () => {
			raf = 0
			setScrolled(window.scrollY > SCROLLED_AT)
		}
		const onScroll = () => {
			if (!raf) raf = requestAnimationFrame(update)
		}
		onScroll()
		window.addEventListener('scroll', onScroll, { passive: true })
		return () => {
			window.removeEventListener('scroll', onScroll)
			cancelAnimationFrame(raf)
		}
	}, [])

	// Открытое меню: скролл стоит, Esc закрывает, Tab ходит по кольцу «кнопка → пункты → кнопка», фокус возвращается на кнопку
	useEffect(() => {
		if (!showMenu) return
		const prevOverflow = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		const focusTimer = window.setTimeout(() => panelRef.current?.querySelector<HTMLElement>('a, button')?.focus(), 50)

		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				setMenuOpen(false)
				return
			}
			if (e.key !== 'Tab' || !panelRef.current) return
			const inside = Array.from(panelRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'))
			const ring = toggleRef.current ? [toggleRef.current, ...inside] : inside
			if (!ring.length) return
			const i = ring.indexOf(document.activeElement as HTMLElement)
			const next = e.shiftKey ? (i <= 0 ? ring.length - 1 : i - 1) : i < 0 || i === ring.length - 1 ? 0 : i + 1
			e.preventDefault()
			ring[next].focus()
		}
		document.addEventListener('keydown', onKey)
		const toggle = toggleRef.current
		return () => {
			document.removeEventListener('keydown', onKey)
			window.clearTimeout(focusTimer)
			document.body.style.overflow = prevOverflow
			toggle?.focus()
		}
	}, [showMenu])

	const closeMenu = () => setMenuOpen(false)
	const discuss = () => {
		closeMenu()
		open()
	}
	const cn = ['siteHeader', scrolled ? 'siteHeader--scrolled' : '', showMenu ? 'siteHeader--open' : ''].filter(Boolean).join(' ')

	return (
		<>
			<a className='skipLink' href='#hero'>
				К содержанию
			</a>
			<header className={cn}>
				<div className='siteHeader__in'>
					<Link to={HOME5_PATH} className='siteHeader__brand' aria-label={`${PERSON.name}, на главную`}>
						<span className='siteHeader__logo' aria-hidden='true'>
							{PERSON.logo}
							<i>.</i>
						</span>
						<span className='siteHeader__who' aria-hidden='true'>
							<b>{PERSON.name}</b>
							<span>{PERSON.role}</span>
						</span>
					</Link>

					<nav className='siteHeader__nav' aria-label='Основное меню'>
						<ul>
							{items.map(item => (
								<li key={item.to}>
									<NavLink
										to={item.to}
										className={isActive(item.to) ? 'is-active' : undefined}
										aria-current={isActive(item.to) ? 'page' : undefined}
									>
										{item.label}
									</NavLink>
								</li>
							))}
						</ul>
					</nav>

					<div className='siteHeader__actions'>
						<ThemeToggle />
						<Button variant='secondary' className='siteHeader__cta' onClick={() => open()} arrow arrowGlyph='↗'>
							Обсудить проект
						</Button>
						<button
							ref={toggleRef}
							type='button'
							className='siteHeader__burger'
							aria-expanded={showMenu}
							aria-controls='site-menu'
							aria-label={showMenu ? 'Закрыть меню' : 'Открыть меню'}
							onClick={() => setMenuOpen(v => !v)}
						>
							<span aria-hidden='true'>
								<i />
								<i />
							</span>
						</button>
					</div>
				</div>
			</header>

			{createPortal(
				<AnimatePresence>
					{showMenu && (
						<motion.div
							ref={panelRef}
							id='site-menu'
							className='siteMenu'
							role='dialog'
							aria-modal='true'
							aria-label='Меню'
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0, transition: { duration: 0.18 } }}
							transition={{ duration: 0.24, ease: EASE }}
						>
							<nav aria-label='Меню сайта'>
								<ul className='siteMenu__list'>
									{items.map((item, i) => (
										<motion.li
											key={item.to}
											initial={reduced ? { opacity: 0 } : { opacity: 0, y: 12 }}
											animate={{ opacity: 1, y: 0 }}
											transition={reduced ? { duration: 0.24 } : { duration: 0.36, delay: i * 0.04, ease: EASE }}
										>
											<Link
												to={item.to}
												className={isActive(item.to) ? 'is-active' : undefined}
												aria-current={isActive(item.to) ? 'page' : undefined}
												onClick={closeMenu}
											>
												{item.label}
											</Link>
										</motion.li>
									))}
								</ul>
							</nav>
							<motion.div
								className='siteMenu__foot'
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.24, delay: reduced ? 0 : items.length * 0.04 }}
							>
								<Button onClick={discuss} full arrow arrowGlyph='↗'>
									Обсудить проект
								</Button>
								<p className='siteMenu__contacts'>
									<a href={CONTACT_LINKS.email}>{CONTACTS.email}</a>
									<a href={CONTACT_LINKS.telegram} target='_blank' rel='noopener noreferrer'>
										@{CONTACTS.telegram}
									</a>
								</p>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>,
				document.body
			)}
		</>
	)
}
