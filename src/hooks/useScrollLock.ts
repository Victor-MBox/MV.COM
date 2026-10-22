import { useLayoutEffect } from 'react'

/** Сколько оверлеев держат блокировку: меню, модалка и лайтбокс могут пересечься, пока один закрывается, а другой открыт */
let locks = 0
let prevOverflow = ''

function lock() {
	if (locks++ > 0) return
	const root = document.documentElement
	// Ширина классической полосы прокрутки (Windows, macOS с «Показывать полосы прокрутки: всегда»); у оверлейной — 0
	const gap = window.innerWidth - root.clientWidth
	prevOverflow = root.style.overflow
	root.style.setProperty('--scrollbar-gap', `${gap}px`)
	root.style.overflow = 'hidden'
}

function unlock() {
	if (--locks > 0) return
	const root = document.documentElement
	root.style.overflow = prevOverflow
	root.style.removeProperty('--scrollbar-gap')
}

/**
 * Блокировка прокрутки страницы под оверлеем (модалка, мобильное меню, лайтбокс), пока active.
 * overflow: hidden — на html, а не на body: overflow у body делает его контейнером прокрутки, и липкая шапка
 * на прокрученной странице уезжала вверх вместе с ним. Место пропавшей классической полосы прокрутки держит
 * padding-right у body по --scrollbar-gap (_system.scss) — иначе страница при открытии и закрытии прыгает вбок
 * на ширину полосы. useLayoutEffect — замер и блокировка в том же кадре, где появляется оверлей. Lenis оверлеи
 * останавливают сами (HomePage, TopHeader).
 */
export function useScrollLock(active: boolean) {
	useLayoutEffect(() => {
		if (!active) return
		lock()
		return unlock
	}, [active])
}
