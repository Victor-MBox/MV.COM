import { useState } from 'react'
import PageHead from '../../components/pageHead/PageHead'
import SectionHead from '../../components/sectionHead/SectionHead'
import LeadForm from '../../components/leadForm/LeadForm'
import DimAccordion from '../../components/dimAccordion/DimAccordion'
import Reveal from '../../components/reveal/Reveal'
import { CONTACTS, CONTACT_LINKS } from '../../data/contacts'
import { CONTACTS_FAQ_KEYS, FAQ, getFaq } from '../../data/faq'
import './ContactsPage.scss'

type Channel = {
	key: string
	label: string
	value: string
	href: string
	/** Что уходит в буфер; без поля кнопки копирования нет */
	copy?: string
	hint: string
}

const CHANNELS: Channel[] = [
	{
		key: 'telegram',
		label: 'Telegram',
		value: `@${CONTACTS.telegram}`,
		href: CONTACT_LINKS.telegram,
		copy: `@${CONTACTS.telegram}`,
		hint: 'Самый быстрый способ',
	},
	{
		key: 'email',
		label: 'E-mail',
		value: CONTACTS.email,
		href: CONTACT_LINKS.email,
		copy: CONTACTS.email,
		hint: 'Для подробных брифов',
	},
	{
		key: 'whatsapp',
		label: 'WhatsApp',
		value: `+${CONTACTS.whatsapp}`,
		href: CONTACT_LINKS.whatsapp,
		copy: `+${CONTACTS.whatsapp}`,
		hint: 'Звонки и голосовые',
	},
	{
		key: 'github',
		label: 'GitHub',
		value: `github.com/${CONTACTS.github}`,
		href: CONTACT_LINKS.github,
		hint: 'Открытый код',
	},
]

// TODO (владелец): H1 и лид страницы контактов; «в течение рабочего дня» ушло из лида в H1, чтобы не повторяться
const HEAD = {
	title: { text: 'Напишите — отвечу в течение рабочего дня', muted: 'в течение рабочего дня' },
	lead: 'Напишите в любой удобный мессенджер или оставьте заявку через форму.',
}

// TODO (владелец): заголовки колонок и блока вопросов
const H2 = {
	channels: { text: 'Как связаться' },
	form: { text: 'Оставить заявку' },
	faq: { text: 'Вопросы до старта', muted: 'до старта' },
}

const COPIED_MS = 1600

/**
 * Контакты (docs/design-spec.md §9): шапка со статусом → каналы строками (с копированием в буфер) и встроенная форма
 * в единственной панели страницы → четыре вопроса аккордеоном. CTA-блока нет — форма уже здесь
 */
export default function ContactsPage() {
	const [copied, setCopied] = useState<string | null>(null)
	const faq = getFaq(CONTACTS_FAQ_KEYS).map(f => ({ id: f.key, title: f.q, content: <p>{f.a}</p> }))

	const copy = async (ch: Channel) => {
		if (!ch.copy) return
		try {
			await navigator.clipboard.writeText(ch.copy)
			setCopied(ch.key)
			window.setTimeout(() => setCopied(c => (c === ch.key ? null : c)), COPIED_MS)
		} catch {
			// буфер недоступен — ничего страшного, ссылка всё равно работает
		}
	}

	return (
		<div className='contactsPage'>
			<PageHead
				label='контакты'
				title={HEAD.title}
				lead={HEAD.lead}
				aside={
					<div className='contactsPage__status'>
						<p className='contactsPage__statusLine'>
							<i aria-hidden='true' />
							Открыт для проектов
						</p>
						<p className='contactsPage__place'>{CONTACTS.location}</p>
					</div>
				}
			/>

			<section className='section' id='channels'>
				<div className='container contactsPage__grid'>
					<div className='contactsPage__channels'>
						<SectionHead label='каналы' title={H2.channels} />
						<Reveal as='ul' className='contactsPage__list'>
							{CHANNELS.map(ch => {
								const external = ch.href.startsWith('http')
								const isCopied = copied === ch.key
								return (
									<li key={ch.key} className='contactsPage__channel'>
										<a
											className='contactsPage__link'
											href={ch.href}
											target={external ? '_blank' : undefined}
											rel={external ? 'noopener noreferrer' : undefined}
										>
											<span className='contactsPage__label'>{ch.label}</span>
											<span className='contactsPage__value'>{ch.value}</span>
											<span className='contactsPage__hint'>{ch.hint}</span>
										</a>
										{ch.copy && (
											<button
												type='button'
												className={`contactsPage__copy${isCopied ? ' is-copied' : ''}`}
												onClick={() => copy(ch)}
												aria-label={isCopied ? `${ch.label} скопирован` : `Скопировать ${ch.label}`}
											>
												{isCopied ? (
													<svg viewBox='0 0 24 24' aria-hidden='true'>
														<path
															d='M5 12.5l4.5 4.5L19 7.5'
															fill='none'
															stroke='currentColor'
															strokeWidth='2'
															strokeLinecap='round'
															strokeLinejoin='round'
														/>
													</svg>
												) : (
													<svg viewBox='0 0 24 24' aria-hidden='true'>
														<rect x='9' y='9' width='11' height='11' rx='2' fill='none' stroke='currentColor' strokeWidth='1.8' />
														<path
															d='M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3'
															fill='none'
															stroke='currentColor'
															strokeWidth='1.8'
															strokeLinecap='round'
														/>
													</svg>
												)}
											</button>
										)}
									</li>
								)
							})}
						</Reveal>
					</div>

					<Reveal className='contactsPage__panel' delay={0.08}>
						<SectionHead label='заявка' title={H2.form} className='contactsPage__panelHead' />
						<LeadForm />
					</Reveal>
				</div>
			</section>

			<section className='section' id='faq'>
				<div className='container contactsPage__faq'>
					<SectionHead label='вопросы' title={H2.faq} action={{ label: `Все ${FAQ.length} вопросов`, to: '/services#faq' }} />
					<Reveal>
						<DimAccordion idPrefix='contacts-faq' items={faq} multiple />
					</Reveal>
				</div>
			</section>
		</div>
	)
}
