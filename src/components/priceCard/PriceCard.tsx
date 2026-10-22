import type { PricingModel } from '../../data/pricing'
import Box from '../box/Box'
import Button from '../button/Button'
import './PriceCard.scss'

type Props = {
	model: PricingModel
	/** Открывает модалку с темой — названием формата; у модели с `to` кнопка — ссылка */
	onDiscuss: (topic: string) => void
}

/**
 * Карточка формата оплаты (docs/design-spec-home4.md §5.5): без свечения и бордера в покое, ховер как Card 1.0, кнопка —
 * текстовая ссылка с подписью формата («Обсудить доработку») или ссылка `to` («Посмотреть пакеты»). Цена словами («По согласованному составу работ») — кеглем
 * меньше, чтобы не занимать три строки
 */
export default function PriceCard({ model, onDiscuss }: Props) {
	const verbal = !/\d/.test(model.price)
	return (
		<Box className='priceCard'>
			<h3 className='priceCard__label'>{model.label}</h3>
			<p className={`priceCard__price${verbal ? ' priceCard__price--verbal' : ''}`}>{model.price}</p>
			<p className='priceCard__text'>{model.text}</p>
			{model.to ? (
				<Button variant='text' className='priceCard__cta' to={model.to}>
					{model.cta}
				</Button>
			) : (
				<Button variant='text' className='priceCard__cta' onClick={() => onDiscuss(model.label)}>
					{model.cta}
				</Button>
			)}
		</Box>
	)
}
