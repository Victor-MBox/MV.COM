import { useEffect, useState } from 'react'
import { useContactModal } from '../../components/contactModal/ContactModalContext'
import Cursor from '../../components/cursor/Cursor'
import { getLenis, useLenis } from '../../hooks/useLenis'
import ProcessSteps from '../../components/processSteps/ProcessSteps'
import PricingBlock from '../../components/pricingBlock/PricingBlock'
import Hero from './sections/Hero'
import Services from './sections/Services'
import Work from './sections/Work'
import Faq from './sections/Faq'
import Hr from './sections/Hr'
import Stats from './sections/Stats'
import './HomePage.scss'

/** Интро hero проигрывается один раз за сессию (docs/design-spec-home4.md §6.1) */
const INTRO_KEY = 'home-intro-played'

function readIntroPlayed() {
	try {
		return sessionStorage.getItem(INTRO_KEY) === '1'
	} catch {
		return false
	}
}

/**
 * Главная (docs/design-spec-home4.md, бывший /home4 — с 20.10.2026 единственная главная сайта): композиция Portilo,
 * навигация в верхней шапке (TopHeader в App). Секции в порядке §6; «Как работаю» и «Сколько стоит» — общие компоненты
 * ProcessSteps и PricingBlock (они же на /services). Класс `home-intro` на body — стаггер шапки
 * при первой загрузке. Lenis живёт, пока смонтирована страница.
 */
export default function HomePage() {
	const { isOpen } = useContactModal()
	const [introPlayed] = useState(readIntroPlayed)
	useLenis()

	useEffect(() => {
		if (!introPlayed) document.body.classList.add('home-intro')
		try {
			sessionStorage.setItem(INTRO_KEY, '1')
		} catch {
			// приватный режим — интро просто сыграет ещё раз
		}
		return () => document.body.classList.remove('home-intro')
	}, [introPlayed])

	// Пока открыта модалка, плавный скролл стоит (иначе колесо «прокручивает» страницу под оверлеем)
	useEffect(() => {
		const lenis = getLenis()
		if (!lenis) return
		if (isOpen) lenis.stop()
		else lenis.start()
	}, [isOpen])

	return (
		<div className='home'>
			<Hero instant={introPlayed} />
			<ProcessSteps />
			<Services />
			<Work />
			<PricingBlock />
			<Faq />
			<Hr />
			<Stats />
			<Cursor />
		</div>
	)
}
