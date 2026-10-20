import { Fragment, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { motion, useInView } from 'framer-motion'
import { MQ, useMediaQuery } from '../../hooks/useMediaQuery'
import './SplitLines.scss'

type Tag = 'h1' | 'h2' | 'h3' | 'p' | 'div'

type Props = {
	/** Текст заголовка; строки измеряются после загрузки шрифтов */
	text?: string
	/** Подстрока text, которая станет <span class="accent"> — одно вхождение (§5.3) */
	accent?: string
	/** Подстрока text, которая станет <span class="muted"> — приглушённый хвост H2 (docs/design-spec-home4.md §3.2); не вместе с accent */
	muted?: string
	/** Ручная разбивка по строкам (девиз), измерение не нужно */
	lines?: string[]
	as?: Tag
	className?: string
	id?: string
	/** 'view' — при появлении в зоне видимости, 'now' — сразу после монтирования (hero) */
	trigger?: 'view' | 'now'
	/** Задержка первой строки, с */
	delay?: number
	/** Без анимации (интро уже проигрывалось в этой сессии) */
	instant?: boolean
	/** Длительность выезда строки, с (0.7 по §8.3; 0.36 у номера витрины услуг главной) */
	duration?: number
}

type Tone = 'accent' | 'muted'
type Word = { text: string; tone?: Tone }

const TAGS = { h1: motion.h1, h2: motion.h2, h3: motion.h3, p: motion.p, div: motion.div }
const LINE_STAGGER = 0.08
const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const

function toWords(text: string, accent?: string, muted?: string): Word[] {
	const tone: Tone | undefined = accent ? 'accent' : muted ? 'muted' : undefined
	const mark = accent || muted
	const start = mark ? text.indexOf(mark) : -1
	const end = start >= 0 && mark ? start + mark.length : -1
	const words: Word[] = []
	const re = /\S+/g
	let m: RegExpExecArray | null
	while ((m = re.exec(text))) {
		const wordEnd = m.index + m[0].length
		const marked = start >= 0 && m.index >= start && wordEnd <= end
		words.push(marked ? { text: m[0], tone } : { text: m[0] })
	}
	return words
}

/**
 * Разбивка заголовка по строкам с масками (docs/design-spec.md §8.3): строка выезжает y 110%→0 за 700 мс
 * с задержкой 80 мс на строку. Строки измеряются после document.fonts.ready и пересчитываются при смене ширины.
 * При reduced-motion — одно появление opacity за 240 мс. Только девиз и H2.
 */
export default function SplitLines({
	text = '',
	accent,
	muted,
	lines: manualLines,
	as = 'h2',
	className,
	id,
	trigger = 'view',
	delay = 0,
	instant = false,
	duration = 0.7,
}: Props) {
	const reduced = useMediaQuery(MQ.reduced)
	const ref = useRef<HTMLDivElement & HTMLHeadingElement & HTMLParagraphElement>(null)
	const measuredWidth = useRef(0)
	const [lines, setLines] = useState<Word[][] | null>(() =>
		manualLines ? manualLines.map(l => toWords(l)) : null
	)
	const inView = useInView(ref, { once: true, amount: 0.15, margin: '0px 0px -10% 0px' })
	const Tag = TAGS[as]
	const words = toWords(text, accent, muted)
	const key = manualLines ? manualLines.join('\n') : `${text}|${accent ?? ''}|${muted ?? ''}`

	// Измерение строк после загрузки шрифтов (только для автоматической разбивки)
	useLayoutEffect(() => {
		if (manualLines || lines) return
		let cancelled = false
		document.fonts.ready.then(() => {
			const root = ref.current
			if (cancelled || !root) return
			const spans = Array.from(root.querySelectorAll<HTMLSpanElement>('.splitLines__w'))
			const groups: Word[][] = []
			let lastTop: number | null = null
			spans.forEach((span, i) => {
				if (lastTop === null || Math.abs(span.offsetTop - lastTop) > 2) {
					groups.push([])
					lastTop = span.offsetTop
				}
				groups[groups.length - 1].push(words[i])
			})
			measuredWidth.current = root.clientWidth
			setLines(groups.length ? groups : [words])
		})
		return () => {
			cancelled = true
		}
		// words выводится из key; сам массив пересоздаётся каждый рендер
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [key, lines, manualLines])

	// Смена ширины — пересчитать строки
	useEffect(() => {
		if (manualLines) return
		const root = ref.current
		if (!root) return
		const ro = new ResizeObserver(entries => {
			const width = Math.round(entries[0].contentRect.width)
			if (measuredWidth.current && width !== measuredWidth.current) {
				measuredWidth.current = 0
				setLines(null)
			}
		})
		ro.observe(root)
		return () => ro.disconnect()
	}, [manualLines])

	const play = instant ? 'in' : trigger === 'now' ? (lines ? 'in' : 'out') : inView ? 'in' : 'out'
	const style = { '--sl-delay': `${delay}s` } as CSSProperties

	if (!lines) {
		return (
			<Tag ref={ref} id={id} className={['splitLines', 'splitLines--measuring', className ?? ''].join(' ').trim()}>
				{words.map((w, i) => (
					<Fragment key={i}>
						{i > 0 && ' '}
						<span className={w.tone ? `splitLines__w ${w.tone}` : 'splitLines__w'}>{w.text}</span>
					</Fragment>
				))}
			</Tag>
		)
	}

	return (
		<Tag ref={ref} id={id} className={['splitLines', className ?? ''].join(' ').trim()} style={style}>
			{lines.map((line, li) => (
				<span key={li} className='splitLines__line'>
					<motion.span
						className='splitLines__inner'
						initial={instant ? false : reduced ? { opacity: 0 } : { y: '110%' }}
						animate={play === 'in' ? (reduced ? { opacity: 1 } : { y: 0 }) : undefined}
						transition={
							reduced
								? { duration: 0.24 }
								: { duration, ease: EASE_IN_OUT, delay: delay + li * LINE_STAGGER }
						}
					>
						{line.map((w, wi) => (
							<Fragment key={wi}>
								{wi > 0 && ' '}
								{w.tone ? <span className={w.tone}>{w.text}</span> : w.text}
							</Fragment>
						))}
					</motion.span>
				</span>
			))}
		</Tag>
	)
}
