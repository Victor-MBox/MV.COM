import { useParams } from 'react-router-dom'
import PageHeader from '../../components/pageHeader/PageHeader'
import FooterBanner from '../../components/footerBanner/FooterBanner'
import ServiceTile from '../../components/serviceTile/ServiceTile'
import ProcessSteps from '../../components/processSteps/ProcessSteps'
import FlowScheme from '../../components/flowScheme/FlowScheme'
import Accordion from '../../components/accordion/Accordion'
import ProjectCard from '../../components/projectCard/ProjectCard'
import { useContactModal } from '../../components/contactModal/ContactModalContext'
import { getGroup, getGroupStack, getServicesByGroup } from '../../data/services'
import { PROJECTS } from '../../data/projects'
import { plural } from '../../utils/plural'
import NotFoundPage from '../NotFoundPage'
import './Services.scss'

export default function DirectionPage() {
	const { group: key } = useParams()
	const group = getGroup(key)
	const { open } = useContactModal()

	if (!group) return <NotFoundPage />

	const services = getServicesByGroup(group.key)
	const stack = getGroupStack(group.key)
	const projects = PROJECTS.filter(p => p.categories.some(c => group.categories.includes(c))).slice(0, 2)

	return (
		<article key={group.key}>
			<PageHeader
				title={group.title}
				subtitle={group.description}
				crumbs={[{ label: 'Услуги', to: '/services' }, { label: group.title }]}
				aside={
					<button type='button' className='btn btn_light' onClick={() => open(group.title)}>
						<span className='btn__label'>Обсудить задачу</span>
					</button>
				}
			/>

			<section className='dirHero'>
				<div className='dirHero__image'>
					<img src={group.image} alt='' />
				</div>
				<div className='dirHero__audience'>
					<span className='eyebrow'>Кому подходит</span>
					{group.audience.map(a => (
						<div key={a.title} className='audience'>
							<strong>{a.title}</strong>
							<p>{a.text}</p>
						</div>
					))}
				</div>
			</section>

			<section className='block'>
				<div className='titlerow'>
					<div className='title'>Что делаю</div>
					<span className='block__hint'>{plural(services.length, ['услуга', 'услуги', 'услуг'])}</span>
				</div>
				<div className='serviceGrid'>
					{services.map(s => (
						<ServiceTile key={s.key} service={s} />
					))}
				</div>
			</section>

			<section className='block'>
				<div className='titlerow'>
					<div className='title'>Как проходит работа</div>
				</div>
				<ProcessSteps steps={group.process} />
				<div className='block__scheme'>
					<span className='eyebrow'>Схема</span>
					<FlowScheme nodes={group.scheme} />
				</div>
			</section>

			<section className='block block--split'>
				<div>
					<span className='eyebrow'>Технологии</span>
					<ul className='stackChips'>
						{stack.map(t => (
							<li key={t}>{t}</li>
						))}
					</ul>
				</div>
				{projects.length > 0 && (
					<div>
						<span className='eyebrow'>Примеры работ</span>
						<div className='projectsRow'>
							{projects.map((p, i) => (
								<ProjectCard key={p.slug} project={p} index={i} />
							))}
						</div>
					</div>
				)}
			</section>

			<section className='block'>
				<div className='titlerow'>
					<div className='title'>Частые вопросы</div>
				</div>
				<Accordion items={group.faq.map(f => ({ key: f.q, head: f.q, body: <p>{f.a}</p> }))} />
			</section>

			<FooterBanner />
		</article>
	)
}
