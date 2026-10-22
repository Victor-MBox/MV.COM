/** Варианты мини-интерфейса — ключи офферов (data/offers.ts): у каждого оффера своя композиция (пять новых — ТЗ от 22.10.2026) */
export const MINI_UI_VARIANTS = [
	'web-service',
	'ecommerce',
	'integrations',
	'landing',
	'corporate',
	'support',
	'agencies',
	'mobile-apps',
	'interactive',
	'seo',
	'context',
	'analytics',
] as const

export type MiniUiVariant = (typeof MINI_UI_VARIANTS)[number]

/** Вариант для оффера; undefined, если у нового оффера своей композиции ещё нет */
export const miniUiVariant = (key: string) => MINI_UI_VARIANTS.find(v => v === key)
