/** Все пути из <Routes> в App — тест home.test.ts проверяет по ним ссылки шапки */
export const ROUTE_PATHS = [
	'/',
	'/services',
	'/services/:offer',
	'/portfolio',
	'/portfolio/:slug',
	'/about',
	'/blog',
	'/blog/:slug',
	'/contacts',
] as const
