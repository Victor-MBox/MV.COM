// Контактные данные вынесены в одно место
export const CONTACTS = {
	email: 'info@matsakov-victor.com',
	telegram: 'victor_mbox',
	/** Мессенджер MAX: у профиля нет имени пользователя, только id из ссылки-приглашения */
	max: 'f9LHodD0cOJSPaGEw4P4AscMSvDJHF97G3b8emEfMcwhh3kD3ONsplnJpxw',
	/** Цифрами для ссылки tel:, для показа — phoneLabel */
	phone: '+79953940303',
	phoneLabel: '+7 995 394-03-03',
	github: 'Victor-MBox',
	/** Настоящий профиль с 22.10.2026 */
	linkedin: 'viktor-matsakov-148767268',
	instagram: 'victor.matsakov',
	// Без города и часового пояса — решение владельца от 20.10.2026 (город остаётся только в резюме)
	location: 'Работаю удалённо',
}

export const CONTACT_LINKS = {
	email: `mailto:${CONTACTS.email}`,
	telegram: `https://t.me/${CONTACTS.telegram}`,
	max: `https://max.ru/u/${CONTACTS.max}`,
	phone: `tel:${CONTACTS.phone}`,
	github: `https://github.com/${CONTACTS.github}`,
	linkedin: `https://www.linkedin.com/in/${CONTACTS.linkedin}`,
	instagram: `https://www.instagram.com/${CONTACTS.instagram}`,
}
