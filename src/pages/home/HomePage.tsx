import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import HomeBanner from '../../components/homeBanner/HomeBanner'
import TitleRow from '../../components/titleRow/TitleRow'
import OfferTile from '../../components/offerTile/OfferTile'
import ProjectSpotlight from '../../components/projectSpotlight/ProjectSpotlight'
import ProjectCard from '../../components/projectCard/ProjectCard'
import ProcessList from '../../components/processList/ProcessList'
import PostTile from '../../components/postTile/PostTile'
import FooterBanner from '../../components/footerBanner/FooterBanner'

import { getOffer } from '../../data/offers'
import { PROJECTS } from '../../data/projects'
import { POSTS } from '../../data/posts'
import { HOME_OFFER_LAYOUT, HR_BLOCK, HR_LINE, PROOF, WHY_ME, WHY_ME_PROOF } from '../../data/home'
import { HOME_FAQ_KEYS, getFaq } from '../../data/faq'
import { CONTACT_LINKS } from '../../data/contacts'
import victor from '../../resources/victor.png'
import './HomePage.scss'

const FEATURED = PROJECTS.filter(p => p.featured).slice(0, 1)
const OTHERS = PROJECTS.filter(p => !FEATURED.includes(p)).slice(0, 2)
const HOME_OFFERS = HOME_OFFER_LAYOUT.flatMap(item => {
	const offer = getOffer(item.key)
	return offer ? [{ ...item, offer }] : []
})
const HOME_POSTS = POSTS.slice(0, 3)
const HOME_FAQ = getFaq(HOME_FAQ_KEYS)

/**
 * Главная по концепту D «Типографика» (content.md §5.1): hero + строка доказательства → «Что я делаю» →
 * главный кейс → «Как проходит работа» → «Почему со мной» → блог → «Для HR и тимлидов» → FAQ → CTA
 */
export default function HomePage() {
	return (
		<>
			<HomeBanner />

			<div className='homeProof'>
				{PROOF.map(f => (
					<div className='homeProof__fact' key={f.value}>
						<strong>{f.value}</strong>
						<span>{f.label}</span>
					</div>
				))}
				<div className='homeProof__hr'>
					<span>{HR_LINE.stack}</span>
					<span>{HR_LINE.place}</span>
					<Link to='/about'>Опыт и резюме →</Link>
				</div>
			</div>

			<section className='homeSection'>
				<TitleRow title='Что я делаю' btn='Все услуги' to='/services' />
				<div className='offerTiles'>
					{HOME_OFFERS.map((item, i) => (
						<OfferTile key={item.key} offer={item.offer} tone={item.tone} wide={item.wide} index={i} />
					))}
				</div>
			</section>

			<section className='homeSection'>
				<TitleRow title='Главный кейс' btn='Все работы' to='/portfolio' />
				<div className='homeProjects'>
					{FEATURED.map(p => (
						<ProjectSpotlight key={p.slug} project={p} />
					))}
					{OTHERS.length > 0 && (
						<div className='homeProjects__grid'>
							{OTHERS.map((p, i) => (
								<ProjectCard key={p.slug} project={p} index={i} />
							))}
						</div>
					)}
				</div>
			</section>

			<section className='homeSection'>
				<TitleRow title='Как проходит работа' />
				<ProcessList variant='rows' />
			</section>

			<section className='homeSection whyMe'>
				<TitleRow title='Почему со мной' />
				<ul className='whyMe__grid'>
					{WHY_ME.map((w, i) => (
						<motion.li
							key={w.title}
							initial={{ opacity: 0, y: 16 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: '-40px' }}
							transition={{ duration: 0.4, delay: (i % 4) * 0.08 }}
						>
							<h3>{w.title}</h3>
							<p>{w.text}</p>
						</motion.li>
					))}
				</ul>
				<p className='whyMe__proof'>{WHY_ME_PROOF}</p>
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
				<div className='hrBlock'>
					<div className='hrBlock__body'>
						<h2 className='hrBlock__title'>{HR_BLOCK.title}</h2>
						<p className='hrBlock__text'>{HR_BLOCK.text}</p>
						<div className='hrBlock__actions'>
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
					<img className='hrBlock__photo' src={victor} alt='' loading='lazy' />
				</div>
			</section>

			<section className='homeSection'>
				<TitleRow title='Частые вопросы' btn='Все вопросы' to='/services#faq' />
				<div className='homeFaq'>
					{HOME_FAQ.map(f => (
						<div className='homeFaq__item' key={f.key}>
							<h3>{f.q}</h3>
							<p>{f.a}</p>
						</div>
					))}
				</div>
			</section>

			<FooterBanner />
		</>
	)
}
