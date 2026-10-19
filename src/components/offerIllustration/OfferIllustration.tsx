import type { ReactNode } from 'react'

/**
 * Линейные иллюстрации офферов по ключу из OFFERS. Линии — currentColor,
 * один акцентный элемент — var(--offer-accent), который задаёт карточка (синий или оранжевый).
 */
const ART: Record<string, ReactNode> = {
	landing: (
		<>
			<rect x='8' y='10' width='48' height='44' rx='6' />
			<path d='M8 20h48' />
			<circle cx='14' cy='15' r='1.4' fill='currentColor' stroke='none' />
			<circle cx='19' cy='15' r='1.4' fill='currentColor' stroke='none' />
			<circle cx='24' cy='15' r='1.4' fill='currentColor' stroke='none' />
			<path d='M16 29h16M16 35h11' />
			<rect x='16' y='41' width='14' height='6' rx='3' fill='var(--offer-accent)' stroke='none' />
			<rect x='37' y='27' width='12' height='20' rx='2' />
		</>
	),
	corporate: (
		<>
			<path d='M20 16v-4a4 4 0 0 1 4-4h26a4 4 0 0 1 4 4v30a4 4 0 0 1-4 4h-4' />
			<rect x='10' y='16' width='34' height='40' rx='4' />
			<path d='M16 26h18M16 32h14M16 38h18' />
			<rect x='16' y='44' width='10' height='6' rx='1.5' fill='var(--offer-accent)' stroke='none' />
		</>
	),
	ecommerce: (
		<>
			<path d='M14 22h36l-3 30H17z' />
			<path d='M24 22v-4a8 8 0 0 1 16 0v4' />
			<path d='M22 32h20' />
			<circle cx='32' cy='41' r='4' fill='var(--offer-accent)' stroke='none' />
		</>
	),
	'web-service': (
		<>
			<rect x='8' y='10' width='48' height='44' rx='6' />
			<path d='M8 20h48M22 20v34' />
			<path d='M12 27h6M12 33h6M12 39h6' />
			<path d='M28 45l7-9 6 4 9-11' />
			<circle cx='50' cy='29' r='2.6' fill='var(--offer-accent)' stroke='none' />
		</>
	),
	integrations: (
		<>
			<circle cx='32' cy='32' r='7' fill='var(--offer-accent)' stroke='none' />
			<circle cx='12' cy='16' r='5' />
			<circle cx='52' cy='16' r='5' />
			<circle cx='12' cy='48' r='5' />
			<circle cx='52' cy='48' r='5' />
			<path d='M16 19l10 7M48 19l-10 7M16 45l10-7M48 45l-10-7' />
		</>
	),
	support: (
		<>
			<path d='M41 11a11 11 0 0 0-11 14L12 43a4.5 4.5 0 0 0 6.4 6.4L36 31a11 11 0 0 0 14-11l-6 6-5-1-1-5z' />
			<circle cx='15.5' cy='46.5' r='2.2' fill='var(--offer-accent)' stroke='none' />
		</>
	),
	agencies: (
		<>
			<path d='M24 18L11 32l13 14M40 18l13 14-13 14' />
			<path d='M36 13l-8 38' stroke='var(--offer-accent)' strokeWidth='2.4' />
		</>
	),
}

type Props = {
	/** Ключ оффера из OFFERS */
	offer: string
	className?: string
}

export default function OfferIllustration({ offer, className }: Props) {
	const art = ART[offer]
	if (!art) return null
	return (
		<svg
			className={className}
			viewBox='0 0 64 64'
			fill='none'
			stroke='currentColor'
			strokeWidth='1.6'
			strokeLinecap='round'
			strokeLinejoin='round'
			aria-hidden='true'
		>
			{art}
		</svg>
	)
}
