import { motion } from 'framer-motion'
import { HERO } from '../../../data/home5'
import { SECTIONS } from '../../../data/home5'
import victor from '../../../resources/victor.webp'
import { useContactModal } from '../../../components/contactModal/ContactModalContext'
import { MQ, useMediaQuery } from '../../../hooks/useMediaQuery'
import Button from '../../../components/button/Button'

const EASE = [0.2, 0.7, 0.2, 1] as const

/**
 * Hero (ТЗ §8): слева подпись, H1 с акцентной второй строкой, подзаголовок до 540px, primary-кнопка и текстовая ссылка
 * к проектам, строка из двух фактов; справа портрет-вырезка, растворяющийся в фон, с мягким свечением.
 * Появление 550 мс со сдвигом 16px и стаггером; при reduced-motion — только opacity за 240 мс
 */
export default function Hero() {
	const { open } = useContactModal()
	const reduced = useMediaQuery(MQ.reduced)

	const fade = (delay: number) => ({
		initial: { opacity: 0, y: reduced ? 0 : 16 },
		animate: { opacity: 1, y: 0 },
		transition: reduced ? { duration: 0.24 } : { duration: 0.55, delay, ease: EASE },
	})

	return (
		<section className='h5Hero' id='hero' aria-labelledby='hero-title'>
			<div className='h5Container h5Hero__in'>
				<div className='h5Hero__text'>
					<motion.p className='h5Hero__kicker' {...fade(0)}>
						{HERO.kicker}
					</motion.p>
					<motion.h1 className='h5Hero__title' id='hero-title' {...fade(0.08)}>
						{HERO.title.map((line, i) => (
							<span key={line} className={i === HERO.accentLine ? 'h5Hero__line accent' : 'h5Hero__line'}>
								{line}
							</span>
						))}
					</motion.h1>
					<motion.p className='h5Hero__lead' {...fade(0.16)}>
						{HERO.subtitle}
					</motion.p>
					<motion.div className='h5Hero__actions' {...fade(0.24)}>
						<Button onClick={() => open()} arrow arrowGlyph='↗'>
							{HERO.primary}
						</Button>
						<Button variant='text' to={`#${SECTIONS.projects.id}`} arrowGlyph='↓'>
							{HERO.secondary}
						</Button>
					</motion.div>
					<motion.ul className='h5Hero__facts' aria-label='Коротко обо мне' {...fade(0.32)}>
						{HERO.facts.map(fact => (
							<li key={fact.label}>
								<strong>{fact.value}</strong> {fact.label}
							</li>
						))}
					</motion.ul>
				</div>

				<motion.div className='h5Hero__media' {...fade(0.12)}>
					<img src={victor} alt='Виктор Мацаков' width={726} height={810} fetchPriority='high' decoding='async' />
				</motion.div>
			</div>
		</section>
	)
}
