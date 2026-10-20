import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { offerPath } from '../../data/offers'
import type { Offer } from '../../data/offers'
import type { OfferTone } from '../../data/home'
import './OfferTile.scss'

const MotionLink = motion.create(Link)

type Props = {
	offer: Offer
	/** Цветная плитка: синий или оранжевый градиент. Без tone — нейтральная */
	tone?: OfferTone
	/** Плитка на две колонки сетки */
	wide?: boolean
	/** Порядковый номер в сетке — задержка появления */
	index?: number
	/** Подробная плитка (/home2): строка «для кого» под названием и срок рядом с ценой */
	detailed?: boolean
}

/** Типографическая плитка оффера на главной: название, строка, цена и стрелка. Сетка — `.offerTiles` */
export default function OfferTile({ offer, tone, wide = false, index = 0, detailed = false }: Props) {
	const cn = ['offerTile', tone && `offerTile--${tone}`, wide && 'offerTile--wide', detailed && 'offerTile--detailed']
		.filter(Boolean)
		.join(' ')

	return (
		<MotionLink
			to={offerPath(offer)}
			className={cn}
			initial={{ opacity: 0, y: 18 }}
			whileInView={{ opacity: 1, y: 0 }}
			whileHover={{ y: -3 }}
			viewport={{ once: true, margin: '-40px' }}
			transition={{ duration: 0.4, delay: (index % 3) * 0.07, ease: [0.4, 0, 0.2, 1] }}
		>
			<span className='offerTile__title'>{offer.title}</span>
			{detailed && <span className='offerTile__for'>{offer.forWhom}</span>}
			<span className='offerTile__line'>{offer.line}</span>
			<span className='offerTile__foot'>
				<span className='offerTile__price'>
					{offer.priceFrom}
					{detailed && <span className='offerTile__term'>· {offer.term}</span>}
				</span>
				<svg
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
					aria-hidden='true'
				>
					<path d='M5 12h14M13 6l6 6-6 6' />
				</svg>
			</span>
		</MotionLink>
	)
}
