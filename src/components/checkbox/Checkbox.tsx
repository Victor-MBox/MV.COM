import type { ReactNode } from 'react'
import './Checkbox.scss'

type Props = {
	checked: boolean
	onChange: (checked: boolean) => void
	children: ReactNode
	name?: string
	id?: string
	/** Красная рамка и aria-invalid */
	invalid?: boolean
	/** id текста ошибки под чекбоксом */
	describedBy?: string
	/** Обязательное согласие — aria-required для экранных дикторов (форма с noValidate) */
	required?: boolean
	className?: string
}

/**
 * Чекбокс формы (согласие в LeadForm и футере): нативный input остаётся в DOM и в порядке фокуса, рисуется квадрат 20px
 * с галочкой-SVG; акцентная заливка только в отмеченном состоянии. Подпись — дети, кликабельна вся строка
 */
export default function Checkbox({ checked, onChange, children, name, id, invalid, describedBy, required, className }: Props) {
	const cn = ['checkbox', invalid ? 'is-invalid' : '', className ?? ''].filter(Boolean).join(' ')
	return (
		<label className={cn}>
			<input
				id={id}
				type='checkbox'
				name={name}
				checked={checked}
				onChange={e => onChange(e.target.checked)}
				aria-invalid={invalid || undefined}
				aria-required={required || undefined}
				aria-describedby={describedBy}
			/>
			<span className='checkbox__box' aria-hidden='true'>
				<svg viewBox='0 0 12 12' fill='none'>
					<path d='M2.5 6.2 5 8.6l4.5-5.2' />
				</svg>
			</span>
			<span className='checkbox__label'>{children}</span>
		</label>
	)
}
