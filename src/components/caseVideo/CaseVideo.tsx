import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import Button from '../button/Button'
import Chip from '../chip/Chip'
import { NBSP, formatStat } from '../stat/formatStat'
import type { StatRange } from '../stat/formatStat'
import { pad2 } from '../caseStory/storyMath'
import { useContactModal } from '../contactModal/ContactModalContext'
import { isPublic } from '../../data/projects'
import type { ProjectMetric } from '../../data/projects'
import type { CaseVideo as Video, VideoChapter } from '../../data/caseVideo'
import { MQ, useMediaQuery } from '../../hooks/useMediaQuery'
import {
	chapterAt,
	chapterProgress,
	copyShift,
	countUp,
	etaSeconds,
	follow,
	formatEta,
	formatMb,
	frameTime,
	loadShare,
	markerState,
	needsSeek,
	nextSpeed,
	pickSource,
	timeAt,
} from './videoMath'
import './CaseVideo.scss'

type Props = {
	video: Video
	/** Название проекта — для подписи секции «Как устроен …» */
	title: string
	/** Подтверждённые показатели проекта: из них счётчики главы со счётчиками берут значения по ключу */
	metrics: ProjectMetric[]
	/** Адрес продукта для кнопки финала «Открыть сайт ↗»; без него в финале только «Обсудить похожий проект» */
	link?: string
}

/** Линия активации главы на десктопе — середина окна; на ≤992 — сразу под залипшим видео */
const LINE = 0.5
const LINE_GAP = 20
/** Запас под текстом главы до низа окна: длиннее — текст доезжает вверх по ходу главы */
const COPY_GAP = 16
/** Чипы стека появляются по одному с таким шагом, секунды ролика */
const CHIP_STEP = 0.15
/** Подгрузка видео — когда до секции меньше полутора экранов */
const PRELOAD_MARGIN = '150% 0px 150% 0px'
/** Заглушка загрузки появляется, только если ролик не пришёл за это время (из кеша браузера — без мигания), мс */
const LOADER_DELAY = 350
/** Шаг обновления процентов и оставшегося времени, мс */
const LOAD_PAINT_STEP = 250
/** Оставшееся время показываем после стольких мс загрузки: первые замеры скорости ещё включают задержку сети */
const ETA_AFTER = 700
/** Событие на <video>: ролик не скачался — секция переходит на ключевые кадры */
const FAIL_EVENT = 'casevideo:fail'

type Connection = { saveData?: boolean; effectiveType?: string }

/** iPhone и iPad (в том числе iPadOS с «настольным» user agent) */
const isIOS = () => /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1)

/** Счётчики главы: показатели проекта по ключу, только подтверждённые (скрытый «91%» сюда не попадает) */
function chapterCounters(c: VideoChapter, metrics: ProjectMetric[]) {
	return (c.counters ?? []).flatMap(cn => {
		const m = metrics.find(x => x.key === cn.metric)
		return m && isPublic(m) ? [{ ...cn, m }] : []
	})
}

/** Верх элемента от начала документа без учёта transform предков */
function docTop(node: HTMLElement) {
	let y = 0
	for (let n: HTMLElement | null = node; n; n = n.offsetParent as HTMLElement | null) y += n.offsetTop
	return y
}

/** Тире не начинает строку: неразрывный пробел перед ним (заголовок «Одно событие — пять каналов» с text-wrap: balance) */
const nbDash = (s: string) => s.replace(/ —/g, `${NBSP}—`)

const encodeValue = (v: number | StatRange) => (typeof v === 'number' ? String(v) : v.join(','))
const decodeValue = (s: string): number | StatRange => {
	const [a, b] = s.split(',').map(Number)
	return b === undefined ? a : [a, b]
}

/**
 * Видео-рассказ кейса (ТЗ docs/norandoms-scroll-video-spec.md): главы текстом слева, справа залипшее видео 4:5, которое
 * прокрутка двигает вперёд и назад кадр в кадр. Всё считается от одного времени сюжета t (секунды ролика) в одном
 * requestAnimationFrame-цикле: прокрутка → t (линия активации, доля главы, `timeAt`) → догон показанного времени →
 * кадр видео (`currentTime`, без очереди перемоток), активная глава, маркеры «что в кадре», счётчики (у NoRandoms — в главе
 * SEO, у «ЖК Несчастье» — в финале), подпись и полоса
 * прогресса. Высоту прокрутки задают пустые шаги `__ch`, а текст всех глав сложен в одну залипшую панель: на границе
 * главы прежний текст уходит и гаснет, новый проявляется построчно (CSS по классам is-past / is-active / is-future —
 * направление учитывается само), тексты не встречаются на экране. Состояние не проходит через React: цикл пишет классы,
 * CSS-переменные и текст сам, только при изменении. Видео никогда не играет само.
 *
 * Загрузка (30.10.2026, правка владельца: ролик подгружался кусками, при быстрой прокрутке кадр застывал без всякого
 * знака): за полтора экрана до секции файл скачивается целиком через fetch и подставляется в <video> как blob — перемотка
 * идёт из памяти и не ждёт сеть. Пока файл качается, на месте видео — ключевой кадр текущей главы под размытием и
 * заглушка: кольцо с процентами, «осталось ≈ N с» по скорости загрузки и мегабайты (появляется через 350 мс — из кеша
 * браузера ролик приходит без мигания). Прокрутка всё это время ведёт текст глав и меняет размытые кадры.
 * reduced-motion и ошибка загрузки — ключевые кадры с кроссфейдом, маркеры и счётчики в итоге.
 * Проект задаёт только данные: ролик и тексты (`Project.video`), фон карточки видео (`video.background` — цвет краёв
 * ролика), название для подписи секции и показатели для счётчиков
 */
export default function CaseVideo({ video, title, metrics, link }: Props) {
	const rootRef = useRef<HTMLElement>(null)
	const videoRef = useRef<HTMLVideoElement>(null)
	const reduced = useMediaQuery(MQ.reduced)
	const stacked = useMediaQuery(MQ.tablet)
	/** Ролик не скачался: эффект прокрутки при перезапуске (смена ширины) сразу идёт в режим ключевых кадров */
	const failedRef = useRef(false)
	const { open } = useContactModal()
	const total = video.chapters.length

	useEffect(() => {
		const root = rootRef.current
		const el = videoRef.current
		if (!root || !el) return
		const q = <T extends HTMLElement>(sel: string) => root.querySelector<T>(sel)
		const stage = q('.caseVideo__stage')
		const capNum = q('.caseVideo__capNum')
		const capText = q('.caseVideo__capText')
		const bar = q('.caseVideo__bar')
		if (!stage || !capNum || !capText || !bar) return

		const panel = q('.caseVideo__panel')
		if (!panel) return
		const spans = video.chapters
		// Шаги прокрутки: высота главы по длине её отрезка видео — по ним считается время
		const steps = Array.from(root.querySelectorAll<HTMLElement>('[data-ch]'))
		// Тексты глав в панели
		const chapters = Array.from(root.querySelectorAll<HTMLElement>('[data-copy]')).map(node => ({
			node,
			body: node.querySelector<HTMLElement>('.caseVideo__body'),
			actions: node.querySelector<HTMLElement>('.caseVideo__actions'),
			beats: Array.from(node.querySelectorAll<HTMLElement>('[data-beat]')).map(b => ({ node: b, beat: Number(b.dataset.beat) })),
			counters: Array.from(node.querySelectorAll<HTMLElement>('[data-counter]')).map(c => ({
				node: c,
				num: c.querySelector<HTMLElement>('.caseVideo__live'),
				from: Number(c.dataset.from),
				to: Number(c.dataset.to),
				value: decodeValue(c.dataset.value ?? '0'),
				prefix: c.dataset.prefix ?? '',
				suffix: c.dataset.suffix ?? '',
			})),
		}))
		const stills = Array.from(root.querySelectorAll<HTMLImageElement>('[data-still]'))

		// Пишем в DOM только изменившееся: цикл идёт каждый кадр, пока прокрутка и видео не сошлись
		const cache = new Map<HTMLElement, Record<string, string>>()
		const setVar = (node: HTMLElement, name: string, value: string) => {
			let c = cache.get(node)
			if (!c) cache.set(node, (c = {}))
			if (c[name] === value) return
			c[name] = value
			node.style.setProperty(name, value)
		}
		const setText = (node: HTMLElement, value: string) => {
			if (node.textContent !== value) node.textContent = value
		}

		// Геометрия глав — от верха документа; пересчёт на resize, ResizeObserver и после шрифтов, не на каждом кадре
		let tops: number[] = []
		let heights: number[] = []
		let overflow: number[] = []
		let line = 0
		const measure = () => {
			// offsetTop, а не getBoundingClientRect: страница въезжает со сдвигом (App, y 14 → 0), и замер во время
			// анимации навсегда сместил бы время на эти пиксели — например, при возврате «назад» посреди секции
			tops = steps.map(docTop)
			heights = steps.map(n => n.offsetHeight)
			if (stacked) {
				const stageH = stage.offsetHeight
				root.style.setProperty('--stage-h', `${stageH}px`)
				line = (parseFloat(getComputedStyle(stage.parentElement ?? stage).top) || 0) + stageH + LINE_GAP
			} else {
				root.style.removeProperty('--stage-h')
				line = window.innerHeight * LINE
			}
			// Текст выше места под ним (телефон, низкое окно) по ходу главы доезжает вверх — иначе низ не виден
			const room = window.innerHeight - (parseFloat(getComputedStyle(panel).top) || 0) - COPY_GAP
			overflow = chapters.map(c => Math.max(0, (c.body?.offsetHeight ?? 0) - room))
		}

		// Режим: видео или ключевые кадры (reduced-motion, ошибка видео)
		let stillMode = reduced || failedRef.current
		let ready = false
		let wantStill = -1
		root.classList.toggle('is-stills', stillMode)
		root.classList.remove('is-ready')

		/**
		 * Ключевой кадр главы i: грузится при первой надобности вместе с соседними (прокрутка во время загрузки ролика
		 * сменяет их без задержки), сменяет прежний, когда загрузится (без пустого кадра)
		 */
		const showStill = (i: number) => {
			wantStill = i
			const load = (k: number) => {
				const img = stills[k]
				if (img && !img.getAttribute('src') && img.dataset.src) img.src = img.dataset.src
			}
			load(i)
			load(i - 1)
			load(i + 1)
			const img = stills[i]
			if (!img) return
			const swap = () => {
				if (wantStill === i) stills.forEach((s, k) => s.classList.toggle('is-on', k === i))
			}
			if (img.complete && img.naturalWidth) swap()
			else img.addEventListener('load', swap, { once: true })
		}

		let raf = 0
		let shown = -1
		let active = -1

		const render = (t: number) => {
			const at = chapterAt(t, spans)
			if (at.index !== active) {
				const first = active === -1
				active = at.index
				// Смена текста главы — CSS по классам: прежний уходит, новый проявляется построчно; кнопки скрытых глав
				// не получают фокус
				chapters.forEach((c, i) => {
					c.node.classList.toggle('is-active', i === active)
					c.node.classList.toggle('is-past', i < active)
					c.node.classList.toggle('is-future', i > active)
					if (c.actions) c.actions.inert = i !== active
				})
				setText(capNum, `${pad2(active + 1)} / ${pad2(total)}`)
				setText(capText, spans[active].label)
				if (!first && !reduced) capNum.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200, easing: 'ease-out' })
				if (stillMode || !ready) showStill(active)
			}
			chapters.forEach((c, j) => {
				if (c.body && overflow[j]) setVar(c.body, '--shift', `${copyShift(chapterProgress(t, spans[j]), overflow[j]).toFixed(1)}px`)
				c.beats.forEach(b => setVar(b.node, '--on', reduced ? '1' : markerState(t, b.beat).toFixed(3)))
				c.counters.forEach(cn => {
					const v = reduced ? cn.value : countUp(t, cn, cn.value)
					if (cn.num) setText(cn.num, `${cn.prefix}${formatStat(v)}${cn.suffix}`)
					setVar(cn.node, '--on', reduced ? '1' : markerState(t, cn.from).toFixed(3))
				})
			})
			setVar(bar, '--p', chapterProgress(t, spans[active]).toFixed(4))
		}

		/** Кадр видео под время t. true — перемотка ещё идёт, цикл нужен дальше */
		const syncVideo = (t: number) => {
			if (stillMode || !el.getAttribute('src') || el.readyState < 1) return false
			// Пока идёт перемотка, новое время не присваиваем: последнее значение поставится в первом кадре после seeked
			if (el.seeking) return true
			const want = frameTime(t, video.duration, video.fps)
			if (needsSeek(el.currentTime, want)) {
				el.currentTime = want // только currentTime: fastSeek прыгает по ключевым кадрам
				return true
			}
			if (!ready && el.readyState >= 2) {
				ready = true
				root.classList.add('is-ready')
			}
			return false
		}

		const tick = () => {
			raf = 0
			const sy = window.scrollY
			const target = timeAt(
				tops.map((top, i) => ({ top: top - sy, height: heights[i] })),
				line,
				spans
			)
			// Первый кадр (в том числе после перезагрузки или «назад» посреди секции) — сразу на место, без догона
			shown = shown < 0 || reduced ? target : follow(shown, target)
			render(shown)
			const seeking = syncVideo(shown)
			if (shown !== target || seeking) schedule()
		}
		const schedule = () => {
			if (!raf) raf = requestAnimationFrame(tick)
		}
		const onResize = () => {
			measure()
			schedule()
		}

		// iOS Safari перерисовывает кадр после смены currentTime только у видео, которое хоть раз запускалось: один раз
		// play() → pause() после canplay (без звука это разрешено без жеста)
		let unlocked = false
		const onCanPlay = () => {
			if (!unlocked && isIOS()) {
				unlocked = true
				el.play()
					.then(() => el.pause())
					.catch(() => undefined)
					.finally(schedule)
			}
			schedule()
		}
		// Ошибка декодера (src есть) или загрузки (событие FAIL_EVENT) — ключевые кадры
		const onFail = () => {
			stillMode = true
			root.classList.add('is-stills')
			showStill(active < 0 ? 0 : active)
		}
		const onError = () => {
			if (el.getAttribute('src')) onFail()
		}

		el.muted = true
		el.defaultMuted = true
		el.addEventListener('loadedmetadata', schedule)
		el.addEventListener('loadeddata', schedule)
		el.addEventListener('canplay', onCanPlay)
		el.addEventListener('seeked', schedule)
		el.addEventListener('error', onError)
		el.addEventListener(FAIL_EVENT, onFail)
		const ro = new ResizeObserver(onResize)
		ro.observe(root)
		ro.observe(stage)
		window.addEventListener('scroll', schedule, { passive: true })
		window.addEventListener('resize', onResize)
		document.fonts?.ready.then(onResize)
		measure()
		tick()

		return () => {
			cancelAnimationFrame(raf)
			ro.disconnect()
			window.removeEventListener('scroll', schedule)
			window.removeEventListener('resize', onResize)
			el.removeEventListener('loadedmetadata', schedule)
			el.removeEventListener('loadeddata', schedule)
			el.removeEventListener('canplay', onCanPlay)
			el.removeEventListener('seeked', schedule)
			el.removeEventListener('error', onError)
			el.removeEventListener(FAIL_EVENT, onFail)
		}
	}, [video, total, reduced, stacked])

	// Загрузка ролика целиком: за полтора экрана до секции, файл — по ширине и сети. Отдельно от эффекта прокрутки: смена
	// ширины (поворот телефона) перезапускает прокрутку, но не начатую загрузку
	useEffect(() => {
		const root = rootRef.current
		const el = videoRef.current
		if (!root || !el || reduced || failedRef.current) return
		const q = (sel: string) => root.querySelector<HTMLElement>(sel)
		const pctNode = q('.caseVideo__loadPct')
		const titleNode = q('.caseVideo__loadTitle')
		const etaNode = q('.caseVideo__loadEta')
		const sizeNode = q('.caseVideo__loadSize')
		const setText = (node: HTMLElement | null, value: string) => {
			if (node && node.textContent !== value) node.textContent = value
		}

		const ctrl = new AbortController()
		let objectUrl = ''
		let showTimer = 0
		let paintTimer = 0

		const load = async () => {
			const conn = (navigator as Navigator & { connection?: Connection }).connection
			const key = pickSource({ narrow: window.matchMedia(MQ.tablet).matches, saveData: conn?.saveData, effectiveType: conn?.effectiveType })
			const started = performance.now()
			let loaded = 0
			let size = 0
			let speed = 0
			let lastLoaded = 0
			let lastAt = started

			// Проценты, оставшееся время и мегабайты: по таймеру, а не на каждый кусок — пауза сети тоже снижает скорость
			const paint = () => {
				const now = performance.now()
				if (now > lastAt) {
					speed = nextSpeed(speed, ((loaded - lastLoaded) * 1000) / (now - lastAt))
					lastLoaded = loaded
					lastAt = now
				}
				const share = loadShare(loaded, size)
				root.style.setProperty('--load', share.toFixed(3))
				setText(pctNode, size ? `${Math.floor(share * 100)}%` : '')
				const eta = now - started > ETA_AFTER ? etaSeconds(loaded, size, speed) : null
				setText(etaNode, size ? (eta === null ? 'считаю время…' : `осталось ≈${NBSP}${formatEta(eta)}`) : `${formatMb(loaded)}${NBSP}МБ`)
				setText(sizeNode, size ? `${formatMb(loaded)} из ${formatMb(size)}${NBSP}МБ` : '')
			}

			showTimer = window.setTimeout(() => root.classList.add('is-loading'), LOADER_DELAY)
			try {
				const res = await fetch(video.sources[key], { signal: ctrl.signal })
				if (!res.ok || !res.body) throw new Error(`HTTP ${res.status}`)
				size = Number(res.headers.get('Content-Length')) || 0
				root.classList.toggle('is-unsized', !size)
				paint()
				paintTimer = window.setInterval(paint, LOAD_PAINT_STEP)
				const reader = res.body.getReader()
				const chunks: Uint8Array<ArrayBuffer>[] = []
				for (;;) {
					const { done, value } = await reader.read()
					if (done) break
					chunks.push(value)
					loaded += value.byteLength
				}
				window.clearInterval(paintTimer)
				// Кадр видео встанет на место после seeked — до этого заглушка показывает, что всё скачано
				paint()
				root.style.setProperty('--load', '1')
				setText(pctNode, '100%')
				setText(titleNode, 'Видео готово')
				setText(etaNode, '')
				objectUrl = URL.createObjectURL(new Blob(chunks, { type: res.headers.get('Content-Type') || 'video/mp4' }))
				el.preload = 'auto'
				el.src = objectUrl
				el.load()
			} catch {
				if (ctrl.signal.aborted) return
				failedRef.current = true
				el.dispatchEvent(new Event(FAIL_EVENT))
			} finally {
				window.clearInterval(paintTimer)
			}
		}

		const io = new IntersectionObserver(
			entries => {
				if (!entries.some(e => e.isIntersecting)) return
				io.disconnect()
				void load()
			},
			{ rootMargin: PRELOAD_MARGIN }
		)
		io.observe(root)

		// Уход со страницы: прервать загрузку (иначе браузер докачивает десятки мегабайт в фоне) и освободить память ролика
		return () => {
			io.disconnect()
			ctrl.abort()
			window.clearTimeout(showTimer)
			window.clearInterval(paintTimer)
			root.classList.remove('is-loading', 'is-unsized')
			if (el.getAttribute('src')) {
				el.removeAttribute('src')
				el.load()
			}
			if (objectUrl) URL.revokeObjectURL(objectUrl)
		}
	}, [video, reduced])

	const style = {
		'--video-bg': video.background,
		'--pace': `${video.pace.desktop}vh`,
		'--pace-m': `${video.pace.mobile}vh`,
		'--ch-min': `${video.pace.min}vh`,
		'--ch-max': `${video.pace.max}vh`,
	} as CSSProperties

	return (
		<section className='caseVideo' ref={rootRef} style={style} aria-label={`Как устроен ${title}`}>
			<div className='container caseVideo__grid'>
				<div className='caseVideo__chapters'>
					<div className='caseVideo__panel'>
						{video.chapters.map((c, i) => {
							const counters = chapterCounters(c, metrics)
							return (
								<article className={`caseVideo__copy ${i === 0 ? 'is-active' : 'is-future'}`} data-copy={i} key={c.key}>
									<div className='caseVideo__body'>
										<span className='caseVideo__label' data-line='0'>
											{pad2(i + 1)} · {c.label}
										</span>
										<h2 className='caseVideo__title' data-line='1'>
											{nbDash(c.title)}
										</h2>
										<div className='caseVideo__text' data-line='2'>
											{c.text.map(p => (
												<p key={p}>{nbDash(p)}</p>
											))}
										</div>

										{c.stack && (
											<ul className='caseVideo__chips' aria-label='Стек' data-line='3'>
												{c.stack.items.map((s, k) => (
													<li key={s} data-beat={(c.stack!.beat + k * CHIP_STEP).toFixed(2)}>
														<Chip>{s}</Chip>
													</li>
												))}
											</ul>
										)}

										{c.markers && (
											<ul className='caseVideo__markers' aria-label='Что в кадре' data-line='3'>
												{c.markers.map(m => (
													<li key={m.text} data-beat={m.beat}>
														<i aria-hidden='true' />
														<span>{nbDash(m.text)}</span>
													</li>
												))}
											</ul>
										)}

										{counters.length > 0 && (
											<div data-line='3'>
												<ul className='caseVideo__counters' aria-label='Результаты в цифрах'>
													{counters.map(({ m, from, to }) => {
														// Префикс «≈» — у «ЖК Несчастье»; у NoRandoms префиксов нет
														const final = `${m.prefix ?? ''}${formatStat(m.value)}${m.suffix ?? ''}`
														return (
															<li
																key={m.label}
																data-counter=''
																data-from={from}
																data-to={to}
																data-value={encodeValue(m.value)}
																data-prefix={m.prefix ?? ''}
																data-suffix={m.suffix ?? ''}
															>
																<span className='caseVideo__num' aria-hidden='true'>
																	<span className='caseVideo__ghost'>{final}</span>
																	<span className='caseVideo__live'>{final}</span>
																</span>
																<span className='srOnly'>{final}</span>
																<span className='caseVideo__cLabel'>{m.label}</span>
															</li>
														)
													})}
												</ul>
												{c.countersNote && <p className='caseVideo__note'>{c.countersNote}</p>}
											</div>
										)}

										{c.final && (
											<div className='caseVideo__actions' data-line='3'>
												{link && (
													<Button href={link} arrow arrowGlyph='↗'>
														Открыть сайт
													</Button>
												)}
												<Button variant='secondary' onClick={() => open()}>
													Обсудить похожий проект
												</Button>
											</div>
										)}
									</div>
								</article>
							)
						})}
					</div>
					<div className='caseVideo__steps' aria-hidden='true'>
						{video.chapters.map((c, i) => (
							<div className='caseVideo__ch' data-ch={i} key={c.key} style={{ '--dur': c.end - c.start } as CSSProperties} />
						))}
					</div>
				</div>

				<div className='caseVideo__stageCol'>
					<div className='caseVideo__stage'>
						<div className='caseVideo__media'>
							<div className='caseVideo__frame' role='img' aria-label={video.label}>
								<video
									ref={videoRef}
									className='caseVideo__video'
									width={video.width}
									height={video.height}
									poster={video.poster}
									preload='none'
									muted
									playsInline
									disablePictureInPicture
									disableRemotePlayback
									tabIndex={-1}
									aria-hidden='true'
								/>
								<div className='caseVideo__stills' aria-hidden='true'>
									{video.chapters.map((c, i) => (
										<img
											key={c.key}
											className='caseVideo__still'
											data-still={i}
											data-src={c.keyframe}
											alt=''
											width={video.width}
											height={video.height}
											decoding='async'
											draggable={false}
										/>
									))}
								</div>
								{/* Заглушка загрузки: видна, пока ролик качается (is-loading), гаснет, когда кадр видео готов */}
								<div className='caseVideo__loader' aria-hidden='true'>
									<span className='caseVideo__ring'>
										<svg viewBox='0 0 64 64'>
											<circle className='caseVideo__ringTrack' cx='32' cy='32' r='28' pathLength={100} />
											<circle className='caseVideo__ringBar' cx='32' cy='32' r='28' pathLength={100} />
										</svg>
										<b className='caseVideo__loadPct'>0%</b>
									</span>
									<span className='caseVideo__loadTitle'>Видео загружается</span>
									<span className='caseVideo__loadEta'>считаю время…</span>
									<span className='caseVideo__loadSize' />
								</div>
							</div>
							<p className='caseVideo__caption' aria-hidden='true'>
								<b className='caseVideo__capNum'>
									01 / {pad2(total)}
								</b>
								<span className='caseVideo__capText'>{video.chapters[0]?.label}</span>
							</p>
							<div className='caseVideo__progress' aria-hidden='true'>
								<i className='caseVideo__bar' />
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
