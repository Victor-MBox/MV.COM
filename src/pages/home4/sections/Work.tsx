import { PROJECTS } from '../../../data/projects'
import { H2, WORK_SLIDES } from '../../../data/home4'
import SectionHead from '../../../components/sectionHead/SectionHead'
import Reveal from '../../../components/reveal/Reveal'
import Button from '../../../components/button/Button'
import WorkSlider from '../../../components/workSlider/WorkSlider'

/**
 * Работы (docs/design-spec-home4.md §6.4): слайдер карточек WORK_SLIDES (главный кейс первым, затем примеры-плейсхолдеры,
 * пока нет второго реального кейса) и текст о главном кейсе по центру справа
 */
export default function Work() {
	const main = PROJECTS.find(p => p.featured) ?? PROJECTS[0]
	if (!main || WORK_SLIDES.length === 0) return null

	return (
		<section className='h4Section h4Work' id='work'>
			<div className='h4Container h4Work__grid'>
				<Reveal className='h4Work__card'>
					<WorkSlider items={WORK_SLIDES} />
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
