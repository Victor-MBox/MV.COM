import PageHeader from '../../components/pageHeader/PageHeader'
import FooterBanner from '../../components/footerBanner/FooterBanner'
import OfferCard from '../../components/offerCard/OfferCard'
import ProcessList from '../../components/processList/ProcessList'
import Accordion from '../../components/accordion/Accordion'
import ServiceIcon from '../../components/serviceIcon/ServiceIcon'
import { useContactModal } from '../../components/contactModal/ContactModalContext'
import { OFFERS } from '../../data/offers'
import { PRICING, PRICING_MODELS } from '../../data/pricing'
import { FAQ } from '../../data/faq'
import './ServicesPage.scss'

/** Услуги (content.md §5.2): шапка → 7 офферов → «Сколько стоит» → процесс → FAQ → CTA */
export default function ServicesPage() {
	const { open } = useContactModal()

	return (
		<>
			<PageHeader
				title='Услуги'
				subtitle='Сайты, магазины, веб-сервисы и интеграции. Цена и срок известны до старта.'
				aside={
					<button type='button' className='btn btn_light' onClick={() => open()}>
						<span className='btn__label'>Обсудить задачу</span>
					</button>
				}
			/>

			<section className='servicesPage__offers' aria-label='Офферы'>
				<div className='offerGrid'>
					{OFFERS.map((o, i) => (
						<OfferCard key={o.key} offer={o} index={i} />
					))}
				</div>
			</section>

			<section className='servicesPage__section' id='pricing'>
				<div className='titlerow'>
					<div className='title'>Сколько стоит</div>
				</div>
				<dl className='priceSheet'>
					<div>
						<dt>Что входит в цену всегда</dt>
						<dd>
							<ul className='priceSheet__list priceSheet__cols'>
								{PRICING.included.map(i => (
									<li key={i}>
										<span className='priceSheet__check'>
											<ServiceIcon name='check' />
										</span>
										{i}
									</li>
								))}
							</ul>
						</dd>
					</div>
					<div>
						<dt>Что влияет на цену</dt>
						<dd>
							<ul className='priceSheet__inline'>
								{PRICING.factors.map(f => (
									<li key={f}>{f}</li>
								))}
							</ul>
						</dd>
					</div>
					<div>
						<dt>Форматы оплаты</dt>
						<dd>
							<ul className='priceSheet__models'>
								{PRICING_MODELS.map(m => (
									<li key={m.key}>
										<strong>{m.price}</strong>
										<span>{m.label}</span>
										<p>{m.text}</p>
									</li>
								))}
							</ul>
						</dd>
					</div>
					<div>
						<dt>Оценка</dt>
						<dd>{PRICING.estimate}</dd>
					</div>
					<div>
						<dt>Как читать цифры</dt>
						<dd>
							<ul className='priceSheet__list'>
								{PRICING.reading.map(r => (
									<li key={r}>{r}</li>
								))}
							</ul>
						</dd>
					</div>
					<div>
						<dt>Поддержка в деньгах, пример</dt>
						<dd>{PRICING.supportExample}</dd>
					</div>
					<div>
						<dt>Условия, которые фиксируем до старта</dt>
						<dd>
							<ul className='priceSheet__inline'>
								{PRICING.terms.map(t => (
									<li key={t}>{t}</li>
								))}
							</ul>
						</dd>
					</div>
					<div>
						<dt>Чем не занимаюсь</dt>
						<dd>
							<ul className='priceSheet__inline'>
								{PRICING.notDoing.map(n => (
									<li key={n}>{n}</li>
								))}
							</ul>
						</dd>
					</div>
				</dl>
			</section>

			<section className='servicesPage__section'>
				<div className='titlerow'>
					<div className='title'>Как проходит работа</div>
				</div>
				<ProcessList />
			</section>

			<section className='servicesPage__section' id='faq'>
				<div className='titlerow'>
					<div className='title'>Частые вопросы</div>
				</div>
				<Accordion items={FAQ.map(f => ({ key: f.key, head: f.q, body: <p>{f.a}</p> }))} />
			</section>

			<FooterBanner />
		</>
	)
}
