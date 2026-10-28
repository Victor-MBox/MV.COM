import { motion } from 'framer-motion'
import { Appear, Note } from '../kit'
import { NrPage } from '../product/base'
import { CompatPage } from '../product/pages'
import type { CompatGame, CompatPref } from '../product/pages'
import { useCount, useStep } from '../timeline'
import type { SceneProps } from './types'

const GAMES: CompatGame[] = [
	{ cover: 'cs2', name: 'Counter-Strike 2', his: '647.9', mine: '812' },
	{ cover: 'dota2', name: 'Dota 2', his: '1 204', mine: '390' },
	{ cover: 'valheim', name: 'Valheim', his: '312', mine: '96' },
]
const PREFS: CompatPref[] = [
	{ label: 'Каналы связи', value: 'Голос в игре, Discord', state: 'ok' },
	{ label: 'Длина сессии', value: '2-3 часа', state: 'ok' },
	{ label: 'Стиль игры', value: 'Ап ранга', state: 'ok' },
	{ label: 'Общение', value: 'Активно общаюсь', state: 'warn' },
	{ label: 'Токсичность', value: 'Без токсичности', state: 'ok' },
]
const TRAITS = ['Кооп', 'Вечерние катки', 'Микрофон']
const COUNT = [0.08, 0.42] as const
const GAME_AT = [0.2, 0.28, 0.36]
const PREF_AT = [0.5, 0.58, 0.66, 0.74, 0.82]

/** Подпись и тон, как на странице продукта: 0 — нет общих игр, ≤39 — есть база, ≤69 — неплохое совпадение, иначе — много общего */
function toneOf(v: number): ['low' | 'medium' | 'good' | 'high', string] {
	if (v === 0) return ['low', 'НЕТ ОБЩИХ ИГР']
	if (v <= 39) return ['medium', 'ЕСТЬ БАЗА ДЛЯ ИГРЫ']
	if (v <= 69) return ['good', 'НЕПЛОХОЕ СОВПАДЕНИЕ']
	return ['high', 'МНОГО ОБЩЕГО']
}

/** 03 · совместимость: настоящая страница «Игровая совместимость» — процент считается, общие игры и предпочтения появляются */
export default function MatchScene({ p }: SceneProps) {
	const percent = useCount(p, COUNT[0], COUNT[1], 0, 74)
	const prefsPercent = useCount(p, 0.5, 0.84, 0, 80)
	const phase = useStep(p, [0.18, 0.3, 0.4])
	const games = useStep(p, GAME_AT)
	const prefs = useStep(p, PREF_AT)
	const [tone, label] = toneOf([0, 30, 60, 74][phase])

	return (
		<NrPage className='sc-match'>
			<CompatPage
				viewer={{ name: 'Xottab', gender: 'male', avatar: 'bot' }}
				other={{ name: 'Vasilevs', gender: 'male' }}
				percent={<motion.span>{percent}</motion.span>}
				tone={tone}
				label={label}
				shared={games === 0 ? 0 : 12}
				recent={games >= 2 ? 3 : 0}
				games={GAMES.slice(0, games)}
				prefs={PREFS.slice(0, prefs)}
				prefsPercent={<motion.span>{prefsPercent}</motion.span>}
				traits={prefs >= 5 ? TRAITS : []}
			/>
			<Appear p={p} at={0.9} className='sc-match__note'>
				<Note tone='accent'>база — общие игры Steam · модификатор — анкета · бонус — недавние игры</Note>
			</Appear>
		</NrPage>
	)
}
