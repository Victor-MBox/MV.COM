import { Link, useParams } from 'react-router-dom'
import PageHead from '../../components/pageHead/PageHead'
import SectionHead from '../../components/sectionHead/SectionHead'
import type { Headline } from '../../components/sectionHead/SectionHead'
import Button from '../../components/button/Button'
import Chip from '../../components/chip/Chip'
import Reveal from '../../components/reveal/Reveal'
import DimAccordion from '../../components/dimAccordion/DimAccordion'
import MiniUi from '../../components/miniUi/MiniUi'
import { miniUiVariant } from '../../components/miniUi/variants'
import WorkCard from '../../components/workCard/WorkCard'
import type { WorkCardData } from '../../components/workCard/WorkCard'
import ProcessSteps from '../../components/processSteps/ProcessSteps'
import { useContactModal } from '../../components/contactModal/ContactModalContext'
import { OFFERS, getOffer } from '../../data/offers'
import { getService } from '../../data/services'
import type { Service } from '../../data/services'
import { AFTER_LAUNCH, PACKAGES_ANCHOR, PACKAGES_OFFER, SUPPORT_PACKAGES, SUPPORT_TERMS } from '../../data/pricing'
import PriceCard from '../../components/priceCard/PriceCard'
import { PROJECTS } from '../../data/projects'
import { isPublic } from '../../data/projects'
import type { Project, ProjectFact } from '../../data/projects'
import { CASE_FACTS } from '../../data/home'
import NotFoundPage from '../NotFoundPage'
import './OfferPage.scss'

// TODO (владелец): заголовки секций страницы оффера; в каждом — не больше одного выделения
const H2: Record<'fit' | 'outcomes' | 'price' | 'packages' | 'examples' | 'faq' | 'tech', Headline> = {
	fit: { text: 'Кому подходит, а кому нет', muted: 'а кому нет' },
	outcomes: { text: 'Что получите' },
	price: { text: 'Сколько стоит и от чего зависит', muted: 'и от чего зависит' },
	packages: { text: 'Пакеты обслуживания', muted: 'обслуживания' },
	examples: { text: 'Примеры из этого направления', muted: 'из этого направления' },
	faq: { text: 'Вопросы по этой услуге', muted: 'по этой услуге' },
	tech: { text: 'Как это устроено технически', muted: 'технически' },
}

/** Пакеты как карточки формата цены (PriceCard): цена в месяц, кнопка открывает заявку с названием пакета */
const PACKAGE_CARDS = SUPPORT_PACKAGES.map(p => ({ ...p, price: `${p.price} / месяц`, cta: 'Обсудить пакет' }))

/** Формат оплаты — общий для всех офферов (content.md §4.2, п. 4) */
const PAYMENT = 'По смете с оплатой по этапам или по часам — зависит от того, насколько объём понятен до старта.'

/** Кейс → карточка работы: факты те же, что в слайдере главной (CASE_FACTS) */
const toWorkCard = (p: Project): WorkCardData => ({
	slug: p.slug,
	title: p.title,
	client: p.client,
	line: p.line,
	cover: p.cover,
	highlights: CASE_FACTS.map(i => p.highlights?.[i]).filter((h): h is ProjectFact => !!h && isPublic(h)),
})

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Страница оффера (content.md §4.2; docs/design-spec.md §9): шапка (цены и срок бейджами — те же строки, что на карточке
 * каталога; справа мини-интерфейс оффера в цикле) → кому подходит / не подходит → что получите → сколько стоит и от чего
 * зависит → пакеты обслуживания (только у доработки и поддержки, #packages — сюда ведёт «Посмотреть пакеты» из блока
 * цен) → примеры (если есть кейсы по категориям) → процесс (свой у интеграций, доработки и агентств — offer.process)
 * → вопросы → аккордеон «Стек и детали» (единственное место с названиями технологий)
 */
export default function OfferPage() {
	const { offer: key } = useParams()
	const offer = getOffer(key)
	const { open } = useContactModal()

	if (!offer) return <NotFoundPage />

	const number = pad(OFFERS.indexOf(offer) + 1)
	const visual = miniUiVariant(offer.key)
	const prices = offer.prices ?? [{ label: 'стоимость', price: offer.priceFrom }]
	const projects = PROJECTS.filter(p => p.categories.some(c => offer.categories.includes(c)))
		.slice(0, 2)
		.map(toWorkCard)
	const subservices = offer.services.map(k => getService(k)).filter((s): s is Service => !!s)
	const faq = offer.faq.map((f, i) => ({ id: `q${i + 1}`, title: f.q, content: <p>{f.a}</p> }))

	const tech = (
		<div className='offerPage__tech'>
			<div className='offerPage__techGroup'>
				<h4 className='offerPage__h3'>Стек</h4>
				<ul className='offerPage__chips' aria-label='Стек'>
					{offer.tech.stack.map(t => (
						<Chip as='li' key={t}>
							{t}
						</Chip>
					))}
				</ul>
			</div>
			{subservices.length > 0 && (
				<div className='offerPage__techGroup'>
					<h4 className='offerPage__h3'>Что ещё делаю в этом направлении</h4>
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
			<div className='offerPage__techGroup'>
				<h4 className='offerPage__h3'>Хостинг и передача</h4>
				<ul className='offerPage__notes'>
					{offer.tech.notes.map(n => (
						<li key={n}>{n}</li>
					))}
				</ul>
			</div>
		</div>
	)

	return (
		<article className='offerPage' key={offer.key}>
			<PageHead
				label={`услуга ${number}`}
				title={{ text: offer.title }}
				lead={offer.line}
				meta={
					<>
						<Link to='/services'>Услуги</Link> · {offer.title}
					</>
				}
				facts={
					<div className='offerPage__facts'>
						<dl className='offerPage__badges'>
							{prices.map(p => (
								<div className='offerPage__badge' key={p.label}>
									<dt>{p.label}</dt>
									<dd>{p.price}</dd>
								</div>
							))}
							<div className='offerPage__badge'>
								<dt>срок</dt>
								<dd>{offer.term}</dd>
							</div>
						</dl>
						{offer.priceDetail && <p className='offerPage__priceDetail'>{offer.priceDetail}</p>}
					</div>
				}
				actions={
					<>
						<Button onClick={() => open(offer.title)}>{offer.cta}</Button>
						<Button variant='text' to='/services'>
							Все услуги
						</Button>
					</>
				}
				aside={
					visual && (
						<div className='offerPage__visual'>
							<MiniUi variant={visual} loop />
						</div>
					)
				}
				asideWide
			/>

			<section className='section' id='fit'>
				<div className='container'>
					<SectionHead label='для кого' title={H2.fit} />
					<div className='offerPage__fit'>
						<Reveal>
							<p className='offerPage__colLabel'>подходит</p>
							<ul className='offerPage__rows'>
								{offer.audience.map(a => (
									<li key={a}>{a}</li>
								))}
							</ul>
						</Reveal>
						<Reveal delay={0.1}>
							<p className='offerPage__colLabel'>не подходит</p>
							<ul className='offerPage__rows offerPage__rows--no'>
								{offer.notFor.map(n => (
									<li key={n}>{n}</li>
								))}
							</ul>
						</Reveal>
					</div>
				</div>
			</section>

			<section className='section' id='outcomes'>
				<div className='container'>
					<SectionHead label='результат' title={H2.outcomes} />
					<Reveal as='ol' className='offerPage__outcomes'>
						{offer.outcomes.map((o, i) => (
							<li key={o}>
								<span className='offerPage__num'>{pad(i + 1)}</span>
								{o}
							</li>
						))}
					</Reveal>
				</div>
			</section>

			<section className='section' id='price'>
				<div className='container'>
					<SectionHead label='цена' title={H2.price} />
					<Reveal as='div' className='offerPage__price'>
						<dl>
							<div>
								<dt>от чего зависит цена</dt>
								<dd>
									<ol className='offerPage__factors'>
										{offer.priceFactors.map((f, i) => (
											<li key={f}>
												<span className='offerPage__num'>{pad(i + 1)}</span>
												{f}
											</li>
										))}
									</ol>
								</dd>
							</div>
							<div>
								<dt>формат оплаты</dt>
								<dd>
									<p>{PAYMENT}</p>
								</dd>
							</div>
							<div>
								<dt>что не входит</dt>
								<dd>
									<ul className='offerPage__chips' aria-label='Что не входит'>
										{offer.notIncluded.map(n => (
											<Chip as='li' key={n}>
												{n}
											</Chip>
										))}
									</ul>
								</dd>
							</div>
							<div>
								<dt>после запуска</dt>
								<dd>
									<p>{offer.afterLaunch ?? AFTER_LAUNCH}</p>
								</dd>
							</div>
						</dl>
					</Reveal>
				</div>
			</section>

			{offer.key === PACKAGES_OFFER && (
				<section className='section' id={PACKAGES_ANCHOR}>
					<div className='container'>
						<SectionHead label='пакеты' title={H2.packages} />
						<ul className='offerPage__packages'>
							{PACKAGE_CARDS.map((p, i) => (
								<Reveal as='li' key={p.key} index={i}>
									<PriceCard model={p} onDiscuss={open} />
								</Reveal>
							))}
						</ul>
						<Reveal>
							<ul className='offerPage__terms' aria-label='Условия пакетов'>
								{SUPPORT_TERMS.map(t => (
									<li key={t}>{t}</li>
								))}
							</ul>
						</Reveal>
					</div>
				</section>
			)}

			{projects.length > 0 && (
				<section className='section' id='examples'>
					<div className='container'>
						<SectionHead label='примеры' title={H2.examples} action={{ label: 'Все работы', to: '/portfolio' }} />
						<ul className='offerPage__examples'>
							{projects.map((p, i) => (
								<Reveal as='li' key={p.slug} index={i}>
									<WorkCard item={p} />
								</Reveal>
							))}
						</ul>
					</div>
				</section>
			)}

			<ProcessSteps steps={offer.process} />

			<section className='section' id='faq'>
				<div className='container offerPage__narrow'>
					<SectionHead label='вопросы' title={H2.faq} />
					<Reveal>
						<DimAccordion idPrefix='offerFaq' items={faq} multiple />
					</Reveal>
				</div>
			</section>

			<section className='section' id='tech'>
				<div className='container offerPage__narrow'>
					<SectionHead label='техника' title={H2.tech} />
					<Reveal>
						<DimAccordion idPrefix='offerTech' items={[{ id: 'stack', title: 'Стек и детали', content: tech }]} wide />
					</Reveal>
				</div>
			</section>
		</article>
	)
}
