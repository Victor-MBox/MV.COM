/**
 * Собирает стили продукта NoRandoms из скомпилированных бандлов: оставляет правила, чьи классы встречаются в разметке
 * компонентов, вкладывает их под класс-корень и пишет CSS рядом с компонентами. Две цели:
 *   node scripts/nr-product-css.mjs /path/to/gamer-social
 *     сцены «кейса изнутри»: бандлы front-*.css / guest-*.css из папки проекта NoRandoms (только чтение), разметка —
 *     src/components/caseInside/product/*.tsx и scenes/*.tsx, корень `.nr-ui` → caseInside/product/nr-product.css
 *   node scripts/nr-product-css.mjs --cover [https://norandoms.team]
 *     обложка кейса (FloatingPreview): бандлы живого сайта (ссылки из HTML главной и /teammates), разметка —
 *     src/components/floatingPreview/norandoms/*.tsx, корень `.nr-cover` → floatingPreview/norandoms/nr-cover.css.
 *     Здесь же сохраняются простые правила тегов (h1–h6, p, a, button): у продукта шрифт заголовков задан на h3
 * Медиазапросы по max-width выбрасываются: холст всегда «десктопный», а viewport сайта может быть узким
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import postcss from 'postcss'

const cover = process.argv[2] === '--cover'
const tsxOf = dirs => dirs.flatMap(dir => readdirSync(dir).filter(f => f.endsWith('.tsx')).map(f => readFileSync(join(dir, f), 'utf8'))).join('\n')

/** Бандлы: [имя, css] */
let bundles
let here
let tsx
if (cover) {
	const site = (process.argv[3] ?? 'https://norandoms.team').replace(/\/$/, '')
	const pages = await Promise.all([`${site}/`, `${site}/teammates`].map(u => fetch(u).then(r => r.text())))
	const links = Array.from(new Set(pages.flatMap(html => Array.from(html.matchAll(/["'](?:https?:\/\/[^"']+)?(\/?build\/assets\/[^"']+\.css)["']/g), m => m[1]))))
	if (!links.length) throw new Error(`на ${site} не найдены ссылки build/assets/*.css`)
	bundles = await Promise.all(links.map(async l => [l, await fetch(`${site}/${l.replace(/^\//, '')}`).then(r => r.text())]))
	here = resolve('src/components/floatingPreview/norandoms')
	tsx = tsxOf([here])
} else {
	const root = process.argv[2]
	if (!root) throw new Error('укажите путь к папке проекта NoRandoms или --cover')
	const assets = join(root, 'public/build/assets')
	const files = readdirSync(assets).filter(f => /^(front|guest)-.*\.css$/.test(f))
	if (!files.length) throw new Error('в public/build/assets нет бандлов front-*.css / guest-*.css')
	bundles = files.map(f => [f, readFileSync(join(assets, f), 'utf8')])
	here = resolve('src/components/caseInside/product')
	tsx = tsxOf([here, resolve('src/components/caseInside/scenes')])
}
/**
 * Классы сцен: любые BEM-подобные токены из текста компонентов (className, шаблонные строки, тернарники) плюс
 * модификаторы, которые собираются из переменных (`tm-card__status-dot--${presence}` и т. п.) — их перечисляем явно.
 * Лишние токены безвредны: правило попадёт в выдачу, только если такой класс есть в бандле продукта
 */
const used = new Set()
for (const m of tsx.matchAll(/[a-z][a-z0-9]*(?:[-_][a-z0-9]+)*(?:__[a-z0-9_-]+)?(?:--[a-z0-9_-]+)?/g)) used.add(m[0])
const DYNAMIC = {
	'tm-card__status-dot': ['online', 'recent', 'offline'],
	'tm-card__avatar': ['male', 'female', 'minor'],
	'compat-page__avatar-wrap': ['male', 'female', 'unknown'],
	'compat-page__hero': ['low', 'medium', 'good', 'high'],
	'compat-preferences__icon': ['ok', 'warn', 'bad'],
	'party-intro__format-option': ['lfg', 'parties'],
	'parties-created-switch__option': ['lfg', 'parties', 'event'],
	'home-game-card__stat': ['preference', 'steam', 'party'],
	'user-identity': ['compact', 'embedded'],
	'user-summary': ['compact', 'embedded'],
	'party-card__slot': ['empty', 'filled'],
}
Object.entries(DYNAMIC).forEach(([base, mods]) => mods.forEach(m => used.add(`${base}--${m}`)))
;['nr-ui', 'nr-cover', 'is-steam-in-game', 'is-active', 'is-loaded', 'has-value', 'is-linked', 'is-pulsing', 'is-pressed', 'is-dimmed', 'is-speaking', 'is-muted'].forEach(c => used.add(c))

const SCOPE = cover ? '.nr-cover' : '.nr-ui'
/** Теги, чьи простые правила нужны обложке (шрифт заголовков, сброс отступов и ссылок) */
const TAGS = /^(h[1-6]|p|a|button)$/
const classRe = /\.(-?[_a-zA-Z][_a-zA-Z0-9-]*)/g
const keepSelector = sel => {
	// Все классы селектора должны быть в списке; селекторы без классов (html, body, *) — отдельно
	const classes = Array.from(sel.replace(/\\./g, '').matchAll(classRe)).map(m => m[1])
	if (!classes.length) return /^(html|body|:root|\*|\*,|\*::before|\*::after)$/.test(sel.trim()) || (cover && TAGS.test(sel.trim()))
	return classes.every(c => used.has(c))
}
const scope = sel => {
	const s = sel.trim()
	if (/^(html|body|:root)$/.test(s)) return SCOPE
	if (/^(\*|\*::before|\*::after)$/.test(s)) return `${SCOPE} ${s}`
	return `${SCOPE} ${s}`
}

const out = postcss.root()
const keyframesUsed = new Set()
let kept = 0
for (const [, source] of bundles) {
	const css = postcss.parse(source)
	const walk = (container, target) => {
		container.each(node => {
			if (node.type === 'rule') {
				const sels = node.selectors.filter(keepSelector)
				if (!sels.length) return
				const clone = node.clone()
				clone.selectors = sels.map(scope)
				clone.walkDecls(d => {
					const m = /animation(?:-name)?/.test(d.prop) && d.value.match(/[a-zA-Z_][\w-]*/)
					if (m) keyframesUsed.add(m[0])
				})
				target.append(clone)
				kept++
			} else if (node.type === 'atrule') {
				if (node.name === 'media') {
					if (/max-width/.test(node.params)) return
					const at = postcss.atRule({ name: 'media', params: node.params })
					walk(node, at)
					if (at.nodes?.length) target.append(at)
				} else if (node.name === 'supports') {
					const at = postcss.atRule({ name: 'supports', params: node.params })
					walk(node, at)
					if (at.nodes?.length) target.append(at)
				} else if (node.name === 'keyframes') {
					target.append(node.clone())
				}
			}
		})
	}
	walk(css, out)
}
// Кейфреймы — только используемые
out.walkAtRules('keyframes', at => {
	if (!keyframesUsed.has(at.params)) at.remove()
})
const from = cover ? `бандлов ${bundles.map(([name]) => name.split('/').pop()).join(', ')} с ${process.argv[3] ?? 'https://norandoms.team'}` : 'бандлов NoRandoms'
const header = `/* Сгенерировано scripts/nr-product-css.mjs${cover ? ' --cover' : ''} из ${from} — не править руками. ${new Date().toISOString().slice(0, 10)} */\n`
writeFileSync(join(here, cover ? 'nr-cover.css' : 'nr-product.css'), header + out.toString())
console.log(`классов в сценах: ${used.size}, правил оставлено: ${kept}, размер: ${(Buffer.byteLength(out.toString()) / 1024).toFixed(1)} КБ`)
