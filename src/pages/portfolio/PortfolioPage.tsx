import { useMemo, useState } from 'react'
import { AnimatePresence, LayoutGroup } from 'framer-motion'
import PageHeader from '../../components/pageHeader/PageHeader'
import ProjectCard from '../../components/projectCard/ProjectCard'
import FooterBanner from '../../components/footerBanner/FooterBanner'
import { PROJECTS, PROJECT_CATEGORIES } from '../../data/projects'
import './PortfolioPage.scss'

const ALL = 'Все'

export default function PortfolioPage() {
	const [category, setCategory] = useState(ALL)

	const projects = useMemo(
		() => (category === ALL ? PROJECTS : PROJECTS.filter(p => p.categories.includes(category))),
		[category]
	)

	return (
		<>
			<PageHeader
				title='Портфолио'
				subtitle='Избранные проекты за последние годы: SaaS-интерфейсы, интернет-магазины, промо-сайты с анимацией и интеграции с CRM.'
				aside={
					<div className='pageStat'>
						<strong>{PROJECTS.length}</strong>
						<span>проектов в подборке</span>
					</div>
				}
			/>

			<div className='portfolioPage__toolbar'>
				<ul className='chips' role='tablist' aria-label='Фильтр по категории'>
					{[ALL, ...PROJECT_CATEGORIES].map(c => {
						const count = c === ALL ? PROJECTS.length : PROJECTS.filter(p => p.categories.includes(c)).length
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
									<span className='chip__count'>{count}</span>
								</button>
							</li>
						)
					})}
				</ul>
				<p className='portfolioPage__count' aria-live='polite'>
					Показано: {projects.length}
				</p>
			</div>

			<LayoutGroup>
				<section className='portfolioPage__grid'>
					<AnimatePresence mode='popLayout'>
						{projects.map((p, i) => (
							<ProjectCard key={p.slug} project={p} index={i} />
						))}
					</AnimatePresence>
				</section>
			</LayoutGroup>

			<FooterBanner />
		</>
	)
}
