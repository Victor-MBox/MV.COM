import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import SplitLines from '../splitLines/SplitLines'
import './SectionHead.scss'

/** H2 с одним выделением: accent — акцентное слово (§5.3) или muted — приглушённый хвост фразы (docs/design-spec-home4.md §3.2); никогда оба */
export type Headline = { text: string; accent?: string; muted?: string }

type Action = { label: string; to?: string; href?: string; onClick?: () => void }

type Props = {
	/** Слово метки без слэшей: «услуги» → // услуги */
	label: string
	title: Headline
	lead?: ReactNode
	action?: Action
	/** Вариант с разделителями: H2 по центру между двумя линиями (один раз на странице) */
	divided?: boolean
	className?: string
	as?: 'h2' | 'h1'
}

/** Метка секции и шапка (docs/design-spec.md §5.4, §6.4): // слово, действие справа, H2 с одним акцентом, лид до 56ch */
export default function SectionHead({ label, title, lead, action, divided, className, as = 'h2' }: Props) {
	const cn = ['sectionHead', divided ? 'sectionHead--divided' : '', className ?? ''].filter(Boolean).join(' ')
	const actionNode = action
		? (() => {
				const text = (
					<>
						{action.label}
						<span className='sectionHead__arrow' aria-hidden='true'>
							→
						</span>
					</>
				)
				if (action.to) {
					return (
						<Link className='sectionHead__action' to={action.to}>
							{text}
						</Link>
					)
				}
				if (action.href) {
					return (
						<a className='sectionHead__action' href={action.href} target='_blank' rel='noopener noreferrer'>
							{text}
						</a>
					)
				}
				return (
					<button type='button' className='sectionHead__action' onClick={action.onClick}>
						{text}
					</button>
				)
			})()
		: null

	return (
		<div className={cn}>
			<div className='sectionHead__row'>
				<p className='sectionHead__label'>
					<span className='sectionHead__slashes' aria-hidden='true'>
						//
					</span>{' '}
					{label}
				</p>
				{actionNode}
			</div>
			<div className='sectionHead__titleRow'>
				<SplitLines as={as} className='sectionHead__title' text={title.text} accent={title.accent} muted={title.muted} />
			</div>
			{lead && <p className='sectionHead__lead'>{lead}</p>}
		</div>
	)
}
