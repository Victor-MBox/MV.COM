import './App.css'

import LeftMenu from '../components/leftMenu/LeftMenu'
import HomeBanner from '../components/homeBanner/HomeBanner'
import NumbersCard from '../components/numbersCard/NumbersCard'

function App() {
	return (
		<div className='main'>
			<LeftMenu />
			<div className='container'>
				<HomeBanner />
				<NumbersCard />
			</div>
		</div>
	)
}

export default App
