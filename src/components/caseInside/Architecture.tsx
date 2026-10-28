import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'
import SectionHead from '../sectionHead/SectionHead'
import type { Headline } from '../sectionHead/SectionHead'
import type { ArchNode } from '../../data/caseInside'
import { MQ, useMediaQuery } from '../../hooks/useMediaQuery'
import { clamp, pad2, useScrollValue, useStep } from './timeline'
import './Architecture.scss'

type Props = {
	head: { label: string; title: Headline; lead: string }
	nodes: ArchNode[]
}

/** Геометрия ленты, px: колонки узлов и дорожки. Лента начинается у левого края контейнера и заканчивается у правого */
const NODE_W = 360
const STEP = 520
const COLS = 4
const TRACK_W = (COLS - 1) * STEP + NODE_W
const TRACK_H = 656
const LANE_TOP = { up: 0, main: 232, down: 456 } as const
const MAIN_H = 200
const UP_H = 200
const MAIN_Y = LANE_TOP.main + MAIN_H / 2
/** Нижняя граница масштаба ленты на низких экранах */
const MIN_SCALE = 0.62
const nodeX = (col: number) => col * STEP
/** Прогресс, на котором пакет доходит до колонки */
const AT_COL = (col: number) => 0.06 + col * (0.8 / (COLS - 1))
const SPARK = 0.08

function Spark({ prog, node }: { prog: MotionValue<number>; node: ArchNode }) {
	const from = AT_COL(node.col)
	const target = node.lane === 'up' ? UP_H : LANE_TOP.down
	const top = useTransform(prog, [from, from + SPARK], [MAIN_Y, target])
	const opacity = useTransform(prog, [from - 0.01, from, from + SPARK, from + SPARK + 0.02], [0, 1, 1, 0])
	return <motion.i className='insideArch__spark' style={{ left: nodeX(node.col) + NODE_W / 2, top, opacity }} />
}

function Node({ node, lit, index }: { node: ArchNode; lit: boolean; index: number }) {
	return (
		<div className={`insideArch__node insideArch__node--${node.lane}${lit ? ' is-lit' : ''}`} style={{ left: nodeX(node.col), top: LANE_TOP[node.lane] }}>
			<NodeBody node={node} index={index} />
		</div>
	)
}

function NodeBody({ node, index }: { node: ArchNode; index: number }) {
	return (
		<>
			<span className='insideArch__nodeLabel'>{pad2(index + 1)}</span>
			<h3 className='insideArch__nodeTitle'>{node.title}</h3>
			<p className='insideArch__nodeWhat'>{node.what}</p>
			<p className='insideArch__nodeWhy'>
				<span>почему</span>
				{node.why}
			</p>
		</>
	)
}

/**
 * Горизонтальная секция «архитектура»: страница листается вниз, лента узлов едет вбок, пакет-запрос идёт по пути
 * браузер → Nginx → Laravel → MySQL, искры уходят в ветки (WebRTC, Reverb, очередь, планировщик), узлы подсвечиваются.
 * Секция выше окна на длину ленты, лента залипает под шапкой. На ≤992 и при reduced-motion — обычный список узлов
 */
export default function Architecture({ head, nodes }: Props) {
	const ref = useRef<HTMLElement>(null)
	const viewRef = useRef<HTMLDivElement>(null)
	const stacked = useMediaQuery(MQ.tablet)
	const reduced = useMediaQuery(MQ.reduced)
	const flat = stacked || reduced
	const [len, setLen] = useState(0)
	const [scale, setScale] = useState(1)
	const lenMV = useMotionValue(0)
	/** Отступ ленты от левого края окна — край контейнера */
	const offMV = useMotionValue(0)

	// Масштаб ленты под высоту залипшего блока (низкие экраны) и длина горизонтального хода: сколько ленты не влезает
	useEffect(() => {
		if (flat) return
		const view = viewRef.current
		const section = ref.current
		if (!view || !section) return
		const measure = () => {
			const pin = section.querySelector<HTMLElement>('.insideArch__pin')
			const rest = Array.from(section.querySelectorAll<HTMLElement>('.insideArch__head, .insideArch__hint')).reduce((sum, el) => sum + el.offsetHeight, 0)
			const avail = (pin?.clientHeight ?? TRACK_H) - rest - 48
			const s = clamp(avail / TRACK_H, MIN_SCALE, 1)
			const off = section.querySelector('.sectionHead')?.getBoundingClientRect().left ?? 0
			const l = Math.max(0, Math.round(TRACK_W * s) + off * 2 - view.clientWidth)
			setScale(s)
			setLen(l)
			lenMV.set(l)
			offMV.set(off)
		}
		const ro = new ResizeObserver(measure)
		ro.observe(view)
		window.addEventListener('resize', measure)
		measure()
		return () => {
			ro.disconnect()
			window.removeEventListener('resize', measure)
		}
	}, [flat, lenMV, offMV])

	const compute = useCallback(() => {
		const el = ref.current
		if (!el || flat) return 1
		const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72
		const r = el.getBoundingClientRect()
		const pin = window.innerHeight - header
		return clamp((header - r.top) / Math.max(1, r.height - pin))
	}, [flat])
	const prog = useScrollValue(compute)
	const x = useTransform([prog, lenMV, offMV], ([v, l, off]) => (off as number) - (v as number) * (l as number))
	const packetX = useTransform(prog, [AT_COL(0), AT_COL(COLS - 1)], [nodeX(0) + NODE_W / 2, nodeX(COLS - 1) + NODE_W / 2])
	// Узел подсвечен, когда пакет дошёл до его колонки (ветки — когда дошла искра)
	const litAt = (n: ArchNode) => AT_COL(n.col) + (n.lane === 'main' ? 0 : SPARK)
	const thresholds = [...new Set(nodes.map(litAt))].sort((a, b) => a - b)
	const step = useStep(prog, thresholds)
	const reached = step ? thresholds[step - 1] : -1

	if (flat) {
		return (
			<section className='section insideArch insideArch--flat' id='architecture'>
				<div className='container'>
					<SectionHead label={head.label} title={head.title} lead={head.lead} />
					<ol className='insideArch__list'>
						{nodes.map((n, i) => (
							<li className='insideArch__node is-lit' key={n.key}>
								<NodeBody node={n} index={i} />
							</li>
						))}
					</ol>
				</div>
			</section>
		)
	}

	const mains = nodes.filter(n => n.lane === 'main')
	return (
		<section className='insideArch' id='architecture' ref={ref} style={{ height: `calc(100vh - var(--header-h) + ${len}px)` }}>
			<div className='insideArch__pin'>
				<div className='container insideArch__head'>
					<SectionHead label={head.label} title={head.title} lead={head.lead} />
				</div>
				<div className='insideArch__viewport' ref={viewRef} style={{ height: Math.round(TRACK_H * scale) }}>
					<motion.div className='insideArch__track' style={{ x, scale, width: TRACK_W, height: TRACK_H }} aria-hidden='true'>
						<i className='insideArch__line' style={{ left: nodeX(0) + NODE_W / 2, width: (COLS - 1) * STEP, top: MAIN_Y }} />
						{nodes
							.filter(n => n.lane !== 'main')
							.map(n => (
								<i
									className='insideArch__vline'
									key={n.key}
									style={{
										left: nodeX(n.col) + NODE_W / 2,
										top: n.lane === 'up' ? UP_H : MAIN_Y,
										height: n.lane === 'up' ? MAIN_Y - UP_H : LANE_TOP.down - MAIN_Y,
									}}
								/>
							))}
						{nodes.map((n, i) => (
							<Node node={n} lit={litAt(n) <= reached} index={i} key={n.key} />
						))}
						{nodes
							.filter(n => n.lane !== 'main')
							.map(n => (
								<Spark prog={prog} node={n} key={n.key} />
							))}
						<motion.i className='insideArch__packet' style={{ left: packetX, top: MAIN_Y }} />
					</motion.div>
				</div>
				<p className='insideArch__hint'>
					{mains.map(n => n.title).join(' → ')}
				</p>
			</div>
		</section>
	)
}
