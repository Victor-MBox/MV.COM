import { useState, useEffect } from 'react'

// Типы для темы
type Theme = 'dark' | 'light'

export function useTheme() {
	// Состояние темы: 'dark' или 'light'
	const [theme, setTheme] = useState<Theme>('dark')

	// Функция для переключения темы
	const toggleTheme = () => {
		const newTheme: Theme = theme === 'dark' ? 'light' : 'dark'
		setTheme(newTheme)
	}

	// Когда тема меняется, добавляем класс к body
	useEffect(() => {
		document.body.className = theme // добавляет класс 'dark' или 'light'
	}, [theme])

	return { theme, toggleTheme }
}
