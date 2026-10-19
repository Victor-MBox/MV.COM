import { Link } from 'react-router-dom'
import './TitleRow.scss'

type TitleRowProps = {
	title?: string
	btn?: string
	to?: string
	onClick?: () => void
}

export default function TitleRow({ title, btn, to, onClick }: TitleRowProps) {
	return (
		<div className='titlerow'>
			{title && <div className='title'>{title}</div>}

			{btn && to && (
				<Link to={to} className='btn btn_dark'>
					<span>{btn}</span>
				</Link>
			)}
			{btn && !to && (
				<button className='btn btn_dark' type='button' onClick={onClick}>
					<span>{btn}</span>
				</button>
			)}
		</div>
	)
}
