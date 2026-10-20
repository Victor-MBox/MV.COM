import type { PRICING_MODELS } from '../../data/pricing'
import Box from '../box/Box'
import Button from '../button/Button'
import './PriceCard.scss'

type Model = (typeof PRICING_MODELS)[number]

type Props = {
	model: Model
	/** Открывает модалку с темой — названием формата */
	onDiscuss: (topic: string) => void
}

/** Карточка формата оплаты (docs/design-spec-home4.md §5.5): без свечения и бордера в покое, ховер как Card 1.0, «Обсудить» — текстовая ссылка */
export default function PriceCard({ model, onDiscuss }: Props) {
	return (
		<Box className='priceCard'>
			<h3 className='priceCard__label'>{model.label}</h3>
			<p className='priceCard__price'>{model.price}</p>
			<p className='priceCard__text'>{model.text}</p>
			<Button variant='text' className='priceCard__cta' onClick={() => onDiscuss(model.label)} aria-label={`Обсудить: ${model.label}`}>
				Обсудить
			</Button>
		</Box>
	)
}
