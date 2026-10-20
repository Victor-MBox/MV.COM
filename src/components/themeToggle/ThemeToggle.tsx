import { useTheme } from '../../hooks/useTheme'
import './ThemeToggle.scss'

type Props = {
	className?: string
}

/**
 * Переключатель темы в шапке TopHeader: круг 40px с одной иконкой в currentColor.
 * В тёмной теме показывает солнце («включить светлую»), в светлой — луну; смена — поворот и кроссфейд.
 * Состояние общее с остальными переключателями через useTheme
 */
export default function ThemeToggle({ className }: Props) {
	const { theme, toggleTheme } = useTheme()
	const dark = theme === 'dark'

	return (
		<button
			type='button'
			className={['themeToggle', className ?? ''].filter(Boolean).join(' ')}
			data-theme={theme}
			onClick={toggleTheme}
			aria-label={dark ? 'Включить светлую тему' : 'Включить тёмную тему'}
			title={dark ? 'Светлая тема' : 'Тёмная тема'}
		>
			<svg className='themeToggle__icon themeToggle__icon--sun' viewBox='0 0 24 24' aria-hidden='true'>
				<circle cx='12' cy='12' r='4' />
				<path d='M12 2.5v2.4M12 19.1v2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.9 19.1l1.7-1.7M17.4 6.6l1.7-1.7' />
			</svg>
			<svg className='themeToggle__icon themeToggle__icon--moon' viewBox='0 0 24 24' aria-hidden='true'>
				<path d='M20.2 14.6A8.4 8.4 0 0 1 9.4 3.8a8.4 8.4 0 1 0 10.8 10.8z' />
			</svg>
		</button>
	)
}
