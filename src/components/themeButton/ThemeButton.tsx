import { useTheme } from '../../hooks/useTheme'

// scss
import './ThemeButton.scss'

function ThemeButton() {
	const { theme, toggleTheme } = useTheme()

	return (
		<button
			className='btnToggleTheme'
			onClick={toggleTheme}
			style={{
				padding: '10px 20px',
				border: 'none',
				borderRadius: '5px',
				cursor: 'pointer',
				backgroundColor: theme === 'light' ? '#333' : '#fff',
				color: theme === 'light' ? '#fff' : '#333',
			}}
		>
			{theme === 'light' ? '🌙 Темная' : '☀️ Светлая'}
		</button>
	)
}

export default ThemeButton
