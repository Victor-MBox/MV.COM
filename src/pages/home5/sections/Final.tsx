import { CONTACT_LINKS } from '../../../data/contacts'
import { CHANNEL_LABELS, CONTACT_CHANNELS, CONTACT_HEAD, SECTIONS } from '../../../data/home5'
import { useContactModal } from '../../../components/contactModal/ContactModalContext'
import SectionIntro from '../../../components/sectionIntro/SectionIntro'
import Reveal from '../../../components/reveal/Reveal'
import Button from '../../../components/button/Button'

/** Финальный CTA (ТЗ §14): альтернативный фон, мягкое свечение, крупный заголовок, одна кнопка в модалку и реальные каналы связи. Формы здесь нет */
export default function Final() {
	const { open } = useContactModal()
	const { num, label, id } = SECTIONS.contact

	return (
		<section className='h5Final' id={id} aria-labelledby={`${id}-title`}>
			<div className='h5Container h5Final__in'>
				<Reveal y={16} className='h5Final__content'>
					<SectionIntro id={`${id}-title`} num={num} label={label} size='big' title={CONTACT_HEAD.title} lead={CONTACT_HEAD.lead} center />
					<Button onClick={() => open()} arrow arrowGlyph='↗'>
						{CONTACT_HEAD.cta}
					</Button>
					<ul className='h5Final__links' aria-label='Способы связи'>
						{CONTACT_CHANNELS.map(key => {
							const href = CONTACT_LINKS[key]
							const external = /^https?:/.test(href)
							return (
								<li key={key}>
									<a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined}>
										{CHANNEL_LABELS[key]}
									</a>
								</li>
							)
						})}
					</ul>
				</Reveal>
			</div>
		</section>
	)
}
