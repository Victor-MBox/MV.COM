import homeView from '../resources/norandoms/story/home-view.webp'
import homeContent from '../resources/norandoms/story/home-content.webp'
import gameView from '../resources/norandoms/story/game-view.webp'
import gameContent from '../resources/norandoms/story/game-content.webp'
import teammatesView from '../resources/norandoms/story/teammates-view.webp'
import teammatesContent from '../resources/norandoms/story/teammates-content.webp'
import partiesView from '../resources/norandoms/story/parties-view.webp'
import partiesContent from '../resources/norandoms/story/parties-content.webp'
import partyView from '../resources/norandoms/party-valheim.webp'
import filtersPanel from '../resources/norandoms/story/filters-panel.webp'
import phoneView from '../resources/norandoms/story/phone-view.webp'
import phoneContent from '../resources/norandoms/story/phone-content.webp'
import phoneNav from '../resources/norandoms/story/phone-nav.webp'

/**
 * Сюжет кейса (прототип от 22.10.2026, `docs/prototypes/norandoms-case-story/`): главы слева, залипшее устройство справа.
 * Экран продукта — два слоя: `view` — первый экран 1440×900 (липкий сайдбар 0–270 px и правая панель), `content` — колонка
 * контента 1099 px во всю высоту, лежит поверх view в окне x 270–1369 и сдвигается на offset прокрутки. Все координаты
 * подсветок и камеры — в пикселях исходного сайта: колонки контента (x от её левого края, y от верха страницы) или первого
 * экрана при `view: true`. Прогресс главы p — 0…1 от момента, когда её верх прошёл линию активации
 */
export type StoryScreen = {
	key: string
	/** Адрес на сайте продукта — подпись под сценой */
	path: string
	view: string
	content?: string
	/** Высота колонки контента, px сайта */
	contentHeight?: number
}

export type StoryRange = [number, number]

export type StoryRegion = {
	x: number
	y: number
	w: number
	h: number
	/** Координаты первого экрана, а не колонки контента */
	view?: boolean
}

/** Коралловая рамка с подписью и затемнением вокруг — одна за раз */
export type StoryHighlight = StoryRegion & {
	screen: string
	label: string
	p: StoryRange
	/** Малое скругление — для кнопки */
	ring?: boolean
	/** Подпись под рамкой, а не над ней */
	below?: boolean
	/** Подпись у правого края */
	left?: boolean
}

/** Камера: экран ноутбука наезжает на область (не больше `zoom`), чтобы интерфейс читался в маленьком экране */
export type StoryCamera = StoryRegion & {
	p: StoryRange
	zoom: number
}

/** Шаг главы: какой экран показан и откуда докуда прокручен его контент на отрезке p */
export type StoryStep = {
	screen: string
	from?: number
	to?: number
	p?: StoryRange
}

/** Курсор едет к кнопке, щёлкает — раскрывается настоящая панель (вырезка) */
export type StoryClick = {
	from: [number, number]
	to: [number, number]
	/** Отрезок p, на котором курсор едет */
	p: StoryRange
	/** p щелчка */
	at: number
	/** Панель в координатах первого экрана */
	panel: { src: string; x: number; y: number; w: number; h: number }
}

export type StoryChapter = {
	/** Слово метки без слэшей: «задача» → // 01 · задача */
	label: string
	title: string
	text: string[]
	/** Строка моно под текстом */
	fact?: string
	steps: StoryStep[]
	highlights?: StoryHighlight[]
	camera?: StoryCamera[]
	click?: StoryClick
	/** Десктоп: телефон на сцене, прокрутка его экрана от…до */
	phone?: StoryRange
	/** ≤992: телефон — единственное устройство, прокрутка его экрана в этой главе */
	phoneMobile: StoryRange
	/** Пригасить ноутбук за телефоном */
	dim?: boolean
	/** Показать цифры кейса (один раз на странице) */
	metrics?: boolean
	/** Показать стек чипами */
	stack?: boolean
}

export type StoryPhone = {
	/** Первый экран телефона (шапка продукта берётся из его верхних строк) */
	view: string
	viewW: number
	viewH: number
	/** Высота фиксированной шапки продукта, px */
	headerHeight: number
	/** Колонка контента во всю высоту, ширина = ширине холста */
	content: string
	contentHeight: number
	/** Нижняя навигация — вырезка с альфой, на холсте телефона */
	nav: { src: string; x: number; y: number; w: number; h: number }
}

export type CaseStory = {
	/** Подпись сцены для диктора (role="img") */
	label: string
	/** Домен продукта для подписи под сценой */
	site: string
	screens: StoryScreen[]
	phone: StoryPhone
	chapters: StoryChapter[]
}

/** Сюжет NoRandoms. Заголовки глав и подписи подсветок — черновик сессии 22.10.2026 */
// TODO (владелец): утвердить заголовки глав и подписи подсветок
export const NORANDOMS_STORY: CaseStory = {
	label: 'Интерфейс NoRandoms на ноутбуке и телефоне: главная, страница игры, анкеты с фильтрами, пати с чатом, Steam и Telegram',
	site: 'norandoms.team',
	screens: [
		{ key: 'home', path: '', view: homeView, content: homeContent, contentHeight: 3500 },
		{ key: 'game', path: '/games/counter-strike-2', view: gameView, content: gameContent, contentHeight: 1720 },
		{ key: 'teammates', path: '/teammates', view: teammatesView, content: teammatesContent, contentHeight: 1800 },
		{ key: 'parties', path: '/parties', view: partiesView, content: partiesContent, contentHeight: 1800 },
		// Комната пати — скриншот владельца с сообщением в чате (без входа в аккаунт чат пустой)
		{ key: 'party', path: '/parties/valheim', view: partyView },
	],
	phone: {
		view: phoneView,
		viewW: 390,
		viewH: 664,
		headerHeight: 49,
		content: phoneContent,
		contentHeight: 3200,
		nav: { src: phoneNav, x: 16, y: 740, w: 358, h: 52 },
	},
	chapters: [
		{
			label: 'задача',
			title: 'Напарники вместо случайных людей',
			text: [
				'Игроки ищут напарников в Discord и случайных чатах и получают случайных людей. Нужен сервис, где подбор идёт по формату игры: время, голос, стиль, отношение к ошибкам. И вывести его в поиск без бюджета на рекламу.',
			],
			steps: [{ screen: 'home', from: 0, to: 300 }],
			phoneMobile: [0, 360],
		},
		{
			label: 'каталог и seo',
			title: 'Страница под каждую игру',
			text: ['Под каждую игру и формат поиска генерируется своя страница с игроками, пати и FAQ. Это главный источник органического трафика.'],
			fact: 'Шаблоны страниц, метаданные, перелинковка и индексные sitemap пересобираются автоматически',
			steps: [{ screen: 'game', from: 0, to: 480 }],
			highlights: [
				{ screen: 'game', x: 60, y: 556, w: 612, h: 48, p: [0.12, 0.5], label: 'счётчики по игре' },
				{ screen: 'game', x: 40, y: 632, w: 1020, h: 560, p: [0.5, 1.01], label: 'кто ещё играет' },
			],
			camera: [
				{ x: 60, y: 556, w: 612, h: 48, p: [0.12, 0.5], zoom: 1.7 },
				{ x: 40, y: 632, w: 1020, h: 560, p: [0.5, 1.01], zoom: 1.2 },
			],
			phoneMobile: [700, 1000],
		},
		{
			label: 'подбор',
			title: 'Анкеты игроков и 13 фильтров',
			text: [
				'Профиль с предпочтениями и фильтры: игра, возраст, микрофон, стиль, устройства, время, длина сессии, каналы связи, отношение к токсичности и ошибкам.',
				'Система совместимости сравнивает аккаунты по общим играм, расписанию, стилю и формату общения.',
			],
			steps: [{ screen: 'teammates', from: 0, to: 0 }],
			highlights: [{ screen: 'teammates', x: 1004, y: 307, w: 58, h: 50, p: [0.18, 0.44], ring: true, label: 'фильтры', below: true, left: true }],
			// Курсор подъезжает к кнопке фильтров, щелчок — раскрывается настоящая панель 13 фильтров
			click: { from: [860, 640], to: [1296, 326], p: [0.1, 0.4], at: 0.44, panel: { src: filtersPanel, x: 727, y: 353, w: 604, h: 404 } },
			camera: [{ x: 700, y: 270, w: 660, h: 520, p: [0.1, 1.01], zoom: 1.35, view: true }],
			phoneMobile: [1560, 2150],
		},
		{
			label: 'пати',
			title: 'Пати, чат и голос в браузере',
			text: [
				'Два формата сбора: быстрое объявление «зашёл и играй» и полноценная комната с заявками, составом, правилами и планированием сессии.',
				'Текстовый чат пати в реальном времени и голосовой созвон в один клик без Discord.',
			],
			steps: [
				{ screen: 'parties', from: 0, to: 520, p: [0, 0.55] },
				{ screen: 'party', p: [0.55, 1.01] },
			],
			highlights: [{ screen: 'party', view: true, x: 290, y: 20, w: 730, h: 70, p: [0.65, 1.01], label: 'голос в один клик', below: true }],
			camera: [{ x: 290, y: 20, w: 730, h: 70, p: [0.65, 1.01], zoom: 1.5, view: true }],
			phoneMobile: [2100, 2350],
		},
		{
			label: 'интеграции',
			title: 'Steam и Telegram',
			text: [
				'Вход через Steam без пароля, импорт библиотеки игр. Счётчики «есть в Steam у N игроков» считаются по реальным библиотекам.',
				'Заявки, приглашения, изменения состава и времени пати приходят в Telegram-бота. Включается в один клик.',
			],
			steps: [{ screen: 'home', from: 2150, to: 2600 }],
			highlights: [
				{ screen: 'home', x: 80, y: 2268, w: 940, h: 540, p: [0.05, 0.5], label: 'steam: вход и импорт игр' },
				{ screen: 'home', x: 40, y: 2893, w: 1019, h: 543, p: [0.5, 1.01], label: 'telegram-бот' },
			],
			camera: [
				{ x: 80, y: 2268, w: 940, h: 540, p: [0.05, 0.45], zoom: 1.25 },
				{ x: 40, y: 2893, w: 1019, h: 543, p: [0.5, 1.01], zoom: 1.25 },
			],
			phoneMobile: [2300, 2464],
		},
		{
			label: 'мобильная версия',
			title: 'Те же сценарии на телефоне',
			text: [
				'Нижняя навигация и те же сценарии, что на компьютере. Голосовой созвон работает на ПК, телефоне и Steam Deck, микрофон проверяется перед входом.',
			],
			steps: [{ screen: 'home', from: 2600, to: 2600 }],
			phone: [0, 2400],
			phoneMobile: [0, 2400],
			dim: true,
		},
		{
			label: 'результат',
			title: 'Запущен и растёт из поиска',
			text: ['Проект запущен и развивается. На платформе работают профили пользователей, поиск напарников и инструменты общения.'],
			steps: [{ screen: 'home', from: 0, to: 0 }],
			phone: [0, 0],
			phoneMobile: [0, 0],
			metrics: true,
			stack: true,
		},
	],
}
