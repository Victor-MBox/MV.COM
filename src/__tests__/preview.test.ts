import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import postcss from 'postcss'
import { compile } from 'sass'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { PROJECTS } from '../data/projects'
import type { PreviewPlacement, Project, ProjectPreview } from '../data/projects'
import { PREVIEW_CANVAS, PREVIEW_KITS } from '../components/floatingPreview/kits'
import type { PreviewKit, PreviewKitKey } from '../components/floatingPreview/kits'

/**
 * Интерактивные обложки кейсов (ТЗ от 22.10.2026; 28.10.2026 скриншоты заменены живой вёрсткой продукта; 29.10.2026 —
 * второй набор `rgs`, ТЗ docs/rgs-case-page-spec.md §6). Размеры элементов известны только в браузере: что слои целиком
 * внутри холста и не закрывают текст главной карточки, проверяется Playwright (code.md §9), здесь — данные, наборы и стили
 */
const WITH_PREVIEW = PROJECTS.filter((p): p is Project & { preview: ProjectPreview } => !!p.preview)

/** Стили каждого набора: всё под корнем набора (`className`), иначе протечёт на сайт */
const KIT_STYLES: Record<PreviewKitKey, string[]> = {
	norandoms: ['src/components/floatingPreview/norandoms/nr-cover.css', 'src/components/floatingPreview/norandoms/cover.scss'],
	rgs: ['src/components/floatingPreview/rgs/cover.scss'],
}

const cssOf = (file: string) => (file.endsWith('.scss') ? compile(resolve(file)).css : readFileSync(resolve(file), 'utf8'))

it('обложки есть у NoRandoms и «ЖК Несчастье»', () => {
	expect(WITH_PREVIEW.map(p => [p.slug, p.preview.kit])).toEqual([
		['norandoms', 'norandoms'],
		['zhk-neschastye', 'rgs'],
	])
})

describe.each(WITH_PREVIEW)('интерактивная обложка $slug', project => {
	const { preview } = project
	const kit: PreviewKit = PREVIEW_KITS[preview.kit]
	const html = (key: string) => renderToStaticMarkup(kit.elements[key])
	const text = (key: string) => html(key).replace(/<[^>]+>/g, '').trim()

	// Правило владельца — не больше шести слоёв; седьмой у «ЖК Несчастье» — анимированный логотип, добавленный по его просьбе 29.10.2026
	it('сцена подписана названием проекта, каждый слой — элемент из набора, без повторов; не больше семи слоёв', () => {
		const { label, layers } = preview
		expect(label).toContain(project.title)
		expect(layers.length).toBeGreaterThanOrEqual(3)
		expect(layers.length).toBeLessThanOrEqual(7)
		const keys = Object.keys(kit.elements)
		layers.forEach(l => {
			expect(keys).toContain(l.element)
			expect(l.name).toBeTruthy()
		})
		expect(new Set(layers.map(l => l.element)).size).toBe(layers.length)
	})

	it('одна главная карточка, она остаётся на телефоне; на телефоне слоёв меньше', () => {
		const { layers } = preview
		const main = layers.filter(l => l.main)
		expect(main.length).toBe(1)
		expect(main[0].phone).toBeTruthy()
		const phone = layers.filter(l => l.phone)
		expect(phone.length).toBeGreaterThanOrEqual(2)
		expect(phone.length).toBeLessThan(layers.length)
	})

	it('левый верхний угол слоёв — на холсте, заданная ширина не выходит за край, масштаб разумный', () => {
		const check = (place: PreviewPlacement, canvas: { w: number; h: number }) => {
			expect(place.x).toBeGreaterThanOrEqual(0)
			expect(place.y).toBeGreaterThanOrEqual(0)
			expect(place.x).toBeLessThan(canvas.w)
			expect(place.y).toBeLessThan(canvas.h)
			if (place.width) expect(place.x + place.width * (place.scale ?? 1)).toBeLessThanOrEqual(canvas.w)
			if (place.scale) {
				expect(place.scale).toBeGreaterThan(0.5) // мельче — текст на телефоне снова станет нечитаемым
				expect(place.scale).toBeLessThanOrEqual(1.5)
			}
		}
		preview.layers.forEach(l => {
			check(l, PREVIEW_CANVAS.desktop)
			if (l.phone) check(l.phone, PREVIEW_CANVAS.phone)
		})
	})

	it('глубина 0…1, у всех разная (разная скорость покачивания и параллакса), порядок — от дальнего к ближнему', () => {
		const depths = preview.layers.map(l => l.depth)
		depths.forEach(d => {
			expect(d).toBeGreaterThanOrEqual(0)
			expect(d).toBeLessThanOrEqual(1)
		})
		expect(new Set(depths).size).toBe(depths.length)
		expect([...depths].sort((a, b) => a - b)).toEqual(depths)
	})

	it('элементы без ссылок, кнопок, заголовков и списков (вся карточка кейса — одна ссылка)', () => {
		Object.keys(kit.elements).forEach(key => expect(html(key), key).not.toMatch(/<(a|button|h[1-6]|article|ul|li)[\s>]/))
	})

	it('интерфейс — живая вёрстка с текстом; без текста — только картинки продукта (персонаж, подарок, иконки)', () => {
		const main = preview.layers.find(l => l.main)!
		expect(text(main.element).length).toBeGreaterThan(0)
		Object.keys(kit.elements).forEach(key => {
			if (text(key)) return
			// Тег за тегом: только img и обёртки span (`<link rel="preload">` к картинкам добавляет серверная отрисовка React)
			html(key)
				.replace(/<link rel="preload"[^>]*>/g, '')
				.match(/<\/?[a-z]+/g)!
				.forEach(tag => expect(tag, key).toMatch(/^<\/?(img|span)$/))
		})
	})

	it('стили набора целиком под его корнем — не протекают на сайт', () => {
		const root = kit.className.replace(/[-]/g, '\\-')
		const re = new RegExp(`^\\.${root}(?=[\\s.:[]|$)`)
		let rules = 0
		KIT_STYLES[preview.kit].forEach(file => {
			postcss.parse(cssOf(file)).walkRules(rule => {
				if (rule.parent?.type === 'atrule' && /keyframes/.test((rule.parent as postcss.AtRule).name)) return
				rule.selectors.forEach(sel => expect(sel, `${file}: ${sel}`).toMatch(re))
				rules++
			})
		})
		expect(rules).toBeGreaterThan(5)
	})
})

describe('наборы обложек', () => {
	it('NoRandoms — стили живого norandoms.team (nr-cover.css), больше полусотни правил', () => {
		let rules = 0
		postcss.parse(cssOf(KIT_STYLES.norandoms[0])).walkRules(() => {
			rules++
		})
		expect(PREVIEW_KITS.norandoms.className).toBe('nr-cover')
		expect(rules).toBeGreaterThan(50)
	})

	it('«ЖК Несчастье» — шрифт игры Golos Text (без коммерческого TT Firs), тексты игры как в экранах 2 и 8', () => {
		const kit = PREVIEW_KITS.rgs
		expect(kit.className).toBe('rgs-cover')
		expect(kit.fonts).toBe('family=Golos+Text:wght@400;500')
		// Скомпилированные стили: десктопные правила игры без медиазапросов и z-index раскладки сцены
		const css = cssOf(KIT_STYLES.rgs[0])
		expect(css).toMatch(/"Golos Text"|'Golos Text'/)
		expect(css).not.toMatch(/TT ?Firs|@media|z-index/i)
		const plain = (key: keyof typeof kit.elements) => renderToStaticMarkup(kit.elements[key]).replace(/<[^>]+>/g, '').replace(/\u00a0/g, ' ')
		expect(plain('replica')).toBe('Случился перепад напряжения в электросети.')
		expect(plain('panel')).toBe('Помогите починить сгоревшую техникуПомочь')
		// Логотип — Lottie из шапки игры: в разметке только пилюля, SVG анимации плеер вставляет в браузере
		expect(renderToStaticMarkup(kit.elements.logo)).toBe('<span class="rgs-logo"></span>')
	})
})
