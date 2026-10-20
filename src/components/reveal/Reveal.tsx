import type { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { MQ, useMediaQuery, useStagger } from '../../hooks/useMediaQuery'

type Tag = 'div' | 'li' | 'section' | 'article' | 'ul' | 'ol'

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
}

const MAX_STAGGERED = 8
const TAGS = {
	div: motion.div,
	li: motion.li,
	section: motion.section,
	article: motion.article,
	ul: motion.ul,
	ol: motion.ol,
}

/**
 * Появление блока при прокрутке (docs/design-spec.md §8.3): opacity 0→1, y 24→0, 600 мс, один раз,
 * старт при 15% видимости с rootMargin −10% снизу. При reduced-motion — один opacity за 240 мс.
 */
export default function Reveal({ children, className, delay = 0, y = 24, index, as = 'div', id }: Props) {
	const reduced = useMediaQuery(MQ.reduced)
	const stagger = useStagger()
	const Tag = TAGS[as]
	const staggerDelay = index !== undefined && index < MAX_STAGGERED ? index * stagger : 0

	return (
		<Tag
			id={id}
			className={className}
			initial={{ opacity: 0, y: reduced ? 0 : y }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, amount: 0.15, margin: '0px 0px -10% 0px' }}
			transition={reduced ? { duration: 0.24 } : { duration: 0.6, delay: delay + staggerDelay, ease: [0.2, 0.7, 0.2, 1] }}
		>
			{children}
		</Tag>
	)
}
