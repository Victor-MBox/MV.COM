import type { ReactNode } from 'react'
import SectionHead from '../sectionHead/SectionHead'
import type { Headline } from '../sectionHead/SectionHead'
import './PageHead.scss'

type Props = {
	/** Слово метки без слэшей: «услуги» → // услуги */
	label: string
	/** H1 с одним выделением (accent или muted) */
	title: Headline
	/** Лид до 56ch */
	lead?: ReactNode
	/** Строка моно под лидом: крошки, срок, дата */
	meta?: ReactNode
	/** Кнопки под лидом */
	actions?: ReactNode
	/** Правая колонка: цифры, статус, фото */
	aside?: ReactNode
	/** На ≤992 aside идёт сразу под заголовком, до кнопок (фото на «Обо мне») */
	asideFirst?: boolean
	className?: string
}

/**
 * Шапка внутренней страницы (docs/design-spec.md §9): метка `// раздел`, H1 с одним акцентом, лид, без баннеров и градиентов.
 * Стоит под прозрачной липкой шапкой сайта (padding-top учитывает --header-h), снизу линия на всю ширину контейнера —
 * тот же приём, что у верхнего ряда hero главной
 */
export default function PageHead({ label, title, lead, meta, actions, aside, asideFirst, className }: Props) {
	const cn = ['pageHead', aside ? 'pageHead--aside' : '', aside && asideFirst ? 'pageHead--asideFirst' : '', className ?? '']
		.filter(Boolean)
		.join(' ')

	return (
		<header className={cn}>
			<div className='container pageHead__in'>
				<div className='pageHead__main'>
					<SectionHead as='h1' label={label} title={title} lead={lead} className='pageHead__head' />
					{meta && <p className='pageHead__meta'>{meta}</p>}
					{actions && <div className='pageHead__actions'>{actions}</div>}
				</div>
				{aside && <div className='pageHead__aside'>{aside}</div>}
			</div>
		</header>
	)
}
