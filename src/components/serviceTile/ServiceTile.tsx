import { Link } from 'react-router-dom'
import ServiceIcon from '../serviceIcon/ServiceIcon'
import { servicePath } from '../../data/services'
import type { Service } from '../../data/services'
import './ServiceTile.scss'

type Props = {
	service: Service
	showPrice?: boolean
}

/** Компактная карточка услуги: иконка, название, одна строка, цена. Клик ведёт на страницу услуги. */
export default function ServiceTile({ service, showPrice = true }: Props) {
	return (
		<Link to={servicePath(service)} className='serviceTile'>
			<span className='serviceTile__icon'>
				<ServiceIcon name={service.icon} />
			</span>
			<span className='serviceTile__body'>
				<span className='serviceTile__title'>{service.title}</span>
				<span className='serviceTile__text'>{service.short}</span>
			</span>
			<span className='serviceTile__foot'>
				{showPrice ? <span className='serviceTile__price'>{service.priceFrom}</span> : <span />}
				<span className='serviceTile__arrow'>
					<ServiceIcon name='arrow' />
				</span>
			</span>
		</Link>
	)
}
