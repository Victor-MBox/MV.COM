import { STATS } from '../../../data/home'
import Reveal from '../../../components/reveal/Reveal'
import Stat from '../../../components/stat/Stat'

/** Цифры (docs/design-spec-home4.md §6.8): четыре счётчика в ряд по центру без разделителей, старт при 30% видимости один раз */
export default function Stats() {
	return (
		<section className='section homeStats' id='stats'>
			<div className='container'>
				<Reveal as='ul' className='homeStats__row'>
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
