import type { ReactNode } from 'react'
import { PROCESS } from '../../data/experience'
import { H2, PROCESS_WHY, WHY_ME, WHY_ME_PROOF } from '../../data/home'
import SectionHead from '../sectionHead/SectionHead'
import type { Headline } from '../sectionHead/SectionHead'
import Reveal from '../reveal/Reveal'
import ProcessArt from './ProcessArt'
import './ProcessSteps.scss'

type Props = {
	label?: string
	title?: Headline
	lead?: ReactNode
	/** Панели с обещаниями «Почему со мной» под шагами (главная); на внутренних страницах — только шаги */
	withWhy?: boolean
	id?: string
}

const COL_STAGGER = 0.09

/**
 * Единственный процесс работы на сайте (content.md §4.4; docs/design-spec-home4.md §6.2): четыре колонки — линейная
 * иллюстрация шага (ProcessArt), шаг PROCESS[i] и, если withWhy, под ним обещание «Почему со мной» в панели.
 * Главная, /services и страницы офферов рендерят один и тот же компонент
 */
export default function ProcessSteps({ label = 'как работаю', title = H2.process, lead = WHY_ME_PROOF, withWhy = true, id = 'process' }: Props) {
	return (
		<section className='section processSteps' id={id}>
			<div className='container'>
				<SectionHead label={label} title={title} lead={lead} />
				<ol className='processSteps__grid'>
					{PROCESS.map((s, i) => {
						const why = withWhy ? WHY_ME[PROCESS_WHY[i]] : undefined
						return (
							<Reveal as='li' key={s.step} delay={i * COL_STAGGER} className='processSteps__col'>
								<ProcessArt step={i} className='processSteps__art' />
								<div className='processSteps__head'>
									<h3 className='processSteps__title'>{s.title}</h3>
									<span className='processSteps__num'>/{s.step}</span>
								</div>
								<p className='processSteps__text'>{s.text}</p>
								{why && (
									<div className='processSteps__panel'>
										<h4 className='processSteps__why'>{why.title}</h4>
										<p className='processSteps__whyText'>{why.text}</p>
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
