/** Неразрывный пробел между разрядами: «6 000» не должно рваться на две строки */
export const NBSP = String.fromCharCode(160)

/** Тире диапазона: «300–800», без пробелов (как в данных владельца) */
export const RANGE_DASH = '–'

/** Показатель-диапазон [от, до]: «300–800 посетителей в день» */
export type StatRange = readonly [number, number]

/** «6000» → «6 000» с неразрывными пробелами между разрядами; диапазон [300, 800] → «300–800» */
export function formatStat(value: number | StatRange): string {
	if (typeof value !== 'number') return `${formatStat(value[0])}${RANGE_DASH}${formatStat(value[1])}`
	return new Intl.NumberFormat('ru-RU', { useGrouping: true }).format(value).replace(/\s/g, NBSP)
}

/** Обратная операция для строк данных: «18 000+» → { value: 18000, suffix: '+' }; «8 лет» → { 8, ' лет' }; «Февраль 2026» остаётся строкой */
export function parseStat(raw: string): { value: number | string; suffix: string } {
	const m = raw.match(/^(\d(?:[\d\s]*\d)?)(.*)$/) // \s покрывает и неразрывные пробелы между разрядами
	if (!m) return { value: raw, suffix: '' }
	return { value: Number(m[1].replace(/\s/g, '')), suffix: m[2] }
}
