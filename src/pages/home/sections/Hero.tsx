import { motion } from 'framer-motion'
import { HERO_OFFER } from '../../../data/home3'
import { HERO_STAT, NAME, NAME_LINES, ROLE } from '../../../data/home4'
import victor from '../../../resources/victor.webp'
import { useContactModal } from '../../../components/contactModal/ContactModalContext'
import { MQ, useMediaQuery } from '../../../hooks/useMediaQuery'
import SplitLines from '../../../components/splitLines/SplitLines'
import Stat from '../../../components/stat/Stat'
import TabCta from '../../../components/tabCta/TabCta'

type Props = {
	/** Интро уже проигрывалось в этой сессии — всё на месте без анимации */
	instant: boolean
}

type From = { y?: number | string; scaleX?: number }

const EASE = [0.2, 0.7, 0.2, 1] as const

/**
 * Hero по Portilo (docs/design-spec-home4.md §6.1) с правками владельца от 20.10.2026: без статус-пилюли, имя в две
 * строки «Виктор / Мацаков», секция фиксированной высоты (HomePage4.scss), а не 100svh. Портрет справа, знак кавычек
 * и H1-абзац, одна цифра «8 лет», язычок «Обсудить проект» на нижней кромке, сетка линий на фоне.
 * Интро по таблице §6.1 (шаг пилюли выпал), при reduced-motion — один opacity за 240 мс
 */
export default function Hero({ instant }: Props) {
	const { open } = useContactModal()
	const reduced = useMediaQuery(MQ.reduced)

	// Шаг интро: задержка и длительность из таблицы §6.1
	const step = (delay: number, duration: number, from: From = {}) => ({
		initial: instant ? false : { opacity: 0, ...(reduced ? {} : from) },
		animate: { opacity: 1, y: 0, scaleX: 1 },
		transition: instant ? { duration: 0 } : reduced ? { duration: 0.24 } : { delay, duration, ease: EASE },
	})

	return (
		<section className='h4Hero' id='hero'>
			<div className='h4Hero__in'>
				<motion.div className='h4Hero__lines' aria-hidden='true' {...step(0, 0.9)} />

				<div className='h4Hero__top'>
					<SplitLines as='p' className='h4Hero__name display' lines={NAME_LINES} trigger='now' delay={0.15} instant={instant} />
					<div className='h4Hero__role'>
						<motion.i className='h4Hero__rule' aria-hidden='true' {...step(0.5, 0.36, { scaleX: 0 })} />
						<motion.span {...step(0.5, 0.36)}>{ROLE}</motion.span>
					</div>
				</div>

				<motion.div className='h4Hero__portrait' {...step(0.45, 0.7, { y: 24 })}>
					<img src={victor} alt={NAME} width={726} height={810} fetchPriority='high' decoding='async' />
				</motion.div>

				<div className='h4Hero__bottom'>
					<motion.div className='h4Hero__offer' {...step(0.65, 0.36)}>
						<span className='h4Hero__quote' aria-hidden='true'>
							<i />
							<i />
						</span>
						<h1 className='h4Hero__title'>
							{HERO_OFFER.lead} <span className='accent'>{HERO_OFFER.accent}</span>
						</h1>
					</motion.div>
					<motion.div className='h4Hero__stat' {...step(0.75, 0.36)}>
						<Stat value={HERO_STAT.value} suffix={HERO_STAT.suffix} label={HERO_STAT.label} accent delay={0.75} animate={!instant} />
					</motion.div>
				</div>
			</div>

			<div className='h4Hero__cta'>
				<motion.div {...step(0.85, 0.36, { y: '100%' })}>
					<TabCta onClick={() => open()}>Обсудить проект</TabCta>
				</motion.div>
			</div>
		</section>
	)
}
