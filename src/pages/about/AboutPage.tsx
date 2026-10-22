import { Fragment } from 'react'
import PageHead from '../../components/pageHead/PageHead'
import SectionHead from '../../components/sectionHead/SectionHead'
import DimAccordion from '../../components/dimAccordion/DimAccordion'
import Reveal from '../../components/reveal/Reveal'
import Button from '../../components/button/Button'
import Chip from '../../components/chip/Chip'
import { useContactModal } from '../../components/contactModal/ContactModalContext'
import { EXPERIENCE, STACK_COPY, STACK_GROUPS, formatPeriod } from '../../data/experience'
import { ABOUT_AREAS, ABOUT_INTRO, ABOUT_SECTIONS, ABOUT_TEAMS } from '../../data/about'
import { CONTACT_LINKS } from '../../data/contacts'
import portraitDark from '../../resources/victor-about.webp'
import portraitLight from '../../resources/victor-about-light.webp'
import { useTheme } from '../../hooks/useTheme'
import { useDocumentMeta } from '../../hooks/useDocumentMeta'
import { SITE_META } from '../../data/meta'
import './AboutPage.scss'

const S = ABOUT_SECTIONS

/**
 * «Обо мне» (ТЗ от 21.10.2026 «реальный опыт» и правка того же дня; docs/design-spec.md §9): представление с фото →
 * опыт аккордеоном → задачи → технологии → для агентств и команд; финал — общий футер. Проектов здесь нет — они
 * в портфолио. Тексты — data/about.ts и data/experience.ts. Опыт не прячется за Reveal: содержание видно без
 * декоративной анимации
 */
export default function AboutPage() {
	const { open } = useContactModal()
	const { isLight } = useTheme()
	useDocumentMeta(SITE_META.about)

	const experience = EXPERIENCE.map((e, i) => ({
		id: e.from,
		number: String(i + 1).padStart(2, '0'),
		title: e.title,
		meta: `${e.role} · ${formatPeriod(e)}`,
		content: (
			<ul className='aboutPage__details'>
				{e.details.map(d => (
					<li key={d}>{d}</li>
				))}
			</ul>
		),
	}))

	return (
		<div className='aboutPage'>
			<PageHead
				label={ABOUT_INTRO.label}
				title={{ text: ABOUT_INTRO.title }}
				lead={ABOUT_INTRO.text}
				meta={ABOUT_INTRO.role.split(' · ').map((part, i) => (
					// Переносится только после «·»: «PHP / Laravel / React» не рвётся на узком экране
					<Fragment key={part}>
						{i > 0 && '\u00a0· '}
						<span className='aboutPage__nowrap'>{part}</span>
					</Fragment>
				))}
				asideFirst
				actions={
					<>
						<Button href={ABOUT_INTRO.resume.href} newTab arrow arrowGlyph='↗'>
							{ABOUT_INTRO.resume.label}
						</Button>
						<Button variant='secondary' to={ABOUT_INTRO.works.to}>
							{ABOUT_INTRO.works.label}
						</Button>
					</>
				}
				aside={
					<div className='aboutPage__photo'>
						<img src={isLight ? portraitLight : portraitDark} alt={ABOUT_INTRO.photoAlt} width={720} height={900} />
					</div>
				}
			/>

			<section className='section' id='experience'>
				<div className='container'>
					<SectionHead label={S.experience.label} title={S.experience.title} />
					<DimAccordion idPrefix='exp' items={experience} defaultOpen={[experience[0].id]} />
				</div>
			</section>

			<section className='section' id='areas'>
				<div className='container'>
					<SectionHead label={S.areas.label} title={S.areas.title} />
					<ul className='aboutPage__areas'>
						{ABOUT_AREAS.map((a, i) => (
							<Reveal as='li' key={a.title} index={i} className='aboutPage__area'>
								<span className='aboutPage__num' aria-hidden='true'>
									{String(i + 1).padStart(2, '0')}
								</span>
								<h3 className='aboutPage__h3'>{a.title}</h3>
								<p>{a.text}</p>
							</Reveal>
						))}
					</ul>
				</div>
			</section>

			<section className='section' id='stack'>
				<div className='container'>
					<SectionHead label={S.stack.label} title={S.stack.title} lead={STACK_COPY.lead} />
					<Reveal>
						<ul className='aboutPage__stack'>
							{STACK_GROUPS.map(g => (
								<li key={g.title} className='aboutPage__stackRow'>
									<h3 className='aboutPage__stackTitle'>{g.title}</h3>
									<ul className='aboutPage__chips'>
										{g.items.map(i => (
											<Chip as='li' key={i}>
												{i}
											</Chip>
										))}
									</ul>
								</li>
							))}
						</ul>
						<p className='aboutPage__also'>{STACK_COPY.also}</p>
					</Reveal>
				</div>
			</section>

			<section className='section' id='teams'>
				<div className='container'>
					<SectionHead label={S.teams.label} title={S.teams.title} lead={ABOUT_TEAMS.text} />
					<Reveal className='aboutPage__actions'>
						<Button variant='secondary' arrow onClick={() => open(ABOUT_TEAMS.topic)}>
							{ABOUT_TEAMS.cta}
						</Button>
						<Button variant='text' href={CONTACT_LINKS.github} arrowGlyph='↗'>
							{ABOUT_TEAMS.github}
						</Button>
						<Button variant='text' to={ABOUT_TEAMS.agencies.to}>
							{ABOUT_TEAMS.agencies.label}
						</Button>
					</Reveal>
				</div>
			</section>
		</div>
	)
}
