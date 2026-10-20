/** Данные формы заявки LeadForm (docs/design-spec.md §6.13): намерения, форматы вакансии, тексты */

export type IntentKey = 'project' | 'job' | 'question'

// TODO (владелец): подписи намерений в форме (§6.13)
export const INTENTS: { key: IntentKey; label: string }[] = [
	{ key: 'project', label: 'Проект' },
	{ key: 'job', label: 'Вакансия или контракт' },
	{ key: 'question', label: 'Вопрос' },
]

/** Формат работы для намерения «Вакансия» (§6.13); уходит в ContactPayload.topic как «Вакансия: контракт» */
export const JOB_FORMATS = ['проектно', 'контракт', 'удалённо в штат']

// TODO (владелец): тексты формы (§6.13)
export const FORM_COPY = {
	lead: 'Отвечу в течение двух рабочих дней',
	success: 'Заявка ушла. Отвечу в течение двух рабочих дней.',
	/** «Что будет дальше» под кнопкой — три строки моно */
	next: ['отвечу за 2 рабочих дня', 'созвон 30 минут', 'смета и срок'],
}
