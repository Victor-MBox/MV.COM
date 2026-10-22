/** Все пути из <Routes> в App — тест home.test.ts проверяет по ним ссылки шапки */
export const ROUTE_PATHS = [
	'/',
	'/services',
	'/services/promotion',
	'/services/promotion/:offer',
	'/services/:offer',
	'/portfolio',
	'/portfolio/:slug',
	'/about',
	'/blog',
	'/blog/:slug',
	'/contacts',
	// Документы (data/legal.ts): три самостоятельные страницы, ссылки в футере и у чекбокса согласия
	'/privacy',
	'/personal-data-consent',
	'/cookies',
] as const
