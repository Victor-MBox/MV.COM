import { CONTACTS, CONTACT_LINKS } from '../../data/contacts'
import { FORM_COPY } from '../../data/leadForm'
import Button from '../button/Button'
import './FormFallback.scss'

type Props = {
	className?: string
}

/**
 * Замена формы, пока у неё нет обработчика доставки и политики (FORM_ENABLED = false, публичная сборка): кнопка
 * «Написать в Telegram» и почта строкой. Ничего не отправляет и не изображает отправку
 */
export default function FormFallback({ className }: Props) {
	return (
		<div className={['formFallback', className ?? ''].filter(Boolean).join(' ')}>
			<Button href={CONTACT_LINKS.telegram} arrow arrowGlyph='↗'>
				{FORM_COPY.fallback.telegram}
			</Button>
			<p className='formFallback__alt'>
				{FORM_COPY.fallback.email}
				{' '}
				<a href={CONTACT_LINKS.email}>{CONTACTS.email}</a>
			</p>
		</div>
	)
}
