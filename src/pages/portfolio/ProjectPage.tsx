import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageHeader from '../../components/pageHeader/PageHeader'
import Gallery from '../../components/gallery/Gallery'
import CountUp from '../../components/countUp/CountUp'
import { useContactModal } from '../../components/contactModal/ContactModalContext'
import { getAdjacentProjects, getProject } from '../../data/projects'
import NotFoundPage from '../NotFoundPage'
import './ProjectPage.scss'

const STAGES = [
	{ key: 'task', label: 'Задача', num: '01' },
	{ key: 'solution', label: 'Решение', num: '02' },
	{ key: 'result', label: 'Результат', num: '03' },
] as const

export default function ProjectPage() {
	const { slug } = useParams()
	const project = getProject(slug)
	const { open } = useContactModal()

	if (!project) return <NotFoundPage />

	const { prev, next } = getAdjacentProjects(project.slug)

	return (
		<article className='project' key={project.slug}>
			<PageHeader
				title={project.title}
				subtitle={project.tagline}
				crumbs={[{ label: 'Портфолио', to: '/portfolio' }, { label: project.title }]}
				aside={
					<ul className='project__tags' aria-label='Категории'>
						{project.categories.map(c => (
							<li key={c} className='tag'>
								{c}
							</li>
						))}
					</ul>
				}
			/>

			<motion.div
				className='project__cover'
				initial={{ opacity: 0, scale: 0.98 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
			>
				<img src={project.cover} alt={`Обложка проекта ${project.title}`} />
			</motion.div>

			<section className='project__facts' aria-label='Кратко о проекте'>
				<dl>
					<div>
						<dt>Клиент</dt>
						<dd>{project.client}</dd>
					</div>
					<div>
						<dt>Год</dt>
						<dd>{project.year}</dd>
					</div>
					<div>
						<dt>Роль</dt>
						<dd>{project.role}</dd>
					</div>
					<div>
						<dt>Срок</dt>
						<dd>{project.duration}</dd>
					</div>
				</dl>
				{project.link && (
					<a className='btn btn_light' href={project.link} target='_blank' rel='noopener noreferrer'>
						<span className='btn__label'>
							Открыть сайт
							<svg viewBox='0 0 24 24' fill='none' aria-hidden='true'>
								<path d='M7 17L17 7M9 7h8v8' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
							</svg>
						</span>
					</a>
				)}
			</section>

			<section className='project__about'>
				<div className='project__lead'>
					<span className='project__label'>О проекте</span>
					{project.description.map((p, i) => (
						<p key={i}>{p}</p>
					))}
				</div>
				<aside className='project__stack'>
					<span className='project__label'>Стек</span>
					<ul>
						{project.stack.map(s => (
							<li key={s}>{s}</li>
						))}
					</ul>
				</aside>
			</section>

			<section className='project__stages'>
				<span className='project__label'>Как это было</span>
				<ol>
					{STAGES.map(({ key, label, num }, i) => (
						<motion.li
							key={key}
							initial={{ opacity: 0, y: 16 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: '-40px' }}
							transition={{ duration: 0.4, delay: i * 0.08 }}
						>
							<span className='project__stage-num'>{num}</span>
							<h3>{label}</h3>
							<p>{project[key]}</p>
						</motion.li>
					))}
				</ol>
			</section>

			<section className='project__metrics' aria-label='Результаты в цифрах'>
				{project.metrics.map(m => (
					<div key={m.label}>
						<span className='project__metric-value'>
							{m.prefix}
							<CountUp to={m.value} duration={2} />
							{m.suffix}
						</span>
						<span className='project__metric-label'>{m.label}</span>
					</div>
				))}
			</section>

			<section className='project__gallery'>
				<div className='titlerow'>
					<div className='title'>Галерея</div>
					<span className='project__hint'>Клик по изображению открывает его на весь экран, стрелки ← → листают</span>
				</div>
				<Gallery images={project.gallery} title={project.title} />
			</section>

			<section className='project__cta'>
				<h2>Нужен похожий проект?</h2>
				<p>Расскажите о задаче — предложу решение и оценку в течение двух дней.</p>
				<button type='button' className='btn btn_light' onClick={() => open(project.categories[0])}>
					<span className='btn__label'>Обсудить проект</span>
				</button>
			</section>

			<nav className='project__nav' aria-label='Другие проекты'>
				{prev && (
					<Link to={`/portfolio/${prev.slug}`} className='project__nav-link project__nav-link--prev'>
						<img src={prev.cover} alt='' loading='lazy' />
						<span className='project__nav-dir'>← Предыдущий</span>
						<span className='project__nav-title'>{prev.title}</span>
					</Link>
				)}
				{next && (
					<Link to={`/portfolio/${next.slug}`} className='project__nav-link project__nav-link--next'>
						<img src={next.cover} alt='' loading='lazy' />
						<span className='project__nav-dir'>Следующий →</span>
						<span className='project__nav-title'>{next.title}</span>
					</Link>
				)}
			</nav>
		</article>
	)
}
