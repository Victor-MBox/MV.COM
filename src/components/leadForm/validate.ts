import { FORM_COPY } from '../../data/leadForm'

export type ContactErrors = Partial<Record<'contact' | 'message' | 'consent', string>>

type Values = { contact: string; message: string; consent: boolean }

/**
 * Правила формы первого обращения — общие для LeadForm (модалка, /contacts) и формы футера. Имя необязательно и не
 * проверяется; контакт — почта, @ник или номер (поле «Telegram или почта», номер тоже принимаем); задача — не пустая
 */
export function validateContact({ contact, message, consent }: Values): ContactErrors {
	const next: ContactErrors = {}
	const c = contact.trim()
	const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)
	const looksLikePhone = /^\+?[\d\s()-]{7,}$/.test(c)
	const looksLikeHandle = /^@?[\w.]{3,}$/.test(c)
	if (!(looksLikeEmail || looksLikePhone || looksLikeHandle)) next.contact = FORM_COPY.errors.contact
	if (message.trim().length < 2) next.message = FORM_COPY.errors.message
	if (!consent) next.consent = FORM_COPY.errors.consent
	return next
}
