import type { ReactNode } from 'react'
import { PROCESS, PROCESS_COPY } from '../../data/experience'
import type { ProcessStep } from '../../data/experience'
import { H2 } from '../../data/home'
import SectionHead from '../sectionHead/SectionHead'
import type { Headline } from '../sectionHead/SectionHead'
import Reveal from '../reveal/Reveal'
import ProcessArt from './ProcessArt'
import './ProcessSteps.scss'

type Props = {
	/** Четыре шага; по умолчанию — процесс новой разработки PROCESS, у интеграций, доработки и агентств свои (Offer.process) */
	steps?: ProcessStep[]
	label?: string
	title?: Headline
	lead?: ReactNode
	/** Условие под шагами: новые задачи за пределами объёма оцениваются отдельно */
	note?: ReactNode
	id?: string
}

const COL_STAGGER = 0.09

/**
 * Процесс работы (content.md §4.4; ТЗ от 21.10.2026, §8): четыре колонки — линейная иллюстрация шага (ProcessArt по
 * номеру шага), заголовок и текст; под колонками — условие про изменения объёма. Главная, /services и страницы
 * офферов рендерят один и тот же компонент, меняются только шаги. Панелей «Почему со мной» больше нет: их смысл
 * вошёл в сами шаги
 */
export default function ProcessSteps({
	steps = PROCESS,
	label = 'как работаю',
	title = H2.process,
	lead = PROCESS_COPY.lead,
	note = PROCESS_COPY.note,
	id = 'process',
}: Props) {
	return (
		<section className='section processSteps' id={id}>
			<div className='container'>
				<SectionHead label={label} title={title} lead={lead} />
				<ol className='processSteps__grid'>
					{steps.map((s, i) => (
						<Reveal as='li' key={s.step} delay={i * COL_STAGGER} className='processSteps__col'>
							<ProcessArt step={i} className='processSteps__art' />
							<div className='processSteps__head'>
								<h3 className='processSteps__title'>{s.title}</h3>
								<span className='processSteps__num'>/{s.step}</span>
							</div>
							<p className='processSteps__text'>{s.text}</p>
						</Reveal>
					))}
				</ol>
				{note && (
					<Reveal as='p' className='processSteps__note'>
						{note}
					</Reveal>
				)}
			</div>
		</section>
	)
}
