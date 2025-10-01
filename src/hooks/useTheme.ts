import { useState, useEffect } from 'react'

// Типы для темы
type Theme = 'dark' | 'light'

export function useTheme() {
	// Получаем сохраненную тему из localStorage или используем системную
	const getInitialTheme = (): Theme => {
		if (typeof window !== 'undefined') {
			// Проверяем localStorage
			const savedTheme = localStorage.getItem('theme') as Theme
			if (savedTheme) return savedTheme

			// Проверяем системную тему
			const systemPrefersDark = window.matchMedia(
				'(prefers-color-scheme: dark)'
			).matches
			return systemPrefersDark ? 'dark' : 'light'
		}
		return 'dark' // fallback для SSR
	}

	const [theme, setTheme] = useState<Theme>(getInitialTheme)

	// Функция для переключения темы
	const toggleTheme = () => {
		const newTheme: Theme = theme === 'dark' ? 'light' : 'dark'
		setTheme(newTheme)
	}

	// Функция для установки конкретной темы
	const setSpecificTheme = (newTheme: Theme) => {
		setTheme(newTheme)
	}

	// Применяем тему к body и сохраняем в localStorage
        useEffect(() => {
                const body = document.body
                body.classList.remove('light', 'dark')
                body.classList.add(theme)
                localStorage.setItem('theme', theme)
        }, [theme])

	// Слушаем изменения системной темы
	useEffect(() => {
		const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

		const handleChange = (e: MediaQueryListEvent) => {
			// Обновляем только если нет сохраненной темы
			if (!localStorage.getItem('theme')) {
				setTheme(e.matches ? 'dark' : 'light')
			}
		}

		mediaQuery.addEventListener('change', handleChange)
		return () => mediaQuery.removeEventListener('change', handleChange)
	}, [])

	return {
		theme,
		toggleTheme,
		setTheme: setSpecificTheme,
		isDark: theme === 'dark',
		isLight: theme === 'light',
	}
}
