import type { ReactNode } from 'react'
import { NrGameCard, NrHeroActions, NrLogo, NrPlayerCard, NrVoiceBenefit } from './norandoms/elements'
import { RgsCoin, RgsConsultant, RgsFlag, RgsGift, RgsLogo, RgsPanel, RgsReplica } from './rgs/elements'
// Стили живого norandoms.team (собраны `node scripts/nr-product-css.mjs --cover`) и поправки под холст
import './norandoms/nr-cover.css'
import './norandoms/cover.scss'
// Десктопные стили игры «ЖК Несчастье», перенесённые вручную
import './rgs/cover.scss'

/** Холсты сцены 16:10 в px продукта: элементы стоят в своих настоящих размерах, холст целиком масштабируется под сцену */
export const PREVIEW_CANVAS = {
	desktop: { w: 720, h: 450 },
	phone: { w: 400, h: 250 },
} as const

/** Набор элементов обложки: живая вёрстка продукта вместо скриншотов — текст и иконки чёткие при любом масштабе */
export type PreviewKit = {
	/** Классы холста: корень стилей продукта */
	className: string
	/**
	 * Шрифты продукта — параметры Google Fonts css2 без `text=`: FloatingPreview догружает только буквы, которые есть
	 * на холсте (несколько КБ вместо полных семейств)
	 */
	fonts?: string
	/** Элементы по ключу `PreviewLayer.element`; все декоративные — без ссылок и действий (вся карточка — ссылка) */
	elements: Record<string, ReactNode>
}

export const PREVIEW_KITS = {
	norandoms: {
		className: 'nr-cover',
		fonts: 'family=Science+Gothic:wght@100..900&family=M+PLUS+Rounded+1c:wght@400;500;600;700;800',
		elements: {
			logo: <NrLogo />,
			benefit: <NrVoiceBenefit />,
			game: <NrGameCard />,
			player: <NrPlayerCard />,
			actions: <NrHeroActions />,
		},
	},
	// Игра «ЖК Несчастье» для Росгосстраха (ТЗ docs/rgs-case-page-spec.md §6): текст игры — Golos Text
	rgs: {
		className: 'rgs-cover',
		fonts: 'family=Golos+Text:wght@400;500',
		elements: {
			flag: <RgsFlag />,
			gift: <RgsGift />,
			consultant: <RgsConsultant />,
			replica: <RgsReplica />,
			logo: <RgsLogo />,
			panel: <RgsPanel />,
			coin: <RgsCoin />,
		},
	},
} satisfies Record<string, PreviewKit>

export type PreviewKitKey = keyof typeof PREVIEW_KITS
