import { Link } from 'react-router-dom'
import { useContactModal } from '../contactModal/ContactModalContext'
import { AVAILABILITY } from '../../data/home'

// scss
import './HomeBanner.scss'

/** Hero главной (концепт D «Типографика»): статус, крупный H1 с акцентом, подзаголовок и кнопки в одной строке. Фото ушло в блок «Для HR» */
export default function HomeBanner() {
	const { open } = useContactModal()

	return (
		<section className='homeBanner'>
			{/* <p className='homeBanner__status'>
				<span className='homeBanner__dot' aria-hidden='true' />
				{AVAILABILITY}
			</p> */}
			<h1 className='homeBanner__title'>
				Разрабатываю сайты и&nbsp;веб‑сервисы{' '}
				<span className='homeBanner__accent'>под&nbsp;ключ</span>
			</h1>
			<div className='homeBanner__row'>
				<p className='homeBanner__subtitle'>
					Лендинги, интернет-магазины, личные кабинеты и интеграции с CRM. Один
					разработчик на весь проект: структура, дизайн, фронтенд, бэкенд,
					запуск и поддержка. Цена и срок — до старта.
				</p>
				<div className='homeBanner__actions'>
					<button
						className='btn btn_light'
						type='button'
						onClick={() => open()}
					>
						<span className='btn__label'>Обсудить проект</span>
					</button>
					<Link to='/portfolio' className='btn btn_dark'>
						<span>Смотреть работы</span>
					</Link>
				</div>
			</div>
		</section>
	)
}
