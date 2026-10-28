import { Svg } from './base'

/** Переключатель формата со страницы /parties: «Объявления» и «Пати и ивенты» */
export function PartyIntro({ tab, compact }: { tab: 'lfg' | 'parties'; compact?: boolean }) {
	return (
		<section className={`party-intro party-intro--parties${compact ? ' nr-ui__intro--compact' : ''}`}>
			<div className='party-intro__content'>
				<p className='party-intro__eyebrow'>Как хочешь найти игроков?</p>
				<nav className='party-intro__format-switch'>
					<span className={`party-intro__format-option party-intro__format-option--lfg${tab === 'lfg' ? ' is-active' : ''}`}>
						<Svg name='introLfg' className='party-intro__format-icon party-intro__format-icon--solid' />
						<span className='party-intro__format-copy'>
							<strong>Объявления</strong>
							<small>Быстрый LFG без комнаты</small>
						</span>
					</span>
					<span className={`party-intro__format-option party-intro__format-option--parties${tab === 'parties' ? ' is-active' : ''}`}>
						<Svg name='introParties' className='party-intro__format-icon' />
						<span className='party-intro__format-copy'>
							<strong>Пати и ивенты</strong>
							<small>Комната с чатом и Voice</small>
						</span>
					</span>
				</nav>
				{!compact && (
					<>
						<div className='party-intro__wrapper'>
							{tab === 'parties' ? (
								<h1 className='party-intro__title'>
									Создай комнату и <span>собери идеальную пати</span> под свою игру
								</h1>
							) : (
								<h1 className='party-intro__title'>
									Напиши объявление и <span>найди напарников</span> за минуту
								</h1>
							)}
						</div>
						<ul className='party-intro__benefits'>
							<li>
								<Svg name='benefitMembers' className='party-intro__benefit-icon' />
								<span>Участники и заявки</span>
							</li>
							<li>
								<Svg name='benefitChat' className='party-intro__benefit-icon' />
								<span>Текстовый чат</span>
							</li>
							<li>
								<Svg name='benefitVoice' className='party-intro__benefit-icon' />
								<span>Voice</span>
							</li>
							<li>
								<Svg name='benefitCalendar' className='party-intro__benefit-icon' />
								<span>Можно запланировать</span>
							</li>
						</ul>
					</>
				)}
			</div>
		</section>
	)
}

/** Счётчики «Созданных: объявлений / пати / ивент» */
export function CreatedSwitch({ tab, lfg = 13, parties = 105, events = 0 }: { tab: 'lfg' | 'parties'; lfg?: number; parties?: number; events?: number }) {
	return (
		<nav className='parties-created-switch'>
			<span className='parties-created-switch__lead'>Созданных</span>
			<span className={`parties-created-switch__option parties-created-switch__option--lfg${tab === 'lfg' ? ' is-active' : ''}`}>
				<span>объявлений</span>
				<strong>{lfg}</strong>
			</span>
			<span className={`parties-created-switch__option parties-created-switch__option--parties${tab === 'parties' ? ' is-active' : ''}`}>
				<span>пати</span>
				<strong>{parties}</strong>
			</span>
			<span className='parties-created-switch__option parties-created-switch__option--event'>
				<span>ивент</span>
				<strong>{events}</strong>
			</span>
		</nav>
	)
}

export type FormField = { label: string; value?: string; wide?: boolean }

/** Форма создания пати: комбо-поля продукта (`parties-filter__combo` с `has-value`) и описание */
export function PartyForm({ fields, description, submitted }: { fields: FormField[]; description?: string; submitted?: boolean }) {
	return (
		<div className='game-parties__form party-form__wrapper nr-ui__form'>
			<div className='party-form__row'>
				{fields.map(f => (
					<div className={`form-row party-form__field${f.wide ? ' nr-ui__field--wide' : ''}`} key={f.label}>
						<div className={`parties-filter__combo parties-filter__combo--always-chevron${f.value ? ' has-value' : ''}`}>
							<div className='parties-filter__combo-input'>
								<span className='parties-filter__combo-field parties-filter__combo-field--display'>{f.value ?? f.label}</span>
								{f.value && <span className='parties-filter__clear'>×</span>}
								<span className='parties-filter__chevron' />
							</div>
						</div>
					</div>
				))}
			</div>
			<div className='form-row party-form__field nr-ui__field--wide'>
				<span className={`parties-filter__combo-field nr-ui__textarea${description ? ' has-value' : ''}`}>{description ?? 'Описание: кого ищете, правила, что будет'}</span>
			</div>
			<div className='party-form__hr' />
			<span className={`main-btn main-btn_green-accent party-intro__primary-action${submitted ? ' is-pressed' : ''}`}>
				<span>Создать пати</span>
			</span>
		</div>
	)
}
