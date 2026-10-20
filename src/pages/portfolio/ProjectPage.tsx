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
import Gallery from '../../components/gallery/Gallery'
import FlowScheme from '../../components/flowScheme/FlowScheme'
import DimAccordion from '../../components/dimAccordion/DimAccordion'
import CtaBlock from '../../components/ctaBlock/CtaBlock'
import { useContactModal } from '../../components/contactModal/ContactModalContext'
import { getAdjacentProjects, getProject } from '../../data/projects'
import type { Project } from '../../data/projects'
import NotFoundPage from '../NotFoundPage'
import './ProjectPage.scss'

const BRIEF = [
	{ key: 'task', label: 'задача' },
	{ key: 'solution', label: 'что сделал' },
	{ key: 'result', label: 'результат' },
] as const

// TODO (владелец): H2 секций страницы кейса; в каждом — не больше одного выделения
const H2 = {
	brief: { text: 'Задача, решение и результат', muted: 'и результат' },
	screens: { text: 'Как это выглядит' },
	stack: { text: 'На чём построено' },
}

const EASE_OUT = [0.2, 0.7, 0.2, 1] as const
const pad = (i: number) => String(i + 1).padStart(2, '0')
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

/**
 * Страница кейса (docs/design-spec.md §9; content.md §4.7): шапка с крошкой, фактами и кнопками → обложка на всю
 * ширину контейнера → четыре счётчика → «Коротко» в три колонки → скриншоты → стек и аккордеон
 * «Как это устроено технически» (что внутри, путь пользователя, этапы) → соседние кейсы → CTA
 */
export default function ProjectPage() {
	const { slug } = useParams()
	const project = getProject(slug)
	const { open } = useContactModal()

	if (!project) return <NotFoundPage />

	const { prev, next } = getAdjacentProjects(project.slug)
	const hasFeatures = !!project.features?.length
	const hasScheme = !!project.scheme?.length
	const hasProcess = !!project.process?.length
	const hasTech = hasFeatures || hasScheme || hasProcess

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
			<span className='projectPage__role'>роль: {lower(project.role)}</span>
		</>
	)

	const tech = (
		<div className='projectPage__tech'>
			{hasFeatures && (
				<div className='projectPage__techBlock'>
					<h3>Что внутри</h3>
					<ul className='projectPage__features'>
						{project.features!.map(f => (
							<li key={f.title}>
								<h4>{f.title}</h4>
								<p>{f.text}</p>
							</li>
						))}
					</ul>
				</div>
			)}

			{hasScheme && (
				<div className='projectPage__techBlock'>
					<h3>Путь пользователя</h3>
					<FlowScheme nodes={project.scheme!} />
				</div>
			)}

			{hasProcess && (
				<div className='projectPage__techBlock'>
					<h3>Этапы работы</h3>
					<ol className='projectPage__steps'>
						{project.process!.map((step, i) => (
							<li key={step.title}>
								<span className='projectPage__stepNum'>{pad(i)}</span>
								<h4>{step.title}</h4>
								<p>{step.text}</p>
							</li>
						))}
					</ol>
				</div>
			)}
		</div>
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

					{project.metrics.length > 0 && (
						<Reveal as='ul' className='projectPage__metrics'>
							{project.metrics.map(m => (
								<li key={m.label}>
									{/* У Stat нет префикса: с ним значение уходит строкой без счётчика */}
									<Stat
										value={m.prefix ? `${m.prefix}${formatStat(m.value)}` : m.value}
										suffix={m.suffix}
										label={m.label}
									/>
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

			{project.gallery.length > 0 && (
				<section className='section' id='screens'>
					<div className='container'>
						<SectionHead label='скриншоты' title={H2.screens} />
						<Reveal>
							<Gallery images={project.gallery} title={project.title} />
						</Reveal>
					</div>
				</section>
			)}

			{(project.stack.length > 0 || hasTech) && (
				<section className='section' id='tech'>
					<div className='container'>
						<SectionHead label='стек' title={H2.stack} />
						{project.stack.length > 0 && (
							<Reveal as='ul' className='projectPage__stack' aria-label='Стек проекта'>
								{project.stack.map(s => (
									<Chip as='li' key={s}>
										{s}
									</Chip>
								))}
							</Reveal>
						)}
						{hasTech && (
							<Reveal className='projectPage__accordion' delay={0.08}>
								<DimAccordion idPrefix='project' items={[{ id: 'tech', title: 'Как это устроено технически', content: tech }]} wide />
							</Reveal>
						)}
					</div>
				</section>
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

			<CtaBlock cta='Обсудить похожий проект' />
		</article>
	)
}
