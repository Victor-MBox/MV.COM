import { useState } from 'react'
import { submitContact } from '../../api/contact'
import type { LeadFieldKey, LeadFormId } from '../../data/leadForm'
import { CONSENT_VERSION } from '../../data/leadForm'
import { validateContact } from './validate'
import type { ContactErrors } from './validate'

export type LeadStatus = 'idle' | 'sending' | 'sent' | 'error'

const EMPTY: Record<LeadFieldKey, string> = { name: '', contact: '', message: '' }
/** Порядок проверки — порядок полей на экране, согласие последним */
const ORDER = ['contact', 'message', 'consent'] as const

/** Ключ одной отправки (ContactPayload.submissionId); crypto.randomUUID есть в браузерах и Node, запас — на всякий случай */
function newSubmissionId() {
	if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
	return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * Состояние, проверка и отправка формы первого обращения — общие для LeadForm (модалка, /contacts) и формы футера.
 * Правка поля снимает его ошибку и выводит форму из «отправлено» / «ошибка отправки». Успех ставится только после
 * того, как submitContact вернул номер заявки. `trap` — скрытое поле-ловушка для ботов (TrapField), уходит
 * в ContactPayload.website и не проверяется. Один submissionId живёт до успеха: повтор после ошибки сети сервер
 * узнаёт и не создаёт вторую заявку; после успеха ключ новый
 */
export function useLeadForm(topic: string, formId: LeadFormId) {
	const [values, setValues] = useState(EMPTY)
	const [consent, setConsentValue] = useState(false)
	const [trap, setTrap] = useState('')
	const [errors, setErrors] = useState<ContactErrors>({})
	const [status, setStatus] = useState<LeadStatus>('idle')
	const [requestId, setRequestId] = useState('')
	const [submissionId, setSubmissionId] = useState(newSubmissionId)

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
		if (!consent) return 'consent' // сюда не попадаем — validateContact уже вернул ошибку; защита типа для payload
		setStatus('sending')
		try {
			const result = await submitContact({
				name: values.name.trim(),
				contact: values.contact.trim(),
				message: values.message.trim(),
				topic,
				consent: true,
				consentVersion: CONSENT_VERSION,
				formId,
				submissionId,
				website: trap,
			})
			setRequestId(result.requestId)
			setValues(EMPTY)
			setConsentValue(false)
			setTrap('')
			setSubmissionId(newSubmissionId())
			setStatus('sent')
		} catch {
			setStatus('error')
		}
		return null
	}

	return { values, consent, trap, errors, status, requestId, setField, setConsent, setTrap, submit }
}
