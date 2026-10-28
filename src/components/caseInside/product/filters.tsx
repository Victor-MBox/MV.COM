import { Svg } from './base'

import { FILTERS } from './filterList'
import type { FilterKey } from './filterList'

type Props = {
	/** Выбранные значения по ключам */
	values: Partial<Record<FilterKey, string>>
	/** Панель фильтров раскрыта */
	open: boolean
	game?: string
}

/** Панель фильтров анкет: строка с игрой, поиском и кнопкой; раскрывающаяся форма с комбо-полями, как на /teammates */
export function FilterBar({ values, open, game }: Props) {
	const active = Object.keys(values).length
	return (
		<section className='parties-filter parties-filter_teammates' id='tm-filter-bar'>
			<div className='parties-filter__row'>
				<div className='form-row parties-filter__game'>
					<div className='parties-filter__total'>Пользователи</div>
					<div className={`parties-filter__combo tm-filter-chip${game ? ' has-value' : ''}`}>
						<div className='parties-filter__combo-input'>
							<span className='parties-filter__combo-field parties-filter__combo-field--display' />
							<span className='parties-filter__combo-value'>{game ?? 'Выбрать игру'}</span>
							{game && <span className='parties-filter__clear'>×</span>}
							<span className='parties-filter__chevron' />
						</div>
					</div>
					<span className='parties-filter__user-search'>
						<span className='parties-filter__user-search-icon'>
							<Svg name='search' />
						</span>
						<span className='parties-filter__user-search-input nr-ui__placeholder'>Поиск по имени</span>
					</span>
				</div>
				<div className='parties-filter__toolbar'>
					<span className={`parties-filter__toggle${open ? ' is-active' : ''}`}>
						<span className='parties-filter__toggle-icon'>
							<Svg name='filterToggle' />
						</span>
						{active > 0 && <span className='parties-filter__count'>{active}</span>}
					</span>
				</div>
			</div>
			{open && (
				<div className='parties-filter__form'>
					{FILTERS.map(f => {
						const v = values[f.key]
						return (
							<div className='form-row' key={f.key}>
								<div className={`parties-filter__combo tm-filter-chip${v ? ' has-value' : ''}`}>
									<div className='parties-filter__combo-input'>
										<span className='parties-filter__combo-field parties-filter__combo-field--display' />
										<span className='parties-filter__combo-value'>{v ?? f.label}</span>
										{v && <span className='parties-filter__clear'>×</span>}
										<span className='parties-filter__chevron' />
									</div>
								</div>
							</div>
						)
					})}
					<div className='form-row parties-filter__checkbox-row'>
						<span className='parties-filter__show-empty'>
							<input type='checkbox' readOnly tabIndex={-1} />
							<span>Показывать со статусом «Не беспокоить»</span>
						</span>
					</div>
					<span className='parties-filter__reset-all'>
						<span>×</span>Сбросить все
					</span>
				</div>
			)}
		</section>
	)
}
