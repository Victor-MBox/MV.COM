import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Project } from '../../data/projects'
import './ProjectCard.scss'

type Props = {
	project: Project
	index?: number
}

export default function ProjectCard({ project, index = 0 }: Props) {
	return (
		<motion.article
			className='projectCard'
			layout
			initial={{ opacity: 0, y: 24 }}
			animate={{ opacity: 1, y: 0 }}
			exit={{ opacity: 0, scale: 0.96 }}
			transition={{ duration: 0.35, delay: index * 0.04, ease: [0.4, 0, 0.2, 1] }}
		>
			<Link to={`/portfolio/${project.slug}`} className='projectCard__link'>
				<div className='projectCard__media'>
					<img src={project.cover} alt={`Скриншот ${project.title}`} loading='lazy' />
					<span className='projectCard__year'>{project.year}</span>
					<span className='projectCard__hint'>
						Смотреть проект
						<svg viewBox='0 0 24 24' aria-hidden='true'>
							<path d='M7 17L17 7M9 7h8v8' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
						</svg>
					</span>
				</div>
				<div className='projectCard__body'>
					<ul className='projectCard__tags' aria-label='Категории'>
						{project.categories.map(c => (
							<li key={c} className='tag'>
								{c}
							</li>
						))}
					</ul>
					<h3 className='projectCard__title'>{project.title}</h3>
					<p className='projectCard__subtitle'>{project.tagline}</p>
				</div>
			</Link>
		</motion.article>
	)
}
