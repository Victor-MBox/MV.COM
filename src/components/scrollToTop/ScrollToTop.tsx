import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** Прокручивает страницу наверх при смене маршрута или к якорю, если он есть. */
export default function ScrollToTop() {
	const { pathname, hash } = useLocation()

	useEffect(() => {
		if (hash) {
			const el = document.querySelector(hash)
			if (el) {
				// дать странице отрисоваться
				const t = window.setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
				return () => window.clearTimeout(t)
			}
		}
		window.scrollTo({ top: 0, behavior: 'auto' })
	}, [pathname, hash])

	return null
}
