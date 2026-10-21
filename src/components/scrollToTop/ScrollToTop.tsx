import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getLenis } from '../../hooks/useLenis'

/**
 * Прокручивает страницу наверх при смене маршрута или к якорю, если он есть.
 * Элемент якоря может появиться только после анимации смены страницы (AnimatePresence), поэтому ждём его до секунды.
 * Условий по маршруту здесь нет: Lenis поднимает только главная (getLenis), а отступ под липкую шапку
 * даёт scroll-margin-top секций — его учитывают и scrollIntoView, и lenis.scrollTo (offset передавать не нужно).
 */
export default function ScrollToTop() {
	const { pathname, hash } = useLocation()

	useEffect(() => {
		if (!hash) {
			// Lenis (если страница его подняла) должен узнать о прыжке, иначе вернёт прежнюю позицию
			getLenis()?.scrollTo(0, { immediate: true })
			window.scrollTo({ top: 0, behavior: 'auto' })
			return
		}
		let attempts = 0
		let timer = 0
		const tryScroll = () => {
			const el = document.querySelector(hash)
			if (el) {
				const lenis = getLenis()
				if (lenis) lenis.scrollTo(el as HTMLElement)
				else {
					const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
					el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
				}
				return
			}
			if (attempts++ < 12) timer = window.setTimeout(tryScroll, 80)
		}
		timer = window.setTimeout(tryScroll, 60)
		return () => window.clearTimeout(timer)
	}, [pathname, hash])

	return null
}
