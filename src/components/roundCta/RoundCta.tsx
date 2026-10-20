import type { PointerEvent } from 'react'
import './RoundCta.scss'

type Props = {
	onClick: () => void
	className?: string
	/** Две строки подписи */
	label?: [string, string]
}

/**
 * Круглая CTA hero (docs/design-spec.md §6.3): стекло, по ховеру из точки входа курсора раскрывается
 * акцентный круг (clip-path), на ≤560 превращается в primary-пилюлю. Только CSS-переменные --x/--y.
 */
export default function RoundCta({ onClick, className, label = ['Обсудить', 'проект'] }: Props) {
	const setOrigin = (e: PointerEvent<HTMLButtonElement>) => {
		const r = e.currentTarget.getBoundingClientRect()
		e.currentTarget.style.setProperty('--x', `${e.clientX - r.left}px`)
		e.currentTarget.style.setProperty('--y', `${e.clientY - r.top}px`)
	}

	return (
		<button
			type='button'
			className={['roundCta', className ?? ''].filter(Boolean).join(' ')}
			onPointerEnter={setOrigin}
			onPointerLeave={setOrigin}
			onClick={onClick}
		>
			<span className='roundCta__fill' aria-hidden='true' />
			<span className='roundCta__label'>
				<span>{label[0]}</span>
				<span>{label[1]}</span>
			</span>
		</button>
	)
}
