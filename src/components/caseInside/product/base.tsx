import type { CSSProperties, ReactNode } from 'react'
import { SVG } from './svg'
import type { SvgName } from './svg'

/**
 * Основа настоящего интерфейса NoRandoms в сценах: разметка и классы — из отрендеренных страниц продукта и его
 * Blade-компонентов, стили — `nr-product.css` (собирается scripts/nr-product-css.mjs из бандлов продукта и вкладывается
 * под `.nr-ui`), иконки — svg.ts, картинки и справочники — assets.ts. Всё статично: сцены переключают классы состояний,
 * как это делает скрипт продукта
 */

const CONTENTS: CSSProperties = { display: 'contents' }

/** Иконка продукта: svg-строка внутри обёртки без собственного бокса (display: contents) — селекторы вида `.x svg` работают */
export function Svg({ name, className }: { name: SvgName; className?: string }) {
	if (className) return <span className={className} dangerouslySetInnerHTML={{ __html: SVG[name] }} />
	return <span style={CONTENTS} dangerouslySetInnerHTML={{ __html: SVG[name] }} />
}

/** Корень сцены: страница продукта без сайдбара — только область `.app-main` на холсте окна */
export function NrPage({ children, className, style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
	return (
		<div className={['nr-ui', className ?? ''].filter(Boolean).join(' ')} style={style}>
			<main className='app-main nr-ui__main'>{children}</main>
		</div>
	)
}
