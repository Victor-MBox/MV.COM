import { LEGAL_VERSIONS, RETENTION, STORAGE_INVENTORY } from '../data/legal'
import { clearStoredTheme } from '../hooks/useTheme'

/**
 * Состояние уведомления о хранилище и окна «Настройки cookie» (ТЗ §10, режим «аналитики нет»; решение владельца от
 * 22.10.2026 — баннер информационный). Один стор на всё приложение (useSyncExternalStore в CookieNotice / CookieSettings),
 * без гонок при роутинге. В localStorage хранится только отметка «уведомление закрыто» с датой и версией текста —
 * никаких контактов и содержимого заявок. Ошибка хранилища сайт не ломает: уведомление просто покажется снова
 */

export const NOTICE_KEY = 'privacy-notice'

/** Версия текста уведомления = редакция страницы /cookies: новая редакция — уведомление показывается снова */
export const NOTICE_VERSION = LEGAL_VERSIONS.cookies

/** Срок, после которого уведомление показывается снова (продуктовое решение ТЗ §10, не требование закона) */
export const NOTICE_TTL_MS = RETENTION.noticeDays * 86_400_000

/** Все записи сайта в хранилище браузера (data/legal.ts STORAGE_INVENTORY) — их удаляет «Удалить сохранённые настройки» */
export const SITE_STORAGE_KEYS = {
	local: STORAGE_INVENTORY.filter(s => s.storage === 'localStorage').map(s => s.key),
	session: STORAGE_INVENTORY.filter(s => s.storage === 'sessionStorage').map(s => s.key),
}

export type NoticeRecord = { version: string; dismissedAt: string }
export type NoticeState = 'open' | 'dismissed'

/** Разбор сохранённой отметки: нужна актуальная версия и срок не старше NOTICE_TTL_MS, иначе отметки как бы нет */
export function parseNoticeRecord(raw: string | null, now = Date.now()): NoticeRecord | null {
	if (!raw) return null
	try {
		const value: unknown = JSON.parse(raw)
		if (typeof value !== 'object' || value === null) return null
		const { version, dismissedAt } = value as Partial<NoticeRecord>
		if (typeof version !== 'string' || typeof dismissedAt !== 'string') return null
		if (version !== NOTICE_VERSION) return null
		const at = Date.parse(dismissedAt)
		if (Number.isNaN(at) || now - at > NOTICE_TTL_MS || at - now > 86_400_000) return null
		return { version, dismissedAt }
	} catch {
		return null
	}
}

function readState(): NoticeState {
	try {
		return parseNoticeRecord(localStorage.getItem(NOTICE_KEY)) ? 'dismissed' : 'open'
	} catch {
		return 'open'
	}
}

let state: NoticeState | null = null
let settingsOpen = false
const listeners = new Set<() => void>()

function emit() {
	listeners.forEach(l => l())
}

export function subscribeNotice(listener: () => void) {
	listeners.add(listener)
	return () => {
		listeners.delete(listener)
	}
}

export function getNoticeState(): NoticeState {
	if (state === null) state = readState()
	return state
}

/** «Понятно»: отметка с датой и версией; при недоступном хранилище выбор действует до перезагрузки */
export function dismissNotice(now = new Date()) {
	const record: NoticeRecord = { version: NOTICE_VERSION, dismissedAt: now.toISOString() }
	try {
		localStorage.setItem(NOTICE_KEY, JSON.stringify(record))
	} catch {
		// приватный режим или запрет хранения — уведомление покажется снова при следующем визите
	}
	state = 'dismissed'
	emit()
}

export function isSettingsOpen() {
	return settingsOpen
}

export function openCookieSettings() {
	settingsOpen = true
	emit()
}

export function closeCookieSettings() {
	settingsOpen = false
	emit()
}

/** Какие из записей сайта сейчас есть в хранилище этого браузера — для окна настроек */
export function readStoredKeys(): string[] {
	const found: string[] = []
	try {
		for (const key of SITE_STORAGE_KEYS.local) if (localStorage.getItem(key) !== null) found.push(key)
	} catch {
		// хранилище недоступно
	}
	try {
		for (const key of SITE_STORAGE_KEYS.session) if (sessionStorage.getItem(key) !== null) found.push(key)
	} catch {
		// хранилище недоступно
	}
	return found
}

/**
 * «Удалить сохранённые настройки»: все записи сайта удаляются, тема возвращается к системной. В этой сессии
 * уведомление не возвращаем (посетитель только что его читал в настройках) — покажется при следующем посещении
 */
export function clearSiteStorage() {
	try {
		for (const key of SITE_STORAGE_KEYS.local) localStorage.removeItem(key)
	} catch {
		// хранилище недоступно
	}
	try {
		for (const key of SITE_STORAGE_KEYS.session) sessionStorage.removeItem(key)
	} catch {
		// хранилище недоступно
	}
	clearStoredTheme()
	state = 'dismissed'
	emit()
}

/** Для тестов: забыть прочитанное состояние */
export function resetNoticeStateForTests() {
	state = null
	settingsOpen = false
}
