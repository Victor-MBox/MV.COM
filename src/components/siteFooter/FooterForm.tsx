import { useId, useState } from 'react'
import type { FormEvent } from 'react'
import { submitContact } from '../../api/contact'
import { FOOTER } from '../../data/home'
import { FORM_COPY } from '../../data/leadForm'
import { validateContact } from '../leadForm/validate'
import type { ContactErrors } from '../leadForm/validate'
import Button from '../button/Button'
import Checkbox from '../checkbox/Checkbox'

type FieldKey = (typeof FOOTER.fields)[number]['key']
type Status = 'idle' | 'sending' | 'sent' | 'error'

type Props = {
	/** Тема заявки: название оффера на его странице, иначе пусто */
	topic: string
}

const EMPTY: Record<FieldKey, string> = { name: '', contact: '', message: '' }
const BUTTON_LABEL: Record<Status, string> = { idle: 'Отправить', error: 'Отправить', sending: 'Отправляю…', sent: 'Отправлено' }

/**
 * Форма футера (макет «Футер - форма»): три поля-строки «номер · подпись · поле» на разделителях, внизу согласие
 * чекбоксом и кнопка. Правила — общие с LeadForm (validate.ts), отправка — submitContact. После отправки поля очищаются,
 * вместо чекбокса — строка успеха; первая же правка возвращает форму в исходное состояние
 */
export default function FooterForm({ topic }: Props) {
	const uid = useId()
	const [values, setValues] = useState(EMPTY)
	const [consent, setConsent] = useState(false)
	const [errors, setErrors] = useState<ContactErrors>({})
	const [status, setStatus] = useState<Status>('idle')
	const fieldId = (key: string) => `${uid}-${key}`

	// Правка поля снимает его ошибку и выводит форму из «успеха» или «ошибки отправки»
	const touch = (key: keyof ContactErrors) => {
		setErrors(prev => {
			if (!(key in prev)) return prev
			const next = { ...prev }
			delete next[key]
			return next
		})
		if (status === 'sent' || status === 'error') setStatus('idle')
	}

	const update = (key: FieldKey, value: string) => {
		setValues(v => ({ ...v, [key]: value }))
		touch(key)
	}

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault()
		const next = validateContact({ ...values, consent })
		setErrors(next)
		const firstInvalid = [...FOOTER.fields.map(f => f.key), 'consent'].find(key => key in next)
		if (firstInvalid) {
			document.getElementById(fieldId(firstInvalid))?.focus()
			return
		}
		setStatus('sending')
		try {
			await submitContact({
				name: values.name.trim(),
				contact: values.contact.trim(),
				topic,
				message: values.message.trim(),
			})
			setValues(EMPTY)
			setConsent(false)
			setStatus('sent')
		} catch {
			setStatus('error')
		}
	}

	return (
		<form className='footerForm' onSubmit={handleSubmit} noValidate aria-label='Заявка'>
			{FOOTER.fields.map((f, i) => {
				const error = errors[f.key]
				return (
					<div key={f.key} className={`footerForm__row${error ? ' is-invalid' : ''}`}>
						<label className='footerForm__field'>
							<span className='footerForm__num' aria-hidden='true'>
								{String(i + 1).padStart(2, '0')}
							</span>
							<span className='footerForm__label'>{f.label}</span>
							<input
								id={fieldId(f.key)}
								className='footerForm__input'
								type='text'
								name={f.key}
								autoComplete={f.autoComplete}
								placeholder={f.placeholder}
								value={values[f.key]}
								onChange={e => update(f.key, e.target.value)}
								aria-invalid={!!error}
								aria-describedby={error ? fieldId(`${f.key}-error`) : undefined}
							/>
						</label>
						{error && (
							<p className='footerForm__error' id={fieldId(`${f.key}-error`)}>
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
						{FOOTER.success}
					</p>
				) : (
					<div className='footerForm__consent'>
						<Checkbox
							id={fieldId('consent')}
							className='footerForm__check'
							checked={consent}
							onChange={checked => {
								setConsent(checked)
								touch('consent')
							}}
							invalid={!!errors.consent}
							describedBy={errors.consent ? fieldId('consent-error') : undefined}
						>
							{FORM_COPY.consent}
						</Checkbox>
						{errors.consent && (
							<p className='footerForm__error' id={fieldId('consent-error')}>
								{errors.consent}
							</p>
						)}
						{status === 'error' && (
							<p className='footerForm__error' role='alert'>
								Не удалось отправить. Попробуйте ещё раз или напишите в Telegram.
							</p>
						)}
					</div>
				)}
				<Button type='submit' className='footerForm__submit' disabled={status === 'sending' || status === 'sent'}>
					{BUTTON_LABEL[status]}
				</Button>
			</div>
		</form>
	)
}
