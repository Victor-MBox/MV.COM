import React from 'react'
import './Card.scss'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card: React.FC<CardProps> = ({ children, className, ...rest }) => {
	const cn = ['card', className].filter(Boolean).join(' ')
	return (
		<div className={cn} {...rest}>
			{children}
		</div>
	)
}

export default Card
