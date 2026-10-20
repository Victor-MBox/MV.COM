import type { ReactNode } from 'react'
import { MQ, useMediaQuery } from '../../hooks/useMediaQuery'
import Button from '../button/Button'
import './TabCta.scss'

type Props = {
	children: ReactNode
	onClick?: () => void
	className?: string
}

/**
 * Кнопка-язычок hero (docs/design-spec-home4.md §5.1): трапеция 240×52 на нижней кромке секции, как «Hire Me» у Portilo.
 * Фокус-кольцо рисует обёртка — clip-path кнопки его срезал бы. На ≤560 — primary-пилюля на всю ширину.
 */
export default function TabCta({ children, onClick, className }: Props) {
	const phone = useMediaQuery(MQ.phone)
	if (phone) {
		return (
			<Button variant='primary' full className={className} onClick={onClick}>
				{children}
			</Button>
		)
	}
	return (
		<span className={['tabCta', className ?? ''].filter(Boolean).join(' ')}>
			<button type='button' className='tabCta__btn' onClick={onClick}>
				{children}
			</button>
		</span>
	)
}
