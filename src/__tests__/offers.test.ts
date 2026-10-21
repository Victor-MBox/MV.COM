import { describe, expect, it } from 'vitest'
import { OFFERS, getOffer, offerPath } from '../data/offers'
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

describe('offers', () => {
	it('ровно семь офферов с уникальными URL-ключами', () => {
		expect(OFFERS.length).toBe(7)
		const keys = OFFERS.map(o => o.key)
		expect(new Set(keys).size).toBe(keys.length)
		keys.forEach(k => expect(k).toMatch(/^[a-z0-9-]+$/))
	})

	it('каждый services[] ссылается на существующую услугу, и каждая услуга попала хотя бы в один оффер', () => {
		const known = new Set(SERVICES.map(s => s.key))
		const used = new Set<string>()
		OFFERS.forEach(o => {
			expect(o.services.length).toBeGreaterThan(0)
			o.services.forEach(k => {
				expect(known.has(k)).toBe(true)
				used.add(k)
			})
		})
		SERVICES.forEach(s => expect(used.has(s.key)).toBe(true))
	})

	it('у каждого оффера есть цена в рублях, срок, подпись кнопки и неровный, но полный контент', () => {
		OFFERS.forEach(o => {
			expect(o.priceFrom).toMatch(/₽/)
			expect(o.term).toBeTruthy()
			expect(o.cta).toMatch(/^Обсудить /)
			expect(o.line.length).toBeGreaterThan(20)
			expect(o.audience.length).toBe(3)
			expect(o.notFor.length).toBeGreaterThanOrEqual(1)
			expect(o.notFor.length).toBeLessThanOrEqual(2)
			expect(o.outcomes.length).toBeGreaterThanOrEqual(5)
			expect(o.outcomes.length).toBeLessThanOrEqual(8)
			expect(o.priceFactors.length).toBe(3)
			expect(o.notIncluded.length).toBeGreaterThan(0)
			expect(o.faq.length).toBeGreaterThanOrEqual(3)
			expect(o.faq.length).toBeLessThanOrEqual(5)
			expect(o.tech.stack.length).toBeGreaterThan(0)
			expect(o.tech.notes.length).toBeGreaterThan(0)
			expect(o.categories.length).toBeGreaterThan(0)
		})
	})

	it('у оффера со строками цен первая совпадает с priceFrom, остальные не ниже', () => {
		const rub = (s: string) => Number(s.replace(/\D/g, ''))
		OFFERS.filter(o => o.prices).forEach(o => {
			const prices = o.prices ?? []
			expect(prices.length).toBeGreaterThanOrEqual(1)
			expect(prices[0].price).toBe(o.priceFrom)
			prices.forEach(p => expect(rub(p.price)).toBeGreaterThanOrEqual(rub(o.priceFrom)))
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
	})

	it('цены и сроки каталога — перенос из прежней версии (ТЗ §7)', () => {
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
	})

	it('у интеграций, доработки и агентств свой процесс из четырёх шагов, у новых сайтов — общий', () => {
		;['integrations', 'support', 'agencies'].forEach(key => expect(getOffer(key)?.process?.length).toBe(4))
		;['corporate', 'landing', 'ecommerce', 'web-service'].forEach(key => expect(getOffer(key)?.process).toBeUndefined())
	})

	it('без обещаний, снятых владельцем: позиции, комиссии, «ничего не теряется», вечная архитектура, бюджет «не ко мне»', () => {
		const banned = /без потери позиций|без комиссий|ничего не теряется|не придётся переписывать|не ко мне|приоритетн/i
		OFFERS.forEach(o => {
			const texts = [o.line, ...o.audience, ...o.notFor, ...o.outcomes, o.afterLaunch ?? '', ...o.faq.flatMap(f => [f.q, f.a])]
			texts.forEach(t => expect(t).not.toMatch(banned))
		})
	})

	it('1С-Битрикс упоминается только внутри оффера поддержки, отдельного оффера нет', () => {
		expect(OFFERS.some(o => /битрикс/i.test(o.title))).toBe(false)
		const support = getOffer('support')
		expect(support?.outcomes.some(t => /1С-Битрикс/.test(t))).toBe(true)
	})

	it('состав и стоимость: что нужно для оценки — у пяти разработок, без неподтверждённых границ «по часам» и числа страниц', () => {
		const estimates = {
			corporate: 'Типы страниц и объём наполнения определим перед оценкой проекта.',
			landing: 'Перед оценкой согласуем структуру страницы, подготовку материалов и необходимые подключения.',
			ecommerce: 'Подключения оплаты, доставки, CRM и учётной системы согласуем перед оценкой проекта.',
			'web-service': 'Стоимость зависит от того, кто будет пользоваться сервисом, какие действия и подключения нужны.',
			integrations: 'Для оценки нужны названия систем, перечень передаваемых данных и доступная документация по подключению.',
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
	})
})

describe('pricing', () => {
	it('три формата с предметными кнопками и список «что согласуем» из пяти пунктов', () => {
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
		expect(PRICING.reading.length).toBe(3)
		expect(PRICING.notDoing.length).toBe(3)
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

	it('формулировки пакетов по ТЗ и одно пояснение к стартовой цене', () => {
		expect(SUPPORT_PACKAGES[0].text).toMatch(/до 30 минут планового обслуживания в месяц/)
		expect(SUPPORT_TERMS).toContain(
			'Часы на доработки — сверх времени базового обслуживания. Диагностика расходует эти часы. Превышение — 3 500 ₽/час после согласования.'
		)
		;[...SUPPORT_PACKAGES.map(p => p.text), ...SUPPORT_TERMS, ...PRICING.factors].forEach(t =>
			expect(t).not.toMatch(/ручных регламентных|базовому регламенту|уникальных/)
		)
		expect(PRICE_NOTE).toBe('Указана стартовая стоимость. Состав работ, сроки и итоговую цену согласуем до начала разработки.')
	})

	it('гарантийное исправление ошибок не подменено пакетом', () => {
		expect(getOffer('support')?.afterLaunch).toMatch(/исправляю ошибки.*независимо от пакета/)
	})

	it('после запуска: исправление своих ошибок отдельно от новых задач, без «месяца правок»', () => {
		expect(AFTER_LAUNCH).toMatch(/исправляю ошибки/)
		expect(AFTER_LAUNCH).toMatch(/оцениваются отдельно/)
		;[AFTER_LAUNCH, ...PRICING.reading].forEach(s => expect(s).not.toMatch(/месяц правок/i))
	})
})
