type Props = {
	id: string
	value: string
	onChange: (value: string) => void
}

/**
 * Ловушка для ботов (honeypot) — поле `website` в ContactPayload. Скрыто визуально (.srOnly), от читалок и из порядка
 * табуляции; человек его не заполняет, бот заполняет — и сервер молча отбрасывает такую заявку (server/lib.js,
 * parseLead). Общее для LeadForm и FooterForm, состояние — useLeadForm().trap
 */
export default function TrapField({ id, value, onChange }: Props) {
	return (
		<div className='srOnly' aria-hidden='true'>
			<label htmlFor={id}>Не заполняйте это поле</label>
			<input id={id} name='website' type='text' tabIndex={-1} autoComplete='off' value={value} onChange={e => onChange(e.target.value)} />
		</div>
	)
}
