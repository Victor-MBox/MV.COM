import { Link, useParams } from 'react-router-dom'
import PageHead from '../../components/pageHead/PageHead'
import SectionHead from '../../components/sectionHead/SectionHead'
import type { Headline } from '../../components/sectionHead/SectionHead'
import Button from '../../components/button/Button'
import Chip from '../../components/chip/Chip'
import Reveal from '../../components/reveal/Reveal'
import DimAccordion from '../../components/dimAccordion/DimAccordion'
import DiscussRow from '../../components/discussRow/DiscussRow'
import MiniUi from '../../components/miniUi/MiniUi'
import { miniUiVariant } from '../../components/miniUi/variants'
import WorkCard from '../../components/workCard/WorkCard'
import type { WorkCardData } from '../../components/workCard/WorkCard'
import ProcessSteps from '../../components/processSteps/ProcessSteps'
import { useContactModal } from '../../components/contactModal/ContactModalContext'
import { useDocumentMeta } from '../../hooks/useDocumentMeta'
import { AGENCIES_KEY, getOffer, offerNumber, relatedLinks } from '../../data/offers'
import type { OfferExtra, OfferParent } from '../../data/offers'
import { OFFER_META } from '../../data/meta'
import { PROMOTION } from '../../data/promotion'
import { getService } from '../../data/services'
import type { Service } from '../../data/services'
import {
	AFTER_LAUNCH,
	PACKAGES_ANCHOR,
	PACKAGES_OFFER,
	PRICE_NOTE,
	PRICING_MODELS,
	SUPPORT_PACKAGES,
	SUPPORT_TERMS,
} from '../../data/pricing'
import PriceCard from '../../components/priceCard/PriceCard'
import { PROJECTS } from '../../data/projects'
import { isPublic } from '../../data/projects'
import type { Project, ProjectFact } from '../../data/projects'
import { CASE_FACTS } from '../../data/home'
import NotFoundPage from '../NotFoundPage'
import './OfferPage.scss'

type Props = {
	/** Раздел, в котором открыта страница: /services/promotion/:offer — только для офферов с таким parent, иначе 404 */
	parent?: OfferParent
}

// Заголовки разделов страницы услуги — ТЗ по текстам и SEO от 21.10.2026; в каждом — не больше одного выделения.
// Свои заголовки («Когда это нужно», «Состав работ», «Форматы работы», «Как проходит запуск») — Offer.headings
const H2: Record<'fit' | 'outcomes' | 'price' | 'packages' | 'examples' | 'process' | 'faq' | 'tech', Headline> = {
	fit: { text: 'Для каких задач подходит', muted: 'подходит' },
	outcomes: { text: 'Состав проекта', muted: 'проекта' },
	price: { text: 'Стоимость и дополнительные работы', muted: 'и дополнительные работы' },
	packages: { text: 'Пакеты обслуживания', muted: 'обслуживания' },
	examples: { text: 'Примеры из этого направления', muted: 'из этого направления' },
	process: { text: 'Как проходит разработка', muted: 'разработка' },
	faq: { text: 'Вопросы перед заказом', muted: 'перед заказом' },
	tech: { text: 'Как это устроено технически', muted: 'технически' },
}

/** Пакеты как карточки формата цены (PriceCard): цена в месяц, кнопка открывает заявку с названием пакета */
const PACKAGE_CARDS = SUPPORT_PACKAGES.map(p => ({ ...p, price: `${p.price} / месяц`, cta: 'Обсудить пакет' }))

/** Обслуживание в блоке стоимости доработки — та же строка, что формат «Техническое обслуживание» в блоке цен */
const MAINTENANCE = PRICING_MODELS.filter(m => m.key === 'maintenance').map(m => ({ label: m.label, price: m.price }))

/** Формат оплаты — общий для разработки (content.md §4.2, п. 4); у продвижения свой (Offer.payment) */
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

/** Дополнительный раздел (Offer.extras): список с номерами или абзац, под ним подпись моно */
function ExtraSection({ extra }: { extra: OfferExtra }) {
	return (
		<section className='section' id={extra.id}>
			<div className='container'>
				<SectionHead label={extra.label} title={extra.title} lead={extra.lead} />
				{extra.items && (
					<Reveal as='ol' className='offerPage__outcomes'>
						{extra.items.map((item, i) => (
							<li key={item}>
								<span className='offerPage__num'>{pad(i + 1)}</span>
								{item}
							</li>
						))}
					</Reveal>
				)}
				{extra.text && (
					<Reveal as='p' className='offerPage__extraText'>
						{extra.text}
					</Reveal>
				)}
				{extra.note && (
					<Reveal as='p' className='offerPage__colLabel offerPage__extraNote'>
						{extra.note}
					</Reveal>
				)}
			</div>
		</section>
	)
}

/**
 * Страница оффера (content.md §4.2; docs/design-spec.md §9): шапка (крошки Главная → Услуги [→ Продвижение сайтов] →
 * услуга, H1 — offer.heading, цены и срок бейджами — те же строки, что на карточке каталога, условия базового объёма
 * моно рядом; справа мини-интерфейс оффера в цикле) → для каких задач подходит (колонка «не подходит» — если есть) →
 * состав (подпись outcomesNote) → дополнительные разделы после состава → стоимость (форматы работы или стартовая
 * цена с одним пояснением PRICE_NOTE, что нужно для оценки, что не входит, оплата, после запуска) → дополнительные
 * разделы после стоимости → пакеты обслуживания (только у доработки, #packages) → примеры (если есть кейсы по
 * категориям) → процесс (свой — offer.process; без вводного текста и условия) → вопросы перед заказом → аккордеон
 * «Стек и детали» (если у оффера есть tech) → обращение со ссылками на смежные услуги (если есть ctaLead или related)
 */
export default function OfferPage({ parent }: Props) {
	const { offer: key } = useParams()
	const found = getOffer(key)
	// Страница услуги открывается только по своему пути: /services/seo для вложенной услуги — 404
	const offer = found && found.parent === parent ? found : undefined
	const { open } = useContactModal()
	// Оффера нет — мету ставит NotFoundPage (noindex), страница свою не ставит
	useDocumentMeta(offer ? OFFER_META[offer.key] : null)

	if (!offer) return <NotFoundPage />

	const number = offerNumber(offer)
	const visual = miniUiVariant(offer.key)
	const prices = offer.prices ?? [{ label: 'стоимость', price: offer.priceFrom }]
	// Ставка агентств — не стартовая цена: вместо PRICE_NOTE уточнение «или по смете»
	const isRate = offer.key === AGENCIES_KEY
	const startPrices = [
		...(offer.prices ?? [{ label: '', price: offer.priceFrom }]),
		...(offer.key === PACKAGES_OFFER ? MAINTENANCE : []),
	]
	const formats = offer.formats ?? []
	const projects = PROJECTS.filter(p => p.categories.some(c => offer.categories.includes(c)))
		.slice(0, 2)
		.map(toWorkCard)
	const subservices = offer.services.map(k => getService(k)).filter((s): s is Service => !!s)
	const faq = offer.faq.map((f, i) => ({ id: `q${i + 1}`, title: f.q, content: <p>{f.a}</p> }))
	const extras = (after: OfferExtra['after']) => (offer.extras ?? []).filter(e => e.after === after)
	const related = relatedLinks(offer)

	const tech = offer.tech && (
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
				title={{ text: offer.heading }}
				lead={offer.lead ?? offer.line}
				meta={
					<>
						<Link to='/'>Главная</Link> · <Link to='/services'>Услуги</Link>
						{offer.parent === 'promotion' && (
							<>
								{' '}
								· <Link to={PROMOTION.path}>{PROMOTION.name}</Link>
							</>
						)}{' '}
						· {offer.title}
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
								<dt>{offer.termLabel ?? 'срок'}</dt>
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
					<SectionHead label='для кого' title={offer.headings?.fit ?? H2.fit} />
					<div className={`offerPage__fit${offer.notFor.length === 0 ? ' offerPage__fit--single' : ''}`}>
						<Reveal>
							{offer.notFor.length > 0 && <p className='offerPage__colLabel'>подходит</p>}
							<ul className='offerPage__rows'>
								{offer.audience.map(a => (
									<li key={a}>{a}</li>
								))}
							</ul>
						</Reveal>
						{offer.notFor.length > 0 && (
							<Reveal delay={0.1}>
								<p className='offerPage__colLabel'>не подходит</p>
								<ul className='offerPage__rows offerPage__rows--no'>
									{offer.notFor.map(n => (
										<li key={n}>{n}</li>
									))}
								</ul>
							</Reveal>
						)}
					</div>
				</div>
			</section>

			<section className='section' id='outcomes'>
				<div className='container'>
					<SectionHead label='состав' title={offer.headings?.outcomes ?? H2.outcomes} lead={offer.outcomesLead} />
					<Reveal as='ol' className='offerPage__outcomes'>
						{offer.outcomes.map((o, i) => (
							<li key={o}>
								<span className='offerPage__num'>{pad(i + 1)}</span>
								{o}
							</li>
						))}
					</Reveal>
					{offer.outcomesNote && (
						<Reveal as='p' className='offerPage__outcomesNote'>
							{offer.outcomesNote}
						</Reveal>
					)}
				</div>
			</section>

			{extras('outcomes').map(e => (
				<ExtraSection extra={e} key={e.id} />
			))}

			<section className='section' id='price'>
				<div className='container'>
					<SectionHead label='стоимость' title={offer.headings?.price ?? H2.price} />
					<Reveal as='div' className='offerPage__price'>
						<dl>
							<div>
								<dt>{isRate ? 'ставка' : formats.length > 1 ? 'форматы работы' : 'стартовая стоимость'}</dt>
								<dd>
									{formats.length > 0 ? (
										<ul className='offerPage__formats'>
											{formats.map(f => (
												<li key={f.label}>
													<div className='offerPage__formatHead'>
														<h3>{f.label}</h3>
														{f.price && <strong>{f.price}</strong>}
													</div>
													<p>{f.text}</p>
												</li>
											))}
										</ul>
									) : (
										<ul className='offerPage__start'>
											{startPrices.map(p => (
												<li key={p.price}>
													{p.label && <span>{p.label}</span>}
													<strong>{p.price}</strong>
												</li>
											))}
										</ul>
									)}
									<p>{isRate ? offer.priceDetail : PRICE_NOTE}</p>
									{offer.formatsNote && <p>{offer.formatsNote}</p>}
								</dd>
							</div>
							<div>
								<dt>от чего зависит оценка</dt>
								<dd>
									{offer.estimate && <p className='offerPage__estimate'>{offer.estimate}</p>}
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
								<dt>не входит в стоимость</dt>
								<dd>
									<ul className='offerPage__notes'>
										{offer.notIncluded.map(n => (
											<li key={n}>{n}</li>
										))}
									</ul>
								</dd>
							</div>
							<div>
								<dt>формат оплаты</dt>
								<dd>
									<p>{offer.payment ?? PAYMENT}</p>
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

			{extras('price').map(e => (
				<ExtraSection extra={e} key={e.id} />
			))}

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

			<ProcessSteps steps={offer.process} title={offer.headings?.process ?? H2.process} lead={null} note={null} />

			<section className='section' id='faq'>
				<div className='container offerPage__narrow'>
					<SectionHead label='вопросы' title={H2.faq} />
					<Reveal>
						<DimAccordion idPrefix='offerFaq' items={faq} multiple />
					</Reveal>
				</div>
			</section>

			{tech && (
				<section className='section' id='tech'>
					<div className='container offerPage__narrow'>
						<SectionHead label='техника' title={H2.tech} />
						<Reveal>
							<DimAccordion idPrefix='offerTech' items={[{ id: 'stack', title: 'Стек и детали', content: tech }]} wide />
						</Reveal>
					</div>
				</section>
			)}

			{(offer.ctaLead || related.length > 0) && (
				<section className='section' id='discuss'>
					<div className='container offerPage__narrow'>
						<DiscussRow text={offer.ctaLead ?? offer.line} cta={offer.cta} onClick={() => open(offer.title)} links={related} />
					</div>
				</section>
			)}
		</article>
	)
}
