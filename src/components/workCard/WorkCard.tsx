import type { ProjectFact } from '../../data/projects'
import { parseStat } from '../stat/formatStat'
import Box from '../box/Box'
import Chip from '../chip/Chip'
import Stat from '../stat/Stat'
import CoverArt from '../coverArt/CoverArt'
import type { CoverArtVariant } from '../coverArt/CoverArt'
import './WorkCard.scss'

/**
 * Данные карточки работы. Project из data/projects.ts подходит структурно (cover, highlights); примеры-плейсхолдеры
 * (WORK_PLACEHOLDERS в data/home.ts) вместо скриншота дают art и ведут на страницу оффера через to
 */
export type WorkCardData = {
	slug: string
	title: string
	client: string
	/** Одна строка для карточки: что сделал → результат */
	line: string
	/** Обложка-скриншот 16:10 */
	cover?: string
	/** Векторная обложка вместо скриншота (у примеров-плейсхолдеров) */
	art?: CoverArtVariant
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
 * Карточка работы по Portilo (docs/design-spec-home4.md §5.4): чип клиента, строка, обложка 16:10 (скриншот или CoverArt),
 * факты, внизу название и круг со стрелкой, который заливается по ховеру. Вся карточка — ссылка с курсором «смотреть»
 */
export default function WorkCard({ item, className }: Props) {
	const { slug, title, client, line, cover, art, highlights = [], to = `/portfolio/${slug}` } = item

	return (
		<Box to={to} className={['workCard', className ?? ''].filter(Boolean).join(' ')} glow cursor='смотреть'>
			<Chip className='workCard__chip'>{client}</Chip>
			<p className='workCard__line'>{line}</p>
			{art ? (
				<CoverArt variant={art} className='workCard__cover' />
			) : (
				<img className='workCard__cover' src={cover} alt={`${title}: обложка кейса`} width={1680} height={720} loading='lazy' draggable={false} />
			)}
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
