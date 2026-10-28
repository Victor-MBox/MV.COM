import { AnimatePresence, motion, useTransform } from 'framer-motion'
import { Cursor, Note } from '../kit'
import { NrPage } from '../product/base'
import type { Person } from '../product/assets'
import { LfgCard, PartyCard } from '../product/cards'
import type { Slot } from '../product/cards'
import { CreatedSwitch, PartyForm, PartyIntro } from '../product/parties'
import type { FormField } from '../product/parties'
import { useStep } from '../timeline'
import type { SceneProps } from './types'

const RESPOND_AT = 0.12
const TAB_AT = 0.2
const FIELD_AT = [0.25, 0.29, 0.33, 0.37, 0.41, 0.45]
const CREATE_AT = 0.52
const FORM: FormField[] = [
	{ label: 'Игра', value: 'Valheim' },
	{ label: 'Игроков', value: '4' },
	{ label: 'Возраст', value: '18-30 лет' },
	{ label: 'Микрофон', value: 'Обязательно' },
	{ label: 'Когда', value: 'Сегодня, 20:00' },
	{ label: 'Длительность', value: '3+ часа' },
]

const OWNER: Person = { name: 'Xottab', gender: 'male', avatar: 'bot' }
const JOINERS: { person: Person; at: number }[] = [
	{ person: { name: 'Vasilevs', gender: 'male' }, at: 0.62 },
	{ person: { name: 'Masha', gender: 'female' }, at: 0.72 },
	{ person: { name: 'Den', gender: 'male', avatar: 'bot' }, at: 0.82 },
	{ person: { name: 'Kirill', gender: 'male' }, at: 0.92 },
]
const SLOTS = 4
const BENCH = 2

/** 05 · пати: отклик на объявление → форма комнаты → карточка пати, в которую игроки входят сами, пока она не заполнится */
export default function PartyScene({ p }: SceneProps) {
	const phase = useStep(p, [TAB_AT, CREATE_AT])
	const responded = useStep(p, [RESPOND_AT]) > 0
	const fields = useStep(p, FIELD_AT)
	const joined = useStep(p, JOINERS.map(j => j.at + 0.04))
	const main: Slot[] = [OWNER, ...JOINERS.slice(0, Math.min(joined, SLOTS - 1)).map(j => j.person)]
	while (main.length < SLOTS) main.push(null)
	const bench: Slot[] = JOINERS.slice(SLOTS - 1, joined).map(j => j.person)
	const full = main.every(Boolean)
	const action = full ? 'Встать в запас' : 'Присоединиться'

	// Курсор: «Откликнуться» → вкладка «Пати и ивенты» → «Создать пати» → кнопка справа у карточки на каждом входе
	const btn = { x: 628, y: 232 }
	const keys = [0, 0.04, RESPOND_AT, 0.16, TAB_AT, 0.24, 0.48, CREATE_AT, 0.56, 0.6, 0.66, 0.7, 0.76, 0.8, 0.86, 0.9, 0.96, 1]
	const xs = [500, 500, 600, 600, 560, 560, 600, 600, 600, btn.x, btn.x, btn.x, btn.x, btn.x, btn.x, btn.x, btn.x, btn.x]
	const ys = [300, 300, 318, 318, 78, 78, 350, 350, 350, btn.y, btn.y, btn.y, btn.y, btn.y, btn.y, btn.y, btn.y, btn.y]
	const cx = useTransform(p, keys, xs)
	const cy = useTransform(p, keys, ys)
	const co = useTransform(p, [0.04, 0.08, 0.95, 1], [0, 1, 1, 0])

	return (
		<NrPage className='sc-party'>
			<div className='sc-party__top'>
				<PartyIntro tab={phase === 0 ? 'lfg' : 'parties'} compact />
				<CreatedSwitch tab={phase === 0 ? 'lfg' : 'parties'} parties={phase === 2 ? 106 : 105} />
			</div>
			<AnimatePresence mode='wait' initial={false}>
				{phase === 0 && (
					<motion.div key='lfg' className='lfg-listings' initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
						<LfgCard
							game='Terraria'
							cover='terraria'
							body='Ищу людей для совместного прохождения, сейчас на хардмоде. Играю по вечерам.'
							players={3}
							chips={['ПК', 'Микрофон желателен']}
							author={{ name: 'Avgust', gender: 'male' }}
							responded={responded}
						/>
					</motion.div>
				)}
				{phase === 1 && (
					<motion.div key='form' initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }}>
						<PartyForm fields={FORM.map((f, i) => (i < fields ? f : { label: f.label }))} description={fields >= 6 ? 'Неспешные вечера в Valheim: ванильный сервер, без гонки за прогрессом.' : undefined} submitted={false} />
					</motion.div>
				)}
				{phase === 2 && (
					<motion.div key='card' className='party-cards party-cards--horizontal' initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
						<PartyCard
							title='Вечера в Valheim'
							cover='valheim'
							desc='Ванильный сервер, без гонки за прогрессом. Строим, исследуем, ходим на боссов.'
							tags={[
								{ icon: 'tagLock', label: 'Публичная пати' },
								{ icon: 'tagAge', label: '18-30 лет' },
								{ icon: 'tagMic', label: 'Обязательно' },
								{ icon: 'tagPc', label: 'ПК' },
							]}
							owner={OWNER}
							ownerSteamGame='Valheim'
							main={main}
							bench={bench}
							benchSize={BENCH}
							action={action}
						/>
						<div className='sc-party__status'>
							<Note>
								статус: <code>{full ? 'full · Заполнена' : 'open · Открыта'}</code>
							</Note>
							{joined > 0 && (
								<Note>
									<code>reverb</code> ▸ party_state_changed
								</Note>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
			<Cursor x={cx} y={cy} opacity={co} click={phase + joined + (responded ? 1 : 0) > 0} key={phase * 10 + joined + (responded ? 100 : 0)} />
		</NrPage>
	)
}
