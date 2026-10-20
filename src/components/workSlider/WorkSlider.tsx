import { useEffect, useRef, useState } from 'react'
import type { MouseEvent } from 'react'
import { animate, motion, useMotionValue } from 'framer-motion'
import type { PanInfo } from 'framer-motion'
import { MQ, useMediaQuery } from '../../hooks/useMediaQuery'
import Button from '../button/Button'
import WorkCard from '../workCard/WorkCard'
import type { WorkCardData } from '../workCard/WorkCard'
import './WorkSlider.scss'

type Props = {
	/** Карточки в порядке показа (WORK_SLIDES в home4.ts: главный кейс первым) */
	items: WorkCardData[]
}

const EASE = [0.2, 0.7, 0.2, 1] as const
const SWIPE_OFFSET = 40
const SWIPE_VELOCITY = 300

/**
 * Слайдер работ (docs/design-spec-home4.md §5.4): лента карточек с drag по x и привязкой к карточке за 360 мс,
 * стрелки для клавиатуры, язычок с ромбами справа у карточки, полоса прогресса. При одной карточке — только она.
 * При reduced-motion drag выключен, остаются стрелки и ромбы.
 */
export default function WorkSlider({ items }: Props) {
	const reduced = useMediaQuery(MQ.reduced)
	const [index, setIndex] = useState(0)
	const [width, setWidth] = useState(0)
	const viewportRef = useRef<HTMLDivElement>(null)
	const trackRef = useRef<HTMLDivElement>(null)
	// Был ли жест перетаскивания: click по ссылке-карточке после свайпа не должен открывать кейс
	const dragged = useRef(false)
	const x = useMotionValue(0)
	const n = items.length
	const single = n < 2

	// Шаг ленты = ширина окна слайдера; измеряется ResizeObserver, чтобы не ловить setState в эффекте
	useEffect(() => {
		const el = viewportRef.current
		if (!el || single) return
		const ro = new ResizeObserver(entries => setWidth(Math.round(entries[0].contentRect.width)))
		ro.observe(el)
		return () => ro.disconnect()
	}, [single])

	useEffect(() => {
		if (single) return
		const controls = animate(x, -index * width, reduced ? { duration: 0 } : { duration: 0.36, ease: EASE })
		return () => controls.stop()
	}, [index, width, reduced, single, x])

	// Ссылка-карточка и обложка внутри тянутся нативно (HTML5 drag-and-drop) и глушат pointer-события framer-motion —
	// гасим dragstart на ленте. Это нативное событие, а не onDragStart motion.div (тот — колбэк жеста)
	useEffect(() => {
		const el = trackRef.current
		if (!el || single) return
		const prevent = (e: Event) => e.preventDefault()
		el.addEventListener('dragstart', prevent)
		return () => el.removeEventListener('dragstart', prevent)
	}, [single])

	if (n === 0) return null
	if (single) return <WorkCard item={items[0]} />

	const clamp = (i: number) => Math.max(0, Math.min(n - 1, i))
	const go = (i: number) => setIndex(clamp(i))
	const onClickCapture = (e: MouseEvent) => {
		if (!dragged.current) return
		e.preventDefault()
		e.stopPropagation()
		dragged.current = false
	}
	const onDragEnd = (_: unknown, info: PanInfo) => {
		const dir =
			info.offset.x < -SWIPE_OFFSET || info.velocity.x < -SWIPE_VELOCITY
				? 1
				: info.offset.x > SWIPE_OFFSET || info.velocity.x > SWIPE_VELOCITY
					? -1
					: 0
		const next = clamp(index + dir)
		if (next === index) animate(x, -index * width, { duration: 0.36, ease: EASE })
		else setIndex(next)
	}

	return (
		<div className='workSlider'>
			<div className='workSlider__viewport' ref={viewportRef}>
				<motion.div
					ref={trackRef}
					className='workSlider__track'
					style={{ x }}
					drag={reduced ? false : 'x'}
					dragConstraints={{ left: -(n - 1) * width, right: 0 }}
					dragElastic={0.08}
					dragMomentum={false}
					onPointerDownCapture={() => {
						dragged.current = false
					}}
					onDragStart={() => {
						dragged.current = true
					}}
					onDragEnd={onDragEnd}
					onClickCapture={onClickCapture}
				>
					{items.map((p, i) => (
						<div className='workSlider__slide' key={p.slug} aria-hidden={i !== index} inert={i !== index}>
							<WorkCard item={p} />
						</div>
					))}
				</motion.div>
				<div className='workSlider__tab' role='group' aria-label='Выбор проекта'>
					{items.map((p, i) => (
						<button
							key={p.slug}
							type='button'
							className={i === index ? 'workSlider__diamond is-active' : 'workSlider__diamond'}
							aria-label={`Проект ${i + 1}`}
							aria-pressed={i === index}
							onClick={() => go(i)}
						/>
					))}
				</div>
			</div>
			<div className='workSlider__controls'>
				<Button variant='secondary' className='workSlider__arrow' aria-label='Предыдущий проект' disabled={index === 0} onClick={() => go(index - 1)}>
					←
				</Button>
				<Button variant='secondary' className='workSlider__arrow' aria-label='Следующий проект' disabled={index === n - 1} onClick={() => go(index + 1)}>
					→
				</Button>
			</div>
			<div className='workSlider__progress' aria-hidden='true'>
				<i style={{ width: `${100 / n}%`, transform: `translateX(${index * 100}%)` }} />
			</div>
		</div>
	)
}
