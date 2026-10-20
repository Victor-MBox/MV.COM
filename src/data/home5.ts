import { PROOF } from './home'
import { offerPath } from './offers'
import { PROJECTS } from './projects'
import { POSTS } from './posts'

/**
 * Данные главной `/home5` — редизайн по ТЗ «Minimal editorial / premium developer portfolio» (20.10.2026).
 * Тексты взяты из ТЗ дословно; всё, что уже есть в других файлах `src/data` (PROOF, PROJECTS, POSTS, CONTACT_LINKS),
 * читается оттуда. Верхний регистр подписей ставит CSS, в данных — обычный регистр.
 */

export const HOME5_PATH = '/home5'

export const PERSON = {
	name: 'Виктор Мацаков',
	role: 'Веб-разработчик',
	/** Логотип шапки и футера; точка после букв — акцентом */
	logo: 'VM',
}

/** ТЗ §18: title и description главной; index.html держит те же значения как дефолт для всего сайта */
export const META = {
	title: 'Виктор Мацаков — разработка сайтов и веб-сервисов',
	description:
		'Разработка сайтов, веб-сервисов, API-интеграции и запуск MVP. WordPress, Laravel, 1С-Битрикс. Виктор Мацаков — веб-разработчик.',
}

/** Ссылки шапки и футера (ТЗ §7, §15). Пути проверяются тестом по ROUTE_PATHS */
export const NAV = [
	{ label: 'Проекты', to: '/portfolio' },
	{ label: 'Услуги', to: '/services' },
	{ label: 'Обо мне', to: '/about' },
	{ label: 'Блог', to: '/blog' },
	{ label: 'Контакты', to: '/contacts' },
] as const

// TODO (владелец): поставить true, когда в posts.ts появятся реальные статьи (ТЗ §13: без реального контента секция и пункт меню скрыты).
// В dev-режиме секция видна всегда, чтобы оценить вёрстку; в production — только с этим флагом
export const BLOG_PUBLISHED = false
export const BLOG_VISIBLE = BLOG_PUBLISHED || import.meta.env.DEV

/** Пункты навигации с учётом видимости блога */
export function navItems() {
	return NAV.filter(item => item.to !== '/blog' || BLOG_VISIBLE)
}

/** Подписи секций «01 / Проекты» и якоря (ТЗ §9–14) */
export const SECTIONS = {
	projects: { num: '01', label: 'Проекты', id: 'projects' },
	services: { num: '02', label: 'Услуги', id: 'services' },
	process: { num: '03', label: 'Процесс', id: 'process' },
	about: { num: '04', label: 'Обо мне', id: 'about' },
	blog: { num: '05', label: 'Блог', id: 'blog' },
	contact: { num: '06', label: 'Контакты', id: 'contact' },
} as const

// ---------- Hero (ТЗ §8) ----------
export const HERO = {
	kicker: 'Full-stack разработчик',
	/** Строки H1; вторая — акцентом */
	title: ['Один разработчик.', 'Весь проект.'],
	accentLine: 1,
	subtitle: 'Разрабатываю сайты и веб-сервисы, подключаю API и запускаю MVP — от идеи до работающего результата.',
	primary: 'Обсудить проект',
	secondary: 'Смотреть работы',
	/** Одна компактная строка с двумя подтверждёнными фактами (ТЗ §8 «Статистика»): значения — из PROOF (home.ts) */
	facts: [
		{ value: PROOF[0].value, label: 'в разработке' },
		{ value: PROOF[1].value, label: 'пользователей NoRandoms' },
	],
}

// ---------- Проекты (ТЗ §9) ----------
export const PROJECTS_HEAD = {
	title: ['Реальные проекты,', 'а не просто слова.'],
	lead: 'Сайты, веб-сервисы и интеграции для конкретных задач. Несколько примеров моей работы.',
	action: 'Все проекты',
	more: 'Смотреть кейс',
}

/** Главный кейс: короткое описание и три технологии из ТЗ — вместо полного стека из PROJECTS */
export const FEATURED_CASE = {
	slug: 'norandoms',
	description: 'Веб-сервис для поиска игроков, общения и формирования команд.',
	tech: ['Laravel', 'JavaScript', 'API'],
}

/** Сколько дополнительных кейсов показывать рядом с главным (ТЗ §9: ещё 1–2 настоящих проекта) */
export const SIDE_PROJECTS_MAX = 2

export function featuredProject() {
	return PROJECTS.find(p => p.slug === FEATURED_CASE.slug) ?? PROJECTS.find(p => p.featured) ?? PROJECTS[0]
}

/** Дополнительные проекты — только реальные записи PROJECTS; пока их нет, колонка не рендерится */
export function sideProjects() {
	const main = featuredProject()
	return PROJECTS.filter(p => p.slug !== main?.slug).slice(0, SIDE_PROJECTS_MAX)
}

// ---------- Услуги (ТЗ §10): три направления, не технологии ----------
export const SERVICES_HEAD = {
	title: 'Чем могу помочь',
	lead: 'Разработка, интеграции и запуск новых проектов под конкретные задачи бизнеса.',
	more: 'Подробнее',
}

export const HOME_SERVICES = [
	{
		num: '01',
		title: 'Сайты и веб-сервисы',
		text: 'От корпоративного сайта до полноценного веб-приложения. Разрабатываю интерфейсы, функциональность и удобные инструменты управления.',
		to: '/services',
	},
	{
		num: '02',
		title: 'Интеграции и доработки',
		text: 'Подключаю CRM, платёжные системы и другие сервисы через API. Автоматизирую процессы и развиваю существующие проекты.',
		to: offerPath({ key: 'integrations' }),
	},
	{
		num: '03',
		title: 'MVP и нестандартные проекты',
		text: 'Помогаю определить необходимый функционал, разработать первую рабочую версию продукта и подготовить её к запуску.',
		to: offerPath({ key: 'web-service' }),
	},
]

// ---------- Процесс (ТЗ §11). Формулировки ТЗ; подробный PROCESS из experience.ts остаётся на /services и офферах ----------
export const PROCESS_HEAD = {
	title: ['От задачи', 'до запуска.'],
	lead: 'Прозрачный и понятный процесс на каждом этапе.',
}

export const PROCESS_STEPS = [
	{ num: '01', title: 'Обсуждаем', text: 'Разбираюсь в задаче, целях и ограничениях проекта.' },
	{ num: '02', title: 'Планируем', text: 'Предлагаю решение, определяю объём работ и этапы.' },
	{ num: '03', title: 'Разрабатываю', text: 'Реализую функциональность и показываю промежуточный результат.' },
	{ num: '04', title: 'Запускаем', text: 'Проверяем работу сайта или сервиса и готовим его к использованию.' },
]

// ---------- Обо мне (ТЗ §12). Без чисел: факты уже стоят в hero ----------
export const ABOUT = {
	title: 'Привет, я Виктор.',
	paragraphs: [
		'Я веб-разработчик. Создаю сайты, веб-сервисы и интеграции, помогаю запускать новые проекты и развивать существующие.',
		'Работаю напрямую с заказчиком: от обсуждения задачи до её технической реализации.',
	],
	cta: 'Больше обо мне',
	stack: ['Laravel', 'WordPress', '1С-Битрикс', 'React', 'API'],
}

// ---------- Блог (ТЗ §13) ----------
export const BLOG_HEAD = {
	title: 'Пишу о разработке',
	lead: 'Практические заметки о сайтах, технологиях и решениях из реальных проектов.',
	action: 'Все статьи',
}

export const BLOG_LIMIT = 3

/** Три последние статьи по дате публикации */
export function latestPosts() {
	return [...POSTS].sort((a, b) => Date.parse(b.date) - Date.parse(a.date)).slice(0, BLOG_LIMIT)
}

// ---------- Финальный CTA (ТЗ §14) ----------
export const CONTACT_HEAD = {
	title: ['Есть задача?', 'Давайте обсудим.'],
	lead: 'Расскажите, что хотите сделать. Помогу разобраться с технической частью и предложу следующий шаг.',
	cta: 'Написать Виктору',
}

// TODO (владелец): оставить только реальные каналы (значения — в contacts.ts, см. code.md §11)
export const CONTACT_CHANNELS = ['telegram', 'email', 'github', 'linkedin'] as const

export type ContactChannel = (typeof CONTACT_CHANNELS)[number]

export const CHANNEL_LABELS: Record<ContactChannel, string> = {
	telegram: 'Telegram',
	email: 'Email',
	github: 'GitHub',
	linkedin: 'LinkedIn',
}

// ---------- Footer (ТЗ §15) ----------
export const FOOTER = {
	description: 'Веб-разработчик. Сайты, интеграции и веб-сервисы.',
	// Страницы политик пока нет (code.md §12) — ссылка ведёт на «#», как в остальных футерах
	privacy: { label: 'Политика конфиденциальности', href: '#' },
}
