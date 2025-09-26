import './App.css'

import LeftMenu from '../components/leftMenu/LeftMenu'
import HomeBanner from '../components/homeBanner/HomeBanner'
import NumbersCard from '../components/numbersCard/NumbersCard'
import TitleSubtitle from '../components/cards/titleSubtitle/TitleSubtitle'
import Card from '../components/cards/Cards'
import InfoBlock from '../components/cards/infoBloсk/InfoBlock'
import Skills from '../components/cards/skills/Skills'
import MyStack from '../components/cards/myStack/MyStack'
import TitleRow from '../components/titleRow/TitleRow'
import ServiceCards from '../components/cards/setviceCards/ServiceCards'

function App() {
	return (
		<div className='main'>
			<LeftMenu />
			<div className='container'>
				<HomeBanner />
				<NumbersCard />

				<section className='infoBlok'>
					<Card>
						<TitleSubtitle
							title='Обо мне'
							subtitle='Lorem ipsum dolor sit amet consectetur. Imperdiet mi tellus amet adipiscing donec sed. Ipsum pulvinar vulputate suspendisse accumsan. Tempus mattis ut adipiscing duis eu nibh augue. Maecenas vel vel amet arcu. Tincidunt elementum at nam integer proin dui condimentum. Non neque ornare ultrices interdum. Volutpat lorem quis augue proin. Augue viverra ornare nisl in diam blandit diam libero. Lorem ipsum dolor sit amet consectetur. Volutpat lorem quis augue proin. Augue viverra ornare nisl in diam blandit diam libero. Lorem ipsum dolor sit amet consectetur. Volutpat lorem quis augue proin. Augue viverra ornare nisl in diam blandit diam libero.'
						/>
					</Card>

					<Card>
						<InfoBlock />
					</Card>

					<Card>
						<Skills />
					</Card>

					<Card>
						<MyStack />
					</Card>
				</section>

				<TitleRow title='Мои услуги' btn='Все услуги' />

				<section className='services'>
					<Card className='card_color-1'>
						<ServiceCards
							title='Веб-разработка'
							subtitle='Lorem ipsum dolor sit amet, consectetur adipisicing elit. Delectus esse commodi deserunt vitae, vero quasi!'
							btn='Подробнее'
						/>
					</Card>

					<Card className='card_color-2'>
						<ServiceCards
							title='Веб-разработка'
							subtitle='Lorem ipsum dolor sit amet, consectetur adipisicing elit. Delectus esse commodi deserunt vitae, vero quasi!'
							btn='Подробнее'
						/>
					</Card>

					<Card className='card_color-3'>
						<ServiceCards
							title='Веб-разработка'
							subtitle='Lorem ipsum dolor sit amet, consectetur adipisicing elit. Delectus esse commodi deserunt vitae, vero quasi! '
							btn='Подробнее'
						/>
					</Card>
				</section>

				<TitleRow title='Портфолио' btn='Все работы' />
				<section className='portfolio'></section>
			</div>
		</div>
	)
}

export default App
