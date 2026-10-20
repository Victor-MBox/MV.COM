import type { ReactNode } from 'react'
import './StatusPill.scss'

type Props = {
	children: ReactNode
	className?: string
}

/** Статус-пилюля с пульсом (docs/design-spec-home4.md §5.7): стекло 36px, точка --ok с расходящимся ореолом; при reduced-motion без пульса */
export default function StatusPill({ children, className }: Props) {
	return (
		<span className={['statusPill', className ?? ''].filter(Boolean).join(' ')}>
			<i className='statusPill__dot' aria-hidden='true' />
			{children}
		</span>
	)
}
