import { describe, expect, it } from 'vitest'
import { PROMOTION } from '../data/promotion'
import { PROMOTION_PATH, getOffer, offerPath } from '../data/offers'
import { PROCESS_COPY } from '../data/experience'
import { CATALOG_COPY, PRICING_PANEL } from '../data/home'
import { ROUTE_PATHS } from '../app/routes'

describe('обзор продвижения /services/promotion (ТЗ от 22.10.2026, §5)', () => {
	it('маршруты: обзор и вложенные услуги объявлены до /services/:offer', () => {
		const paths = ROUTE_PATHS as readonly string[]
		expect(paths).toContain('/services/promotion')
		expect(paths).toContain('/services/promotion/:offer')
		expect(paths.indexOf('/services/promotion')).toBeLessThan(paths.indexOf('/services/:offer'))
		expect(PROMOTION.path).toBe(PROMOTION_PATH)
	})

	it('тексты первого экрана, три карточки из общих данных и обращение', () => {
		expect(PROMOTION.title.text).toBe('Продвижение сайтов')
		expect(PROMOTION.name).toBe('Продвижение сайтов')
		expect(PROMOTION.lead).toBe(
			'Помогу выбрать, как привлекать посетителей и отслеживать обращения: через поисковое продвижение, рекламу или настройку аналитики. Можно обратиться за отдельной работой или согласовать несколько направлений.'
		)
		expect(PROMOTION.cta).toBe('Обсудить продвижение')
		expect(PROMOTION.offers.map(o => o.key)).toEqual(['seo', 'context', 'analytics'])
		PROMOTION.offers.forEach(o => expect(offerPath(o)).toMatch(/^\/services\/promotion\//))
		expect(PROMOTION.final.cta).toBe('Обсудить задачу')
	})

	it('«С чего начать» — три вопроса ТЗ и пояснение про первый этап', () => {
		expect(PROMOTION.start.items.map(i => i.q)).toEqual([
			'Не знаете, что происходит с заявками?',
			'Нужен запуск рекламы под конкретное предложение?',
			'Нужно развивать присутствие в поиске?',
		])
		expect(PROMOTION.start.items[0].a).toMatch(/аналитик/i)
		expect(PROMOTION.start.items[1].a).toMatch(/посадочн/i)
		expect(PROMOTION.start.items[2].a).toMatch(/SEO-аудит/)
		expect(PROMOTION.start.note).toBe(
			'Необязательно заказывать всё сразу. После знакомства с задачей предложу первый этап и объясню, что понадобится для оценки.'
		)
	})

	it('на обзоре у рекламы оба формата оплаты и условие про бюджет, у SEO — только ежемесячный тариф', () => {
		expect(getOffer('context')?.prices?.length).toBe(2)
		expect(getOffer('context')?.cardFoot).toBe('Рекламный бюджет оплачивается отдельно')
		expect(getOffer('seo')?.cardPrice).not.toMatch(/25 000/)
	})
})

describe('общая ответственность и строки каталога (ТЗ от 22.10.2026, §4, §10)', () => {
	it('вводный абзац перед этапами — договор и ответственность на Викторе', () => {
		expect(PROCESS_COPY.lead).toBe(
			'Вы обсуждаете проект и заключаете договор со мной. Я веду работу и отвечаю перед вами за согласованный результат. При необходимости подключаю специалистов, распределяю задачи и проверяю их работу. Состав команды и стоимость согласуем до начала работ.'
		)
	})

	it('подпись «Также могу помочь» и строка про почасовую ставку', () => {
		expect(CATALOG_COPY.more).toBe('Также могу помочь')
		expect(PRICING_PANEL.scope).toBe('почасовая ставка')
	})
})
