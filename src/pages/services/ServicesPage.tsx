import { Link } from 'react-router-dom'
import PageHeader from '../../components/pageHeader/PageHeader'
import FooterBanner from '../../components/footerBanner/FooterBanner'
import ServiceTile from '../../components/serviceTile/ServiceTile'
import { PRICING_MODELS, SERVICES, SERVICE_GROUPS, getServicesByGroup, groupPath } from '../../data/services'
import { plural } from '../../utils/plural'
import './Services.scss'

export default function ServicesPage() {
	return (
		<>
			<PageHeader
				title='Услуги'
				subtitle='Семь направлений по моему стеку: React, TypeScript, Laravel, WordPress, 1С-Битрикс и GSAP. Выберите направление или сразу услугу — на каждой странице есть этапы работы, примеры и ответы на вопросы.'
				aside={
					<div className='pageStat'>
						<strong>{SERVICES.length}</strong>
						<span>{plural(SERVICE_GROUPS.length, ['направление', 'направления', 'направлений'])}</span>
					</div>
				}
			/>

			<nav className='servicesNav' aria-label='Направления'>
				<ul className='chips'>
					{SERVICE_GROUPS.map(g => (
						<li key={g.key}>
							<Link to={`#${g.key}`} className='chip'>
								{g.title}
							</Link>
						</li>
					))}
				</ul>
			</nav>

			{SERVICE_GROUPS.map((g, i) => {
				const services = getServicesByGroup(g.key)
				return (
					<section key={g.key} id={g.key} className='direction'>
						<div className='direction__head'>
							<div className='direction__intro'>
								<span className='eyebrow'>Направление {String(i + 1).padStart(2, '0')}</span>
								<h2>
									<Link to={groupPath(g)}>{g.title}</Link>
								</h2>
								<p>{g.short}</p>
								<div className='direction__actions'>
									<Link to={groupPath(g)} className='btn btn_dark'>
										<span>О направлении</span>
									</Link>
									<span className='direction__count'>{plural(services.length, ['услуга', 'услуги', 'услуг'])}</span>
								</div>
							</div>
							<Link to={groupPath(g)} className='direction__image' aria-label={g.title}>
								<img src={g.image} alt='' loading='lazy' />
							</Link>
						</div>

						<div className='serviceGrid'>
							{services.map(s => (
								<ServiceTile key={s.key} service={s} />
							))}
						</div>
					</section>
				)
			})}

			<section className='pricing' id='pricing'>
				<div className='titlerow'>
					<div className='title'>Как формируется стоимость</div>
				</div>
				<div className='pricing__grid'>
					{PRICING_MODELS.map(m => (
						<div key={m.key} className='pricing__item'>
							<span className='eyebrow'>{m.label}</span>
							<strong>{m.price}</strong>
							<p>{m.text}</p>
						</div>
					))}
				</div>
			</section>

			<FooterBanner />
		</>
	)
}
