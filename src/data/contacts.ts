// Контактные данные вынесены в одно место: замените на свои.
export const CONTACTS = {
	email: 'hello@example.com',
	telegram: 'victor_matsakov',
	whatsapp: '79990000000',
	github: 'Victor-MBox',
	linkedin: 'victor-matsakov',
	instagram: 'victor.matsakov',
	location: 'Тбилиси, Грузия · GMT+4',
}

export const CONTACT_LINKS = {
	email: `mailto:${CONTACTS.email}`,
	telegram: `https://t.me/${CONTACTS.telegram}`,
	whatsapp: `https://wa.me/${CONTACTS.whatsapp}`,
	github: `https://github.com/${CONTACTS.github}`,
	linkedin: `https://www.linkedin.com/in/${CONTACTS.linkedin}`,
	instagram: `https://www.instagram.com/${CONTACTS.instagram}`,
}

export const FAQ = [
	{
		q: 'Сколько стоит сайт?',
		a: 'Лендинг — от 90 000 ₽, интернет-магазин — от 250 000 ₽, доработки — от 3 500 ₽ в час. Ориентиры по всем услугам есть на странице «Услуги», точную цену называю после брифа.',
	},
	{
		q: 'Какие сроки?',
		a: 'Лендинг — 2–3 недели, корпоративный сайт — 4–6 недель, SaaS-интерфейс — от 2 месяцев. Промежуточные версии показываю каждую неделю.',
	},
	{
		q: 'Работаете по договору?',
		a: 'Да, работаю как ИП, подписываем договор и акты. Оплата поэтапная: 50% перед стартом, остальное после сдачи.',
	},
	{
		q: 'Что нужно от меня для старта?',
		a: 'Описание задачи в свободной форме, примеры сайтов, которые нравятся, и доступ к текущему сайту, если он есть. Остальное соберём на созвоне.',
	},
]
