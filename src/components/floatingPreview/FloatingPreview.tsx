import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import type { ProjectPreview } from '../../data/projects'
import { MQ, useMediaQuery } from '../../hooks/useMediaQuery'
import './FloatingPreview.scss'

type Props = {
	preview: ProjectPreview
	className?: string
}

/** Интерполяция сдвига к цели за кадр */
const LERP = 0.08
/** Сдвиг ближнего слоя (depth 1) при курсоре у края сцены, px; дальние слои — пропорционально depth */
const AMPLITUDE = 12
/** Доля сцены в окне, при которой слои начинают проявляться */
const VISIBLE = 0.3

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/**
 * Интерактивная обложка кейса (ТЗ от 22.10.2026): настоящие элементы интерфейса продукта — вырезки из скриншотов
 * с альфа-маской по форме углов — парят на тёмной сцене на разной глубине. Слой: позиция и ширина в процентах сцены
 * (`left`, `top`, `width`), глубина `depth` 0…1 задаёт амплитуду параллакса, размах и скорость покачивания.
 * Движение: покачивание — CSS-анимация transform; параллакс от курсора — requestAnimationFrame поверх всей карточки
 * (`.box`), только при hover-устройстве без reduced-motion; наведение на слой — подъём и тень (CSS); появление —
 * IntersectionObserver ставит `is-in`, слои проявляются по очереди через transition-delay. При reduced-motion слои
 * сразу на месте, без покачивания и параллакса. На ≤560 остаются только слои с `phone` (главная карточка обязательна).
 * Слои декоративны: внутри ссылки на кейс нет своих действий, картинки с пустым alt, сцена описана одной подписью
 */
export default function FloatingPreview({ preview, className }: Props) {
	const stageRef = useRef<HTMLDivElement>(null)
	const reduced = useMediaQuery(MQ.reduced)
	const hoverable = useMediaQuery(MQ.hover)
	const coarse = useMediaQuery(MQ.coarse)
	const parallax = hoverable && !coarse && !reduced

	// Появление: один раз, когда сцена видна на треть
	useEffect(() => {
		const stage = stageRef.current
		if (!stage) return
		if (reduced || !('IntersectionObserver' in window)) {
			stage.classList.add('is-in')
			return
		}
		const io = new IntersectionObserver(
			entries => {
				if (!entries.some(e => e.isIntersecting)) return
				stage.classList.add('is-in')
				io.disconnect()
			},
			{ threshold: VISIBLE }
		)
		io.observe(stage)
		return () => io.disconnect()
	}, [reduced])

	// Параллакс от курсора: цель — положение курсора относительно центра сцены (−1…1), слои догоняют её
	// с интерполяцией; цикл rAF живёт только пока есть движение
	useEffect(() => {
		const stage = stageRef.current
		if (!parallax || !stage) return
		const area = stage.closest<HTMLElement>('.box') ?? stage
		const layers = Array.from(stage.querySelectorAll<HTMLElement>('[data-depth]')).map(el => ({
			el,
			depth: Number(el.dataset.depth) || 0,
		}))
		let tx = 0
		let ty = 0
		let x = 0
		let y = 0
		let raf = 0

		const tick = () => {
			x += (tx - x) * LERP
			y += (ty - y) * LERP
			for (const { el, depth } of layers) {
				const dx = (x * depth * AMPLITUDE).toFixed(2)
				const dy = (y * depth * AMPLITUDE).toFixed(2)
				el.style.transform = `translate3d(${dx}px, ${dy}px, 0)`
			}
			raf = Math.abs(tx - x) > 0.002 || Math.abs(ty - y) > 0.002 ? requestAnimationFrame(tick) : 0
		}
		const start = () => {
			if (!raf) raf = requestAnimationFrame(tick)
		}
		const onMove = (e: PointerEvent) => {
			const r = stage.getBoundingClientRect()
			if (!r.width || !r.height) return
			tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1)
			ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1)
			start()
		}
		const onLeave = () => {
			tx = 0
			ty = 0
			start()
		}

		area.addEventListener('pointermove', onMove, { passive: true })
		area.addEventListener('pointerleave', onLeave)
		return () => {
			cancelAnimationFrame(raf)
			area.removeEventListener('pointermove', onMove)
			area.removeEventListener('pointerleave', onLeave)
			layers.forEach(({ el }) => {
				el.style.transform = ''
			})
		}
	}, [parallax])

	return (
		<div
			ref={stageRef}
			className={['floatingPreview', className ?? ''].filter(Boolean).join(' ')}
			role='img'
			aria-label={preview.label}
		>
			{preview.layers.map((layer, i) => {
				const style = {
					'--i': i,
					'--depth': layer.depth,
					'--w': layer.width,
					'--x': layer.left,
					'--y': layer.top,
					...(layer.phone
						? { '--pw': layer.phone.width, '--px': layer.phone.left, '--py': layer.phone.top }
						: {}),
				} as CSSProperties
				return (
					<div
						key={layer.src}
						className={['floatingPreview__layer', layer.phone ? 'floatingPreview__layer--phone' : '']
							.filter(Boolean)
							.join(' ')}
						style={style}
					>
						<div className='floatingPreview__shift' data-depth={layer.depth}>
							<div className='floatingPreview__float'>
								<img
									className='floatingPreview__card'
									src={layer.src}
									alt=''
									width={layer.w}
									height={layer.h}
									loading='lazy'
									decoding='async'
									draggable={false}
								/>
							</div>
						</div>
					</div>
				)
			})}
		</div>
	)
}
