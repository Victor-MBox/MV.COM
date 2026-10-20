// Контактные данные вынесены в одно место: замените на свои.
export const CONTACTS = {
	email: 'hello@example.com',
	telegram: 'victor_matsakov',
	whatsapp: '79990000000',
	github: 'Victor-MBox',
	linkedin: 'victor-matsakov',
	instagram: 'victor.matsakov',
	// Без города и часового пояса — решение владельца от 20.10.2026 (город остаётся только в резюме)
	location: 'Работаю удалённо',
}

export const CONTACT_LINKS = {
	email: `mailto:${CONTACTS.email}`,
	telegram: `https://t.me/${CONTACTS.telegram}`,
	whatsapp: `https://wa.me/${CONTACTS.whatsapp}`,
	github: `https://github.com/${CONTACTS.github}`,
	linkedin: `https://www.linkedin.com/in/${CONTACTS.linkedin}`,
	instagram: `https://www.instagram.com/${CONTACTS.instagram}`,
}
