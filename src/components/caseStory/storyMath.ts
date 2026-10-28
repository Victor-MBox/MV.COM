import type { StoryRange } from '../../data/caseStory'

export const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v))
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
/** Плавный разгон и торможение прокрутки внутри экрана */
export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2)

/** p внутри отрезка (правая граница не входит; отрезок до 1.01 держит состояние до конца главы) */
export const inRange = (p: number, r?: StoryRange) => !r || (p >= r[0] && p < r[1])
/** 0…1 внутри отрезка */
export const rangeProgress = (p: number, r?: StoryRange) => (r ? clamp((p - r[0]) / (r[1] - r[0])) : p)

export type ChapterRect = { top: number; height: number }

/**
 * Активная глава — последняя, чей верх прошёл линию активации (от верха окна); p — сколько главы прошло за линию.
 * До первой главы активна первая с p = 0
 */
export function activeChapter(rects: ChapterRect[], line: number) {
	let index = 0
	let p = 0
	rects.forEach((r, i) => {
		if (r.top <= line) {
			index = i
			p = clamp((line - r.top) / r.height)
		}
	})
	return { index, p }
}

export type Camera = { z: number; cx: number; cy: number }
export type Size = { w: number; h: number }
export type Region = { x: number; y: number; w: number; h: number }

/** Камера покоя: весь холст */
export const restCamera = (canvas: Size): Camera => ({ z: 1, cx: canvas.w / 2, cy: canvas.h / 2 })

/** Камера на область холста: увеличение, при котором область с полями помещается в холст, но не больше zoomMax и не меньше 1 */
export function fitCamera(region: Region, canvas: Size, zoomMax: number, pad = 48): Camera {
	const z = Math.max(1, Math.min(zoomMax, canvas.w / (region.w + pad * 2), canvas.h / (region.h + pad * 2)))
	return { z, cx: region.x + region.w / 2, cy: region.y + region.h / 2 }
}

/**
 * Transform холста под камеру: холст масштабируется к ширине экрана устройства (k) и увеличивается в z, центр камеры
 * встаёт в центр экрана; сдвиг ограничен так, чтобы холст всегда покрывал экран целиком
 */
export function cameraTransform(cam: Camera, canvas: Size, screen: Size) {
	const s = (screen.w / canvas.w) * cam.z
	const tx = clamp(screen.w / 2 - cam.cx * s, Math.min(0, screen.w - canvas.w * s), 0)
	const ty = clamp(screen.h / 2 - cam.cy * s, Math.min(0, screen.h - canvas.h * s), 0)
	return { s, tx, ty }
}

export const pad2 = (n: number) => String(n).padStart(2, '0')
