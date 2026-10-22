import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { ROUTE_PATHS } from '../app/routes'
import {
	COOKIE_NOTICE,
	COOKIE_SETTINGS,
	COOKIE_SETTINGS_ENABLED,
	LEGAL_DOCS,
	LEGAL_LINKS,
	OPERATOR,
	RETENTION,
	STORAGE_INVENTORY,
	formatLegalDate,
	getLegalDoc,
	legalDocumentStrings,
	legalDocumentText,
} from '../data/legal'
import { CONSENT_URL, CONSENT_VERSION, FORM_COPY, PRIVACY_URL } from '../data/leadForm'
import { SITE_META } from '../data/meta'
import { NOTICE_KEY, NOTICE_VERSION, SITE_STORAGE_KEYS, parseNoticeRecord } from '../consent/privacyNotice'

const root = new URL('../../', import.meta.url)
const read = (path: string) => readFileSync(new URL(path, root), 'utf8')
const sha256 = (text: string) => createHash('sha256').update(text).digest('hex')
const serverLegal = JSON.parse(read('server/legal.json')) as Record<string, { version: string; sha256: string }>

describe('документы: маршруты, заголовки и мета (ТЗ от 22.10.2026, §3, §11)', () => {
	it('три страницы с путями и H1 по ТЗ, ссылки футера — те же маршруты', () => {
		expect(LEGAL_LINKS.map(d => [d.path, d.title, d.footerLabel])).toEqual([
			['/privacy', 'Политика в отношении обработки персональных данных', 'Политика конфиденциальности'],
			['/personal-data-consent', 'Согласие на обработку персональных данных', 'Согласие на обработку данных'],
			['/cookies', 'Использование файлов cookie и локального хранилища', 'Использование cookie'],
		])
		const paths = ROUTE_PATHS as readonly string[]
		LEGAL_LINKS.forEach(d => expect(paths).toContain(d.path))
		expect(getLegalDoc('/privacy/')?.key).toBe('privacy')
		expect(getLegalDoc('/services')).toBeUndefined()
	})

	it('title по ТЗ, description свои и в пределах длины, без noindex', () => {
		expect(SITE_META.privacy.title).toBe('Политика конфиденциальности — Виктор Мацаков')
		expect(SITE_META.consent.title).toBe('Согласие на обработку персональных данных — Виктор Мацаков')
		expect(SITE_META.cookies.title).toBe('Использование cookie — Виктор Мацаков')
		;[SITE_META.privacy, SITE_META.consent, SITE_META.cookies].forEach(m => {
			expect(m.description.length).toBeGreaterThan(50)
			expect(m.description.length).toBeLessThanOrEqual(200)
			expect('noindex' in m).toBe(false)
		})
	})

	it('у каждого документа редакция, дата и якоря подзаголовков уникальны', () => {
		LEGAL_LINKS.forEach(d => {
			expect(d.version).toMatch(/^\d+\.\d+$/)
			expect(formatLegalDate(d.effectiveDate)).toBe('22 октября 2026 г.')
			const ids = d.blocks.flatMap(b => (b.type === 'h2' ? [b.id] : []))
			expect(new Set(ids).size).toBe(ids.length)
			expect(ids.length).toBeGreaterThanOrEqual(5)
		})
		expect(LEGAL_DOCS.privacy.toc).toBe(true)
	})
})

describe('документы: факты оператора и отсутствие заглушек (ТЗ §4)', () => {
	const texts = Object.fromEntries(LEGAL_LINKS.map(d => [d.key, legalDocumentText(d)])) as Record<string, string>

	it('реквизиты владельца от 22.10.2026 в политике и согласии; статус один — ИП', () => {
		expect(OPERATOR.fullName).toBe('Мацаков Виктор Александрович')
		expect(OPERATOR.inn).toBe('553001542423')
		expect(OPERATOR.ogrnip).toBe('318554300039801')
		expect(OPERATOR.region).toBe('Омская область')
		expect(OPERATOR.email).toBe('info@matsakov-victor.com')
		;[texts.privacy, texts.consent].forEach(t => {
			expect(t).toContain(OPERATOR.inn)
			expect(t).toContain(OPERATOR.ogrnip)
			expect(t).toContain(OPERATOR.region)
			expect(t).toContain(OPERATOR.email)
			expect(t).not.toMatch(/самозанятый или ИП|на выбор/i)
		})
		expect(texts.privacy).toContain(OPERATOR.fullName)
		expect(texts.consent).toContain(OPERATOR.fullNameDative)
	})

	it('без шаблонных заглушек, фиктивных реквизитов, паспорта и города', () => {
		Object.values(texts).forEach(t => {
			expect(t).not.toMatch(/\[ФИО\]|\{operator|ИНН 0{3,}|example\.(com|ru)|lorem|TODO|Тбилиси|Грузия|GMT|UTC\+/i)
			expect(t).not.toMatch(/паспорт(ные данные)? (обязателен|требуется)/i)
			expect(t).not.toMatch(/Google Analytics|GDPR|ФСТЭК/i)
			expect(t).not.toMatch(/никому не передаются|абсолютн(ую|ая) безопасность гарантир/i)
		})
	})

	it('политика и согласие — разные документы, согласие ссылается на политику, а не заменяется ею', () => {
		expect(texts.consent).toMatch(/свободно, своей волей и в своём интересе/)
		expect(texts.privacy).not.toMatch(/свободно, своей волей/)
		expect(texts.consent).toContain('](/privacy)')
		expect(texts.consent).toMatch(/не «согласие с политикой»/)
		expect(texts.privacy).toContain('](/cookies)')
		expect(texts.privacy).toContain('](/personal-data-consent)')
		expect(texts.cookies).toContain('](/privacy)')
	})

	it('сроки в текстах — из RETENTION, без бессрочного хранения; рассылки и Telegram-пересылка исключены', () => {
		expect(texts.privacy).toContain(`${RETENTION.leadsDays} дней`)
		expect(texts.consent).toContain(`${RETENTION.leadsDays} дней`)
		expect(texts.cookies).toContain(`${RETENTION.noticeDays} дней`)
		expect(texts.privacy).not.toMatch(/до прекращения деятельности/)
		expect(texts.privacy).toMatch(/не включает рекламные рассылки/)
		expect(texts.consent).toMatch(/не распространяется на рекламные рассылки/)
		expect(texts.privacy).toMatch(/в Telegram автоматически не пересылается/)
	})

	it('фактические обработчики: Beget (Россия) и Google Fonts раскрыты; Яндекс Метрика — с оговоркой «после подключения»', () => {
		expect(texts.privacy).toMatch(/Бегет/)
		expect(texts.privacy).toMatch(/Google Fonts/)
		expect(texts.privacy).toMatch(/Яндекс Метрики .* до подключения эти данные не собираются/)
		expect(texts.cookies).toMatch(/до подключения аналитические cookie не устанавливаются/)
		expect(texts.cookies).toMatch(/Собственных cookie сайт не устанавливает/)
	})

	it('окно настроек скрыто (решение владельца от 22.10.2026) — в текстах нет кнопки «Настройки cookie»', () => {
		expect(COOKIE_SETTINGS_ENABLED).toBe(false)
		Object.values(texts).forEach(t => expect(t).not.toMatch(/Настройки cookie/))
	})
})

describe('редакция согласия: клиент, сервер и контрольные суммы (ТЗ §8)', () => {
	it('версия согласия в заявке = версии документа = версии на сервере', () => {
		expect(CONSENT_VERSION).toBe(LEGAL_DOCS.consent.version)
		expect(serverLegal.consent.version).toBe(LEGAL_DOCS.consent.version)
		expect(serverLegal.policy.version).toBe(LEGAL_DOCS.privacy.version)
		expect(serverLegal.cookies.version).toBe(LEGAL_DOCS.cookies.version)
	})

	it('SHA-256 текстов в server/legal.json совпадают с текущими текстами (изменил текст — подними версию и обнови хеш)', () => {
		const expected = { consent: sha256(legalDocumentText(LEGAL_DOCS.consent)), policy: sha256(legalDocumentText(LEGAL_DOCS.privacy)), cookies: sha256(legalDocumentText(LEGAL_DOCS.cookies)) }
		for (const [key, hash] of Object.entries(expected)) {
			expect(serverLegal[key].sha256, `server/legal.json → ${key}.sha256 должен быть ${hash}`).toBe(hash)
		}
	})
})

describe('формы: ссылки и тексты согласия (ТЗ §7)', () => {
	it('чекбокс ведёт на документ согласия, строка под ним — на политику; тексты по ТЗ', () => {
		expect(CONSENT_URL).toBe('/personal-data-consent')
		expect(PRIVACY_URL).toBe('/privacy')
		expect(`${FORM_COPY.consent.before}${FORM_COPY.consent.link}${FORM_COPY.consent.after}`).toBe(
			'Даю согласие на обработку персональных данных для рассмотрения обращения',
		)
		expect(`${FORM_COPY.policy.before}${FORM_COPY.policy.link}${FORM_COPY.policy.after}`).toBe('Как обрабатываются данные — в Политике конфиденциальности.')
		expect(FORM_COPY.errors.consent).toBe('Для отправки заявки нужно согласие на обработку персональных данных')
		expect(FORM_COPY.error).toBe('Не удалось отправить заявку. Попробуйте ещё раз или напишите в Telegram.')
		expect(FORM_COPY.success).toMatch(/^Заявка принята\. Отвечу по указанному контакту/)
	})
})

describe('cookie: инвентаризация, уведомление и отметка (ТЗ §9, §10)', () => {
	it('перечень записей совпадает с ключами в коде; собственных cookie нет', () => {
		expect(STORAGE_INVENTORY.map(s => s.key)).toEqual(['theme', 'privacy-notice', 'home-intro-played'])
		expect(NOTICE_KEY).toBe('privacy-notice')
		expect(read('src/hooks/useTheme.ts')).toMatch(/const KEY = 'theme'/)
		expect(read('src/pages/home/HomePage.tsx')).toMatch(/INTRO_KEY = 'home-intro-played'/)
		expect(read('index.html')).not.toMatch(/document\.cookie|metrika|gtag|googletagmanager/i)
		expect(SITE_STORAGE_KEYS).toEqual({ local: ['theme', 'privacy-notice'], session: ['home-intro-played'] })
	})

	it('уведомление информационное: текст владельца от 22.10.2026, кнопка «Понятно», версия = редакции /cookies', () => {
		expect(COOKIE_NOTICE.text).toBe(
			'Сайт сохраняет выбранную тему и настройки конфиденциальности на вашем устройстве, а также использует аналитические cookie.',
		)
		expect(COOKIE_NOTICE.accept).toBe('Понятно')
		expect(NOTICE_VERSION).toBe(LEGAL_DOCS.cookies.version)
		expect(COOKIE_SETTINGS.analytics.value).toMatch(/не подключена/)
	})

	it('отметка об уведомлении: только версия и дата; устаревшая, чужая версия и мусор не считаются', () => {
		const now = Date.parse('2026-10-22T12:00:00Z')
		const fresh = JSON.stringify({ version: NOTICE_VERSION, dismissedAt: '2026-10-01T00:00:00.000Z' })
		expect(parseNoticeRecord(fresh, now)).toEqual({ version: NOTICE_VERSION, dismissedAt: '2026-10-01T00:00:00.000Z' })
		expect(parseNoticeRecord(JSON.stringify({ version: NOTICE_VERSION, dismissedAt: '2026-01-01T00:00:00.000Z' }), now)).toBeNull() // старше 180 дней
		expect(parseNoticeRecord(JSON.stringify({ version: '0.9', dismissedAt: '2026-10-01T00:00:00.000Z' }), now)).toBeNull()
		expect(parseNoticeRecord(JSON.stringify({ version: NOTICE_VERSION, dismissedAt: 'вчера' }), now)).toBeNull()
		expect(parseNoticeRecord('{', now)).toBeNull()
		expect(parseNoticeRecord(null, now)).toBeNull()
		expect(Object.keys(JSON.parse(fresh)).sort()).toEqual(['dismissedAt', 'version'])
	})

	it('документ /cookies перечисляет те же записи, что и инвентаризация', () => {
		const lines = legalDocumentStrings(LEGAL_DOCS.cookies)
		STORAGE_INVENTORY.forEach(s => expect(lines.some(l => l.startsWith(`${s.key} | ${s.storage}`))).toBe(true))
	})
})
