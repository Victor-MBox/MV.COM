import { HR_BLOCK, PROOF } from './home'
import { HERO_SUBTITLE } from './home2'
import { EXPERIENCE, PROCESS } from './experience'
import { AFTER_LAUNCH, PRICING } from './pricing'

/**
 * Данные главной `/home3` по docs/design-spec.md (дизайн-система 1.0). Всё, что есть в других файлах
 * `src/data`, берётся оттуда; здесь только новые строки. Пометка `TODO (владелец)` — текст-плейсхолдер
 * из вариантов ТЗ, который владелец утверждает или меняет (§14).
 */

export type Headline = { text: string; accent?: string }

export type StatItem = { value: number | string; suffix?: string; label: string }

/** «18 000+» → { value: 18000, suffix: '+' }; «8 лет» → { 8, ' лет' }; «Февраль 2026» остаётся строкой */
export function parseStat(raw: string): { value: number | string; suffix: string } {
	const m = raw.match(/^(\d(?:[\d\s]*\d)?)(.*)$/) // \s покрывает и неразрывные пробелы между разрядами
	if (!m) return { value: raw, suffix: '' }
	return { value: Number(m[1].replace(/\s/g, '')), suffix: m[2] }
}

// TODO (владелец): девиз hero (§7.1) — выбран «Один разработчик. Весь проект.», разбивка по строкам ручная
export const MOTTO = ['Один разработчик.', 'Весь проект.']

/** Теги с точками под девизом (§7.1) */
export const HERO_TAGS = ['сайты', 'веб-приложения', 'интеграции']

/** H1-абзац hero: HERO_SUBTITLE, где последняя фраза — отдельной акцентной строкой (§7.1) */
const sentences = HERO_SUBTITLE.match(/[^.]+\.\s*/g) ?? [HERO_SUBTITLE]
export const HERO_OFFER = {
	lead: sentences.slice(0, -1).join('').trim(),
	accent: sentences[sentences.length - 1].trim(),
}

/** Ряд цифр hero (§7.1): PROOF, второй факт разбит на два. Подписи — из тех же строк */
const [years, users] = PROOF
const [usersLabel, visitorsRaw] = users.label.split(' и ')
const visitorsMatch = visitorsRaw.match(/^(\S+)\s+(.*)$/)
export const HERO_STATS: StatItem[] = [
	{ ...parseStat(years.value), label: years.label.split(':')[0] },
	{ ...parseStat(users.value), label: usersLabel },
	{ ...parseStat(visitorsMatch?.[1] ?? visitorsRaw), label: visitorsMatch?.[2] ?? '' },
]

// TODO (владелец): H2 секций — варианты из §7.2–7.7, в каждом не больше одного акцента
export const H2: Record<'services' | 'work' | 'process' | 'hr' | 'blog' | 'faq' | 'contact', Headline> = {
	services: { text: 'Семь задач, которые беру под ключ', accent: 'под ключ' },
	work: { text: 'Главный кейс — собственный продукт', accent: 'собственный продукт' },
	process: { text: 'Четыре шага без сюрпризов', accent: 'без сюрпризов' },
	hr: { text: HR_BLOCK.title, accent: 'тимлидов' },
	blog: { text: 'Пишу о том, что делаю' },
	faq: { text: 'Что спрашивают до старта', accent: 'до старта' },
	contact: { text: 'Расскажите о задаче' },
}

/** Три крупные карточки услуг с мини-интерфейсами (§7.2); остальные четыре — строками */
export const FEATURED_OFFERS = ['web-service', 'ecommerce', 'integrations'] as const
export const ROW_OFFERS = ['landing', 'corporate', 'support', 'agencies'] as const

// TODO (владелец): подписи четырёх счётчиков финала (§7.8). Значения привязаны к источникам тестом home3.test.ts
export const FINAL_STATS: (StatItem & { source: string })[] = [
	{ value: 20, suffix: '+', label: 'проектов запущено', source: EXPERIENCE[0].details[0] },
	{ value: 30, label: 'минут — первый созвон', source: PROCESS[0].text },
	{ value: 2, label: 'рабочих дня до сметы', source: PRICING.estimate },
	{ value: 1, label: 'месяц правок после запуска включён', source: AFTER_LAUNCH },
]

// TODO (владелец): бегущая строка-CTA перед формой (§7.8)
export const CTA_MARQUEE = ['Давайте работать', 'Обсудить проект']

export type IntentKey = 'project' | 'job' | 'question'

// TODO (владелец): подписи намерений в форме (§6.13)
export const INTENTS: { key: IntentKey; label: string }[] = [
	{ key: 'project', label: 'Проект' },
	{ key: 'job', label: 'Вакансия или контракт' },
	{ key: 'question', label: 'Вопрос' },
]

/** Формат работы для намерения «Вакансия» (§6.13); уходит в ContactPayload.topic как «Вакансия: контракт» */
export const JOB_FORMATS = ['проектно', 'контракт', 'удалённо в штат']

// TODO (владелец): тексты формы (§6.13, §7.8)
export const FORM_COPY = {
	lead: 'Отвечу в течение двух рабочих дней',
	success: 'Заявка ушла. Отвечу в течение двух рабочих дней.',
	/** «Что будет дальше» под кнопкой — три строки моно */
	next: ['отвечу за 2 рабочих дня', 'созвон 30 минут', 'смета и срок'],
}
