import type { Headline } from '../components/sectionHead/SectionHead'
import type { StatItem } from '../components/stat/Stat'
import { parseStat } from '../components/stat/formatStat'
import type { WorkCardData } from '../components/workCard/WorkCard'
import type { CoverArtVariant } from '../components/coverArt/CoverArt'
import { EXPERIENCE } from './experience'
import { OFFERS, getOffer, offerPath } from './offers'
import { PROJECTS } from './projects'
import type { ProjectFact } from './projects'

/**
 * Данные главной (docs/design-spec-home4.md — композиция Portilo; с 20.10.2026 единственная главная сайта) и общие
 * строки, которые читают внутренние страницы (PROOF, WHY_ME, HR_BLOCK). Всё, что есть в других файлах `src/data`,
 * берётся оттуда; здесь только новые строки. Пометка `TODO (владелец)` — плейсхолдер из ТЗ, который владелец утверждает или меняет.
 * Правки владельца от 20.10.2026: имя полностью в две строки, без статус-пилюли, без города и часового пояса,
 * слайдер работ с примерами-плейсхолдерами.
 */

// ---------- Общие строки (content.md §4.1, §4.5, §4.6) ----------

/** Два настоящих числа (content.md §4.1): hero и счётчики главной, карточки кейса */
export const PROOF = [
	{
		value: '8 лет',
		label: 'в разработке: от лендингов до собственного продукта',
	},
	{
		value: '6 000+',
		label:
			'пользователей NoRandoms и 500+ посетителей в день из поиска без рекламы',
	},
]

/** Строка для HR мелким текстом: стек и формат работы. Без города — решение владельца от 20.10.2026 */
export const HR_LINE = {
	stack: 'Laravel · React · TypeScript · WordPress',
	place: 'удалённо',
}

/** «Почему со мной»: четыре ответа на страхи клиента */
export const WHY_ME = [
	{
		title: 'Один исполнитель на весь проект',
		text: 'Дизайн, фронтенд, бэкенд, SEO, сервер. Без менеджеров и передачи задачи из рук в руки.',
	},
	{
		title: 'Цена и срок до старта',
		text: 'Фиксирую состав работ, оплата по этапам. Сюрпризов в конце нет.',
	},
	{
		title: 'Прогресс каждую неделю',
		text: 'Рабочая версия на тестовом домене, а не «покажу через два месяца».',
	},
	{
		title: 'Сайт остаётся вашим',
		text: 'Домен, хостинг, код и доступы — на ваших аккаунтах.',
	},
]

/** Пятый, доказательный пункт. Без числа: цифры NoRandoms уже стоят в счётчиках */
export const WHY_ME_PROOF =
	'Сделал и развиваю собственный продукт в продакшене — знаю, чем сайт, который приносит людей, отличается от сайта, который просто есть.'

/** Блок «Для HR и тимлидов». Без «8 лет»: этот факт уже есть в hero */
export const HR_BLOCK = {
	title: 'Для HR и тимлидов',
	text: 'Full-stack. PHP / Laravel, React / TypeScript, MySQL / PostgreSQL, WordPress, GSAP. Собственный продукт в продакшене. Открыт к проектной работе и контракту, удалённо.',
	/** Файла пока нет — заглушка, см. code.md §11 */
	cv: '/cv.pdf',
}

// ---------- Hero (§6.1) ----------

/** Дисплейное имя hero (решение владельца от 20.10.2026: «Виктор Мацаков» вместо «Виктор»); верхний регистр ставит CSS (§3.2) */
export const NAME = 'Виктор Мацаков'

/** Имя в две строки — по слову на строку (SplitLines lines) */
export const NAME_LINES = NAME.split(' ')

export const ROLE = 'Full-stack разработчик'

/** Подзаголовок-оффер (content.md §4.1); последняя фраза — отдельной акцентной строкой H1 */
export const HERO_SUBTITLE =
	'Лендинги, интернет-магазины, личные кабинеты и интеграции с CRM. Один разработчик на весь проект. Цена и срок — до старта.'

const sentences = HERO_SUBTITLE.match(/[^.]+\.\s*/g) ?? [HERO_SUBTITLE]
export const HERO_OFFER = {
	lead: sentences.slice(0, -1).join('').trim(),
	accent: sentences[sentences.length - 1].trim(),
}

/** Единственная цифра hero (§6.1): PROOF[0] → { 8, ' лет', 'в разработке' } */
const [years, users] = PROOF
export const HERO_STAT: StatItem = { ...parseStat(years.value), label: years.label.split(':')[0] }

// ---------- Шапка (§4.1) ----------

/** Имя знака для aria-label логотипа (§4.1): в шапке стоит монограмма «VM.» (`components/logo`), текст не выводится */
export const WORDMARK = 'Victor Matsakov'

/** Ссылки шапки (§4.1); «Главная» — это логотип. Пути проверяются тестом по ROUTE_PATHS */
export const NAV = [
	{ label: 'Услуги', to: '/services' },
	{ label: 'Портфолио', to: '/portfolio' },
	{ label: 'Обо мне', to: '/about' },
	{ label: 'Контакты', to: '/contacts' },
]

/** Плавающая панель соцссылок справа (§4.3) — ключи CONTACT_LINKS; пустой массив выключает панель */
export const SOCIAL = ['github', 'telegram', 'linkedin'] as const

export type SocialKey = (typeof SOCIAL)[number]

// ---------- Секции (§6.2–6.9) ----------

// TODO (владелец): H2 секций (§6.2–6.7) — в каждом либо один акцент, либо один приглушённый хвост
export const H2: Record<'process' | 'services' | 'work' | 'pricing' | 'faq' | 'hr', Headline> = {
	process: { text: 'Четыре шага от брифа до запуска', muted: 'от брифа до запуска' },
	services: { text: 'Семь задач, которые беру под ключ', accent: 'под ключ' },
	work: { text: 'Главный кейс — собственный продукт', accent: 'собственный продукт' },
	pricing: { text: 'Три формата работы и что входит в цену', muted: 'и что входит в цену' },
	faq: { text: 'Что спрашивают до старта', accent: 'до старта' },
	hr: { text: HR_BLOCK.title, accent: 'тимлидов' },
}

/** Порядок офферов в витрине-переключателе (§5.2, §6.3) */
export const SHOWCASE_ORDER = [
	'web-service',
	'ecommerce',
	'integrations',
	'landing',
	'corporate',
	'support',
	'agencies',
] as const

/**
 * Индекс обещания WHY_ME под шагом PROCESS[i] (§6.2): бриф → «Цена и срок до старта», структура → «Один исполнитель»,
 * разработка → «Прогресс каждую неделю», запуск → «Сайт остаётся вашим»
 */
export const PROCESS_WHY = [1, 0, 2, 3]

/** Индексы highlights главного кейса для карточки работы (§5.4): 18 000+ страниц и «Февраль 2026» */
export const CASE_FACTS = [0, 2]

/**
 * Пример-плейсхолдер для слайдера работ: карточка собирается из оффера (строка «что это», ссылка на страницу
 * оффера вместо несуществующего кейса), обложка — векторная CoverArt. Факты без чисел (сроки уже в витрине услуг, цифры — в 6.8)
 */
function placeholderCase(key: string, title: string, art: CoverArtVariant, facts: ProjectFact[]): WorkCardData | null {
	const offer = getOffer(key)
	if (!offer) return null
	return { slug: `example-${key}`, title, client: 'Пример', line: offer.line, art, to: offerPath(offer), highlights: facts }
}

// TODO (владелец): два примера, чтобы слайдер работал до появления второго реального кейса (решение от 20.10.2026).
// Заменить реальными кейсами в PROJECTS (шаблон content.md §4.7, при NDA — «Не публикуем») и удалить
export const WORK_PLACEHOLDERS: WorkCardData[] = [
	placeholderCase('ecommerce', 'Интернет-магазин', 'shop', [
		{ value: 'WooCommerce', label: 'каталог, корзина, оплата' },
		{ value: 'amoCRM', label: 'заказы уходят в CRM' },
	]),
	placeholderCase('corporate', 'Сайт компании', 'corporate', [
		{ value: 'WordPress', label: 'редактируете сами' },
		{ value: 'SEO', label: 'структура под поиск' },
	]),
].filter((c): c is WorkCardData => !!c)

/**
 * Лента слайдера работ (§5.4, §6.4): реальные проекты PROJECTS (главный кейс первым, факты по CASE_FACTS),
 * затем примеры-плейсхолдеры. Когда реальных кейсов станет два и больше, плейсхолдеры убрать
 */
export const WORK_SLIDES: WorkCardData[] = [
	...[...PROJECTS]
		.sort((a, b) => Number(!!b.featured) - Number(!!a.featured))
		.map(p => ({ ...p, highlights: CASE_FACTS.map(i => p.highlights?.[i]).filter((h): h is ProjectFact => !!h) })),
	...WORK_PLACEHOLDERS,
]

// TODO (владелец): подписи четырёх счётчиков (§6.8). Значения — из PROOF[1], highlights[1] NoRandoms и EXPERIENCE[0]
const [usersLabel, visitorsRaw] = users.label.split(' и ')
const visitors = visitorsRaw.match(/^(\S+)\s+(.*)$/)
const mainProject = PROJECTS.find(p => p.featured) ?? PROJECTS[0]
const topTen = mainProject.highlights?.[1]
const launched = EXPERIENCE[0].details[0].split(' ')[0] // «20+ запущенных проектов…» → «20+»
export const STATS: StatItem[] = [
	{ ...parseStat(users.value), label: usersLabel },
	{ ...parseStat(visitors?.[1] ?? visitorsRaw), label: visitors?.[2] ?? '' },
	{ ...parseStat(topTen?.value ?? ''), label: topTen?.label ?? '' },
	{ ...parseStat(launched), label: 'проектов запущено' },
]

// TODO (владелец): заголовок финала в две строки (§6.9), без акцента и верхнего регистра
export const FINAL_TITLE = ['Давайте', 'работать']

/** Мета-ряд финала (§6.9): слева формат работы вместо города (без Тбилиси и GMT — решение владельца от 20.10.2026), справа роль */
export const FINAL_META = ['Работаю удалённо', ROLE]

// TODO (владелец): водяной знак финала (§5.6); верхний регистр ставит CSS
export const WATERMARK = 'Мацаков'

/** Инвертированная бегущая строка финала (§6.9): названия офферов через ✦ */
export const STRIP = OFFERS.map(o => o.title)

// TODO (владелец): заголовки двух колонок панели «Сколько стоит» (§6.5), формулировки из content.md §4.3
export const PRICING_PANEL = {
	included: 'Что входит в любой проект',
	factors: 'Что влияет на цену',
}
