import { PROCESS } from '../../../data/experience'
import { WHY_ME, WHY_ME_PROOF } from '../../../data/home'
import { H2, PROCESS_WHY } from '../../../data/home4'
import SectionHead from '../../../components/sectionHead/SectionHead'
import Reveal from '../../../components/reveal/Reveal'

const COL_STAGGER = 0.09

/** Как работаю (docs/design-spec-home4.md §6.2): четыре колонки — шаг процесса и под ним обещание «Почему со мной» в панели */
export default function Process() {
	return (
		<section className='h4Section h4Process' id='process'>
			<div className='h4Container'>
				<SectionHead label='как работаю' title={H2.process} lead={WHY_ME_PROOF} />
				<ol className='h4Process__grid'>
					{PROCESS.map((s, i) => {
						const why = WHY_ME[PROCESS_WHY[i]]
						return (
							<Reveal as='li' key={s.step} delay={i * COL_STAGGER} className='h4Process__col'>
								<div className='h4Process__head'>
									<h3 className='h4Process__title'>{s.title}</h3>
									<span className='h4Process__num'>/{s.step}</span>
								</div>
								<p className='h4Process__text'>{s.text}</p>
								{why && (
									<div className='h4Process__panel'>
										<h4 className='h4Process__why'>{why.title}</h4>
										<p className='h4Process__whyText'>{why.text}</p>
									</div>
								)}
							</Reveal>
						)
					})}
				</ol>
			</div>
		</section>
	)
}
