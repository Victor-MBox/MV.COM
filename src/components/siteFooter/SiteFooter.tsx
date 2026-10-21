import { Fragment } from 'react'
import { useLocation } from 'react-router-dom'
import { CONTACT_LINKS } from '../../data/contacts'
import { FOOTER, FOOTER_META, STRIP } from '../../data/home'
import { getOffer } from '../../data/offers'
import Marquee from '../marquee/Marquee'
import SplitLines from '../splitLines/SplitLines'
import Reveal from '../reveal/Reveal'
import FooterForm from './FooterForm'
import './SiteFooter.scss'

const LINKS = [
	{ label: 'GitHub', href: CONTACT_LINKS.github },
	{ label: 'LinkedIn', href: CONTACT_LINKS.linkedin },
	{ label: 'Telegram', href: CONTACT_LINKS.telegram },
]

/** На странице оффера заявка из футера уходит с его названием — как раньше из CTA-блока */
function topicFor(pathname: string) {
	const key = pathname.match(/^\/services\/([^/]+)/)?.[1]
	return (key && getOffer(key)?.title) || ''
}

/**
 * Футер-форма (макет «Футер - форма» от 20.10.2026) — финал каждой страницы вместо финала главной и CtaBlock:
 * инвертированная бегущая строка офферов с ✦, «Давайте работать вместе», слева «// новый проект» и ссылка в Telegram,
 * справа форма из трёх строк с чекбоксом согласия; внизу копирайт, мета-ряд и ссылки. На /contacts своя полная форма —
 * там только нижняя строка. Города и часов нет (решение владельца от 20.10.2026)
 */
export default function SiteFooter() {
	const { pathname } = useLocation()
	const withForm = pathname !== '/contacts'

	return (
		<footer className={`siteFooter${withForm ? '' : ' siteFooter--bare'}`} id={withForm ? 'contact' : undefined}>
			{withForm && (
				<>
					<div className='siteFooter__strip'>
						<Marquee duration={30} label='Услуги'>
							{STRIP.map(title => (
								<span key={title} className='siteFooter__stripItem'>
									{title}
									<i aria-hidden='true'>✦</i>
								</span>
							))}
						</Marquee>
					</div>
					<div className='container siteFooter__main'>
						<SplitLines as='h2' className='siteFooter__title' text={FOOTER.title} />
						<div className='siteFooter__grid'>
							<Reveal className='siteFooter__intro'>
								<p className='siteFooter__label'>
									<span aria-hidden='true'>//</span> {FOOTER.label}
								</p>
								<p className='siteFooter__heading'>{FOOTER.heading}</p>
								<p className='siteFooter__text'>
									{FOOTER.text}
									{'\u00a0'}
									<a href={CONTACT_LINKS.telegram} target='_blank' rel='noopener noreferrer'>
										Telegram
									</a>
									.
								</p>
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
