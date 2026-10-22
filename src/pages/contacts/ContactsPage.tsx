import { useState } from 'react'
import PageHead from '../../components/pageHead/PageHead'
import SectionHead from '../../components/sectionHead/SectionHead'
import LeadForm from '../../components/leadForm/LeadForm'
import DimAccordion from '../../components/dimAccordion/DimAccordion'
import Reveal from '../../components/reveal/Reveal'
import { CONTACTS, CONTACT_LINKS } from '../../data/contacts'
import { CONTACTS_FAQ_KEYS, getFaq } from '../../data/faq'
import { FORM_COPY } from '../../data/leadForm'
import { useFormVisible } from '../../components/leadForm/useDeliveryReady'
import { SITE_META } from '../../data/meta'
import { useDocumentMeta } from '../../hooks/useDocumentMeta'
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

// Порядок — решение владельца от 22.10.2026: MAX, почта, Telegram, телефон. У MAX нет имени пользователя —
// вместо него «Открыть чат», копировать нечего
const CHANNELS: Channel[] = [
	{
		key: 'max',
		label: 'MAX',
		value: 'Открыть чат',
		href: CONTACT_LINKS.max,
		hint: 'Самый быстрый способ',
	},
	{
		key: 'email',
		label: 'E-mail',
		value: CONTACTS.email,
		href: CONTACT_LINKS.email,
		copy: CONTACTS.email,
		hint: 'Для описания задачи и материалов',
	},
	{
		key: 'telegram',
		label: 'Telegram',
		value: `@${CONTACTS.telegram}`,
		href: CONTACT_LINKS.telegram,
		copy: `@${CONTACTS.telegram}`,
		hint: 'Если удобнее Telegram',
	},
	{
		key: 'phone',
		label: 'Телефон',
		value: CONTACTS.phoneLabel,
		href: CONTACT_LINKS.phone,
		copy: CONTACTS.phone,
		hint: 'Для звонков',
	},
]

// H1 и вступление — ТЗ от 21.10.2026, §7. Вступление зависит от готовности формы (ответ health, useFormVisible): пока
// сервер не настроен, про форму не пишем. Что прислать — одна инструкция FORM_COPY.lead в панели заявки ниже
// (ТЗ по текстам и SEO от 21.10.2026), здесь не повторяется. Срок ответа стоит под формой, как везде
const HEAD = {
	title: { text: 'Обсудим вашу задачу', accent: 'вашу задачу' },
	leadWithForm: 'Напишите в Telegram или отправьте сообщение через форму.',
	leadNoForm: 'Напишите в Telegram или на почту.',
}

// TODO (владелец): заголовки колонок и блока вопросов
const H2 = {
	channels: { text: 'Как связаться' },
	form: { text: FORM_COPY.title },
	faq: { text: 'Вопросы до старта', muted: 'до старта' },
}

const COPIED_MS = 1600

/**
 * Контакты (docs/design-spec.md §9; ТЗ от 21.10.2026, §14): шапка со статусом → каналы строками (с 22.10.2026 MAX — первый,
 * дальше почта, Telegram и телефон — настоящие из contacts.ts, кроме MAX с копированием в буфер), под ними GitHub как ссылка на код, а не канал для
 * заказа; справа форма первого обращения в единственной панели страницы → четыре вопроса аккордеоном. Футер здесь
 * без формы — второй раз она не повторяется
 */
export default function ContactsPage() {
	const [copied, setCopied] = useState<string | null>(null)
	const formVisible = useFormVisible()
	useDocumentMeta(SITE_META.contacts)
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
				lead={formVisible ? HEAD.leadWithForm : HEAD.leadNoForm}
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
						<p className='contactsPage__code'>
							Код —{'\u00a0'}
							<a href={CONTACT_LINKS.github} target='_blank' rel='noopener noreferrer'>
								github.com/{CONTACTS.github}
								<span aria-hidden='true'> ↗</span>
							</a>
						</p>
					</div>

					<Reveal className='contactsPage__panel' delay={0.08}>
						<SectionHead label='заявка' title={H2.form} lead={FORM_COPY.lead} className='contactsPage__panelHead' />
						<LeadForm />
					</Reveal>
				</div>
			</section>

			<section className='section' id='faq'>
				<div className='container contactsPage__faq'>
					<SectionHead label='вопросы' title={H2.faq} action={{ label: 'Другие вопросы', to: '/services#faq' }} />
					<Reveal>
						<DimAccordion idPrefix='contacts-faq' items={faq} multiple />
					</Reveal>
				</div>
			</section>
		</div>
	)
}
