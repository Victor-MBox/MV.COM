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

export type ProjectMetric = {
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
export type ProjectFact = {
	value: string
	label: string
}

export type Project = {
	slug: string
	title: string
	/** Одна строка с главным результатом — подзаголовок страницы кейса */
	tagline: string
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
		tagline:
			'Сервис подбора напарников по играм. Собственный продукт с нуля, который растёт из поиска без рекламы',
		line: 'Платформа для геймеров с нуля: от идеи до продакшена в одиночку, аудитория из поиска без рекламы',
		highlights: [
			{ value: '18 000+', label: 'страниц под игры и форматы' },
			{ value: '92%', label: 'проиндексированных страниц в топ-10 Яндекса' },
			{ value: 'Февраль 2026', label: 'запуск, развивается' },
		],
		client: 'Собственный продукт',
		year: 2026,
		role: 'Основатель, дизайн и full-stack разработка',
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
		result: 'За восемь месяцев после запуска платформа набрала аудиторию и стабильный поток из органического поиска. Цифры ниже. Блог с постами и комментариями готов к релизу.',
		metrics: [
			{ label: 'Зарегистрированных пользователей', value: 6000, suffix: '+' },
			{ label: 'Страниц на платформе', value: 18000, suffix: '+' },
			{ label: 'Страниц в топ-10 Яндекса', value: 92, suffix: '%' },
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
