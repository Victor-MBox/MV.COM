import { activeChapter, clamp } from '../caseStory/storyMath'
import type { ChapterRect } from '../caseStory/storyMath'
import type { StatRange } from '../stat/formatStat'

/**
 * Чистая математика видео-рассказа (ТЗ docs/norandoms-scroll-video-spec.md §4–5). Всё состояние секции — функция одного
 * времени сюжета t (секунды ролика): кадр, активная глава, маркеры, счётчики, полоса прогресса. Одно и то же t даёт одно и то же
 * состояние в любом порядке прокрутки — поэтому всё отматывается назад
 */

/** Отрезок видео главы, секунды */
export type Span = { start: number; end: number }

/** Высота главы в vh: длительность её отрезка × темп (vh на секунду видео), в пределах [min, max] */
export const chapterHeight = (span: Span, pace: number, min = 100, max = 220) => clamp((span.end - span.start) * pace, min, max)

/** Доля главы, прошедшая к моменту t: 0…1 */
export const chapterProgress = (t: number, span: Span) => clamp((t - span.start) / (span.end - span.start))

/**
 * Прокрутка → время сюжета. Активная глава — последняя, чей верх прошёл линию активации (`activeChapter`), p — доля главы
 * за линией; t = start + p × длительность. До первой главы — начало ролика, после последней — его конец
 */
export function timeAt(rects: ChapterRect[], line: number, chapters: Span[]) {
	if (!rects.length || !chapters.length) return 0
	const { index, p } = activeChapter(rects, line)
	const c = chapters[index]
	return c.start + p * (c.end - c.start)
}

/** Время → глава: индекс главы, на которую приходится t, и её прогресс (обратно к `timeAt`) */
export function chapterAt(t: number, chapters: Span[]) {
	let index = 0
	chapters.forEach((c, i) => {
		if (t >= c.start) index = i
	})
	return { index, p: chapters.length ? chapterProgress(t, chapters[index]) : 0 }
}

/** Состояние маркера 0…1: до `beat − half` погашен, после `beat + half` горит, между — линейно */
export const markerState = (t: number, beat: number, half = 0.3) => clamp((t - (beat - half)) / (2 * half))

/** Плавное торможение к концу счёта */
export const easeOut = (x: number) => 1 - (1 - x) ** 3

/** Отрезок счёта счётчика, секунды ролика */
export type CountSpan = { from: number; to: number }

/** Значение счётчика в момент t: от нуля до `value` на отрезке; к концу отрезка — ровно `value` */
export function countAt(t: number, span: CountSpan, value: number) {
	return Math.round(value * easeOut(clamp((t - span.from) / (span.to - span.from))))
}

/** Счётчик показателя: число или обе границы диапазона «300–800» */
export function countUp(t: number, span: CountSpan, value: number | StatRange): number | StatRange {
	return typeof value === 'number' ? countAt(t, span, value) : [countAt(t, span, value[0]), countAt(t, span, value[1])]
}

/**
 * Догон показанного времени за целью: доля пути `k` за кадр; скачок больше `jump` секунд (якорь, «наверх», возврат
 * назад по истории) — сразу к цели; остаток меньше `eps` — тоже
 */
export function follow(shown: number, target: number, k = 0.35, jump = 2, eps = 0.002) {
	if (Math.abs(target - shown) > jump) return target
	const next = shown + (target - shown) * k
	return Math.abs(target - next) < eps ? target : next
}

/** Время для `video.currentTime`: в пределах ролика, не дальше середины последнего кадра */
export const frameTime = (t: number, duration: number, fps: number) => clamp(t, 0, duration - 1 / (2 * fps))

/** Кадр нужно менять, только если разница больше 1/60 с */
export const needsSeek = (current: number, want: number) => Math.abs(current - want) > 1 / 60

/**
 * Сдвиг текста главы, который выше места под ним (телефон, низкое окно): по ходу главы текст доезжает вверх на `overflow`
 * px — от доли `from` до доли `to` главы; в начале главы виден верх, к концу — низ
 */
export const copyShift = (p: number, overflow: number, from = 0.1, to = 0.8) => (overflow > 0 ? -overflow * clamp((p - from) / (to - from)) : 0)

export type VideoSourceKey = 'desktop' | 'light' | 'mobile'

/** Какой файл грузить: ≤992 px или экономия трафика → мобильный, медленная сеть → облегчённый, иначе основной */
export function pickSource({ narrow, saveData, effectiveType }: { narrow: boolean; saveData?: boolean; effectiveType?: string }): VideoSourceKey {
	if (narrow || saveData) return 'mobile'
	if (effectiveType && /^(slow-2g|2g|3g)$/.test(effectiveType)) return 'light'
	return 'desktop'
}
