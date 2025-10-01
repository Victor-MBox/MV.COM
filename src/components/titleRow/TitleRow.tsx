import './TitleRow.scss'

type TitleRowProps = {
	title?: string
	btn?: string
}

export default function TitleRow({ title, btn }: TitleRowProps) {
	return (
		<div className='titlerow'>
			{title && <div className='title'>{title}</div>}

                        {btn && (
                                <button className='btn btn_dark' type='button'>
                                        <span>{btn}</span>
                                </button>
                        )}
		</div>
	)
}
