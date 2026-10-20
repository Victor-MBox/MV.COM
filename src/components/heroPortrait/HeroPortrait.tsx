import { Fragment, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import CountUp from '../countUp/CountUp'
import { useContactModal } from '../contactModal/ContactModalContext'
import { AVAILABILITY } from '../../data/home'
import { HERO_FACTS, HERO_KICKER, HERO_SUBTITLE } from '../../data/home2'
import victor from '../../resources/victor.png'
import './HeroPortrait.scss'

const TITLE_WORDS = ['Разрабатываю', 'сайты', 'и', 'веб‑сервисы']
/** Акцент не разрывается на две строки — одно слово-блок с неразрывным пробелом */
const ACCENT = 'под ключ'
const EASE = [0.2, 0.7, 0.2, 1] as const

/** Появление элемента при загрузке: снизу вверх с задержкой */
const rise = (delay: number, y = 24) => ({
	initial: { opacity: 0, y },
	animate: { opacity: 1, y: 0 },
	transition: { duration: 0.7, delay, ease: EASE },
})

/**
 * Hero концепта H «Портрет»: тёмная сцена с портретом справа, два свечения, зерно, статус,
 * H1 со словами по очереди, кнопки и две стеклянные карточки с числами (`HERO_FACTS`).
 * Портрет медленно уезжает вверх при прокрутке; при prefers-reduced-motion параллакс выключен
 */
export default function HeroPortrait() {
	const { open } = useContactModal()
	const ref = useRef<HTMLElement>(null)
	const reduced = useReducedMotion()
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
	const shift = useTransform(scrollYProgress, [0, 1], [0, -50])

	return (
		<section className='heroPortrait' ref={ref}>
			<div className='heroPortrait__blob heroPortrait__blob--blue' aria-hidden='true' />
			<div className='heroPortrait__blob heroPortrait__blob--orange' aria-hidden='true' />
			<motion.div className='heroPortrait__figure' style={{ y: reduced ? 0 : shift }}>
				<img src={victor} alt='Виктор Мацаков' />
			</motion.div>
			<div className='heroPortrait__fade' aria-hidden='true' />
			<div className='heroPortrait__grain' aria-hidden='true' />

			<div className='heroPortrait__inner'>
				<motion.p className='heroPortrait__status' {...rise(0)}>
					<span className='heroPortrait__dot' aria-hidden='true' />
					{AVAILABILITY}
				</motion.p>
				<motion.p className='heroPortrait__kicker' {...rise(0.1)}>
					{HERO_KICKER}
				</motion.p>
				<h1 className='heroPortrait__title'>
					{TITLE_WORDS.map((word, i) => (
						<Fragment key={word}>
							<motion.span className='heroPortrait__word' {...rise(i * 0.07, 40)}>
								{word}
							</motion.span>{' '}
						</Fragment>
					))}
					<motion.span className='heroPortrait__word heroPortrait__accent' {...rise(TITLE_WORDS.length * 0.07, 40)}>
						{ACCENT}
					</motion.span>
				</h1>
				<motion.p className='heroPortrait__subtitle' {...rise(0.45)}>
					{HERO_SUBTITLE}
				</motion.p>
				<motion.div className='heroPortrait__actions' {...rise(0.55)}>
					<button className='btn btn_light' type='button' onClick={() => open()}>
						<span className='btn__label'>Обсудить проект</span>
					</button>
					<Link to='/portfolio' className='btn btn_dark'>
						<span>Смотреть работы</span>
					</Link>
				</motion.div>
			</div>

			<div className='heroPortrait__facts'>
				{HERO_FACTS.map((fact, i) => (
					<motion.div className='heroPortrait__fact' key={fact.label} {...rise(0.7 + i * 0.15)}>
						<strong>
							<CountUp to={fact.value} duration={1.5} separator={'\u202f'} />
							{fact.suffix}
						</strong>
						<span>{fact.label}</span>
					</motion.div>
				))}
			</div>
		</section>
	)
}
