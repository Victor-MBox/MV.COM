import { ABOUT, SECTIONS } from '../../../data/home5'
import portrait from '../../../resources/avatar.webp'
import SectionIntro from '../../../components/sectionIntro/SectionIntro'
import Reveal from '../../../components/reveal/Reveal'
import Button from '../../../components/button/Button'

/** Обо мне (ТЗ §12): слева реальное фото, справа заголовок, два абзаца, кнопка и строка стека без иконок. Без чисел — они в hero */
export default function About() {
	const { num, label, id } = SECTIONS.about

	return (
		<section className='h5Section h5Section--pause h5About' id={id} aria-labelledby={`${id}-title`}>
			<div className='h5Container h5About__grid'>
				<Reveal y={16} className='h5About__media'>
					<img src={portrait} alt='Виктор Мацаков за работой' width={418} height={418} loading='lazy' decoding='async' />
				</Reveal>
				<Reveal y={16} delay={0.08} className='h5About__text'>
					<SectionIntro id={`${id}-title`} num={num} label={label} title={ABOUT.title} compact />
					<div className='h5About__copy'>
						{ABOUT.paragraphs.map(p => (
							<p key={p}>{p}</p>
						))}
					</div>
					<Button to='/about' variant='secondary' arrow arrowGlyph='↗' className='h5About__cta'>
						{ABOUT.cta}
					</Button>
					<p className='h5About__stack'>{ABOUT.stack.join(' · ')}</p>
				</Reveal>
			</div>
		</section>
	)
}
