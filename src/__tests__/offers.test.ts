import { describe, expect, it } from 'vitest'
import { CATALOG, CATALOG_GROUPS, MORE_OFFERS, OFFERS, PROMOTION_OFFERS, PROMOTION_PATH, getOffer, offerNumber, offerPath, relatedLinks } from '../data/offers'
import { SERVICES } from '../data/services'
import { FAQ } from '../data/faq'
import {
	AFTER_LAUNCH,
	PACKAGES_ANCHOR,
	PACKAGES_OFFER,
	PACKAGES_PATH,
	PRICE_NOTE,
	PRICING,
	PRICING_MODELS,
	SUPPORT_PACKAGES,
	SUPPORT_TERMS,
} from '../data/pricing'

/** Все тексты оффера, которые видит посетитель */
const texts = (key: string) => {
	const o = getOffer(key)
	if (!o) throw new Error(`нет оффера ${key}`)
	return [
		o.title,
		o.heading,
		o.line,
		o.lead ?? '',
		o.priceDetail ?? '',
		o.cardNote ?? '',
		o.cardFoot ?? '',
		...o.audience,
		...o.notFor,
		...o.outcomes,
		o.outcomesNote ?? '',
		...(o.formats ?? []).flatMap(f => [f.label, f.text]),
		o.formatsNote ?? '',
		o.estimate ?? '',
		...o.priceFactors,
		...o.notIncluded,
		o.payment ?? '',
		o.afterLaunch ?? '',
		...(o.extras ?? []).flatMap(e => [e.title.text, e.text ?? '', e.note ?? '', ...(e.items ?? [])]),
		...o.faq.flatMap(f => [f.q, f.a]),
		o.ctaLead ?? '',
		...(o.process ?? []).flatMap(s => [s.title, s.text]),
		...(o.tech?.stack ?? []),
		...(o.tech?.notes ?? []),
	]
}

describe('offers', () => {
	it('двенадцать офферов с уникальными URL-ключами; шесть основных идут первыми', () => {
		expect(OFFERS.length).toBe(12)
		const keys = OFFERS.map(o => o.key)
		expect(new Set(keys).size).toBe(keys.length)
		keys.forEach(k => expect(k).toMatch(/^[a-z0-9-]+$/))
		expect(keys).toEqual([
			'corporate',
			'landing',
			'ecommerce',
			'web-service',
			'integrations',
			'support',
			'mobile-apps',
			'interactive',
			'seo',
			'context',
			'analytics',
			'agencies',
		])
		expect(OFFERS.slice(0, 6)).toEqual(CATALOG)
	})

	it('пути: услуги продвижения вложены в /services/promotion, остальные — /services/:key; номер — по месту в OFFERS', () => {
		expect(PROMOTION_PATH).toBe('/services/promotion')
		expect(PROMOTION_OFFERS.map(o => o.key)).toEqual(['seo', 'context', 'analytics'])
		PROMOTION_OFFERS.forEach(o => expect(offerPath(o)).toBe(`/services/promotion/${o.key}`))
		OFFERS.filter(o => !o.parent).forEach(o => expect(offerPath(o)).toBe(`/services/${o.key}`))
		expect(offerPath({ key: 'support' })).toBe('/services/support')
		expect(offerNumber({ key: 'corporate' })).toBe('01')
		expect(offerNumber({ key: 'integrations' })).toBe('05')
		expect(offerNumber({ key: 'mobile-apps' })).toBe('07')
		expect(offerNumber({ key: 'analytics' })).toBe('11')
		// Один и тот же путь не ведёт на две услуги
		const paths = OFFERS.map(offerPath)
		expect(new Set(paths).size).toBe(paths.length)
	})

	it('каталог /services: три группы покрывают все услуги, кроме агентств, ровно по одному разу; у продвижения ссылка на обзор', () => {
		const grouped = CATALOG_GROUPS.flatMap(g => g.offers.map(o => o.key))
		expect(new Set(grouped).size).toBe(grouped.length)
		expect(grouped.sort()).toEqual(
			OFFERS.filter(o => o.key !== 'agencies')
				.map(o => o.key)
				.sort()
		)
		expect(CATALOG_GROUPS.map(g => g.title.text)).toEqual(['Сайты и приложения', 'Интеграции и поддержка', 'Продвижение и аналитика'])
		expect(CATALOG_GROUPS[2].link).toEqual({ label: 'Как выбрать способ продвижения', to: PROMOTION_PATH })
		CATALOG_GROUPS.forEach(g => expect(g.offers.length).toBeGreaterThan(0))
	})

	it('«Также могу помочь» на главной — пять новых услуг; смежные ссылки ведут на существующие страницы', () => {
		expect(MORE_OFFERS.map(o => o.key)).toEqual(['mobile-apps', 'interactive', 'seo', 'context', 'analytics'])
		const known = new Set([...OFFERS.map(offerPath), PROMOTION_PATH])
		OFFERS.forEach(o => {
			relatedLinks(o).forEach(l => {
				expect(known.has(l.to)).toBe(true)
				expect(l.to).not.toBe(offerPath(o))
			})
			expect(relatedLinks(o).length).toBe((o.related ?? []).length)
		})
		expect(relatedLinks(getOffer('seo')!).map(l => l.to)).toEqual(['/services/promotion/context', '/services/promotion/analytics', PROMOTION_PATH])
		expect(relatedLinks(getOffer('mobile-apps')!).map(l => l.to)).toContain('/services/integrations')
		expect(relatedLinks(getOffer('interactive')!).map(l => l.to)).toEqual(['/services/promotion/context', '/services/promotion/analytics'])
	})

	it('каждый services[] ссылается на существующую услугу, и каждая услуга попала хотя бы в один оффер', () => {
		const known = new Set(SERVICES.map(s => s.key))
		const used = new Set<string>()
		OFFERS.forEach(o => {
			o.services.forEach(k => {
				expect(known.has(k)).toBe(true)
				used.add(k)
			})
		})
		SERVICES.forEach(s => expect(used.has(s.key)).toBe(true))
		// Аккордеон «Стек и детали» есть у всех услуг разработки; у продвижения и приложений стек не объявляется
		;['corporate', 'landing', 'ecommerce', 'web-service', 'integrations', 'support', 'agencies', 'interactive'].forEach(key =>
			expect(getOffer(key)?.tech?.stack.length).toBeGreaterThan(0)
		)
		;['mobile-apps', 'seo', 'context', 'analytics'].forEach(key => expect(getOffer(key)?.tech).toBeUndefined())
	})

	it('у каждого оффера есть цена в рублях, срок, подпись кнопки и неровный, но полный контент', () => {
		OFFERS.forEach(o => {
			expect(o.priceFrom).toMatch(/₽/)
			expect(o.term).toBeTruthy()
			expect(o.cta).toMatch(/^Обсудить /)
			expect(o.line.length).toBeGreaterThan(20)
			expect(o.audience.length).toBeGreaterThanOrEqual(3)
			expect(o.audience.length).toBeLessThanOrEqual(5)
			expect(o.notFor.length).toBeLessThanOrEqual(2)
			expect(o.outcomes.length).toBeGreaterThanOrEqual(4)
			expect(o.outcomes.length).toBeLessThanOrEqual(8)
			expect(o.priceFactors.length).toBe(3)
			expect(o.notIncluded.length).toBeGreaterThan(0)
			expect(o.faq.length).toBeGreaterThanOrEqual(3)
			expect(o.faq.length).toBeLessThanOrEqual(6)
			if (o.tech) expect(o.tech.notes.length).toBeGreaterThan(0)
			;(o.formats ?? []).forEach(f => expect(f.text.length).toBeGreaterThan(20))
			;(o.extras ?? []).forEach(e => expect(e.items?.length || e.text?.length).toBeTruthy())
		})
	})

	it('у оффера со строками цен первая совпадает с priceFrom; цены форматов — те же, что в бейджах', () => {
		OFFERS.filter(o => o.prices).forEach(o => {
			const prices = o.prices ?? []
			expect(prices.length).toBeGreaterThanOrEqual(1)
			expect(prices[0].price).toBe(o.priceFrom)
		})
		OFFERS.filter(o => o.cardPrice).forEach(o => expect(o.cardPrice).toBe(o.priceFrom))
		// Форматы блока стоимости не расходятся с бейджами шапки: каждая цена бейджа есть в форматах
		OFFERS.filter(o => o.formats && o.prices).forEach(o => {
			const formatPrices = (o.formats ?? []).map(f => f.price).filter(Boolean)
			;(o.prices ?? []).forEach(p => expect(formatPrices.some(fp => p.price.startsWith(fp ?? '—'))).toBe(true))
		})
	})

	it('первая версия продукта — от 300 000 ₽ отдельной строкой, срок любого продукта не обещается', () => {
		const ws = getOffer('web-service')
		expect(ws?.title).toBe('Личный кабинет или веб-сервис')
		expect(ws?.prices).toEqual([
			{ label: 'Личный кабинет', price: 'от 150 000 ₽' },
			{ label: 'Первая версия продукта', price: 'от 300 000 ₽' },
		])
		expect(ws?.term).toBe('после согласования функций')
		// MVP нигде не предлагается от 150 000 ₽
		OFFERS.forEach(o => [o.title, o.line, o.priceDetail ?? ''].forEach(s => expect(s).not.toMatch(/MVP.*150|150.*MVP/)))
		// Приложения для сторов больше не «не ко мне» — отдельная услуга
		expect(ws?.notFor.join(' ')).toMatch(/отдельная услуга «Мобильные приложения»/)
		expect(ws?.notFor.join(' ')).not.toMatch(/веб-версию/)
	})

	it('цены и сроки шести существующих услуг не менялись (ТЗ от 22.10.2026, §1)', () => {
		const card = (key: string) => {
			const o = getOffer(key)
			return o && [o.priceFrom, o.term]
		}
		expect(card('corporate')).toEqual(['от 180 000 ₽', '4–6 недель'])
		expect(card('landing')).toEqual(['от 90 000 ₽', '2–3 недели'])
		expect(card('ecommerce')).toEqual(['от 250 000 ₽', '6–8 недель'])
		expect(card('integrations')).toEqual(['от 40 000 ₽', '1–2 недели'])
		expect(getOffer('support')?.prices).toEqual([{ label: 'Разовая задача', price: 'от 15 000 ₽' }])
		expect(getOffer('support')?.hideTermOnCard).toBe(true)
		expect(getOffer('agencies')?.priceFrom).toBe('3 500 ₽ / час')
	})

	it('цены новых услуг — линейка ТЗ от 22.10.2026, §3, с условиями базового объёма рядом с ценой', () => {
		const mobile = getOffer('mobile-apps')
		expect(mobile?.priceFrom).toBe('от 600 000 ₽')
		expect(mobile?.cardNote).toBe('одна платформа, готовые дизайн и API')
		expect(mobile?.priceDetail).toMatch(/^Одна платформа, готовый дизайн и существующий API\./)
		expect(mobile?.formats?.[0].price).toBe('от 600 000 ₽')

		const interactive = getOffer('interactive')
		expect(interactive?.prices).toEqual([
			{ label: 'Квиз', price: 'от 60 000 ₽' },
			{ label: 'Промо-игра', price: 'от 200 000 ₽' },
		])
		expect(interactive?.formats?.map(f => [f.label, f.price])).toEqual([
			['Квиз или тест', 'от 60 000 ₽'],
			['Промо-игра', 'от 200 000 ₽'],
			['Геймификация существующего продукта', undefined],
		])

		const seo = getOffer('seo')
		expect(seo?.priceFrom).toBe('от 35 000 ₽ / месяц')
		expect(seo?.cardPrice).toBe('от 35 000 ₽ / месяц') // на карточках — без аудита
		expect(seo?.prices).toEqual([
			{ label: 'Продвижение', price: 'от 35 000 ₽ / месяц' },
			{ label: 'SEO-аудит', price: 'от 25 000 ₽ разово' },
		])
		expect(seo?.formats?.map(f => [f.label, f.price])).toEqual([
			['SEO-аудит', 'от 25 000 ₽'],
			['SEO-продвижение', 'от 35 000 ₽ / месяц'],
		])
		expect([seo?.termLabel, seo?.term]).toEqual(['план работ и отчёт', 'каждый месяц'])

		const context = getOffer('context')
		expect(context?.prices).toEqual([
			{ label: 'Настройка', price: 'от 35 000 ₽' },
			{ label: 'Ведение', price: 'от 25 000 ₽ / месяц' },
		])
		expect(context?.priceDetail).toMatch(/Рекламный бюджет оплачивается Яндексу отдельно/)
		expect(context?.cardFoot).toBe('Рекламный бюджет оплачивается отдельно')

		const analytics = getOffer('analytics')
		expect(analytics?.prices).toEqual([{ label: 'Настройка', price: 'от 15 000 ₽' }])
		expect(analytics?.formats?.map(f => [f.label, f.price])).toEqual([
			['Проверка настроек', 'от 10 000 ₽'],
			['Базовая настройка', 'от 15 000 ₽'],
			['Электронная коммерция', 'от 35 000 ₽'],
		])

		// Сроки новых услуг не придуманы: «после согласования задачи», на карточке не выводятся
		;['mobile-apps', 'interactive', 'context', 'analytics'].forEach(key => {
			expect(getOffer(key)?.term).toBe('после согласования задачи')
			expect(getOffer(key)?.hideTermOnCard).toBe(true)
		})
		expect(seo?.hideTermOnCard).toBe(true)
	})

	it('новые услуги: свой процесс из четырёх шагов, вопрос про команду из общего FAQ, обращение и смежные услуги', () => {
		const team = FAQ.find(f => f.key === 'team')
		;['mobile-apps', 'interactive', 'seo', 'context', 'analytics'].forEach(key => {
			const o = getOffer(key)
			expect(o?.process?.length).toBe(4)
			expect(o?.faq.find(f => f.q === team?.q)?.a).toBe(team?.a)
			expect(o?.ctaLead?.length).toBeGreaterThan(20)
			expect(o?.related?.length).toBeGreaterThan(0)
			expect(o?.lead?.length).toBeGreaterThan(40)
			expect(o?.notFor).toEqual([])
		})
		expect(getOffer('seo')?.ctaLead).toBe('Пришлите ссылку на сайт и расскажите, какие услуги или товары хотите продвигать.')
		expect(getOffer('context')?.ctaLead).toBe('Пришлите сайт, регион и направление, которое хотите рекламировать.')
		expect(getOffer('analytics')?.ctaLead).toBe('Пришлите сайт и расскажите, какие действия или обращения сейчас не удаётся отследить.')
	})

	it('у интеграций, доработки и агентств свой процесс из четырёх шагов, у новых сайтов — общий', () => {
		;['integrations', 'support', 'agencies'].forEach(key => expect(getOffer(key)?.process?.length).toBe(4))
		;['corporate', 'landing', 'ecommerce', 'web-service'].forEach(key => expect(getOffer(key)?.process).toBeUndefined())
	})

	it('интеграции (ТЗ от 22.10.2026, §10): H1, описание, одна интеграция в стартовой цене, без обещания любой CRM', () => {
		const o = getOffer('integrations')
		expect(o?.heading).toBe('Интеграции API и автоматизация')
		expect(o?.line).toBe(
			'Подключаю обмен данными между сайтом, CRM, учётной системой и другими сервисами. Настраиваю передачу заявок, заказов, остатков и уведомлений, чтобы сократить ручные операции.'
		)
		expect(o?.estimate).toMatch(/одна согласованная интеграция и направление обмена/)
		expect(o?.estimate).toMatch(/доступность API и объём данных влияют на оценку/)
		expect(o?.faq.find(f => /CRM/.test(f.q))?.a).toMatch(/без проверки не обещаю/)
		expect(texts('integrations').join(' ')).not.toMatch(/ИИ-помощник|AI-помощник/i)
	})

	it('честные границы (ТЗ от 22.10.2026): без SMM вне FAQ рекламы, Google Ads, стека приложений, GEO-тарифа и llms.txt', () => {
		OFFERS.forEach(o => {
			const all = texts(o.key).join('\n')
			expect(all).not.toMatch(/Google Ads|Google Реклам/i)
			expect(all).not.toMatch(/llms\.txt|\bGEO\b|\bASO\b/)
			if (o.key !== 'context') expect(all).not.toMatch(/SMM/)
		})
		const context = getOffer('context')
		expect(context?.faq.filter(f => /SMM/.test(f.q)).length).toBe(1)
		expect(texts('mobile-apps').join('\n')).not.toMatch(/Swift|Kotlin|Flutter|React Native|App Store|Google Play|NoRandoms|установок/)
		// Пример промо-игры — только интерфейс по готовому дизайну, без авторства всей игры
		const example = getOffer('interactive')?.extras?.find(e => e.id === 'example')
		expect(example?.title.text).toBe('Росгосстрах · ЖК Несчастье')
		expect(example?.text).toBe('Образовательная промо-игра. Разработал пользовательский интерфейс на React по предоставленному дизайну.')
		// SEO: не обещаем позиции и сроки, нейросети — задача внутри продвижения
		expect(getOffer('seo')?.faq.find(f => /первые места/.test(f.q))?.a).toMatch(/^Нет\./)
		expect(getOffer('seo')?.extras?.[0].note).toBe('Дополнительная задача в рамках продвижения; состав и стоимость — после оценки.')
		// Аналитика: событие — не продажа
		expect(getOffer('analytics')?.outcomesNote).toMatch(/отправка формы — не продажа/)
	})

	it('без обещаний, снятых владельцем: позиции, комиссии, «ничего не теряется», вечная архитектура, бюджет «не ко мне»', () => {
		const banned = /без потери позиций|без комиссий|ничего не теряется|не придётся переписывать|не ко мне|приоритетн/i
		OFFERS.forEach(o => texts(o.key).forEach(t => expect(t).not.toMatch(banned)))
	})

	it('1С-Битрикс упоминается только внутри оффера поддержки, отдельного оффера нет', () => {
		expect(OFFERS.some(o => /битрикс/i.test(o.title))).toBe(false)
		const support = getOffer('support')
		expect(support?.outcomes.some(t => /1С-Битрикс/.test(t))).toBe(true)
	})

	it('состав и стоимость: что нужно для оценки — у разработок, без неподтверждённых границ «по часам» и числа страниц', () => {
		const estimates = {
			corporate: 'Типы страниц и объём наполнения определим перед оценкой проекта.',
			landing: 'Перед оценкой согласуем структуру страницы, подготовку материалов и необходимые подключения.',
			ecommerce: 'Подключения оплаты, доставки, CRM и учётной системы согласуем перед оценкой проекта.',
			'web-service': 'Стоимость зависит от того, кто будет пользоваться сервисом, какие действия и подключения нужны.',
		}
		Object.entries(estimates).forEach(([key, text]) => expect(getOffer(key)?.estimate).toBe(text))
		OFFERS.forEach(o => {
			o.notIncluded.forEach(n => expect(n).not.toMatch(/по часам|десяти страниц|базовой выгрузки/))
			;[...o.outcomes, ...o.priceFactors].forEach(t => expect(t).not.toMatch(/всё включено|уникальных шаблонов|Логи каждого/i))
		})
	})

	it('обслуживание: контент не исключён целиком, размещение готовых материалов — в пакете с часами', () => {
		const support = getOffer('support')
		expect(support?.notIncluded).not.toContain('Контент и продвижение')
		expect(support?.notIncluded).toContain(
			'Написание текстов, подготовка изображений и продвижение. Размещение готовых материалов — в рамках пакета с часами работ.'
		)
		expect(support?.headings?.outcomes?.text).toBe('Состав работ')
		expect(support?.headings?.process?.text).toBe('Как начинается работа')
		expect(getOffer('integrations')?.headings?.process?.text).toBe('Как проходит подключение')
	})

	it('заголовки разделов новых услуг — по ТЗ, в каждом не больше одного выделения', () => {
		expect(getOffer('seo')?.headings).toMatchObject({
			fit: { text: 'Когда это нужно' },
			outcomes: { text: 'Что входит в работу' },
			price: { text: 'Стоимость и результат работы' },
			process: { text: 'Как проходит работа' },
		})
		expect(getOffer('context')?.headings).toMatchObject({
			outcomes: { text: 'Что входит в настройку' },
			price: { text: 'Стоимость и дополнительные расходы' },
			process: { text: 'Как проходит запуск' },
		})
		expect(getOffer('context')?.extras?.[0].title.text).toBe('Что входит в ведение')
		expect(getOffer('analytics')?.headings).toMatchObject({
			fit: { text: 'Когда это нужно' },
			outcomes: { text: 'Что получите' },
			price: { text: 'Форматы работы' },
			process: { text: 'Как проходит настройка' },
		})
		expect(getOffer('interactive')?.headings?.fit?.text).toBe('Что можно сделать')
		OFFERS.forEach(o => {
			const heads = [...Object.values(o.headings ?? {}), ...(o.extras ?? []).map(e => e.title)]
			heads.forEach(h => {
				expect(h.accent && h.muted).toBeFalsy()
				const mark = h.accent ?? h.muted
				if (mark) expect(h.text.split(mark).length).toBe(2)
			})
		})
	})

	it('кто готовит тексты — один ответ владельца из общего FAQ', () => {
		const owner = FAQ.find(f => f.key === 'texts')
		;['corporate', 'landing'].forEach(key => {
			const item = getOffer(key)?.faq.find(f => /тексты/i.test(f.q))
			expect(item).toEqual({ q: owner?.q, a: owner?.a })
		})
	})

	it('getOffer и offerPath', () => {
		expect(getOffer('landing')?.title).toBe('Лендинг')
		expect(getOffer('nope')).toBeUndefined()
		expect(getOffer(undefined)).toBeUndefined()
		expect(offerPath({ key: 'support' })).toBe('/services/support')
		expect(offerPath({ key: 'seo', parent: 'promotion' })).toBe('/services/promotion/seo')
	})
})

describe('pricing', () => {
	it('три формата с предметными кнопками, «что согласуем» из пяти пунктов и область почасовой ставки', () => {
		expect(PRICING_MODELS.map(m => [m.label, m.price, m.cta])).toEqual([
			['Проект по смете', 'По согласованному составу работ', 'Обсудить проект'],
			['Доработки', '3 500 ₽ / час', 'Обсудить доработку'],
			['Техническое обслуживание', 'от 3 000 ₽ / месяц', 'Посмотреть пакеты'],
		])
		// первые два открывают форму, третий ведёт к пакетам на странице поддержки
		expect(PRICING_MODELS.map(m => m.to)).toEqual([undefined, undefined, PACKAGES_PATH])
		PRICING_MODELS.forEach(m => expect(m.text).not.toMatch(/приоритетн|круглосуточ|SLA/i))
		expect(PRICING.agree.length).toBe(5)
		expect(PRICING.factors.length).toBeGreaterThan(0)
		expect(PRICING.scope).toBe('Почасовая работа — для задач разработки и доработок. Продвижение и реклама оцениваются отдельно.')
		// «Как читать цифры» и «чем не занимаюсь» сняты (ТЗ от 22.10.2026, §10)
		expect('reading' in PRICING).toBe(false)
		expect('notDoing' in PRICING).toBe(false)
	})

	it('пакеты обслуживания: три цены, условия, без сроков реакции и прежних 25 000 ₽', () => {
		expect(SUPPORT_PACKAGES.map(p => [p.label, p.price])).toEqual([
			['Базовое обслуживание', '3 000 ₽'],
			['Обслуживание и правки', '10 000 ₽'],
			['Регулярное развитие', '24 000 ₽'],
		])
		expect(PACKAGES_PATH).toBe(`/services/${PACKAGES_OFFER}#${PACKAGES_ANCHOR}`)
		expect(getOffer(PACKAGES_OFFER)).toBeTruthy()
		expect(SUPPORT_TERMS.length).toBe(5)
		;[...SUPPORT_PACKAGES.map(p => p.text), ...SUPPORT_TERMS].forEach(t => {
			expect(t).not.toMatch(/в течение \d+ (час|минут)|гарантир|перенос(ятся)? неиспользован|приоритетн/i)
		})
		expect(SUPPORT_TERMS.join(' ')).toMatch(/не означает круглосуточное дежурство/)
		// прежняя цена сопровождения не осталась ни в форматах, ни в оффере поддержки
		const support = getOffer('support')
		const texts = [...PRICING_MODELS.map(m => m.price), support?.priceDetail ?? '', ...(support?.outcomes ?? []), support?.afterLaunch ?? '']
		texts.forEach(t => expect(t).not.toMatch(/25 000/))
	})

	it('формулировки пакетов по ТЗ и одно пояснение к стартовой цене — «до начала работ» для разработки и продвижения', () => {
		expect(SUPPORT_PACKAGES[0].text).toMatch(/до 30 минут планового обслуживания в месяц/)
		expect(SUPPORT_TERMS).toContain(
			'Часы на доработки — сверх времени базового обслуживания. Диагностика расходует эти часы. Превышение — 3 500 ₽/час после согласования.'
		)
		;[...SUPPORT_PACKAGES.map(p => p.text), ...SUPPORT_TERMS, ...PRICING.factors].forEach(t =>
			expect(t).not.toMatch(/ручных регламентных|базовому регламенту|уникальных/)
		)
		expect(PRICE_NOTE).toBe('Указана стартовая стоимость. Состав работ, сроки и итоговую цену согласуем до начала работ.')
	})

	it('гарантийное исправление ошибок не подменено пакетом', () => {
		expect(getOffer('support')?.afterLaunch).toMatch(/исправляю ошибки.*независимо от пакета/)
	})

	it('после запуска: исправление своих ошибок отдельно от новых задач, без «месяца правок»', () => {
		expect(AFTER_LAUNCH).toMatch(/исправляю ошибки/)
		expect(AFTER_LAUNCH).toMatch(/оцениваются отдельно/)
		expect(AFTER_LAUNCH).not.toMatch(/месяц правок/i)
	})
})
