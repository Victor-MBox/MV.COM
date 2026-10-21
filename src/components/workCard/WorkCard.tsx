import type { ProjectFact } from '../../data/projects'
import { parseStat } from '../stat/formatStat'
import Box from '../box/Box'
import Chip from '../chip/Chip'
import Stat from '../stat/Stat'
import './WorkCard.scss'

/** Данные карточки работы. Project из data/projects.ts подходит структурно (cover, highlights) */
export type WorkCardData = {
	slug: string
	title: string
	client: string
	/** Одна строка для карточки: что сделал → результат */
	line: string
	/** Обложка-скриншот 16:10 */
	cover: string
	/** Факты карточки — ровно те, что показываются (для PROJECTS отбираются по CASE_FACTS в data/home.ts) */
	highlights?: ProjectFact[]
	/** Куда ведёт карточка; по умолчанию — страница кейса /portfolio/:slug */
	to?: string
}

type Props = {
	item: WorkCardData
	className?: string
}

/**
 * Карточка работы по Portilo (docs/design-spec-home4.md §5.4): чип клиента, строка, обложка-скриншот 16:10,
 * факты, внизу название и круг со стрелкой, который заливается по ховеру. Вся карточка — ссылка с курсором «смотреть»
 */
export default function WorkCard({ item, className }: Props) {
	const { slug, title, client, line, cover, highlights = [], to = `/portfolio/${slug}` } = item

	return (
		<Box to={to} className={['workCard', className ?? ''].filter(Boolean).join(' ')} glow cursor='смотреть'>
			<Chip className='workCard__chip'>{client}</Chip>
			<p className='workCard__line'>{line}</p>
			<img className='workCard__cover' src={cover} alt={`${title}: обложка кейса`} width={1680} height={720} loading='lazy' draggable={false} />
			{highlights.length > 0 && (
				<div className='workCard__facts'>
					{highlights.map(h => {
						const s = parseStat(h.value)
						return <Stat key={h.label} value={s.value} suffix={s.suffix} label={h.label} size='card' />
					})}
				</div>
			)}
			<div className='workCard__foot'>
				<h3 className='workCard__title'>{title}</h3>
				<span className='workCard__arrow' aria-hidden='true'>
					↗
				</span>
			</div>
		</Box>
	)
}
