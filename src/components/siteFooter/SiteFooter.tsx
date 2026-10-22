import { Link, useLocation } from 'react-router-dom'
import { openCookieSettings } from '../../consent/privacyNotice'
import { CONTACT_LINKS } from '../../data/contacts'
import { FOOTER } from '../../data/home'
import { FORM_COPY } from '../../data/leadForm'
import { COOKIE_SETTINGS_ENABLED, COOKIE_SETTINGS_LABEL, LEGAL_LINKS, getLegalDoc } from '../../data/legal'
import { OFFERS, offerPath } from '../../data/offers'
import { PROMOTION } from '../../data/promotion'
import SplitLines from '../splitLines/SplitLines'
import Reveal from '../reveal/Reveal'
import FooterForm from './FooterForm'
import './SiteFooter.scss'

// С 22.10.2026 по просьбе владельца — GitHub и LinkedIn (Telegram есть в соцпанели, форме и на /contacts)
const LINKS = [
	{ label: 'GitHub', href: CONTACT_LINKS.github },
	{ label: 'LinkedIn', href: CONTACT_LINKS.linkedin },
]

/** На странице оффера (и вложенных /services/promotion/*) заявка из футера уходит с его названием; на обзоре продвижения — с названием раздела */
function topicFor(pathname: string) {
	const path = pathname.replace(/\/+$/, '') || '/'
	if (path === PROMOTION.path) return PROMOTION.name
	return OFFERS.find(o => offerPath(o) === path)?.title ?? ''
}

/**
 * Футер-форма (макет «Футер - форма» от 20.10.2026) — финал каждой страницы: «Давайте работать вместе», слева
 * «// новый проект» и «Расскажите, что нужно сделать» (инструкция FORM_COPY.lead с 21.10.2026 — только в окне обращения
 * и на /contacts, здесь не повторяется), справа сама форма; внизу копирайт
 * и ссылки (мета-ряд «Работаю удалённо · Частный веб-разработчик» убран 22.10.2026 по просьбе владельца), под ними строка документов (ТЗ «документы, согласия, cookie» от 22.10.2026, §3: политика,
 * согласие, cookie — настоящие маршруты из data/legal.ts — и кнопка «Настройки cookie»). Бегущей строки офферов нет
 * с 21.10.2026 (повторяла каталог услуг). На /contacts своя форма, на страницах документов форма не нужна — там только
 * нижние строки. Города и часов нет (решение владельца от 20.10.2026)
 */
export default function SiteFooter() {
	const { pathname } = useLocation()
	const withForm = pathname !== '/contacts' && !getLegalDoc(pathname)

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
			<div className='siteFooter__bottom'>
				<div className='siteFooter__bar'>
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
				</div>
				<nav className='siteFooter__legal' aria-label='Документы'>
					<ul>
						{LEGAL_LINKS.map(doc => (
							<li key={doc.path}>
								<Link to={doc.path}>{doc.footerLabel}</Link>
							</li>
						))}
					</ul>
					{COOKIE_SETTINGS_ENABLED && (
						<button type='button' className='siteFooter__settings' onClick={openCookieSettings}>
							{COOKIE_SETTINGS_LABEL}
						</button>
					)}
				</nav>
			</div>
		</footer>
	)
}
