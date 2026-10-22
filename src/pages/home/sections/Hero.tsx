import { useEffect, useRef } from 'react'
import type { MouseEvent } from 'react'
import { motion } from 'framer-motion'
import { HERO, NAME, PROJECTS_ANCHOR } from '../../../data/home'
import portraitDark from '../../../resources/victor-hero.webp'
import portraitLight from '../../../resources/victor-hero-light.webp'
import { useContactModal } from '../../../components/contactModal/ContactModalContext'
import { getLenis } from '../../../hooks/useLenis'
import { MQ, useMediaQuery } from '../../../hooks/useMediaQuery'
import { useTheme } from '../../../hooks/useTheme'
import Button from '../../../components/button/Button'
import SplitLines from '../../../components/splitLines/SplitLines'

type Props = {
	/** Интро уже проигрывалось в этой сессии — всё на месте без анимации */
	instant: boolean
}

type From = { y?: number | string; scaleX?: number }

/** Состояние прожектора: текущая точка, цель и идущий кадр rAF */
type Spot = { x: number; y: number; tx: number; ty: number; init: boolean; raf: number }

const EASE = [0.2, 0.7, 0.2, 1] as const
/** Прожектор: доля расстояния до курсора, которую точка проходит за кадр, и порог остановки цикла, px */
const SPOT_LERP = 0.08
const SPOT_REST = 0.3
/** Исходная точка прожектора — доли ширины и высоты секции; те же 72% / 36% стоят в HomePage.scss (--sx / --sy) */
const SPOT_START = { x: 0.72, y: 0.36 }

/**
 * Первый экран по макету владельца «Hero 1b Прожектор» (21.10.2026): две колонки по нижней кромке — слева H1-предложение
 * в три строки (маски строк, HERO.lines) с подписью «имя · роль» под ним, внизу описание, условие «до разработки
 * согласуем…» и кнопки «Обсудить задачу» (модалка) / «Посмотреть проекты» (к #projects); справа портрет на всю высоту
 * колонки, низ растворяется. Фон — «прожектор»: сетка в круге и пятно акцента в одной точке; на устройствах с мышью
 * точка плавно догоняет курсор (CSS-переменные --sx/--sy на секции), на тач и при reduced-motion стоит на старте.
 * Интро: сетка и пятно проявляются 1.4 с, строки H1 выезжают с 0.2 с через 0.1 с, портрет — с 0.45 с, подпись — с 0.55 с,
 * нижняя группа (описание, затем условие с кнопками — два элемента с одним шагом) — с 0.65 с.
 * На ≤992 — макет владельца «Главная · мобильный hero 2a» (22.10.2026): портрет по центру под шапкой, низ растворяется,
 * поверх него с 360px H1, подпись и описание; сразу за описанием — кнопки, под ними условие (правка владельца: без
 * привязки к высоте окна). Разметка та же: `__bottom` на ≤992 — display: contents, описание и «кнопки + условие»
 * становятся ячейками сетки `__copy` (HomePage.scss)
 */
export default function Hero({ instant }: Props) {
	const { open } = useContactModal()
	const reduced = useMediaQuery(MQ.reduced)
	const hoverable = useMediaQuery(MQ.hover)
	const coarse = useMediaQuery(MQ.coarse)
	const { isLight } = useTheme()
	const spot = useRef<Spot>({ x: 0, y: 0, tx: 0, ty: 0, init: false, raf: 0 })

	// Уход со страницы — остановить цикл догоняния
	useEffect(() => {
		const s = spot.current
		return () => cancelAnimationFrame(s.raf)
	}, [])

	// Шаг интро: задержка и длительность по макету
	const step = (delay: number, duration: number, from: From = {}) => ({
		initial: instant ? false : { opacity: 0, ...(reduced ? {} : from) },
		animate: { opacity: 1, y: 0, scaleX: 1 },
		transition: instant ? { duration: 0 } : reduced ? { duration: 0.24 } : { delay, duration, ease: EASE },
	})

	// Прожектор догоняет курсор: цель — позиция мыши в секции, точка за кадр проходит 8% остатка и пишется в --sx/--sy
	// (маску сетки и пятно считает HomePage.scss). Цикл живёт, пока остаток больше 0.3px. Только при мыши
	// (hover и не coarse) и без reduced-motion — иначе обработчика нет и точка стоит на старте
	const follow = hoverable && !coarse && !reduced
	const onMove = (e: MouseEvent<HTMLElement>) => {
		const el = e.currentTarget
		const rect = el.getBoundingClientRect()
		const s = spot.current
		if (!s.init) {
			s.x = rect.width * SPOT_START.x
			s.y = rect.height * SPOT_START.y
			s.init = true
		}
		s.tx = e.clientX - rect.left
		s.ty = e.clientY - rect.top
		if (s.raf) return
		const tick = () => {
			s.x += (s.tx - s.x) * SPOT_LERP
			s.y += (s.ty - s.y) * SPOT_LERP
			el.style.setProperty('--sx', `${s.x}px`)
			el.style.setProperty('--sy', `${s.y}px`)
			s.raf = Math.abs(s.tx - s.x) + Math.abs(s.ty - s.y) > SPOT_REST ? requestAnimationFrame(tick) : 0
		}
		s.raf = requestAnimationFrame(tick)
	}

	// К проектам: Lenis, если главная его подняла, иначе нативно; при reduced-motion — прыжком. Фокус — на секцию,
	// чтобы следующий Tab шёл по карточке проекта, а не обратно по hero
	const toProjects = (e: MouseEvent<HTMLElement>) => {
		const target = document.getElementById(PROJECTS_ANCHOR)
		if (!target) return
		e.preventDefault()
		const lenis = getLenis()
		if (lenis && !reduced) lenis.scrollTo(target)
		else target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
		target.focus({ preventScroll: true })
	}

	return (
		<section className='homeHero' id='hero' onMouseMove={follow ? onMove : undefined}>
			<motion.div className='homeHero__grid' aria-hidden='true' {...step(0.2, 1.4)} />
			<motion.div className='homeHero__glow' aria-hidden='true' {...step(0.3, 1.4)} />

			<div className='homeHero__in'>
				<div className='homeHero__copy'>
					<div className='homeHero__top'>
						<SplitLines
							as='h1'
							className='homeHero__title'
							lines={HERO.lines}
							accent={HERO.accent}
							trigger='now'
							delay={0.2}
							duration={0.9}
							stagger={0.1}
							instant={instant}
						/>
						<div className='homeHero__eyebrow'>
							<motion.i className='homeHero__rule' aria-hidden='true' {...step(0.55, 0.4, { scaleX: 0 })} />
							<motion.p {...step(0.55, 0.4)}>
								{HERO.eyebrow.name} · <span className='homeHero__nowrap'>{HERO.eyebrow.role}</span>
							</motion.p>
						</div>
					</div>

					<div className='homeHero__bottom'>
						<motion.p className='homeHero__text' {...step(0.65, 0.5, { y: 24 })}>
							{HERO.text}
						</motion.p>
						<motion.div className='homeHero__actions' {...step(0.65, 0.5, { y: 24 })}>
							<p className='homeHero__note'>{HERO.note}</p>
							<div className='homeHero__cta'>
								<Button variant='primary' arrow onClick={() => open()}>
									{HERO.cta}
								</Button>
								<Button variant='secondary' href={`#${PROJECTS_ANCHOR}`} onClick={toProjects}>
									{HERO.projects}
								</Button>
							</div>
						</motion.div>
					</div>
				</div>

				<motion.div className='homeHero__portrait' {...step(0.45, 1, { y: 24 })}>
					<img src={isLight ? portraitLight : portraitDark} alt={NAME} width={1122} height={1402} fetchPriority='high' decoding='async' />
				</motion.div>
			</div>
		</section>
	)
}
