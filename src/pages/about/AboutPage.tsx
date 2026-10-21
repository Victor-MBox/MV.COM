import PageHead from '../../components/pageHead/PageHead'
import SectionHead from '../../components/sectionHead/SectionHead'
import DimAccordion from '../../components/dimAccordion/DimAccordion'
import CaseCard from '../../components/caseCard/CaseCard'
import Reveal from '../../components/reveal/Reveal'
import Button from '../../components/button/Button'
import Chip from '../../components/chip/Chip'
import { useContactModal } from '../../components/contactModal/ContactModalContext'
import { EXPERIENCE, STACK_GROUPS } from '../../data/experience'
import { PROJECTS } from '../../data/projects'
import { CONTACT_LINKS } from '../../data/contacts'
import { HR_BLOCK, HR_LINE } from '../../data/home'
import portraitDark from '../../resources/victor-about.webp'
import portraitLight from '../../resources/victor-about-light.webp'
import { useTheme } from '../../hooks/useTheme'
import './AboutPage.scss'

/**
 * Три абзаца о себе (content.md §4.6): первый — лид шапки (с 21.10.2026 — коммерческий абзац ТЗ без перечня технологий
 * и стажа), остальные — секция «О себе»
 */
const ABOUT = [
	'Я Виктор Мацаков, веб-разработчик. Работаю с новыми и существующими проектами: от структуры и интерфейса до разработки, интеграций и запуска. Со мной можно обсудить как отдельную доработку, так и проект целиком.',
	'Лучше всего получается собрать систему из многих частей и довести её до живых пользователей. Пример — NoRandoms, собственная платформа для подбора напарников по играм: спроектировал, написал и вывел в поиск в одиночку, от схемы базы и WebSockets до SEO-ядра из тысяч страниц.',
	'Работаю удалённо, по договору, с еженедельными версиями на тестовом домене. Открыт к проектной работе, контракту и part-time. Код пишу так, чтобы следующий разработчик разобрался без меня.',
]

/** Подтверждено владельцем 21.10.2026 (ТЗ «доработать содержание и услуги») — лид секции «Опыт» */
const EXPERIENCE_LEAD = 'За годы работы участвовал в разработке более 20 веб-проектов. В портфолио собраны избранные работы.'

const PRINCIPLES = [
	'Скорость загрузки — часть дизайна, а не оптимизация «потом».',
	'Анимация объясняет интерфейс, а не украшает его.',
	'Код должен быть понятен следующему разработчику без меня.',
	'Промежуточные версии — каждую неделю, без сюрпризов в конце.',
]

const STATUS = 'Открыт для проектов'
const ROLE = 'Full-stack разработчик'

// TODO (владелец): заголовки секций; в каждом — одно приглушённое выделение (muted), акцента на странице нет
const H2 = {
	about: { text: 'Один разработчик на весь проект', muted: 'на весь проект' },
	stack: { text: 'Чем работаю', muted: 'работаю' },
	experience: { text: 'Где и что делал', muted: 'и что делал' },
	principles: { text: 'Четыре правила, которых держусь', muted: 'которых держусь' },
	work: { text: 'Главный кейс' },
	hire: { text: HR_BLOCK.title, muted: 'и работодателей' },
}

const FEATURED = PROJECTS.find(p => p.featured)

/**
 * «Обо мне» — страница для найма (content.md §4.6; docs/design-spec.md §9): шапка с фото, GitHub и «Написать» →
 * о себе → стек группами → опыт аккордеоном → для команд и работодателей (бывший блок «Для HR» главной) → принципы →
 * главный кейс. Кнопки «Скачать резюме» появляются, только когда в HR_BLOCK.cv указан настоящий файл
 */
export default function AboutPage() {
	const { open } = useContactModal()
	const { isLight } = useTheme()

	const experience = EXPERIENCE.map((e, i) => ({
		id: e.period,
		number: String(i + 1).padStart(2, '0'),
		title: `${e.position} · ${e.company}`,
		content: (
			<div className='aboutPage__job'>
				<p className='aboutPage__period'>{e.period}</p>
				<p>{e.summary}</p>
				<ul className='aboutPage__details'>
					{e.details.map(d => (
						<li key={d}>{d}</li>
					))}
				</ul>
			</div>
		),
	}))

	return (
		<div className='aboutPage'>
			<PageHead
				label='обо мне'
				title={{ text: 'Виктор Мацаков' }}
				lead={ABOUT[0]}
				meta={`${ROLE} · ${HR_LINE.place}`}
				asideFirst
				actions={
					<>
						{HR_BLOCK.cv && (
							<Button href={HR_BLOCK.cv} download>
								Скачать резюме
							</Button>
						)}
						<Button variant='secondary' href={CONTACT_LINKS.github} arrow arrowGlyph='↗'>
							GitHub
						</Button>
						<Button variant='text' onClick={() => open()}>
							Написать
						</Button>
					</>
				}
				aside={
					<div className='aboutPage__photo'>
						<img src={isLight ? portraitLight : portraitDark} alt='Виктор Мацаков' width={720} height={900} />
						<p className='aboutPage__status'>
							<i aria-hidden='true' />
							{STATUS}
						</p>
					</div>
				}
			/>

			<section className='section' id='about'>
				<div className='container aboutPage__about'>
					<SectionHead label='о себе' title={H2.about} className='aboutPage__aboutHead' />
					<Reveal className='aboutPage__text' delay={0.08}>
						{ABOUT.slice(1).map(p => (
							<p key={p}>{p}</p>
						))}
					</Reveal>
				</div>
			</section>

			<section className='section' id='stack'>
				<div className='container'>
					<SectionHead label='стек' title={H2.stack} />
					<Reveal as='ul' className='aboutPage__stack'>
						{STACK_GROUPS.map(g => (
							<li key={g.title} className='aboutPage__stackRow'>
								<span className='aboutPage__stackTitle'>{g.title}</span>
								<ul className='aboutPage__chips'>
									{g.items.map(i => (
										<Chip as='li' key={i}>
											{i}
										</Chip>
									))}
								</ul>
							</li>
						))}
					</Reveal>
				</div>
			</section>

			<section className='section' id='experience'>
				<div className='container'>
					<SectionHead label='опыт' title={H2.experience} lead={EXPERIENCE_LEAD} />
					<Reveal>
						<DimAccordion idPrefix='exp' items={experience} defaultOpen={[experience[0].id]} />
					</Reveal>
				</div>
			</section>

			<section className='section' id='hire'>
				<div className='container'>
					<SectionHead label='для команд' title={H2.hire} lead={HR_BLOCK.cv ? HR_BLOCK.text : HR_BLOCK.textNoCv} />
					<Reveal className='aboutPage__hireActions'>
						{HR_BLOCK.cv && (
							<Button variant='secondary' href={HR_BLOCK.cv} download>
								Скачать резюме
							</Button>
						)}
						<Button variant='secondary' href={CONTACT_LINKS.github} arrow arrowGlyph='↗'>
							GitHub
						</Button>
						<Button variant='text' onClick={() => open()}>
							Связаться
						</Button>
					</Reveal>
				</div>
			</section>

			<section className='section' id='principles'>
				<div className='container'>
					<SectionHead label='принципы' title={H2.principles} />
					<ul className='aboutPage__principles'>
						{PRINCIPLES.map((p, i) => (
							<Reveal as='li' key={p} index={i}>
								{p}
							</Reveal>
						))}
					</ul>
				</div>
			</section>

			{FEATURED && (
				<section className='section' id='work'>
					<div className='container'>
						<SectionHead label='работы' title={H2.work} action={{ label: 'Все работы', to: '/portfolio' }} />
						<Reveal>
							<CaseCard project={FEATURED} wide />
						</Reveal>
					</div>
				</section>
			)}
		</div>
	)
}
