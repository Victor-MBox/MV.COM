import { useId } from 'react'
import type { FormEvent } from 'react'
import { CONTACT_LINKS } from '../../data/contacts'
import { FORM_COPY, FORM_ENABLED, FORM_TEST_MODE, LEAD_FIELDS, PRIVACY_POLICY_URL } from '../../data/leadForm'
import { useLeadForm } from '../leadForm/useLeadForm'
import type { LeadStatus } from '../leadForm/useLeadForm'
import Button from '../button/Button'
import Checkbox from '../checkbox/Checkbox'
import FormFallback from '../leadForm/FormFallback'

type Props = {
	/** Контекст обращения: название оффера на его странице, иначе пусто */
	topic: string
}

const BUTTON_LABEL: Record<LeadStatus, string> = {
	idle: FORM_COPY.submit,
	error: FORM_COPY.submit,
	sending: FORM_COPY.sending,
	sent: 'Отправлено',
}

/**
 * Форма футера (макет «Футер - форма»): поля первого обращения LEAD_FIELDS строками «номер · подпись · поле» на
 * разделителях, внизу согласие чекбоксом и кнопка, под ними — срок ответа и Telegram. Состояние, проверка и отправка —
 * useLeadForm, общий с LeadForm. После отправки поля очищаются, вместо чекбокса — строка успеха; первая же правка
 * возвращает форму в исходное состояние. Пока нет обработчика и политики, в публичной сборке — FormFallback
 */
export default function FooterForm(props: Props) {
	return FORM_ENABLED ? <FooterFormFields {...props} /> : <FormFallback className='footerForm__fallback' />
}

function FooterFormFields({ topic }: Props) {
	const uid = useId()
	const id = (key: string) => `${uid}-${key}`
	const { values, consent, errors, status, setField, setConsent, submit } = useLeadForm(topic)

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		const firstInvalid = await submit()
		if (firstInvalid) document.getElementById(id(firstInvalid))?.focus()
	}

	return (
		<form className='footerForm' onSubmit={handleSubmit} noValidate aria-label={FORM_COPY.title}>
			{LEAD_FIELDS.map((f, i) => {
				const error = f.key === 'name' ? undefined : errors[f.key]
				const props = {
					id: id(f.key),
					className: 'footerForm__input',
					name: f.key,
					autoComplete: f.autoComplete,
					placeholder: f.placeholder,
					value: values[f.key],
					'aria-required': f.required,
					'aria-invalid': !!error,
					'aria-describedby': error ? id(`${f.key}-error`) : undefined,
				}
				return (
					<div key={f.key} className={`footerForm__row${error ? ' is-invalid' : ''}`}>
						<label className='footerForm__field'>
							<span className='footerForm__num' aria-hidden='true'>
								{String(i + 1).padStart(2, '0')}
							</span>
							<span className='footerForm__label'>
								{f.label}
								{!f.required && <span className='footerForm__hint'>{FORM_COPY.optional}</span>}
							</span>
							{f.key === 'message' ? (
								// Задача может быть длиннее строки и со ссылками — поле растёт по содержимому
								<textarea {...props} rows={2} onChange={e => setField(f.key, e.target.value)} />
							) : (
								<input {...props} type='text' onChange={e => setField(f.key, e.target.value)} />
							)}
						</label>
						{error && (
							<p className='footerForm__error' id={id(`${f.key}-error`)}>
								{error}
							</p>
						)}
					</div>
				)
			})}

			<div className='footerForm__foot'>
				{status === 'sent' ? (
					<p className='footerForm__status' role='status'>
						<span className='footerForm__ok' aria-hidden='true' />
						{FORM_COPY.success}
						{FORM_TEST_MODE && <span className='footerForm__test'>{FORM_COPY.testMode}</span>}
					</p>
				) : (
					<div className='footerForm__consent'>
						<Checkbox
							id={id('consent')}
							className='footerForm__check'
							required
							checked={consent}
							onChange={setConsent}
							invalid={!!errors.consent}
							describedBy={errors.consent ? id('consent-error') : undefined}
						>
							{FORM_COPY.consent}
						</Checkbox>
						{errors.consent && (
							<p className='footerForm__error' id={id('consent-error')}>
								{errors.consent}
							</p>
						)}
						{PRIVACY_POLICY_URL && (
							<a className='footerForm__policy' href={PRIVACY_POLICY_URL} target='_blank' rel='noopener noreferrer'>
								{FORM_COPY.policy}
							</a>
						)}
						{FORM_TEST_MODE && <p className='footerForm__test'>{FORM_COPY.testMode}</p>}
						{status === 'error' && (
							<p className='footerForm__error' role='alert'>
								{FORM_COPY.error}
							</p>
						)}
					</div>
				)}
				<Button type='submit' className='footerForm__submit' disabled={status === 'sending' || status === 'sent'}>
					{BUTTON_LABEL[status]}
				</Button>
			</div>

			<p className='footerForm__direct'>
				{FORM_COPY.reply} {FORM_COPY.direct}
				{' '}
				<a href={CONTACT_LINKS.telegram} target='_blank' rel='noopener noreferrer'>
					Telegram
				</a>
				.
			</p>
		</form>
	)
}
