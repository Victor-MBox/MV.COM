import { AnimatePresence, motion, useTransform } from 'framer-motion'
import { Cursor, Note } from '../kit'
import { NrPage } from '../product/base'
import type { Person } from '../product/assets'
import { TeammateCard } from '../product/cards'
import { FilterBar } from '../product/filters'
import type { FilterKey } from '../product/filterList'
import { useStep } from '../timeline'
import type { SceneProps } from './types'

/** Выбор по шагам: ключ фильтра, значение (подписи — с сайта), параметр запроса */
const PICKS: { key: FilterKey; value: string; q: string }[] = [
	{ key: 'voice_required', value: '🎤 Обязательно', q: 'voice_required=required' },
	{ key: 'playstyles', value: '🏆 Ап ранга', q: 'playstyles=ranked' },
	{ key: 'play_times', value: '🌆 Вечером', q: 'play_times=evening' },
	{ key: 'toxicity', value: '😇 Без токсичности', q: 'toxicity=none' },
]
const OPEN_AT = 0.1
const AT = [0.26, 0.44, 0.62, 0.8]

type Player = { person: Person; about?: string; chips?: string[]; steamGame?: string; presence?: 'online' | 'recent' | 'offline'; survive: number }
/** Первая страница выдачи: survive — после скольких выборов анкета ещё подходит */
const PLAYERS: Player[] = [
	{ person: { name: 'Vasilevs', gender: 'male' }, about: 'CS2 по вечерам, ап ранга, микрофон обязателен. Без токсичности.', chips: ['ПК'], steamGame: 'Counter-Strike 2', presence: 'online', survive: 4 },
	{ person: { name: 'Hitman', gender: 'male', avatar: 'bot' }, about: 'Ищу игроков для Guitar Hero и Rock band. Готов пройти кооп Gears.', chips: ['ПК', 'Геймпад'], presence: 'recent', survive: 1 },
	{ person: { name: 'Masha', gender: 'female' }, about: 'Релакс и кооп по выходным, микрофон есть.', chips: ['ПК'], presence: 'offline', survive: 0 },
	{ person: { name: 'ЧуС', gender: 'male' }, about: 'Вечером после работы, ранкед без нервов.', chips: ['ПК'], steamGame: 'Dota 2', presence: 'online', survive: 4 },
	{ person: { name: 'Минч', gender: 'male', avatar: 'bot' }, chips: ['ПК'], presence: 'offline', survive: 2 },
	{ person: { name: 'TurboDeda', gender: 'male' }, about: 'Всем мира) Мне 33, время по мск +5, есть много игр.', chips: ['ПК', 'Геймпад'], presence: 'recent', survive: 3 },
]
const TOTAL = 148
const LEFT = [61, 27, 12, 6]

/** Геометрия на холсте (px от padding-box .nr-ui): кнопка фильтров и строки раскрытой панели */
const TOGGLE = { x: 664, y: 50 }
const ROW = (i: number) => ({ x: 342 + (i % 2) * 210, y: 108 + Math.floor(i / 2) * 54 })
const ROW_OF: Record<FilterKey, number> = { gender: 0, site_status: 1, voice_required: 2, talkativeness: 3, age_ranges: 4, playstyles: 5, devices: 6, play_times: 7, session_length: 8, comms_channels: 9, toxicity: 10, mistake_attitude: 11 }

/** 02 · подбор: курсор открывает панель фильтров и выбирает четыре значения — выдача анкет сужается, запрос в адресе растёт */
export default function FiltersScene({ p }: SceneProps) {
	const step = useStep(p, [OPEN_AT, ...AT])
	const picked = PICKS.slice(0, Math.max(0, step - 1))
	const values = Object.fromEntries(picked.map(x => [x.key, x.value])) as Partial<Record<FilterKey, string>>
	const left = picked.length ? LEFT[picked.length - 1] : TOTAL
	const query = picked.map(x => x.q).join('&')

	const pts = PICKS.map(x => ROW(ROW_OF[x.key]))
	const keys = [0, 0.04, OPEN_AT, 0.16, 0.24, 0.3, 0.42, 0.48, 0.6, 0.66, 0.78, 0.86, 1]
	const xs = [420, 420, TOGGLE.x, TOGGLE.x, pts[0].x, pts[0].x, pts[1].x, pts[1].x, pts[2].x, pts[2].x, pts[3].x, 300, 300]
	const ys = [300, 300, TOGGLE.y, TOGGLE.y, pts[0].y, pts[0].y, pts[1].y, pts[1].y, pts[2].y, pts[2].y, pts[3].y, 400, 400]
	const cx = useTransform(p, keys, xs)
	const cy = useTransform(p, keys, ys)
	const co = useTransform(p, [0.02, 0.06, 0.84, 0.9], [0, 1, 1, 0])

	return (
		<NrPage className='sc-filters'>
			<div className='teammate-finder'>
				<FilterBar values={values} open={step > 0} />
				<p className='sc-filters__query'>
					<span className='nr-mono'>
						<i>GET</i> /teammates{query ? `?${query}` : ''} · <em>{left}</em> анкет
					</span>
				</p>
				<motion.div className='tm-grid' layout>
					<AnimatePresence initial={false}>
						{PLAYERS.filter(pl => pl.survive >= picked.length).map(pl => (
							<motion.div
								key={pl.person.name}
								layout
								initial={{ opacity: 0, scale: 0.94 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.92 }}
								transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
							>
								<TeammateCard person={pl.person} about={pl.about} chips={pl.chips} steamGame={pl.steamGame} presence={pl.presence} />
							</motion.div>
						))}
					</AnimatePresence>
				</motion.div>
				{picked.length === PICKS.length && (
					<motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className='sc-filters__note'>
						<Note tone='accent'>фильтры в адресе · карточки с сервера · React перестраивает список</Note>
					</motion.div>
				)}
			</div>
			<Cursor x={cx} y={cy} opacity={co} click={step > 0} key={step} />
		</NrPage>
	)
}
