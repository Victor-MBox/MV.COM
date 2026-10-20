import { EXPERIENCE, STACK_GROUPS } from '../../../data/experience'
import { HR_BLOCK } from '../../../data/home'
import { CONTACT_LINKS } from '../../../data/contacts'
import { H2 } from '../../../data/home3'
import victor from '../../../resources/victor.png'
import SectionHead from '../../../components/sectionHead/SectionHead'
import Reveal from '../../../components/reveal/Reveal'
import Button from '../../../components/button/Button'
import Marquee from '../../../components/marquee/Marquee'
import ExperienceRow from './ExperienceRow'

const STACK = STACK_GROUPS.flatMap(g => g.items)

/** Для HR и тимлидов (docs/design-spec.md §7.5): единственное фото на сайте, кнопки, опыт строками, бегущая строка стека */
export default function Hr() {
	return (
		<section className='home3Section' id='hr'>
			<SectionHead label='для hr' title={H2.hr} lead={HR_BLOCK.text} />
			<div className='hr__grid'>
				<Reveal className='hr__aside'>
					<div className='hr__photo'>
						<img src={victor} alt='Виктор Мацаков' width={726} height={810} loading='lazy' />
					</div>
					<div className='hr__actions'>
						<Button href={HR_BLOCK.cv} download>
							Скачать резюме
						</Button>
						<Button variant='secondary' href={CONTACT_LINKS.github}>
							GitHub ↗
						</Button>
					</div>
				</Reveal>
				<ol className='hr__experience'>
					{EXPERIENCE.map((item, i) => (
						<Reveal as='li' key={item.period} index={i}>
							<ExperienceRow item={item} number={String(i + 1).padStart(2, '0')} />
						</Reveal>
					))}
				</ol>
			</div>
			<Reveal className='hr__marquee'>
				<Marquee duration={30} label='Стек технологий'>
					{STACK.map(tech => (
						<span key={tech} className='hr__tech'>
							{tech}
							<i aria-hidden='true'>·</i>
						</span>
					))}
				</Marquee>
			</Reveal>
		</section>
	)
}
