import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { Project } from '../../data/projects'
import { parseStat } from '../../data/home3'
import { MQ, useMediaQuery } from '../../hooks/useMediaQuery'
import Box from '../box/Box'
import Chip from '../chip/Chip'
import Stat from '../stat/Stat'
import './CaseCard.scss'

type Props = {
	project: Project
	/** Широкая карточка главного кейса: обложка справа, две цифры (§7.3) */
	wide?: boolean
}

const MAX_TAGS = 4

/**
 * Карточка работы по Zolt (docs/design-spec.md §6.9): год · срок · клиент, H3, строка, цифры из highlights,
 * роль, теги стека. Вся карточка — ссылка на кейс, курсор-подпись «смотреть». Обложка широкой карточки
 * мягко смещается при скролле (только pointer: fine, без reduced-motion).
 */
export default function CaseCard({ project, wide }: Props) {
	const coverRef = useRef<HTMLDivElement>(null)
	const hoverable = useMediaQuery(MQ.hover)
	const coarse = useMediaQuery(MQ.coarse)
	const reduced = useMediaQuery(MQ.reduced)
	const { scrollYProgress } = useScroll({ target: coverRef, offset: ['start end', 'end start'] })
	const y = useTransform(scrollYProgress, [0, 1], [-12, 12])
	const parallax = wide && hoverable && !coarse && !reduced

	const meta = [project.year, project.duration.split(',')[0].toLowerCase(), project.client.toLowerCase()].join(' · ')
	const stats = (project.highlights ?? []).slice(0, wide ? 2 : 1)
	const tags = project.stack.slice(0, MAX_TAGS)
	const rest = project.stack.length - tags.length

	return (
		<Box to={`/portfolio/${project.slug}`} className={`caseCard${wide ? ' caseCard--wide' : ''}`} glow cursor='смотреть'>
			<div className='caseCard__body'>
				<p className='caseCard__meta'>{meta}</p>
				<h3 className='caseCard__title'>{project.title}</h3>
				<p className='caseCard__line'>{project.line}</p>
				{stats.length > 0 && (
					<div className='caseCard__stats'>
						{stats.map(h => {
							const { value, suffix } = parseStat(h.value)
							return <Stat key={h.label} size='card' value={value} suffix={suffix} label={h.label} />
						})}
					</div>
				)}
				<p className='caseCard__role'>{project.role}</p>
				<ul className='caseCard__tags'>
					{tags.map(t => (
						<Chip as='li' key={t}>
							{t}
						</Chip>
					))}
					{rest > 0 && <Chip as='li'>+{rest}</Chip>}
				</ul>
			</div>
			{wide && (
				<div className='caseCard__cover' ref={coverRef}>
					<motion.img
						src={project.cover}
						alt=''
						width={1680}
						height={720}
						fetchPriority='high'
						style={parallax ? { y } : undefined}
					/>
				</div>
			)}
		</Box>
	)
}
