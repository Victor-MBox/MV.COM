import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import type { PreviewPlacement, ProjectPreview } from '../../data/projects'
import { MQ, useMediaQuery } from '../../hooks/useMediaQuery'
import { PREVIEW_CANVAS, PREVIEW_KITS } from './kits'
import type { PreviewKit } from './kits'
import './FloatingPreview.scss'

type Props = {
	preview: ProjectPreview
	className?: string
}

type Layout = keyof typeof PREVIEW_CANVAS

/** Сцена уже этой ширины (px) переходит на раскладку телефона: иначе основной текст элементов мельче 10px */
const PHONE_BELOW = 480
/** Интерполяция сдвига к цели за кадр */
const LERP = 0.08
/** Сдвиг ближнего слоя (depth 1) при курсоре у края сцены, px холста; дальние слои — пропорционально depth */
const AMPLITUDE = 12
/** Доля сцены в окне, при которой слои начинают проявляться */
const VISIBLE = 0.3
/** Сколько ждать шрифты продукта перед появлением, мс: дальше — показываем как есть, шрифт подменится сам */
const FONTS_WAIT = 700

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

/** Переменные раскладки слоя: `--x`, `--y`, `--s`, `--w` (на телефоне — с префиксом `p`: `--px`, …) */
function placementVars(place: PreviewPlacement, prefix: '' | 'p') {
	return {
		[`--${prefix}x`]: place.x,
		[`--${prefix}y`]: place.y,
		[`--${prefix}s`]: place.scale ?? 1,
		[`--${prefix}w`]: place.width ? `${place.width}px` : 'max-content',
	}
}

const fontLoads = new Map<string, Promise<void>>()

/**
 * Подключает шрифты продукта только с буквами холста (`text=`); один `<link>` на набор, промис — до готовности шрифтов.
 * Буквы — в обоих регистрах: кнопки и надписи продукта переводятся в заглавные через text-transform
 */
function loadFonts(families: string, text: string) {
	const flat = text.replace(/\s+/g, ' ')
	const chars = Array.from(new Set(Array.from(flat + flat.toUpperCase() + flat.toLowerCase()))).sort().join('')
	const href = `https://fonts.googleapis.com/css2?${families}&display=swap&text=${encodeURIComponent(chars)}`
	let ready = fontLoads.get(href)
	if (!ready) {
		ready = new Promise<void>(resolve => {
			const link = document.createElement('link')
			link.rel = 'stylesheet'
			link.href = href
			link.onload = () => {
				if (document.fonts) document.fonts.ready.then(() => resolve(), () => resolve())
				else resolve()
			}
			link.onerror = () => resolve()
			document.head.appendChild(link)
		})
		fontLoads.set(href, ready)
	}
	return ready
}

/**
 * Интерактивная обложка кейса (ТЗ от 22.10.2026; 28.10.2026 скриншоты заменены живой вёрсткой продукта): элементы
 * интерфейса — логотип, кнопки, карточки — парят на сцене на разной глубине. Элементы берутся из набора
 * (`kits.tsx`) по ключу и стоят на холсте 720×450 в своих настоящих размерах; холст масштабируется под ширину сцены
 * (`--k`), поэтому текст и иконки остаются векторными и чёткими при любом зуме. На сцене уже 560px — холст 400×250
 * и только слои с `phone`. Глубина `depth` 0…1 задаёт амплитуду параллакса, размах и скорость покачивания.
 * Движение: покачивание — CSS-анимация transform; параллакс от курсора — requestAnimationFrame поверх всей карточки
 * (`.box`), только при hover-устройстве без reduced-motion; наведение на слой — подъём и тень (CSS); появление —
 * IntersectionObserver ставит `is-in` (после шрифтов продукта, не дольше 0,7 с), слои проявляются по очереди.
 * При reduced-motion слои сразу на месте. Слои декоративны: сцена описана одной подписью (role="img")
 */
export default function FloatingPreview({ preview, className }: Props) {
	const stageRef = useRef<HTMLDivElement>(null)
	const canvasRef = useRef<HTMLDivElement>(null)
	const [layout, setLayout] = useState<Layout>('desktop')
	const reduced = useMediaQuery(MQ.reduced)
	const hoverable = useMediaQuery(MQ.hover)
	const coarse = useMediaQuery(MQ.coarse)
	const parallax = hoverable && !coarse && !reduced
	const kit: PreviewKit = PREVIEW_KITS[preview.kit]
	const canvas = PREVIEW_CANVAS[layout]

	// Масштаб холста под ширину сцены и выбор раскладки — до отрисовки, без кадра в чужом масштабе
	useLayoutEffect(() => {
		const stage = stageRef.current
		if (!stage) return
		const fit = () => {
			const width = stage.clientWidth
			if (!width) return
			const next: Layout = width < PHONE_BELOW ? 'phone' : 'desktop'
			setLayout(next)
			stage.style.setProperty('--k', String(width / PREVIEW_CANVAS[next].w))
		}
		fit()
		if (!('ResizeObserver' in window)) return
		const ro = new ResizeObserver(fit)
		ro.observe(stage)
		return () => ro.disconnect()
	}, [])

	// Появление: один раз, когда сцена видна на треть и шрифты продукта готовы (или вышло время ожидания)
	useEffect(() => {
		const stage = stageRef.current
		const text = canvasRef.current?.textContent ?? ''
		if (!stage) return
		const fonts = kit.fonts ? loadFonts(kit.fonts, text) : Promise.resolve()
		const fontsOrTimeout = Promise.race([fonts, new Promise<void>(r => setTimeout(r, FONTS_WAIT))])
		let alive = true
		const show = () => fontsOrTimeout.then(() => alive && stage.classList.add('is-in'))
		if (reduced || !('IntersectionObserver' in window)) {
			stage.classList.add('is-in')
			return () => {
				alive = false
			}
		}
		const io = new IntersectionObserver(
			entries => {
				if (!entries.some(e => e.isIntersecting)) return
				io.disconnect()
				show()
			},
			{ threshold: VISIBLE }
		)
		io.observe(stage)
		return () => {
			alive = false
			io.disconnect()
		}
	}, [reduced, kit.fonts])

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
	}, [parallax, layout])

	return (
		<div
			ref={stageRef}
			className={['floatingPreview', `floatingPreview--${layout}`, className ?? ''].filter(Boolean).join(' ')}
			role='img'
			aria-label={preview.label}
		>
			<div
				ref={canvasRef}
				className={`floatingPreview__canvas ${kit.className}`}
				style={{ '--cw': canvas.w, '--ch': canvas.h } as CSSProperties}
			>
				{preview.layers.map((layer, i) => {
					// Обе раскладки в переменных: раскладку переключает класс сцены, слои без `phone` на телефоне скрыты —
					// весь текст холста остаётся в DOM (по нему подбираются буквы шрифтов)
					const style = {
						'--i': i,
						'--depth': layer.depth,
						...placementVars(layer, ''),
						...(layer.phone ? placementVars(layer.phone, 'p') : {}),
					} as CSSProperties
					return (
						<div
							key={layer.element}
							className={['floatingPreview__layer', layer.phone ? 'floatingPreview__layer--phone' : '']
								.filter(Boolean)
								.join(' ')}
							style={style}
							data-element={layer.element}
						>
							<div className='floatingPreview__shift' data-depth={layer.depth}>
								<div className='floatingPreview__float'>
									<div className='floatingPreview__card'>
										{kit.elements[layer.element]}
									</div>
								</div>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
