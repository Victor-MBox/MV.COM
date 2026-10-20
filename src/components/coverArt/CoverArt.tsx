import './CoverArt.scss'

/** Варианты обложки-иллюстрации для примеров-плейсхолдеров в слайдере работ /home4 (WORK_PLACEHOLDERS в home4.ts) */
export type CoverArtVariant = 'shop' | 'corporate'

type Props = {
	variant: CoverArtVariant
	className?: string
}

/**
 * Векторная обложка 16:10 вместо скриншота, в языке MiniUi (docs/design-spec.md §6.8): плашки --ui-plate на подложке
 * --box-deep, ровно один элемент акцентом. Нужна, пока у примеров-плейсхолдеров нет реальных скриншотов
 */
export default function CoverArt({ variant, className }: Props) {
	const cn = ['coverArt', `coverArt--${variant}`, className ?? ''].filter(Boolean).join(' ')

	if (variant === 'shop') {
		return (
			<div className={cn} aria-hidden='true'>
				<svg viewBox='0 0 320 200'>
					<rect className='coverArt__plate' x='16' y='14' width='288' height='18' rx='4' />
					<rect className='coverArt__deep' x='24' y='21' width='36' height='4' rx='2' />
					<rect className='coverArt__deep' x='170' y='21' width='60' height='4' rx='2' />
					<rect className='coverArt__deep' x='240' y='21' width='18' height='4' rx='2' />
					<rect className='coverArt__deep' x='266' y='21' width='18' height='4' rx='2' />
					<rect className='coverArt__accent' x='292' y='19' width='8' height='8' rx='4' />
					{[0, 1, 2].map(col =>
						[0, 1].map(row => {
							const x = 16 + col * 100
							const y = 42 + row * 76
							return (
								<g key={`${col}-${row}`}>
									<rect className='coverArt__plate' x={x} y={y} width='88' height='66' rx='6' />
									<rect className='coverArt__deep' x={x + 8} y={y + 8} width='72' height='30' rx='4' />
									<rect className='coverArt__deep' x={x + 8} y={y + 44} width='46' height='4' rx='2' />
									<rect className='coverArt__deep' x={x + 8} y={y + 52} width='26' height='4' rx='2' />
									<rect className={col === 0 && row === 0 ? 'coverArt__accent' : 'coverArt__deep'} x={x + 58} y={y + 46} width='22' height='10' rx='5' />
								</g>
							)
						})
					)}
				</svg>
			</div>
		)
	}

	return (
		<div className={cn} aria-hidden='true'>
			<svg viewBox='0 0 320 200'>
				<rect className='coverArt__plate' x='16' y='14' width='288' height='18' rx='4' />
				<rect className='coverArt__deep' x='24' y='21' width='36' height='4' rx='2' />
				<rect className='coverArt__deep' x='200' y='21' width='18' height='4' rx='2' />
				<rect className='coverArt__deep' x='226' y='21' width='18' height='4' rx='2' />
				<rect className='coverArt__deep' x='252' y='21' width='18' height='4' rx='2' />
				<rect className='coverArt__deep' x='278' y='21' width='18' height='4' rx='2' />
				<rect className='coverArt__plate' x='16' y='42' width='288' height='70' rx='6' />
				<rect className='coverArt__deep' x='28' y='56' width='120' height='8' rx='3' />
				<rect className='coverArt__deep' x='28' y='70' width='90' height='8' rx='3' />
				<rect className='coverArt__accent' x='28' y='88' width='56' height='14' rx='7' />
				<rect className='coverArt__deep' x='196' y='52' width='96' height='50' rx='4' />
				{[0, 1, 2].map(col => {
					const x = 16 + col * 100
					return (
						<g key={col}>
							<rect className='coverArt__plate' x={x} y='122' width='88' height='60' rx='6' />
							<circle className='coverArt__deep' cx={x + 18} cy='140' r='8' />
							<rect className='coverArt__deep' x={x + 8} y='156' width='56' height='4' rx='2' />
							<rect className='coverArt__deep' x={x + 8} y='166' width='40' height='4' rx='2' />
						</g>
					)
				})}
			</svg>
		</div>
	)
}
