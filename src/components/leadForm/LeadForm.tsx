import { useState } from 'react'
import type { FormEvent } from 'react'
import { submitContact } from '../../api/contact'
import { OFFERS } from '../../data/offers'
import { BUDGET_RANGES } from '../../data/pricing'
import { FORM_COPY, INTENTS, JOB_FORMATS } from '../../data/leadForm'
import type { IntentKey } from '../../data/leadForm'
import { validateContact } from './validate'
import type { ContactErrors } from './validate'
import Button from '../button/Button'
import './LeadForm.scss'

type Props = {
	/** Тема из useContactModal().open(topic): название оффера подставляется в «Что нужно сделать» */
	initialTopic?: string
	onDone?: () => void
	compact?: boolean
}

type Status = 'idle' | 'sending' | 'sent' | 'error'

/**
 * Форма заявки дизайн-системы 1.0 (docs/design-spec.md §6.13): первое поле — намерение тремя кнопками,
 * состав полей зависит от него. Намерение уходит в ContactPayload.topic («Вакансия: контракт», «Вопрос»),
 * интерфейс и submitContact не меняются. Валидация общая с ContactForm (validate.ts).
 */
export default function LeadForm({ initialTopic = '', onDone, compact = false }: Props) {
	const [intent, setIntent] = useState<IntentKey>('project')
	const [name, setName] = useState('')
	const [contact, setContact] = useState('')
	const [topic, setTopic] = useState(initialTopic)
	const [budget, setBudget] = useState('')
	const [format, setFormat] = useState(JOB_FORMATS[0])
	const [message, setMessage] = useState('')
	const [consent, setConsent] = useState(false)
	const [errors, setErrors] = useState<ContactErrors>({})
	const [status, setStatus] = useState<Status>('idle')

	const payloadTopic = () => {
		if (intent === 'job') return `Вакансия: ${format}`
		if (intent === 'question') return 'Вопрос'
		return topic
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		const next = validateContact({ name, contact, message, consent })
		setErrors(next)
		if (Object.keys(next).length) return
		setStatus('sending')
		try {
			await submitContact({
				name: name.trim(),
				contact: contact.trim(),
				topic: payloadTopic(),
				budget: intent === 'project' && budget ? budget : undefined,
				message: message.trim(),
			})
			setStatus('sent')
		} catch {
			setStatus('error')
		}
	}

	if (status === 'sent') {
		return (
			<div className='leadForm__success' role='status'>
				<span className='leadForm__ok' aria-hidden='true' />
				<p>{FORM_COPY.success}</p>
				{onDone && (
					<Button variant='secondary' onClick={onDone}>
						Закрыть
					</Button>
				)}
			</div>
		)
	}

	const field = (key: keyof ContactErrors, label: string, control: React.ReactNode) => (
		<label className={`leadForm__field${errors[key] ? ' is-invalid' : ''}`}>
			<span className='leadForm__label'>{label}</span>
			{control}
			{errors[key] && <span className='leadForm__error'>{errors[key]}</span>}
		</label>
	)

	return (
		<form className={`leadForm${compact ? ' leadForm--compact' : ''}`} onSubmit={handleSubmit} noValidate>
			<div className='leadForm__intents' role='group' aria-label='С чем обращаетесь'>
				{INTENTS.map(i => (
					<button
						key={i.key}
						type='button'
						className={`leadForm__intent${intent === i.key ? ' is-active' : ''}`}
						aria-pressed={intent === i.key}
						onClick={() => setIntent(i.key)}
					>
						{i.label}
					</button>
				))}
			</div>

			<div className='leadForm__row'>
				{field(
					'name',
					'Имя',
					<input
						type='text'
						name='name'
						autoComplete='name'
						placeholder='Как к вам обращаться'
						value={name}
						onChange={e => setName(e.target.value)}
						aria-invalid={!!errors.name}
					/>
				)}
				{field(
					'contact',
					'Контакт',
					<input
						type='text'
						name='contact'
						autoComplete='email'
						placeholder='E-mail, телефон или @telegram'
						value={contact}
						onChange={e => setContact(e.target.value)}
						aria-invalid={!!errors.contact}
					/>
				)}
			</div>

			{intent === 'project' && (
				<div className='leadForm__row'>
					<label className='leadForm__field'>
						<span className='leadForm__label'>Что нужно сделать</span>
						<span className='leadForm__select'>
							<select name='topic' value={topic} onChange={e => setTopic(e.target.value)}>
								<option value=''>Выберите направление</option>
								{initialTopic && !OFFERS.some(o => o.title === initialTopic) && (
									<option value={initialTopic}>{initialTopic}</option>
								)}
								{OFFERS.map(o => (
									<option key={o.key} value={o.title}>
										{o.title}
									</option>
								))}
								<option value='Другое'>Другое</option>
							</select>
						</span>
					</label>
					<label className='leadForm__field'>
						<span className='leadForm__label'>
							Бюджет <span className='leadForm__hint'>необязательно</span>
						</span>
						<span className='leadForm__select'>
							<select name='budget' value={budget} onChange={e => setBudget(e.target.value)}>
								<option value=''>Не выбран</option>
								{BUDGET_RANGES.map(b => (
									<option key={b} value={b}>
										{b}
									</option>
								))}
							</select>
						</span>
					</label>
				</div>
			)}

			{intent === 'job' && (
				<label className='leadForm__field'>
					<span className='leadForm__label'>Формат</span>
					<span className='leadForm__select'>
						<select name='format' value={format} onChange={e => setFormat(e.target.value)}>
							{JOB_FORMATS.map(f => (
								<option key={f} value={f}>
									{f}
								</option>
							))}
						</select>
					</span>
				</label>
			)}

			{field(
				'message',
				'Сообщение',
				<textarea
					name='message'
					rows={compact ? 4 : 5}
					placeholder={
						intent === 'job'
							? 'Пара слов о команде, задачах и условиях'
							: 'Пара слов о проекте: что за продукт, сроки, бюджет, ссылки на примеры'
					}
					value={message}
					onChange={e => setMessage(e.target.value)}
					aria-invalid={!!errors.message}
				/>
			)}

			<label className={`leadForm__check${errors.consent ? ' is-invalid' : ''}`}>
				<input type='checkbox' checked={consent} onChange={e => setConsent(e.target.checked)} />
				<span className='leadForm__box' aria-hidden='true' />
				<span>Согласен на обработку персональных данных</span>
			</label>
			{errors.consent && <span className='leadForm__error'>{errors.consent}</span>}

			{status === 'error' && (
				<p className='leadForm__error' role='alert'>
					Не удалось отправить. Попробуйте ещё раз или напишите в мессенджер.
				</p>
			)}

			<Button type='submit' full disabled={status === 'sending'}>
				{status === 'sending' ? 'Отправляю…' : 'Отправить заявку'}
			</Button>

			<ol className='leadForm__next' aria-label='Что будет дальше'>
				{FORM_COPY.next.map((step, i) => (
					<li key={step}>
						<span className='leadForm__num'>{String(i + 1).padStart(2, '0')}</span>
						{step}
					</li>
				))}
			</ol>
		</form>
	)
}
