import { PROJECTS } from '../../../data/projects'
import { CASE_FACTS, H2 } from '../../../data/home4'
import SectionHead from '../../../components/sectionHead/SectionHead'
import Reveal from '../../../components/reveal/Reveal'
import Button from '../../../components/button/Button'
import WorkSlider from '../../../components/workSlider/WorkSlider'

/** Работы (docs/design-spec-home4.md §6.4): карточка главного кейса (слайдер от двух проектов) и текст по центру справа */
export default function Work() {
	const projects = [...PROJECTS].sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
	const main = projects[0]
	if (!main) return null

	return (
		<section className='h4Section h4Work' id='work'>
			<div className='h4Container h4Work__grid'>
				<Reveal className='h4Work__card'>
					<WorkSlider projects={projects} facts={CASE_FACTS} />
				</Reveal>
				<Reveal className='h4Work__text' delay={0.1}>
					<SectionHead label='работы' title={H2.work} className='h4Work__head' />
					<p className='h4Work__role'>{main.role}</p>
					<Button to='/portfolio'>Все работы</Button>
				</Reveal>
			</div>
		</section>
	)
}
