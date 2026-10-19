import type { ReactNode } from 'react'
import { useContactModal } from '../contactModal/ContactModalContext'
import { CONTACT_LINKS } from '../../data/contacts'

// scss
import './FooterBanner.scss'

type Props = {
	/** Заголовок баннера; по умолчанию — общий текст из content.md §4.8 с акцентом на сроке */
	title?: ReactNode
	/** Подпись главной кнопки, например «Обсудить лендинг» на странице оффера */
	cta?: string
	/** Что подставить в поле «Что нужно сделать» при открытии формы */
	topic?: string
}

const DEFAULT_TITLE = (
	<>
		Расскажите о задаче — <span className='footerBanner__accent'>через два дня</span> пришлю смету и срок
	</>
)

export default function FooterBanner({ title = DEFAULT_TITLE, cta = 'Оставить заявку', topic }: Props) {
	const { open } = useContactModal()

	return (
		<section className='footerBanner'>
			<div>
				<h2 className='footerBanner__title'>{title}</h2>
				<p className='footerBanner__subtitle'>Напишите в Telegram или оставьте заявку. Отвечаю в течение рабочего дня.</p>
			</div>
			<div className='footerBanner__actions'>
				<button className='btn btn_light' type='button' onClick={() => open(topic)}>
					<span className='btn__label'>{cta}</span>
				</button>
				<a className='btn btn_dark' href={CONTACT_LINKS.telegram} target='_blank' rel='noopener noreferrer'>
					<span>Написать в Telegram</span>
				</a>
			</div>
		</section>
	)
}
