import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageHeader from '../../components/pageHeader/PageHeader'
import Gallery from '../../components/gallery/Gallery'
import CountUp from '../../components/countUp/CountUp'
import FlowScheme from '../../components/flowScheme/FlowScheme'
import Accordion from '../../components/accordion/Accordion'
import { useContactModal } from '../../components/contactModal/ContactModalContext'
import { getAdjacentProjects, getProject } from '../../data/projects'
import NotFoundPage from '../NotFoundPage'
import './ProjectPage.scss'

const BRIEF = [
	{ key: 'task', label: 'Задача' },
	{ key: 'solution', label: 'Что сделал' },
	{ key: 'result', label: 'Результат' },
] as const

const reveal = (i: number) => ({
	initial: { opacity: 0, y: 16 },
	whileInView: { opacity: 1, y: 0 },
	viewport: { once: true, margin: '-40px' },
	transition: { duration: 0.4, delay: i * 0.08 },
})

/**
 * Страница кейса (content.md §4.7): шапка → обложка → факты → «Коротко» → цифры → скриншоты →
 * аккордеон «Как это устроено технически» → CTA → соседние кейсы.
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
	const hasTech = project.stack.length > 0 || hasFeatures || hasScheme || hasProcess

	return (
		<article className='project' key={project.slug}>
			<PageHeader
				title={project.title}
				subtitle={project.tagline}
				crumbs={[{ label: 'Портфолио', to: '/portfolio' }, { label: project.title }]}
				aside={
					<div className='project__aside'>
						{project.status && (
							<span className='project__live'>
								<i aria-hidden='true' />
								{project.status}
							</span>
						)}
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
					</div>
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
						<dt>Моя роль</dt>
						<dd>{project.role}</dd>
					</div>
					<div>
						<dt>Срок</dt>
						<dd>{project.duration}</dd>
					</div>
				</dl>
			</section>

			<section className='project__brief'>
				<h2 className='project__h2'>Коротко</h2>
				<ol>
					{BRIEF.map(({ key, label }, i) => (
						<motion.li key={key} {...reveal(i)}>
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
							<CountUp to={m.value} duration={2} separator={' '} />
							{m.suffix}
						</span>
						<span className='project__metric-label'>{m.label}</span>
					</div>
				))}
			</section>

			<section className='project__gallery'>
				<h2 className='project__h2'>Скриншоты</h2>
				<Gallery images={project.gallery} title={project.title} />
			</section>

			{hasTech && (
				<section className='project__tech' aria-label='Техническая часть'>
					<Accordion
						items={[
							{
								key: 'tech',
								head: 'Как это устроено технически',
								body: (
									<div className='project__techBody'>
										{project.stack.length > 0 && (
											<div className='project__techBlock'>
												<h3>Стек</h3>
												<ul className='stackChips'>
													{project.stack.map(s => (
														<li key={s}>{s}</li>
													))}
												</ul>
											</div>
										)}

										{hasFeatures && (
											<div className='project__techBlock'>
												<h3>Что внутри: ключевые модули, каждый сделан с нуля</h3>
												<ul className='project__featureList'>
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
											<div className='project__techBlock'>
												<h3>Путь пользователя</h3>
												<FlowScheme nodes={project.scheme!} />
											</div>
										)}

										{hasProcess && (
											<div className='project__techBlock'>
												<h3>Этапы работы</h3>
												<ol className='project__steps'>
													{project.process!.map((step, i) => (
														<li key={step.title}>
															<span className='project__step-num'>{String(i + 1).padStart(2, '0')}</span>
															<h4>{step.title}</h4>
															<p>{step.text}</p>
														</li>
													))}
												</ol>
											</div>
										)}
									</div>
								),
							},
						]}
					/>
				</section>
			)}

			<section className='project__cta'>
				<h2>Нужен похожий проект?</h2>
				<p>Расскажите о задаче — предложу решение и оценку в течение двух дней.</p>
				<button type='button' className='btn btn_light' onClick={() => open()}>
					<span className='btn__label'>Обсудить проект</span>
				</button>
			</section>

			{(prev || next) && (
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
			)}
		</article>
	)
}
