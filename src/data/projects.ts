import portfolioCover from '../resources/portfolio.jpeg'

export type ProjectMetric = {
	label: string
	value: number
	prefix?: string
	suffix?: string
	decimals?: number
}

export type Project = {
	slug: string
	title: string
	tagline: string
	description: string[]
	client: string
	year: number
	role: string
	duration: string
	stack: string[]
	categories: string[]
	link?: string
	cover: string
	gallery: { src: string; caption: string }[]
	task: string
	solution: string
	result: string
	metrics: ProjectMetric[]
	featured?: boolean
}

const pic = (seed: string, w = 1400, h = 900) =>
	`https://picsum.photos/seed/${seed}/${w}/${h}`

export const PROJECTS: Project[] = [
	{
		slug: 'atomai',
		title: 'AtomAI',
		tagline: 'SaaS-платформа премиум-класса на базе искусственного интеллекта',
		description: [
			'AtomAI — SaaS-продукт для стартапов и корпоративных команд, который помогает генерировать и редактировать контент с помощью языковых моделей. Я отвечал за фронтенд от прототипа до релиза: дизайн-систему, лендинг, личный кабинет и биллинг.',
			'Главный вызов — сделать интерфейс, который одновременно выглядит «дорого» и остаётся быстрым: тяжёлые анимации на главной не должны были мешать работе внутри кабинета.',
		],
		client: 'AtomAI Inc.',
		year: 2025,
		role: 'Frontend-разработчик, дизайн-система',
		duration: '4 месяца',
		stack: ['React', 'TypeScript', 'Vite', 'GSAP', 'SCSS', 'REST API'],
		categories: ['SaaS', 'Веб-разработка'],
		link: 'https://example.com',
		cover: portfolioCover,
		gallery: [
			{ src: pic('atomai-1'), caption: 'Главная страница и hero-анимация' },
			{ src: pic('atomai-2'), caption: 'Личный кабинет: генерация контента' },
			{ src: pic('atomai-3'), caption: 'Тарифы и биллинг' },
			{ src: pic('atomai-4'), caption: 'Мобильная версия' },
		],
		task: 'Собрать лендинг и кабинет на единой дизайн-системе, запустить MVP за один квартал и не уронить скорость загрузки.',
		solution: 'Разделил код на лёгкий публичный бандл и отдельный бандл кабинета, вынес анимации в GSAP-таймлайны с ленивой инициализацией, описал 40+ компонентов дизайн-системы.',
		result: 'Продукт вышел в срок, LCP главной — меньше секунды, конверсия в регистрацию выросла после редизайна лендинга.',
		metrics: [
			{ label: 'Конверсия в регистрацию', value: 38, prefix: '+', suffix: '%' },
			{ label: 'LCP главной', value: 0.9, suffix: ' c', decimals: 1 },
			{ label: 'Компонентов в системе', value: 42 },
			{ label: 'Недель до MVP', value: 14 },
		],
		featured: true,
	},
	{
		slug: 'fade',
		title: 'Fade',
		tagline: 'Гибкий шаблон для SaaS и e-commerce с генеративным дизайном',
		description: [
			'Fade — конструктор витрин для небольших брендов. Шаблон собирается из блоков, а генеративный фон подстраивается под палитру товаров. Я делал фронтенд, каталог и корзину, а также интеграцию с платёжным шлюзом.',
			'Отдельная задача — сделать так, чтобы один и тот же шаблон выглядел по-разному у разных клиентов без правок кода: всё управляется через тему и переменные.',
		],
		client: 'Fade Studio',
		year: 2025,
		role: 'Full-stack разработчик',
		duration: '3 месяца',
		stack: ['React', 'TypeScript', 'Laravel', 'Stripe', 'SCSS'],
		categories: ['Интернет-магазин', 'Веб-разработка'],
		link: 'https://example.com',
		cover: pic('fade-cover'),
		gallery: [
			{ src: pic('fade-1'), caption: 'Витрина с генеративным фоном' },
			{ src: pic('fade-2'), caption: 'Карточка товара' },
			{ src: pic('fade-3'), caption: 'Корзина и оформление заказа' },
		],
		task: 'Один шаблон — десятки непохожих магазинов. Нужна тематизация без разработчика и быстрый чекаут.',
		solution: 'Все цвета, радиусы и шрифты вынесены в CSS-переменные и редактируются в админке. Чекаут собран в одну страницу с автозаполнением адреса.',
		result: 'Запущено 12 магазинов на одном шаблоне, средняя скорость оформления заказа — меньше двух минут.',
		metrics: [
			{ label: 'Магазинов на шаблоне', value: 12 },
			{ label: 'Брошенных корзин', value: 23, prefix: '−', suffix: '%' },
			{ label: 'Lighthouse Performance', value: 96 },
			{ label: 'Недель разработки', value: 11 },
		],
		featured: true,
	},
	{
		slug: 'nordic-estate',
		title: 'Nordic Estate',
		tagline: 'Сайт агентства загородной недвижимости с интерактивным каталогом',
		description: [
			'Агентство продаёт дома в скандинавском стиле и хотело сайт, который «продаёт атмосферу». Сделал лендинг с большими фотографиями, фильтруемым каталогом и формой подбора объекта.',
		],
		client: 'Nordic Estate',
		year: 2024,
		role: 'Frontend-разработчик, WordPress',
		duration: '6 недель',
		stack: ['WordPress', 'JavaScript', 'GSAP', 'SCSS', 'amoCRM'],
		categories: ['Лендинг', 'WordPress'],
		cover: pic('nordic-cover'),
		gallery: [
			{ src: pic('nordic-1'), caption: 'Главный экран' },
			{ src: pic('nordic-2'), caption: 'Каталог объектов с фильтрами' },
			{ src: pic('nordic-3'), caption: 'Страница дома' },
			{ src: pic('nordic-4'), caption: 'Форма подбора' },
		],
		task: 'Заменить устаревший сайт, подключить заявки к CRM и не потерять позиции в поиске.',
		solution: 'Собрал тему WordPress с кастомными типами записей для объектов, настроил редиректы со старых URL и интеграцию форм с amoCRM.',
		result: 'Заявки стали приходить напрямую в CRM, органический трафик за три месяца вырос.',
		metrics: [
			{ label: 'Заявок в месяц', value: 2.4, prefix: '×', decimals: 1 },
			{ label: 'Органический трафик', value: 31, prefix: '+', suffix: '%' },
			{ label: 'Объектов в каталоге', value: 120 },
			{ label: 'Недель разработки', value: 6 },
		],
	},
	{
		slug: 'pulse-crm',
		title: 'Pulse CRM',
		tagline: 'Интеграция сайта клиники с CRM и онлайн-записью',
		description: [
			'Сеть клиник принимала записи вручную через телефон. Я связал сайт с CRM и расписанием врачей: пациент выбирает врача, видит свободные слоты и записывается без звонка.',
			'Критичным было корректно обрабатывать гонки: два пациента не должны занять один слот.',
		],
		client: 'Сеть клиник «Пульс»',
		year: 2024,
		role: 'Full-stack разработчик, интеграции',
		duration: '2 месяца',
		stack: ['React', 'TypeScript', 'Laravel', 'Bitrix24 API', 'PostgreSQL'],
		categories: ['CRM-интеграция', 'Веб-разработка'],
		cover: pic('pulse-cover'),
		gallery: [
			{ src: pic('pulse-1'), caption: 'Выбор врача и слота' },
			{ src: pic('pulse-2'), caption: 'Подтверждение записи' },
			{ src: pic('pulse-3'), caption: 'Админ-панель расписания' },
		],
		task: 'Онлайн-запись с живым расписанием и синхронизацией с CRM в обе стороны.',
		solution: 'Промежуточный сервис на Laravel держит кэш расписания, бронирует слот транзакцией и отправляет сделку в CRM через webhook.',
		result: 'Половина записей перешла в онлайн, нагрузка на колл-центр снизилась.',
		metrics: [
			{ label: 'Записей онлайн', value: 52, suffix: '%' },
			{ label: 'Звонков в колл-центр', value: 40, prefix: '−', suffix: '%' },
			{ label: 'Врачей в системе', value: 35 },
			{ label: 'Недель разработки', value: 9 },
		],
	},
	{
		slug: 'orbit-studio',
		title: 'Orbit Studio',
		tagline: 'Промо-сайт анимационной студии со скролл-анимациями',
		description: [
			'Студия хотела сайт-шоурил, где каждая секция «оживает» при прокрутке. Собрал сцены на GSAP ScrollTrigger с pin-секциями, параллаксом и покадровой анимацией.',
		],
		client: 'Orbit Studio',
		year: 2023,
		role: 'Frontend-разработчик, анимации',
		duration: '5 недель',
		stack: ['React', 'GSAP', 'ScrollTrigger', 'Lottie', 'SCSS'],
		categories: ['Анимация', 'Лендинг'],
		link: 'https://example.com',
		cover: pic('orbit-cover'),
		gallery: [
			{ src: pic('orbit-1'), caption: 'Pin-секция с покадровой анимацией' },
			{ src: pic('orbit-2'), caption: 'Шоурил' },
			{ src: pic('orbit-3'), caption: 'Команда' },
			{ src: pic('orbit-4'), caption: 'Контакты' },
		],
		task: 'Сделать «вау»-эффект, но удержать 60 FPS на ноутбуках без дискретной графики.',
		solution: 'Все анимации — только transform и opacity, тяжёлые секвенции предзагружаются и рисуются в canvas, на слабых устройствах включается облегчённый режим.',
		result: 'Сайт попал в подборки дизайн-сообществ, студия получила несколько крупных заказов через форму.',
		metrics: [
			{ label: 'FPS на MacBook Air', value: 60 },
			{ label: 'Анимированных сцен', value: 9 },
			{ label: 'Среднее время на сайте', value: 3.2, suffix: ' мин', decimals: 1 },
			{ label: 'Недель разработки', value: 5 },
		],
	},
	{
		slug: 'greenline',
		title: 'GreenLine',
		tagline: 'Интернет-магазин эко-товаров на WooCommerce',
		description: [
			'Магазин с 800+ товарами, подписками на доставку и программой лояльности. Я переработал каталог, ускорил сайт и настроил интеграцию с системой учёта.',
		],
		client: 'GreenLine',
		year: 2023,
		role: 'WordPress-разработчик',
		duration: '2 месяца',
		stack: ['WordPress', 'WooCommerce', 'PHP', 'JavaScript', 'SCSS'],
		categories: ['Интернет-магазин', 'WordPress'],
		cover: pic('greenline-cover'),
		gallery: [
			{ src: pic('greenline-1'), caption: 'Каталог' },
			{ src: pic('greenline-2'), caption: 'Подписка на доставку' },
			{ src: pic('greenline-3'), caption: 'Личный кабинет и бонусы' },
		],
		task: 'Ускорить медленный магазин и добавить подписки без переезда с WooCommerce.',
		solution: 'Вынес тяжёлые плагины, настроил кэширование и ленивую загрузку, написал модуль подписок поверх стандартных заказов.',
		result: 'Время загрузки каталога сократилось втрое, подписки дают стабильную выручку.',
		metrics: [
			{ label: 'Время загрузки каталога', value: 3, prefix: '×', suffix: ' быстрее' },
			{ label: 'Повторных покупок', value: 27, prefix: '+', suffix: '%' },
			{ label: 'Товаров', value: 800, suffix: '+' },
			{ label: 'Недель разработки', value: 8 },
		],
	},
]

export const PROJECT_CATEGORIES = Array.from(
	new Set(PROJECTS.flatMap(p => p.categories))
)

export function getProject(slug: string | undefined) {
	return PROJECTS.find(p => p.slug === slug)
}

export function getAdjacentProjects(slug: string) {
	const i = PROJECTS.findIndex(p => p.slug === slug)
	if (i === -1) return { prev: undefined, next: undefined }
	return {
		prev: PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length],
		next: PROJECTS[(i + 1) % PROJECTS.length],
	}
}
