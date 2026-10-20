/**
 * Условия по маршруту в одном месте (docs/design-spec-home4.md §4.5): какие страницы живут на дизайн-системе 1.0
 * (скоуп body.v2, LeadForm в модалке, SiteFooter) и на какой из них навигация в верхней шапке вместо левого меню.
 * После выбора одной главной и переноса внутренних страниц эти условия исчезают вместе со скоупом.
 */

/** Все пути из <Routes> в App — тест home4.test.ts проверяет по ним ссылки шапки */
export const ROUTE_PATHS = [
	'/',
	'/home2',
	'/home3',
	'/home4',
	'/services',
	'/services/:offer',
	'/portfolio',
	'/portfolio/:slug',
	'/about',
	'/blog',
	'/blog/:slug',
	'/contacts',
] as const

/** Варианты главной: пункт «Главная» в левом меню активен */
export const HOME_ROUTES = ['/', '/home2', '/home3', '/home4'] as const

/** Страницы на дизайн-системе 1.0 (docs/design-spec.md): класс body.v2, LeadForm, SiteFooter */
export const V2_ROUTES = ['/home3', '/home4'] as const

export function isHomeRoute(pathname: string) {
	return (HOME_ROUTES as readonly string[]).includes(pathname)
}

export function isV2Route(pathname: string) {
	return (V2_ROUTES as readonly string[]).includes(pathname)
}

/** Навигация в верхней шапке (TopHeader) вместо левого меню */
export function isTopHeaderRoute(pathname: string) {
	return pathname === '/home4'
}
