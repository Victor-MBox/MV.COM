import { useState } from 'react'
import PageHeader from '../../components/pageHeader/PageHeader'
import ContactForm from '../../components/contactForm/ContactForm'
import Accordion from '../../components/accordion/Accordion'
import { CONTACTS, CONTACT_LINKS } from '../../data/contacts'
import { CONTACTS_FAQ_KEYS, getFaq } from '../../data/faq'
import './ContactsPage.scss'

type Channel = {
	key: string
	label: string
	value: string
	href: string
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

export default function ContactsPage() {
	const [copied, setCopied] = useState<string | null>(null)

	const copy = async (ch: Channel) => {
		if (!ch.copy) return
		try {
			await navigator.clipboard.writeText(ch.copy)
			setCopied(ch.key)
			window.setTimeout(() => setCopied(c => (c === ch.key ? null : c)), 1600)
		} catch {
			// буфер недоступен — ничего страшного, ссылка всё равно работает
		}
	}

	return (
		<>
			<PageHeader
				title='Контакты'
				subtitle='Напишите в любой удобный мессенджер или оставьте заявку через форму. Отвечаю в течение рабочего дня.'
				aside={
					<div className='contactsPage__status'>
						<i aria-hidden='true' />
						<div>
							<strong>Открыт для проектов</strong>
							<span>{CONTACTS.location}</span>
						</div>
					</div>
				}
			/>

			<section className='contactsPage__grid'>
				<div className='contactsPage__channels'>
					<div className='title'>Как связаться</div>
					<ul>
						{CHANNELS.map(ch => (
							<li key={ch.key} className='channel'>
								<a href={ch.href} target={ch.href.startsWith('http') ? '_blank' : undefined} rel='noopener noreferrer' className='channel__link'>
									<span className='channel__label'>{ch.label}</span>
									<span className='channel__value'>{ch.value}</span>
									<span className='channel__hint'>{ch.hint}</span>
								</a>
								{ch.copy && (
									<button
										type='button'
										className={`channel__copy${copied === ch.key ? ' is-copied' : ''}`}
										onClick={() => copy(ch)}
										aria-label={`Скопировать ${ch.label}`}
									>
										{copied === ch.key ? (
											<svg viewBox='0 0 24 24' aria-hidden='true'>
												<path d='M5 12.5l4.5 4.5L19 7.5' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
											</svg>
										) : (
											<svg viewBox='0 0 24 24' aria-hidden='true'>
												<rect x='9' y='9' width='11' height='11' rx='2' fill='none' stroke='currentColor' strokeWidth='1.8' />
												<path d='M15 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h3' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' />
											</svg>
										)}
									</button>
								)}
							</li>
						))}
					</ul>
				</div>

				<div className='contactsPage__form'>
					<div className='title'>Оставить заявку</div>
					<ContactForm />
				</div>
			</section>

			<section className='contactsPage__faq' id='faq'>
				<div className='titlerow'>
					<div className='title'>Частые вопросы</div>
				</div>
				<Accordion
					items={getFaq(CONTACTS_FAQ_KEYS).map(f => ({
						key: f.key,
						head: f.q,
						body: <p>{f.a}</p>,
					}))}
				/>
			</section>
		</>
	)
}
