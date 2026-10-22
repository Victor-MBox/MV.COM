import { useLayoutEffect, useRef } from 'react'
import type { Location } from 'react-router-dom'
import { getLenis } from '../../hooks/useLenis'

// Позицию при «назад» / «вперёд» восстанавливает сам компонент: браузер делал бы это сразу по popstate — прямо на уходящей
// странице, и она на время своей exit-анимации прыгала бы к чужой позиции
if ('scrollRestoration' in history) history.scrollRestoration = 'manual'

/** Где был посетитель на каждой записи истории — для «назад» и «вперёд» */
const positions = new Map<string, number>()

/** Запись истории: у переходов по #якорю браузером (ссылка «К содержанию») key у роутера общий — 'default' */
const entryOf = ({ key, pathname, hash }: Location) => `${key}${pathname}${hash}`

function findAnchor(hash: string) {
	if (!hash) return null
	try {
		return document.getElementById(decodeURIComponent(hash.slice(1)))
	} catch {
		return null
	}
}

/**
 * Верх якоря для прыжка: минус scroll-margin-top (место под липкую шапку) и без сдвига въезжающей страницы — App
 * анимирует её с y 14 → 0, getBoundingClientRect этот сдвиг уже учитывает, а после анимации его не будет
 */
function anchorTop(el: HTMLElement) {
	const page = el.closest<HTMLElement>('.page')
	const transform = page ? getComputedStyle(page).transform : 'none'
	const shift = transform === 'none' ? 0 : new DOMMatrixReadOnly(transform).m42
	const margin = parseFloat(getComputedStyle(el).scrollMarginTop) || 0
	return el.getBoundingClientRect().top + window.scrollY - shift - margin
}

/**
 * Прокрутка при смене адреса. Рендерится внутри страницы (App, ключ — pathname), а не над ней: при AnimatePresence
 * mode='wait' новая страница монтируется, только когда старая доиграла уход. Прокрутка сразу по смене адреса двигала
 * уходящую страницу — мелькал её первый экран, а якорь находился на ней же (#faq есть на главной, /contacts и /services).
 * location приходит пропом: у уходящей копии страницы он прежний, на новый адрес она не реагирует.
 *
 * Новая страница — прыжком до первой отрисовки: к сохранённой позиции («назад» / «вперёд»), к якорю или наверх.
 * Тот же pathname с новым адресом (якорь на этой странице, повторный клик по ссылке на неё) — плавно, через Lenis,
 * если главная его подняла. `behavior: 'instant'`, а не 'auto': у всех элементов `scroll-behavior: smooth` (_main.scss),
 * и 'auto' тоже анимировался бы.
 */
export default function ScrollToTop({ location }: { location: Location }) {
	const entry = entryOf(location)
	const { hash } = location
	const handled = useRef<string | null>(null)

	// Уходя с записи (новый адрес на той же странице или размонтирование уходящей), запоминаем позицию. Очистка
	// выполняется до удаления страницы из DOM, так что scrollY ещё её
	useLayoutEffect(
		() => () => {
			positions.set(entry, window.scrollY)
		},
		[entry]
	)

	useLayoutEffect(() => {
		// StrictMode повторяет эффект на том же адресе — второй раз не прокручиваем
		if (handled.current === entry) return
		const entering = handled.current === null
		handled.current = entry
		const saved = positions.get(entry)
		const anchor = findAnchor(hash)

		if (entering) {
			const top = saved ?? (anchor ? anchorTop(anchor) : 0)
			window.scrollTo({ top, behavior: 'instant' })
			// При первой загрузке по ссылке с якорем шрифты могут прийти позже и сдвинуть блок — поправляем, если посетитель
			// ещё не прокручивал сам
			if (anchor && saved === undefined) {
				document.fonts.ready.then(() => {
					if (anchor.isConnected && Math.abs(window.scrollY - top) < 2) {
						window.scrollTo({ top: anchorTop(anchor), behavior: 'instant' })
					}
				})
			}
			return
		}

		// Якоря нет на странице — остаёмся на месте
		if (hash && !anchor && saved === undefined) return
		const target = saved ?? anchor ?? 0
		const lenis = getLenis()
		if (lenis) {
			lenis.scrollTo(target)
			return
		}
		const behavior = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
		if (typeof target === 'number') window.scrollTo({ top: target, behavior })
		else target.scrollIntoView({ behavior, block: 'start' })
	}, [entry, hash])

	return null
}
