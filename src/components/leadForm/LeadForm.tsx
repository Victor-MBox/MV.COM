import { useEffect, useId, useRef } from 'react'
import type { FormEvent } from 'react'
import { CONTACT_LINKS } from '../../data/contacts'
import { FORM_COPY, FORM_TEST_MODE, LEAD_FIELDS } from '../../data/leadForm'
import type { LeadFormId } from '../../data/leadForm'
import { useLeadForm } from './useLeadForm'
import { useFormVisible } from './useDeliveryReady'
import Button from '../button/Button'
import Checkbox from '../checkbox/Checkbox'
import FormFallback from './FormFallback'
import TrapField from './TrapField'
import { ConsentLabel, PolicyLine, TopicLine } from './ConsentNote'
import './LeadForm.scss'

type Props = {
	/** Контекст обращения из useContactModal().open(topic) — уходит в ContactPayload.topic и показывается строкой над полями */
	topic?: string
	/** Откуда отправлено — в заявку и запись о согласии; модалка передаёт 'modal', /contacts — по умолчанию */
	formId?: LeadFormId
	onDone?: () => void
	compact?: boolean
}

/**
 * Форма первого обращения (ТЗ от 21.10.2026, §13; ТЗ «документы, согласия, cookie» от 22.10.2026, §7): три поля из
 * LEAD_FIELDS — имя (необязательно), Telegram или почта, что нужно сделать — чекбокс согласия со ссылкой на документ
 * согласия и строка со ссылкой на политику. Состояние и отправка — useLeadForm, общий с формой футера. Встроена
 * на /contacts, в модалке — `compact`. Заголовок и лид (FORM_COPY.title / lead) ставит контейнер. Пока сервер
 * не настроен (health → ready: false), в публичной сборке вместо формы — FormFallback («Написать в Telegram»)
 */
export default function LeadForm(props: Props) {
	const visible = useFormVisible()
	return visible ? <LeadFormFields {...props} /> : <FormFallback />
}

function LeadFormFields({ topic = '', formId = 'contacts', onDone, compact = false }: Props) {
	const uid = useId()
	const id = (key: string) => `${uid}-${key}`
	const { values, consent, trap, errors, status, requestId, setField, setConsent, setTrap, submit } = useLeadForm(topic, formId)
	const successRef = useRef<HTMLDivElement>(null)

	// Кнопка отправки исчезает вместе с формой — фокус на сообщение об успехе, а не в никуда
	useEffect(() => {
		if (status === 'sent') successRef.current?.focus()
	}, [status])

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		const firstInvalid = await submit()
		if (firstInvalid) document.getElementById(id(firstInvalid))?.focus()
	}

	if (status === 'sent') {
		return (
			<div className='leadForm__success' role='status' tabIndex={-1} ref={successRef}>
				<p>
					<span className='leadForm__ok' aria-hidden='true' />
					{FORM_COPY.success}
				</p>
				{requestId && (
					<span className='leadForm__requestId'>
						{FORM_COPY.requestId}: {requestId}
					</span>
				)}
				{FORM_TEST_MODE && <span className='leadForm__test'>{FORM_COPY.testMode}</span>}
				{onDone && (
					<Button variant='secondary' onClick={onDone}>
						Закрыть
					</Button>
				)}
			</div>
		)
	}

	const field = (key: (typeof LEAD_FIELDS)[number]['key']) => {
		const f = LEAD_FIELDS.find(x => x.key === key)!
		const error = key === 'name' ? undefined : errors[key]
		const props = {
			id: id(key),
			name: key,
			autoComplete: f.autoComplete,
			placeholder: f.placeholder,
			value: values[key],
			'aria-required': f.required,
			'aria-invalid': !!error,
			'aria-describedby': error ? id(`${key}-error`) : undefined,
		}
		return (
			<div className={`leadForm__field${error ? ' is-invalid' : ''}`}>
				<label className='leadForm__label' htmlFor={id(key)}>
					{f.label}
					{!f.required && <span className='leadForm__hint'>{FORM_COPY.optional}</span>}
				</label>
				{key === 'message' ? (
					<textarea {...props} rows={compact ? 4 : 5} onChange={e => setField(key, e.target.value)} />
				) : (
					<input {...props} type='text' onChange={e => setField(key, e.target.value)} />
				)}
				{error && (
					<span className='leadForm__error' id={id(`${key}-error`)}>
						{error}
					</span>
				)}
			</div>
		)
	}

	return (
		<form className={`leadForm${compact ? ' leadForm--compact' : ''}`} onSubmit={handleSubmit} noValidate>
			<TopicLine topic={topic} className='leadForm__topic' />
			<div className='leadForm__row'>
				{field('name')}
				{field('contact')}
			</div>
			{field('message')}
			<TrapField id={id('website')} value={trap} onChange={setTrap} />

			<div className='leadForm__consent'>
				<Checkbox
					id={id('consent')}
					className='leadForm__check'
					required
					checked={consent}
					onChange={setConsent}
					invalid={!!errors.consent}
					describedBy={errors.consent ? id('consent-error') : undefined}
				>
					<ConsentLabel />
				</Checkbox>
				{errors.consent && (
					<span className='leadForm__error' id={id('consent-error')} role='alert'>
						{errors.consent}
					</span>
				)}
				<PolicyLine className='leadForm__policy' />
			</div>

			{status === 'error' && (
				<p className='leadForm__error' role='alert'>
					{FORM_COPY.error}
				</p>
			)}

			{FORM_TEST_MODE && <p className='leadForm__test'>{FORM_COPY.testMode}</p>}

			<Button type='submit' full disabled={status === 'sending'}>
				{status === 'sending' ? FORM_COPY.sending : FORM_COPY.submit}
			</Button>

			<p className='leadForm__direct'>
				{FORM_COPY.reply} {FORM_COPY.direct}
				{' '}
				<a href={CONTACT_LINKS.telegram} target='_blank' rel='noopener noreferrer'>
					Telegram
				</a>
				.
			</p>
		</form>
	)
}
