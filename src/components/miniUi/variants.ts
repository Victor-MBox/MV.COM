/** Варианты мини-интерфейса — ключи офферов (data/offers.ts): у каждого оффера своя композиция */
export const MINI_UI_VARIANTS = ['web-service', 'ecommerce', 'integrations', 'landing', 'corporate', 'support', 'agencies'] as const

export type MiniUiVariant = (typeof MINI_UI_VARIANTS)[number]

/** Вариант для оффера; undefined, если у нового оффера своей композиции ещё нет */
export const miniUiVariant = (key: string) => MINI_UI_VARIANTS.find(v => v === key)
