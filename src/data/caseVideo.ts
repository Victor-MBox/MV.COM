import type { MetricKey } from './projects'

/**
 * Видео-рассказ страницы кейса (ТЗ `docs/norandoms-scroll-video-spec.md`, 28.10.2026; обобщён для второго кейса —
 * `docs/rgs-case-page-spec.md`, 29.10.2026): общие типы и сборка из `timeline.json` ролика. Данные проектов — по файлу
 * на проект: `caseVideoNorandoms.ts`, `caseVideoRgs.ts`.
 *
 * Ролик — готовый материал владельца без текста в кадре: объяснения живут только в данных. Тайминги глав, ключевые кадры
 * и моменты (`beats`) — из `timeline.json` ролика: импорт, а не перепечатка. В данных проекта — только тексты и привязка
 * маркеров к моментам. Маркер описывает то, что в этот момент видно в кадре; его `beat` — секунда момента из
 * `timeline.json` (тест сверяет). Чисел в текстах глав нет — они в счётчиках (значения из `metrics` проекта) и в финале
 */

/** Маркер «что сейчас в кадре»: зажигается к секунде `beat` и гаснет при прокрутке назад */
export type VideoMarker = { beat: number; text: string }

/**
 * Счётчик главы со счётчиками (у NoRandoms — SEO, у «ЖК Несчастье» — финал): показатель проекта по ключу (значение
 * хранится только в `Project.metrics`) и отрезок видео в секундах, на котором он считается от нуля до значения
 */
export type VideoCounter = { metric: MetricKey; from: number; to: number }

/** Тексты главы (§7 ТЗ): метка, H2 до шести слов, абзацы до 300 знаков вместе, 2–4 маркера до 80 знаков */
export type VideoChapterCopy = {
	/** Метка `// 05 · пати` — номер подставляется по порядку */
	label: string
	title: string
	text: string[]
	markers?: VideoMarker[]
	/** Стек чипами: появляются по одному с секунды `beat` */
	stack?: { items: string[]; beat: number }
	counters?: VideoCounter[]
	/** Подпись под счётчиками */
	countersNote?: string
	/** Финал: кнопки «Открыть сайт ↗» (только при `link` проекта) и «Обсудить похожий проект» */
	final?: boolean
}

export type VideoChapter = VideoChapterCopy & {
	/** Ключ главы из `timeline.json` */
	key: string
	/** Отрезок видео в секундах */
	start: number
	end: number
	/** Кадр главы: заглушка до загрузки видео, режим без анимаций, ошибка видео */
	keyframe: string
}

export type VideoSources = {
	/** Основной файл: ключевой кадр раз в 0,5 с */
	desktop: string
	/** Облегчённый для медленной сети (2g/3g): ключевой кадр реже */
	light: string
	/** 720×900 для экранов ≤992 px и режима экономии трафика */
	mobile: string
}

/** Темп прокрутки: высота главы = длительность её отрезка × `desktop` (на ≤992 — × `mobile`) vh на секунду видео, в пределах `min`…`max` vh */
export type VideoPace = { desktop: number; mobile: number; min: number; max: number }

export type CaseVideo = {
	/** Подпись видео для диктора (role="img"): в кадре только интерфейс, смысл — в тексте глав */
	label: string
	sources: VideoSources
	/** Кадр до загрузки */
	poster: string
	/** Фон карточки видео — цвет краёв ролика: без полос на скруглении, пока кадр грузится */
	background: string
	duration: number
	fps: number
	width: number
	height: number
	/** Подбирает владелец: 18 vh/с на десктопе ≈ 17 экранов прокрутки на 90 с ролика */
	pace: VideoPace
	chapters: VideoChapter[]
}

/** `timeline.json` ролика: размер и длительность, главы с моментами `beats` (поле `screen` — описание для разработчика) */
export type VideoTimeline = {
	video: { duration: number; fps: number; size: number[] }
	chapters: { key: string; start: number; end: number; keyframe: string; beats: { t: number; screen?: string }[] }[]
}

type VideoInput = {
	timeline: VideoTimeline
	/** Тексты глав по `key` из `timeline.json` */
	copy: Record<string, VideoChapterCopy>
	sources: VideoSources
	poster: string
	/**
	 * Ключевые кадры — результат `import.meta.glob` папки `keyframes/` проекта (глоб принимает только строковый литерал,
	 * поэтому он у каждого файла данных свой); кадр главы ищется по пути из `timeline.json`
	 */
	keyframes: Record<string, string>
	label: string
	background: string
	pace: VideoPace
}

/** Видео-рассказ из `timeline.json` ролика: главы и их отрезки — из файла, тексты — по `key`, кадры — по пути из файла */
export function videoFromTimeline({ timeline, copy, sources, poster, keyframes, label, background, pace }: VideoInput): CaseVideo {
	const frames = Object.entries(keyframes)
	return {
		label,
		sources,
		poster,
		background,
		duration: timeline.video.duration,
		fps: timeline.video.fps,
		width: timeline.video.size[0],
		height: timeline.video.size[1],
		pace,
		chapters: timeline.chapters.map(c => {
			const text = copy[c.key]
			if (!text) throw new Error(`Нет текста главы «${c.key}» из timeline.json`)
			return {
				key: c.key,
				start: c.start,
				end: c.end,
				keyframe: frames.find(([path]) => path.endsWith(`/${c.keyframe}`))?.[1] ?? '',
				...text,
			}
		}),
	}
}
