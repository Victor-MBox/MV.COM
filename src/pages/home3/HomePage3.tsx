import { useEffect, useState } from 'react'
import { useContactModal } from '../../components/contactModal/ContactModalContext'
import Cursor from '../../components/cursor/Cursor'
import { getLenis, useLenis } from '../../hooks/useLenis'
import Hero from './sections/Hero'
import Services from './sections/Services'
import Work from './sections/Work'
import Process from './sections/Process'
import Hr from './sections/Hr'
import Blog from './sections/Blog'
import Faq from './sections/Faq'
import Final from './sections/Final'
import './HomePage3.scss'

/** Интро hero проигрывается один раз за сессию (docs/design-spec.md §7.1) */
const INTRO_KEY = 'home3-intro-played'

function readIntroPlayed() {
	try {
		return sessionStorage.getItem(INTRO_KEY) === '1'
	} catch {
		return false
	}
}

/**
 * Главная по docs/design-spec.md 1.0 (дизайн-система Portilo + OKC), маршрут /home3.
 * Секции в порядке §7.1–7.9. Класс `v2` на body переключает фон, меню и модалку на новые токены,
 * пока остальные страницы живут на старых (см. _v2.scss). Lenis живёт только здесь.
 */
export default function HomePage3() {
	const { isOpen } = useContactModal()
	const [introPlayed] = useState(readIntroPlayed)
	useLenis()

	useEffect(() => {
		document.body.classList.add('v2')
		if (!introPlayed) document.body.classList.add('v2-intro')
		try {
			sessionStorage.setItem(INTRO_KEY, '1')
		} catch {
			// приватный режим — интро просто сыграет ещё раз
		}
		return () => document.body.classList.remove('v2', 'v2-intro')
	}, [introPlayed])

	// Пока открыта модалка, плавный скролл стоит (иначе колесо «прокручивает» страницу под оверлеем)
	useEffect(() => {
		const lenis = getLenis()
		if (!lenis) return
		if (isOpen) lenis.stop()
		else lenis.start()
	}, [isOpen])

	return (
		<div className='home3'>
			<Hero instant={introPlayed} />
			<Services />
			<Work />
			<Process />
			<Hr />
			<Blog />
			<Faq />
			<Final />
			<Cursor />
		</div>
	)
}
