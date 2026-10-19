import { describe, expect, it } from 'vitest'
import { PROJECTS, PROJECT_CATEGORIES, getAdjacentProjects, getProject } from '../data/projects'
import { POSTS, formatDate, getPost } from '../data/posts'
import { SERVICES } from '../data/services'

describe('projects', () => {
	it('slugs уникальны и совпадают с URL-форматом', () => {
		const slugs = PROJECTS.map(p => p.slug)
		expect(new Set(slugs).size).toBe(slugs.length)
		slugs.forEach(s => expect(s).toMatch(/^[a-z0-9-]+$/))
	})

	it('у каждого проекта есть обложка, галерея, метрики и категории', () => {
		PROJECTS.forEach(p => {
			expect(p.cover).toBeTruthy()
			expect(p.gallery.length).toBeGreaterThan(0)
			expect(p.metrics.length).toBe(4)
			expect(p.categories.length).toBeGreaterThan(0)
			p.categories.forEach(c => expect(PROJECT_CATEGORIES).toContain(c))
		})
	})

	it('getProject находит проект и возвращает undefined для чужого slug', () => {
		expect(getProject('atomai')?.title).toBe('AtomAI')
		expect(getProject('nope')).toBeUndefined()
		expect(getProject(undefined)).toBeUndefined()
	})

	it('соседние проекты идут по кругу', () => {
		const first = PROJECTS[0].slug
		const last = PROJECTS[PROJECTS.length - 1].slug
		expect(getAdjacentProjects(first).prev?.slug).toBe(last)
		expect(getAdjacentProjects(last).next?.slug).toBe(first)
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
})

describe('services', () => {
	it('ключи уникальны и у каждой услуги есть состав', () => {
		const keys = SERVICES.map(s => s.key)
		expect(new Set(keys).size).toBe(keys.length)
		SERVICES.forEach(s => expect(s.includes.length).toBeGreaterThan(0))
	})
})
