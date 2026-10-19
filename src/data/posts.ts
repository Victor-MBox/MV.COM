export type PostBlock =
	| { type: 'p'; text: string }
	| { type: 'h2'; text: string }
	| { type: 'ul'; items: string[] }
	| { type: 'quote'; text: string }
	| { type: 'code'; code: string }

export type Post = {
	slug: string
	title: string
	excerpt: string
	date: string // ISO
	readingTime: number // минут
	tags: string[]
	cover: string
	content: PostBlock[]
}

const pic = (seed: string) => `https://picsum.photos/seed/${seed}/1200/700`

export const POSTS: Post[] = [
	{
		slug: 'gsap-scrolltrigger-60fps',
		title: 'Как держать 60 FPS в скролл-анимациях на GSAP',
		excerpt:
			'Разбираю, почему анимации «дёргаются» на слабых ноутбуках, и какие свойства можно анимировать без страха.',
		date: '2025-09-14',
		readingTime: 7,
		tags: ['GSAP', 'Производительность'],
		cover: pic('post-gsap'),
		content: [
			{
				type: 'p',
				text: 'Скролл-анимации — самый быстрый способ сделать сайт «дорогим» и одновременно самый быстрый способ его уронить. Ниже — правила, которых я придерживаюсь на каждом проекте.',
			},
			{ type: 'h2', text: 'Анимируйте только transform и opacity' },
			{
				type: 'p',
				text: 'Эти свойства обрабатываются на композиторе и не вызывают пересчёт макета. Всё остальное — width, top, margin — заставляет браузер заново считать геометрию страницы на каждом кадре.',
			},
			{
				type: 'code',
				code: `gsap.to('.hero__img', {\n  yPercent: -20,\n  scrollTrigger: { trigger: '.hero', scrub: true },\n})`,
			},
			{ type: 'h2', text: 'Чек-лист перед релизом' },
			{
				type: 'ul',
				items: [
					'Включить «Paint flashing» в DevTools и убедиться, что перерисовывается только анимируемый слой.',
					'Проверить на ноутбуке без дискретной графики, а не только на MacBook Pro.',
					'Дать пользователю выключить анимации через prefers-reduced-motion.',
				],
			},
			{
				type: 'quote',
				text: 'Если анимация не влияет на понимание интерфейса — её можно отключить, и никто не заметит.',
			},
		],
	},
	{
		slug: 'react-design-system-from-scratch',
		title: 'Дизайн-система за две недели: что реально нужно в MVP',
		excerpt:
			'Опыт AtomAI: какие компоненты описать в первую очередь, а что отложить до второго релиза.',
		date: '2025-07-02',
		readingTime: 9,
		tags: ['React', 'Дизайн-система'],
		cover: pic('post-ds'),
		content: [
			{
				type: 'p',
				text: 'Дизайн-система в стартапе — это не Storybook на 200 компонентов, а набор договорённостей, который экономит время. В AtomAI мы уложились в две недели, потому что начали с токенов, а не с компонентов.',
			},
			{ type: 'h2', text: 'Сначала токены' },
			{
				type: 'ul',
				items: [
					'Цвета — через CSS-переменные с тёмной и светлой темой.',
					'Отступы и радиусы — шкала из 6 значений.',
					'Типографика — 5 стилей, каждый привязан к роли, а не к размеру.',
				],
			},
			{ type: 'h2', text: 'Потом 10 компонентов' },
			{
				type: 'p',
				text: 'Кнопка, поле ввода, карточка, модалка, тост, таблица, табы, дропдаун, бейдж и скелетон. Всё остальное собирается из них.',
			},
		],
	},
	{
		slug: 'crm-integration-pitfalls',
		title: 'Пять подводных камней интеграции сайта с CRM',
		excerpt:
			'Дубли сделок, потерянные UTM и webhook, который приходит дважды — и как с этим жить.',
		date: '2025-04-18',
		readingTime: 6,
		tags: ['CRM', 'Интеграции'],
		cover: pic('post-crm'),
		content: [
			{
				type: 'p',
				text: 'Каждая вторая интеграция с CRM ломается не на API, а на мелочах. Собрал список того, с чем сталкивался на проектах с amoCRM и Bitrix24.',
			},
			{
				type: 'ul',
				items: [
					'Идемпотентность: webhook может прийти дважды, сделка не должна создаться дважды.',
					'UTM-метки нужно сохранять в cookie при первом визите, а не читать из URL в момент отправки.',
					'Очередь на стороне сайта спасает заявки, когда CRM недоступна.',
					'Телефон нормализуйте до отправки — иначе дубли клиентов гарантированы.',
					'Логируйте каждый запрос с телом ответа: без этого разбор инцидентов невозможен.',
				],
			},
		],
	},
	{
		slug: 'wordpress-speed-2025',
		title: 'WordPress в 2025: как получить 90+ в Lighthouse без переезда',
		excerpt:
			'Конкретный план ускорения магазина на WooCommerce, который я применил на GreenLine.',
		date: '2025-02-09',
		readingTime: 8,
		tags: ['WordPress', 'Производительность'],
		cover: pic('post-wp'),
		content: [
			{
				type: 'p',
				text: 'WordPress можно сделать быстрым. Проблема почти всегда в плагинах и картинках, а не в самой платформе.',
			},
			{ type: 'h2', text: 'План из четырёх шагов' },
			{
				type: 'ul',
					items: [
					'Аудит плагинов: всё, что грузит скрипты на каждой странице, под вопросом.',
					'Картинки в WebP, ленивая загрузка, размеры под конкретные брейкпоинты.',
					'Кэш страниц и объектный кэш на Redis.',
					'Критический CSS инлайном, остальное — асинхронно.',
				],
			},
		],
	},
]

export function getPost(slug: string | undefined) {
	return POSTS.find(p => p.slug === slug)
}

export function formatDate(iso: string) {
	return new Date(iso).toLocaleDateString('ru-RU', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
	})
}
