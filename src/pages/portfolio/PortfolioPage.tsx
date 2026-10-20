import { useMemo, useState } from 'react'
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion'
import PageHead from '../../components/pageHead/PageHead'
import CaseCard from '../../components/caseCard/CaseCard'
import Reveal from '../../components/reveal/Reveal'
import CtaBlock from '../../components/ctaBlock/CtaBlock'
import { PROJECTS, PROJECT_CATEGORIES } from '../../data/projects'
import './PortfolioPage.scss'

const ALL = 'Все'
/** Фильтры по категориям появляются, когда проектов достаточно, чтобы их было по чему фильтровать (§9) */
const FILTERS_FROM = 8
const EASE_OUT = [0.2, 0.7, 0.2, 1] as const

// TODO (владелец): H1 портфолио; лид — с прежней версии страницы
const HEAD = {
	title: { text: 'Проекты с результатом в цифрах', accent: 'в цифрах' },
	lead: 'Реальные проекты с результатом в цифрах. Все ссылки ведут на работающие сайты, а не на макеты.',
}

/**
 * Портфолио (docs/design-spec.md §9): шапка → фильтры-чипы (от восьми проектов) → главный кейс широкой карточкой →
 * сетка CaseCard в две колонки → CTA. Страница работает и с одним проектом, и с десятком
 */
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
		<div className='portfolioPage'>
			<PageHead label='работы' title={HEAD.title} lead={HEAD.lead} />

			<section className='section' id='projects' aria-label='Проекты'>
				<div className='container'>
					{showFilters && (
						<ul className='portfolioPage__filters' role='tablist' aria-label='Фильтр по категории'>
							{[ALL, ...PROJECT_CATEGORIES].map(c => {
								const isActive = c === category
								return (
									<li key={c}>
										<button
											type='button'
											role='tab'
											aria-selected={isActive}
											className={`portfolioPage__filter${isActive ? ' is-active' : ''}`}
											onClick={() => setCategory(c)}
										>
											{c}
										</button>
									</li>
								)
							})}
						</ul>
					)}

					{featured.length > 0 && (
						<div className='portfolioPage__featured'>
							{featured.map((p, i) => (
								<Reveal key={p.slug} index={i}>
									<CaseCard project={p} wide />
								</Reveal>
							))}
						</div>
					)}

					{rest.length > 0 && (
						<LayoutGroup>
							<ul className='portfolioPage__grid'>
								<AnimatePresence mode='popLayout' initial={false}>
									{rest.map((p, i) => (
										<motion.li
											key={p.slug}
											layout
											initial={{ opacity: 0, y: 24 }}
											whileInView={{ opacity: 1, y: 0 }}
											viewport={{ once: true, amount: 0.15 }}
											exit={{ opacity: 0, scale: 0.98 }}
											transition={{ duration: 0.36, ease: EASE_OUT, delay: Math.min(i, 7) * 0.06 }}
										>
											<CaseCard project={p} />
										</motion.li>
									))}
								</AnimatePresence>
							</ul>
						</LayoutGroup>
					)}
				</div>
			</section>

			<CtaBlock cta='Обсудить проект' />
		</div>
	)
}
