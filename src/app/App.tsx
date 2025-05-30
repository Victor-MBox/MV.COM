import './App.css'

import LeftMenu from '../components/leftMenu/LeftMenu'
import HomeBanner from '../components/homeBanner/HomeBanner'
import NumbersCard from '../components/numbersCard/NumbersCard'
import TitleSubtitle from '../components/cards/titleSubtitle/TitleSubtitle'

function App() {
	return (
		<div className='main'>
			<LeftMenu />
			<div className='container'>
				<HomeBanner />
				<NumbersCard />

				<div className='infoBlok'>
					<div className='card'>
						<TitleSubtitle
							title='Обо мне'
							subtitle='Lorem ipsum dolor sit amet consectetur. Imperdiet mi tellus amet adipiscing donec sed. Ipsum pulvinar vulputate suspendisse accumsan. Tempus mattis ut adipiscing duis eu nibh augue. Maecenas vel vel amet arcu. Tincidunt elementum at nam integer proin dui condimentum. Non neque ornare ultrices interdum. Volutpat lorem quis augue proin. Augue viverra ornare nisl in diam blandit diam libero. Lorem ipsum dolor sit amet consectetur. Imperdiet mi tellus amet adipiscing donec sed. Ipsum pulvinar vulputate suspendisse accumsan. Tempus mattis ut adipiscing duis eu nibh augue. Maecenas vel vel amet arcu. Tincidunt elementum at nam integer proin dui condimentum. Non neque ornare ultrices interdum. Volutpat lorem quis augue proin. Augue viverra ornare nisl in diam blandit diam libero. Lorem ipsum dolor sit amet consectetur. Imperdiet mi tellus amet adipiscing donec sed. Ipsum pulvinar vulputate suspendisse accumsan. Tempus mattis ut adipiscing duis eu nibh augue. Maecenas vel vel amet arcu. Tincidunt elementum at nam integer proin dui condimentum. Non neque ornare ultrices interdum. Volutpat lorem quis augue proin. Augue viverra ornare nisl in diam blandit diam libero.'
						/>
					</div>

					<div className='card'>
						<TitleSubtitle
							title='Обо мне 2'
							subtitle='Lorem ipsum dolor sit amet consectetur. Imperdiet mi tellus amet 2adipiscing donec sed. Ipsum pulvinar vulputate suspendisse accumsan. '
						/>
					</div>

					<div className='card'>
						<TitleSubtitle
							title='Обо мне 2'
							subtitle='Lorem ipsum dolor sit amet consectetur. Imperdiet mi tellus amet 2adipiscing donec sed. Ipsum pulvinar vulputate suspendisse accumsan. '
						/>
					</div>

					<div className='card'>
						<TitleSubtitle
							title='Обо мне 2'
							subtitle='Lorem ipsum dolor sit amet consectetur. Imperdiet mi tellus amet 2adipiscing donec sed. Ipsum pulvinar vulputate suspendisse accumsan. '
						/>
					</div>
				</div>
			</div>
		</div>
	)
}

export default App
