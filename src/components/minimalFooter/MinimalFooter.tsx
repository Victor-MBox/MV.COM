import { Link } from 'react-router-dom'
import { FOOTER, HOME5_PATH, PERSON, navItems } from '../../data/home5'
import './MinimalFooter.scss'

/** Футер /home5 (ТЗ §15): «VM. — Виктор Мацаков» с описанием, навигация, год и политика. Без декоративной фамилии */
export default function MinimalFooter() {
	return (
		<footer className='miniFooter'>
			<div className='miniFooter__in'>
				<div className='miniFooter__brand'>
					<Link to={HOME5_PATH} className='miniFooter__name'>
						<span className='miniFooter__logo' aria-hidden='true'>
							{PERSON.logo}
							<i>.</i>
						</span>
						<span aria-hidden='true'> — </span>
						{PERSON.name}
					</Link>
					<p className='miniFooter__desc'>{FOOTER.description}</p>
				</div>

				<nav className='miniFooter__nav' aria-label='Навигация в подвале'>
					<ul>
						{navItems().map(item => (
							<li key={item.to}>
								<Link to={item.to}>{item.label}</Link>
							</li>
						))}
					</ul>
				</nav>

				<div className='miniFooter__meta'>
					<span>© {new Date().getFullYear()}</span>
					<a href={FOOTER.privacy.href}>{FOOTER.privacy.label}</a>
				</div>
			</div>
		</footer>
	)
}
