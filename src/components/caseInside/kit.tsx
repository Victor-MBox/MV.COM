import type { CSSProperties, ReactNode } from 'react'
import { motion, useTransform } from 'framer-motion'
import type { MotionValue } from 'framer-motion'

/**
 * Примитивы живого интерфейса NoRandoms для сцен (стили — nr.scss): визуальный язык продукта — тёмно-синий фон,
 * зелёный акцент, жёлтые кнопки со срезанными углами. Это иллюстрация механик, а не копия вёрстки продукта:
 * аватары — цветные круги с инициалами, тексты — настоящие подписи с сайта
 */

type AppearProps = {
	p: MotionValue<number>
	/** Прогресс главы, с которого элемент появляется */
	at: number
	/** Длина появления в долях прогресса */
	span?: number
	/** Сдвиг снизу, px */
	y?: number
	/** Прогресс, после которого элемент исчезает */
	until?: number
	className?: string
	style?: CSSProperties
	children: ReactNode
}

/** Элемент появляется на прогрессе `at` (и исчезает после `until`) — без React-перерисовок */
export function Appear({ p, at, span = 0.05, y = 10, until, className, style, children }: AppearProps) {
	const o = useTransform(p, v => {
		const a = Math.min(1, Math.max(0, (v - at) / span))
		if (until === undefined) return a
		const b = 1 - Math.min(1, Math.max(0, (v - until) / span))
		return Math.min(a, b)
	})
	const ty = useTransform(o, v => (1 - v) * y)
	return (
		<motion.div className={className} style={{ ...style, opacity: o, y: ty }}>
			{children}
		</motion.div>
	)
}

const ICONS = {
	home: 'M4 11l8-7 8 7v9a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z',
	gamepad: 'M7 7h10a5 5 0 0 1 5 5v1a4 4 0 0 1-7 2.6H9A4 4 0 0 1 2 13v-1a5 5 0 0 1 5-5zm1 3v2H6v2h2v2h2v-2h2v-2h-2v-2zm8 1a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm-2 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z',
	userPlus: 'M10 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7 8a7 7 0 0 1 14 0zm15-10v-2h2v2h2v2h-2v2h-2v-2h-2v-2z',
	users: 'M8 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm8 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM2 19a6 6 0 0 1 12 0zm13 0a5 5 0 0 1 7 0z',
	mic: 'M12 15a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3zm-6-3h2a4 4 0 0 0 8 0h2a6 6 0 0 1-5 5.9V21h-2v-3.1A6 6 0 0 1 6 12z',
	bell: 'M12 22a2 2 0 0 0 2-2h-4a2 2 0 0 0 2 2zm6-6V11a6 6 0 0 0-5-5.9V4a1 1 0 0 0-2 0v1.1A6 6 0 0 0 6 11v5l-2 2v1h16v-1z',
	check: 'M5 12.5l4.5 4.5L19 7.5l-1.5-1.5-8 8-3-3z',
	cross: 'M6.5 5L12 10.5 17.5 5 19 6.5 13.5 12l5.5 5.5-1.5 1.5-5.5-5.5L6.5 19 5 17.5l5.5-5.5L5 6.5z',
	chevron: 'M6 9l6 6 6-6',
	lock: 'M7 10V8a5 5 0 0 1 10 0v2h1a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9a1 1 0 0 1 1-1zm2 0h6V8a3 3 0 0 0-6 0z',
	send: 'M3 11l18-8-6 18-3-7z',
	search: 'M10 4a6 6 0 1 1 0 12 6 6 0 0 1 0-12zm0 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm8.5 13L14 14.5l1.5-1.5 4.5 4.5z',
	filter: 'M4 6h16v2H4zm3 5h10v2H7zm3 5h4v2h-4z',
	bars: 'M4 14h3v6H4zm6-4h3v10h-3zm6-5h3v15h-3z',
	steam: 'M12 2a10 10 0 0 0-10 9.1l5.4 2.2a2.8 2.8 0 0 1 1.6-.5l2.4-3.5v-.1a3.8 3.8 0 1 1 3.8 3.8h-.1l-3.4 2.5v.1a2.8 2.8 0 0 1-5.6.3L2.2 14.3A10 10 0 1 0 12 2zm-4.1 15.7a2.1 2.1 0 0 0 1.9-3.8l-1.3-.5a1.6 1.6 0 0 1 1.3 2.9 1.6 1.6 0 0 1-2.1-.6zm9.2-8.4a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0zm-4.4 0a1.9 1.9 0 1 0 3.8 0 1.9 1.9 0 0 0-3.8 0z',
	telegram: 'M21 4L2.5 11.2c-.8.3-.8.8-.1 1l4.7 1.5 1.8 5.6c.2.6.4.8.9.8.4 0 .6-.2.9-.5l2.3-2.2 4.7 3.5c.9.5 1.5.2 1.7-.8L22 5.3c.3-1.2-.4-1.8-1-1.3zM8.3 13.2l9.4-5.9c.5-.3.9-.1.5.2l-7.7 7-.3 3.2z',
	clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm0 2a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm-1 3h2v5.6l3.5 2-1 1.7L11 13.6z',
	cog: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm8.9 5.4l1.6 1.3-2 3.4-2-.7a7.9 7.9 0 0 1-1.7 1l-.3 2.1h-4l-.3-2.1a7.9 7.9 0 0 1-1.7-1l-2 .7-2-3.4 1.6-1.3a8 8 0 0 1 0-2l-1.6-1.3 2-3.4 2 .7a7.9 7.9 0 0 1 1.7-1l.3-2.1h4l.3 2.1a7.9 7.9 0 0 1 1.7 1l2-.7 2 3.4-1.6 1.3a8 8 0 0 1 0 2z',
	plus: 'M11 5h2v6h6v2h-6v6h-2v-6H5v-2h6z',
	bolt: 'M13 2L4 14h6l-1 8 9-12h-6z',
	globe: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.9 9h-3a15 15 0 0 0-1.3-5.5A8 8 0 0 1 18.9 11zM12 4c1 1.4 1.7 3.9 1.9 7h-3.8c.2-3.1.9-5.6 1.9-7zM5.1 11a8 8 0 0 1 4.3-5.5A15 15 0 0 0 8.1 11zm0 2h3a15 15 0 0 0 1.3 5.5A8 8 0 0 1 5.1 13zM12 20c-1-1.4-1.7-3.9-1.9-7h3.8c-.2 3.1-.9 5.6-1.9 7zm2.6-1.5a15 15 0 0 0 1.3-5.5h3a8 8 0 0 1-4.3 5.5z',
	page: 'M6 2h8l5 5v15H6zm7 2v4h4zM8 12h8v2H8zm0 4h8v2H8z',
} as const

export type IconName = keyof typeof ICONS

export function Icon({ name, size = 16, className }: { name: IconName; size?: number; className?: string }) {
	const stroke = name === 'chevron'
	return (
		<svg
			className={['nr-ico', className ?? ''].filter(Boolean).join(' ')}
			viewBox='0 0 24 24'
			width={size}
			height={size}
			aria-hidden='true'
			fill={stroke ? 'none' : 'currentColor'}
			stroke={stroke ? 'currentColor' : undefined}
			strokeWidth={stroke ? 2 : undefined}
			strokeLinecap='round'
			strokeLinejoin='round'
		>
			<path d={ICONS[name]} />
		</svg>
	)
}

const RAIL: IconName[] = ['home', 'gamepad', 'userPlus', 'users']

/** Боковая навигация продукта: четыре раздела, активный — подсвечен */
export function Rail({ active }: { active: number }) {
	return (
		<div className='nr-rail'>
			<span className='nr-logo'>
				No<b>R</b>
			</span>
			{RAIL.map((name, i) => (
				<span className={`nr-rail__item${i === active ? ' is-on' : ''}`} key={name}>
					<Icon name={name} size={18} />
				</span>
			))}
		</div>
	)
}

/** Цвета аватаров — без фотографий: круг с инициалами */
const TONES = ['#2f6df6', '#d64bb2', '#f2a93b', '#2fbf8f', '#8c5cf6', '#e8574b', '#3bb4d6'] as const

type AvatarProps = {
	name: string
	tone?: number
	size?: number
	/** Зелёное кольцо онлайна */
	ring?: boolean
	/** Пульс кольца — говорит в голосе */
	talk?: boolean
	className?: string
	style?: CSSProperties
}

export function Avatar({ name, tone = 0, size = 32, ring, talk, className, style }: AvatarProps) {
	const letters = name
		.split(/\s+/)
		.map(s => s[0])
		.slice(0, 2)
		.join('')
		.toUpperCase()
	const cn = ['nr-avatar', ring ? 'nr-avatar--ring' : '', talk ? 'nr-avatar--talk' : '', className ?? ''].filter(Boolean).join(' ')
	return (
		<span className={cn} style={{ ...style, width: size, height: size, fontSize: Math.round(size * 0.36), background: TONES[tone % TONES.length] }}>
			{letters}
		</span>
	)
}

type TagProps = { children: ReactNode; tone?: 'green' | 'yellow' | 'muted' | 'red'; icon?: IconName; className?: string }

/** Метка в карточке: «Публичная пати», «ПК», «🎤 Обязательно» */
export function Tag({ children, tone, icon, className }: TagProps) {
	return (
		<span className={['nr-tag', tone ? `nr-tag--${tone}` : '', className ?? ''].filter(Boolean).join(' ')}>
			{icon && <Icon name={icon} size={12} />}
			{children}
		</span>
	)
}

type BtnProps = { children: ReactNode; tone?: 'yellow' | 'green' | 'outline' | 'ghost'; pressed?: boolean; icon?: IconName; className?: string; small?: boolean }

/** Кнопка продукта со срезанными углами */
export function Btn({ children, tone = 'yellow', pressed, icon, className, small }: BtnProps) {
	const cn = ['nr-btn', `nr-btn--${tone}`, pressed ? 'is-pressed' : '', small ? 'nr-btn--small' : '', className ?? ''].filter(Boolean).join(' ')
	return (
		<span className={cn}>
			{icon && <Icon name={icon} size={14} />}
			{children}
		</span>
	)
}

type SelectProps = { label: string; value?: string; className?: string }

/** Выпадающий фильтр: пустой — подпись и шеврон; с value — зелёная рамка и выбранное значение */
export function Select({ label, value, className }: SelectProps) {
	return (
		<span className={['nr-select', value ? 'is-set' : '', className ?? ''].filter(Boolean).join(' ')}>
			<span className='nr-select__label'>{value ? label : label}</span>
			{value && <span className='nr-select__value'>{value}</span>}
			<Icon name={value ? 'cross' : 'chevron'} size={12} className='nr-select__chev' />
		</span>
	)
}

/** Курсор-стрелка, который едет по сцене: позиция — MotionValue x/y в пикселях холста */
export function Cursor({ x, y, opacity, click }: { x: MotionValue<number>; y: MotionValue<number>; opacity: MotionValue<number>; click?: boolean }) {
	return (
		<motion.span className={`nr-cursor${click ? ' is-click' : ''}`} style={{ x, y, opacity }} aria-hidden='true'>
			<svg viewBox='0 0 24 24' width='22' height='22'>
				<path d='M4 2l16 10.5-7 1.6 4.2 7.4-2.9 1.6-4.2-7.5L5 20z' fill='#fff' stroke='#111' strokeWidth='1.2' strokeLinejoin='round' />
			</svg>
		</motion.span>
	)
}

/** Подпись моно поверх сцены: «запрос», «событие» — как комментарий разработчика */
export function Note({ children, className, tone }: { children: ReactNode; className?: string; tone?: 'accent' }) {
	return <span className={['nr-note', tone ? `nr-note--${tone}` : '', className ?? ''].filter(Boolean).join(' ')}>{children}</span>
}
