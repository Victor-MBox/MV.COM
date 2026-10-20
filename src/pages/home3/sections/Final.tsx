import { CONTACTS, CONTACT_LINKS } from '../../../data/contacts'
import { CTA_MARQUEE, FINAL_STATS, FORM_COPY, H2 } from '../../../data/home3'
import { useContactModal } from '../../../components/contactModal/ContactModalContext'
import { useClock } from '../../../hooks/useClock'
import SectionHead from '../../../components/sectionHead/SectionHead'
import Reveal from '../../../components/reveal/Reveal'
import Stat from '../../../components/stat/Stat'
import Marquee from '../../../components/marquee/Marquee'
import LeadForm from '../../../components/leadForm/LeadForm'

/** Финал (docs/design-spec.md §7.8): четыре счётчика, бегущая строка-CTA, встроенная форма и контакты */
export default function Final() {
	const { open } = useContactModal()
	const time = useClock()

	return (
		<section className='home3Section final' id='contact'>
			<Reveal className='final__stats'>
				{FINAL_STATS.map(s => (
					<Stat key={s.label} value={s.value} suffix={s.suffix} label={s.label} />
				))}
			</Reveal>

			<button type='button' className='ctaMarquee' onClick={() => open()} aria-label='Обсудить проект'>
				<Marquee duration={20}>
					{CTA_MARQUEE.map(text => (
						<span key={text} className='ctaMarquee__item'>
							{text}
							<span className='ctaMarquee__arrow' aria-hidden='true'>
								→
							</span>
						</span>
					))}
				</Marquee>
			</button>

			<div className='final__grid'>
				<div className='final__form'>
					<SectionHead label='контакты' title={H2.contact} lead={FORM_COPY.lead} />
					<Reveal>
						<LeadForm />
					</Reveal>
				</div>
				<Reveal as='ul' className='final__contacts'>
					<li>
						<a href={CONTACT_LINKS.email}>{CONTACTS.email}</a>
					</li>
					<li>
						<a href={CONTACT_LINKS.telegram} target='_blank' rel='noopener noreferrer'>
							@{CONTACTS.telegram}
						</a>
					</li>
					<li>{CONTACTS.location}</li>
					<li>
						время сейчас <time>{time}</time>
					</li>
				</Reveal>
			</div>
		</section>
	)
}
