import type { CSSProperties } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageHead from '../../components/pageHead/PageHead'
import SectionHead from '../../components/sectionHead/SectionHead'
import Button from '../../components/button/Button'
import Box from '../../components/box/Box'
import Chip from '../../components/chip/Chip'
import Stat from '../../components/stat/Stat'
import { formatStat } from '../../components/stat/formatStat'
import Reveal from '../../components/reveal/Reveal'
import CaseStory from '../../components/caseStory/CaseStory'
import CaseVideo from '../../components/caseVideo/CaseVideo'
import { useContactModal } from '../../components/contactModal/ContactModalContext'
import { getAdjacentProjects, getProject, isPublic } from '../../data/projects'
import type { Project, ProjectMetric } from '../../data/projects'
import { projectMeta } from '../../data/meta'
import { useDocumentMeta } from '../../hooks/useDocumentMeta'
import NotFoundPage from '../NotFoundPage'
import './ProjectPage.scss'

const BRIEF = [
	{ key: 'task', label: 'задача' },
	{ key: 'solution', label: 'что сделал' },
	{ key: 'result', label: 'результат' },
] as const

// TODO (владелец): H2 секций кейса без сюжета; в каждом — не больше одного выделения
const H2 = {
	brief: { text: 'Задача, решение и результат', muted: 'и результат' },
	stack: { text: 'На чём построено' },
}

const EASE_OUT = [0.2, 0.7, 0.2, 1] as const
/** «Основатель, …» → «основатель, …» для строки моно, как в CaseCard */
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)

/** Соседний кейс: обложка-миниатюра, подпись моно и название; вся карточка — ссылка */
function Neighbor({ project, dir }: { project: Project; dir: 'prev' | 'next' }) {
	return (
		<Box to={`/portfolio/${project.slug}`} className={`projectPage__navLink projectPage__navLink--${dir}`} cursor='смотреть'>
			<span className='projectPage__navCover'>
				<img src={project.cover} alt='' loading='lazy' width={1680} height={720} />
			</span>
			<span className='projectPage__navText'>
				<span className='projectPage__navDir'>{dir === 'prev' ? '← Предыдущий' : 'Следующий →'}</span>
				<span className='projectPage__navTitle'>{project.title}</span>
			</span>
		</Box>
	)
}

/** Кейс без сюжета: обложка, подтверждённые цифры, «Коротко» в три колонки и стек чипами */
function ProjectBrief({ project, metrics }: { project: Project; metrics: ProjectMetric[] }) {
	return (
		<>
			<section className='section' id='metrics' aria-label='Обложка и результаты в цифрах'>
				<div className='container'>
					<motion.div
						className='projectPage__cover'
						initial={{ opacity: 0, scale: 0.98 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.6, ease: EASE_OUT }}
					>
						<img src={project.cover} alt={`Обложка проекта ${project.title}`} width={1680} height={720} fetchPriority='high' />
					</motion.div>

					{metrics.length > 0 && (
						<Reveal as='ul' className='projectPage__metrics' style={{ '--count': metrics.length } as CSSProperties}>
							{metrics.map(m => (
								<li key={m.label}>
									{/* У Stat нет префикса: с ним значение уходит строкой без счётчика */}
									<Stat value={m.prefix ? `${m.prefix}${formatStat(m.value)}` : m.value} suffix={m.suffix} label={m.label} />
								</li>
							))}
						</Reveal>
					)}
				</div>
			</section>

			<section className='section' id='brief'>
				<div className='container'>
					<SectionHead label='коротко' title={H2.brief} />
					<ul className='projectPage__brief'>
						{BRIEF.map(({ key, label }, i) => (
							<Reveal as='li' key={key} index={i}>
								<span className='projectPage__briefLabel'>{label}</span>
								<p>{project[key]}</p>
							</Reveal>
						))}
					</ul>
				</div>
			</section>

			{project.stack.length > 0 && (
				<section className='section' id='stack'>
					<div className='container'>
						<SectionHead label='техника' title={H2.stack} />
						<Reveal as='ul' className='projectPage__stack' aria-label='Стек проекта'>
							{project.stack.map(s => (
								<Chip as='li' key={s}>
									{s}
								</Chip>
							))}
						</Reveal>
					</div>
				</section>
			)}
		</>
	)
}

/**
 * Страница кейса (content.md §4.7): шапка с крошкой, фактами, ролью и кнопками → видео-рассказ `CaseVideo` (с 28.10.2026:
 * главы слева, справа залипшее видео, которое прокрутка двигает кадр в кадр; цифры — в главе со счётчиками: у NoRandoms SEO,
 * у «ЖК Несчастье» финал; кнопки — в финале, «Открыть сайт» — только при `link`) →
 * соседние кейсы. Без `video` — прежний сюжет `CaseStory` (оставлен для сравнения: ноутбук и телефон с экранами продукта),
 * без `story` — обложка, цифры, «Коротко» и стек. Обложки, галереи и аккордеона техники с 22.10.2026 на странице нет
 */
export default function ProjectPage() {
	const { slug } = useParams()
	const project = getProject(slug)
	const { open } = useContactModal()
	useDocumentMeta(project ? projectMeta(project) : null)

	if (!project) return <NotFoundPage />

	const { prev, next } = getAdjacentProjects(project.slug)
	// Неподтверждённые показатели (hidden в projects.ts) остаются в данных, но на странице не выводятся
	const metrics = project.metrics.filter(isPublic)

	const meta = (
		<>
			<span className='projectPage__facts'>
				<Link to='/portfolio'>Портфолио</Link> · {lower(project.client)} · {project.year} · {lower(project.duration)}
				{project.status && (
					<>
						{' · '}
						<span className='projectPage__status'>
							<i aria-hidden='true' />
							{project.status}
						</span>
					</>
				)}
			</span>
			<span className='projectPage__role'>Моя роль: {lower(project.role)}.</span>
		</>
	)

	return (
		<article className='projectPage' key={project.slug}>
			<PageHead
				label='кейс'
				title={{ text: project.title }}
				lead={project.tagline}
				meta={meta}
				actions={
					<>
						{project.link && (
							<Button href={project.link} arrow arrowGlyph='↗'>
								Открыть сайт
							</Button>
						)}
						<Button variant='secondary' onClick={() => open()}>
							Обсудить похожий проект
						</Button>
					</>
				}
			/>

			{project.video ? (
				<CaseVideo video={project.video} title={project.title} metrics={metrics} link={project.link} />
			) : project.story ? (
				<CaseStory story={project.story} metrics={metrics} stack={project.stack} />
			) : (
				<ProjectBrief project={project} metrics={metrics} />
			)}

			{(prev || next) && (
				<section className='section' id='more' aria-label='Другие проекты'>
					<div className='container'>
						<Reveal as='ul' className='projectPage__nav'>
							{prev && (
								<li>
									<Neighbor project={prev} dir='prev' />
								</li>
							)}
							{next && (
								<li className='projectPage__navItem--next'>
									<Neighbor project={next} dir='next' />
								</li>
							)}
						</Reveal>
					</div>
				</section>
			)}
		</article>
	)
}
