import CountUp from '../countUp/CountUp'
import { MQ, useMediaQuery } from '../../hooks/useMediaQuery'
import { NBSP, RANGE_DASH, formatStat } from './formatStat'
import type { StatRange } from './formatStat'
import './Stat.scss'

export type StatItem = {
	/** Число для счётчика, диапазон [от, до] (считаются обе границы) или строка («Февраль 2026») без анимации */
	value: number | StatRange | string
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
 * 0 → значение за 1200 мс power2.out при 30% видимости, один раз (у диапазона «300–800» — обе границы). Невидимый дубль итога
 * держит ширину, чтобы вёрстка не прыгала.
 * При reduced-motion и для строковых значений — сразу итог. Пока число считается, диктор читает итог из .srOnly, а не «0»
 */
export default function Stat({ value, suffix = '', label, size = 'hero', accent, delay = 0, animate = true, className }: Props) {
	const reduced = useMediaQuery(MQ.reduced)
	const numeric = typeof value !== 'string'
	const final = numeric ? formatStat(value) : value
	const counting = numeric && animate && !reduced
	const count = (to: number) => <CountUp to={to} duration={1.2} delay={delay} separator={NBSP} inViewAmount={0.3} ease='power2.out' />
	const cn = ['stat', `stat--${size}`, accent ? 'stat--accent' : '', className ?? ''].filter(Boolean).join(' ')

	return (
		<div className={cn}>
			<span className='stat__num'>
				<span className='stat__ghost' aria-hidden='true'>
					{final}
					{suffix}
				</span>
				<span className='stat__live' aria-hidden={counting || undefined}>
					{!counting ? (
						final
					) : typeof value === 'number' ? (
						count(value)
					) : (
						<>
							{count(value[0])}
							{RANGE_DASH}
							{count(value[1])}
						</>
					)}
					{suffix}
				</span>
				{counting && (
					<span className='srOnly'>
						{final}
						{suffix}
					</span>
				)}
			</span>
			<span className='stat__label'>{label}</span>
		</div>
	)
}
