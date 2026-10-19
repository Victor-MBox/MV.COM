import { Link, useParams } from 'react-router-dom'
import PageHeader from '../../components/pageHeader/PageHeader'
import FooterBanner from '../../components/footerBanner/FooterBanner'
import ServiceTile from '../../components/serviceTile/ServiceTile'
import ServiceIcon from '../../components/serviceIcon/ServiceIcon'
import ProcessSteps from '../../components/processSteps/ProcessSteps'
import FlowScheme from '../../components/flowScheme/FlowScheme'
import Accordion from '../../components/accordion/Accordion'
import { useContactModal } from '../../components/contactModal/ContactModalContext'
import { getGroup, getService, getServicesByGroup, groupPath, serviceImage } from '../../data/services'
import NotFoundPage from '../NotFoundPage'
import './Services.scss'

export default function ServicePage() {
	const { group: groupKey, service: serviceKey } = useParams()
	const group = getGroup(groupKey)
	const service = getService(groupKey, serviceKey)
	const { open } = useContactModal()

	if (!group || !service) return <NotFoundPage />

	const others = getServicesByGroup(group.key).filter(s => s.key !== service.key).slice(0, 3)

	return (
		<article key={service.key}>
			<PageHeader
				title={service.title}
				subtitle={service.short}
				crumbs={[
					{ label: 'Услуги', to: '/services' },
					{ label: group.title, to: groupPath(group) },
					{ label: service.title },
				]}
				aside={
					<div className='priceCard'>
						<span className='eyebrow'>Стоимость</span>
						<strong>{service.priceFrom}</strong>
						<span className='priceCard__term'>Срок: {service.term}</span>
						<button type='button' className='btn btn_light' onClick={() => open(service.title)}>
							<span className='btn__label'>Обсудить задачу</span>
						</button>
					</div>
				}
			/>

			<section className='svcHero'>
				<div className='svcHero__includes'>
					<span className='eyebrow'>Что входит</span>
					<ul>
						{service.includes.map(i => (
							<li key={i}>
								<span className='svcHero__check'>
									<ServiceIcon name='check' />
								</span>
								{i}
							</li>
						))}
					</ul>
				</div>
				<div className='svcHero__image'>
					<img src={serviceImage(service)} alt='' />
				</div>
			</section>

			<section className='outcome'>
				<div>
					<span className='eyebrow'>Результат</span>
					<p>{service.outcome}</p>
				</div>
				<div>
					<span className='eyebrow'>Технологии</span>
					<ul className='stackChips'>
						{service.stack.map(t => (
							<li key={t}>{t}</li>
						))}
					</ul>
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

			<section className='block'>
				<div className='titlerow'>
					<div className='title'>Частые вопросы</div>
				</div>
				<Accordion items={group.faq.map(f => ({ key: f.q, head: f.q, body: <p>{f.a}</p> }))} />
			</section>

			{others.length > 0 && (
				<section className='block'>
					<div className='titlerow'>
						<div className='title'>Ещё в направлении</div>
						<Link to={groupPath(group)} className='btn btn_dark'>
							<span>{group.title}</span>
						</Link>
					</div>
					<div className='serviceGrid'>
						{others.map(s => (
							<ServiceTile key={s.key} service={s} />
						))}
					</div>
				</section>
			)}

			<FooterBanner />
		</article>
	)
}
