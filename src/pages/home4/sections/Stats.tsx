import { STATS } from '../../../data/home4'
import Reveal from '../../../components/reveal/Reveal'
import Stat from '../../../components/stat/Stat'

/** Цифры (docs/design-spec-home4.md §6.8): четыре счётчика в ряд по центру без разделителей, старт при 30% видимости один раз */
export default function Stats() {
	return (
		<section className='h4Section h4Stats' id='stats'>
			<div className='h4Container'>
				<Reveal as='ul' className='h4Stats__row'>
					{STATS.map(s => (
						<li key={s.label}>
							<Stat value={s.value} suffix={s.suffix} label={s.label} />
						</li>
					))}
				</Reveal>
			</div>
		</section>
	)
}
