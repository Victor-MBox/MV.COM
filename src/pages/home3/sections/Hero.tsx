import { motion } from 'framer-motion'
import { HR_LINE } from '../../../data/home'
import { HERO_OFFER, HERO_STATS, HERO_TAGS, MOTTO } from '../../../data/home3'
import { useContactModal } from '../../../components/contactModal/ContactModalContext'
import { MQ, useMediaQuery } from '../../../hooks/useMediaQuery'
import SplitLines from '../../../components/splitLines/SplitLines'
import Chip from '../../../components/chip/Chip'
import RoundCta from '../../../components/roundCta/RoundCta'
import Stat from '../../../components/stat/Stat'

type Props = {
	/** Интро уже проигрывалось в этой сессии — всё на месте без анимации */
	instant: boolean
}

const EASE = [0.2, 0.7, 0.2, 1] as const

/** Hero (docs/design-spec.md §7.1): девиз, теги, H1-абзац, круглая CTA, ряд цифр. Статуса и кикера нет — решение владельца. Интро по таблице §7.1 */
export default function Hero({ instant }: Props) {
	const { open } = useContactModal()
	const reduced = useMediaQuery(MQ.reduced)

	// Шаг интро: задержка и длительность из таблицы §7.1; при reduced-motion — один opacity за 240 мс
	const step = (delay: number, duration: number, from: { y?: number; scale?: number } = {}) => ({
		initial: instant ? false : { opacity: 0, ...(reduced ? {} : from) },
		animate: { opacity: 1, y: 0, scale: 1 },
		transition: instant ? { duration: 0 } : reduced ? { duration: 0.24 } : { delay, duration, ease: EASE },
	})

	return (
		<section className='hero' id='hero'>
			<SplitLines as='p' className='motto' lines={MOTTO} trigger='now' delay={0.2} instant={instant} />

			<div className='hero__grid'>
				<div className='hero__offer'>
					<ul className='hero__tags'>
						{HERO_TAGS.map((tag, i) => (
							<motion.li key={tag} {...step(0.45 + i * 0.04, 0.36, { y: 8 })}>
								<Chip dot>{tag}</Chip>
							</motion.li>
						))}
					</ul>
					<motion.h1 className='hero__title' {...step(0.55, 0.36)}>
						{HERO_OFFER.lead} <span className='accent'>{HERO_OFFER.accent}</span>
					</motion.h1>
				</div>
				<motion.div className='hero__cta' {...step(0.65, 0.5, { scale: 0.9 })}>
					<RoundCta onClick={() => open()} />
				</motion.div>
			</div>

			<motion.div className='hero__stats' {...step(0.75, 0.36)}>
				{HERO_STATS.map(s => (
					<Stat key={s.label} value={s.value} suffix={s.suffix} label={s.label} accent delay={0.75} animate={!instant} />
				))}
				<p className='hero__hr'>
					<span>{HR_LINE.stack}</span>
					<span>{HR_LINE.place}</span>
				</p>
			</motion.div>
		</section>
	)
}
