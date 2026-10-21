import { SHOWCASE_ORDER } from '../../data/home'
import { getOffer, offerPath } from '../../data/offers'
import type { Offer } from '../../data/offers'
import Box from '../box/Box'
import Chip from '../chip/Chip'
import MiniUi from '../miniUi/MiniUi'
import type { MiniUiVariant } from '../miniUi/MiniUi'
import Reveal from '../reveal/Reveal'
import './OfferGrid.scss'

type Item = { key: MiniUiVariant; offer: Offer }

const ITEMS = SHOWCASE_ORDER.map(key => ({ key, offer: getOffer(key) })).filter((i): i is Item => !!i.offer)

/**
 * Семь офферов карточками на /services (content.md §5.2): мини-интерфейс, номер и срок моно, название, строка, «для кого»
 * чипами, цена и круг со стрелкой. Порядок — как в витрине главной (SHOWCASE_ORDER). Вся карточка — ссылка на страницу оффера
 */
export default function OfferGrid() {
	return (
		<ul className='offerGrid' aria-label='Услуги'>
			{ITEMS.map(({ key, offer }, i) => (
				<Reveal as='li' key={key} index={i}>
					<Box to={offerPath(offer)} className='offerGrid__card miniUiHost' glow cursor='открыть'>
						<div className='offerGrid__slot'>
							<MiniUi variant={key} />
						</div>
						<p className='offerGrid__meta'>
							<span>{String(i + 1).padStart(2, '0')}</span>
							<span>{offer.term}</span>
						</p>
						<h3 className='offerGrid__title'>{offer.title}</h3>
						<p className='offerGrid__line'>{offer.line}</p>
						<ul className='offerGrid__chips' aria-label='Для кого'>
							{offer.forWhom.split(', ').map(w => (
								<Chip as='li' key={w}>
									{w}
								</Chip>
							))}
						</ul>
						<div className={`offerGrid__foot${offer.prices ? ' offerGrid__foot--prices' : ''}`}>
							{offer.prices ? (
								<dl className='offerGrid__prices'>
									{offer.prices.map(p => (
										<div key={p.label}>
											<dt>{p.label}</dt>
											<dd className='offerGrid__price'>{p.price}</dd>
										</div>
									))}
								</dl>
							) : (
								<span className='offerGrid__price'>{offer.priceFrom}</span>
							)}
							<span className='offerGrid__arrow' aria-hidden='true'>
								↗
							</span>
						</div>
					</Box>
				</Reveal>
			))}
		</ul>
	)
}
