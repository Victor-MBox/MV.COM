import norandomsCover from '../resources/norandoms/cover.webp'
import { NORANDOMS_STORY } from './caseStory'
import type { CaseStory } from './caseStory'
import { NORANDOMS_VIDEO } from './caseVideo'
import type { CaseVideo } from './caseVideo'
import type { StatRange } from '../components/stat/formatStat'
import type { PreviewKitKey } from '../components/floatingPreview/kits'

/**
 * Число без подтверждения (нет источника, даты замера или методики) хранится в данных, но публично не выводится:
 * в поле — чего не хватает. Убрать поле, когда владелец подтвердит показатель
 */
type Unconfirmed = { hidden?: string }

/** Ключи показателей NoRandoms: по ним счётчики видео-рассказа берут значения из `metrics` (data/caseVideo.ts) */
export type MetricKey = 'pages' | 'indexed' | 'top10' | 'visitors' | 'signups'

export type ProjectMetric = Unconfirmed & {
	/** Ключ для ссылок из сюжета кейса: значение хранится только здесь */
	key?: MetricKey
	label: string
	/** Число или диапазон [от, до] — «300–800» */
	value: number | StatRange
	prefix?: string
	suffix?: string
	decimals?: number
}

/** Факт для широкой карточки главного кейса: срок / объём / эффект */
export type ProjectFact = Unconfirmed & {
	value: string
	label: string
}

/** Место элемента на холсте обложки (px продукта: 720×450, на телефоне 400×250 — FloatingPreview) */
export type PreviewPlacement = {
	/** Левый верхний угол элемента */
	x: number
	y: number
	/** Ширина элемента; без неё — по содержимому (логотип, кнопки) */
	width?: number
	/** Масштаб элемента от левого верхнего угла; 1 — как в продукте */
	scale?: number
}

/**
 * Слой интерактивной обложки (FloatingPreview): настоящий элемент интерфейса продукта — живая вёрстка из набора
 * `kit` (components/floatingPreview/kits.tsx), не скриншот. Порядок в массиве — от дальнего слоя к ближнему (он же
 * порядок появления)
 */
export type PreviewLayer = PreviewPlacement & {
	/** Ключ элемента в наборе */
	element: string
	/** Что это за элемент — для тестов и документации; подпись для диктора — у сцены */
	name: string
	/** Глубина 0 (далеко) … 1 (близко): амплитуда параллакса, размах и скорость покачивания */
	depth: number
	/** Главная карточка композиции — самая крупная, остаётся на телефоне */
	main?: boolean
	/** Раскладка на телефоне; слой без неё на узкой сцене скрыт */
	phone?: PreviewPlacement
}

export type ProjectPreview = {
	/** Набор элементов продукта: стили, шрифты, вёрстка */
	kit: PreviewKitKey
	/** Подпись сцены для диктора (role="img") */
	label: string
	layers: PreviewLayer[]
}

/**
 * «91% в топ-10 Яндекса»: значение владельца от 28.10.2026, подтверждение — скриншоты Яндекс Вебмастера. Когда владелец
 * их загрузит — убрать поле `hidden` у показателя и факта и записать дату и источник
 */
const TOP10_HIDDEN = 'ждём скриншоты Яндекс Вебмастера от владельца'

/** Показатель можно выводить на сайте */
export const isPublic = (item: Unconfirmed) => !item.hidden

export type Project = {
	slug: string
	title: string
	/** Подзаголовок страницы кейса */
	tagline: string
	/** Тип проекта — подпись карточки на главной */
	kind: string
	/** Описание для карточки на главной: что за проект и моя роль, без чисел */
	summary: string
	/** Одна строка для карточки: что сделал → результат. Без чисел, числа — в highlights */
	line: string
	/** Три факта для широкой карточки главного кейса (главная, портфолио, «Обо мне») */
	highlights?: ProjectFact[]
	client: string
	year: number
	role: string
	duration: string
	stack: string[]
	categories: string[]
	link?: string
	cover: string
	/** Интерактивная обложка карточки на главной (ТЗ от 22.10.2026); без неё карточка показывает `cover` */
	preview?: ProjectPreview
	/**
	 * Сюжет страницы кейса (22.10.2026): главы слева, залипшие ноутбук и телефон справа с экранами продукта — `CaseStory`.
	 * Без него страница показывает обложку, «Коротко» и цифры
	 */
	story?: CaseStory
	/**
	 * Видео-рассказ страницы кейса (28.10.2026, ТЗ docs/norandoms-scroll-video-spec.md): главы слева, справа залипшее видео,
	 * которое прокрутка двигает кадр в кадр, — `CaseVideo`. Важнее `story`: без поля страница снова показывает `CaseStory`
	 */
	video?: CaseVideo
	/** «Коротко»: задача, что сделал, результат — по 2–3 предложения, без повторения цифр (кейс без сюжета) */
	task: string
	solution: string
	result: string
	/** Единственное место с числами на странице кейса, кроме строки в шапке */
	metrics: ProjectMetric[]
	featured?: boolean
	/** Статус в шапке, например «В продакшене» */
	status?: string
}

export const PROJECTS: Project[] = [
	{
		slug: 'norandoms',
		title: 'NoRandoms',
		tagline: 'Сервис поиска напарников для онлайн-игр. Собственный продукт: от проектирования до запуска и дальнейшего развития.',
		kind: 'Сервис поиска напарников для онлайн-игр',
		summary:
			'Собственный продукт. Спроектировал и разработал платформу: профили пользователей, поиск по предпочтениям, группы и общение. Продолжаю развивать сервис после запуска.',
		line: 'Платформа для геймеров с нуля: от идеи до продакшена в одиночку, аудитория из поиска без рекламы',
		highlights: [
			{ value: '17 000+', label: 'страниц под игры и форматы' },
			{ value: '91%', label: 'проиндексированных страниц в топ-10 Яндекса', hidden: TOP10_HIDDEN },
			{ value: 'Февраль 2026', label: 'запуск, развивается' },
		],
		client: 'Собственный продукт',
		year: 2026,
		role: 'Основатель, проектирование, дизайн и разработка',
		duration: 'Запуск в феврале, развивается',
		status: 'В продакшене',
		stack: [
			'PHP',
			'Laravel',
			'MySQL',
			'Laravel Reverb',
			'Alpine.js',
			'React',
			'Vite',
			'SCSS',
			'WebRTC',
			'Steam OpenID',
			'Telegram Bot API',
			'Nginx',
		],
		categories: ['Веб-разработка', 'Собственный продукт', 'SEO'],
		link: 'https://norandoms.team',
		cover: norandomsCover,
		preview: {
			kit: 'norandoms',
			label: 'Интерфейс NoRandoms: логотип, преимущества сервиса, карточка игры, анкета игрока и кнопки «Сбор пати» и «Анкеты игроков»',
			layers: [
				// Пункт полосы преимуществ первого экрана — дальний план, справа сверху
				{ element: 'benefit', name: 'Преимущество: встроенный голосовой чат', x: 366, y: 46, depth: 0.15 },
				// Логотип из сайдбара — слева сверху
				{ element: 'logo', name: 'Логотип NoRandoms', x: 30, y: 34, depth: 0.3, phone: { x: 226, y: 22, scale: 0.7 } },
				// Карточка игры из ленты главной — главная, слева
				{
					element: 'game',
					name: 'Карточка игры Counter-Strike 2',
					x: 44,
					y: 124,
					width: 250,
					depth: 0.5,
					main: true,
					phone: { x: 16, y: 16, width: 200 },
				},
				// Анкета игрока в игре — справа, чуть выше карточки игры
				{ element: 'player', name: 'Анкета игрока', x: 326, y: 110, width: 300, depth: 0.7 },
				// Кнопки первого экрана — ближний слой, внизу между карточками
				{ element: 'actions', name: 'Кнопки «Сбор пати» и «Анкеты игроков»', x: 214, y: 364, depth: 1, phone: { x: 106, y: 202, scale: 0.85 } },
			],
		},
		task: 'Игроки ищут напарников в Discord и случайных чатах и получают случайных людей. Нужен сервис, где подбор идёт по формату игры: время, голос, стиль, отношение к ошибкам. И вывести его в поиск без бюджета на рекламу.',
		solution:
			'Спроектировал и собрал платформу в одиночку: профили с предпочтениями и 13 фильтров, система совместимости, пати с чатом и голосом в браузере, вход через Steam, уведомления в Telegram. Параллельно построил SEO-ядро: страницы под каждую игру и формат генерируются из данных, с перелинковкой и автоматическими sitemap.',
		result: 'Проект запущен и развивается. На платформе работают профили пользователей, поиск напарников и инструменты общения.',
		// Свежий набор владельца от 28.10.2026 (ТЗ видео-рассказа §7.5): заменил 6 000+ пользователей, 18 000+ страниц,
		// 92% и 500+ посетителей. Счётчики главы SEO берут значения отсюда по `key`
		metrics: [
			{ key: 'pages', label: 'Страниц на сайте', value: 17000, suffix: '+' },
			{ key: 'indexed', label: 'Страниц в индексе', value: 5000, suffix: '+' },
			{ key: 'top10', label: 'Из них в топ-10 Яндекса', value: 91, suffix: '%', hidden: TOP10_HIDDEN },
			{ key: 'visitors', label: 'Посетителей в день', value: [300, 800] },
			{ key: 'signups', label: 'Регистраций в день без рекламы', value: [50, 70] },
		],
		story: NORANDOMS_STORY,
		video: NORANDOMS_VIDEO,
		featured: true,
	},
]

export const PROJECT_CATEGORIES = Array.from(
	new Set(PROJECTS.flatMap(p => p.categories))
)

export function getProject(slug: string | undefined) {
	return PROJECTS.find(p => p.slug === slug)
}

/** Соседние кейсы по кругу. Если проект один — оба undefined, чтобы не ссылаться на себя */
export function getAdjacentProjects(slug: string) {
	const i = PROJECTS.findIndex(p => p.slug === slug)
	if (i === -1 || PROJECTS.length < 2) return { prev: undefined, next: undefined }
	return {
		prev: PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length],
		next: PROJECTS[(i + 1) % PROJECTS.length],
	}
}
