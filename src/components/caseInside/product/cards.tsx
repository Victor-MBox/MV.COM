import { Svg } from './base'
import { IMG, PRESENCE_LABEL, avatarOf } from './assets'
import type { CoverKey, Person, Presence } from './assets'

/** Анкета игрока — `<x-teammate-card>` продукта (resources/views/components/teammate-card.blade.php) */
export type TeammateCardProps = {
	person: Person
	presence?: Presence
	/** Steam привязан и статус «В игре: …» */
	steamGame?: string
	about?: string
	chips?: string[]
	status?: string
	/** Пригашена (не подходит под фильтры) */
	dim?: boolean
	className?: string
}

export function TeammateCard({ person, presence = 'offline', steamGame, about, chips = [], status = 'Активно ищу пати', dim, className }: TeammateCardProps) {
	const linked = steamGame !== undefined
	return (
		<article className={['tm-card', steamGame ? 'is-steam-in-game' : '', dim ? 'is-dimmed' : '', className ?? ''].filter(Boolean).join(' ')}>
			<div className='tm-card__strip'>
				<div className='tm-card__strip-steam'>
					<span className={`tm-card__steam${linked ? ' is-linked' : ''}`}>
						<img src={IMG.steamLogo} alt='' />
					</span>
					{steamGame ? (
						<span className='steam-presence steam-presence--in-game'>
							<img className='steam-presence__icon' src={IMG.steamLogo} alt='' width={14} height={14} />
							<span className='steam-presence__live'>
								<i />
								<i />
								<i />
							</span>
							<span className='steam-presence__label'>
								<span className='steam-presence__label-track'>В игре: {steamGame}</span>
							</span>
						</span>
					) : (
						<span className='tm-card__steam-note'>{linked ? 'Steam привязан' : 'Нет Steam'}</span>
					)}
				</div>
				<div className='tm-card__strip-site'>
					<span className={`tm-card__status-dot tm-card__status-dot--${presence}${presence === 'online' ? ' is-pulsing' : ''}`} />
					<span className='tm-card__last-seen'>{PRESENCE_LABEL[presence]}</span>
				</div>
				<span className='user-hover-info-button tm-card__expand'>
					<Svg name='expand' />
				</span>
			</div>
			<div className='tm-card__wrapper'>
				<div className='tm-card__header'>
					<div className='tm-card__user'>
						<span className='tm-card__avatar-link'>
							<div className={`tm-card__avatar tm-card__avatar--${person.gender}`}>
								<img src={avatarOf(person)} alt='' />
							</div>
						</span>
						<div className='tm-card__identity'>
							<h3 className='tm-card__title'>
								<span className='tm-card__title-link'>{person.name}</span>
							</h3>
							<span className='tm-card__status tm-card__status--party'>{status}</span>
						</div>
					</div>
				</div>
				{about ? <p className='tm-card__about'>{about}</p> : <p className='tm-card__about tm-card__about--muted'>Описание не заполнено</p>}
				<div className='tm-card__chips'>
					{chips.length ? chips.map(c => <span className='tm-chip' key={c}>{c}</span>) : <span className='tm-chip tm-chip--muted'>Устройства не указаны</span>}
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
					<span className={`tm-card__action${linked ? '' : ' is-disabled'}`}>
						<Svg name='compat' />
					</span>
				</div>
			</div>
		</article>
	)
}

/** Чип-тег карточки пати: иконка + значение */
export function MediaTag({ icon, children, privateTag }: { icon: 'tagLock' | 'tagAge' | 'tagMic' | 'tagPc'; children: string; privateTag?: boolean }) {
	return (
		<span className={`chip party-card__media-tag${privateTag ? ' party-card__media-tag--private' : ''}`}>
			<Svg name={icon} className='party-card__media-tag-icon' />
			<span className='party-card__media-tag-value'>{children}</span>
		</span>
	)
}

export type Slot = Person | null

function RosterSlot({ p, layer }: { p: Slot; layer: number }) {
	if (!p)
		return (
			<span className='party-card__slot party-card__slot--empty' style={{ ['--party-slot-layer' as string]: layer }}>
				<Svg name='slotPlus' />
			</span>
		)
	return (
		<span className='party-card__slot party-card__slot--filled' style={{ ['--party-slot-layer' as string]: layer }} data-gender={p.gender}>
			<img src={avatarOf(p)} alt='' />
		</span>
	)
}

/** Сводка о пользователе — `<x-user-summary>` + `<x-user-identity>` (создатель пати, участники) */
export function UserSummary({ person, context, presence = 'offline', steamGame, compact, className }: { person: Person; context: string; presence?: Presence; steamGame?: string; compact?: boolean; className?: string }) {
	return (
		<div className={['user-summary', compact ? 'user-summary--compact' : 'user-summary--embedded', className ?? ''].filter(Boolean).join(' ')}>
			<div className='user-summary__main'>
				<div className='user-summary__identity'>
					<div className={`user-identity ${compact ? 'user-identity--compact' : 'user-identity--embedded party-card__owner-identity'}`}>
						<span className={`user-identity__avatar tm-card__avatar--${person.gender}`}>
							<img src={avatarOf(person)} alt='' />
							<span className={`user-identity__site-dot tm-card__status-dot tm-card__status-dot--${presence}${presence === 'online' ? ' is-pulsing' : ''}`} />
						</span>
						<div className='user-identity__copy'>
							<div className='user-identity__name-row'>
								<span className='user-identity__name'>{person.name}</span>
							</div>
						</div>
					</div>
				</div>
				<div className='user-identity__context'>
					<span className='party-card__owner-meta'>{context}</span>
				</div>
				{steamGame && (
					<div className='user-identity__activity'>
						<span className='steam-presence steam-presence--in-game'>
							<img className='steam-presence__icon' src={IMG.steamLogo} alt='' width={14} height={14} />
							<span className='steam-presence__live'>
								<i />
								<i />
								<i />
							</span>
							<span className='steam-presence__label'>
								<span className='steam-presence__label-track'>В игре: {steamGame}</span>
							</span>
						</span>
					</div>
				)}
			</div>
		</div>
	)
}

export type PartyCardProps = {
	title: string
	cover: CoverKey
	desc: string
	tags: { icon: 'tagLock' | 'tagAge' | 'tagMic' | 'tagPc'; label: string }[]
	owner: Person
	ownerSteamGame?: string
	main: Slot[]
	bench?: Slot[]
	benchSize?: number
	createdAt?: string
	/** Кнопка справа: «Присоединиться» / «Встать в запас» / отсутствует */
	action?: string
	actionPressed?: boolean
}

/** Карточка пати — горизонтальная плитка `<x-party-card-tile>` со списка /parties */
export function PartyCard({ title, cover, desc, tags, owner, ownerSteamGame, main, bench, benchSize = 0, createdAt = '19:12', action, actionPressed }: PartyCardProps) {
	const filledMain = main.filter(Boolean).length
	const benchSlots = bench ?? []
	return (
		<div className='party-card__link-wrap party-card__link-wrap--horizontal'>
			<article className='party-card__link party-card__link--horizontal'>
				<span className='party-card__media party-card__media--horizontal is-loaded'>
					<span className='matchmaking-created-at lfg-listing__created-at'>
						<Svg name='clock' className='matchmaking-created-at__icon' />
						<time>Создано {createdAt}</time>
					</span>
					<img src={IMG.covers[cover]} alt='' />
				</span>
				<div className='party-card__horizontal-content'>
					<div className='party-card__horizontal-heading'>
						<h4 className='party-card__title'>
							<span className='party-card__title-link'>{title}</span>
						</h4>
					</div>
					<div className='matchmaking-expandable-text'>
						<p className='party-card__desc party-card__desc--horizontal'>{desc}</p>
					</div>
					<div className='party-card__horizontal-tags'>
						{tags.map(t => (
							<MediaTag icon={t.icon} key={t.label}>
								{t.label}
							</MediaTag>
						))}
					</div>
					<div className='party-card__horizontal-bottom'>
						<div className='party-card__roster-slots'>
							<div className='party-card__main-slots'>
								<span className='party-card__slots-label party-card__slots-label--main'>
									Основной состав <span>{filledMain}</span> / {main.length}
								</span>
								<div className='party-card__slots'>
									{main.map((p, i) => (
										<RosterSlot p={p} layer={main.length - i} key={i} />
									))}
								</div>
							</div>
							{benchSize > 0 && (
								<div className='party-card__bench-slots'>
									<span className='party-card__slots-label'>
										Скамья запасных <span>{benchSlots.filter(Boolean).length}</span> / {benchSize}
									</span>
									<div className='party-card__slots'>
										{Array.from({ length: benchSize }, (_, i) => (
											<RosterSlot p={benchSlots[i] ?? null} layer={benchSize - i} key={i} />
										))}
									</div>
								</div>
							)}
						</div>
					</div>
				</div>
				<aside className='party-card__horizontal-aside'>
					<UserSummary person={owner} context='Создатель пати' steamGame={ownerSteamGame} className='party-card__horizontal-owner' />
					<div className='matchmaking-card-actions playerHero__action-cluster'>
						<span className='matchmaking-card-action matchmaking-card-actions__message'>
							<Svg name='cardMessage' />
							<span>Написать</span>
						</span>
						<span className='matchmaking-icon-action matchmaking-icon-action--profile'>
							<Svg name='cardProfile' />
						</span>
						<span className='matchmaking-icon-action matchmaking-icon-action--more'>
							<Svg name='cardMore' />
						</span>
					</div>
					{action && (
						<span className={`main-btn main-btn_green-accent party-intro__primary-action party-card__horizontal-action${actionPressed ? ' is-pressed' : ''}`}>
							<span>{action}</span>
						</span>
					)}
				</aside>
			</article>
		</div>
	)
}

export type LfgCardProps = {
	game: string
	cover: CoverKey
	body: string
	players: number
	chips: string[]
	author: Person
	createdAt?: string
	responded?: boolean
}

/** Объявление LFG — `<x-lfg-listing-card>` со вкладки «Объявления» */
export function LfgCard({ game, cover, body, players, chips, author, createdAt = '27.10.2026', responded }: LfgCardProps) {
	return (
		<article className='party-card__link lfg-listing lfg-listing--active'>
			<div className='lfg-listing__media'>
				<span className='matchmaking-created-at lfg-listing__created-at'>
					<Svg name='clock' className='matchmaking-created-at__icon' />
					<time>Создано {createdAt}</time>
				</span>
				<img src={IMG.covers[cover]} alt='' />
			</div>
			<div className='lfg-listing__content'>
				<header className='lfg-listing__header'>
					<div className='lfg-listing__game'>
						<h3>{game}</h3>
					</div>
				</header>
				<div className='matchmaking-expandable-text'>
					<p className='lfg-listing__body'>{body}</p>
				</div>
				<div className='lfg-listing__chips'>
					<span className='chip lfg-listing__chip lfg-listing__chip--players'>
						<Svg name='lfgPlayers' className='lfg-listing__chip-icon' />
						<strong>{players}</strong>
					</span>
					{chips.map(c => (
						<span className='chip lfg-listing__chip' key={c}>
							<Svg name='tagPc' className='lfg-listing__chip-icon' /> {c}
						</span>
					))}
				</div>
			</div>
			<aside className='lfg-listing__aside'>
				<div className='lfg-listing__author'>
					<span className='lfg-listing__author-avatar' data-gender={author.gender}>
						<img src={avatarOf(author)} alt='' />
					</span>
					<span className='lfg-listing__author-copy'>
						<span className='lfg-listing__author-name'>{author.name}</span>
						<small>Автор объявления</small>
					</span>
				</div>
				<div className='lfg-listing__actions'>
					<div className='lfg-listing__response-controls'>
						<span className={`matchmaking-card-cta matchmaking-card-cta--primary${responded ? ' is-active' : ''}`}>
							<span className='matchmaking-card-cta__icon'>
								<Svg name='lfgCta' />
							</span>
							<span className='matchmaking-card-cta__label'>{responded ? 'Отклик отправлен' : 'Откликнуться'}</span>
						</span>
					</div>
				</div>
			</aside>
		</article>
	)
}

/** Карточка игры с главной — `.home-game-card` с тремя счётчиками */
export function HomeGameCard({ title, cover, seekers, steam, parties }: { title: string; cover: CoverKey; seekers: string; steam: string; parties: string }) {
	return (
		<span className='home-game-card'>
			<span className='home-game-card__cover'>
				<img src={IMG.covers[cover]} alt='' />
			</span>
			<span className='home-game-card__body'>
				<span className='home-game-card__title'>{title}</span>
				<span className='home-game-card__stats'>
					<span className='home-game-card__stat home-game-card__stat--preference'>
						<span className='home-game-card__stat-main'>
							<Svg name='statUser' className='home-game-card__stat-icon' />
							<span className='home-game-card__stat-value'>{seekers}</span>
						</span>
						<span className='home-game-card__stat-label'>ищут пати</span>
					</span>
					<span className='home-game-card__stat home-game-card__stat--steam'>
						<span className='home-game-card__stat-main'>
							<Svg name='statSteam' className='home-game-card__stat-icon' />
							<span className='home-game-card__stat-value'>{steam}</span>
						</span>
						<span className='home-game-card__stat-label'>игроков в Steam</span>
					</span>
					<span className='home-game-card__stat home-game-card__stat--party'>
						<span className='home-game-card__stat-main'>
							<Svg name='statParty' className='home-game-card__stat-icon' />
							<span className='home-game-card__stat-value'>{parties}</span>
						</span>
						<span className='home-game-card__stat-label'>активных пати</span>
					</span>
				</span>
			</span>
		</span>
	)
}
