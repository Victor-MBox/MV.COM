import type { ReactNode } from 'react'
import './Chip.scss'

type Props = {
	children: ReactNode
	/** Вариант с точкой: без фона, акцентная точка слева (теги под девизом) */
	dot?: boolean
	className?: string
	as?: 'span' | 'li'
}

/** Чип / тег (docs/design-spec.md §6.7): моно 13px на подложке --box-deep; акцентной заливки нет */
export default function Chip({ children, dot, className, as = 'span' }: Props) {
	const Tag = as
	return <Tag className={['uiChip', dot ? 'uiChip--dot' : '', className ?? ''].filter(Boolean).join(' ')}>{children}</Tag>
}
