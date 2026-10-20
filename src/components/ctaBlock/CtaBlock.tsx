import { CONTACT_LINKS } from '../../data/contacts'
import { FINAL_TITLE } from '../../data/home'
import { useContactModal } from '../contactModal/ContactModalContext'
import SplitLines from '../splitLines/SplitLines'
import Reveal from '../reveal/Reveal'
import Button from '../button/Button'
import './CtaBlock.scss'

type Props = {
	/** Заголовок в две строки; по умолчанию девиз финала главной */
	title?: string[]
	text?: string
	/** Подпись главной кнопки: «Обсудить лендинг» на странице оффера */
	cta?: string
	/** Тема, которая подставится в форму */
	topic?: string
	id?: string
}

// TODO (владелец): текст под заголовком CTA внутренних страниц
const DEFAULT_TEXT = 'Опишите задачу в двух словах — отвечу в течение рабочего дня.'

/**
 * CTA внутренних страниц (content.md §4.8): заголовок в две строки, как в финале главной, строка текста, primary-кнопка
 * в модалку с темой и текстовая ссылка в Telegram. Встроенной формы нет — она на /contacts
 */
export default function CtaBlock({ title = FINAL_TITLE, text = DEFAULT_TEXT, cta = 'Обсудить проект', topic, id = 'contact' }: Props) {
	const { open } = useContactModal()

	return (
		<section className='section ctaBlock' id={id}>
			<div className='container ctaBlock__in'>
				<SplitLines as='h2' className='ctaBlock__title' lines={title} />
				<Reveal className='ctaBlock__text'>
					<p>{text}</p>
				</Reveal>
				<Reveal className='ctaBlock__actions' delay={0.08}>
					<Button onClick={() => open(topic)}>{cta}</Button>
					<Button variant='text' href={CONTACT_LINKS.telegram} arrowGlyph='↗'>
						Написать в Telegram
					</Button>
				</Reveal>
			</div>
		</section>
	)
}
