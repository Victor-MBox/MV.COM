/** Неразрывный пробел между разрядами: «6 000» не должно рваться на две строки */
export const NBSP = String.fromCharCode(160)

/** «6000» → «6 000» с неразрывными пробелами между разрядами */
export function formatStat(value: number) {
	return new Intl.NumberFormat('ru-RU', { useGrouping: true }).format(value).replace(/\s/g, NBSP)
}

/** Обратная операция для строк данных: «18 000+» → { value: 18000, suffix: '+' }; «8 лет» → { 8, ' лет' }; «Февраль 2026» остаётся строкой */
export function parseStat(raw: string): { value: number | string; suffix: string } {
	const m = raw.match(/^(\d(?:[\d\s]*\d)?)(.*)$/) // \s покрывает и неразрывные пробелы между разрядами
	if (!m) return { value: raw, suffix: '' }
	return { value: Number(m[1].replace(/\s/g, '')), suffix: m[2] }
}
