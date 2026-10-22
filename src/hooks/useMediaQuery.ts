import { useSyncExternalStore } from 'react'

/** Медиазапросы, от которых зависит движение (docs/design-spec.md §8.7, §8.8) */
export const MQ = {
	reduced: '(prefers-reduced-motion: reduce)',
	coarse: '(pointer: coarse)',
	hover: '(hover: hover)',
	tablet: '(max-width: 992px)',
	phone: '(max-width: 560px)',
} as const

function subscribe(query: string, onChange: () => void) {
	const mq = window.matchMedia(query)
	mq.addEventListener('change', onChange)
	return () => mq.removeEventListener('change', onChange)
}

/** Подписка на matchMedia без setState в эффектах */
export function useMediaQuery(query: string) {
	return useSyncExternalStore(
		onChange => subscribe(query, onChange),
		() => window.matchMedia(query).matches,
		() => false
	)
}

/** Стаггер появления: 60 мс на десктопе, 40 мс на планшете и тач-устройствах (§8.8) */
export function useStagger() {
	const tablet = useMediaQuery(MQ.tablet)
	const coarse = useMediaQuery(MQ.coarse)
	return tablet || coarse ? 0.04 : 0.06
}
