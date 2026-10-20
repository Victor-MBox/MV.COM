import { Link } from 'react-router-dom'
import { getOffer, offerPath } from '../../../data/offers'
import { FEATURED_OFFERS, H2, ROW_OFFERS } from '../../../data/home3'
import SectionHead from '../../../components/sectionHead/SectionHead'
import Reveal from '../../../components/reveal/Reveal'
import Box from '../../../components/box/Box'
import MiniUi from '../../../components/miniUi/MiniUi'

const CARD_STAGGER = 0.09

/** Услуги (docs/design-spec.md §7.2): три карточки с мини-интерфейсами и четыре строки */
export default function Services() {
	const featured = FEATURED_OFFERS.map(key => ({ key, offer: getOffer(key) }))
	const rows = ROW_OFFERS.map(key => getOffer(key))

	return (
		<section className='home3Section' id='services'>
			<SectionHead label='услуги' title={H2.services} action={{ label: 'Все услуги', to: '/services' }} divided />

			<div className='services__cards'>
				{featured.map(({ key, offer }, i) =>
					offer ? (
						<Reveal key={key} delay={i * CARD_STAGGER}>
							<Box to={offerPath(offer)} className='offerBox' glow>
								<MiniUi variant={key} />
								<h3 className='offerBox__title'>{offer.title}</h3>
								<p className='offerBox__line'>{offer.line}</p>
								<p className='offerBox__meta'>
									<span>
										{offer.priceFrom} · {offer.term}
									</span>
									<span className='offerBox__arrow' aria-hidden='true'>
										→
									</span>
								</p>
							</Box>
						</Reveal>
					) : null
				)}
			</div>

			<ol className='services__rows'>
				{rows.map((offer, i) =>
					offer ? (
						<Reveal as='li' key={offer.key} index={i}>
							<Link to={offerPath(offer)} className='offerRow'>
								<span className='offerRow__num'>{String(featured.length + i + 1).padStart(2, '0')}</span>
								<span className='offerRow__title'>{offer.title}</span>
								<span className='offerRow__line'>{offer.line}</span>
								<span className='offerRow__price'>{offer.priceFrom}</span>
								<span className='offerRow__arrow' aria-hidden='true'>
									→
								</span>
							</Link>
						</Reveal>
					) : null
				)}
			</ol>
		</section>
	)
}
