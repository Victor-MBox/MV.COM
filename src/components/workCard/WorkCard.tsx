import type { Project, ProjectFact } from '../../data/projects'
import { parseStat } from '../../data/home3'
import Box from '../box/Box'
import Chip from '../chip/Chip'
import Stat from '../stat/Stat'
import './WorkCard.scss'

type Props = {
	project: Project
	/** Индексы highlights для двух фактов карточки (CASE_FACTS в home4.ts) */
	facts?: number[]
	className?: string
}

/**
 * Карточка работы по Portilo (docs/design-spec-home4.md §5.4): чип клиента, строка, обложка 16:10, два факта,
 * внизу название и круг со стрелкой, который заливается по ховеру. Вся карточка — ссылка на кейс с курсором «смотреть»
 */
export default function WorkCard({ project, facts = [0, 2], className }: Props) {
	const items = facts.map(i => project.highlights?.[i]).filter((h): h is ProjectFact => !!h)

	return (
		<Box to={`/portfolio/${project.slug}`} className={['workCard', className ?? ''].filter(Boolean).join(' ')} glow cursor='смотреть'>
			<Chip className='workCard__chip'>{project.client}</Chip>
			<p className='workCard__line'>{project.line}</p>
			<img className='workCard__cover' src={project.cover} alt={`${project.title}: обложка кейса`} width={1680} height={720} loading='lazy' draggable={false} />
			{items.length > 0 && (
				<div className='workCard__facts'>
					{items.map(h => {
						const s = parseStat(h.value)
						return <Stat key={h.label} value={s.value} suffix={s.suffix} label={h.label} size='card' />
					})}
				</div>
			)}
			<div className='workCard__foot'>
				<h3 className='workCard__title'>{project.title}</h3>
				<span className='workCard__arrow' aria-hidden='true'>
					↗
				</span>
			</div>
		</Box>
	)
}
