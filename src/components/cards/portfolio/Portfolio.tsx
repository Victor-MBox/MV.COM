// scss
import './Portfolio.scss'
import { Link } from 'react-router-dom'
import type { ProjectFact } from '../../../data/projects'

type LinkProps = {
	href: string
	external?: boolean // true => target="_blank" + rel
}

type ImageProps = {
	src: string
	alt?: string
	width?: number
	height?: number
	loading?: 'eager' | 'lazy'
}

type PortfolioProps = {
	className?: string
	tags?: string[]
	title: string
	subtitle?: string
	/** Три факта в ряд: срок / объём / эффект */
	facts?: ProjectFact[]
	link?: LinkProps // если есть — заголовок и кнопка становятся ссылками
	/** Подпись текстовой кнопки внизу карточки, показывается только вместе с link */
	cta?: string
	image?: ImageProps
	onClick?: () => void // опциональный клик по карточке (не ссылка)
}

export default function Portfolio({
	className = '',
	tags = [],
	title,
	subtitle,
	facts = [],
	link,
	cta,
	image,
	onClick,
}: PortfolioProps) {
	const isExternal = link?.external
	const rel = isExternal ? 'noopener noreferrer' : undefined
	const target = isExternal ? '_blank' : undefined
	const alt = image?.alt ?? title

	return (
		<article className={`portfolio ${className}`.trim()} onClick={onClick}>
			<div className='portfolio__column'>
				{tags.length > 0 && (
					<ul className='portfolio__tags' aria-label='Теги'>
						{tags.map((t, i) => (
							<li key={`${t}-${i}`} className='tag'>
								{t}
							</li>
						))}
					</ul>
				)}

				<div className='portfolio__body'>
					<h3 className='portfolio__title'>
						{link?.href && !isExternal ? (
							<Link to={link.href}>{title}</Link>
						) : link?.href ? (
							<a href={link.href} target={target} rel={rel}>
								{title}
							</a>
						) : (
							title
						)}
					</h3>
					{subtitle && <p className='portfolio__subtitle'>{subtitle}</p>}

					{facts.length > 0 && (
						<ul className='portfolio__facts'>
							{facts.map(f => (
								<li key={f.label}>
									<strong>{f.value}</strong>
									<span>{f.label}</span>
								</li>
							))}
						</ul>
					)}

					{link?.href && cta && !isExternal && (
						<Link to={link.href} className='link-btn portfolio__cta'>
							<span>{cta}</span>
						</Link>
					)}
				</div>
			</div>

			{image?.src && (
				<div className='portfolio__column'>
					<figure className='portfolio__figure'>
						<img
							src={image.src}
							alt={alt}
							width={image.width}
							height={image.height}
							loading={image.loading ?? 'lazy'}
						/>
					</figure>
				</div>
			)}
		</article>
	)
}
