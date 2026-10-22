import { describe, expect, it } from 'vitest'
import {
	ABOUT_BRIEF,
	CATALOG_COPY,
	FOOTER,
	FOOTER_META,
	H2,
	HERO,
	NAME,
	NAV,
	PROOF,
	PROJECTS_ANCHOR,
	SOCIAL,
} from '../data/home'
import { OFFERS, CATALOG, AGENCIES_KEY } from '../data/offers'
import { PROCESS } from '../data/experience'
import { PROJECTS, isPublic } from '../data/projects'
import { CONTACTS, CONTACT_LINKS } from '../data/contacts'
import { FORM_COPY, LEAD_FIELDS } from '../data/leadForm'
import { SITE_META } from '../data/meta'
import { ABOUT_TEAMS } from '../data/about'
import { ROUTE_PATHS } from '../app/routes'

describe('главная: коммерческая структура (ТЗ от 21.10.2026)', () => {
	it('первый экран: предложение в H1, имя — подписью, две кнопки, без цифры стажа', () => {
		expect(HERO.title).toBe('Сайты и веб-сервисы для бизнеса')
		expect(HERO.title.split(HERO.accent).length).toBe(2)
		expect(HERO.lines.join(' ')).toBe(HERO.title) // ручная разбивка по макету «Hero 1b Прожектор» = текст H1
		expect(HERO.lines.some(l => l.includes(HERO.accent))).toBe(true) // акцент не рвётся между строками
		expect(`${HERO.eyebrow.name} · ${HERO.eyebrow.role}`).toBe('Виктор Мацаков · частный веб-разработчик')
		expect(HERO.cta).toBe('Обсудить задачу')
		expect(HERO.projects).toBe('Посмотреть проекты')
		;[HERO.title, HERO.text, HERO.note, HERO.eyebrow.role].forEach(s => {
			expect(s).not.toMatch(/\d/) // «8 лет» в hero не выводится, пока нет подтверждения
			expect(s).not.toMatch(/full-stack/i)
		})
		expect(PROJECTS_ANCHOR).toMatch(/^[a-z-]+$/)
		expect(PROOF[0].value).toBe('8 лет') // данные остаются в источнике
	})

	it('каталог: шесть услуг в порядке ТЗ, агентства — отдельной строкой', () => {
		expect(CATALOG.map(o => o.key)).toEqual(['corporate', 'landing', 'ecommerce', 'web-service', 'integrations', 'support'])
		expect(OFFERS.slice(0, 6)).toEqual(CATALOG) // порядок массива = номер «услуга 0N»
		expect(OFFERS.find(o => o.key === AGENCIES_KEY)).toBeTruthy()
		expect(CATALOG_COPY.note).toMatch(/Ориентиры/)
	})

	it('кратко о разработчике — без чисел стажа и проектов', () => {
		expect(ABOUT_BRIEF.text).not.toMatch(/\d/)
		expect(ABOUT_BRIEF.text).toMatch(/NoRandoms/)
	})

	it('процесс новой разработки — четыре шага без обязательного созвона и обещаний «через два дня»', () => {
		expect(PROCESS.map(s => s.title)).toEqual(['Задача и оценка', 'Структура и интерфейс', 'Разработка и проверка', 'Запуск и передача'])
		PROCESS.forEach(s => expect(s.text).not.toMatch(/созвон|два дня|гаранти/i))
	})

	it('в каждом H2 не больше одного выделения, и оно — подстрока текста', () => {
		Object.values(H2).forEach(h => {
			expect(h.text.length).toBeGreaterThan(5)
			expect(h.accent && h.muted).toBeFalsy()
			const mark = h.accent ?? h.muted
			if (mark) expect(h.text.split(mark).length).toBe(2)
		})
	})

	it('заголовок футера — без цифр, имя — полностью', () => {
		expect(NAME).toBe('Виктор Мацаков')
		expect(FOOTER.title).not.toMatch(/\d/)
	})

	it('города и часового пояса на сайте нет (решение владельца от 20.10.2026)', () => {
		const strings = [...FOOTER_META, ABOUT_TEAMS.text, CONTACTS.location]
		strings.forEach(s => expect(s).not.toMatch(/Тбилиси|Грузия|GMT|UTC/i))
		expect(FOOTER_META.length).toBe(2)
	})

	it('ссылки шапки ведут на существующие маршруты, соцссылки — настоящие (без заглушки LinkedIn)', () => {
		const paths = ROUTE_PATHS as readonly string[]
		NAV.forEach(n => expect(paths).toContain(n.to))
		expect(new Set(NAV.map(n => n.to)).size).toBe(NAV.length)
		SOCIAL.forEach(key => expect(CONTACT_LINKS[key]).toMatch(/^https?:/))
		expect(SOCIAL).not.toContain('linkedin')
	})

	it('контакты настоящие: без example и нулевых номеров, телефон для показа — те же цифры', () => {
		expect(CONTACTS.email).not.toMatch(/example/)
		expect(CONTACTS.phone).toMatch(/^\+7\d{10}$/)
		expect(CONTACTS.phoneLabel.replace(/[^\d+]/g, '')).toBe(CONTACTS.phone)
		expect(CONTACT_LINKS.phone).toBe(`tel:${CONTACTS.phone}`)
	})

	it('мета главной, услуг и портфолио — тексты ТЗ', () => {
		expect(SITE_META.home.title).toBe('Разработка сайтов и веб-сервисов — Виктор Мацаков')
		expect(SITE_META.services.title).toBe('Разработка и доработка сайтов — услуги Виктора Мацакова')
		expect(SITE_META.portfolio.title).toBe('Проекты и опыт разработки — Виктор Мацаков')
		Object.values(SITE_META).forEach(m => expect(m.description.length).toBeGreaterThan(50))
	})

	it('кейс на главной: тип и описание без чисел, неподтверждённый «топ-10» скрыт', () => {
		PROJECTS.forEach(p => {
			expect(p.kind.length).toBeGreaterThan(5)
			expect(p.summary).not.toMatch(/\d/)
		})
		const norandoms = PROJECTS.find(p => p.slug === 'norandoms')
		expect(norandoms?.metrics.filter(isPublic).some(m => /топ-10/.test(m.label))).toBe(false)
		expect(norandoms?.highlights?.filter(isPublic).some(h => /топ-10/.test(h.label))).toBe(false)
		expect(norandoms?.metrics.some(m => m.value === 92)).toBe(true) // значение хранится до подтверждения
		expect(norandoms?.result).not.toMatch(/восемь месяцев/)
	})
})

describe('форма первого обращения', () => {
	it('три поля: имя необязательно, контакт и задача обязательны', () => {
		expect(LEAD_FIELDS.map(f => [f.key, f.required])).toEqual([
			['name', false],
			['contact', true],
			['message', true],
		])
		expect(LEAD_FIELDS.map(f => f.label)).toEqual(['Как к вам обращаться', 'Telegram или почта', 'Что нужно сделать'])
		expect(FORM_COPY.submit).toBe('Отправить задачу')
	})

	it('одна инструкция, что прислать, — текст ТЗ по текстам и SEO, без обещания сметы', () => {
		expect(FORM_COPY.lead).toBe(
			'Пришлите ссылку на текущий сайт или коротко опишите, что нужно сделать. Я посмотрю задачу и скажу, что потребуется для оценки.'
		)
		expect(FORM_COPY.lead).not.toMatch(/смет|бриф/i)
	})

	it('срок ответа везде один — «в течение рабочего дня» (решение владельца от 21.10.2026), без «двух дней»', () => {
		;[FORM_COPY.reply, FORM_COPY.success].forEach(s => {
			expect(s).toMatch(/в течение рабочего дня/)
			expect(s).not.toMatch(/дву[хм]|2 рабочих/)
		})
		expect(FORM_COPY.success).not.toBe(FORM_COPY.error)
	})
})
