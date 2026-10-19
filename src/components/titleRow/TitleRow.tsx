import { Link } from 'react-router-dom'
import './TitleRow.scss'

type TitleRowProps = {
	title?: string
	/** Подпись текстовой ссылки справа, стрелка добавляется сама: «Все услуги» → «Все услуги →» */
	btn?: string
	to?: string
	onClick?: () => void
}

/** Строка секции: заголовок H2 слева, текстовая ссылка в акцентном цвете справа */
export default function TitleRow({ title, btn, to, onClick }: TitleRowProps) {
	return (
		<div className='titlerow'>
			{title && <h2 className='title'>{title}</h2>}

			{btn && to && (
				<Link to={to} className='textLink'>
					{btn} →
				</Link>
			)}
			{btn && !to && (
				<button className='textLink' type='button' onClick={onClick}>
					{btn} →
				</button>
			)}
		</div>
	)
}
