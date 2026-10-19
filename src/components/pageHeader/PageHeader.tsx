import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import './PageHeader.scss'

type Crumb = { label: string; to?: string }

type Props = {
	title: string
	subtitle?: string
	crumbs?: Crumb[]
	aside?: ReactNode
	/** Иллюстрация над заголовком (страницы офферов) */
	icon?: ReactNode
	/** Кнопки под подзаголовком */
	actions?: ReactNode
	className?: string
}

export default function PageHeader({ title, subtitle, crumbs, aside, icon, actions, className = '' }: Props) {
	return (
		<section className={`pageHeader ${className}`.trim()}>
			<div className='pageHeader__content'>
				{crumbs && crumbs.length > 0 && (
					<nav className='pageHeader__crumbs' aria-label='Хлебные крошки'>
						{crumbs.map((c, i) => (
							<span key={`${c.label}-${i}`}>
								{c.to ? <Link to={c.to}>{c.label}</Link> : <span>{c.label}</span>}
								{i < crumbs.length - 1 && <i aria-hidden='true'>/</i>}
							</span>
						))}
					</nav>
				)}
				{icon && <div className='pageHeader__icon'>{icon}</div>}
				<h1 className='pageHeader__title'>{title}</h1>
				{subtitle && <p className='pageHeader__subtitle'>{subtitle}</p>}
				{actions && <div className='pageHeader__actions'>{actions}</div>}
			</div>
			{aside && <div className='pageHeader__aside'>{aside}</div>}
		</section>
	)
}
