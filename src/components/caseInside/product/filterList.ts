/** Тринадцать фильтров страницы анкет (`<x-teammate-filter-bar>`), в порядке продукта */
export const FILTERS = [
	{ key: 'gender', label: 'Пол' },
	{ key: 'site_status', label: 'На сайте' },
	{ key: 'voice_required', label: 'Микрофон' },
	{ key: 'talkativeness', label: 'Общение' },
	{ key: 'age_ranges', label: 'Возраст' },
	{ key: 'playstyles', label: 'Стиль игры' },
	{ key: 'devices', label: 'Устройства' },
	{ key: 'play_times', label: 'Когда играем' },
	{ key: 'session_length', label: 'Длина сессии' },
	{ key: 'comms_channels', label: 'Каналы связи' },
	{ key: 'toxicity', label: 'Токсичность' },
	{ key: 'mistake_attitude', label: 'Отношение к ошибкам' },
] as const

export type FilterKey = (typeof FILTERS)[number]['key']
