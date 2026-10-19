import Card from '../cards/Cards'
import Portfolio from '../cards/portfolio/Portfolio'
import type { Project } from '../../data/projects'

type Props = {
	project: Project
}

/** Широкая карточка главного кейса: обложка, строка результата, три факта, «Смотреть кейс» */
export default function FeaturedProject({ project }: Props) {
	return (
		<Card className='card__portfolio'>
			<Portfolio
				tags={project.categories.slice(0, 2)}
				title={project.title}
				subtitle={project.line}
				facts={project.highlights}
				link={{ href: `/portfolio/${project.slug}` }}
				cta='Смотреть кейс'
				image={{ src: project.cover, alt: `Скриншот ${project.title}` }}
			/>
		</Card>
	)
}
