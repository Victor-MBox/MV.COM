import { motion } from 'framer-motion'
import { HERO_OFFER, HERO_STAT, NAME, NAME_LINES, ROLE } from '../../../data/home'
import portraitDark from '../../../resources/victor-hero.webp'
import portraitLight from '../../../resources/victor-hero-light.webp'
import { useContactModal } from '../../../components/contactModal/ContactModalContext'
import { MQ, useMediaQuery } from '../../../hooks/useMediaQuery'
import { useTheme } from '../../../hooks/useTheme'
import Button from '../../../components/button/Button'
import SplitLines from '../../../components/splitLines/SplitLines'
import Stat from '../../../components/stat/Stat'

type Props = {
	/** Интро уже проигрывалось в этой сессии — всё на месте без анимации */
	instant: boolean
}

type From = { y?: number | string; scaleX?: number }

const EASE = [0.2, 0.7, 0.2, 1] as const

/**
 * Hero по Portilo (docs/design-spec-home4.md §6.1) с правками владельца от 20.10.2026 и макетом «Hero 1b.html»: без
 * статус-пилюли, имя в две строки «Виктор / Мацаков», высота секции по окну до 820px (HomePage.scss). Портрет справа
 * крупнее и уходит под шапку, снизу растворяется; знак кавычек и H1-абзац, под абзацем primary-пилюля «Обсудить проект»
 * (язычка на нижней кромке больше нет), одна цифра «8 лет», сетка линий на фоне. Портрет — кадр 300.png фотосессии
 * 20.10.2026 (скрещённые руки) в двух вариантах под тему: тёмный (тени в чёрный, боковой свет) и светлый (поджатая
 * маска без чёрной кромки, тени не давятся) — вырезка сделана с чёрного фона, и одна картинка на обе темы не годится;
 * цветокоррекция и экспорт описаны в code.md §9.
 * Интро по таблице §6.1 (шаг пилюли выпал, язычок заменён кнопкой), при reduced-motion — один opacity за 240 мс
 */
export default function Hero({ instant }: Props) {
	const { open } = useContactModal()
	const reduced = useMediaQuery(MQ.reduced)
	const { isLight } = useTheme()

	// Шаг интро: задержка и длительность из таблицы §6.1
	const step = (delay: number, duration: number, from: From = {}) => ({
		initial: instant ? false : { opacity: 0, ...(reduced ? {} : from) },
		animate: { opacity: 1, y: 0, scaleX: 1 },
		transition: instant ? { duration: 0 } : reduced ? { duration: 0.24 } : { delay, duration, ease: EASE },
	})

	return (
		<section className='homeHero' id='hero'>
			<div className='homeHero__in'>
				<motion.div className='homeHero__lines' aria-hidden='true' {...step(0, 0.9)} />

				<div className='homeHero__top'>
					<SplitLines as='p' className='homeHero__name display' lines={NAME_LINES} trigger='now' delay={0.15} instant={instant} />
					<div className='homeHero__role'>
						<motion.i className='homeHero__rule' aria-hidden='true' {...step(0.5, 0.36, { scaleX: 0 })} />
						<motion.span {...step(0.5, 0.36)}>{ROLE}</motion.span>
					</div>
				</div>

				<motion.div className='homeHero__portrait' {...step(0.45, 0.7, { y: 24 })}>
					<img src={isLight ? portraitLight : portraitDark} alt={NAME} width={1122} height={1402} fetchPriority='high' decoding='async' />
				</motion.div>

				<div className='homeHero__bottom'>
					<div className='homeHero__offer'>
						<motion.span className='homeHero__quote' aria-hidden='true' {...step(0.65, 0.36)}>
							<i />
							<i />
						</motion.span>
						<div className='homeHero__offerBody'>
							<motion.h1 className='homeHero__title' {...step(0.65, 0.36)}>
								{HERO_OFFER.lead} <span className='accent'>{HERO_OFFER.accent}</span>
							</motion.h1>
							<motion.div className='homeHero__cta' {...step(0.85, 0.36, { y: 8 })}>
								<Button variant='primary' arrow onClick={() => open()}>
									Обсудить проект
								</Button>
							</motion.div>
						</div>
					</div>
					<motion.div className='homeHero__stat' {...step(0.75, 0.36)}>
						<Stat value={HERO_STAT.value} suffix={HERO_STAT.suffix} label={HERO_STAT.label} accent delay={0.75} animate={!instant} />
					</motion.div>
				</div>
			</div>
		</section>
	)
}
