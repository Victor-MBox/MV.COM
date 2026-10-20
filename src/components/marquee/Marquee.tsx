import type { CSSProperties, ReactNode } from 'react'
import './Marquee.scss'

type Props = {
	children: ReactNode
	/** Полный цикл, с: 30 для тегов, 20 для CTA-строки */
	duration?: number
	className?: string
	label?: string
}

/**
 * Бегущая строка (docs/design-spec.md §6.11): содержимое дублируется, translateX 0→−50% по кругу, пауза по ховеру,
 * края растворены маской. При reduced-motion — статичная строка с переносом, без дубля. Не больше двух на страницу.
 */
export default function Marquee({ children, duration = 30, className, label }: Props) {
	const style = { '--marquee-duration': `${duration}s` } as CSSProperties
	return (
		<div className={['marquee', className ?? ''].filter(Boolean).join(' ')} style={style} aria-label={label}>
			<div className='marquee__track'>
				<div className='marquee__copy'>{children}</div>
				<div className='marquee__copy' aria-hidden='true'>
					{children}
				</div>
			</div>
		</div>
	)
}
