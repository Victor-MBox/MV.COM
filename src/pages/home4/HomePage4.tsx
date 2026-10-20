import { useEffect, useState } from 'react'
import { useContactModal } from '../../components/contactModal/ContactModalContext'
import Cursor from '../../components/cursor/Cursor'
import { getLenis, useLenis } from '../../hooks/useLenis'
import Hero from './sections/Hero'
import Process from './sections/Process'
import Services from './sections/Services'
import Work from './sections/Work'
import Pricing from './sections/Pricing'
import Faq from './sections/Faq'
import Hr from './sections/Hr'
import Stats from './sections/Stats'
import Final from './sections/Final'
import './HomePage4.scss'

/** Интро hero проигрывается один раз за сессию (docs/design-spec-home4.md §6.1) */
const INTRO_KEY = 'home4-intro-played'

function readIntroPlayed() {
	try {
		return sessionStorage.getItem(INTRO_KEY) === '1'
	} catch {
		return false
	}
}

/**
 * Главная по docs/design-spec-home4.md: композиция Portilo на дизайн-системе 1.0, навигация в верхней шапке (TopHeader в App).
 * Секции в порядке §6. Классы `v2 home4` на body включают токены скоупа (_v2.scss), `home4-intro` — стаггер шапки
 * при первой загрузке. Lenis живёт, пока смонтирована страница.
 */
export default function HomePage4() {
	const { isOpen } = useContactModal()
	const [introPlayed] = useState(readIntroPlayed)
	useLenis()

	useEffect(() => {
		document.body.classList.add('v2', 'home4')
		if (!introPlayed) document.body.classList.add('home4-intro')
		try {
			sessionStorage.setItem(INTRO_KEY, '1')
		} catch {
			// приватный режим — интро просто сыграет ещё раз
		}
		return () => document.body.classList.remove('v2', 'home4', 'home4-intro')
	}, [introPlayed])

	// Пока открыта модалка, плавный скролл стоит (иначе колесо «прокручивает» страницу под оверлеем)
	useEffect(() => {
		const lenis = getLenis()
		if (!lenis) return
		if (isOpen) lenis.stop()
		else lenis.start()
	}, [isOpen])

	return (
		<div className='home4'>
			<Hero instant={introPlayed} />
			<Process />
			<Services />
			<Work />
			<Pricing />
			<Faq />
			<Hr />
			<Stats />
			<Final />
			<Cursor />
		</div>
	)
}
