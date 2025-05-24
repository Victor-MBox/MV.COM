import './App.css'

import LeftMenu from '../components/leftMenu/LeftMenu'
import ThemeButton from '../components/themeButton/ThemeButton'

function App() {
	return (
		<div className='main'>
			<ThemeButton />
			<LeftMenu />
		</div>
	)
}

export default App
