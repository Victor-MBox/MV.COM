import { useState } from 'react'
import type { FormEvent } from 'react'
import { submitContact } from '../../api/contact'
import { SERVICES, SERVICE_GROUPS, getServicesByGroup } from '../../data/services'
import './ContactForm.scss'

type Props = {
	initialTopic?: string
	onDone?: () => void
	compact?: boolean
}

type Errors = Partial<Record<'name' | 'contact' | 'message' | 'consent', string>>
type Status = 'idle' | 'sending' | 'sent' | 'error'

export default function ContactForm({ initialTopic = '', onDone, compact = false }: Props) {
	const [name, setName] = useState('')
	const [contact, setContact] = useState('')
	const [topic, setTopic] = useState(initialTopic)
	const [message, setMessage] = useState('')
	const [consent, setConsent] = useState(false)
	const [errors, setErrors] = useState<Errors>({})
	const [status, setStatus] = useState<Status>('idle')

	const validate = (): Errors => {
		const next: Errors = {}
		if (name.trim().length < 2) next.name = 'Напишите, как к вам обращаться'
		const c = contact.trim()
		const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c)
		const looksLikePhone = /^\+?[\d\s()-]{7,}$/.test(c)
		const looksLikeHandle = /^@?[\w.]{3,}$/.test(c)
		if (!(looksLikeEmail || looksLikePhone || looksLikeHandle)) {
			next.contact = 'Укажите e-mail, телефон или ник в Telegram'
		}
		if (message.trim().length < 10) next.message = 'Расскажите о задаче чуть подробнее'
		if (!consent) next.consent = 'Нужно согласие на обработку данных'
		return next
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		const next = validate()
		setErrors(next)
		if (Object.keys(next).length) return
		setStatus('sending')
		try {
			await submitContact({ name: name.trim(), contact: contact.trim(), topic, message: message.trim() })
			setStatus('sent')
		} catch {
			setStatus('error')
		}
	}

	if (status === 'sent') {
		return (
			<div className='contactForm__success' role='status'>
				<div className='contactForm__success-icon' aria-hidden='true'>
					<svg viewBox='0 0 24 24'>
						<path
							d='M5 12.5l4.5 4.5L19 7.5'
							fill='none'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						/>
					</svg>
				</div>
				<h3>Заявка отправлена</h3>
				<p>Спасибо, {name.trim()}! Отвечу на «{contact.trim()}» в течение рабочего дня.</p>
				{onDone && (
					<button type='button' className='btn btn_light' onClick={onDone}>
						<span className='btn__label'>Закрыть</span>
					</button>
				)}
			</div>
		)
	}

	return (
		<form className={`contactForm${compact ? ' contactForm--compact' : ''}`} onSubmit={handleSubmit} noValidate>
			<div className='contactForm__row'>
				<label className='field'>
					<span className='field__label'>Имя</span>
					<input
						type='text'
						name='name'
						autoComplete='name'
						placeholder='Как к вам обращаться'
						value={name}
						onChange={e => setName(e.target.value)}
						aria-invalid={!!errors.name}
					/>
					{errors.name && <span className='field__error'>{errors.name}</span>}
				</label>

				<label className='field'>
					<span className='field__label'>Контакт</span>
					<input
						type='text'
						name='contact'
						autoComplete='email'
						placeholder='E-mail, телефон или @telegram'
						value={contact}
						onChange={e => setContact(e.target.value)}
						aria-invalid={!!errors.contact}
					/>
					{errors.contact && <span className='field__error'>{errors.contact}</span>}
				</label>
			</div>

			<label className='field'>
				<span className='field__label'>Что нужно сделать</span>
				<div className='field__select'>
					<select name='topic' value={topic} onChange={e => setTopic(e.target.value)}>
						<option value=''>Выберите направление</option>
						{initialTopic && !SERVICES.some(s => s.title === initialTopic) && (
							<option value={initialTopic}>{initialTopic}</option>
						)}
						{SERVICE_GROUPS.map(g => (
							<optgroup key={g.key} label={g.title}>
								{getServicesByGroup(g.key).map(s => (
									<option key={s.key} value={s.title}>
										{s.title}
									</option>
								))}
							</optgroup>
						))}
						<option value='Другое'>Другое</option>
					</select>
				</div>
			</label>

			<label className='field'>
				<span className='field__label'>Сообщение</span>
				<textarea
					name='message'
					rows={compact ? 4 : 6}
					placeholder='Пара слов о проекте: что за продукт, сроки, бюджет, ссылки на примеры'
					value={message}
					onChange={e => setMessage(e.target.value)}
					aria-invalid={!!errors.message}
				/>
				{errors.message && <span className='field__error'>{errors.message}</span>}
			</label>

			<label className='checkbox'>
				<input type='checkbox' checked={consent} onChange={e => setConsent(e.target.checked)} />
				<span className='checkbox__box' aria-hidden='true' />
				<span className='checkbox__label'>
					Согласен на обработку персональных данных
				</span>
			</label>
			{errors.consent && <span className='field__error'>{errors.consent}</span>}

			{status === 'error' && (
				<p className='contactForm__error' role='alert'>
					Не удалось отправить. Попробуйте ещё раз или напишите в мессенджер.
				</p>
			)}

			<button type='submit' className='btn btn_light contactForm__submit' disabled={status === 'sending'}>
				<span className='btn__label'>{status === 'sending' ? 'Отправляю…' : 'Отправить заявку'}</span>
			</button>
		</form>
	)
}
