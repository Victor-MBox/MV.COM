import type { CSSProperties, ReactNode } from 'react'
import { motion } from 'framer-motion'
import { MQ, useMediaQuery, useStagger } from '../../hooks/useMediaQuery'

type Tag = 'div' | 'li' | 'section' | 'article' | 'ul' | 'ol' | 'p'

type Props = {
	children: ReactNode
	className?: string
	/** Задержка появления в секундах */
	delay?: number
	/** Начальный сдвиг снизу в пикселях */
	y?: number
	/** Порядок в группе: задержка index × stagger, после восьмого — без задержки (§8.3) */
	index?: number
	as?: Tag
	id?: string
	style?: CSSProperties
}

const MAX_STAGGERED = 8
const TAGS = {
	div: motion.div,
	li: motion.li,
	section: motion.section,
	article: motion.article,
	ul: motion.ul,
	ol: motion.ol,
	p: motion.p,
}

/**
 * Появление блока при прокрутке (docs/design-spec.md §8.3): opacity 0→1, y 24→0, 600 мс, один раз,
 * старт при 15% видимости с rootMargin −10% снизу. При reduced-motion блок сразу на месте и виден — текст и числа
 * не ждут прокрутки (ТЗ от 21.10.2026, приёмка)
 */
export default function Reveal({ children, className, delay = 0, y = 24, index, as = 'div', id, style }: Props) {
	const reduced = useMediaQuery(MQ.reduced)
	const stagger = useStagger()
	const Tag = TAGS[as]
	const staggerDelay = index !== undefined && index < MAX_STAGGERED ? index * stagger : 0

	return (
		<Tag
			id={id}
			className={className}
			style={style}
			initial={reduced ? false : { opacity: 0, y }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.15, margin: '0px 0px -10% 0px' }}
			transition={{ duration: 0.6, delay: delay + staggerDelay, ease: [0.2, 0.7, 0.2, 1] }}
		>
			{children}
		</Tag>
	)
}
