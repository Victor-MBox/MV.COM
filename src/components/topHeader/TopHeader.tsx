import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { CONTACTS, CONTACT_LINKS } from '../../data/contacts'
import { NAV, SOCIAL, WORDMARK } from '../../data/home4'
import type { SocialKey } from '../../data/home4'
import { useContactModal } from '../contactModal/ContactModalContext'
import { getLenis } from '../../hooks/useLenis'
import { MQ, useMediaQuery } from '../../hooks/useMediaQuery'
import ThemeButton from '../themeButton/ThemeButton'
import Button from '../button/Button'
import './TopHeader.scss'

/** Прокрутка, после которой шапка получает фон и блюр (§4.1) */
const SCROLLED_AT = 24
const EASE = [0.2, 0.7, 0.2, 1] as const
const HOME = '/home4'

const svg = { width: 20, height: 20, fill: 'currentColor', 'aria-hidden': true } as const

const ICONS: Record<SocialKey, ReactNode> = {
	github: (
		<svg {...svg} viewBox='0 0 16 16'>
			<path d='M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z' />
		</svg>
	),
	telegram: (
		<svg {...svg} viewBox='0 0 24 24'>
			<path d='M21.6 3.3 2.7 10.6c-1.2.5-1.2 1.2-.2 1.5l4.8 1.5 1.9 5.7c.2.6.4.9.9.9.4 0 .6-.2.9-.5l2.3-2.3 4.8 3.6c.9.5 1.5.2 1.8-.8l3.2-15.1c.3-1.3-.5-1.9-1.5-1.8zM7.9 13.4l10.3-6.5c.5-.3.9-.1.6.2l-8.8 7.9-.3 3.6-1.8-5.2z' />
		</svg>
	),
	linkedin: (
		<svg {...svg} viewBox='0 0 24 24'>
			<path d='M20.4 2H3.6C2.7 2 2 2.7 2 3.6v16.8c0 .9.7 1.6 1.6 1.6h16.8c.9 0 1.6-.7 1.6-1.6V3.6c0-.9-.7-1.6-1.6-1.6zM8 19H5V9h3v10zM6.5 7.7a1.8 1.8 0 1 1 0-3.7 1.8 1.8 0 0 1 0 3.7zM19 19h-3v-4.9c0-1.2 0-2.7-1.6-2.7s-1.9 1.3-1.9 2.6V19h-3V9h2.9v1.4c.4-.8 1.4-1.6 2.9-1.6 3.1 0 3.7 2 3.7 4.7V19z' />
		</svg>
	),
}

const SOCIAL_LABELS: Record<SocialKey, string> = { github: 'GitHub', telegram: 'Telegram', linkedin: 'LinkedIn' }

const intro = (i: number) => ({ 'data-intro': true, style: { '--i': i } as CSSProperties })

/**
 * Верхняя шапка /home4 (docs/design-spec-home4.md §4): слово-логотип, ссылки, переключатель темы и кнопка на десктопе;
 * на ≤992 — круглая кнопка-меню с четырьмя точками и полноэкранная панель (ловушка фокуса, Esc, скролл стоит);
 * справа плавающая панель соцссылок (≥1200). Панель меню и соцпанель рендерятся порталом в body, чтобы position: fixed
 * не привязывался к шапке с blur. Липкая, прозрачная над hero, с фоном после 24px прокрутки.
 */
export default function TopHeader() {
	const { pathname } = useLocation()
	const { open: openModal } = useContactModal()
	const tablet = useMediaQuery(MQ.tablet)
	const reduced = useMediaQuery(MQ.reduced)
	const [scrolled, setScrolled] = useState(false)
	const [menuOpen, setMenuOpen] = useState(false)
	const toggleRef = useRef<HTMLButtonElement>(null)
	const panelRef = useRef<HTMLDivElement>(null)
	const showMenu = tablet && menuOpen
	const isActive = (to: string) => (to === HOME ? pathname === HOME : pathname.startsWith(to))

	// Состояние «после прокрутки» по window.scroll через rAF: Lenis двигает нативный скролл, так что событие общее для обоих режимов
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

	// Открытое меню: скролл стоит, Esc закрывает, Tab ходит по кругу между кнопкой и пунктами, фокус возвращается на кнопку
	useEffect(() => {
		if (!showMenu) return
		const lenis = getLenis()
		lenis?.stop()
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
			// Панель — портал в конце body, поэтому браузерный порядок Tab не годится: ходим по кольцу сами
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
			lenis?.start()
			toggle?.focus()
		}
	}, [showMenu])

	const closeMenu = () => setMenuOpen(false)
	const menuItems = [{ label: 'Главная', to: HOME }, ...NAV]
	const cn = ['topHeader', scrolled ? 'topHeader--scrolled' : '', showMenu ? 'topHeader--open' : ''].filter(Boolean).join(' ')

	return (
		<>
			<a className='skipLink' href='#hero'>
				К содержанию
			</a>
			<header className={cn}>
				<div className='topHeader__in'>
					<Link to={HOME} className='topHeader__logo' aria-label={`${WORDMARK}, на главную`} {...intro(0)}>
						{WORDMARK}
						<i className='topHeader__dot' aria-hidden='true' />
					</Link>

					<nav className='topHeader__nav' aria-label='Основное меню'>
						<ul>
							{NAV.map((item, i) => (
								<li key={item.to}>
									<NavLink
										to={item.to}
										className={isActive(item.to) ? 'is-active' : undefined}
										aria-current={isActive(item.to) ? 'page' : undefined}
										{...intro(i + 1)}
									>
										{item.label}
									</NavLink>
								</li>
							))}
						</ul>
					</nav>

					<div className='topHeader__actions'>
						<span className='topHeader__theme' {...intro(NAV.length + 1)}>
							<ThemeButton />
						</span>
						<span className='topHeader__ctaWrap' {...intro(NAV.length + 2)}>
							<Button variant='secondary' className='topHeader__cta' onClick={() => openModal()}>
								Обсудить проект
							</Button>
						</span>
						<button
							ref={toggleRef}
							type='button'
							className='topHeader__toggle'
							aria-expanded={showMenu}
							aria-controls='menu-overlay'
							aria-label={showMenu ? 'Закрыть меню' : 'Открыть меню'}
							onClick={() => setMenuOpen(v => !v)}
							{...intro(NAV.length + 2)}
						>
							<span className='topHeader__dots' aria-hidden='true'>
								<i />
								<i />
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
							id='menu-overlay'
							className='topMenu'
							role='dialog'
							aria-modal='true'
							aria-label='Меню'
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0, transition: { duration: 0.18 } }}
							transition={{ duration: 0.24, ease: EASE }}
						>
							<ol className='topMenu__list'>
								{menuItems.map((item, i) => (
									<motion.li
										key={item.to}
										initial={reduced ? { opacity: 0 } : { opacity: 0, y: 16 }}
										animate={{ opacity: 1, y: 0 }}
										transition={reduced ? { duration: 0.24 } : { duration: 0.36, delay: i * 0.04, ease: EASE }}
									>
										<span className='topMenu__num' aria-hidden='true'>
											{String(i + 1).padStart(2, '0')}
										</span>
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
							</ol>
							<motion.div
								className='topMenu__row'
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.24, delay: reduced ? 0 : menuItems.length * 0.04 }}
							>
								<span className='topHeader__theme'>
									<ThemeButton />
								</span>
								<a href={CONTACT_LINKS.email}>{CONTACTS.email}</a>
								<a href={CONTACT_LINKS.telegram} target='_blank' rel='noopener noreferrer'>
									@{CONTACTS.telegram}
								</a>
							</motion.div>
						</motion.div>
					)}
				</AnimatePresence>,
				document.body
			)}

			{SOCIAL.length > 0 &&
				createPortal(
					<ul className={showMenu ? 'socialDock socialDock--hidden' : 'socialDock'} aria-label='Соцсети'>
						{SOCIAL.map(key => (
							<li key={key}>
								<a href={CONTACT_LINKS[key]} target='_blank' rel='noopener noreferrer' aria-label={SOCIAL_LABELS[key]}>
									{ICONS[key]}
								</a>
							</li>
						))}
					</ul>,
					document.body
				)}
		</>
	)
}
