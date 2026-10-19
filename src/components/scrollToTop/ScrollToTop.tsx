import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Прокручивает страницу наверх при смене маршрута или к якорю, если он есть.
 * Элемент якоря может появиться только после анимации смены страницы (AnimatePresence), поэтому ждём его до секунды.
 */
export default function ScrollToTop() {
	const { pathname, hash } = useLocation()

	useEffect(() => {
		if (!hash) {
			window.scrollTo({ top: 0, behavior: 'auto' })
			return
		}
		let attempts = 0
		let timer = 0
		const tryScroll = () => {
			const el = document.querySelector(hash)
			if (el) {
				el.scrollIntoView({ behavior: 'smooth', block: 'start' })
				return
			}
			if (attempts++ < 12) timer = window.setTimeout(tryScroll, 80)
		}
		timer = window.setTimeout(tryScroll, 60)
		return () => window.clearTimeout(timer)
	}, [pathname, hash])

	return null
}
