import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { MQ, useMediaQuery } from '../../hooks/useMediaQuery'
import './Cursor.scss'

const LERP = 0.15

/**
 * Курсор-подпись по OKC (docs/design-spec.md §6.12): стеклянный круг 88px следует за указателем с интерполяцией
 * 0.15 на кадр и показывает текст из data-cursor элемента под курсором. Выключен при pointer: coarse,
 * reduced-motion и ширине ≤992. Рендерится порталом в body, клики и фокус не перехватывает.
 */
export default function Cursor() {
	const coarse = useMediaQuery(MQ.coarse)
	const hoverable = useMediaQuery(MQ.hover)
	const reduced = useMediaQuery(MQ.reduced)
	const tablet = useMediaQuery(MQ.tablet)
	const enabled = hoverable && !coarse && !reduced && !tablet
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!enabled) return
		const el = ref.current
		if (!el) return
		const label = el.firstElementChild as HTMLElement | null
		document.body.classList.add('has-cursor')

		let x = window.innerWidth / 2
		let y = window.innerHeight / 2
		let tx = x
		let ty = y
		let raf = 0
		let active: Element | null = null

		const onMove = (e: PointerEvent) => {
			tx = e.clientX
			ty = e.clientY
		}
		const onOver = (e: PointerEvent) => {
			const target = (e.target as Element | null)?.closest('[data-cursor]') ?? null
			if (!target || target === active) return
			active = target
			if (label) label.textContent = target.getAttribute('data-cursor') ?? ''
			el.classList.add('is-on')
		}
		const onOut = (e: PointerEvent) => {
			if (!active) return
			const next = e.relatedTarget as Node | null
			if (next && active.contains(next)) return
			active = null
			el.classList.remove('is-on')
		}
		const loop = () => {
			x += (tx - x) * LERP
			y += (ty - y) * LERP
			el.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -50%)`
			raf = requestAnimationFrame(loop)
		}

		document.addEventListener('pointermove', onMove, { passive: true })
		document.addEventListener('pointerover', onOver)
		document.addEventListener('pointerout', onOut)
		raf = requestAnimationFrame(loop)

		return () => {
			cancelAnimationFrame(raf)
			document.removeEventListener('pointermove', onMove)
			document.removeEventListener('pointerover', onOver)
			document.removeEventListener('pointerout', onOut)
			document.body.classList.remove('has-cursor')
		}
	}, [enabled])

	if (!enabled) return null

	return createPortal(
		<div ref={ref} className='cursorTag' aria-hidden='true'>
			<span />
		</div>,
		document.body
	)
}
