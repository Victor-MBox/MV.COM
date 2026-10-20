import type { MouseEventHandler, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './Button.scss'

export type ButtonVariant = 'primary' | 'secondary' | 'text'

type Props = {
	children: ReactNode
	variant?: ButtonVariant
	className?: string
	/** Внутренняя ссылка */
	to?: string
	/** Внешняя ссылка или файл */
	href?: string
	download?: boolean
	type?: 'button' | 'submit'
	disabled?: boolean
	/** На всю ширину контейнера */
	full?: boolean
	/** Стрелка «→» справа (по умолчанию только у варианта text) */
	arrow?: boolean
	onClick?: MouseEventHandler<HTMLElement>
	'aria-label'?: string
}

/** Кнопки системы (docs/design-spec.md §6.2): primary — пилюля с акцентом, secondary — стекло, text — текст со стрелкой */
export default function Button({
	children,
	variant = 'primary',
	className,
	to,
	href,
	download,
	type = 'button',
	disabled,
	full,
	arrow,
	onClick,
	'aria-label': ariaLabel,
}: Props) {
	const showArrow = arrow ?? variant === 'text'
	const cn = ['button', `button--${variant}`, full ? 'button--full' : '', className ?? ''].filter(Boolean).join(' ')
	const inner = (
		<>
			<span className='button__label'>{children}</span>
			{showArrow && (
				<span className='button__arrow' aria-hidden='true'>
					→
				</span>
			)}
		</>
	)

	if (to) {
		return (
			<Link to={to} className={cn} onClick={onClick} aria-label={ariaLabel}>
				{inner}
			</Link>
		)
	}
	if (href) {
		const external = /^https?:/.test(href)
		return (
			<a
				href={href}
				className={cn}
				download={download}
				target={external ? '_blank' : undefined}
				rel={external ? 'noopener noreferrer' : undefined}
				onClick={onClick}
				aria-label={ariaLabel}
			>
				{inner}
			</a>
		)
	}
	return (
		<button type={type} className={cn} disabled={disabled} onClick={onClick} aria-label={ariaLabel}>
			{inner}
		</button>
	)
}
