import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import HeroPortrait from '../../components/heroPortrait/HeroPortrait'
import TitleRow from '../../components/titleRow/TitleRow'
import OfferTile from '../../components/offerTile/OfferTile'
import AudienceTabs from '../../components/audienceTabs/AudienceTabs'
import ProjectCover from '../../components/projectCover/ProjectCover'
import ProcessList from '../../components/processList/ProcessList'
import PostTile from '../../components/postTile/PostTile'
import ContactForm from '../../components/contactForm/ContactForm'
import Reveal from '../../components/reveal/Reveal'

import { getOffer } from '../../data/offers'
import { PROJECTS } from '../../data/projects'
import { POSTS } from '../../data/posts'
import { HOME_OFFER_LAYOUT, HR_BLOCK, HR_LINE, WHY_ME, WHY_ME_PROOF } from '../../data/home'
import { STACK_GROUPS } from '../../data/experience'
import { HOME_FAQ_KEYS, getFaq } from '../../data/faq'
import { CONTACTS, CONTACT_LINKS } from '../../data/contacts'
import avatar from '../../resources/avatar.png'
import '../home/HomePage.scss'
import './Home2Page.scss'

const FEATURED = PROJECTS.find(p => p.featured) ?? PROJECTS[0]
const HOME_OFFERS = HOME_OFFER_LAYOUT.flatMap(item => {
	const offer = getOffer(item.key)
	return offer ? [{ ...item, offer }] : []
})
const HOME_POSTS = POSTS.slice(0, 3)
const HOME_FAQ = getFaq(HOME_FAQ_KEYS)
/** Бегущая строка стека в блоке HR — все технологии из «Обо мне» без группировки */
const STACK = STACK_GROUPS.flatMap(g => g.items)
const EASE = [0.2, 0.7, 0.2, 1] as const

const reveal = (i = 0) => ({
	initial: { opacity: 0, y: 24 },
	whileInView: { opacity: 1, y: 0 },
	viewport: { once: true, margin: '-40px' },
	transition: { duration: 0.6, delay: (i % 4) * 0.07, ease: EASE },
})

/**
 * Альтернативная главная `/home2` по концепту H «Портрет» (content.md §5.1, вариант H). Текущая главная `/`
 * остаётся концептом D. Порядок блоков: hero с портретом и строка для HR → «Что я делаю» → «Кому я нужен» →
 * главный кейс обложкой → цитата → процесс колонками → «Почему со мной» строками → блог → «Для HR» с бегущей
 * строкой стека → FAQ → CTA с формой
 */
export default function Home2Page() {
	return (
		<>
			<HeroPortrait />
			<Reveal className='heroStrip' delay={0.9}>
				<span>{HR_LINE.stack}</span>
				<span className='heroStrip__sep' aria-hidden='true'>
					|
				</span>
				<span>Собственный продукт в продакшене</span>
				<span className='heroStrip__sep' aria-hidden='true'>
					|
				</span>
				<Link to='/about'>Опыт и резюме →</Link>
			</Reveal>

			<section className='homeSection'>
				<TitleRow title='Что я делаю' btn='Все услуги' to='/services' />
				<div className='offerTiles'>
					{HOME_OFFERS.map((item, i) => (
						<OfferTile key={item.key} offer={item.offer} tone={item.tone} wide={item.wide} index={i} detailed />
					))}
				</div>
			</section>

			<section className='homeSection'>
				<TitleRow title='Кому я нужен' />
				<AudienceTabs />
			</section>

			{FEATURED && (
				<section className='homeSection'>
					<TitleRow title='Главный кейс' btn='Все работы' to='/portfolio' />
					<ProjectCover project={FEATURED} />
				</section>
			)}

			<Reveal className='home2Quote'>
				<div className='home2Quote__blob' aria-hidden='true' />
				<div className='home2Quote__inner'>
					<img className='home2Quote__photo' src={avatar} alt='' loading='lazy' />
					<div>
						<p className='home2Quote__text'>«{WHY_ME_PROOF.replace(/\.$/, '')}».</p>
						<p className='home2Quote__by'>
							<strong>Виктор Мацаков</strong>
							<span className='home2Quote__sep' aria-hidden='true'>
								|
							</span>
							<span>Full-stack разработчик · {HR_LINE.place}</span>
						</p>
					</div>
				</div>
			</Reveal>

			<section className='homeSection'>
				<TitleRow title='Как проходит работа' />
				<ProcessList variant='columns' />
			</section>

			<section className='homeSection'>
				<TitleRow title='Почему со мной' />
				<ol className='whyRows'>
					{WHY_ME.map((w, i) => (
						<motion.li key={w.title} {...reveal(i)}>
							<span className='whyRows__num'>({String(i + 1).padStart(2, '0')})</span>
							<h3>{w.title}</h3>
							<p>{w.text}</p>
						</motion.li>
					))}
				</ol>
			</section>

			{HOME_POSTS.length > 0 && (
				<section className='homeSection'>
					<TitleRow title='Блог о разработке' btn='Все статьи' to='/blog' />
					<div className='homePosts'>
						{HOME_POSTS.map((post, i) => (
							<PostTile key={post.slug} post={post} index={i} />
						))}
					</div>
				</section>
			)}

			<section className='homeSection'>
				<Reveal className='hrCard'>
					<div className='hrCard__head'>
						<div>
							<h2 className='hrCard__title'>{HR_BLOCK.title}</h2>
							<p className='hrCard__text'>{HR_BLOCK.text}</p>
						</div>
						<div className='hrCard__actions'>
							<a className='btn btn_dark' href={HR_BLOCK.cv} download>
								<span>Резюме PDF</span>
							</a>
							<a className='btn btn_dark' href={CONTACT_LINKS.github} target='_blank' rel='noopener noreferrer'>
								<span>GitHub</span>
							</a>
							<Link to='/about' className='textLink'>
								Опыт и стек →
							</Link>
						</div>
					</div>
					<div className='hrCard__marquee' aria-label='Стек технологий'>
						<div className='hrCard__track'>
							{[0, 1].map(copy => (
								<ul key={copy} aria-hidden={copy === 1 || undefined}>
									{STACK.map(tech => (
										<li key={tech}>{tech}</li>
									))}
								</ul>
							))}
						</div>
					</div>
				</Reveal>
			</section>

			<section className='homeSection'>
				<TitleRow title='Частые вопросы' btn='Все вопросы' to='/services#faq' />
				<div className='homeFaq'>
					{HOME_FAQ.map((f, i) => (
						<motion.div className='homeFaq__item' key={f.key} {...reveal(i % 2)}>
							<h3>{f.q}</h3>
							<p>{f.a}</p>
						</motion.div>
					))}
				</div>
			</section>

			<Reveal className='home2Cta'>
				<div className='home2Cta__body'>
					<h2 className='home2Cta__title'>
						Расскажите о задаче — <span className='home2Cta__accent'>через два дня</span> пришлю смету и срок
					</h2>
					<p className='home2Cta__subtitle'>Напишите в Telegram или оставьте заявку. Отвечаю в течение рабочего дня.</p>
					<div className='home2Cta__person'>
						<img src={avatar} alt='' loading='lazy' />
						<div>
							<strong>Виктор Мацаков</strong>
							<a href={CONTACT_LINKS.telegram} target='_blank' rel='noopener noreferrer'>
								Telegram: @{CONTACTS.telegram}
							</a>
						</div>
					</div>
				</div>
				<div className='home2Cta__form'>
					<ContactForm compact />
				</div>
			</Reveal>
		</>
	)
}
