import React from 'react'
import './Card.scss'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card: React.FC<CardProps> = ({ children, ...rest }) => {
	return (
		<div className='card' {...rest}>
			{children}
		</div>
	)
}

export default Card
