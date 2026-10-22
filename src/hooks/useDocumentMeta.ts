import { useEffect } from 'react'
import { SITE_URL, canonicalUrl } from '../data/meta'
import type { PageMeta } from '../data/meta'

type Meta = PageMeta & {
	/** Путь к картинке для соцсетей (импорт из resources) — станет абсолютным URL */
	image?: string
}

/**
 * Ставит элемент head с атрибутом `attr` = value: находит по селектору или создаёт; value = undefined — убирает
 * найденный элемент. Возвращает откат к прежнему состоянию
 */
function setHead(selector: string, create: () => HTMLElement, attr: string, value: string | undefined) {
	const found = document.head.querySelector<HTMLElement>(selector)
	if (value === undefined) {
		if (!found) return () => {}
		const next = found.nextSibling
		found.remove()
		return () => {
			document.head.insertBefore(found, next?.parentNode === document.head ? next : null)
		}
	}
	const el = found ?? create()
	const prev = el.getAttribute(attr)
	el.setAttribute(attr, value)
	if (!found) document.head.appendChild(el)
	return () => {
		if (!found) el.remove()
		else if (prev !== null) el.setAttribute(attr, prev)
	}
}

function meta(attr: 'name' | 'property', key: string, content: string | undefined) {
	const create = () => {
		const el = document.createElement('meta')
		el.setAttribute(attr, key)
		return el
	}
	return setHead(`meta[${attr}="${key}"]`, create, 'content', content)
}

function canonical(href: string | undefined) {
	const create = () => {
		const el = document.createElement('link')
		el.rel = 'canonical'
		return el
	}
	return setHead('link[rel="canonical"]', create, 'href', href)
}

/**
 * Title, description, Open Graph, canonical и robots страницы — единственный механизм управления head на сайте.
 * Дефолты для всего сайта лежат в index.html (= мета главной); хук переопределяет их, пока страница смонтирована,
 * и возвращает прежние значения при уходе — переходы по ссылкам и назад/вперёд меняют мету вместе со страницей
 * (страницы перемонтируются по pathname, AnimatePresence mode='wait'). canonical и og:url — только на публичном
 * домене SITE_URL; пока он не задан, их нет. `null` — страница меты не ставит (оффер не найден: мету ставит
 * NotFoundPage внутри). Пререндера нет: в исходном HTML любого адреса — дефолты из index.html, эти теги видят
 * поисковики, исполняющие JavaScript
 */
export function useDocumentMeta(page: Meta | null) {
	const title = page?.title
	const description = page?.description
	const image = page?.image
	const noindex = !!page?.noindex

	useEffect(() => {
		if (!title || !description) return
		const url = noindex ? undefined : canonicalUrl(window.location.pathname, SITE_URL)
		const prevTitle = document.title
		document.title = title

		const undo = [
			meta('name', 'description', description),
			meta('property', 'og:title', title),
			meta('property', 'og:description', description),
			meta('property', 'og:url', url),
			canonical(url),
		]
		if (image) undo.push(meta('property', 'og:image', new URL(image, SITE_URL ?? window.location.origin).href))
		if (noindex) undo.push(meta('name', 'robots', 'noindex'))

		return () => {
			document.title = prevTitle
			undo.reverse().forEach(fn => fn())
		}
	}, [title, description, image, noindex])
}
