import type { CSSProperties, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './Box.scss'

type Props = {
	children: ReactNode
	className?: string
	/** Вся карточка — ссылка */
	to?: string
	href?: string
	/** Свечение в верхнем левом углу (§4.2): только услуги, кейсы, блок для HR */
	glow?: boolean
	/** Ховер-состояние у некликабельной карточки */
	hover?: boolean
	/** Подпись курсора-ярлыка (§6.12): «смотреть», «читать», «открыть ↗» */
	cursor?: string
	style?: CSSProperties
	as?: 'div' | 'article' | 'li'
}

/** Карточка системы (docs/design-spec.md §6.5): фон --box, радиус 20, без рамки в покое, по ховеру бордер и подъём 2px */
export default function Box({ children, className, to, href, glow, hover, cursor, style, as = 'div' }: Props) {
	const cn = [
		'box',
		glow ? 'box--glow' : '',
		to || href || hover ? 'box--interactive' : '',
		className ?? '',
	]
		.filter(Boolean)
		.join(' ')

	if (to) {
		return (
			<Link to={to} className={cn} style={style} data-cursor={cursor}>
				{children}
			</Link>
		)
	}
	if (href) {
		return (
			<a href={href} className={cn} style={style} data-cursor={cursor} target='_blank' rel='noopener noreferrer'>
				{children}
			</a>
		)
	}
	const Tag = as
	return (
		<Tag className={cn} style={style} data-cursor={cursor}>
			{children}
		</Tag>
	)
}
