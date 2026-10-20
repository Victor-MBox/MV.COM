import { PROJECTS } from '../../../data/projects'
import { H2 } from '../../../data/home3'
import SectionHead from '../../../components/sectionHead/SectionHead'
import Reveal from '../../../components/reveal/Reveal'
import CaseCard from '../../../components/caseCard/CaseCard'

/** Работы (docs/design-spec.md §7.3): широкая карточка главного кейса, ниже две карточки, если проектов от трёх */
export default function Work() {
	const main = PROJECTS.find(p => p.featured) ?? PROJECTS[0]
	if (!main) return null
	const others = PROJECTS.filter(p => p !== main).slice(0, 2)

	return (
		<section className='home3Section' id='work'>
			<SectionHead label='работы' title={H2.work} action={{ label: 'Все работы', to: '/portfolio' }} />
			<Reveal>
				<CaseCard project={main} wide />
			</Reveal>
			{PROJECTS.length >= 3 && (
				<div className='work__grid'>
					{others.map((p, i) => (
						<Reveal key={p.slug} index={i}>
							<CaseCard project={p} />
						</Reveal>
					))}
				</div>
			)}
		</section>
	)
}
