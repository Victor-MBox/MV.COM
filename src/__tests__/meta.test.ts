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
	// ТЗ «расширить услуги» от 22.10.2026, §11
	integrations: {
		title: 'Интеграции API и автоматизация — Виктор Мацаков',
		heading: 'Интеграции API и автоматизация',
		description: 'Обмен данными между сайтом, CRM, 1С и внешними сервисами. Заявки, заказы, остатки и уведомления. Интеграции от 40 000 ₽.',
	},
	support: {
		title: 'Доработка и обслуживание сайтов — Виктор Мацаков',
		heading: 'Доработка и обслуживание сайта',
		description:
			'Доработка и техническое обслуживание сайтов: исправление ошибок, новые функции, резервные копии и контроль доступности. Обслуживание от 3 000 ₽ в месяц.',
	},
	// Пять новых услуг — ТЗ от 22.10.2026, §2 и §11
	'mobile-apps': {
		title: 'Разработка мобильных приложений iOS и Android — Виктор Мацаков',
		heading: 'Мобильные приложения для iOS и Android',
		description:
			'Разработка приложений для клиентов и сотрудников. Интерфейс, подключения и тестирование. От 600 000 ₽ за одну платформу при готовых дизайне и API.',
	},
	interactive: {
		title: 'Разработка квизов и промо-игр — Виктор Мацаков',
		heading: 'Квизы, промо-игры и интерактивные проекты',
		description:
			'Квизы, тесты и интерактивные проекты для сайтов. Квиз от 60 000 ₽, простая промо-игра от 200 000 ₽. Сценарии, разработка и подключения под задачу.',
	},
	seo: {
		title: 'SEO-продвижение и аудит сайта — Виктор Мацаков',
		heading: 'SEO-продвижение сайтов',
		description:
			'SEO-аудит и продвижение сайтов: запросы, структура, технические исправления и работа с содержанием. Аудит от 25 000 ₽, продвижение от 35 000 ₽ в месяц.',
	},
	context: {
		title: 'Настройка и ведение Яндекс Директа — Виктор Мацаков',
		heading: 'Контекстная реклама в Яндекс Директе',
		description:
			'Контекстная реклама в Яндекс Директе: настройка от 35 000 ₽, ведение от 25 000 ₽ в месяц. Объявления, цели и отчёты. Рекламный бюджет отдельно.',
	},
	analytics: {
		title: 'Настройка веб-аналитики и Яндекс Метрики — Виктор Мацаков',
		heading: 'Настройка веб-аналитики',
		description:
			'Настройка Метрики, целей и событий от 15 000 ₽. Проверка форм и источников обращений, отслеживание заказов и электронная коммерция.',
	},
}

describe('мета страниц услуг', () => {
	it('title, description и H1 одиннадцати услуг — тексты ТЗ', () => {
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
		;['corporate', 'landing', 'ecommerce', 'integrations', 'mobile-apps'].forEach(key => {
			const price = getOffer(key)?.priceFrom ?? '—'
			expect(OFFER_META[key]?.description.toLowerCase()).toContain(price)
		})
		getOffer('interactive')?.prices?.forEach(p => expect(OFFER_META.interactive?.description).toContain(p.price))
		expect(OFFER_META.seo?.description).toContain('от 25 000 ₽')
		expect(OFFER_META.seo?.description).toContain('от 35 000 ₽ в месяц')
		expect(OFFER_META.context?.description).toContain('от 35 000 ₽')
		expect(OFFER_META.context?.description).toContain('от 25 000 ₽ в месяц')
		expect(OFFER_META.analytics?.description).toContain(getOffer('analytics')?.priceFrom ?? '—')
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

	it('главная — прежняя мета, /services и обзор продвижения — тексты ТЗ от 22.10.2026, 404 — noindex', () => {
		expect(SITE_META.home.title).toBe('Разработка сайтов и веб-сервисов — Виктор Мацаков')
		expect(SITE_META.services).toEqual({
			title: 'Сайты, приложения и продвижение — Виктор Мацаков',
			description:
				'Разработка сайтов, мобильных приложений и интерактивных проектов. Интеграции API, SEO, Яндекс Директ и веб-аналитика. Работа по договору с Виктором Мацаковым.',
		})
		expect(SITE_META.promotion).toEqual({
			title: 'Продвижение сайтов: SEO, реклама и аналитика — Виктор Мацаков',
			description:
				'SEO-продвижение, контекстная реклама и настройка аналитики сайта. Помогу выбрать первый этап, согласовать работы и отслеживать обращения.',
		})
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
		expect(canonicalUrl('/services/promotion/seo', site)).toBe('https://example.com/services/promotion/seo')
	})
})
