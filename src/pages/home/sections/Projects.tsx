import { PROJECTS } from '../../../data/projects'
import { H2, PROJECTS_ANCHOR } from '../../../data/home'
import SectionHead from '../../../components/sectionHead/SectionHead'
import Reveal from '../../../components/reveal/Reveal'
import CaseCard from '../../../components/caseCard/CaseCard'

/** Главный кейс первым, остальные — в порядке PROJECTS */
const ITEMS = [...PROJECTS].sort((a, b) => Number(!!b.featured) - Number(!!a.featured))

/**
 * Проекты (ТЗ от 21.10.2026, §6): только настоящие кейсы из PROJECTS — широкой карточкой каждый, без слайдера, пустых
 * слайдов и примеров-плейсхолдеров. «Все проекты» — только когда кейсов больше одного. На секцию ведёт
 * «Посмотреть проекты» из hero: id постоянный (PROJECTS_ANCHOR), tabIndex −1 — чтобы принять фокус после перехода
 */
export default function Projects() {
	if (ITEMS.length === 0) return null

	return (
		<section className='section homeProjects' id={PROJECTS_ANCHOR} tabIndex={-1} aria-labelledby='home-projects-title'>
			<div className='container'>
				<SectionHead
					label='проекты'
					title={H2.projects}
					titleId='home-projects-title'
					action={ITEMS.length > 1 ? { label: 'Все проекты', to: '/portfolio' } : undefined}
				/>
				<ul className='homeProjects__list'>
					{ITEMS.map((p, i) => (
						<Reveal as='li' key={p.slug} index={i}>
							<CaseCard project={p} teaser />
						</Reveal>
					))}
				</ul>
			</div>
		</section>
	)
}
