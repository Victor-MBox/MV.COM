import { describe, expect, it } from 'vitest'
import { OFFER_META, SITE_META, SITE_URL, canonicalUrl, normalizeSiteUrl } from '../data/meta'
import type { PageMeta } from '../data/meta'
import { CATALOG, OFFERS, getOffer } from '../data/offers'
import { SUPPORT_PACKAGES } from '../data/pricing'

// ТЗ по текстам и SEO от 21.10.2026, §2: title и H1 шести услуг
const SERVICES_SEO: Record<string, { title: string; heading: string; description: string }> = {
	corporate: {
		title: 'Разработка сайта компании — Виктор Мацаков',
		heading: 'Разработка сайта компании',
		description:
			'Разработка сайта компании: страницы услуг, формы обращений, управление контентом и запуск. Работа напрямую с разработчиком. От 180 000 ₽.',
	},
	landing: {
		title: 'Разработка лендинга — Виктор Мацаков',
		heading: 'Разработка лендинга',
		description:
			'Разработка лендинга для услуги, продукта или мероприятия: структура, дизайн, формы и аналитика. Работа напрямую. От 90 000 ₽.',
	},
	ecommerce: {
		title: 'Разработка интернет-магазина — Виктор Мацаков',
		heading: 'Разработка интернет-магазина',
		description:
			'Разработка интернет-магазина: каталог, корзина, оплата и доставка. Состав проекта и подключения согласуем до начала работ. От 250 000 ₽.',
	},
	'web-service': {
		title: 'Разработка личных кабинетов и веб-сервисов — Виктор Мацаков',
		heading: 'Личные кабинеты и веб-сервисы для бизнеса',
		description:
			'Разработка личных кабинетов и веб-сервисов для клиентов и сотрудников. Функции первой версии, права доступа и подключения — под задачи проекта.',
	},
	integrations: {
		title: 'Интеграция сайта с CRM и 1С — Виктор Мацаков',
		heading: 'Интеграции сайта с CRM и другими сервисами',
		description:
			'Подключение сайта к CRM, 1С, Telegram и другим сервисам. Передача заявок, заказов и остатков. Разработка и проверка обмена данными.',
	},
	support: {
		title: 'Доработка и обслуживание сайтов — Виктор Мацаков',
		heading: 'Доработка и обслуживание сайта',
		description:
			'Доработка и техническое обслуживание сайтов: исправление ошибок, новые функции, резервные копии и контроль доступности. Обслуживание от 3 000 ₽ в месяц.',
	},
}

describe('мета страниц услуг', () => {
	it('title, description и H1 шести услуг — тексты ТЗ', () => {
		Object.entries(SERVICES_SEO).forEach(([key, seo]) => {
			expect(OFFER_META[key]?.title).toBe(seo.title)
			expect(OFFER_META[key]?.description).toBe(seo.description)
			expect(getOffer(key)?.heading).toBe(seo.heading)
		})
	})

	it('короткие названия карточек каталога прежние', () => {
		expect(CATALOG.map(o => o.title)).toEqual([
			'Сайт компании',
			'Лендинг',
			'Интернет-магазин',
			'Личный кабинет или веб-сервис',
			'Интеграции и автоматизация',
			'Доработка и поддержка сайта',
		])
	})

	it('цена в description — та же, что на странице услуги', () => {
		;['corporate', 'landing', 'ecommerce'].forEach(key => {
			const price = getOffer(key)?.priceFrom ?? '—'
			expect(OFFER_META[key]?.description.toLowerCase()).toContain(price)
		})
		expect(OFFER_META.support?.description).toContain(`от ${SUPPORT_PACKAGES[0].price} в месяц`)
		expect(getOffer('support')?.priceDetail).toContain(`от ${SUPPORT_PACKAGES[0].price} в месяц`)
		expect(OFFER_META.agencies?.description).toContain(getOffer('agencies')?.priceFrom ?? '—')
	})

	it('у каждого оффера своя мета и H1', () => {
		OFFERS.forEach(o => {
			expect(OFFER_META[o.key]?.title).toMatch(/ — Виктор Мацаков$/)
			expect(o.heading.length).toBeGreaterThan(5)
		})
	})
})

describe('мета остальных страниц', () => {
	const all: PageMeta[] = [...Object.values(SITE_META), ...OFFERS.map(o => OFFER_META[o.key])]

	it('title и description не повторяются, общих заглушек главной на других страницах нет', () => {
		expect(new Set(all.map(m => m.title)).size).toBe(all.length)
		expect(new Set(all.map(m => m.description)).size).toBe(all.length)
		all.forEach(m => {
			expect(m.title.length).toBeGreaterThan(10)
			expect(m.description.length).toBeGreaterThan(50)
			expect(m.description.length).toBeLessThanOrEqual(200)
		})
	})

	it('главная — прежняя мета, 404 — noindex', () => {
		expect(SITE_META.home.title).toBe('Разработка сайтов и веб-сервисов — Виктор Мацаков')
		expect(SITE_META.notFound.noindex).toBe(true)
		Object.entries(SITE_META)
			.filter(([key]) => key !== 'notFound')
			.forEach(([, m]) => expect('noindex' in m).toBe(false))
	})
})

describe('публичный адрес и canonical', () => {
	it('адрес не задан — canonical не строится; заданный адрес не бывает локальным', () => {
		expect(canonicalUrl('/services/corporate', undefined)).toBeUndefined()
		if (SITE_URL) expect(SITE_URL).toMatch(/^https?:\/\/(?!localhost|127\.)/)
	})

	it('принимается только публичный http(s)-адрес, путь и слэш отбрасываются', () => {
		expect(normalizeSiteUrl('https://example.com/')).toBe('https://example.com')
		expect(normalizeSiteUrl('  https://example.com/some/path?q=1 ')).toBe('https://example.com')
		;[undefined, '', ' ', 'example.com', 'ftp://example.com', 'http://localhost:5173', 'https://127.0.0.1', 'http://app.localhost', 'http://[::1]:4173'].forEach(
			v => expect(normalizeSiteUrl(v)).toBeUndefined()
		)
	})

	it('canonical — домен и путь без завершающего слэша', () => {
		const site = 'https://example.com'
		expect(canonicalUrl('/', site)).toBe('https://example.com/')
		expect(canonicalUrl('/services/corporate/', site)).toBe('https://example.com/services/corporate')
		expect(canonicalUrl('/services/support', site)).toBe('https://example.com/services/support')
	})
})
