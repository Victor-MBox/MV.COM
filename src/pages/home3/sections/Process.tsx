import { PROCESS } from '../../../data/experience'
import { WHY_ME, WHY_ME_PROOF } from '../../../data/home'
import { PRICING } from '../../../data/pricing'
import { H2 } from '../../../data/home3'
import SectionHead from '../../../components/sectionHead/SectionHead'
import Reveal from '../../../components/reveal/Reveal'
import DimAccordion from '../../../components/dimAccordion/DimAccordion'

/** Как работаю (docs/design-spec.md §7.4): аккордеон процесса с пригашиванием и липкая колонка «Почему со мной» */
export default function Process() {
	const items = PROCESS.map(s => ({ id: s.step, number: s.step, title: s.title, content: <p>{s.text}</p> }))

	return (
		<section className='home3Section' id='process'>
			<SectionHead label='как работаю' title={H2.process} lead={PRICING.estimate} />
			<div className='process__grid'>
				<Reveal className='process__acc'>
					<DimAccordion idPrefix='process' items={items} defaultOpen={[PROCESS[0].step]} />
				</Reveal>
				<aside className='process__why'>
					<ul className='why'>
						{WHY_ME.map((w, i) => (
							<Reveal as='li' key={w.title} index={i} className='why__item'>
								<h3 className='why__title'>{w.title}</h3>
								<p className='why__text'>{w.text}</p>
							</Reveal>
						))}
					</ul>
					<Reveal>
						<p className='why__proof'>{WHY_ME_PROOF}</p>
					</Reveal>
				</aside>
			</div>
		</section>
	)
}
