// scss
import './TitleSubtitle.scss'

type TitleSubtitleProps = {
	/** Главный заголовок (может отсутствовать) */
	title?: string
	/** Под-заголовок (может отсутствовать) */
	subtitle?: string
}

export default function TitleSubtitle({ title, subtitle }: TitleSubtitleProps) {
	return (
		<>
			{title && <div className='title'>{title}</div>}

			{subtitle && <div className='sub-title'>{subtitle}</div>}
		</>
	)
}
