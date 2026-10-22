import { useEffect, useSyncExternalStore } from 'react'

export type Theme = 'dark' | 'light'

const KEY = 'theme'
const QUERY = '(prefers-color-scheme: dark)'

/**
 * Тема — общее состояние модуля, а не каждого экземпляра хука: переключатель в шапке, в мобильном меню и в левом меню
 * видят одно значение. Правила (ТЗ §3): по умолчанию prefers-color-scheme, ручной выбор сохраняется в localStorage
 * и имеет приоритет; системная тема отслеживается, пока пользователь не выбрал сам. До первой отрисовки класс на body
 * ставит инлайн-скрипт в index.html с теми же правилами — без вспышки неправильной темы.
 */

const listeners = new Set<() => void>()
let current: Theme | null = null

function readStored(): Theme | null {
	try {
		const value = localStorage.getItem(KEY)
		return value === 'dark' || value === 'light' ? value : null
	} catch {
		return null
	}
}

function systemTheme(): Theme {
	return window.matchMedia(QUERY).matches ? 'dark' : 'light'
}

function getSnapshot(): Theme {
	if (current === null) current = readStored() ?? systemTheme()
	return current
}

function getServerSnapshot(): Theme {
	return 'dark'
}

/** Класс на body (стили тем в _variables.scss) и color-scheme для нативных контролов и полос прокрутки */
function apply(theme: Theme) {
	document.body.classList.remove('light', 'dark')
	document.body.classList.add(theme)
	document.documentElement.style.colorScheme = theme
}

function commit(theme: Theme, persist: boolean) {
	current = theme
	apply(theme)
	if (persist) {
		try {
			localStorage.setItem(KEY, theme)
		} catch {
			// приватный режим — выбор живёт до перезагрузки
		}
	}
	listeners.forEach(listener => listener())
}

function onSystemChange(e: MediaQueryListEvent) {
	if (!readStored()) commit(e.matches ? 'dark' : 'light', false)
}

function onStorage(e: StorageEvent) {
	if (e.key === KEY) commit(readStored() ?? systemTheme(), false)
}

function subscribe(listener: () => void) {
	listeners.add(listener)
	if (listeners.size === 1) {
		window.matchMedia(QUERY).addEventListener('change', onSystemChange)
		window.addEventListener('storage', onStorage)
	}
	return () => {
		listeners.delete(listener)
		if (listeners.size === 0) {
			window.matchMedia(QUERY).removeEventListener('change', onSystemChange)
			window.removeEventListener('storage', onStorage)
		}
	}
}

/**
 * Забыть ручной выбор темы («Удалить сохранённые настройки» в окне настроек cookie): ключ localStorage удаляется,
 * снова действует системная тема и её отслеживание
 */
export function clearStoredTheme() {
	try {
		localStorage.removeItem(KEY)
	} catch {
		// хранилище недоступно — удалять нечего
	}
	commit(systemTheme(), false)
}

export function useTheme() {
	const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

	// Если инлайн-скрипт index.html не отработал (другой шаблон, тесты), класс ставится при монтировании
	useEffect(() => {
		apply(getSnapshot())
	}, [])

	const setTheme = (next: Theme) => commit(next, true)

	return {
		theme,
		toggleTheme: () => setTheme(theme === 'dark' ? 'light' : 'dark'),
		setTheme,
		isDark: theme === 'dark',
		isLight: theme === 'light',
	}
}
