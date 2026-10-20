import { useEffect, useState } from 'react'

const formatter = new Intl.DateTimeFormat('ru-RU', { timeZone: 'Asia/Tbilisi', hour: '2-digit', minute: '2-digit' })

function now() {
	return formatter.format(new Date())
}

/** Время в Тбилиси «HH:MM», обновляется раз в минуту (docs/design-spec.md §6.15) */
export function useClock() {
	const [time, setTime] = useState(now)
	useEffect(() => {
		let interval = 0
		const toNextMinute = 60_000 - (Date.now() % 60_000)
		const timeout = window.setTimeout(() => {
			setTime(now())
			interval = window.setInterval(() => setTime(now()), 60_000)
		}, toNextMinute)
		return () => {
			window.clearTimeout(timeout)
			window.clearInterval(interval)
		}
	}, [])
	return time
}
