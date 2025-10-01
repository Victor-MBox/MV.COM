import './App.css'

import type { ReactNode } from 'react'

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
import Portfolio from '../components/cards/portfolio/Portfolio'
import FooterBanner from '../components/footerBanner/FooterBanner'
import Footer from '../components/footer/Footer'
// img
import portfolio from '../../src/resources/portfolio.jpeg'

const aboutText =
        'Я full-stack разработчик с восьмилетним опытом. Беру на себя разработку интерфейсов от идеи и прототипа до внедрения анимаций, интеграции с CRM и последующей поддержки продукта.'

type AboutSection = {
        key: string
        content: ReactNode
}

const ABOUT_SECTIONS: AboutSection[] = [
        {
                key: 'about',
                content: <TitleSubtitle title='Обо мне' subtitle={aboutText} />,
        },
        { key: 'info', content: <InfoBlock /> },
        { key: 'skills', content: <Skills /> },
        { key: 'stack', content: <MyStack /> },
]

type Service = {
        key: string
        className: string
        title: string
        subtitle: string
        btn: string
}

const SERVICES: Service[] = [
        {
                key: 'web-dev',
                className: 'card_color-1',
                title: 'Веб-разработка',
                subtitle:
                        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Delectus esse commоди deserunt vitae, vero quasi!',
                btn: 'Подробнее',
        },
        {
                key: 'animation',
                className: 'card_color-2',
                title: 'Анимация и интерактив',
                subtitle:
                        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Delectus esse commоди deserunt vitae, vero quasi!',
                btn: 'Подробнее',
        },
        {
                key: 'support',
                className: 'card_color-3',
                title: 'Поддержка проектов',
                subtitle:
                        'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Delectus esse commоди deserunt vitae, vero quasi!',
                btn: 'Подробнее',
        },
]

type PortfolioItem = {
        key: string
        tags: string[]
        title: string
        subtitle: string
}

const PORTFOLIO_ITEMS: PortfolioItem[] = [
        {
                key: 'atomai',
                tags: ['2025', 'Веб-разработка', 'Интернет-магазин'],
                title: 'AtomAI',
                subtitle:
                        'AtomAI — SaaS-шаблон премиум-класса на базе искусственного интеллекта: современный UI для стартапов и корпоративных платформ.',
        },
        {
                key: 'fade',
                tags: ['2025', 'Веб-разработка', 'Интернет-магазин'],
                title: 'Fade',
                subtitle:
                        'Fade — гибкий шаблон с элементами генеративного дизайна, который помогает быстро запускать SaaS-продукты и e-commerce решения.',
        },
]

function App() {
	return (
		<div className='main'>
			<LeftMenu />
			<div className='container'>
				<HomeBanner />
				<NumbersCard />

				<section className='about'>
					{ABOUT_SECTIONS.map(({ key, content }) => (
						<Card key={key}>{content}</Card>
					))}
				</section>

				<TitleRow title='Мои услуги' btn='Все услуги' />

				<section className='services'>
					{SERVICES.map(({ key, className, title, subtitle, btn }) => (
						<Card key={key} className={className}>
							<ServiceCards title={title} subtitle={subtitle} btn={btn} />
						</Card>
					))}
				</section>

				<TitleRow title='Портфолио' btn='Все работы' />
				<section className='portfolio__wrapper'>
					{PORTFOLIO_ITEMS.map(({ key, tags, title, subtitle }) => (
						<Card key={key} className='card__portfolio'>
							<Portfolio
								tags={tags}
								title={title}
								subtitle={subtitle}
								link={{ href: '#', external: false }}
								image={{
									src: portfolio,
									alt: `Скриншот ${title}`,
								}}
							/>
						</Card>
					))}
				</section>

				<FooterBanner />

				<Card className='card__footer'>
					<Footer />
				</Card>
			</div>
		</div>
	)
}

export default App
