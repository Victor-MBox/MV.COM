import { Link } from 'react-router-dom'
import { HOME_SERVICES, SECTIONS, SERVICES_HEAD } from '../../../data/home5'
import SectionIntro from '../../../components/sectionIntro/SectionIntro'
import Reveal from '../../../components/reveal/Reveal'

/** Услуги (ТЗ §10): три направления текстовыми блоками на общей поверхности, разделённые тонкими линиями; без карточек и технологий */
export default function Services() {
	const { num, label, id } = SECTIONS.services

	return (
		<section className='h5Section h5Services' id={id} aria-labelledby={`${id}-title`}>
			<div className='h5Container'>
				<Reveal y={16}>
					<SectionIntro id={`${id}-title`} num={num} label={label} title={SERVICES_HEAD.title} lead={SERVICES_HEAD.lead} />
				</Reveal>
				<ul className='h5Services__list'>
					{HOME_SERVICES.map((s, i) => (
						<Reveal as='li' key={s.title} index={i} y={16} className='h5Services__item'>
							<span className='h5Services__num'>{s.num}</span>
							<h3 className='h5Services__title'>{s.title}</h3>
							<p className='h5Services__text'>{s.text}</p>
							<Link to={s.to} className='h5More' aria-label={`${SERVICES_HEAD.more}: ${s.title}`}>
								{SERVICES_HEAD.more}
								<i aria-hidden='true'>↗</i>
							</Link>
						</Reveal>
					))}
				</ul>
			</div>
		</section>
	)
}
