import { Link } from 'react-router-dom'
import type { Project } from '../../../data/projects'
import { FEATURED_CASE, PROJECTS_HEAD, SECTIONS, featuredProject, sideProjects } from '../../../data/home5'
import SectionIntro from '../../../components/sectionIntro/SectionIntro'
import Reveal from '../../../components/reveal/Reveal'

const casePath = (p: Project) => `/portfolio/${p.slug}`

/** Дополнительный проект (ТЗ §9): обложка, название, одна строка задачи, 1–2 технологии. Рендерится только для реальных записей PROJECTS */
function SideCard({ project }: { project: Project }) {
	return (
		<article className='h5Mini'>
			<div className='h5Mini__media'>
				<img src={project.cover} alt={`${project.title}: обложка кейса`} width={1680} height={720} loading='lazy' decoding='async' />
			</div>
			<div className='h5Mini__body'>
				<h3 className='h5Mini__title'>
					<Link to={casePath(project)} className='h5Mini__link'>
						{project.title}
					</Link>
				</h3>
				<p className='h5Mini__text'>{project.line}</p>
				<p className='h5Mini__tech'>{project.stack.slice(0, 2).join(' / ')}</p>
			</div>
		</article>
	)
}

/**
 * Избранные проекты (ТЗ §9): главный кейс — редакционный разворот (текст слева, крупный реальный скриншот справа,
 * вся карточка — ссылка). Пока в PROJECTS один кейс, разворот занимает всю ширину; с появлением реальных проектов
 * справа встаёт колонка 40% с 1–2 карточками. Вымышленных кейсов нет
 */
export default function Projects() {
	const main = featuredProject()
	if (!main) return null
	const others = sideProjects()
	const shot = main.showcase?.[0] ?? { src: main.cover, alt: `${main.title}: обложка кейса` }
	const { num, label, id } = SECTIONS.projects

	return (
		<section className='h5Section h5Projects' id={id} aria-labelledby={`${id}-title`}>
			<div className='h5Container'>
				<Reveal y={16}>
					<SectionIntro
						id={`${id}-title`}
						num={num}
						label={label}
						size='big'
						title={PROJECTS_HEAD.title}
						lead={PROJECTS_HEAD.lead}
						action={{ label: PROJECTS_HEAD.action, to: '/portfolio' }}
					/>
				</Reveal>

				<div className={others.length ? 'h5Projects__grid' : 'h5Projects__grid h5Projects__grid--solo'}>
					<Reveal y={16} className='h5Projects__main'>
						<article className='h5Case'>
							<div className='h5Case__body'>
								<p className='h5Case__meta'>
									{main.client} · {main.year}
								</p>
								<h3 className='h5Case__title'>
									<Link to={casePath(main)} className='h5Case__link'>
										{main.title}
									</Link>
								</h3>
								<p className='h5Case__text'>{FEATURED_CASE.description}</p>
								<p className='h5Case__tech'>{FEATURED_CASE.tech.join(' / ')}</p>
								<span className='h5Case__more'>
									{PROJECTS_HEAD.more}
									<i aria-hidden='true'>↗</i>
								</span>
							</div>
							<div className='h5Case__media'>
								<img src={shot.src} alt={shot.alt} width={1600} height={1000} loading='lazy' decoding='async' />
							</div>
						</article>
					</Reveal>

					{others.length > 0 && (
						<ul className='h5Projects__side'>
							{others.map((p, i) => (
								<Reveal as='li' key={p.slug} index={i + 1} y={16}>
									<SideCard project={p} />
								</Reveal>
							))}
						</ul>
					)}
				</div>
			</div>
		</section>
	)
}
