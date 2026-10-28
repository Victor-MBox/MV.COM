import avatarM from '../../../resources/norandoms/ui/profile-avatar.webp'
import avatarF from '../../../resources/norandoms/ui/profile-avatar-w.webp'
import avatarBot from '../../../resources/norandoms/ui/profile-avatar-bot.webp'
import steamLogo from '../../../resources/norandoms/ui/logo-steam.svg'
import logo from '../../../resources/norandoms/ui/logo.svg'
import coverCs2 from '../../../resources/norandoms/ui/game-cs2.webp'
import coverDota from '../../../resources/norandoms/ui/game-dota2.webp'
import coverValheim from '../../../resources/norandoms/ui/game-valheim.webp'
import coverRepo from '../../../resources/norandoms/ui/game-repo.webp'
import coverTerraria from '../../../resources/norandoms/ui/game-terraria.webp'

/**
 * Картинки и справочники настоящего интерфейса NoRandoms в сценах: стандартные аватары продукта (парень / девушка / бот),
 * логотипы, обложки игр со Steam CDN (как на сайте). Компоненты — base.tsx, cards.tsx, pages.tsx, room.tsx, parties.tsx
 */
export const IMG = {
	avatarM,
	avatarF,
	avatarBot,
	steamLogo,
	logo,
	covers: { cs2: coverCs2, dota2: coverDota, valheim: coverValheim, repo: coverRepo, terraria: coverTerraria },
} as const

export type CoverKey = keyof typeof IMG.covers

export type Gender = 'male' | 'female' | 'minor'

export type Person = {
	name: string
	gender: Gender
	/** Аватар: стандартные картинки продукта по полу; bot — для третьего лица */
	avatar?: 'm' | 'f' | 'bot'
}

export const avatarOf = (p: Person) => (p.avatar === 'bot' ? IMG.avatarBot : p.avatar === 'f' || p.gender === 'female' ? IMG.avatarF : IMG.avatarM)

/** Статус присутствия на сайте — точка и подпись, как в tm-card__strip-site */
export type Presence = 'online' | 'recent' | 'offline'
export const PRESENCE_LABEL: Record<Presence, string> = { online: 'В сети', recent: 'Был 14 мин назад', offline: 'Был 2 ч назад' }
