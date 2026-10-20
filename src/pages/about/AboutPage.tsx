import PageHeader from '../../components/pageHeader/PageHeader'
import Card from '../../components/cards/Cards'
import Accordion from '../../components/accordion/Accordion'
import TitleRow from '../../components/titleRow/TitleRow'
import FeaturedProject from '../../components/featuredProject/FeaturedProject'
import FooterBanner from '../../components/footerBanner/FooterBanner'
import { useContactModal } from '../../components/contactModal/ContactModalContext'
import { EXPERIENCE, STACK_GROUPS } from '../../data/experience'
import { PROJECTS } from '../../data/projects'
import { CONTACT_LINKS } from '../../data/contacts'
import { HR_BLOCK } from '../../data/home'
import avatar from '../../resources/avatar.png'
import './AboutPage.scss'

const ABOUT = [
	'Восемь лет делаю сайты и веб-сервисы: от лендингов на WordPress до продуктов на Laravel и React. Беру проект целиком — структура, дизайн, фронтенд, бэкенд, запуск и поддержка — и отвечаю за результат, а не за отдельный слой.',
	'Лучше всего получается собрать систему из многих частей и довести её до живых пользователей. Пример — NoRandoms, собственная платформа для подбора напарников по играм: спроектировал, написал и вывел в поиск в одиночку, от схемы базы и WebSockets до SEO-ядра из тысяч страниц.',
	'Работаю удалённо, по договору, с еженедельными версиями на тестовом домене. Открыт к проектной работе, контракту и part-time. Код пишу так, чтобы следующий разработчик разобрался без меня.',
]

const PRINCIPLES = [
	'Скорость загрузки — часть дизайна, а не оптимизация «потом».',
	'Анимация объясняет интерфейс, а не украшает его.',
	'Код должен быть понятен следующему разработчику без меня.',
	'Промежуточные версии — каждую неделю, без сюрпризов в конце.',
]

const FEATURED = PROJECTS.filter(p => p.featured).slice(0, 1)

/** «Обо мне» — страница для найма (content.md §4.6): шапка с резюме и GitHub → о себе → стек → опыт → принципы → главный кейс */
export default function AboutPage() {
	const { open } = useContactModal()

	return (
		<>
			<PageHeader
				title='Виктор Мацаков'
				subtitle='Full-stack разработчик · удалённо'
				actions={
					<>
						<a className='btn btn_light' href={HR_BLOCK.cv} download>
							<span className='btn__label'>Резюме PDF</span>
						</a>
						<a className='btn btn_dark' href={CONTACT_LINKS.github} target='_blank' rel='noopener noreferrer'>
							<span>GitHub</span>
						</a>
						<button type='button' className='btn btn_dark' onClick={() => open()}>
							<span>Написать</span>
						</button>
					</>
				}
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

			<section className='aboutPage__section aboutPage__intro'>
				{ABOUT.map(p => (
					<p key={p}>{p}</p>
				))}
			</section>

			<section className='aboutPage__section' id='stack'>
				<TitleRow title='Стек' />
				<dl className='aboutStack'>
					{STACK_GROUPS.map(g => (
						<div key={g.title}>
							<dt>{g.title}</dt>
							<dd>
								<ul className='stackChips'>
									{g.items.map(i => (
										<li key={i}>{i}</li>
									))}
								</ul>
							</dd>
						</div>
					))}
				</dl>
			</section>

			<section className='aboutPage__section' id='experience'>
				<TitleRow title='Опыт' />
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

			<section className='aboutPage__section'>
				<Card className='aboutPage__principles'>
					<div className='title'>Принципы</div>
					<ul>
						{PRINCIPLES.map(p => (
							<li key={p}>{p}</li>
						))}
					</ul>
				</Card>
			</section>

			{FEATURED.length > 0 && (
				<section className='aboutPage__section'>
					<TitleRow title='Главный кейс' btn='Все работы' to='/portfolio' />
					{FEATURED.map(p => (
						<FeaturedProject key={p.slug} project={p} />
					))}
				</section>
			)}

			<FooterBanner />
		</>
	)
}
