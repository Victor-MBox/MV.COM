import type { ReactNode } from 'react'

type Props = {
	/** Индекс шага (0–3): иллюстрация по смыслу этапа, общая для всех вариантов процесса */
	step: number
	className?: string
}

/**
 * Четыре линейные иллюстрации к шагам «Как работаю» (решение владельца от 20.10.2026: секция из одного текста выглядела
 * плоско). Штрих currentColor (--text-muted у колонки), ровно один акцентный элемент в каждой — классы is-accent
 * (штрих) и is-accentFill (заливка) красит HomePage.scss. Декоративные: aria-hidden
 */
const ART: ReactNode[] = [
	// 01 Задача и оценка / проверка систем / знакомство с проектом: два сообщения, точка «на связи»
	<>
		<path d='M22 18h60a8 8 0 0 1 8 8v22a8 8 0 0 1-8 8H42l-12 10V56h-8a8 8 0 0 1-8-8V26a8 8 0 0 1 8-8z' />
		<path d='M32 32h40M32 42h26' />
		<path d='M80 48h58a8 8 0 0 1 8 8v16a8 8 0 0 1-8 8h-8v10l-12-10H80a8 8 0 0 1-8-8V56a8 8 0 0 1 8-8z' />
		<path d='M90 62h26' />
		<circle className='is-accentFill' cx='128' cy='62' r='4' />
	</>,
	// 02 Структура и интерфейс / согласование: окно браузера, сайдбар, шапка и три карточки, одна — акцентом
	<>
		<rect x='20' y='12' width='120' height='72' rx='8' />
		<path d='M20 26h120' />
		<circle cx='30' cy='19' r='1.5' fill='currentColor' stroke='none' />
		<circle cx='37' cy='19' r='1.5' fill='currentColor' stroke='none' />
		<circle cx='44' cy='19' r='1.5' fill='currentColor' stroke='none' />
		<rect x='30' y='34' width='28' height='42' rx='3' />
		<rect x='66' y='34' width='64' height='12' rx='3' />
		<rect className='is-accentFill' x='66' y='52' width='18' height='24' rx='3' />
		<rect x='89' y='52' width='18' height='24' rx='3' />
		<rect x='112' y='52' width='18' height='24' rx='3' />
	</>,
	// 03 Разработка и проверка: код и линия коммитов, последний — акцентом
	<>
		<path d='M48 26L32 44l16 18' />
		<path d='M112 26l16 18-16 18' />
		<path d='M90 20L70 68' />
		<path d='M20 84h120' />
		<circle cx='44' cy='84' r='3.5' fill='var(--bg)' />
		<circle cx='72' cy='84' r='3.5' fill='var(--bg)' />
		<circle cx='100' cy='84' r='3.5' fill='var(--bg)' />
		<circle className='is-accentFill' cx='128' cy='84' r='4' />
	</>,
	// 04 Запуск и передача: сервер, пунктирная траектория, акцентная стрелка, галочка
	<>
		<rect x='18' y='54' width='46' height='30' rx='6' />
		<path d='M26 64h14M26 72h22M54 64h2' />
		<path d='M64 60c22 0 38-20 56-36' strokeDasharray='4 6' />
		<path className='is-accent' d='M108 22l14-2-2 14' />
		<circle cx='124' cy='70' r='11' />
		<path d='M118.5 70l4 4 7.5-8' />
	</>,
]

export default function ProcessArt({ step, className }: Props) {
	const art = ART[step]
	if (!art) return null
	return (
		<svg
			className={className}
			viewBox='0 0 160 96'
			width='160'
			height='96'
			fill='none'
			stroke='currentColor'
			strokeWidth='1.5'
			strokeLinecap='round'
			strokeLinejoin='round'
			aria-hidden='true'
		>
			{art}
		</svg>
	)
}
