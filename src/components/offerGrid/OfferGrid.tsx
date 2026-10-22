import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { CATALOG_COPY } from '../../data/home'
import { AGENCIES_KEY, CATALOG, MORE_OFFERS, getOffer, offerNumber, offerPath } from '../../data/offers'
import type { Offer } from '../../data/offers'
import Box from '../box/Box'
import Button from '../button/Button'
import MiniUi from '../miniUi/MiniUi'
import { miniUiVariant } from '../miniUi/variants'
import type { MiniUiVariant } from '../miniUi/variants'
import Reveal from '../reveal/Reveal'
import { MQ, useMediaQuery } from '../../hooks/useMediaQuery'
import './OfferGrid.scss'

type Props = {
	/** Карточки; по умолчанию — шесть основных услуг CATALOG (главная) */
	offers?: Offer[]
	/** /services и обзор продвижения: больше воздуха между карточками и внутри них */
	spacious?: boolean
	/** Подпись списка для диктора */
	label?: string
}

/** Длительность сцены мини-интерфейса (самая длинная — два пульса статуса по 1.6 с) и сдвиг соседних колонок */
const SCENE_MS = 3400
const COLUMN_DELAY_MS = 300

const AGENCIES = getOffer(AGENCIES_KEY)

/** Слова с дефисом не рвутся на нём: «Личный кабинет или веб-/сервис» переносится целым словом */
const keepHyphenated = (text: string) =>
	text.split(' ').map((word, i) => (
		<span key={i}>
			{i > 0 && ' '}
			{word.includes('-') ? <span className='offerGrid__nowrap'>{word}</span> : word}
		</span>
	))

/**
 * Иллюстрация услуги (MiniUi — та же, что в шапке страницы услуги): сцена микроанимаций играет один раз, когда карточка
 * появилась на экране (класс is-playing на .miniUiHost, со сдвигом по колонке), и снимается после сцены или когда карточка
 * ушла с экрана — сцены не крутятся одновременно и вне экрана. Повтор — по ховеру и фокусу карточки (MiniUi.scss). При
 * reduced-motion наблюдателя нет: стоит исходная композиция
 */
function OfferScene({ variant, column }: { variant: MiniUiVariant; column: number }) {
	const ref = useRef<HTMLDivElement>(null)
	const reduced = useMediaQuery(MQ.reduced)
	const [playing, setPlaying] = useState(false)

	useEffect(() => {
		const el = ref.current
		if (!el || reduced) return
		let start = 0
		let stop = 0
		const io = new IntersectionObserver(
			([entry]) => {
				window.clearTimeout(start)
				window.clearTimeout(stop)
				if (!entry.isIntersecting) {
					setPlaying(false)
					return
				}
				start = window.setTimeout(() => {
					setPlaying(true)
					stop = window.setTimeout(() => setPlaying(false), SCENE_MS)
				}, column * COLUMN_DELAY_MS)
			},
			{ threshold: 0.6 }
		)
		io.observe(el)
		return () => {
			io.disconnect()
			window.clearTimeout(start)
			window.clearTimeout(stop)
		}
	}, [reduced, column])

	return (
		<div ref={ref} className={`offerGrid__slot miniUiHost${playing && !reduced ? ' is-playing' : ''}`}>
			<MiniUi variant={variant} />
		</div>
	)
}

/**
 * Цена карточки: одной строкой «от 90 000 ₽ · 2–3 недели» (хвост — срок или условие cardNote: «одна платформа, готовые
 * дизайн и API») либо строки «подпись над ценой» (prices) и срок отдельно. cardPrice — одна строка вместо строк
 * prices (SEO: только ежемесячный тариф). Под ценой — cardFoot («Рекламный бюджет оплачивается отдельно»)
 */
function OfferPrice({ offer }: { offer: Offer }) {
	const single = offer.cardPrice ?? (offer.prices ? undefined : offer.priceFrom)
	if (single) {
		const tail = offer.cardNote ?? (offer.hideTermOnCard ? undefined : offer.term)
		return (
			<p className='offerGrid__price'>
				{single}
				{tail && <span className='offerGrid__term'> · {tail}</span>}
			</p>
		)
	}
	return (
		<dl className='offerGrid__prices'>
			{offer.prices?.map(p => (
				<div key={p.label}>
					<dt>{p.label}</dt>
					<dd className='offerGrid__price'>{p.price}</dd>
				</div>
			))}
			{!offer.hideTermOnCard && (
				<div>
					<dt>{offer.termLabel ?? 'Срок'}</dt>
					<dd className='offerGrid__term'>{offer.term}</dd>
				</div>
			)}
		</dl>
	)
}

/**
 * Сетка карточек услуг (ТЗ от 21.10.2026, §7; группы и новые карточки — ТЗ от 22.10.2026, §4): карточка — номер услуги
 * (offerNumber, один и тот же в шапке её страницы) в одной строке с названием (правка владельца от 22.10.2026), описание, цена и условия видны сразу, без ховера и
 * переключателей, иллюстрация услуги, круг со стрелкой. Вся карточка — ссылка на страницу услуги, внутри нет других
 * интерактивных элементов. Сетка 3 → 2 (≤1200) → 1 (≤640, иллюстрации скрыты). Оговорка и строка для агентств под
 * сеткой — CatalogFooter
 */
export default function OfferGrid({ offers = CATALOG, spacious = false, label = 'Услуги' }: Props) {
	return (
		<ul className={`offerGrid__list${spacious ? ' offerGrid__list--spacious' : ''}`} aria-label={label}>
			{offers.map((offer, i) => {
				const variant = miniUiVariant(offer.key)
				return (
					<Reveal as='li' key={offer.key} index={i}>
						<Box to={offerPath(offer)} className='offerGrid__card' glow cursor='открыть'>
							{variant && <OfferScene variant={variant} column={i % 3} />}
							<div className='offerGrid__head'>
								<span className='offerGrid__num' aria-hidden='true'>
									{offerNumber(offer)}
								</span>
								<h3 className='offerGrid__title'>{keepHyphenated(offer.title)}</h3>
							</div>
							<p className='offerGrid__line'>{offer.line}</p>
							<div className='offerGrid__foot'>
								<div className='offerGrid__priceCol'>
									<OfferPrice offer={offer} />
									{offer.cardFoot && <p className='offerGrid__cardFoot'>{offer.cardFoot}</p>}
								</div>
								<span className='offerGrid__arrow' aria-hidden='true'>
									↗
								</span>
							</div>
						</Box>
					</Reveal>
				)
			})}
		</ul>
	)
}

/** «Также могу помочь» (главная, ТЗ от 22.10.2026, §4): пять новых услуг обычными ссылками, без второго каталога */
export function MoreOffers() {
	return (
		<div className='offerGrid__more'>
			<p className='offerGrid__moreLabel'>{CATALOG_COPY.more}</p>
			<ul className='offerGrid__moreList' aria-label={CATALOG_COPY.more}>
				{MORE_OFFERS.map(o => (
					<li key={o.key}>
						<Button variant='text' to={offerPath(o)}>
							{o.title}
						</Button>
					</li>
				))}
			</ul>
		</div>
	)
}

/** Под сеткой каталога: оговорка про ориентиры, слот (ссылки «Также могу помочь» на главной) и строка для агентств */
export function CatalogFooter({ children }: { children?: ReactNode }) {
	return (
		<div className='offerGrid__tail'>
			<p className='offerGrid__note'>{CATALOG_COPY.note}</p>
			{children}
			{AGENCIES && (
				<div className='offerGrid__agencies'>
					<p>{CATALOG_COPY.agencies}</p>
					<Button variant='text' to={offerPath(AGENCIES)}>
						{CATALOG_COPY.agenciesLink}
					</Button>
				</div>
			)}
		</div>
	)
}
