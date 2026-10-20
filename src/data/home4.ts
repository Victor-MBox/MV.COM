import type { Headline } from '../components/sectionHead/SectionHead'
import { HR_BLOCK, PROOF } from './home'
import { parseStat } from './home3'
import type { StatItem } from './home3'
import { EXPERIENCE } from './experience'
import { OFFERS } from './offers'
import { PROJECTS } from './projects'

/**
 * Данные главной `/home4` по docs/design-spec-home4.md (композиция Portilo, навигация в верхней шапке).
 * Всё, что есть в других файлах `src/data`, берётся оттуда (HERO_OFFER, INTENTS, FORM_COPY, parseStat — из home3.ts);
 * здесь только новые строки. Пометка `TODO (владелец)` — текст-плейсхолдер из ТЗ, который владелец утверждает или меняет.
 */

// TODO (владелец): дисплейное слово hero — «Виктор» или «Мацаков»; верхний регистр ставит CSS (§3.2)
export const NAME = 'Виктор'

export const ROLE = 'Full-stack разработчик'

// TODO (владелец): статус-пилюля hero без месяца (§5.7, решение от 19.10.2026)
export const STATUS = 'Открыт для проектов'

// TODO (владелец): слово-логотип шапки, точка после него — акцентом (§4.1); вариант «Мацаков.»
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

/** Единственная цифра hero (§6.1): PROOF[0] → { 8, ' лет', 'в разработке' } */
const [years, users] = PROOF
export const HERO_STAT: StatItem = { ...parseStat(years.value), label: years.label.split(':')[0] }

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

/** Индексы highlights главного кейса в WorkCard (§5.4): 18 000+ страниц и «Февраль 2026» */
export const CASE_FACTS = [0, 2]

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

// TODO (владелец): водяной знак финала (§5.6); верхний регистр ставит CSS
export const WATERMARK = 'Мацаков'

/** Инвертированная бегущая строка финала (§6.9): названия офферов через ✦ */
export const STRIP = OFFERS.map(o => o.title)

// TODO (владелец): заголовки двух колонок панели «Сколько стоит» (§6.5), формулировки из content.md §4.3
export const PRICING_PANEL = {
	included: 'Что входит в любой проект',
	factors: 'Что влияет на цену',
}
