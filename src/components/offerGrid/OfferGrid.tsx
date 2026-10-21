import { useEffect, useRef, useState } from 'react'
import { CATALOG_COPY } from '../../data/home'
import { AGENCIES_KEY, CATALOG, getOffer, offerPath } from '../../data/offers'
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
	/** /services: больше воздуха между карточками и внутри них */
	spacious?: boolean
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
 * ушла с экрана — шесть сцен не крутятся одновременно. Повтор — по ховеру и фокусу карточки (MiniUi.scss). При
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

/** Цена и срок карточки: «от 90 000 ₽ · 2–3 недели» одной строкой или строки «подпись над ценой» и срок отдельно */
function OfferPrice({ offer }: { offer: Offer }) {
	if (!offer.prices) {
		return (
			<p className='offerGrid__price'>
				{offer.priceFrom}
				<span className='offerGrid__term'> · {offer.term}</span>
			</p>
		)
	}
	return (
		<dl className='offerGrid__prices'>
			{offer.prices.map(p => (
				<div key={p.label}>
					<dt>{p.label}</dt>
					<dd className='offerGrid__price'>{p.price}</dd>
				</div>
			))}
			{!offer.hideTermOnCard && (
				<div>
					<dt>Срок</dt>
					<dd className='offerGrid__term'>{offer.term}</dd>
				</div>
			)}
		</dl>
	)
}

/**
 * Каталог услуг (ТЗ от 21.10.2026, §7) — один и тот же на главной и /services: шесть статичных карточек CATALOG
 * (название, описание, цена и срок видны сразу, без ховера и переключателей) с иллюстрацией услуги, под сеткой —
 * оговорка про ориентиры и компактная строка для агентств. Вся карточка — ссылка на страницу услуги, внутри нет других
 * интерактивных элементов. Сетка 3 → 2 (≤1200) → 1 (≤640, иллюстрации скрыты)
 */
export default function OfferGrid({ spacious = false }: Props) {
	return (
		<div className={`offerGrid${spacious ? ' offerGrid--spacious' : ''}`}>
			<ul className='offerGrid__list' aria-label='Услуги'>
				{CATALOG.map((offer, i) => {
					const variant = miniUiVariant(offer.key)
					return (
						<Reveal as='li' key={offer.key} index={i}>
							<Box to={offerPath(offer)} className='offerGrid__card' glow cursor='открыть'>
								{variant && <OfferScene variant={variant} column={i % 3} />}
								<span className='offerGrid__num' aria-hidden='true'>
									{String(i + 1).padStart(2, '0')}
								</span>
								<h3 className='offerGrid__title'>{keepHyphenated(offer.title)}</h3>
								<p className='offerGrid__line'>{offer.line}</p>
								<div className='offerGrid__foot'>
									<OfferPrice offer={offer} />
									<span className='offerGrid__arrow' aria-hidden='true'>
										↗
									</span>
								</div>
							</Box>
						</Reveal>
					)
				})}
			</ul>

			<p className='offerGrid__note'>{CATALOG_COPY.note}</p>

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
