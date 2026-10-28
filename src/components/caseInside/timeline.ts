import { useEffect, useState } from 'react'
import { useMotionValue, useMotionValueEvent, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))
/** 0…1 внутри отрезка [from, to] */
export const seg = (p: number, from: number, to: number) => clamp((p - from) / (to - from))

export type ChapterRect = { top: number; height: number }

/**
 * Время сюжета по прямоугольникам глав: индекс последней главы, чей верх прошёл линию активации, плюс доля главы
 * за линией. До первой главы — 0; после конца последней — count (доля 1)
 */
export function timelineAt(rects: ChapterRect[], line: number) {
	let t = 0
	rects.forEach((r, i) => {
		if (r.top <= line) t = i + clamp((line - r.top) / r.height)
	})
	return t
}

/** Индекс активной главы по времени сюжета */
export const chapterOf = (t: number, count: number) => clamp(Math.floor(t), 0, count - 1)

/**
 * MotionValue, который пересчитывается при прокрутке и ресайзе (один rAF на событие). Значение не проходит через
 * React-состояние: сцены подписываются на него через useTransform и обновляют DOM сами
 */
export function useScrollValue(compute: () => number) {
	const value = useMotionValue(0)
	useEffect(() => {
		let raf = 0
		const update = () => {
			raf = 0
			value.set(compute())
		}
		const schedule = () => {
			if (!raf) raf = requestAnimationFrame(update)
		}
		update()
		window.addEventListener('scroll', schedule, { passive: true })
		window.addEventListener('resize', schedule)
		return () => {
			cancelAnimationFrame(raf)
			window.removeEventListener('scroll', schedule)
			window.removeEventListener('resize', schedule)
		}
	}, [value, compute])
	return value
}

/** Прогресс главы i по времени сюжета: 0…1 */
export function useChapterProgress(t: MotionValue<number>, i: number) {
	return useTransform(t, v => clamp(v - i))
}

/** Число пройденных порогов — React-состояние для дискретных переключений (выбранные фильтры, принятые заявки) */
export function useStep(p: MotionValue<number>, thresholds: number[]) {
	const count = (v: number) => thresholds.filter(th => v >= th).length
	const [step, setStep] = useState(() => count(p.get()))
	useMotionValueEvent(p, 'change', v => {
		const next = count(v)
		setStep(prev => (prev === next ? prev : next))
	})
	return step
}

/** Значение прошло порог (true/false) */
export const useAfter = (p: MotionValue<number>, at: number) => useStep(p, [at]) > 0

/** Доля отрезка [from, to] прогресса как MotionValue 0…1 */
export function useSeg(p: MotionValue<number>, from: number, to: number) {
	return useTransform(p, v => seg(v, from, to))
}

/** Текст набирается по мере прогресса на отрезке */
export function useTyped(p: MotionValue<number>, text: string, from: number, to: number) {
	return useTransform(p, v => text.slice(0, Math.round(seg(v, from, to) * text.length)))
}

/** Число, плавно идущее от a к b на отрезке; округляется и форматируется с неразрывным пробелом тысяч */
export function useCount(p: MotionValue<number>, from: number, to: number, a: number, b: number) {
	return useTransform(p, v => Math.round(a + (b - a) * seg(v, from, to)).toLocaleString('ru-RU'))
}

export const pad2 = (n: number) => String(n).padStart(2, '0')
