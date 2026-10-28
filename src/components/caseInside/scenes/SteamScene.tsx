import { AnimatePresence, motion, useTransform } from 'framer-motion'
import { Appear, Cursor, Icon, Note } from '../kit'
import { NrPage } from '../product/base'
import { OnbSteam, SteamTable, TelegramBanner } from '../product/pages'
import { useCount, useStep } from '../timeline'
import type { SceneProps } from './types'

const CLICK_AT = 0.1
const HANDSHAKE = [0.12, 0.3] as const
const LINKED_AT = 0.32
const TABLE_AT = 0.4
const LIB = [
	{ cover: 'cs2', name: 'Counter-Strike 2', hours: '647.9 ч.' },
	{ cover: 'dota2', name: 'Dota 2', hours: '1 204 ч.' },
	{ cover: 'valheim', name: 'Valheim', hours: '312 ч.' },
	{ cover: 'repo', name: 'R.E.P.O.', hours: '41 ч.' },
	{ cover: 'terraria', name: 'Terraria', hours: '18 ч.' },
] as const
const COUNTER_AT = 0.62
const TG_AT = 0.7

type Tg = { at: number; text: string; buttons?: string[] }
const TG: Tg[] = [
	{ at: 0.8, text: '🎮 Заявка в пати «Неспешные вечера в Valheim» от Vasilevs', buttons: ['Принять', 'Отклонить'] },
	{ at: 0.9, text: '⏰ Пати стартует через 15 минут · в составе 4 / 4' },
]

/** 07 · steam и telegram: шаг «Steam» онбординга → OpenID → задача импорта в очереди → таблица часов; баннер и бот Telegram */
export default function SteamScene({ p }: SceneProps) {
	const phase = useStep(p, [CLICK_AT, LINKED_AT, TABLE_AT, TG_AT])
	const rows = useStep(p, LIB.map((_, i) => TABLE_AT + 0.02 + i * 0.035))
	const packet = useTransform(p, [HANDSHAKE[0], HANDSHAKE[0] + 0.08, HANDSHAKE[0] + 0.1, HANDSHAKE[1]], [0, 100, 100, 0])
	const packetX = useTransform(packet, v => `${v}%`)
	const count = useCount(p, COUNTER_AT, COUNTER_AT + 0.04, 297, 298)
	const cx = useTransform(p, [0, 0.04, CLICK_AT, 0.16], [330, 330, 110, 400])
	const cy = useTransform(p, [0, 0.04, CLICK_AT, 0.16], [300, 300, 236, 300])
	const co = useTransform(p, [0, 0.03, 0.14, 0.18], [0, 1, 1, 0])

	return (
		<NrPage className='sc-steam'>
			<div className='sc-steam__main'>
				<div className='sc-steam__left'>
					<AnimatePresence mode='wait' initial={false}>
						{phase < 2 ? (
							<motion.div key='onb' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
								<OnbSteam linked={phase === 1} syncing={phase === 1} />
							</motion.div>
						) : (
							<motion.div key='table' initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
								<SteamTable rows={LIB.slice(0, rows)} total={61} />
							</motion.div>
						)}
					</AnimatePresence>

					<div className='sc-steam__notes'>
						<Appear p={p} at={HANDSHAKE[0]} until={TABLE_AT} className='nr-card nr-card--deep sc-steam__flow'>
							<span className='sc-steam__nodes'>
								<span className='sc-steam__node'>norandoms.team</span>
								<span className='sc-steam__wire'>
									<motion.i style={{ left: packetX }} />
								</span>
								<span className='sc-steam__node'>
									<Icon name='steam' size={12} /> steamcommunity.com/openid
								</span>
							</span>
							<span className='nr-log'>
								<Appear p={p} at={HANDSHAKE[0] + 0.02} y={3}>
									→ redirect: openid.mode=checkid_setup
								</Appear>
								<Appear p={p} at={HANDSHAKE[0] + 0.1} y={3}>
									← подпись Steam проверена <em>✓</em> · steamid64 7656…
								</Appear>
								<Appear p={p} at={HANDSHAKE[1]} y={3}>
									<i>queue ▸</i> SyncSteamLibraryJob · GetOwnedGames
								</Appear>
							</span>
						</Appear>
						<Appear p={p} at={TABLE_AT + 0.02} className='nr-log sc-steam__jobLog'>
							<Appear p={p} at={TABLE_AT + 0.02} y={3}>
								<i>queue ▸</i> SyncSteamLibraryJob · outcome: <em>success</em> · 61 игра
							</Appear>
							<Appear p={p} at={TABLE_AT + 0.12} y={3}>
								<i>db ▸</i> user_game_stats · снимок записан
							</Appear>
							<Appear p={p} at={COUNTER_AT} y={3}>
								<i>games/counter-strike-2 ▸</i> есть в Steam у <motion.em>{count}</motion.em> игроков
							</Appear>
						</Appear>
					</div>
				</div>

				<div className='sc-steam__right'>
					<Appear p={p} at={TG_AT} y={12}>
						<TelegramBanner
							items={[{ title: 'Заявки и приглашения', text: 'Чтобы быстро подтвердить состав и не терять людей.' }]}
						/>
					</Appear>
					<div className='sc-steam__tg'>
						<div className='sc-steam__tgHead'>
							<span className='sc-steam__tgLogo'>
								<Icon name='telegram' size={14} />
							</span>
							<span>
								<b>NoRandoms</b>
								<span className='nr-muted'>бот</span>
							</span>
						</div>
						<div className='sc-steam__tgFeed'>
							{TG.map(m => (
								<Appear p={p} at={m.at} key={m.at} y={8} className='sc-steam__tgMsg'>
									<span>{m.text}</span>
									{m.buttons && (
										<span className='sc-steam__tgBtns'>
											{m.buttons.map(b => (
												<span key={b}>{b}</span>
											))}
										</span>
									)}
								</Appear>
							))}
						</div>
					</div>
					<Appear p={p} at={0.96} className='sc-steam__note'>
						<Note tone='accent'>только то, что требует действия</Note>
					</Appear>
				</div>
			</div>
			<Cursor x={cx} y={cy} opacity={co} click={phase > 0} key={phase} />
		</NrPage>
	)
}
