import { useState } from 'react'
import { submitContact } from '../../api/contact'
import type { LeadFieldKey } from '../../data/leadForm'
import { validateContact } from './validate'
import type { ContactErrors } from './validate'

export type LeadStatus = 'idle' | 'sending' | 'sent' | 'error'

const EMPTY: Record<LeadFieldKey, string> = { name: '', contact: '', message: '' }
/** Порядок проверки — порядок полей на экране, согласие последним */
const ORDER = ['contact', 'message', 'consent'] as const

/**
 * Состояние, проверка и отправка формы первого обращения — общие для LeadForm (модалка, /contacts) и формы футера.
 * Правка поля снимает его ошибку и выводит форму из «отправлено» / «ошибка отправки». Успех ставится только после
 * того, как submitContact не бросил исключение. `trap` — скрытое поле-ловушка для ботов (TrapField), уходит
 * в ContactPayload.website и не проверяется
 */
export function useLeadForm(topic: string) {
	const [values, setValues] = useState(EMPTY)
	const [consent, setConsentValue] = useState(false)
	const [trap, setTrap] = useState('')
	const [errors, setErrors] = useState<ContactErrors>({})
	const [status, setStatus] = useState<LeadStatus>('idle')

	const touch = (key: LeadFieldKey | 'consent') => {
		setErrors(prev => {
			if (!(key in prev)) return prev
			const next = { ...prev }
			delete next[key as keyof ContactErrors]
			return next
		})
		setStatus(s => (s === 'sent' || s === 'error' ? 'idle' : s))
	}

	const setField = (key: LeadFieldKey, value: string) => {
		setValues(v => ({ ...v, [key]: value }))
		touch(key)
	}

	const setConsent = (checked: boolean) => {
		setConsentValue(checked)
		touch('consent')
	}

	/** Проверяет и отправляет; при ошибках проверки сразу возвращает первое поле с ошибкой (для фокуса), иначе null */
	const submit = async (): Promise<keyof ContactErrors | null> => {
		const next = validateContact({ ...values, consent })
		setErrors(next)
		const firstInvalid = ORDER.find(key => key in next)
		if (firstInvalid) return firstInvalid
		setStatus('sending')
		try {
			await submitContact({
				name: values.name.trim(),
				contact: values.contact.trim(),
				message: values.message.trim(),
				topic,
				website: trap,
			})
			setValues(EMPTY)
			setConsentValue(false)
			setTrap('')
			setStatus('sent')
		} catch {
			setStatus('error')
		}
		return null
	}

	return { values, consent, trap, errors, status, setField, setConsent, setTrap, submit }
}
