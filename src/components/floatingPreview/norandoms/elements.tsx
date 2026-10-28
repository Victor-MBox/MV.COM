import { Svg } from '../../caseInside/product/base'
import { IMG } from '../../caseInside/product/assets'

/**
 * Элементы интерфейса NoRandoms для обложки кейса — разметка и классы сняты с живого norandoms.team 28.10.2026
 * (главная: логотип сайдбара, кнопки и преимущества первого экрана, карточка игры; /teammates: анкета игрока).
 * Стили — nr-cover.css (`node scripts/nr-product-css.mjs --cover`), иконки и картинки — общие с «кейсом изнутри».
 * Отличия от продукта только там, где нужен валидный HTML внутри ссылки-карточки: `<a>` и `<button>` → `<span>`,
 * `<h3>` анкеты → `<span class="display-font">` (тот же шрифт заголовков продукта), списки и article → `<div>`
 */

/** Логотип сайдбара: маскот + «NoRandoms» («No» белым, «Randoms» зелёным) */
export function NrLogo() {
	return (
		<span className='app-sidebar__logo'>
			<img src={IMG.logo} alt='' />
			<span className='app-sidebar__logo-text'>
				<span>No</span>Randoms
			</span>
		</span>
	)
}

/** Кнопки первого экрана: жёлтая «Сбор пати» с зелёными квадратами по углам и белая «Анкеты игроков» */
export function NrHeroActions() {
	return (
		<div className='hero-intro__actions'>
			<span className='main-btn main-btn_orange'>
				<span>Сбор пати</span>
			</span>
			<span className='main-btn main-btn_white'>
				<span>Анкеты игроков</span>
			</span>
		</div>
	)
}

/** Пункт полосы преимуществ первого экрана: «Встроенный голосовой чат — не нужен Discord» */
export function NrVoiceBenefit() {
	return (
		<div className='hero-benefits'>
			<div className='hero-benefits__item'>
				<span className='hero-benefits__icon'>
					<svg viewBox='0 0 24 24'>
						<rect x='9' y='3' width='6' height='12' rx='3' />
						<path d='M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M8.5 21h7' />
					</svg>
				</span>
				<span className='hero-benefits__copy'>
					<strong>Встроенный голосовой чат</strong>
					<span>не нужен Discord</span>
				</span>
			</div>
		</div>
	)
}

/** Карточка игры из ленты «Во что играют сейчас» — значения как на главной продукта 28.10.2026 */
export function NrGameCard() {
	return (
		<span className='home-game-card'>
			<span className='home-game-card__cover'>
				<img src={IMG.covers.cs2} alt='' draggable={false} />
			</span>
			<span className='home-game-card__body'>
				<span className='home-game-card__title'>Counter-Strike 2</span>
				<span className='home-game-card__stats'>
					<span className='home-game-card__stat home-game-card__stat--preference'>
						<span className='home-game-card__stat-main'>
							<Svg name='statUser' className='home-game-card__stat-icon' />
							<span className='home-game-card__stat-value'>824</span>
						</span>
						<span className='home-game-card__stat-label'>ищут пати</span>
					</span>
					<span className='home-game-card__stat home-game-card__stat--steam'>
						<span className='home-game-card__stat-main'>
							<Svg name='statSteam' className='home-game-card__stat-icon' />
							<span className='home-game-card__stat-value'>1.4K</span>
						</span>
						<span className='home-game-card__stat-label'>игроков в Steam</span>
					</span>
					<span className='home-game-card__stat home-game-card__stat--party'>
						<span className='home-game-card__stat-main'>
							<Svg name='statParty' className='home-game-card__stat-icon' />
							<span className='home-game-card__stat-value'>2</span>
						</span>
						<span className='home-game-card__stat-label'>активных пати</span>
					</span>
				</span>
			</span>
		</span>
	)
}

/**
 * Анкета игрока со страницы /teammates в состоянии «в игре» (`is-steam-in-game` ставит скрипт продукта): зелёная полоса
 * Steam, в сети, устройства — чипы `chip chip--active`. Игрок тот же, что в сценах «кейса изнутри», аватар — стандартный
 */
export function NrPlayerCard() {
	return (
		<div className='tm-card is-steam-in-game'>
			<div className='tm-card__strip'>
				<div className='tm-card__strip-steam'>
					<span className='tm-card__steam is-linked'>
						<img src={IMG.steamLogo} alt='' />
					</span>
					<span className='steam-presence steam-presence--in-game'>
						<img className='steam-presence__icon' src={IMG.steamLogo} alt='' width={14} height={14} />
						<span className='steam-presence__live'>
							<i />
							<i />
							<i />
						</span>
						<span className='steam-presence__label'>
							<span className='steam-presence__label-track'>В игре: Counter-Strike 2</span>
						</span>
					</span>
					<span className='tm-card__steam-note'>Steam привязан</span>
				</div>
				<div className='tm-card__strip-site'>
					<span className='tm-card__status-dot tm-card__status-dot--online is-pulsing' />
					<span className='tm-card__last-seen'>В сети</span>
				</div>
				<span className='user-hover-info-button tm-card__expand'>
					<Svg name='expand' />
				</span>
			</div>
			<div className='tm-card__wrapper'>
				<div className='tm-card__header'>
					<div className='tm-card__user'>
						<span className='tm-card__avatar-link'>
							<span className='tm-card__avatar tm-card__avatar--male'>
								<img src={IMG.avatarM} alt='' />
							</span>
						</span>
						<div className='tm-card__identity'>
							<span className='tm-card__title display-font'>
								<span className='tm-card__title-link'>Vasilevs</span>
							</span>
							<span className='tm-card__status tm-card__status--party'>Активно ищу пати</span>
						</div>
					</div>
				</div>
				<p className='tm-card__about'>CS2 по вечерам, ап ранга, микрофон обязателен. Без токсичности.</p>
				<div className='tm-card__chips'>
					<span className='chip chip--active'>ПК</span>
					<span className='chip chip--active'>Геймпад</span>
				</div>
			</div>
			<div className='tm-card__footer'>
				<div className='tm-card__actions tm-card__actions--icons'>
					<span className='tm-card__action'>
						<Svg name='friendAdd' />
					</span>
					<span className='tm-card__action'>
						<Svg name='message' />
					</span>
					<span className='tm-card__action'>
						<Svg name='profile' />
					</span>
					<span className='tm-card__action'>
						<Svg name='compat' />
					</span>
				</div>
			</div>
		</div>
	)
}
