import { CONTACT_LINKS } from '../../data/contacts'
import './SiteFooter.scss'

const LINKS = [
	{ label: 'GitHub', href: CONTACT_LINKS.github },
	{ label: 'LinkedIn', href: CONTACT_LINKS.linkedin },
	{ label: 'Telegram', href: CONTACT_LINKS.telegram },
]

/**
 * Футер дизайн-системы 1.0 (docs/design-spec.md §6.15): копирайт и ссылки. Город и живые часы из ТЗ убраны —
 * решение владельца от 20.10.2026: сайт не привязан к городу и часовому поясу (они остаются в резюме)
 */
export default function SiteFooter() {
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
		</footer>
	)
}
