import { ABOUT_BRIEF, H2 } from '../../../data/home'
import SectionHead from '../../../components/sectionHead/SectionHead'
import Reveal from '../../../components/reveal/Reveal'
import Button from '../../../components/button/Button'

/**
 * Кратко о разработчике (ТЗ от 21.10.2026, §10): кто будет работать над проектом — абзац и ссылка на «Обо мне».
 * Без чисел стажа и проектов, без полосы технологий и без второго фото (портрет уже в hero)
 */
export default function About() {
	return (
		<section className='section homeAbout' id='about'>
			<div className='container homeAbout__grid'>
				<SectionHead label='обо мне' title={H2.about} className='homeAbout__head' />
				<Reveal className='homeAbout__body' delay={0.08}>
					<p>{ABOUT_BRIEF.text}</p>
					<Button variant='text' to='/about'>
						{ABOUT_BRIEF.link}
					</Button>
				</Reveal>
			</div>
		</section>
	)
}
