/// <reference types="vite/client" />

interface ImportMetaEnv {
	/** Публичный адрес сайта для canonical и og:url (src/data/meta.ts → SITE_URL). Не задан — эти теги не выводятся */
	readonly VITE_SITE_URL?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
