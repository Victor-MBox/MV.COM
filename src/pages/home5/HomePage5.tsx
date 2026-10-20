import { useLayoutEffect } from 'react'
import { META } from '../../data/home5'
import { useDocumentMeta } from '../../hooks/useDocumentMeta'
import victor from '../../resources/victor.webp'
import Hero from './sections/Hero'
import Projects from './sections/Projects'
import Services from './sections/Services'
import Process from './sections/Process'
import About from './sections/About'
import Blog from './sections/Blog'
import Final from './sections/Final'
import './HomePage5.scss'

/**
 * Главная по ТЗ «Minimal editorial / premium developer portfolio» (20.10.2026): шапка SiteHeader и футер MinimalFooter
 * рендерит App. Секции в порядке §6 ТЗ. Классы `v2 home5` на body включают палитру ТЗ (_v2.scss) и LeadForm в модалке.
 * Плавного скролла и курсора-подписи здесь нет (§16 запрещает псевдоплавную прокрутку), появление блоков — Reveal
 */
export default function HomePage5() {
	useDocumentMeta({ title: META.title, description: META.description, image: victor })

	// useLayoutEffect: токены скоупа должны стоять до первой отрисовки, иначе кадр на старых цветах
	useLayoutEffect(() => {
		document.body.classList.add('v2', 'home5')
		return () => document.body.classList.remove('v2', 'home5')
	}, [])

	return (
		<div className='home5'>
			<Hero />
			<Projects />
			<Services />
			<Process />
			<About />
			<Blog />
			<Final />
		</div>
	)
}
