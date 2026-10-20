import './MiniUi.scss'

/** Три варианта 1.0 (§6.8) плюс четыре для витрины /home4 (docs/design-spec-home4.md §5.3) — ключи офферов */
export type MiniUiVariant = 'web-service' | 'ecommerce' | 'integrations' | 'landing' | 'corporate' | 'support' | 'agencies'

type Props = {
	variant: MiniUiVariant
	className?: string
}

/**
 * Мини-интерфейс услуги из HTML-элементов (docs/design-spec.md §6.8): подложка --box-deep, «текст» полосами,
 * ровно один элемент залит акцентом. Микроанимации запускает ховер родительской карточки (.box:hover)
 * или любого контейнера с классом .miniUiHost (витрина услуг главной).
 */
export default function MiniUi({ variant, className }: Props) {
	const cn = ['miniUi', `miniUi--${variant}`, className ?? ''].filter(Boolean).join(' ')

	if (variant === 'web-service') {
		return (
			<div className={cn} aria-hidden='true'>
				<div className='miniUi__side'>
					<i className='miniUi__bar miniUi__bar--short' />
					<i className='miniUi__bar miniUi__bar--short' />
					<i className='miniUi__bar miniUi__bar--short' />
					<i className='miniUi__bar miniUi__bar--short' />
				</div>
				<div className='miniUi__table'>
					{[0, 1, 2].map(i => (
						<div className='miniUi__row' key={i} style={{ '--n': i } as React.CSSProperties}>
							<i className='miniUi__bar' />
							<i className='miniUi__bar miniUi__bar--short' />
							<b className={`miniUi__status${i === 0 ? ' is-accent' : ''}`} />
						</div>
					))}
				</div>
			</div>
		)
	}

	if (variant === 'ecommerce') {
		return (
			<div className={cn} aria-hidden='true'>
				<div className='miniUi__product'>
					<i className='miniUi__photo' />
					<div className='miniUi__info'>
						<i className='miniUi__bar' />
						<i className='miniUi__bar miniUi__bar--short' />
						<span className='miniUi__price'>12 900 ₽</span>
						<span className='miniUi__buy'>
							<b className='miniUi__button'>В корзину</b>
							<span className='miniUi__plus'>+1</span>
						</span>
					</div>
				</div>
			</div>
		)
	}

	if (variant === 'landing') {
		return (
			<div className={cn} aria-hidden='true'>
				<div className='miniUi__copy'>
					<i className='miniUi__bar' />
					<i className='miniUi__bar miniUi__bar--mid' />
					<i className='miniUi__bar miniUi__bar--short' />
					<b className='miniUi__cta' />
				</div>
				<div className='miniUi__form'>
					<i className='miniUi__field' />
					<i className='miniUi__field' />
					<b className='miniUi__submit' />
				</div>
			</div>
		)
	}

	if (variant === 'corporate') {
		return (
			<div className={cn} aria-hidden='true'>
				<div className='miniUi__nav'>
					{[0, 1, 2, 3].map(i => (
						<i key={i} className={`miniUi__navItem${i === 0 ? ' is-accent' : ''}`} />
					))}
				</div>
				<div className='miniUi__cards'>
					{[0, 1, 2].map(i => (
						<div className='miniUi__card' key={i} style={{ '--n': i } as React.CSSProperties}>
							<i className='miniUi__thumb' />
							<i className='miniUi__bar' />
							<i className='miniUi__bar miniUi__bar--short' />
						</div>
					))}
				</div>
			</div>
		)
	}

	if (variant === 'support') {
		return (
			<div className={cn} aria-hidden='true'>
				{[0, 1, 2].map(i => (
					<div className='miniUi__task' key={i}>
						<i className={`miniUi__bar${i === 1 ? ' miniUi__bar--mid' : ''}`} />
						<b className={`miniUi__state${i === 0 ? ' is-accent' : ''}`} />
					</div>
				))}
			</div>
		)
	}

	if (variant === 'agencies') {
		return (
			<div className={cn} aria-hidden='true'>
				<div className='miniUi__col'>
					<span className='miniUi__colLabel'>вы</span>
					<i className='miniUi__bar' />
					<i className='miniUi__bar miniUi__bar--short' />
					<i className='miniUi__bar miniUi__bar--mid' />
				</div>
				<span className='miniUi__arrow'>→</span>
				<div className='miniUi__col'>
					<span className='miniUi__colLabel'>я</span>
					<i className='miniUi__bar miniUi__bar--mid' />
					<i className='miniUi__bar' />
					<i className='miniUi__bar miniUi__bar--short' />
				</div>
			</div>
		)
	}

	return (
		<div className={cn} aria-hidden='true'>
			<span className='miniUi__node'>Форма</span>
			<i className='miniUi__link' />
			<span className='miniUi__node'>CRM</span>
			<i className='miniUi__link' />
			<span className='miniUi__node'>Telegram</span>
		</div>
	)
}
