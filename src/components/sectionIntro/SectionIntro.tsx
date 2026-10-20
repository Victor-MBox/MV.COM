import { Fragment } from 'react'
import { Link } from 'react-router-dom'
import './SectionIntro.scss'

type Props = {
	/** Номер секции «01» (ТЗ §9–14) */
	num: string
	/** Слово подписи без номера: «Проекты» → 01 / ПРОЕКТЫ (верхний регистр ставит CSS) */
	label: string
	/** Заголовок; массив — строки с принудительным переносом */
	title: string | string[]
	/** Крупный H2 52–60px (проекты, процесс, финал) или обычный 38–44px */
	size?: 'big' | 'regular'
	lead?: string
	/** Ссылка справа от заголовка: «Все проекты ↗» */
	action?: { label: string; to: string }
	/** Всё по центру (финальный CTA) */
	center?: boolean
	/** Без нижнего отступа: заголовок стоит внутри текстовой колонки («Обо мне», процесс) */
	compact?: boolean
	/** id заголовка для aria-labelledby секции */
	id?: string
	className?: string
}

/**
 * Шапка секции /home5 (ТЗ §4–5): подпись «01 / Проекты», H2 двух размеров, лид до 60 символов в строке, действие справа.
 * Сетка с именованными областями: на десктопе действие стоит справа на базовой линии заголовка, на ≤768 — под лидом
 */
export default function SectionIntro({ num, label, title, size = 'regular', lead, action, center, compact, id, className }: Props) {
	const lines = Array.isArray(title) ? title : [title]
	const cn = [
		'sectionIntro',
		`sectionIntro--${size}`,
		center ? 'sectionIntro--center' : '',
		compact ? 'sectionIntro--compact' : '',
		className ?? '',
	]
		.filter(Boolean)
		.join(' ')

	return (
		<div className={cn}>
			<p className='sectionIntro__label'>
				<span className='sectionIntro__num'>{num}</span>
				<span className='sectionIntro__slash' aria-hidden='true'>
					/
				</span>
				{label}
			</p>
			<h2 className='sectionIntro__title' id={id}>
				{lines.map((line, i) => (
					<Fragment key={line}>
						{i > 0 && <br />}
						{line}
					</Fragment>
				))}
			</h2>
			{lead && <p className='sectionIntro__lead'>{lead}</p>}
			{action && (
				<Link className='sectionIntro__action' to={action.to}>
					{action.label}
					<span className='sectionIntro__arrow' aria-hidden='true'>
						↗
					</span>
				</Link>
			)}
		</div>
	)
}
