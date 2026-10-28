import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import type { InsideChapter } from '../../data/caseInside'
import { MQ, useMediaQuery } from '../../hooks/useMediaQuery'
import { Icon } from './kit'
import { SCENES } from './scenes'
import { chapterOf, pad2, timelineAt, useChapterProgress, useScrollValue } from './timeline'
import './nr.scss'
// Стили продукта NoRandoms (собраны scripts/nr-product-css.mjs), поправки под холст и обёртка голосовой комнаты
import './product/nr-product.css'
import './product/overrides.scss'
import './product/voice-room.scss'
import './scenes/scenes.scss'
import './CaseInside.scss'

type Props = {
	chapters: InsideChapter[]
	/** Домен продукта в адресной строке окна */
	site: string
}

/** Холст живого интерфейса в CSS-пикселях; окно масштабирует его под свою ширину */
const CANVAS = { w: 720, h: 480 }
/** Линия активации главы: середина окна на десктопе; на ≤992 — сразу под залипшим окном */
const LINE_DESKTOP = 0.5
const LINE_GAP = 24

/** Сцена активной главы: прогресс главы — из времени сюжета; при reduced-motion — финал главы без движения */
function SceneHost({ t, index, chapter, reduced }: { t: MotionValue<number>; index: number; chapter: InsideChapter; reduced: boolean }) {
	const live = useChapterProgress(t, index)
	const still = useMotionValue(1)
	const Scene = SCENES[chapter.key]
	return <Scene p={reduced ? still : live} />
}

/**
 * Сюжет «изнутри»: главы текстом слева, справа залипшее окно продукта с живой сценой (scenes/*). Время сюжета —
 * индекс главы + доля главы за линией активации — считается от прокрутки в MotionValue; сцены подписываются на него
 * без React-перерисовок, перерисовка — только при смене главы (кроссфейд окна) и на дискретных шагах внутри сцен.
 * Окно — role="img" с подписью сцены, текст глав — обычный HTML. На ≤992 окно липнет под шапкой, главы идут под ним
 */
export default function Narrative({ chapters, site }: Props) {
	const rootRef = useRef<HTMLElement>(null)
	const stageRef = useRef<HTMLDivElement>(null)
	const screenRef = useRef<HTMLDivElement>(null)
	const reduced = useMediaQuery(MQ.reduced)
	const stacked = useMediaQuery(MQ.tablet)
	const [active, setActive] = useState(0)

	const compute = useCallback(() => {
		const root = rootRef.current
		if (!root) return 0
		const line = stacked && stageRef.current ? stageRef.current.getBoundingClientRect().bottom + LINE_GAP : window.innerHeight * LINE_DESKTOP
		const rects = Array.from(root.querySelectorAll<HTMLElement>('[data-chapter]')).map(el => {
			const r = el.getBoundingClientRect()
			return { top: r.top, height: r.height }
		})
		return timelineAt(rects, line)
	}, [stacked])
	const t = useScrollValue(compute)
	const bar = useTransform(t, v => v / chapters.length)

	useMotionValueEvent(t, 'change', v => {
		const i = chapterOf(v, chapters.length)
		setActive(prev => (prev === i ? prev : i))
	})

	// Масштаб холста под ширину экрана окна
	useEffect(() => {
		const screen = screenRef.current
		if (!screen) return
		const ro = new ResizeObserver(() => screen.style.setProperty('--k', (screen.clientWidth / CANVAS.w).toFixed(5)))
		ro.observe(screen)
		return () => ro.disconnect()
	}, [])

	const chapter = chapters[active]

	return (
		<section className='caseInside' ref={rootRef} aria-label='Как устроен проект'>
			<div className='container caseInside__grid'>
				<div className='caseInside__chapters'>
					{chapters.map((c, i) => (
						<article className={`caseInside__ch${i === active ? ' is-active' : ''}`} data-chapter={i} key={c.key}>
							<span className='caseInside__label'>
								{pad2(i + 1)} · {c.label}
							</span>
							<h2 className='caseInside__title'>{c.title}</h2>
							{c.text.map(txt => (
								<p key={txt}>{txt}</p>
							))}
							<span className='caseInside__howLabel'>как устроено</span>
							<ul className='caseInside__how'>
								{c.how.map(h => (
									<li key={h}>{h}</li>
								))}
							</ul>
							<p className='caseInside__why'>
								<span>почему так</span>
								{c.why}
							</p>
						</article>
					))}
				</div>

				<div className='caseInside__stageCol'>
					<div className='caseInside__stage' ref={stageRef}>
						<motion.div
							className='caseInside__window'
							role='img'
							aria-label={chapter.scene}
							initial={reduced ? false : { opacity: 0, y: 28, scale: 0.96 }}
							whileInView={{ opacity: 1, y: 0, scale: 1 }}
							viewport={{ once: true, amount: 0.2 }}
							transition={{ duration: 0.7, ease: [0.2, 0.7, 0.2, 1] }}
						>
							<div className='caseInside__chrome'>
								<span className='caseInside__dots' aria-hidden='true'>
									<i />
									<i />
									<i />
								</span>
								<span className='caseInside__url'>
									<Icon name='lock' size={11} />
									<b>{site}</b>
									<AnimatePresence mode='wait' initial={false}>
										<motion.span key={chapter.path} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: reduced ? 0 : 0.2 }}>
											{chapter.path}
										</motion.span>
									</AnimatePresence>
								</span>
							</div>
							<div className={`caseInside__screen${reduced ? ' is-static' : ''}`} ref={screenRef}>
								<div className='caseInside__canvas' style={{ width: CANVAS.w, height: CANVAS.h }}>
									<AnimatePresence initial={false}>
										<motion.div
											key={chapter.key}
											className='caseInside__scene'
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
											transition={{ duration: reduced ? 0 : 0.35, ease: [0.2, 0.7, 0.2, 1] }}
										>
											<SceneHost t={t} index={active} chapter={chapter} reduced={reduced} />
										</motion.div>
									</AnimatePresence>
								</div>
							</div>
						</motion.div>

						<p className='caseInside__caption'>
							<b>
								{pad2(active + 1)} / {pad2(chapters.length)}
							</b>
							<span>{chapter.label}</span>
						</p>
						<div className='caseInside__progress' aria-hidden='true'>
							<motion.i className='caseInside__bar' style={{ scaleX: bar }} />
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
