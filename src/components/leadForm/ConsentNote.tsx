import { CONSENT_URL, FORM_COPY, PRIVACY_URL } from '../../data/leadForm'

/**
 * Текст подписи чекбокса согласия (ТЗ §7): «Даю [согласие на обработку персональных данных] для рассмотрения обращения».
 * Ссылка открывает документ в новой вкладке (введённый текст формы не теряется); клик по ссылке внутри label
 * чекбокс не отмечает — активация label не срабатывает на интерактивных потомках
 */
export function ConsentLabel() {
	return (
		<>
			{FORM_COPY.consent.before}
			<a href={CONSENT_URL} target='_blank' rel='noopener noreferrer'>
				{FORM_COPY.consent.link}
			</a>
			{FORM_COPY.consent.after}
		</>
	)
}

/** Строка под чекбоксом: «Как обрабатываются данные — в [Политике конфиденциальности].» */
export function PolicyLine({ className }: { className: string }) {
	return (
		<p className={className}>
			{FORM_COPY.policy.before}
			<a href={PRIVACY_URL} target='_blank' rel='noopener noreferrer'>
				{FORM_COPY.policy.link}
			</a>
			{FORM_COPY.policy.after}
		</p>
	)
}

/** Строка над полями, когда форма открыта со страницы услуги: «// услуга: Лендинг» */
export function TopicLine({ topic, className }: { topic: string; className: string }) {
	if (!topic) return null
	return (
		<p className={className}>
			<span aria-hidden='true'>//</span> {FORM_COPY.topic}: {topic}
		</p>
	)
}
