import { Link } from 'react-router-dom'
import type { Project } from '../../data/projects'
import './ProjectSpotlight.scss'

type Props = {
	project: Project
}

/** Главный кейс на главной (концепт D): подпись, название, строка, три факта и два скриншота внахлёст. Для портфолио и «Обо мне» остаётся `FeaturedProject` */
export default function ProjectSpotlight({ project }: Props) {
	const shots = (project.showcase ?? [{ src: project.cover, alt: `Скриншот ${project.title}` }]).slice(0, 2)
	const meta = [project.client, project.status].filter(Boolean).join(' · ')

	return (
		<article className='projectSpotlight'>
			<div className='projectSpotlight__body'>
				{meta && <p className='projectSpotlight__meta'>{meta}</p>}
				<h3 className='projectSpotlight__title'>{project.title}</h3>
				<p className='projectSpotlight__line'>{project.line}</p>
				{project.highlights && (
					<ul className='projectSpotlight__facts'>
						{project.highlights.map(f => (
							<li key={f.label}>
								<strong>{f.value}</strong>
								<span>{f.label}</span>
							</li>
						))}
					</ul>
				)}
				<Link to={`/portfolio/${project.slug}`} className='textLink projectSpotlight__link'>
					Смотреть кейс →
				</Link>
			</div>
			<div className={`projectSpotlight__media${shots.length > 1 ? '' : ' projectSpotlight__media--single'}`}>
				{shots.map(s => (
					<img key={s.src} src={s.src} alt={s.alt} loading='lazy' />
				))}
			</div>
		</article>
	)
}
