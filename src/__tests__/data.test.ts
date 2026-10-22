import { describe, expect, it } from 'vitest'
import { PROJECTS, PROJECT_CATEGORIES, getAdjacentProjects, getProject } from '../data/projects'
import { POSTS, formatDate, getPost } from '../data/posts'
import { SERVICES } from '../data/services'
import { CONTACTS_FAQ_KEYS, FAQ, HOME_FAQ_KEYS, getFaq } from '../data/faq'

describe('projects', () => {
	it('slugs уникальны и совпадают с URL-форматом', () => {
		const slugs = PROJECTS.map(p => p.slug)
		expect(new Set(slugs).size).toBe(slugs.length)
		slugs.forEach(s => expect(s).toMatch(/^[a-z0-9-]+$/))
	})

	it('у каждого проекта есть обложка, галерея, метрики, категории и строка для карточки', () => {
		PROJECTS.forEach(p => {
			expect(p.cover).toBeTruthy()
			expect(p.cover).not.toMatch(/picsum/)
			expect(p.gallery.length).toBeGreaterThan(0)
			p.gallery.forEach(g => expect(g.src).not.toMatch(/picsum/))
			expect(p.metrics.length).toBe(4)
			expect(p.categories.length).toBeGreaterThan(0)
			p.categories.forEach(c => expect(PROJECT_CATEGORIES).toContain(c))
			expect(p.line.length).toBeGreaterThan(20)
			expect(p.tagline.length).toBeGreaterThan(20)
		})
	})

	it('у главного кейса три факта для широкой карточки', () => {
		PROJECTS.filter(p => p.featured).forEach(p => {
			expect(p.highlights?.length).toBe(3)
		})
	})

	it('у главного кейса два своих скриншота для блока на главной', () => {
		const featured = PROJECTS.find(p => p.featured)
		expect(featured?.showcase?.length).toBe(2)
		featured?.showcase?.forEach(s => {
			expect(s.src).not.toMatch(/picsum/)
			expect(s.alt).toBeTruthy()
		})
	})

	it('getProject находит проект и возвращает undefined для чужого slug', () => {
		expect(getProject('norandoms')?.title).toBe('NoRandoms')
		expect(getProject('nope')).toBeUndefined()
		expect(getProject(undefined)).toBeUndefined()
	})

	it('соседние проекты идут по кругу, а при одном проекте не ссылаются на себя', () => {
		const first = PROJECTS[0].slug
		const last = PROJECTS[PROJECTS.length - 1].slug
		if (PROJECTS.length > 1) {
			expect(getAdjacentProjects(first).prev?.slug).toBe(last)
			expect(getAdjacentProjects(last).next?.slug).toBe(first)
		} else {
			expect(getAdjacentProjects(first)).toEqual({ prev: undefined, next: undefined })
		}
		expect(getAdjacentProjects('nope')).toEqual({ prev: undefined, next: undefined })
	})
})

describe('posts', () => {
	it('slugs уникальны, даты валидны', () => {
		const slugs = POSTS.map(p => p.slug)
		expect(new Set(slugs).size).toBe(slugs.length)
		POSTS.forEach(p => expect(Number.isNaN(Date.parse(p.date))).toBe(false))
	})

	it('getPost и formatDate', () => {
		expect(getPost(POSTS[0].slug)).toBe(POSTS[0])
		expect(getPost('nope')).toBeUndefined()
		expect(formatDate('2025-09-14')).toContain('2025')
	})

	it('без стоковых обложек', () => {
		POSTS.forEach(p => expect(p.cover ?? '').not.toMatch(/picsum/))
	})
})

describe('services', () => {
	it('ключи уникальны и у каждой услуги есть состав', () => {
		const keys = SERVICES.map(s => s.key)
		expect(new Set(keys).size).toBe(keys.length)
		SERVICES.forEach(s => expect(s.includes.length).toBeGreaterThan(0))
	})
})

describe('кейс NoRandoms', () => {
	const norandoms = () => {
		const p = getProject('norandoms')
		if (!p) throw new Error('кейс norandoms не найден')
		return p
	}

	it('идёт первым, в избранном, со статусом и ссылкой на сайт', () => {
		expect(PROJECTS[0].slug).toBe('norandoms')
		expect(norandoms().featured).toBe(true)
		expect(norandoms().status).toBeTruthy()
		expect(norandoms().link).toBe('https://norandoms.team')
	})

	it('расширенные блоки заполнены', () => {
		const p = norandoms()
		expect(p.features?.length).toBeGreaterThanOrEqual(6)
		p.features?.forEach(f => {
			expect(f.title).toBeTruthy()
			expect(f.text).toBeTruthy()
		})
		expect(p.scheme?.length).toBeGreaterThanOrEqual(3)
		expect(p.process?.length).toBeGreaterThanOrEqual(4)
		p.process?.forEach(s => {
			expect(s.title).toBeTruthy()
			expect(s.text).toBeTruthy()
		})
		expect(p.gallery.length).toBeGreaterThanOrEqual(8)
	})
})

describe('faq', () => {
	it('ключи уникальны, тринадцать вопросов, у каждого есть ответ', () => {
		const keys = FAQ.map(f => f.key)
		expect(new Set(keys).size).toBe(keys.length)
		expect(FAQ.length).toBe(13)
		FAQ.forEach(f => {
			expect(f.q).toMatch(/\?$/)
			expect(f.a.length).toBeGreaterThan(20)
		})
	})

	it('на главной — пять вопросов ТЗ в его порядке', () => {
		expect(getFaq(HOME_FAQ_KEYS).map(f => f.q)).toEqual([
			'Можно обратиться без технического задания?',
			'Когда будет понятна стоимость?',
			'Можно доработать существующий сайт?',
			'Кто готовит тексты и изображения?',
			'Что происходит после запуска?',
		])
	})

	it('подборки для главной и контактов ссылаются на существующие вопросы', () => {
		expect(getFaq(HOME_FAQ_KEYS).length).toBe(HOME_FAQ_KEYS.length)
		expect(getFaq(CONTACTS_FAQ_KEYS).length).toBe(CONTACTS_FAQ_KEYS.length)
		expect(getFaq(['nope']).length).toBe(0)
	})

	it('ответы про договор, команду и дизайн отдельно — формулировки ТЗ от 22.10.2026', () => {
		expect(FAQ.find(f => f.key === 'contract')?.a).toBe(
			'Да. Обычно работаю как самозанятый, также могу заключить договор как ИП. Формат сотрудничества и документы согласуем до начала работ. Если подключаю других специалистов, договор на согласованные работы вы заключаете со мной.'
		)
		expect(FAQ.find(f => f.key === 'team')?.a).toBe(
			'Основную разработку выполняю сам. Для дизайна подключаю специалистов, с которыми работаю несколько лет. Если проект требует других компетенций, согласуем подключение дополнительных исполнителей. Договор и ответственность за согласованные работы остаются на мне.'
		)
		const design = FAQ.find(f => f.key === 'design-only')
		expect(design?.q).toBe('Можно заказать дизайн отдельно?')
		expect(design?.a).toMatch(/^Да\. Можно обратиться за дизайном сайта или приложения без последующей разработки\./)
		expect(design?.a).toMatch(/Проект веду я\. Стоимость согласуем после оценки\.$/)
		// SMM и прочие «чем не занимаюсь» в общем FAQ не перечисляются
		FAQ.forEach(f => expect(f.a).not.toMatch(/SMM/))
	})
})
