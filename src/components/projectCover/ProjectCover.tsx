import { useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import CountUp from '../countUp/CountUp'
import type { Project, ProjectFact } from '../../data/projects'
import './ProjectCover.scss'

const MotionLink = motion.create(Link)

/** «18 000+» → число и суффикс для счётчика; факт без ведущей цифры («Февраль 2026») остаётся текстом */
function numeric(fact: ProjectFact) {
	const m = /^(\d[\d\s\u00a0\u202f]*)(.*)$/.exec(fact.value)
	if (!m) return null
	return { value: Number(m[1].replace(/\D/g, '')), suffix: m[2] }
}

type Props = {
	project: Project
}

/**
 * Главный кейс концепта H: обложка на всю карточку с лёгким параллаксом, затемнение снизу,
 * подпись `client · status`, название, строка и два первых факта из `highlights` счётчиками
 */
export default function ProjectCover({ project }: Props) {
	const ref = useRef<HTMLAnchorElement>(null)
	const reduced = useReducedMotion()
	const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
	const shift = useTransform(scrollYProgress, [0, 1], [40, -40])
	const meta = [project.client, project.status].filter(Boolean).join(' · ')
	const facts = (project.highlights ?? []).slice(0, 2)

	return (
		<MotionLink
			ref={ref}
			to={`/portfolio/${project.slug}`}
			className='projectCover'
			initial={{ opacity: 0, y: 24 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true, margin: '-40px' }}
			transition={{ duration: 0.6, ease: [0.2, 0.7, 0.2, 1] }}
		>
			<motion.div className='projectCover__media' style={{ y: reduced ? 0 : shift }}>
				<img src={project.cover} alt={`Скриншот ${project.title}`} loading='lazy' />
			</motion.div>
			<div className='projectCover__shade' aria-hidden='true' />
			<div className='projectCover__content'>
				<div>
					{meta && <p className='projectCover__meta'>{meta}</p>}
					<h3 className='projectCover__title'>{project.title}</h3>
					<p className='projectCover__line'>{project.line}</p>
				</div>
				{facts.length > 0 && (
					<ul className='projectCover__facts'>
						{facts.map(fact => {
							const n = numeric(fact)
							return (
								<li key={fact.label}>
									<strong>
										{n ? (
											<>
												<CountUp to={n.value} duration={1.5} separator={'\u202f'} />
												{n.suffix}
											</>
										) : (
											fact.value
										)}
									</strong>
									<span>{fact.label}</span>
								</li>
							)
						})}
					</ul>
				)}
			</div>
		</MotionLink>
	)
}
