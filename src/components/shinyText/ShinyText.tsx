import { ReactNode } from 'react'
import './ShinyText.scss'

interface ShinyTextProps {
	text: string
	icon?: ReactNode
	disabled?: boolean
	speed?: number
	className?: string
}

const ShinyText: React.FC<ShinyTextProps> = ({
	text,
	icon,
	disabled = false,
	speed = 5,
	className = '',
}) => {
	const animationDuration = `${speed}s`

	return (
		<div className={`shiny-text ${disabled ? 'disabled' : ''} ${className}`}>
			{icon && <span className='shiny-text__icon'>{icon}</span>}
			<span className='shiny-text__label' style={{ animationDuration }}>
				{text}
			</span>
		</div>
	)
}

export default ShinyText
