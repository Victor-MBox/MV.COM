import type { ReactNode } from 'react'
import { Svg } from './base'
import { IMG, avatarOf } from './assets'
import type { Person, Presence } from './assets'
import { UserSummary } from './cards'

export type ChatMessage = { author: Person; time: string; text: string; mine?: boolean }

/** Чат пати — `<x-party-chat>`: шапка, сообщения, индикатор «печатает», композер */
export function PartyChat({ game, messages, typing, children }: { game: string; messages: ChatMessage[]; typing?: string; children?: ReactNode }) {
	return (
		<div className='party-chat'>
			<div className='party-chat__header'>
				<h3>Чат</h3>
				<span className='party-card__eyebrow'>
					Пати <span className='party-card__eyebrow-game'>{game}</span>
				</span>
			</div>
			<div className='party-chat__messages'>
				{messages.map((m, i) => (
					<div className={`party-chat__message${m.mine ? ' party-chat__message--mine' : ''}`} key={i}>
						<div className='party-chat__avatar' data-gender={m.author.gender}>
							<img src={avatarOf(m.author)} alt='' />
						</div>
						<div className='party-chat__body'>
							<div className='party-chat__meta'>
								<span className='party-chat__author'>{m.author.name}</span>
								<span className='party-chat__time'>{m.time}</span>
							</div>
							<p className='party-chat__text'>{m.text}</p>
						</div>
					</div>
				))}
				{children}
				{typing && <p className='party-chat__typing'>{typing} печатает…</p>}
			</div>
			<div className='party-chat__form'>
				<div className='party-chat__composer'>
					<div className='party-chat__attachment-wrap'>
						<span className='party-chat__attachment-label'>
							<Svg name='chatAttach' />
						</span>
					</div>
					<span className='nr-ui__textarea nr-ui__textarea--chat'>Напишите сообщение...</span>
					<span className='party-chat__emoji-btn'>
						<Svg name='chatEmoji' />
					</span>
					<span className='party-chat__send-btn'>
						<Svg name='chatSend' />
					</span>
				</div>
			</div>
		</div>
	)
}

/** Карточка «Попробуй голосовой режим» с кнопкой «Go болтать» — `<x-party-voice-card>` */
export function VoiceCard({ pressed }: { pressed?: boolean }) {
	return (
		<div className='party-card party-card--voice'>
			<div className='party-card__voice-row'>
				<p className='party-card__voice-title'>Попробуй голосовой режим</p>
				<div className='party-card__actions party-card__actions--voice'>
					<span className={`main-btn main-btn_orange party-voice-card__cta${pressed ? ' is-pressed' : ''}`}>
						<span>Go болтать</span>
					</span>
				</div>
			</div>
		</div>
	)
}

/** Карточка создателя — `<x-party-owner>` с описанием и статусом */
export function PartyOwner({ owner, desc, status, presence = 'online', steamGame }: { owner: Person; desc: string; status: string; presence?: Presence; steamGame?: string }) {
	return (
		<div className='party-card party-card--owner'>
			<div className='party-card__owner'>
				<div className='party-card__owner-avatar' data-gender={owner.gender}>
					<img src={avatarOf(owner)} alt='' />
					<span className={`tm-card__status-dot tm-card__status-dot--${presence}${presence === 'online' ? ' is-pulsing' : ''}`} />
				</div>
				<div className='party-card__owner-info'>
					<div className='party-card__owner-head'>
						<span className='party-card__owner-name'>{owner.name}</span>
					</div>
					<p className='party-card__owner-meta'>Создатель пати</p>
					{steamGame && (
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
					)}
				</div>
			</div>
			<p className='party-card__owner-desc'>{desc}</p>
			<ul className='party-card__meta-list'>
				<li className='party-card__meta-item'>
					<span className='party-card__meta-label'>Статус</span>
					<strong>{status}</strong>
				</li>
			</ul>
		</div>
	)
}

export type Member = { person: Person; context?: string; presence?: Presence; inVoice?: boolean }

/** Состав пати — `<x-party-members>`: основной состав и скамья запасных */
export function PartyMembers({ main, bench, mainSize, benchSize }: { main: Member[]; bench: Member[]; mainSize: number; benchSize: number }) {
	const section = (title: string, list: Member[], size: number, isBench?: boolean) => (
		<section className={`party-members__section${isBench ? ' party-members__section--bench' : ''}`}>
			<div className='party-members__section-heading'>
				<h3 className='party-members__section-title'>{title}</h3>
				<span className='party-members__section-count'>
					{list.length} / {size}
				</span>
			</div>
			{list.length === 0 ? (
				<p className='party-card__note'>{isBench ? 'Запас пока пуст.' : 'Основной состав пока пуст.'}</p>
			) : (
				<ul className='party-members'>
					{list.map(m => (
						<li className='party-members__item' key={m.person.name}>
							<UserSummary person={m.person} context={m.context ?? ''} presence={m.presence} compact className='party-members__summary' />
							{m.inVoice && <span className='app-sidebar__badge app-sidebar__badge--soon party-members__voice-badge'>в voice</span>}
						</li>
					))}
				</ul>
			)}
		</section>
	)
	return (
		<div className='party-card party-card--members'>
			<div className='party-card__header party-members__header'>
				<span className='party-card__eyebrow'>Состав</span>
			</div>
			{section('Основной состав', main, mainSize)}
			{section('Скамья запасных', bench, benchSize, true)}
		</div>
	)
}

/** Страница пати: главная колонка (голос + чат) и боковая (создатель, состав) — `.party-page` */
export function PartyPage({ main, sidebar }: { main: ReactNode; sidebar: ReactNode }) {
	return (
		<div className='party-page nr-ui__party-page'>
			<div className='party-page__main'>
				<div className='party-page__communication'>{main}</div>
			</div>
			<aside className='party-page__sidebar'>{sidebar}</aside>
		</div>
	)
}

export type VoiceTile = { person: Person; speaking?: boolean; muted?: boolean }

/**
 * Обёртка голосовой комнаты `/parties/{slug}/voice/room`: сцена с конференцией Jitsi (здесь — плитки участников
 * в стиле Jitsi, сам Jitsi — iframe с voice.norandoms.team) и боковая панель с карточкой «Voice чат» и составом
 */
export function VoiceRoom({ tiles, loading, sidebar }: { tiles: VoiceTile[]; loading?: boolean; sidebar: ReactNode }) {
	return (
		<div className='voice-room'>
			<section className='voice-room__stage'>
				{loading ? (
					<section className='voice-room__overlay'>
						<div className='voice-room__overlay-card'>
							<div className='voice-room__loader'>
								<div className='voice-room__loader-logo-wrap'>
									<img className='voice-room__loader-logo' src={IMG.logo} alt='' />
								</div>
								<h2 className='voice-room__loader-title'>Подключаем voice чат…</h2>
								<p className='voice-room__loader-text'>Готовим комнату, проверяем соединение и подгружаем оформление голосового интерфейса.</p>
								<div className='voice-room__loader-bar' />
							</div>
						</div>
					</section>
				) : (
					<div className='voice-room__jitsi nr-ui__jitsi'>
						{tiles.map(t => (
							<div className={`nr-ui__jitsiTile${t.speaking ? ' is-speaking' : ''}`} key={t.person.name}>
								<img src={avatarOf(t.person)} alt='' />
								<span className='nr-ui__jitsiName'>{t.person.name}</span>
								<span className={`nr-ui__jitsiMic${t.muted ? ' is-muted' : ''}`}>
									<Svg name='benefitVoice' />
								</span>
							</div>
						))}
						<div className='nr-ui__jitsiBar'>
							<span className='nr-ui__jitsiBtn'>
								<Svg name='benefitVoice' />
							</span>
							<span className='nr-ui__jitsiBtn nr-ui__jitsiBtn--leave'>Выйти</span>
						</div>
					</div>
				)}
			</section>
			<aside className='voice-room__sidebar'>
				<section className='party-card party-card--owner'>
					<h1 className='voice-room__voice-card-title'>Voice чат</h1>
					<p className='voice-room__voice-card-note'>Если нет звука или видео, проверь разрешения микрофона и камеры в браузере.</p>
					<div className='voice-room__actions'>
						<span className='a-btn a-btn--ghost'>К пати</span>
						<span className='a-btn a-btn--primary voice-room__copy-btn'>Скопировать ссылку</span>
					</div>
				</section>
				{sidebar}
			</aside>
		</div>
	)
}
