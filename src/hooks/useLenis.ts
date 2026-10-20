import { useEffect } from 'react'
import Lenis from 'lenis'

let instance: Lenis | null = null

/** Текущий инстанс плавного скролла, если страница его подняла (ScrollToTop, модалка) */
export function getLenis() {
	return instance
}

/**
 * Плавный скролл Lenis (docs/design-spec.md §8.2). Живёт только пока смонтирована страница,
 * которая его вызвала; при prefers-reduced-motion не инициализируется.
 */
export function useLenis(enabled = true) {
	useEffect(() => {
		if (!enabled) return
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
		const lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, syncTouch: false })
		instance = lenis
		let raf = 0
		const loop = (time: number) => {
			lenis.raf(time)
			raf = requestAnimationFrame(loop)
		}
		raf = requestAnimationFrame(loop)
		return () => {
			cancelAnimationFrame(raf)
			lenis.destroy()
			instance = null
		}
	}, [enabled])
}
