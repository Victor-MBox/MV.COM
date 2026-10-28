import { describe, expect, it } from 'vitest'
import { NORANDOMS_VIDEO, VIDEO_TIMELINE } from '../data/caseVideo'
import { PROJECTS, getProject, isPublic } from '../data/projects'
import { PROOF } from '../data/home'
import { NBSP, RANGE_DASH, formatStat, parseStat } from '../components/stat/formatStat'
import {
	chapterAt,
	chapterHeight,
	chapterProgress,
	copyShift,
	countAt,
	countUp,
	follow,
	frameTime,
	markerState,
	needsSeek,
	pickSource,
	timeAt,
} from '../components/caseVideo/videoMath'

const video = NORANDOMS_VIDEO
const { chapters } = video
const norandoms = () => {
	const p = getProject('norandoms')
	if (!p) throw new Error('кейс norandoms не найден')
	return p
}
/** Версии стека («Laravel 12», «React 19») и названия игр («Counter-Strike 2») числами не считаются (ТЗ §7.1) */
const withoutVersions = (s: string) => s.replace(/(Laravel|React|PHP|Node|Counter-Strike)\s?\d+/g, '$1')

describe('видео-рассказ NoRandoms: данные', () => {
	it('подключён к проекту и важнее старого сюжета; CaseStory остаётся в данных для сравнения', () => {
		expect(norandoms().video).toBe(video)
		expect(norandoms().story).toBeTruthy()
	})

	it('ролик и файлы: 90 с, 30 к/с, 4:5, три источника, постер и кадр у каждой главы', () => {
		expect(video.duration).toBe(90)
		expect(video.fps).toBe(30)
		expect(video.width / video.height).toBe(4 / 5)
		expect(video.sources.desktop).toMatch(/norandoms-scroll\.mp4$/)
		expect(video.sources.light).toMatch(/norandoms-scroll-light\.mp4$/)
		expect(video.sources.mobile).toMatch(/norandoms-scroll-mobile\.mp4$/)
		expect(video.poster).toMatch(/poster\.jpg$/)
		chapters.forEach((c, i) => expect(c.keyframe).toMatch(new RegExp(`${String(i + 1).padStart(2, '0')}-${c.key}\\.webp$`)))
	})

	it('главы — из timeline.json, идут встык без дыр от 0 до конца ролика', () => {
		expect(chapters.map(c => c.key)).toEqual(VIDEO_TIMELINE.chapters.map(c => c.key))
		expect(chapters.length).toBe(12)
		expect(chapters[0].start).toBe(0)
		expect(chapters.at(-1)?.end).toBe(video.duration)
		chapters.forEach((c, i) => {
			expect(c.end).toBeGreaterThan(c.start)
			if (i > 0) expect(c.start).toBe(chapters[i - 1].end)
		})
	})

	it('у каждой главы метка, заголовок до шести слов, абзацы до 300 знаков; метки уникальны', () => {
		const labels = chapters.map(c => c.label)
		expect(new Set(labels).size).toBe(labels.length)
		chapters.forEach(c => {
			expect(c.label).toMatch(/^[a-zа-яё ]+$/)
			expect(c.title.split(/\s+/).filter(w => w !== '—').length).toBeLessThanOrEqual(6)
			expect(c.text.length).toBeGreaterThanOrEqual(1)
			expect(c.text.length).toBeLessThanOrEqual(2)
			expect(c.text.join('').length).toBeLessThanOrEqual(300)
		})
	})

	it('маркеры: 2–4 на главу, до 80 знаков, beat — момент ролика внутри своей главы (по timeline.json)', () => {
		chapters.forEach(c => {
			const beats = VIDEO_TIMELINE.chapters.find(x => x.key === c.key)?.beats.map(b => b.t) ?? []
			if (!c.markers) return
			expect(c.markers.length).toBeGreaterThanOrEqual(2)
			expect(c.markers.length).toBeLessThanOrEqual(4)
			c.markers.forEach((m, i) => {
				expect(m.text.length).toBeLessThanOrEqual(80)
				expect(m.beat).toBeGreaterThanOrEqual(c.start)
				expect(m.beat).toBeLessThan(c.end)
				expect(beats).toContain(m.beat)
				if (i > 0) expect(m.beat).toBeGreaterThan(c.markers![i - 1].beat)
			})
		})
		// В главах 02–10 есть маркеры, у вступления — стек, у SEO — счётчики, у финала — кнопки
		expect(chapters.slice(1, 10).every(c => c.markers?.length)).toBe(true)
		expect(chapters[0].stack?.items.length).toBeGreaterThan(3)
		expect(chapters[0].stack!.beat).toBeGreaterThanOrEqual(chapters[0].start)
		expect(chapters.find(c => c.key === 'seo')?.counters?.length).toBeGreaterThan(0)
		expect(chapters.filter(c => c.final).map(c => c.key)).toEqual(['outro'])
	})

	it('числа — только в счётчиках SEO и в финале: в заголовках, текстах и маркерах глав цифр нет', () => {
		chapters
			.filter(c => !c.final)
			.forEach(c => {
				;[c.title, ...c.text, ...(c.markers ?? []).map(m => m.text)].forEach(s => expect(withoutVersions(s)).not.toMatch(/\d/))
			})
	})

	it('мобильное приложение упоминается один раз — в главе уведомлений, с оговоркой «готовится к релизу»', () => {
		const all = chapters.flatMap(c => [c.key, [c.title, ...c.text, ...(c.markers ?? []).map(m => m.text)].join(' ')] as const)
		const mentions = chapters.filter(c => /мобильн/i.test([c.title, ...c.text, ...(c.markers ?? []).map(m => m.text)].join(' ')))
		expect(mentions.map(c => c.key)).toEqual(['notify'])
		expect(all.join(' ').match(/готовится к релизу/g)?.length).toBe(1)
		expect(all.join(' ')).not.toMatch(/реальн\w* пользовател/i) // на экранах — витринные данные
	})

	it('счётчики SEO: показатели проекта по ключу, отрезки внутри главы; 91% хранится, но скрыт', () => {
		const seo = chapters.find(c => c.key === 'seo')!
		const metrics = norandoms().metrics
		seo.counters!.forEach(cn => {
			expect(metrics.find(m => m.key === cn.metric)).toBeTruthy()
			expect(cn.from).toBeGreaterThanOrEqual(seo.start)
			expect(cn.to).toBeLessThanOrEqual(seo.end)
			expect(cn.to).toBeGreaterThan(cn.from)
		})
		const top10 = metrics.find(m => m.key === 'top10')!
		expect(top10.value).toBe(91)
		expect(isPublic(top10)).toBe(false)
		expect(top10.hidden).toMatch(/скриншоты/)
		// Видимых счётчиков четыре, со снятым hidden станет пять — раскладка рассчитана на оба случая
		expect(seo.counters!.filter(cn => metrics.some(m => m.key === cn.metric && isPublic(m))).length).toBe(4)
	})

	it('темп прокрутки: на десктопе ≈ 17 экранов на весь ролик, главы не короче экрана и не длиннее 2,2 экрана', () => {
		const screens = chapters.reduce((s, c) => s + chapterHeight(c, video.pace.desktop, video.pace.min, video.pace.max), 0) / 100
		expect(screens).toBeGreaterThan(15)
		expect(screens).toBeLessThan(20)
		expect(video.pace.mobile).toBeLessThan(video.pace.desktop)
	})
})

describe('цифры NoRandoms по всему сайту (свежий набор от 28.10.2026)', () => {
	it('показатели: 17 000+ страниц, 5 000+ в индексе, 91% (скрыт), 300–800 посетителей и 50–70 регистраций в день', () => {
		const shown = norandoms().metrics.map(m => `${formatStat(m.value)}${m.suffix ?? ''}`)
		expect(shown).toEqual(['17 000+', '5 000+', '91%', `300${RANGE_DASH}800`, `50${RANGE_DASH}70`].map(s => s.replace(/ /g, NBSP)))
		const keys = norandoms().metrics.map(m => m.key)
		expect(new Set(keys).size).toBe(keys.length)
	})

	it('старых цифр (6 000+, 18 000+, 500+, 92%) нет ни в проектах, ни в доказательствах главной', () => {
		const text = JSON.stringify({ PROJECTS, PROOF })
		;[/6\s?000/, /18\s?000/, /500\+/, /92\s?%/, /"value":\s?(6000|18000|500|92)\b/].forEach(re => expect(text).not.toMatch(re))
	})

	it('факты карточки совпадают с показателями: 17 000+ страниц, 91% скрыт', () => {
		const p = norandoms()
		const pages = p.metrics.find(m => m.key === 'pages')!
		const fact = p.highlights!.find(h => /страниц под игры/.test(h.label))!
		expect(parseStat(fact.value)).toEqual({ value: pages.value, suffix: pages.suffix })
		expect(p.highlights!.filter(isPublic).some(h => /топ-10/.test(h.label))).toBe(false)
	})

	it('formatStat: диапазон с тире без пробелов, разряды — неразрывным пробелом', () => {
		expect(formatStat([300, 800])).toBe(`300${RANGE_DASH}800`)
		expect(formatStat([1500, 2000])).toBe(`1${NBSP}500${RANGE_DASH}2${NBSP}000`)
		expect(formatStat(17000)).toBe(`17${NBSP}000`)
	})
})

describe('видео-рассказ: математика', () => {
	const vh = 900
	const heights = chapters.map(c => (chapterHeight(c, video.pace.desktop) / 100) * vh)
	const tops = heights.map((_, i) => heights.slice(0, i).reduce((a, b) => a + b, 0))
	const line = vh / 2
	/** Прямоугольники глав при прокрутке на y пикселей от верха первой главы, если она стоит на линии */
	const rectsAt = (y: number) => tops.map((top, i) => ({ top: line + top - y, height: heights[i] }))
	const total = heights.reduce((a, b) => a + b, 0)

	it('timeAt: 0 до секции, конец ролика после, монотонна и непрерывна по прокрутке', () => {
		expect(timeAt(rectsAt(-500), line, chapters)).toBe(0)
		expect(timeAt(rectsAt(0), line, chapters)).toBe(0)
		expect(timeAt(rectsAt(total), line, chapters)).toBe(90)
		expect(timeAt(rectsAt(total + 2000), line, chapters)).toBe(90)
		let prev = -1
		for (let y = -200; y <= total + 200; y += 7) {
			const t = timeAt(rectsAt(y), line, chapters)
			expect(t).toBeGreaterThanOrEqual(prev)
			if (prev >= 0) expect(t - prev).toBeLessThan(0.5) // без скачков на границах глав
			prev = t
		}
	})

	it('timeAt: граница глав попадает ровно на смену сцены; chapterAt — обратная операция', () => {
		chapters.forEach((c, i) => {
			expect(timeAt(rectsAt(tops[i]), line, chapters)).toBeCloseTo(c.start, 6)
			expect(chapterAt(c.start + 0.01, chapters).index).toBe(i)
			const mid = c.start + (c.end - c.start) / 2
			const back = chapterAt(timeAt(rectsAt(tops[i] + heights[i] / 2), line, chapters), chapters)
			expect(back.index).toBe(i)
			expect(back.p).toBeCloseTo(0.5, 6)
			expect(chapterProgress(mid, c)).toBeCloseTo(0.5, 6)
		})
		expect(chapterAt(90, chapters)).toEqual({ index: 11, p: 1 })
		expect(chapterAt(0, chapters)).toEqual({ index: 0, p: 0 })
	})

	it('markerState и countUp обратимы: одно t — одно состояние в любом порядке прокрутки', () => {
		const ts = [0, 12, 48.2, 47.9, 90, 30, 82, 86.1, 81.3, 5, 48.1, 85.6]
		const beat = 48.25
		const seq = ts.map(t => markerState(t, beat))
		const rev = [...ts].reverse().map(t => markerState(t, beat)).reverse()
		expect(seq).toEqual(rev)
		expect(markerState(beat - 0.31, beat)).toBe(0)
		expect(markerState(beat, beat)).toBeCloseTo(0.5, 6)
		expect(markerState(beat + 0.31, beat)).toBe(1)
		const span = { from: 85.5, to: 87 }
		expect(ts.map(t => countUp(t, span, [300, 800]))).toEqual([...ts].reverse().map(t => countUp(t, span, [300, 800])).reverse())
	})

	it('countUp: ноль до отрезка, ровно значение к концу отрезка, обе границы диапазона, не убывает', () => {
		const span = { from: 78.8, to: 81.4 }
		expect(countAt(78.8, span, 17000)).toBe(0)
		expect(countAt(81.4, span, 17000)).toBe(17000)
		expect(countAt(90, span, 17000)).toBe(17000)
		expect(countUp(87, { from: 85.5, to: 87 }, [300, 800])).toEqual([300, 800])
		expect(countUp(70, { from: 85.5, to: 87 }, [50, 70])).toEqual([0, 0])
		let prev = 0
		for (let t = 78; t < 82; t += 0.05) {
			const v = countAt(t, span, 17000)
			expect(v).toBeGreaterThanOrEqual(prev)
			prev = v
		}
	})

	it('follow: догоняет цель, при скачке больше двух секунд — сразу; frameTime и needsSeek', () => {
		expect(follow(10, 11)).toBeCloseTo(10.35, 6)
		expect(follow(10, 13)).toBe(13)
		expect(follow(10, 10.001)).toBe(10.001)
		let shown = 0
		for (let i = 0; i < 60; i++) shown = follow(shown, 1.5)
		expect(shown).toBe(1.5)
		expect(frameTime(95, 90, 30)).toBeLessThan(90)
		expect(frameTime(95, 90, 30)).toBeGreaterThan(90 - 1 / 30)
		expect(frameTime(-1, 90, 30)).toBe(0)
		expect(needsSeek(10, 10.01)).toBe(false)
		expect(needsSeek(10, 10.02)).toBe(true)
	})

	it('длинный текст главы доезжает вверх по ходу главы, обратимо; помещающийся — стоит', () => {
		expect(copyShift(0.5, 0)).toBe(0)
		expect(copyShift(0, 120)).toBe(-0)
		expect(copyShift(0.1, 120)).toBe(-0)
		expect(copyShift(0.45, 120)).toBeCloseTo(-60, 6)
		expect(copyShift(0.8, 120)).toBe(-120)
		expect(copyShift(1, 120)).toBe(-120)
		const ps = [0.9, 0.2, 0.6, 0.35, 0.05]
		expect(ps.map(p => copyShift(p, 80))).toEqual([...ps].reverse().map(p => copyShift(p, 80)).reverse())
	})

	it('выбор файла: узкий экран и экономия трафика — мобильный, 2g/3g — облегчённый, иначе основной', () => {
		expect(pickSource({ narrow: true })).toBe('mobile')
		expect(pickSource({ narrow: false, saveData: true, effectiveType: '4g' })).toBe('mobile')
		expect(pickSource({ narrow: false, effectiveType: '3g' })).toBe('light')
		expect(pickSource({ narrow: false, effectiveType: 'slow-2g' })).toBe('light')
		expect(pickSource({ narrow: false, effectiveType: '4g' })).toBe('desktop')
		expect(pickSource({ narrow: false })).toBe('desktop')
	})
})
