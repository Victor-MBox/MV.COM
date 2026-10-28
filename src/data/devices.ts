import laptopSrc from '../resources/devices/macbook-pro-front.webp'
import phoneSrc from '../resources/devices/iphone-18-pro-front.webp'

/** Прямоугольник в пикселях файла рамки */
export type FrameRect = { x: number; y: number; w: number; h: number }

/**
 * Мокап устройства (мокапы владельца от 22.10.2026, вырезаны `docs/prototypes/norandoms-case-story/scripts/cut-devices.py`):
 * рамка с альфой, в которой экран — прозрачная «дыра». Контент лежит под рамкой слоем по `screen`, поэтому скругления экрана,
 * чёлку и Dynamic Island закрывает сама рамка. Холст контента — в CSS-пикселях сайта продукта, масштабируется под ширину дыры
 */
export type DeviceFrame = {
	src: string
	/** Размер файла рамки, px */
	w: number
	h: number
	/** Дыра экрана */
	screen: FrameRect
	/** Чёлка или Dynamic Island — непрозрачная часть рамки внутри дыры */
	island?: FrameRect
	/** Холст контента: ширина в CSS-пикселях продукта, высота — из пропорций дыры; `top` — зона под чёлкой/островом сверху */
	canvas: { w: number; h: number; top: number }
}

/** MacBook Pro анфас: экран 982×592 px рамки (1.659), чёлка 115×20 — на холсте 1440 это 30 px чёрной полосы сверху */
export const LAPTOP: DeviceFrame = {
	src: laptopSrc,
	w: 1308,
	h: 974,
	screen: { x: 163, y: 26, w: 982, h: 592 },
	island: { x: 597, y: 26, w: 115, h: 20 },
	canvas: { w: 1440, h: 868, top: 30 },
}

/** iPhone анфас: экран 568×1222 px рамки (0.465), остров на холсте 390 — y 12…43, статусная зона 54 px */
export const PHONE: DeviceFrame = {
	src: phoneSrc,
	w: 637,
	h: 1278,
	screen: { x: 35, y: 28, w: 568, h: 1222 },
	island: { x: 236, y: 46, w: 165, h: 45 },
	canvas: { w: 390, h: 839, top: 54 },
}

const pct = (v: number) => `${(v * 100).toFixed(3)}%`

/** Положение слоя экрана в процентах рамки — для абсолютного позиционирования под `<img>` рамки */
export function screenStyle(d: DeviceFrame) {
	return {
		left: pct(d.screen.x / d.w),
		top: pct(d.screen.y / d.h),
		width: pct(d.screen.w / d.w),
		height: pct(d.screen.h / d.h),
	}
}
