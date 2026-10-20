export type ContactErrors = Partial<Record<'name' | 'contact' | 'message' | 'consent', string>>

type Values = { name: string; contact: string; message: string; consent: boolean }

/** Правила формы заявки: общие для ContactForm (модалка старых страниц) и LeadForm (дизайн-система 1.0) */
export function validateContact({ name, contact, message, consent }: Values): ContactErrors {
	const next: ContactErrors = {}
	if (name.trim().length < 2) next.name = 'Напишите, как к вам обращаться'
	const c = contact.trim()
	const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)
	const looksLikePhone = /^\+?[\d\s()-]{7,}$/.test(c)
	const looksLikeHandle = /^@?[\w.]{3,}$/.test(c)
	if (!(looksLikeEmail || looksLikePhone || looksLikeHandle)) {
		next.contact = 'Укажите e-mail, телефон или ник в Telegram'
	}
	if (message.trim().length < 10) next.message = 'Расскажите о задаче чуть подробнее'
	if (!consent) next.consent = 'Нужно согласие на обработку данных'
	return next
}
