import { Fragment } from 'react'
import { useLocation } from 'react-router-dom'
import { CONTACT_LINKS } from '../../data/contacts'
import { FOOTER, FOOTER_META } from '../../data/home'
import { FORM_COPY } from '../../data/leadForm'
import { getOffer } from '../../data/offers'
import SplitLines from '../splitLines/SplitLines'
import Reveal from '../reveal/Reveal'
import FooterForm from './FooterForm'
import './SiteFooter.scss'

// LinkedIn не выводится, пока в contacts.ts заглушка (code.md §11)
const LINKS = [
	{ label: 'GitHub', href: CONTACT_LINKS.github },
	{ label: 'Telegram', href: CONTACT_LINKS.telegram },
]

/** На странице оффера заявка из футера уходит с его названием — как раньше из CTA-блока */
function topicFor(pathname: string) {
	const key = pathname.match(/^\/services\/([^/]+)/)?.[1]
	return (key && getOffer(key)?.title) || ''
}

/**
 * Футер-форма (макет «Футер - форма» от 20.10.2026) — финал каждой страницы: «Давайте работать вместе», слева
 * «// новый проект» и «Расскажите, что нужно сделать» (инструкция FORM_COPY.lead с 21.10.2026 — только в окне обращения
 * и на /contacts, здесь не повторяется), справа сама форма; внизу копирайт,
 * мета-ряд и ссылки. Бегущей строки офферов нет с 21.10.2026 (повторяла каталог услуг). На /contacts своя форма —
 * там только нижняя строка. Города и часов нет (решение владельца от 20.10.2026)
 */
export default function SiteFooter() {
	const { pathname } = useLocation()
	const withForm = pathname !== '/contacts'

	return (
		<footer className={`siteFooter${withForm ? '' : ' siteFooter--bare'}`} id={withForm ? 'contact' : undefined}>
			{withForm && (
				<>
					<div className='container siteFooter__main'>
						<SplitLines as='h2' className='siteFooter__title' text={FOOTER.title} />
						<div className='siteFooter__grid'>
							<Reveal className='siteFooter__intro'>
								<p className='siteFooter__label'>
									<span aria-hidden='true'>//</span> {FOOTER.label}
								</p>
								<p className='siteFooter__heading'>{FORM_COPY.title}</p>
							</Reveal>
							<Reveal className='siteFooter__form' delay={0.08}>
								<FooterForm topic={topicFor(pathname)} />
							</Reveal>
						</div>
					</div>
				</>
			)}
			<div className='siteFooter__bar'>
				<p>© {new Date().getFullYear()} Виктор Мацаков</p>
				<p className='siteFooter__meta'>
					{FOOTER_META.map((item, i) => (
						<Fragment key={item}>
							{i > 0 && <span aria-hidden='true'>·</span>}
							<span>{item}</span>
						</Fragment>
					))}
				</p>
				<ul>
					{LINKS.map(l => (
						<li key={l.label}>
							<a href={l.href} target='_blank' rel='noopener noreferrer'>
								{l.label}
							</a>
						</li>
					))}
				</ul>
			</div>
		</footer>
	)
}
