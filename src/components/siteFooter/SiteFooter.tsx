import { CONTACTS, CONTACT_LINKS } from '../../data/contacts'
import { useClock } from '../../hooks/useClock'
import './SiteFooter.scss'

const LINKS = [
	{ label: 'GitHub', href: CONTACT_LINKS.github },
	{ label: 'LinkedIn', href: CONTACT_LINKS.linkedin },
	{ label: 'Telegram', href: CONTACT_LINKS.telegram },
]

/** Футер дизайн-системы 1.0 (docs/design-spec.md §6.15): копирайт, ссылки, город и живые часы */
export default function SiteFooter() {
	const time = useClock()
	return (
		<footer className='siteFooter'>
			<p>© {new Date().getFullYear()} Виктор Мацаков</p>
			<ul>
				{LINKS.map(l => (
					<li key={l.label}>
						<a href={l.href} target='_blank' rel='noopener noreferrer'>
							{l.label}
						</a>
					</li>
				))}
			</ul>
			<p>
				{CONTACTS.location} · время сейчас <time>{time}</time>
			</p>
		</footer>
	)
}
