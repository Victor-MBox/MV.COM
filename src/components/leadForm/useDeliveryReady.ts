import { useSyncExternalStore } from 'react'
import { getDeliveryReadiness, subscribeDeliveryReadiness } from '../../api/contact'
import type { DeliveryReadiness } from '../../api/contact'
import { FORM_ENABLED } from '../../data/leadForm'

const serverSnapshot = (): DeliveryReadiness => 'unknown'

/** Готовность обработчика по health (api/contact.ts): unknown → ready | off */
export function useDeliveryReady() {
	return useSyncExternalStore(subscribeDeliveryReadiness, getDeliveryReadiness, serverSnapshot)
}

/**
 * Показывать форму или FormFallback: в публичной сборке форма видна, пока сервер явно не ответил «не настроен»
 * (ответа нет — форма остаётся, сбой покажет отправка); на dev-сервере — всегда (code.md §8)
 */
export function useFormVisible() {
	const readiness = useDeliveryReady()
	return FORM_ENABLED && (import.meta.env.DEV || readiness !== 'off')
}
