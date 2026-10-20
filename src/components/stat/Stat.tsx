import CountUp from '../countUp/CountUp'
import { MQ, useMediaQuery } from '../../hooks/useMediaQuery'
import { NBSP, formatStat } from './formatStat'
import './Stat.scss'

export type StatItem = {
	/** Число для счётчика или строка («Февраль 2026») без анимации */
	value: number | string
	suffix?: string
	label: string
}

type Props = StatItem & {
	/** hero — clamp(40, 4vw, 64); card — 32px */
	size?: 'hero' | 'card'
	/** Акцентный цвет числа — только в hero (§6.6) */
	accent?: boolean
	/** Задержка старта счётчика, с (интро hero) */
	delay?: number
	/** false — без счётчика, сразу итог (возврат на страницу, интро не повторяется) */
	animate?: boolean
	className?: string
}


/**
 * Цифра-доказательство (docs/design-spec.md §6.6): число + суффикс + подпись моно. Счётчик — существующий CountUp (gsap):
 * 0 → значение за 1200 мс power2.out при 30% видимости, один раз. Невидимый дубль итога держит ширину, чтобы вёрстка не прыгала.
 * При reduced-motion и для строковых значений — сразу итог.
 */
export default function Stat({ value, suffix = '', label, size = 'hero', accent, delay = 0, animate = true, className }: Props) {
	const reduced = useMediaQuery(MQ.reduced)
	const numeric = typeof value === 'number'
	const final = numeric ? formatStat(value) : value
	const cn = ['stat', `stat--${size}`, accent ? 'stat--accent' : '', className ?? ''].filter(Boolean).join(' ')

	return (
		<div className={cn}>
			<span className='stat__num'>
				<span className='stat__ghost' aria-hidden='true'>
					{final}
					{suffix}
				</span>
				<span className='stat__live'>
					{numeric && animate && !reduced ? (
						<CountUp to={value} duration={1.2} delay={delay} separator={NBSP} inViewAmount={0.3} ease='power2.out' />
					) : (
						final
					)}
					{suffix}
				</span>
			</span>
			<span className='stat__label'>{label}</span>
		</div>
	)
}
