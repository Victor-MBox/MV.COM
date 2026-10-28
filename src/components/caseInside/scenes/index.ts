import type { ComponentType } from 'react'
import type { InsideSceneKey } from '../../../data/caseInside'
import type { SceneProps } from './types'
import ProblemScene from './ProblemScene'
import FiltersScene from './FiltersScene'
import MatchScene from './MatchScene'
import SeoScene from './SeoScene'
import PartyScene from './PartyScene'
import LiveScene from './LiveScene'
import SteamScene from './SteamScene'
import MobileScene from './MobileScene'

/** Живые сцены по ключу главы (data/caseInside.ts) */
export const SCENES: Record<InsideSceneKey, ComponentType<SceneProps>> = {
	problem: ProblemScene,
	filters: FiltersScene,
	match: MatchScene,
	seo: SeoScene,
	party: PartyScene,
	live: LiveScene,
	steam: SteamScene,
	mobile: MobileScene,
}
