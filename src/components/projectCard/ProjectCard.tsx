import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import type { Project } from '../../data/projects'
import './ProjectCard.scss'

type Props = {
	project: Project
	index?: number
}

/** Карточка кейса для сеток: обложка, до двух тегов, название, одна строка «что сделал → результат» */
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
				</div>
				<div className='projectCard__body'>
					{project.categories.length > 0 && (
						<ul className='projectCard__tags' aria-label='Категории'>
							{project.categories.slice(0, 2).map(c => (
								<li key={c} className='tag'>
									{c}
								</li>
							))}
						</ul>
					)}
					<h3 className='projectCard__title'>{project.title}</h3>
					<p className='projectCard__subtitle'>{project.line}</p>
				</div>
			</Link>
		</motion.article>
	)
}
