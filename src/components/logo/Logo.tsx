import type { SVGProps } from 'react'
import './Logo.scss'

/**
 * Монограмма «VM.» — знак сайта (шапка, favicon). Буквы — один контур `currentColor`, точка — `--accent`,
 * поэтому знак сам следует теме и цвету родителя. Геометрия (Black): высота букв 100, стойки 27, диагонали с наклоном 0,44
 * (перпендикулярно ≈ 27), V 112 и M 124 с одинаковым счётчиком 52 и плоскими вершинами 24, правый штрих V входит в левую
 * стойку M на 8, точка 32 (32 % высоты) с зазором 7 на базовой линии. Те же контуры — в public/favicon.svg, logo.svg,
 * logo-inverted.svg: при правке менять везде.
 */
export default function Logo(props: SVGProps<SVGSVGElement>) {
	return (
		<svg className='logo' viewBox='0 0 267 100' aria-hidden='true' focusable='false' {...props}>
			<path d='M0 0L30 0L56 59.09L82 0L140 0L166 59.09L192 0L228 0L228 100L201 100L201 47.73L178 100L154 100L131 47.73L131 100L104 100L104 18.18L68 100L44 100Z' />
			<circle className='logo__dot' cx='251' cy='84' r='16' />
		</svg>
	)
}
