import { useParams } from 'react-router-dom'
import PageHeader from '../../components/pageHeader/PageHeader'
import FooterBanner from '../../components/footerBanner/FooterBanner'
import ProcessList from '../../components/processList/ProcessList'
import Accordion from '../../components/accordion/Accordion'
import ServiceIcon from '../../components/serviceIcon/ServiceIcon'
import ProjectCard from '../../components/projectCard/ProjectCard'
import FeaturedProject from '../../components/featuredProject/FeaturedProject'
import OfferIllustration from '../../components/offerIllustration/OfferIllustration'
import { useContactModal } from '../../components/contactModal/ContactModalContext'
import { OFFERS, getOffer } from '../../data/offers'
import { getService } from '../../data/services'
import type { Service } from '../../data/services'
import { AFTER_LAUNCH } from '../../data/pricing'
import { PROJECTS } from '../../data/projects'
import NotFoundPage from '../NotFoundPage'
import './OfferPage.scss'

/**
 * Страница оффера (content.md §4.2): шапка с ценой → кому подходит / не подходит → что получите →
 * сколько стоит и от чего зависит → примеры → процесс → FAQ → аккордеон техники → CTA.
 */
export default function OfferPage() {
	const { offer: key } = useParams()
	const offer = getOffer(key)
	const { open } = useContactModal()

	if (!offer) return <NotFoundPage />

	// Тот же вариант свечения, что у карточки этого оффера в сетке
	const glow = (OFFERS.indexOf(offer) % 3) + 1
	const projects = PROJECTS.filter(p => p.categories.some(c => offer.categories.includes(c))).slice(0, 2)
	const subservices = offer.services.map(k => getService(k)).filter((s): s is Service => !!s)

	return (
		<article className='offerPage' key={offer.key}>
			<PageHeader
				className={`offerHeader offerHeader--glow-${glow}`}
				icon={<OfferIllustration offer={offer.key} />}
				title={offer.title}
				subtitle={offer.line}
				crumbs={[{ label: 'Услуги', to: '/services' }, { label: offer.title }]}
				aside={
					<div className='offerPrice'>
						<strong>{offer.priceFrom}</strong>
						<span className='offerPrice__term'>{offer.term}</span>
						{offer.priceDetail && <span className='offerPrice__detail'>{offer.priceDetail}</span>}
						<button type='button' className='btn btn_light' onClick={() => open(offer.title)}>
							<span className='btn__label'>Обсудить задачу</span>
						</button>
					</div>
				}
			/>

			<section className='offerPage__section offerFit'>
				<div>
					<h2 className='offerPage__h2'>Кому подходит</h2>
					<ul className='offerFit__list'>
						{offer.audience.map(a => (
							<li key={a}>
								<span className='offerPage__check'>
									<ServiceIcon name='check' />
								</span>
								{a}
							</li>
						))}
					</ul>
				</div>
				<div>
					<h2 className='offerPage__h2'>Кому не подходит</h2>
					<ul className='offerFit__list offerFit__list--no'>
						{offer.notFor.map(n => (
							<li key={n}>
								<span className='offerFit__dash' aria-hidden='true'>
									—
								</span>
								{n}
							</li>
						))}
					</ul>
				</div>
			</section>

			<section className='offerPage__section'>
				<h2 className='offerPage__h2'>Что получите</h2>
				<ul className='offerPage__outcomes'>
					{offer.outcomes.map(o => (
						<li key={o}>
							<span className='offerPage__check'>
								<ServiceIcon name='check' />
							</span>
							{o}
						</li>
					))}
				</ul>
			</section>

			<section className='offerPage__section'>
				<h2 className='offerPage__h2'>Сколько стоит и от чего зависит</h2>
				<dl className='priceSheet'>
					<div>
						<dt>От чего зависит цена</dt>
						<dd>
							<ol className='priceSheet__list'>
								{offer.priceFactors.map(f => (
									<li key={f}>{f}</li>
								))}
							</ol>
						</dd>
					</div>
					<div>
						<dt>Формат оплаты</dt>
						<dd>
							По смете с оплатой по этапам или по часам — зависит от того, насколько объём понятен до старта.
						</dd>
					</div>
					<div>
						<dt>Что не входит</dt>
						<dd>
							<ul className='priceSheet__inline'>
								{offer.notIncluded.map(n => (
									<li key={n}>{n}</li>
								))}
							</ul>
						</dd>
					</div>
					<div>
						<dt>После запуска</dt>
						<dd>{offer.afterLaunch ?? AFTER_LAUNCH}</dd>
					</div>
				</dl>
			</section>

			{projects.length > 0 && (
				<section className='offerPage__section'>
					<h2 className='offerPage__h2'>Примеры</h2>
					<div className='offerPage__projects'>
						{projects.map((p, i) =>
							p.featured ? <FeaturedProject key={p.slug} project={p} /> : <ProjectCard key={p.slug} project={p} index={i} />
						)}
					</div>
				</section>
			)}

			<section className='offerPage__section'>
				<h2 className='offerPage__h2'>Как проходит работа</h2>
				<ProcessList />
			</section>

			<section className='offerPage__section'>
				<h2 className='offerPage__h2'>Частые вопросы</h2>
				<Accordion items={offer.faq.map(f => ({ key: f.q, head: f.q, body: <p>{f.a}</p> }))} />
			</section>

			<section className='offerPage__section' aria-label='Техническая часть'>
				<Accordion
					items={[
						{
							key: 'tech',
							head: 'Как это устроено технически',
							body: (
								<div className='offerPage__tech'>
									<div>
										<h3>Стек</h3>
										<ul className='stackChips'>
											{offer.tech.stack.map(t => (
												<li key={t}>{t}</li>
											))}
										</ul>
									</div>
									{subservices.length > 0 && (
										<div>
											<h3>Что ещё делаю в этом направлении</h3>
											<ul className='offerPage__subservices'>
												{subservices.map(s => (
													<li key={s.key}>
														<strong>{s.title}</strong>
														<span>{s.short}</span>
													</li>
												))}
											</ul>
										</div>
									)}
									<div>
										<h3>Хостинг и передача</h3>
										<ul className='offerPage__notes'>
											{offer.tech.notes.map(n => (
												<li key={n}>{n}</li>
											))}
										</ul>
									</div>
								</div>
							),
						},
					]}
				/>
			</section>

			<FooterBanner cta={offer.cta} topic={offer.title} />
		</article>
	)
}
