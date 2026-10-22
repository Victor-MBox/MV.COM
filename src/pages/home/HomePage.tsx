import { useEffect, useState } from 'react'
import { useContactModal } from '../../components/contactModal/ContactModalContext'
import Cursor from '../../components/cursor/Cursor'
import { getLenis, useLenis } from '../../hooks/useLenis'
import { useDocumentMeta } from '../../hooks/useDocumentMeta'
import { SITE_META } from '../../data/meta'
import ProcessSteps from '../../components/processSteps/ProcessSteps'
import PricingBlock from '../../components/pricingBlock/PricingBlock'
import Hero from './sections/Hero'
import Projects from './sections/Projects'
import Services from './sections/Services'
import About from './sections/About'
import Faq from './sections/Faq'
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
 * Главная (docs/design-spec-home4.md — композиция Portilo; структура по ТЗ от 21.10.2026 «содержание и коммерческая
 * структура»): предложение → реальные проекты → шесть услуг → процесс → стоимость и условия → кратко о разработчике →
 * пять вопросов; форма первого обращения — в общем футере. Процесс и цены — общие компоненты ProcessSteps и
 * PricingBlock (они же на /services). Класс `home-intro` на body — стаггер шапки при первой загрузке.
 * Lenis живёт, пока смонтирована страница.
 */
export default function HomePage() {
	const { isOpen } = useContactModal()
	const [introPlayed] = useState(readIntroPlayed)
	useLenis()
	useDocumentMeta(SITE_META.home)

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
			<Projects />
			<Services />
			<ProcessSteps />
			<PricingBlock />
			<About />
			<Faq />
			<Cursor />
		</div>
	)
}
