/** Русские формы: plural(5, ['услуга', 'услуги', 'услуг']) → '5 услуг' */
export function plural(n: number, forms: [string, string, string]) {
	const abs = Math.abs(n) % 100
	const last = abs % 10
	let form = forms[2]
	if (abs < 10 || abs > 20) {
		if (last === 1) form = forms[0]
		else if (last >= 2 && last <= 4) form = forms[1]
	}
	return `${n} ${form}`
}
