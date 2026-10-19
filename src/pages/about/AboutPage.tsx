import { Link } from 'react-router-dom'
import PageHeader from '../../components/pageHeader/PageHeader'
import Card from '../../components/cards/Cards'
import InfoBlock from '../../components/cards/infoBloсk/InfoBlock'
import Skills from '../../components/cards/skills/Skills'
import MyStack from '../../components/cards/myStack/MyStack'
import Accordion from '../../components/accordion/Accordion'
import FooterBanner from '../../components/footerBanner/FooterBanner'
import { EXPERIENCE, PROCESS } from '../../data/experience'
import avatar from '../../resources/avatar.png'
import './AboutPage.scss'

export default function AboutPage() {
	return (
		<>
			<PageHeader
				title='Обо мне'
				subtitle='Я Виктор Мацаков, full-stack разработчик. Восемь лет делаю сайты и веб-приложения: от лендингов на WordPress до SaaS-интерфейсов на React. Люблю, когда интерфейс быстрый, а анимации — к месту.'
				aside={
					<div className='aboutPage__photo'>
						<img src={avatar} alt='Виктор Мацаков' />
						<span className='aboutPage__status'>
							<i aria-hidden='true' />
							Открыт для проектов
						</span>
					</div>
				}
			/>

			<section className='about'>
				<Card>
					<Skills />
				</Card>
				<Card>
					<InfoBlock />
				</Card>
				<Card className='aboutPage__principles'>
					<div className='title'>Принципы</div>
					<ul>
						<li>Скорость загрузки — часть дизайна, а не оптимизация «потом».</li>
						<li>Анимация объясняет интерфейс, а не украшает его.</li>
						<li>Код должен быть понятен следующему разработчику без меня.</li>
						<li>Промежуточные версии — каждую неделю, без сюрпризов в конце.</li>
					</ul>
				</Card>
				<Card>
					<MyStack />
				</Card>
			</section>

			<section className='aboutPage__section' id='experience'>
				<div className='titlerow'>
					<div className='title'>Опыт</div>
					<Link to='/portfolio' className='btn btn_dark'>
						<span>Смотреть работы</span>
					</Link>
				</div>
				<Accordion
					defaultOpen={EXPERIENCE[0].period}
					items={EXPERIENCE.map(e => ({
						key: e.period,
						meta: e.period,
						head: (
							<>
								{e.position}
								<span className='aboutPage__company'> · {e.company}</span>
							</>
						),
						body: (
							<>
								<p>{e.summary}</p>
								<ul>
									{e.details.map(d => (
										<li key={d}>{d}</li>
									))}
								</ul>
							</>
						),
					}))}
				/>
			</section>

			<section className='aboutPage__section' id='process'>
				<div className='titlerow'>
					<div className='title'>Как я работаю</div>
					<Link to='/services' className='btn btn_dark'>
						<span>Все услуги</span>
					</Link>
				</div>
				<ol className='aboutPage__process'>
					{PROCESS.map(p => (
						<li key={p.step}>
							<span className='aboutPage__process-step'>{p.step}</span>
							<h3>{p.title}</h3>
							<p>{p.text}</p>
						</li>
					))}
				</ol>
			</section>

			<FooterBanner />
		</>
	)
}
