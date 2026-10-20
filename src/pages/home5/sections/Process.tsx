import { PROCESS_HEAD, PROCESS_STEPS, SECTIONS } from '../../../data/home5'
import SectionIntro from '../../../components/sectionIntro/SectionIntro'
import Reveal from '../../../components/reveal/Reveal'

/** Процесс (ТЗ §11): слева крупный заголовок, справа спокойная сетка 2×2 с тонкими номерами и линиями; на мобильных — вертикально вдоль одной линии */
export default function Process() {
	const { num, label, id } = SECTIONS.process

	return (
		<section className='h5Section h5Process' id={id} aria-labelledby={`${id}-title`}>
			<div className='h5Container h5Process__grid'>
				<Reveal y={16} className='h5Process__head'>
					<SectionIntro id={`${id}-title`} num={num} label={label} size='big' title={PROCESS_HEAD.title} lead={PROCESS_HEAD.lead} compact />
				</Reveal>
				<ol className='h5Process__steps'>
					{PROCESS_STEPS.map((step, i) => (
						<Reveal as='li' key={step.num} index={i} y={16} className='h5Process__step'>
							<span className='h5Process__num' aria-hidden='true'>
								{step.num}
							</span>
							<h3 className='h5Process__title'>{step.title}</h3>
							<p className='h5Process__text'>{step.text}</p>
						</Reveal>
					))}
				</ol>
			</div>
		</section>
	)
}
