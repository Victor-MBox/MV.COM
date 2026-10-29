import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { isPublic } from '../../data/projects'
import type { Project } from '../../data/projects'
import { parseStat } from '../stat/formatStat'
import { MQ, useMediaQuery } from '../../hooks/useMediaQuery'
import Box from '../box/Box'
import Chip from '../chip/Chip'
import Stat from '../stat/Stat'
import FloatingPreview from '../floatingPreview/FloatingPreview'
import './CaseCard.scss'

type Props = {
	project: Project
	/** Широкая карточка — у главного кейса и у проектов с живой обложкой (портфолио): обложка справа, две цифры (§7.3) */
	wide?: boolean
	/**
	 * Карточка проекта на главной (ТЗ от 21.10.2026, §6): широкая, тип проекта, описание с ролью и «Посмотреть кейс» —
	 * без цифр, роли отдельной строкой и тегов стека (числа — в кейсе, технологии — на «Обо мне»)
	 */
	teaser?: boolean
}

const MAX_TAGS = 4

/**
 * Карточка работы по Zolt (docs/design-spec.md §6.9): год · срок · клиент, H3, строка, цифры из highlights (только
 * подтверждённые — isPublic), роль, теги стека. Вся карточка — ссылка на кейс, курсор-подпись «смотреть»; внутри нет
 * других интерактивных элементов («Посмотреть кейс» у teaser — подпись, а не вложенная ссылка). Обложка широкой
 * карточки: если у проекта есть `preview` — интерактивная сцена FloatingPreview из живой вёрстки продукта, одна и та же
 * на главной и в портфолио (28.10.2026); иначе скриншот `cover`, который мягко смещается при скролле (только
 * pointer: fine, без reduced-motion).
 */
export default function CaseCard({ project, wide: wideProp, teaser }: Props) {
	const wide = wideProp || teaser
	const stage = !!project.preview
	const coverRef = useRef<HTMLDivElement>(null)
	const hoverable = useMediaQuery(MQ.hover)
	const coarse = useMediaQuery(MQ.coarse)
	const reduced = useMediaQuery(MQ.reduced)
	// target только у широкой карточки: у обычной обложки нет, и framer бросал бы «Target ref is defined but not hydrated»
	const { scrollYProgress } = useScroll(wide ? { target: coverRef, offset: ['start end', 'end start'] } : undefined)
	const y = useTransform(scrollYProgress, [0, 1], [-12, 12])
	const parallax = wide && !stage && hoverable && !coarse && !reduced

	const meta = teaser
		? project.kind
		: [project.year, project.duration.split(',')[0].toLowerCase(), project.client.toLowerCase()].join(' · ')
	const stats = teaser ? [] : (project.highlights ?? []).filter(isPublic).slice(0, wide ? 2 : 1)
	const tags = project.stack.slice(0, MAX_TAGS)
	const rest = project.stack.length - tags.length

	return (
		<Box
			to={`/portfolio/${project.slug}`}
			className={['caseCard', wide ? 'caseCard--wide' : '', teaser ? 'caseCard--teaser' : ''].filter(Boolean).join(' ')}
			glow
			cursor='смотреть'
		>
			<div className='caseCard__body'>
				<p className='caseCard__meta'>{meta}</p>
				<h3 className='caseCard__title'>{project.title}</h3>
				<p className='caseCard__line'>{teaser ? project.summary : project.line}</p>
				{teaser && (
					<span className='caseCard__more'>
						Посмотреть кейс
						<span aria-hidden='true'>→</span>
					</span>
				)}
				{stats.length > 0 && (
					<div className='caseCard__stats'>
						{stats.map(h => {
							const { value, suffix } = parseStat(h.value)
							return <Stat key={h.label} size='card' value={value} suffix={suffix} label={h.label} />
						})}
					</div>
				)}
				{!teaser && (
					<>
						<p className='caseCard__role'>{project.role}</p>
						<ul className='caseCard__tags'>
							{tags.map(t => (
								<Chip as='li' key={t}>
									{t}
								</Chip>
							))}
							{rest > 0 && <Chip as='li'>+{rest}</Chip>}
						</ul>
					</>
				)}
			</div>
			{wide && (
				<div className={`caseCard__cover${stage ? ' caseCard__cover--scene' : ''}`} ref={coverRef}>
					{stage && project.preview ? (
						<FloatingPreview preview={project.preview} />
					) : (
						<motion.img
							src={project.cover}
							alt={teaser ? `${project.title}: скриншот` : ''}
							width={1680}
							height={720}
							fetchPriority='high'
							style={parallax ? { y } : undefined}
						/>
					)}
				</div>
			)}
		</Box>
	)
}
