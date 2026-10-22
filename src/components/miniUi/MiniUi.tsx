import type { CSSProperties } from 'react'
import type { MiniUiVariant } from './variants'
import './MiniUi.scss'

type Props = {
	variant: MiniUiVariant
	/** Анимация по кругу без ховера — шапка страницы оффера */
	loop?: boolean
	className?: string
}

const n = (i: number) => ({ '--n': i }) as CSSProperties

/** Высоты столбцов диаграммы аналитики в процентах; последний — самый высокий, он же акцент */
const CHART = [40, 65, 50, 80, 60, 100]

/**
 * Мини-интерфейс услуги из HTML-элементов (docs/design-spec.md §6.8): подложка --box-deep, «текст» полосами,
 * ровно один элемент залит акцентом. Двенадцать композиций — по одной на оффер (пять новых от 22.10.2026: телефон,
 * квиз, поисковая выдача, объявление, диаграмма событий). Микроанимации запускает ховер родительской карточки (.box:hover)
 * или любого контейнера с классом .miniUiHost (карточки /services); с `loop` — бесконечный сценарий без ховера.
 * `--n` — индекс элемента для задержек по очереди.
 */
export default function MiniUi({ variant, loop, className }: Props) {
	const cn = ['miniUi', `miniUi--${variant}`, loop ? 'miniUi--loop' : '', className ?? ''].filter(Boolean).join(' ')

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
						<div className='miniUi__row' key={i} style={n(i)}>
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
						{/* Цена товара — полосой, без цифр: число на карточке услуги читалось бы как стоимость разработки */}
						<i className='miniUi__price' />
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
						<i key={i} className={`miniUi__navItem${i === 0 ? ' is-accent' : ''}`} style={n(i)} />
					))}
				</div>
				<div className='miniUi__cards'>
					{[0, 1, 2].map(i => (
						<div className='miniUi__card' key={i} style={n(i)}>
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
					<div className='miniUi__task' key={i} style={n(i)}>
						<i className={`miniUi__bar${i === 1 ? ' miniUi__bar--mid' : ''}`} />
						<b className={`miniUi__state${i === 0 ? ' is-accent' : ''}`} />
					</div>
				))}
			</div>
		)
	}

	// --- новые услуги (ТЗ от 22.10.2026): простые композиции в том же стиле, по одному акценту ---
	// Телефон: под экраном приложения — «рабочий стол» с иконками; в сцене нажимается акцентная иконка и приложение
	// открывается поверх (правка владельца от 22.10.2026). Исходная композиция — открытое приложение
	if (variant === 'mobile-apps') {
		return (
			<div className={cn} aria-hidden='true'>
				<div className='miniUi__phone'>
					<i className='miniUi__phoneNotch' />
					<div className='miniUi__screen'>
						<div className='miniUi__home'>
							{[0, 1, 2, 3, 4, 5].map(i => (
								<b key={i} className={`miniUi__appIcon${i === 0 ? ' is-accent' : ''}`} style={n(i)} />
							))}
						</div>
						<div className='miniUi__app'>
							<div className='miniUi__appBar'>
								<i className='miniUi__bar miniUi__bar--short' />
							</div>
							<div className='miniUi__phoneList'>
								{[0, 1, 2].map(i => (
									<div className='miniUi__phoneRow' key={i} style={n(i)}>
										<i className='miniUi__bar' />
										<i className='miniUi__bar miniUi__bar--short' />
									</div>
								))}
							</div>
							<div className='miniUi__tabs'>
								{[0, 1, 2].map(i => (
									<b key={i} className={`miniUi__tab${i === 0 ? ' is-accent' : ''}`} style={n(i)} />
								))}
							</div>
						</div>
					</div>
					<i className='miniUi__phoneHome' />
				</div>
			</div>
		)
	}

	if (variant === 'interactive') {
		return (
			<div className={cn} aria-hidden='true'>
				<div className='miniUi__quiz'>
					<i className='miniUi__progress'>
						<b className='miniUi__progressFill' />
					</i>
					<i className='miniUi__bar miniUi__bar--mid' />
					<div className='miniUi__options'>
						{[0, 1, 2].map(i => (
							<div className={`miniUi__option${i === 1 ? ' is-accent' : ''}`} key={i} style={n(i)}>
								<b className='miniUi__radio' />
								<i className={`miniUi__bar${i === 2 ? ' miniUi__bar--short' : ' miniUi__bar--mid'}`} />
							</div>
						))}
					</div>
				</div>
			</div>
		)
	}

	if (variant === 'seo') {
		return (
			<div className={cn} aria-hidden='true'>
				<div className='miniUi__search'>
					<i className='miniUi__lens' />
					<i className='miniUi__bar miniUi__bar--mid' />
				</div>
				<div className='miniUi__results'>
					{[0, 1, 2].map(i => (
						<div className='miniUi__result' key={i} style={n(i)}>
							<b className={`miniUi__rank${i === 0 ? ' is-accent' : ''}`}>{i + 1}</b>
							<div className='miniUi__resultText'>
								<i className='miniUi__bar miniUi__bar--mid' />
								<i className='miniUi__bar miniUi__bar--short' />
							</div>
						</div>
					))}
				</div>
			</div>
		)
	}

	if (variant === 'context') {
		return (
			<div className={cn} aria-hidden='true'>
				<div className='miniUi__ad'>
					<span className='miniUi__adLabel'>Реклама</span>
					<i className='miniUi__bar' />
					<i className='miniUi__bar miniUi__bar--mid' />
					<span className='miniUi__buy'>
						<b className='miniUi__button'>Перейти</b>
						<span className='miniUi__plus'>+1</span>
					</span>
				</div>
			</div>
		)
	}

	if (variant === 'analytics') {
		return (
			<div className={cn} aria-hidden='true'>
				<div className='miniUi__chart'>
					{CHART.map((h, i) => (
						<b
							key={i}
							className={`miniUi__chartBar${i === CHART.length - 1 ? ' is-accent' : ''}`}
							style={{ '--n': i, '--h': `${h}%` } as CSSProperties}
						/>
					))}
				</div>
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
			<span className='miniUi__node' style={n(0)}>
				Форма
			</span>
			<i className='miniUi__link' />
			<span className='miniUi__node' style={n(1)}>
				CRM
			</span>
			<i className='miniUi__link' />
			<span className='miniUi__node' style={n(2)}>
				Telegram
			</span>
		</div>
	)
}
