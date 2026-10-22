import norandomsCover from '../resources/norandoms/cover.webp'
import norandomsHome from '../resources/norandoms/home-hero.webp'
import norandomsGames from '../resources/norandoms/games.webp'
import norandomsGame from '../resources/norandoms/game-cs2.webp'
import norandomsTeammates from '../resources/norandoms/teammates.webp'
import norandomsParties from '../resources/norandoms/parties.webp'
import norandomsPartiesList from '../resources/norandoms/parties-list.webp'
import norandomsParty from '../resources/norandoms/party-valheim.webp'
import norandomsVoice from '../resources/norandoms/home-voice.webp'
import norandomsSteam from '../resources/norandoms/home-steam.webp'
import norandomsMobile from '../resources/norandoms/mobile.webp'
import previewParty from '../resources/norandoms/preview/party-row.webp'
import previewGame from '../resources/norandoms/preview/game-card.webp'
import previewPlayer from '../resources/norandoms/preview/player-card.webp'
import previewSteam from '../resources/norandoms/preview/steam-row.webp'

/**
 * Число без подтверждения (нет источника, даты замера или методики) хранится в данных, но публично не выводится:
 * в поле — чего не хватает. Убрать поле, когда владелец подтвердит показатель
 */
type Unconfirmed = { hidden?: string }

export type ProjectMetric = Unconfirmed & {
	label: string
	value: number
	prefix?: string
	suffix?: string
	decimals?: number
}

export type ProjectFeature = {
	title: string
	text: string
}

export type ProjectStep = {
	title: string
	text: string
}

/** Факт для широкой карточки главного кейса: срок / объём / эффект */
export type ProjectFact = Unconfirmed & {
	value: string
	label: string
}

/** Раскладка слоя на телефоне (≤560): проценты сцены, как у основной */
export type PreviewPlacement = {
	/** Ширина в % ширины сцены */
	width: number
	/** Отступ слева в % ширины сцены */
	left: number
	/** Отступ сверху в % высоты сцены */
	top: number
}

/**
 * Слой интерактивной обложки (FloatingPreview): настоящий элемент интерфейса продукта — вырезка из скриншота
 * с альфа-маской по форме углов. Сцена 16:10, позиции и ширина — в процентах сцены (от базы 705×440);
 * высота — из пропорций картинки `w`/`h`. Порядок в массиве — от дальнего слоя к ближнему (он же порядок появления)
 */
export type PreviewLayer = PreviewPlacement & {
	src: string
	/** Что это за элемент — для тестов и документации; на сцене картинки с пустым alt, подпись — у сцены */
	name: string
	/** Размер файла в px (атрибуты width/height — без скачка раскладки до загрузки) */
	w: number
	h: number
	/** Глубина 0 (далеко) … 1 (близко): амплитуда параллакса, размах и скорость покачивания */
	depth: number
	/** Главная карточка композиции — самая крупная, остаётся на телефоне */
	main?: boolean
	/** Раскладка на телефоне; слой без неё на ≤560 скрыт */
	phone?: PreviewPlacement
}

export type ProjectPreview = {
	/** Подпись сцены для диктора (role="img") */
	label: string
	layers: PreviewLayer[]
}

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
	gallery: { src: string; caption: string }[]
	/** Два скриншота для блока главного кейса на главной: большой сверху справа, малый снизу слева */
	showcase?: { src: string; alt: string }[]
	/** Блок «Коротко»: задача, что сделал, результат — по 2–3 предложения, без повторения цифр */
	task: string
	solution: string
	result: string
	/** Единственное место с числами на странице кейса, кроме строки в шапке */
	metrics: ProjectMetric[]
	featured?: boolean
	// Необязательные блоки для больших кейсов — рендерятся в аккордеоне «Как это устроено технически»
	status?: string // статус в шапке, например «В продакшене»
	features?: ProjectFeature[] // «Что внутри»: модули продукта
	scheme?: string[] // «Путь пользователя»: узлы для FlowScheme
	process?: ProjectStep[] // этапы работы
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
			{ value: '18 000+', label: 'страниц под игры и форматы' },
			{
				value: '92%',
				label: 'проиндексированных страниц в топ-10 Яндекса',
				hidden: 'нет даты замера, источника и методики (какие страницы и запросы, каким инструментом)',
			},
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
			label: 'Интерфейс NoRandoms: объявление о сборе пати, карточка игры, анкета игрока и статистика Steam',
			layers: [
				// Пати Call of Duty — широкая строка на заднем плане, сверху: заголовок и создатель видны, низ уходит под карточки
				{ src: previewParty, name: 'Объявление о сборе пати', w: 1456, h: 250, width: 86, left: 5, top: 4.5, depth: 0.2 },
				// Карточка игры PEAK — главная, слева от центра
				{
					src: previewGame,
					name: 'Карточка игры',
					w: 635,
					h: 705,
					width: 38,
					left: 15,
					top: 19.5,
					depth: 0.5,
					main: true,
					phone: { width: 50, left: 4, top: 6 },
				},
				// Анкета игрока — справа, целиком видна
				{
					src: previewPlayer,
					name: 'Анкета игрока',
					w: 640,
					h: 522,
					width: 34,
					left: 57,
					top: 38,
					depth: 0.7,
					phone: { width: 44, left: 54, top: 30 },
				},
				// Строка статистики Steam — ближний слой, поверх нижнего края карточки игры
				{ src: previewSteam, name: 'Статистика Steam', w: 757, h: 141, width: 36, left: 9, top: 84, depth: 1 },
			],
		},
		showcase: [
			{ src: norandomsHome, alt: 'Главная NoRandoms: поиск тиммейтов и пати' },
			{ src: norandomsParties, alt: 'Сбор пати в NoRandoms' },
		],
		gallery: [
			{ src: norandomsHome, caption: 'Главная: поиск тиммейтов и пати, живые счётчики по играм' },
			{ src: norandomsGames, caption: 'Каталог игр: кто ищет пати, у скольких игра есть в Steam, активные пати' },
			{ src: norandomsGame, caption: 'Страница игры: SEO-посадочная с игроками, пати и FAQ' },
			{ src: norandomsTeammates, caption: 'Анкеты игроков: статус, Steam, устройства и фильтры подбора' },
			{ src: norandomsParties, caption: 'Сбор пати: быстрое объявление или комната с чатом и голосом' },
			{ src: norandomsPartiesList, caption: 'Список пати: состав, возраст, микрофон, стиль, заявка в один клик' },
			{ src: norandomsParty, caption: 'Комната пати: чат в реальном времени и голосовой созвон' },
			{ src: norandomsVoice, caption: 'Голосовой чат в браузере без Discord' },
			{ src: norandomsSteam, caption: 'Интеграция со Steam и уведомления в Telegram' },
			{ src: norandomsMobile, caption: 'Мобильная версия: нижняя навигация и те же сценарии на телефоне' },
		],
		task: 'Игроки ищут напарников в Discord и случайных чатах и получают случайных людей. Нужен сервис, где подбор идёт по формату игры: время, голос, стиль, отношение к ошибкам. И вывести его в поиск без бюджета на рекламу.',
		solution:
			'Спроектировал и собрал платформу в одиночку: профили с предпочтениями и 13 фильтров, система совместимости, пати с чатом и голосом в браузере, вход через Steam, уведомления в Telegram. Параллельно построил SEO-ядро: страницы под каждую игру и формат генерируются из данных, с перелинковкой и автоматическими sitemap.',
		result: 'Проект запущен и развивается. На платформе работают профили пользователей, поиск напарников и инструменты общения.',
		metrics: [
			{ label: 'Зарегистрированных пользователей', value: 6000, suffix: '+' },
			{ label: 'Страниц на платформе', value: 18000, suffix: '+' },
			{
				label: 'Страниц в топ-10 Яндекса',
				value: 92,
				suffix: '%',
				hidden: 'нет даты замера, источника и методики (какие страницы и запросы, каким инструментом)',
			},
			{ label: 'Посетителей в день из поиска', value: 500, suffix: '+' },
		],
		features: [
			{
				title: 'Каталог игр и SEO-страницы',
				text: 'Под каждую игру и формат поиска генерируется своя страница с игроками, пати и FAQ. Это главный источник органического трафика.',
			},
			{
				title: 'Анкеты игроков и фильтры',
				text: 'Профиль с предпочтениями и фильтры: игра, возраст, микрофон, стиль, устройства, время, длина сессии, каналы связи, отношение к токсичности и ошибкам.',
			},
			{
				title: 'Система совместимости',
				text: 'Сравнение аккаунтов по общим играм, расписанию, стилю и формату общения: сервис показывает, с кем действительно по пути, а не просто «кто онлайн».',
			},
			{
				title: 'Пати и объявления',
				text: 'Два формата сбора: быстрое объявление «зашёл и играй» и полноценная комната с заявками, составом, правилами и планированием сессии.',
			},
			{
				title: 'Чат и голос в браузере',
				text: 'Текстовый чат пати в реальном времени и голосовой созвон в один клик без Discord: ПК, телефон, Steam Deck, проверка микрофона перед входом.',
			},
			{
				title: 'Steam и другие сервисы',
				text: 'Вход через Steam без пароля, импорт библиотеки игр, привязка Telegram. Счётчики «есть в Steam у N игроков» считаются по реальным библиотекам.',
			},
			{
				title: 'Уведомления в Telegram',
				text: 'Заявки, приглашения, изменения состава и времени пати приходят в бота. Включается в один клик, без спама.',
			},
			{
				title: 'Друзья, сообщения, отзывы',
				text: 'Список друзей, личная переписка, отзывы после совместной игры и жалобы из профиля. Модерация со строгими правилами: ограничение, затем бан.',
			},
			{
				title: 'Блог и админка',
				text: 'Блог с постами, лайками и комментариями уже реализован и ждёт релиза. Административная панель для управления контентом и модерации.',
			},
		],
		scheme: [
			'Вход через Steam',
			'Профиль и предпочтения',
			'Фильтры и совместимость',
			'Пати или объявление',
			'Чат и голос',
			'Отзывы и репутация',
		],
		process: [
			{
				title: 'Идея и исследование',
				text: 'Разобрал, как игроки ищут напарников в Discord и чатах и почему это раздражает. Сформулировал ядро продукта: подбор по формату игры, а не случайность.',
			},
			{
				title: 'Архитектура и данные',
				text: 'Спроектировал модель: пользователи, игры, предпочтения, пати, заявки, сообщения, отзывы. Ядро на Laravel, живые обновления через WebSockets (Laravel Reverb), интерактивные модули на Alpine.js и React.',
			},
			{
				title: 'Ядро платформы',
				text: 'Регистрация по почте и через Steam, профили с предпочтениями, каталог игр с импортом из Steam, анкеты с фильтрами, друзья и личные сообщения.',
			},
			{
				title: 'Пати, чат и голос',
				text: 'Комнаты пати с заявками и составом, объявления, чат в реальном времени, голосовой созвон в браузере, Telegram-бот с уведомлениями.',
			},
			{
				title: 'SEO как канал роста',
				text: 'Шаблоны страниц под каждую игру и формат, метаданные и перелинковка, индексные sitemap, которые пересобираются автоматически. Поиск стал главным каналом роста без бюджета на рекламу.',
			},
			{
				title: 'Запуск и рост',
				text: 'Бета открыта в феврале. Дальше: аналитика, модерация и правила, обратная связь от игроков, блог и подготовка к полному релизу осенью.',
			},
		],
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
