import { useEffect } from 'react'

type Meta = {
	title: string
	description: string
	/** Путь к картинке для соцсетей (импорт из resources) — станет абсолютным URL */
	image?: string
}

function setMeta(attr: 'name' | 'property', key: string, content: string) {
	let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`)
	const created = !el
	if (!el) {
		el = document.createElement('meta')
		el.setAttribute(attr, key)
		document.head.appendChild(el)
	}
	const prev = el.getAttribute('content')
	el.setAttribute('content', content)
	const node = el
	return () => {
		if (created) node.remove()
		else if (prev !== null) node.setAttribute('content', prev)
	}
}

/**
 * Title, description, Open Graph и canonical страницы (ТЗ §18). Дефолты для всего сайта лежат в index.html;
 * хук переопределяет их, пока страница смонтирована, и возвращает прежние значения при уходе.
 * Пререндера нет: поисковики, исполняющие JavaScript, увидят эти теги, остальные — дефолты из index.html.
 */
export function useDocumentMeta({ title, description, image }: Meta) {
	useEffect(() => {
		const url = window.location.origin + window.location.pathname
		const prevTitle = document.title
		document.title = title

		const undo = [
			setMeta('name', 'description', description),
			setMeta('property', 'og:title', title),
			setMeta('property', 'og:description', description),
			setMeta('property', 'og:url', url),
		]
		if (image) undo.push(setMeta('property', 'og:image', new URL(image, window.location.origin).href))

		let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
		const hadLink = !!link
		if (!link) {
			link = document.createElement('link')
			link.rel = 'canonical'
			document.head.appendChild(link)
		}
		const prevHref = link.getAttribute('href')
		link.setAttribute('href', url)
		const canonical = link

		return () => {
			document.title = prevTitle
			undo.forEach(fn => fn())
			if (hadLink && prevHref !== null) canonical.setAttribute('href', prevHref)
			else canonical.remove()
		}
	}, [title, description, image])
}
