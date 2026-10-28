import { AnimatePresence, motion, useTransform } from 'framer-motion'
import { Appear, Cursor, Note } from '../kit'
import { NrPage } from '../product/base'
import type { Person } from '../product/assets'
import { PartyChat, PartyMembers, PartyOwner, PartyPage, VoiceCard, VoiceRoom } from '../product/room'
import type { ChatMessage, Member } from '../product/room'
import { useStep } from '../timeline'
import type { SceneProps } from './types'

const XOTTAB: Person = { name: 'Xottab', gender: 'male', avatar: 'bot' }
const VASILEVS: Person = { name: 'Vasilevs', gender: 'male' }
const MASHA: Person = { name: 'Masha', gender: 'female' }

const MSGS: (ChatMessage & { at: number })[] = [
	{ author: XOTTAB, time: '18:40', text: 'Всем привет! Будут желающие — арендую и настрою сервер.', at: 0, mine: true },
	{ author: VASILEVS, time: '18:42', text: 'Я в деле. Сервер без модов?', at: 0.16 },
	{ author: XOTTAB, time: '18:43', text: 'Да, ванила. Го в голос?', at: 0.3, mine: true },
	{ author: MASHA, time: '18:44', text: 'Захожу 👋', at: 0.4 },
]
const TYPING: [number, number, string][] = [
	[0.08, 0.16, 'Vasilevs'],
	[0.22, 0.3, 'Xottab'],
]
const CALL_AT = 0.5
const ROOM_AT = 0.56
const JOINED_AT = 0.66
const SPEAK_AT = [0.72, 0.8, 0.88]

type Log = { at: number; text: string; kind: 'ws' | 'jwt' | 'jitsi' }
const LOG: Log[] = [
	{ at: 0.08, text: 'party_typing', kind: 'ws' },
	{ at: 0.16, text: 'party_message_received', kind: 'ws' },
	{ at: 0.3, text: 'party_message_received', kind: 'ws' },
	{ at: 0.4, text: 'party_state_changed · состав 3 / 4', kind: 'ws' },
	{ at: 0.54, text: 'JWT подписан · модератор: владелец', kind: 'jwt' },
	{ at: 0.6, text: 'iframe voice.norandoms.team · prejoin: off', kind: 'jitsi' },
	{ at: JOINED_AT, text: 'videoConferenceJoined', kind: 'jitsi' },
	{ at: 0.76, text: 'party_state_changed · в voice: 3', kind: 'ws' },
]

const MEMBERS: Member[] = [
	{ person: XOTTAB, context: 'Наиграл 312 ч', presence: 'online' },
	{ person: VASILEVS, context: 'Наиграл 96 ч', presence: 'online' },
	{ person: MASHA, context: 'Не играла', presence: 'online' },
]

/** 06 · чат и голос: настоящая страница пати — чат с «печатает», «Go болтать» открывает обёртку Jitsi с составом */
export default function LiveScene({ p }: SceneProps) {
	const phase = useStep(p, [CALL_AT, ROOM_AT, JOINED_AT])
	const typing = useStep(p, TYPING.flatMap(([a, b]) => [a, b]))
	const typingName = typing % 2 === 1 ? TYPING[(typing - 1) / 2][2] : undefined
	const speaking = useStep(p, SPEAK_AT)
	const inVoice = phase >= 3
	const members = MEMBERS.map(m => ({ ...m, inVoice }))

	const keys = [0.4, CALL_AT, 0.53, 0.6]
	const cx = useTransform(p, keys, [300, 392, 392, 200])
	const cy = useTransform(p, keys, [380, 52, 52, 300])
	const co = useTransform(p, [0.42, 0.46, 0.54, 0.58], [0, 1, 1, 0])

	return (
		<NrPage className='sc-live'>
			<AnimatePresence mode='wait' initial={false}>
				{phase < 2 ? (
					<motion.div key='party' initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
						<PartyPage
							main={
								<>
									<VoiceCard pressed={phase === 1} />
									<PartyChat game='Valheim' messages={MSGS.filter(m => p.get() >= m.at || m.at === 0)} typing={typingName}>
										{MSGS.filter(m => m.at > 0).map(m => (
											<Appear p={p} at={m.at} key={m.at} span={0.001} y={0} style={{ display: 'none' }}>
												{m.text}
											</Appear>
										))}
									</PartyChat>
								</>
							}
							sidebar={
								<>
									<PartyOwner owner={XOTTAB} desc='Ванильный сервер, без гонки за прогрессом. Строим, исследуем, ходим на боссов.' status='Открыта' steamGame='Valheim' />
									<PartyMembers main={members} bench={[]} mainSize={4} benchSize={2} />
								</>
							}
						/>
					</motion.div>
				) : (
					<motion.div key='voice' className='sc-live__room' initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
						<VoiceRoom
							loading={phase === 2}
							tiles={[
								{ person: XOTTAB, speaking: speaking % 3 === 1 },
								{ person: VASILEVS, speaking: speaking % 3 === 2 },
								{ person: MASHA, speaking: speaking > 0 && speaking % 3 === 0, muted: speaking < 2 },
							]}
							sidebar={<PartyMembers main={members} bench={[]} mainSize={4} benchSize={2} />}
						/>
					</motion.div>
				)}
			</AnimatePresence>
			<div className='sc-live__log'>
				<div className='nr-log'>
					{LOG.map(l => (
						<Appear p={p} at={l.at} key={l.at} y={3} span={0.02}>
							{l.kind === 'ws' ? <em>reverb ▸</em> : l.kind === 'jwt' ? <i>laravel ▸</i> : <i>jitsi ▸</i>} {l.text}
						</Appear>
					))}
				</div>
			</div>
			<Appear p={p} at={0.92} className='sc-live__note'>
				<Note tone='accent'>голос — Jitsi на своём сервере, вход по JWT</Note>
			</Appear>
			<Cursor x={cx} y={cy} opacity={co} click={phase > 0} key={phase} />
		</NrPage>
	)
}
