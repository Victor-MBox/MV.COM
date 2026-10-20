import { STACK_GROUPS } from '../../../data/experience'
import { HR_BLOCK } from '../../../data/home'
import { CONTACT_LINKS } from '../../../data/contacts'
import { H2 } from '../../../data/home4'
import SectionHead from '../../../components/sectionHead/SectionHead'
import Reveal from '../../../components/reveal/Reveal'
import Button from '../../../components/button/Button'
import Marquee from '../../../components/marquee/Marquee'

const STACK = STACK_GROUPS.flatMap(g => g.items)

/** Для HR и тимлидов (docs/design-spec-home4.md §6.7): компактный блок без фото (оно в hero), кнопки и бегущая строка стека */
export default function Hr() {
	return (
		<section className='h4Section h4Hr' id='hr'>
			<div className='h4Container'>
				<SectionHead label='для hr' title={H2.hr} lead={HR_BLOCK.text} />
				<Reveal className='h4Hr__actions'>
					<Button variant='secondary' href={HR_BLOCK.cv} download>
						Скачать резюме
					</Button>
					<Button variant='secondary' href={CONTACT_LINKS.github}>
						GitHub ↗
					</Button>
					<Button variant='text' to='/about'>
						Опыт и стек
					</Button>
				</Reveal>
				<Reveal className='h4Hr__marquee'>
					<Marquee duration={30} label='Стек технологий'>
						{STACK.map(tech => (
							<span key={tech} className='h4Hr__tech'>
								{tech}
								<i aria-hidden='true'>·</i>
							</span>
						))}
					</Marquee>
				</Reveal>
			</div>
		</section>
	)
}
