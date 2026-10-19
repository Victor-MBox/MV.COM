import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import ServiceIcon from '../serviceIcon/ServiceIcon'
import OfferIllustration from '../offerIllustration/OfferIllustration'
import { offerPath } from '../../data/offers'
import type { Offer } from '../../data/offers'
import './OfferCard.scss'

const MotionLink = motion.create(Link)

type Props = {
	offer: Offer
	/** Порядковый номер в сетке: задаёт вариант свечения (синее / оранжевое / оба) и задержку появления */
	index?: number
}

/** Карточка оффера на /services: приглушённое свечение (ярче по ховеру), линейная иллюстрация, для кого и срок. Появляется при прокрутке. Сетка — `.offerGrid`. На главной вместо неё `OfferTile` */
export default function OfferCard({ offer, index = 0 }: Props) {
	const glow = (index % 3) + 1
	return (
		<MotionLink
			to={offerPath(offer)}
			className={`offerCard offerCard--glow-${glow}`}
			initial={{ opacity: 0, y: 18 }}
			whileInView={{ opacity: 1, y: 0 }}
			whileHover={{ y: -3 }}
			viewport={{ once: true, margin: '-40px' }}
			transition={{ duration: 0.4, delay: (index % 3) * 0.07, ease: [0.4, 0, 0.2, 1] }}
		>
			<OfferIllustration offer={offer.key} className='offerCard__art' />
			<span className='offerCard__title'>{offer.title}</span>
			<span className='offerCard__line'>{offer.line}</span>
			<span className='offerCard__for'>Для кого: {offer.forWhom}</span>
			<span className='offerCard__foot'>
				<span className='offerCard__price'>
					{offer.priceFrom}
					<em> · {offer.term}</em>
				</span>
				<span className='offerCard__arrow'>
					<ServiceIcon name='arrow' />
				</span>
			</span>
		</MotionLink>
	)
}
