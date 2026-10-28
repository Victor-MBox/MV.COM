import type { ReactNode } from 'react'
import { Svg } from './base'
import { IMG, avatarOf } from './assets'
import type { CoverKey, Person } from './assets'
import { HomeGameCard } from './cards'
import platformWin from '../../../resources/norandoms/ui/icon_platform_win.svg'
import platformLinux from '../../../resources/norandoms/ui/icon_platform_linux.svg'

/** Шапка страницы игры `/games/{slug}` — `.game-hero` */
export function GameHero({ title, description, cover, deck, genres }: { title: string; description: string; cover: CoverKey; deck?: boolean; genres: string }) {
	return (
		<section className='game-hero'>
			<div className='bg-mask' />
			<div className='game-hero__inner'>
				<div className='game-hero__info'>
					<div className='game-hero__wrapper'>
						<div className='game-hero__wrapper-inner'>
							<h1 className='game-hero__title'>{title}</h1>
							<p className='game-hero__description'>{description}</p>
							<div className='game-hero__tags game-hero__tags--summary'>
								<span className='chip'>Multiplayer</span>
								{deck && (
									<span className='chip game-hero__deck game-hero__deck--playable'>
										<Svg name='deck' className='game-hero__deck-icon' /> Steam Deck
									</span>
								)}
								<span className='game-hero__platforms game-hero__platforms--summary has-cover'>
									<span className='game-hero__platform'>
										<img src={platformLinux} alt='' />
									</span>
									<span className='game-hero__platform'>
										<img src={platformWin} alt='' />
									</span>
								</span>
							</div>
							<p className='game-hero__meta'>
								<span className='game-hero__tag'>Жанры: {genres}</span>
							</p>
						</div>
						<div className='game-hero__cover is-loaded'>
							<img src={IMG.covers[cover]} alt='' />
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}

/** Вкладки страницы игры: Информация · Игроки · Пати и LFG */
export function ProfileTabs({ active = 0 }: { active?: number }) {
	return (
		<nav className='profile-tabs'>
			{['Информация', 'Игроки', 'Пати и LFG'].map((t, i) => (
				<span className={`profile-tabs__item${i === active ? ' is-active' : ''}`} key={t}>
					{t}
				</span>
			))}
		</nav>
	)
}

/** Промо-карточка «Ищешь тиммейта в …?» со счётчиками-ссылками — `.game-info-panels__promo` */
export function GamePromo({ game, seekers, parties, steam }: { game: string; seekers: ReactNode; parties: ReactNode; steam: ReactNode }) {
	return (
		<article className='player-card game-info-panels__promo'>
			<div className='player-card__header'>
				<h2>
					Ищешь тиммейта в <span className='game-info-panels__promo-game'>{game}</span>?
				</h2>
				<p className='game-info-panels__promo-subtitle'>
					Посмотри игроков, которые <span className='game-info-panels__promo-subtitle-underline'>ищут команду</span>, и найди пати под{' '}
					<span className='game-info-panels__promo-subtitle-underline'>свой прайм и стиль игры</span>.
				</p>
			</div>
			<div className='player-card__content'>
				<ul className='game-info-panels__promo-list'>
					<li>Активные игроки и открытые пати в одном месте</li>
					<li>Можно выбрать по прайму, формату общения и стилю игры</li>
					<li>Репутация и отзывы — меньше токсиков</li>
				</ul>
				<div className='game-info-panels__promo-actions'>
					<span className='chip chip--hero-link chip--hero-link-players'>Ищут тиммейта: {seekers} игроков</span>
					<span className='chip chip--hero-link chip--hero-link-parties'>Пати и объявления: {parties}</span>
					<span className='chip chip--hero-link chip--hero-link-players'>Есть в Steam у {steam} игроков</span>
				</div>
			</div>
		</article>
	)
}

/** Лента игр с главной — `.home-games-marquee` из `.home-game-card` */
export function GameCards({ games }: { games: { title: string; cover: CoverKey; seekers: string; steam: string; parties: string }[] }) {
	return (
		<div className='home-games-marquee__track nr-ui__gameCards'>
			{games.map(g => (
				<span className='home-games-marquee__item' key={g.title}>
					<HomeGameCard {...g} />
				</span>
			))}
		</div>
	)
}

/** Баннер «Уведомления в Telegram — только по делу» с главной */
export function TelegramBanner({ items }: { items: { title: string; text: string }[] }) {
	return (
		<section className='telegram-banner nr-ui__telegram'>
			<h2 className='telegram-banner__title'>
				<span>Уведомления</span> в Telegram — только по делу
			</h2>
			<p className='telegram-banner__sub-title'>
				Заявки, приглашения, изменения в составе и времени пати. <span>Настраивается в один клик.</span>
			</p>
			<div className='telegram-banner__inner'>
				<div className='telegram-banner__content'>
					<ul className='telegram-banner__list'>
						{items.map(it => (
							<li className='telegram-banner-item' key={it.title}>
								<Svg name='tgCheck' className='telegram-banner-item__icon' />
								<div className='telegram-banner-item__body'>
									<p className='telegram-banner-item__title'>{it.title}</p>
									<p className='telegram-banner-item__text'>{it.text}</p>
								</div>
							</li>
						))}
					</ul>
					<span className='main-btn main-btn_green-accent telegram-banner__cta'>
						<span>Подключить Telegram</span>
					</span>
				</div>
			</div>
		</section>
	)
}

export type CompatPref = { label: string; value: string; state: 'ok' | 'warn' | 'bad' }
export type CompatGame = { cover: CoverKey; name: string; his: string; mine: string }

/** Страница «Игровая совместимость» `/teammates/{user}/compatibility` */
export function CompatPage({
	viewer,
	other,
	percent,
	tone,
	label,
	shared,
	recent,
	games,
	prefs,
	prefsPercent,
	traits,
}: {
	viewer: Person
	other: Person
	percent: ReactNode
	tone: 'low' | 'medium' | 'good' | 'high'
	label: string
	shared: number
	recent: number
	games: CompatGame[]
	prefs: CompatPref[]
	prefsPercent: ReactNode
	traits: string[]
}) {
	const avatarClass = (p: Person) => `compat-page__avatar-wrap compat-page__avatar-wrap--${p.gender === 'female' ? 'female' : p.gender === 'male' ? 'male' : 'unknown'}`
	return (
		<section className='compat-page nr-ui__compat'>
			<section className={`compat-page__hero compat-page__hero--${tone}`}>
				<div className='compat-page__hero-title'>ИГРОВАЯ СОВМЕСТИМОСТЬ</div>
				<div className='compat-page__hero-main'>
					<div className='compat-page__user'>
						<div className={avatarClass(viewer)}>
							<img src={avatarOf(viewer)} alt='' />
						</div>
						<div className='compat-page__user-name'>Ты</div>
					</div>
					<div className='compat-page__score'>
						<div className='compat-page__score-value'>{percent}%</div>
						<div className='compat-page__score-label'>{label}</div>
					</div>
					<div className='compat-page__user'>
						<div className={avatarClass(other)}>
							<img src={avatarOf(other)} alt='' />
						</div>
						<div className='compat-page__user-name'>{other.name.toUpperCase()}</div>
					</div>
				</div>
				<div className='compat-page__chips'>
					<span className='compat-page__chip'>Общие игры: {shared}</span>
					<span className='compat-page__chip'>Недавние общие: {recent}</span>
				</div>
			</section>
			<div className='compat-page__layout'>
				<div className='compat-page__wrapper'>
					<section className='compat-box compat-games'>
						<div className='compat-games__head'>
							<h2 className='compat-box__title'>ТОП ОБЩИХ ИГР ({shared})</h2>
							<div className='compat-games__tabs'>
								<span className='compat-games__tab'>За 2 недели</span>
								<span className='compat-games__tab is-active'>Всё время</span>
							</div>
						</div>
						<div className='compat-games__grid is-active'>
							{games.map(g => (
								<article className='compat-game-card' key={g.name}>
									<span className='compat-game-card__cover'>
										<img src={IMG.covers[g.cover]} alt='' />
									</span>
									<div className='compat-game-card__meta'>
										<span className='compat-game-card__pill'>Он: {g.his} ч</span>
										<span className='compat-game-card__hours'>Ты: {g.mine} ч</span>
									</div>
								</article>
							))}
						</div>
					</section>
					<section className='compat-box compat-traits'>
						<h2 className='compat-box__title'>СОВПАВШИЕ БЕЙДЖИ</h2>
						<div className='compat-traits__chips'>
							{traits.map(t => (
								<span className='chip' key={t}>
									{t}
								</span>
							))}
						</div>
					</section>
				</div>
				<aside className='compat-page__side'>
					<section className='compat-box compat-stats'>
						<h2 className='compat-box__title'>СОВПАДЕНИЯ</h2>
						<div className='compat-stats__grid'>
							<article className='compat-stats__item'>
								<div className='compat-stats__label'>Общие игры</div>
								<div className='compat-stats__value'>{shared}</div>
								<div className='compat-stats__hint'>Важнее количество общих игр, а не размер библиотек</div>
							</article>
							<article className='compat-stats__item'>
								<div className='compat-stats__label'>Недавние общие</div>
								<div className='compat-stats__value'>{recent}</div>
								<div className='compat-stats__hint'>Даёт небольшой плюс к общей совместимости</div>
							</article>
							<article className='compat-stats__item'>
								<div className='compat-stats__label'>Фильтры</div>
								<div className='compat-stats__value'>{prefsPercent}%</div>
								<div className='compat-stats__hint'>Совпадения по стилю игры и формату общения</div>
							</article>
							<article className='compat-stats__item'>
								<div className='compat-stats__label'>Общие бейджи</div>
								<div className='compat-stats__value'>{traits.length}</div>
								<div className='compat-stats__hint'>Просто дополнительная информация</div>
							</article>
						</div>
					</section>
					<section className='compat-box compat-preferences'>
						<h2 className='compat-box__title'>ПРЕДПОЧТЕНИЯ</h2>
						<div className='compat-preferences__group'>
							{prefs.map(p => (
								<div className='compat-preferences__row' key={p.label}>
									<span className={`compat-preferences__icon compat-preferences__icon--${p.state}`}>{p.state === 'ok' ? '✓' : p.state === 'warn' ? '!' : '×'}</span>
									<span>
										<strong>{p.label}:</strong> {p.value}
									</span>
								</div>
							))}
						</div>
					</section>
				</aside>
			</div>
		</section>
	)
}

/** Шаг «Steam» онбординга — `.onb-steam` из guest.scss: привязка Steam, выгоды и безопасность */
export function OnbSteam({ linked, syncing }: { linked?: boolean; syncing?: boolean }) {
	return (
		<section className={`onb-steam${linked ? ' is-linked' : ''}`}>
			<span className='onb-steam__glow' />
			<div className='onb-steam__header'>
				<span className='onb-steam__badge'>
					<img className='onb-steam__logo' src={IMG.steamLogo} alt='' width={40} height={40} />
				</span>
				<h2 className='onb-steam__title'>{linked ? 'Steam привязан — библиотека уже подтягивается' : 'Steam уже знает, во что вы играете'}</h2>
			</div>
			<div className='onb-steam__pitch'>
				<p className='onb-steam__text'>Одна авторизация — и вместо пустой анкеты у вас вся библиотека, часы по каждой игре и совместимость с любым тиммейтом.</p>
				<ul className='onb-steam__benefits'>
					{['Игры и часы попадут в анкету сами', 'Расчёт совместимости с тиммейтами', 'Вкладка «Статистика Steam» и статус «в игре»'].map(b => (
						<li key={b}>
							<svg viewBox='0 0 24 24' fill='none' aria-hidden='true'>
								<path d='M5 12.5l4.5 4.5L19 7.5' stroke='currentColor' strokeWidth='2.4' strokeLinecap='round' strokeLinejoin='round' />
							</svg>
							<span>{b}</span>
						</li>
					))}
				</ul>
				<div className='onb-steam__cta'>
					{linked ? (
						<p className={syncing ? 'onb-notice' : 'onb-steam__text'}>{syncing ? 'Библиотека синхронизируется — это займёт пару минут, можно продолжать.' : 'Библиотека синхронизируется в фоне, можно продолжать.'}</p>
					) : (
						<span className='onb-btn onb-steam__link'>
							<img className='onb-steam__link-icon' src={IMG.steamLogo} alt='' width={22} height={22} />
							Привязать Steam
						</span>
					)}
					<p className='onb-steam__safety'>
						<span>
							<strong>Это безопасно.</strong> Вход проходит на сайте Steam — пароль мы не видим и не храним. Берём только публичные данные: список игр и часы.
						</span>
					</p>
				</div>
			</div>
		</section>
	)
}

/** Вкладка «Статистика Steam» профиля: таблица топ-игр с часами (React-модуль profile-steam) */
export function SteamTable({ rows, total }: { rows: { cover: CoverKey; name: string; hours: string }[]; total: number }) {
	return (
		<section className='player-panels steam-section'>
			<div className='player-card__wrapper'>
				<div className='player-card__column'>
					<article className='player-card'>
						<div className='steam-card__head'>
							<div className='player-card__header'>
								<p>Топ-20 игр</p>
							</div>
							<div className='steam-games-tabs'>
								<span className='steam-games-tab is-active'>Топ 20 игр</span>
								<span className='steam-games-tab'>Все игры ({total})</span>
							</div>
						</div>
						<div className='steam-games-table'>
							{rows.map(r => (
								<div className='steam-games-table__row' key={r.name}>
									<div className='steam-games-table__cover steam-games-table__cover--image steam-games-table__cover--loaded'>
										<img src={IMG.covers[r.cover]} alt='' />
									</div>
									<div className='steam-games-table__body'>
										<div className='steam-games-table__name'>
											<span className='steam-game-card__name-link'>{r.name}</span>
										</div>
										<div className='steam-games-table__hours'>{r.hours}</div>
									</div>
								</div>
							))}
						</div>
					</article>
				</div>
			</div>
		</section>
	)
}
