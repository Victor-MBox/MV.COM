import { useEffect } from 'react'
import type { CSSProperties } from 'react'
import { Link, useParams } from 'react-router-dom'
import PageHead from '../../components/pageHead/PageHead'
import SectionHead from '../../components/sectionHead/SectionHead'
import Button from '../../components/button/Button'
import Chip from '../../components/chip/Chip'
import Stat from '../../components/stat/Stat'
import { formatStat } from '../../components/stat/formatStat'
import Reveal from '../../components/reveal/Reveal'
import Narrative from '../../components/caseInside/Narrative'
import Architecture from '../../components/caseInside/Architecture'
import { useContactModal } from '../../components/contactModal/ContactModalContext'
import { getProject, isPublic } from '../../data/projects'
import { INSIDE_FONTS, getInside } from '../../data/caseInside'
import { insideMeta } from '../../data/meta'
import { useDocumentMeta } from '../../hooks/useDocumentMeta'
import NotFoundPage from '../NotFoundPage'
import './InsidePage.scss'

/** «Основатель, …» → «основатель, …» для строки моно, как на странице кейса */
const lower = (s: string) => s.charAt(0).toLowerCase() + s.slice(1)

/**
 * Страница «кейс изнутри» (/portfolio/:slug/inside, ТЗ владельца от 28.10.2026): шапка → сюжет Narrative (главы
 * слева, живой интерфейс продукта в залипшем окне справа) → горизонтальная секция Architecture (путь запроса по стеку)
 * → финал с цифрами (единственное место с числами), стеком и кнопками. Обычная страница кейса /portfolio/:slug остаётся
 */
export default function InsidePage() {
	const { slug } = useParams()
	const project = getProject(slug)
	const inside = getInside(slug)
	const { open } = useContactModal()
	useDocumentMeta(project && inside ? insideMeta(project) : null)

	// Шрифты интерфейса NoRandoms нужны только сценам этой страницы
	useEffect(() => {
		const link = document.createElement('link')
		link.rel = 'stylesheet'
		link.href = INSIDE_FONTS
		document.head.appendChild(link)
		return () => link.remove()
	}, [])

	if (!project || !inside) return <NotFoundPage />

	const metrics = project.metrics.filter(isPublic)
	const meta = (
		<>
			<span className='insidePage__facts'>
				<Link to='/portfolio'>Портфолио</Link> · <Link to={`/portfolio/${project.slug}`}>{project.title}</Link> · {lower(project.client)} · {project.year}
				{project.status && (
					<>
						{' · '}
						<span className='insidePage__status'>
							<i aria-hidden='true' />
							{project.status}
						</span>
					</>
				)}
			</span>
			<span className='insidePage__role'>Моя роль: {lower(project.role)}.</span>
		</>
	)

	return (
		<article className='insidePage' key={project.slug}>
			<PageHead
				label={inside.head.label}
				title={inside.head.title}
				lead={inside.head.lead}
				meta={meta}
				actions={
					<>
						{project.link && (
							<Button href={project.link} arrow arrowGlyph='↗'>
								Открыть сайт
							</Button>
						)}
						<Button variant='text' to={`/portfolio/${project.slug}`}>
							{inside.head.classic}
						</Button>
					</>
				}
			/>

			<Narrative chapters={inside.chapters} site={inside.site} />

			<Architecture head={inside.arch.head} nodes={inside.arch.nodes} />

			<section className='section' id='result' aria-label='Результат'>
				<div className='container'>
					<SectionHead label={inside.final.label} title={inside.final.title} lead={inside.final.text} />
					{metrics.length > 0 && (
						<Reveal as='ul' className='insidePage__metrics' style={{ '--count': metrics.length } as CSSProperties}>
							{metrics.map(m => (
								<li key={m.label}>
									{/* У Stat нет префикса: с ним значение уходит строкой без счётчика */}
									<Stat value={m.prefix ? `${m.prefix}${formatStat(m.value)}` : m.value} suffix={m.suffix} label={m.label} />
								</li>
							))}
						</Reveal>
					)}
					<Reveal as='ul' className='insidePage__stack' aria-label='Стек проекта' delay={0.1}>
						{project.stack.map(s => (
							<Chip as='li' key={s}>
								{s}
							</Chip>
						))}
					</Reveal>
					<Reveal className='insidePage__actions' delay={0.15}>
						{project.link && (
							<Button href={project.link} arrow arrowGlyph='↗'>
								Открыть сайт
							</Button>
						)}
						<Button variant='secondary' onClick={() => open()}>
							Обсудить похожий проект
						</Button>
					</Reveal>
				</div>
			</section>
		</article>
	)
}
