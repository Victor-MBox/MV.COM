import type { ReactNode } from 'react'

// Простые линейные иконки 24×24 для карточек услуг
const ICONS: Record<string, ReactNode> = {
	layout: (
		<>
			<rect x='3' y='4' width='18' height='16' rx='2' />
			<path d='M3 10h18M9 10v10' />
		</>
	),
	building: (
		<>
			<rect x='4' y='3' width='16' height='18' rx='2' />
			<path d='M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3' />
		</>
	),
	cart: (
		<>
			<path d='M3 4h2l2.4 11h11.2L21 8H7' />
			<circle cx='9' cy='19' r='1.5' />
			<circle cx='17' cy='19' r='1.5' />
		</>
	),
	app: (
		<>
			<rect x='3' y='3' width='18' height='18' rx='4' />
			<path d='M8 12h8M12 8v8' />
		</>
	),
	rocket: (
		<>
			<path d='M12 3c3 2 5 6 5 10l-5 4-5-4c0-4 2-8 5-10z' />
			<circle cx='12' cy='10' r='1.5' />
			<path d='M7 13l-2 4 3-1M17 13l2 4-3-1' />
		</>
	),
	dashboard: (
		<>
			<rect x='3' y='3' width='8' height='8' rx='2' />
			<rect x='13' y='3' width='8' height='5' rx='2' />
			<rect x='13' y='10' width='8' height='11' rx='2' />
			<rect x='3' y='13' width='8' height='8' rx='2' />
		</>
	),
	server: (
		<>
			<rect x='3' y='4' width='18' height='6' rx='2' />
			<rect x='3' y='14' width='18' height='6' rx='2' />
			<path d='M7 7h.01M7 17h.01' />
		</>
	),
	cloud: <path d='M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9a4 4 0 0 1-1 9H7z' />,
	bot: (
		<>
			<rect x='4' y='7' width='16' height='13' rx='3' />
			<path d='M9 13h.01M15 13h.01M12 4v3M9 17h6' />
		</>
	),
	database: (
		<>
			<ellipse cx='12' cy='5' rx='7' ry='3' />
			<path d='M5 5v14c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3' />
		</>
	),
	brush: (
		<>
			<path d='M3 21c3 0 5-2 5-5l8-8 3 3-8 8c-3 0-5 2-8 2z' />
			<path d='M14 6l4 4' />
		</>
	),
	puzzle: <path d='M4 7h4a2 2 0 1 1 4 0h4v4a2 2 0 1 1 0 4v5h-5a2 2 0 1 0-4 0H4v-5a2 2 0 1 0 0-4V7z' />,
	bag: (
		<>
			<path d='M6 8h12l1 13H5L6 8z' />
			<path d='M9 8V6a3 3 0 0 1 6 0v2' />
		</>
	),
	gauge: (
		<>
			<path d='M4 15a8 8 0 1 1 16 0' />
			<path d='M12 15l4-5' />
			<circle cx='12' cy='15' r='1.5' />
		</>
	),
	truck: (
		<>
			<rect x='3' y='6' width='12' height='10' rx='1' />
			<path d='M15 10h4l2 3v3h-6v-6z' />
			<circle cx='7' cy='18' r='1.5' />
			<circle cx='17' cy='18' r='1.5' />
		</>
	),
	shield: (
		<>
			<path d='M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z' />
			<path d='M9 12l2 2 4-4' />
		</>
	),
	cube: (
		<>
			<path d='M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z' />
			<path d='M4 7.5l8 4.5 8-4.5M12 12v9' />
		</>
	),
	wrench: <path d='M20 7l-3 3-3-3 3-3a4 4 0 0 0-5 5L4 17l3 3 8-8a4 4 0 0 0 5-5z' />,
	plug: (
		<>
			<path d='M9 3v5M15 3v5' />
			<path d='M6 8h12v3a6 6 0 0 1-12 0V8z' />
			<path d='M12 17v4' />
		</>
	),
	link: (
		<>
			<path d='M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1' />
			<path d='M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1' />
		</>
	),
	workflow: (
		<>
			<rect x='3' y='3' width='7' height='6' rx='2' />
			<rect x='14' y='15' width='7' height='6' rx='2' />
			<path d='M10 6h4a3 3 0 0 1 3 3v6' />
		</>
	),
	refresh: (
		<>
			<path d='M20 12a8 8 0 1 1-2.3-5.7' />
			<path d='M20 4v4h-4' />
		</>
	),
	film: (
		<>
			<rect x='3' y='4' width='18' height='16' rx='2' />
			<path d='M7 4v16M17 4v16M3 9h4M3 15h4M17 9h4M17 15h4' />
		</>
	),
	pointer: <path d='M5 4l14 7-6 2-2 6-6-15z' />,
	wand: (
		<>
			<path d='M4 20l10-10' />
			<path d='M14 4l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z' />
			<path d='M19 11l.5 1 1 .5-1 .5-.5 1-.5-1-1-.5 1-.5.5-1z' />
		</>
	),
	sparkles: (
		<>
			<path d='M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z' />
			<path d='M19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8L19 17z' />
		</>
	),
	flask: (
		<>
			<path d='M9 3h6' />
			<path d='M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3' />
		</>
	),
	search: (
		<>
			<circle cx='11' cy='11' r='6' />
			<path d='M16 16l5 5' />
		</>
	),
	chat: <path d='M4 5h16v11H9l-5 4V5z' />,
	lifebuoy: (
		<>
			<circle cx='12' cy='12' r='9' />
			<circle cx='12' cy='12' r='4' />
			<path d='M5.6 5.6l3.6 3.6M14.8 14.8l3.6 3.6M18.4 5.6l-3.6 3.6M9.2 14.8l-3.6 3.6' />
		</>
	),
	check: <path d='M5 12.5l4.5 4.5L19 7.5' />,
	arrow: <path d='M5 12h14M13 6l6 6-6 6' />,
}

type Props = { name: string; className?: string }

export default function ServiceIcon({ name, className }: Props) {
	return (
		<svg
			className={className}
			viewBox='0 0 24 24'
			fill='none'
			stroke='currentColor'
			strokeWidth='1.8'
			strokeLinecap='round'
			strokeLinejoin='round'
			aria-hidden='true'
		>
			{ICONS[name] ?? ICONS.app}
		</svg>
	)
}
