import { useMemo, useState } from 'react'
import { AnimatePresence, LayoutGroup } from 'framer-motion'
import PageHeader from '../../components/pageHeader/PageHeader'
import ProjectCard from '../../components/projectCard/ProjectCard'
import FeaturedProject from '../../components/featuredProject/FeaturedProject'
import FooterBanner from '../../components/footerBanner/FooterBanner'
import { PROJECTS, PROJECT_CATEGORIES } from '../../data/projects'
import './PortfolioPage.scss'

const ALL = 'Все'
/** Фильтры по категориям появляются, когда проектов достаточно, чтобы их было по чему фильтровать */
const FILTERS_FROM = 8

export default function PortfolioPage() {
	const [category, setCategory] = useState(ALL)
	const showFilters = PROJECTS.length >= FILTERS_FROM

	const projects = useMemo(
		() => (category === ALL ? PROJECTS : PROJECTS.filter(p => p.categories.includes(category))),
		[category]
	)
	const featured = category === ALL ? projects.filter(p => p.featured) : []
	const rest = projects.filter(p => !featured.includes(p))

	return (
		<>
			<PageHeader
				title='Портфолио'
				subtitle='Реальные проекты с результатом в цифрах. Все ссылки ведут на работающие сайты, а не на макеты.'
			/>

			{showFilters && (
				<div className='portfolioPage__toolbar'>
					<ul className='chips' role='tablist' aria-label='Фильтр по категории'>
						{[ALL, ...PROJECT_CATEGORIES].map(c => {
							const isActive = c === category
							return (
								<li key={c}>
									<button
										type='button'
										role='tab'
										aria-selected={isActive}
										className={`chip${isActive ? ' is-active' : ''}`}
										onClick={() => setCategory(c)}
									>
										{c}
									</button>
								</li>
							)
						})}
					</ul>
				</div>
			)}

			{featured.length > 0 && (
				<section className='portfolioPage__featured'>
					{featured.map(p => (
						<FeaturedProject key={p.slug} project={p} />
					))}
				</section>
			)}

			{rest.length > 0 && (
				<LayoutGroup>
					<section className='portfolioPage__grid'>
						<AnimatePresence mode='popLayout'>
							{rest.map((p, i) => (
								<ProjectCard key={p.slug} project={p} index={i} />
							))}
						</AnimatePresence>
					</section>
				</LayoutGroup>
			)}

			<FooterBanner />
		</>
	)
}
