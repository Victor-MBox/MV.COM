import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import HomeBanner from '../../components/homeBanner/HomeBanner'
import NumbersCard from '../../components/numbersCard/NumbersCard'
import TitleSubtitle from '../../components/cards/titleSubtitle/TitleSubtitle'
import Card from '../../components/cards/Cards'
import InfoBlock from '../../components/cards/infoBloсk/InfoBlock'
import Skills from '../../components/cards/skills/Skills'
import MyStack from '../../components/cards/myStack/MyStack'
import TitleRow from '../../components/titleRow/TitleRow'
import ServiceCards from '../../components/cards/setviceCards/ServiceCards'
import Portfolio from '../../components/cards/portfolio/Portfolio'
import FooterBanner from '../../components/footerBanner/FooterBanner'

import { HOME_SERVICES } from '../../data/services'
import { PROJECTS } from '../../data/projects'

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

const FEATURED = PROJECTS.filter(p => p.featured).slice(0, 2)

export default function HomePage() {
	return (
		<>
			<HomeBanner />
			<NumbersCard />

			<section className='about'>
				{ABOUT_SECTIONS.map(({ key, content }) => (
					<Card key={key}>{content}</Card>
				))}
			</section>

			<TitleRow title='Мои услуги' btn='Все услуги' to='/services' />

			<section className='services'>
				{HOME_SERVICES.map(({ key, className, title, subtitle, to }) => (
					<Card key={key} className={className}>
						<ServiceCards title={title} subtitle={subtitle} btn='Подробнее' to={to} />
					</Card>
				))}
			</section>

			<TitleRow title='Портфолио' btn='Все работы' to='/portfolio' />
			<section className='portfolio__wrapper'>
				{FEATURED.map(project => (
					<Card key={project.slug} className='card__portfolio'>
						<Portfolio
							tags={[String(project.year), ...project.categories]}
							title={project.title}
							subtitle={project.tagline}
							link={{ href: `/portfolio/${project.slug}` }}
							image={{ src: project.cover, alt: `Скриншот ${project.title}` }}
						/>
					</Card>
				))}
			</section>

			<p className='portfolio__more'>
				<Link to='/portfolio' className='link-btn'>
					<span>Смотреть все проекты</span>
				</Link>
			</p>

			<FooterBanner />
		</>
	)
}
