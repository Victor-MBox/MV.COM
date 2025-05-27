import { useTheme } from '../../hooks/useTheme'
import './ThemeButton.scss'

export default function ThemeButton() {
	const { theme, toggleTheme } = useTheme()

	return (
		<button
			className={`theme-button ${theme}`}
			onClick={toggleTheme}
			aria-label='Переключить тему'
		>
			<span className='option light'>
				<i className='icon'></i>
				<span className='label'>Светлая</span>
			</span>

			<span className='option dark'>
				<i className='icon'></i>
				<span className='label'>Тёмная</span>
			</span>

			{/* «Бегунок», который ездит слева-направо */}
			<span className='thumb' />
		</button>
	)
}
