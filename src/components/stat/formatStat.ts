/** Неразрывный пробел между разрядами: «6 000» не должно рваться на две строки */
export const NBSP = String.fromCharCode(160)

/** «6000» → «6 000» с неразрывными пробелами между разрядами */
export function formatStat(value: number) {
	return new Intl.NumberFormat('ru-RU', { useGrouping: true }).format(value).replace(/\s/g, NBSP)
}
