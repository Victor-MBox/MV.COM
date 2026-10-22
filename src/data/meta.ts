import { getOffer } from './offers'
import { SUPPORT_PACKAGES } from './pricing'

export type PageMeta = {
	title: string
	description: string
	/** Страница не для индекса (404): meta robots noindex, без canonical и og:url */
	noindex?: boolean
}

// ---------- Публичный адрес ----------

/**
 * Публичный адрес сайта без завершающего слэша — или undefined, если адрес не задан или не публичный (пусто,
 * localhost, loopback, не http(s)). Путь в адресе отбрасывается: роутер живёт в корне домена
 */
export function normalizeSiteUrl(raw: string | undefined): string | undefined {
	const value = raw?.trim()
	if (!value) return undefined
	try {
		const url = new URL(value)
		if (url.protocol !== 'https:' && url.protocol !== 'http:') return undefined
		if (/^(localhost|.+\.localhost|127(\.\d+){3}|0\.0\.0\.0|\[::1?\])$/.test(url.hostname)) return undefined
		return url.origin
	} catch {
		return undefined
	}
}

/**
 * Единственная настройка публичного адреса для canonical и og:url — переменная сборки VITE_SITE_URL
 * (`.env.production` — https://matsakov-victor.com, подтверждён владельцем 22.10.2026; пример — `.env.example`). Без переменной
 * (dev, тесты) адреса нет и canonical / og:url не выводятся: фиктивный или локальный canonical хуже, чем никакого.
 * Адрес не выводится из почты и не берётся из location — на dev и preview это localhost
 */
export const SITE_URL = normalizeSiteUrl(import.meta.env.VITE_SITE_URL)

/** Канонический адрес страницы: публичный домен + путь без query, hash и завершающего слэша; без домена — undefined */
export function canonicalUrl(pathname: string, siteUrl: string | undefined) {
	if (!siteUrl) return undefined
	return siteUrl + (pathname.replace(/\/+$/, '') || '/')
}

// ---------- Title и description ----------

/**
 * Title и description страниц — useDocumentMeta на странице. Дефолт для страниц без своей меты (кейс, блог) — те же
 * значения главной в index.html (при правке менять оба места). Главная, /services и /portfolio — ТЗ от 21.10.2026, §16;
 * «Обо мне», контакты и 404 — по содержанию страниц (ТЗ по текстам и SEO от 21.10.2026)
 */
export const SITE_META = {
	home: {
		title: 'Разработка сайтов и веб-сервисов — Виктор Мацаков',
		description:
			'Частный веб-разработчик Виктор Мацаков. Сайты компаний, интернет-магазины, личные кабинеты, интеграции и доработка существующих проектов. Работа напрямую.',
	},
	services: {
		title: 'Разработка и доработка сайтов — услуги Виктора Мацакова',
		description:
			'Сайты компаний, лендинги, интернет-магазины, личные кабинеты, интеграции и доработка существующих проектов: ориентиры по стоимости и срокам, условия работы.',
	},
	portfolio: {
		title: 'Проекты и опыт разработки — Виктор Мацаков',
		description: 'Проекты Виктора Мацакова: что нужно было сделать, какие задачи он решал и что получилось в результате.',
	},
	/** ТЗ «реальный опыт на /about» от 21.10.2026 */
	about: {
		title: 'Виктор Мацаков — веб-разработчик PHP, Laravel и React',
		description:
			'Виктор Мацаков — full-stack разработчик. Опыт работы в веб-студиях, сайты на WordPress и 1С-Битрикс, сервисы на Laravel и интерфейсы на React. Проекты и моя роль в них.',
	},
	contacts: {
		title: 'Контакты: обсудить задачу — Виктор Мацаков',
		description:
			'Telegram, почта и телефон для обсуждения нового сайта, доработки или интеграции. Работа напрямую с разработчиком, ответ в течение рабочего дня.',
	},
	notFound: {
		title: 'Страница не найдена — Виктор Мацаков',
		description: 'Страницы по этому адресу нет: возможно, ссылка устарела или в адресе опечатка.',
		noindex: true,
	},
} satisfies Record<string, PageMeta>

/** «От 180 000 ₽» — стартовая цена оффера из тех же данных, что бейджи и блок стоимости его страницы */
const startPrice = (key: string) => {
	const price = getOffer(key)?.priceFrom ?? ''
	return price.charAt(0).toUpperCase() + price.slice(1)
}

const agencies = getOffer('agencies')

/**
 * Title и description страниц услуг /services/:offer (ТЗ по текстам и SEO от 21.10.2026) по ключу оффера; H1 —
 * Offer.heading, короткое название карточки — Offer.title. Цены подставляются из offers.ts и pricing.ts, чтобы мета
 * не расходилась с видимой ценой. Описание обслуживания перечисляет направления услуги, а не состав базового пакета.
 * У каждого оффера мета есть (тест)
 */
export const OFFER_META: Record<string, PageMeta> = {
	corporate: {
		title: 'Разработка сайта компании — Виктор Мацаков',
		description: `Разработка сайта компании: страницы услуг, формы обращений, управление контентом и запуск. Работа напрямую с разработчиком. ${startPrice('corporate')}.`,
	},
	landing: {
		title: 'Разработка лендинга — Виктор Мацаков',
		description: `Разработка лендинга для услуги, продукта или мероприятия: структура, дизайн, формы и аналитика. Работа напрямую. ${startPrice('landing')}.`,
	},
	ecommerce: {
		title: 'Разработка интернет-магазина — Виктор Мацаков',
		description: `Разработка интернет-магазина: каталог, корзина, оплата и доставка. Состав проекта и подключения согласуем до начала работ. ${startPrice('ecommerce')}.`,
	},
	'web-service': {
		title: 'Разработка личных кабинетов и веб-сервисов — Виктор Мацаков',
		description:
			'Разработка личных кабинетов и веб-сервисов для клиентов и сотрудников. Функции первой версии, права доступа и подключения — под задачи проекта.',
	},
	integrations: {
		title: 'Интеграция сайта с CRM и 1С — Виктор Мацаков',
		description:
			'Подключение сайта к CRM, 1С, Telegram и другим сервисам. Передача заявок, заказов и остатков. Разработка и проверка обмена данными.',
	},
	support: {
		title: 'Доработка и обслуживание сайтов — Виктор Мацаков',
		description: `Доработка и техническое обслуживание сайтов: исправление ошибок, новые функции, резервные копии и контроль доступности. Обслуживание от ${SUPPORT_PACKAGES[0].price} в месяц.`,
	},
	agencies: {
		title: 'Сотрудничество с агентствами и студиями — Виктор Мацаков',
		description: `Фронтенд, анимации и бэкенд для агентств и студий: по готовому дизайну или в существующем проекте, белый лейбл, ваш репозиторий. ${agencies?.priceFrom ?? ''} или по смете.`,
	},
}
