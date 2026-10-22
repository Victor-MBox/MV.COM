import { useId } from 'react'
import type { FormEvent } from 'react'
import { CONTACT_LINKS } from '../../data/contacts'
import { FORM_COPY, FORM_TEST_MODE, LEAD_FIELDS } from '../../data/leadForm'
import { useLeadForm } from '../leadForm/useLeadForm'
import type { LeadStatus } from '../leadForm/useLeadForm'
import { useFormVisible } from '../leadForm/useDeliveryReady'
import Button from '../button/Button'
import Checkbox from '../checkbox/Checkbox'
import FormFallback from '../leadForm/FormFallback'
import TrapField from '../leadForm/TrapField'
import { ConsentLabel, PolicyLine, TopicLine } from '../leadForm/ConsentNote'

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
 * разделителях, внизу согласие чекбоксом (ссылка на документ согласия, под ним строка про политику) и кнопка, под ними —
 * срок ответа и Telegram. Состояние, проверка и отправка — useLeadForm (formId 'footer'), общий с LeadForm. После
 * отправки поля очищаются, вместо чекбокса — строка успеха с номером заявки; первая же правка возвращает форму
 * в исходное состояние. Пока сервер не настроен (health), в публичной сборке — FormFallback
 */
export default function FooterForm(props: Props) {
	const visible = useFormVisible()
	return visible ? <FooterFormFields {...props} /> : <FormFallback className='footerForm__fallback' />
}

function FooterFormFields({ topic }: Props) {
	const uid = useId()
	const id = (key: string) => `${uid}-${key}`
	const { values, consent, trap, errors, status, requestId, setField, setConsent, setTrap, submit } = useLeadForm(topic, 'footer')

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		const firstInvalid = await submit()
		if (firstInvalid) document.getElementById(id(firstInvalid))?.focus()
	}

	return (
		<form className='footerForm' onSubmit={handleSubmit} noValidate aria-label={FORM_COPY.title}>
			<TopicLine topic={topic} className='footerForm__topic' />
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
			<TrapField id={id('website')} value={trap} onChange={setTrap} />

			<div className='footerForm__foot'>
				{status === 'sent' ? (
					<p className='footerForm__status' role='status'>
						<span className='footerForm__ok' aria-hidden='true' />
						<span>
							{FORM_COPY.success}
							{requestId && (
								<span className='footerForm__requestId'>
									{FORM_COPY.requestId}: {requestId}
								</span>
							)}
						</span>
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
							<ConsentLabel />
						</Checkbox>
						{errors.consent && (
							<p className='footerForm__error' id={id('consent-error')} role='alert'>
								{errors.consent}
							</p>
						)}
						<PolicyLine className='footerForm__policy' />
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
				{' '}
				<a href={CONTACT_LINKS.telegram} target='_blank' rel='noopener noreferrer'>
					Telegram
				</a>
				.
			</p>
		</form>
	)
}
