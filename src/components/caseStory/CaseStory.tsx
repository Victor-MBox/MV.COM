import { useEffect, useRef } from 'react'
import Chip from '../chip/Chip'
import Stat from '../stat/Stat'
import { formatStat } from '../stat/formatStat'
import { LAPTOP, PHONE, screenStyle } from '../../data/devices'
import type { CaseStory as Story, StoryHighlight } from '../../data/caseStory'
import type { ProjectMetric } from '../../data/projects'
import { MQ, useMediaQuery } from '../../hooks/useMediaQuery'
import {
	activeChapter,
	cameraTransform,
	clamp,
	easeInOut,
	fitCamera,
	inRange,
	lerp,
	pad2,
	rangeProgress,
	restCamera,
} from './storyMath'
import type { Camera } from './storyMath'
import './CaseStory.scss'

type Props = {
	story: Story
	/** Подтверждённые показатели кейса — в главе с `metrics` */
	metrics: ProjectMetric[]
	stack: string[]
}

/** Доля пути до цели за кадр: прокрутка внутри экранов и телефона */
const FOLLOW = 0.14
/** Камера ноутбука догоняет цель медленнее — наезд читается как движение камеры, а не рывок */
const CAM_FOLLOW = 0.1
/** reduced-motion: у активной главы один статичный кадр — состояние на трёх четвертях главы */
const REDUCED_P = 0.75
/** Колонка контента продукта начинается после липкого сайдбара */
const SIDEBAR = 270
/** Линия активации главы: середина окна на десктопе; на ≤992 — сразу под залипшим телефоном */
const LINE_DESKTOP = 0.5
const LINE_GAP = 24

function Highlight({ h, id }: { h: StoryHighlight; id: string }) {
	const cn = ['caseStory__hl', h.ring ? 'caseStory__hl--ring' : '', h.below ? 'caseStory__hl--below' : '', h.left ? 'caseStory__hl--left' : '']
		.filter(Boolean)
		.join(' ')
	return (
		<div className={cn} data-hl={id} style={{ left: h.x, top: h.y, width: h.w, height: h.h }} aria-hidden='true'>
			<span>{h.label}</span>
		</div>
	)
}

/**
 * Сюжет кейса (прототип от 22.10.2026, бриф `docs/prototypes/norandoms-case-story/README.md`): главы текстом слева, справа
 * залипшая сцена — мокап ноутбука с экранами продукта и телефон, который выезжает поверх на главе про мобильную версию.
 * Состояние считается от прокрутки в requestAnimationFrame: активная глава — та, чей верх прошёл линию активации,
 * прогресс p — доля главы за линией. По p: какой экран показан и докуда прокручен его контент (догоняет цель на 14 %
 * за кадр), какая подсветка видна, камера ноутбука наезжает на область (`camera`), курсор едет к кнопке и раскрывает
 * панель (`click`), телефон листает свой экран. Цикл живёт, пока значения не сошлись; его будят scroll и resize.
 * На ≤992 ноутбук скрыт, телефон — единственное устройство над главами (`phoneMobile`). При reduced-motion
 * у каждой главы статичный кадр без догоняния и переходов. Сцена — role="img" с подписью, текст глав — обычный HTML
 */
export default function CaseStory({ story, metrics, stack }: Props) {
	const rootRef = useRef<HTMLElement>(null)
	const reduced = useMediaQuery(MQ.reduced)
	const stacked = useMediaQuery(MQ.tablet)

	useEffect(() => {
		const root = rootRef.current
		if (!root) return
		const q = (sel: string) => root.querySelector<HTMLElement>(sel)
		const stage = q('.caseStory__stage')
		const lapWrap = q('.caseStory__lapWrap')
		const lapScreen = q('.caseStory__lapScreen')
		const lapCanvas = q('.caseStory__lapCanvas')
		const phone = q('.caseStory__phone')
		const phoneScreen = q('.caseStory__phoneScreen')
		const phoneCanvas = q('.caseStory__phoneCanvas')
		const phoneMove = q('.caseStory__phoneMove')
		const capNum = q('.caseStory__capNum')
		const capText = q('.caseStory__capText')
		const bar = q('.caseStory__bar')
		if (!stage || !lapWrap || !lapScreen || !lapCanvas || !phone || !phoneScreen || !phoneCanvas || !phoneMove || !capNum || !capText || !bar) return

		const chapters = Array.from(root.querySelectorAll<HTMLElement>('[data-chapter]'))
		const screens = new Map(
			story.screens.map(s => {
				const el = root.querySelector<HTMLElement>(`[data-screen="${s.key}"]`)
				return [s.key, { el, move: el?.querySelector<HTMLElement>('.caseStory__move') ?? null, cur: 0, target: 0 }]
			})
		)
		const hls = Array.from(root.querySelectorAll<HTMLElement>('[data-hl]')).map(el => {
			const [ci, hi] = (el.dataset.hl ?? '0-0').split('-').map(Number)
			return { el, ci, h: story.chapters[ci]?.highlights?.[hi] }
		})
		const clicks = Array.from(root.querySelectorAll<HTMLElement>('[data-click]')).map(el => ({
			ci: Number(el.dataset.click),
			panel: el.querySelector<HTMLElement>('.caseStory__panel'),
			cursor: el.querySelector<HTMLElement>('.caseStory__cursor'),
		}))
		const { canvas } = LAPTOP
		const follow = reduced ? 1 : FOLLOW
		const camFollow = reduced ? 1 : CAM_FOLLOW
		const total = story.chapters.length

		let raf = 0
		let activeIndex = -1
		let activeScreen = ''
		let clicked = false
		let cam: Camera = restCamera(canvas)
		let camTarget: Camera = cam
		let phoneCur = 0
		let phoneTarget = 0
		let lapSize = { w: 0, h: 0 }
		let phoneW = 0

		const measure = () => {
			lapSize = { w: lapScreen.clientWidth, h: lapScreen.clientHeight }
			phoneW = phoneScreen.clientWidth
		}

		const tick = () => {
			const line = stacked ? stage.getBoundingClientRect().bottom + LINE_GAP : window.innerHeight * LINE_DESKTOP
			const rects = chapters.map(el => {
				const r = el.getBoundingClientRect()
				return { top: r.top, height: r.height }
			})
			const { index: ci, p: pScroll } = activeChapter(rects, line)
			const ch = story.chapters[ci]
			const p = reduced ? REDUCED_P : pScroll

			if (ci !== activeIndex) {
				chapters.forEach((el, i) => el.classList.toggle('is-active', i === ci))
				capNum.textContent = `${pad2(ci + 1)} / ${pad2(total)}`
				activeIndex = ci
			}

			// Экран и прокрутка его контента
			const step = ch.steps.find(s => inRange(p, s.p)) ?? ch.steps[ch.steps.length - 1]
			const sp = rangeProgress(p, step.p)
			if (step.screen !== activeScreen) {
				screens.forEach((s, key) => s.el?.classList.toggle('is-on', key === step.screen))
				activeScreen = step.screen
				capText.textContent = story.site + (story.screens.find(s => s.key === step.screen)?.path ?? '')
			}
			const scr = screens.get(step.screen)
			if (scr?.move) scr.target = lerp(step.from ?? 0, step.to ?? 0, easeInOut(sp))

			// Подсветки: одна за раз, только на показанном экране активной главы
			hls.forEach(({ el, ci: hc, h }) => el.classList.toggle('is-on', !!h && hc === ci && h.screen === step.screen && inRange(p, h.p)))

			// Курсор и панель
			clicks.forEach(({ ci: cc, panel, cursor }) => {
				const click = story.chapters[cc]?.click
				if (!click || !panel || !cursor) return
				if (cc !== ci) {
					cursor.style.opacity = '0'
					panel.classList.remove('is-on')
					return
				}
				const t = easeInOut(rangeProgress(p, click.p))
				cursor.style.transform = `translate(${lerp(click.from[0], click.to[0], t).toFixed(1)}px, ${lerp(click.from[1], click.to[1], t).toFixed(1)}px)`
				cursor.style.opacity = p > click.p[0] - 0.02 && p < click.at + 0.18 ? '1' : '0'
				const open = p >= click.at
				if (open && !clicked) {
					cursor.classList.remove('is-click')
					void cursor.offsetWidth
					cursor.classList.add('is-click')
				}
				clicked = open
				panel.classList.toggle('is-on', open)
			})

			// Камера ноутбука: наезд на область активной главы, иначе весь экран
			const region = ch.camera?.find(c => inRange(p, c.p))
			if (region && scr) {
				const onView = region.view || !scr.move
				const target = {
					x: onView ? region.x : SIDEBAR + region.x,
					y: (onView ? region.y : region.y - scr.target) + canvas.top,
					w: region.w,
					h: region.h,
				}
				camTarget = fitCamera(target, canvas, region.zoom)
			} else {
				camTarget = restCamera(canvas)
			}
			cam = { z: lerp(cam.z, camTarget.z, camFollow), cx: lerp(cam.cx, camTarget.cx, camFollow), cy: lerp(cam.cy, camTarget.cy, camFollow) }
			if (lapSize.w) {
				const { s, tx, ty } = cameraTransform(cam, canvas, lapSize)
				lapCanvas.style.transform = `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px) scale(${s.toFixed(5)})`
			}

			// Телефон: на десктопе выезжает в главах с `phone` и в финале, на ≤992 — всегда на сцене
			const last = ci === total - 1
			phone.classList.toggle('is-on', stacked || !!ch.phone || last)
			root.classList.toggle('is-dim', !!ch.dim && !stacked)
			const range = stacked ? ch.phoneMobile : ch.phone
			if (range) phoneTarget = lerp(range[0], range[1], easeInOut(p))
			phoneCur = lerp(phoneCur, phoneTarget, follow)
			phoneMove.style.transform = `translateY(${(-phoneCur).toFixed(2)}px)`
			if (phoneW) phoneCanvas.style.transform = `scale(${(phoneW / PHONE.canvas.w).toFixed(5)})`

			// Прокрутка внутри экранов — догоняние
			let moving = Math.abs(phoneTarget - phoneCur) > 0.05
			screens.forEach(s => {
				if (!s.move) return
				s.cur = lerp(s.cur, s.target, follow)
				s.move.style.transform = `translateY(${(-s.cur).toFixed(2)}px)`
				if (Math.abs(s.target - s.cur) > 0.05) moving = true
			})
			if (Math.abs(camTarget.z - cam.z) > 0.0005 || Math.abs(camTarget.cx - cam.cx) > 0.05 || Math.abs(camTarget.cy - cam.cy) > 0.05) moving = true

			// Подпись, полоса прогресса и появление ноутбука при входе в секцию
			bar.style.transform = `scaleX(${((ci + pScroll) / total).toFixed(4)})`
			const enter = reduced || stacked ? 1 : clamp((window.innerHeight * 0.92 - root.getBoundingClientRect().top) / (window.innerHeight * 0.45))
			lapWrap.style.setProperty('--enter', enter.toFixed(3))

			raf = moving ? requestAnimationFrame(tick) : 0
		}
		const start = () => {
			if (!raf) raf = requestAnimationFrame(tick)
		}
		const onResize = () => {
			measure()
			start()
		}
		const ro = new ResizeObserver(onResize)
		ro.observe(lapScreen)
		ro.observe(phoneScreen)
		window.addEventListener('scroll', start, { passive: true })
		window.addEventListener('resize', onResize)
		measure()
		start()

		return () => {
			cancelAnimationFrame(raf)
			ro.disconnect()
			window.removeEventListener('scroll', start)
			window.removeEventListener('resize', onResize)
			root.classList.remove('is-dim')
		}
	}, [story, reduced, stacked])

	const highlights = story.chapters.flatMap((c, ci) => (c.highlights ?? []).map((h, i) => ({ h, id: `${ci}-${i}` })))
	const clickOf = (key: string) => {
		const ci = story.chapters.findIndex(c => c.click && c.steps.some(s => s.screen === key))
		return ci === -1 ? null : { ci, click: story.chapters[ci].click! }
	}
	const { phone } = story

	return (
		<section className='caseStory' ref={rootRef} aria-label='Как устроен проект'>
			<div className='container caseStory__grid'>
				<div className='caseStory__chapters'>
					{story.chapters.map((c, ci) => (
						<article className='caseStory__ch' data-chapter={ci} key={c.label}>
							<span className='caseStory__label'>
								{pad2(ci + 1)} · {c.label}
							</span>
							<h2 className='caseStory__title'>{c.title}</h2>
							{c.text.map(t => (
								<p key={t}>{t}</p>
							))}
							{c.fact && <p className='caseStory__fact'>{c.fact}</p>}
							{c.metrics && metrics.length > 0 && (
								<ul className='caseStory__metrics' aria-label='Результаты в цифрах'>
									{metrics.map(m => (
										<li key={m.label}>
											{/* У Stat нет префикса: с ним значение уходит строкой без счётчика */}
											<Stat value={m.prefix ? `${m.prefix}${formatStat(m.value)}` : m.value} suffix={m.suffix} label={m.label} />
										</li>
									))}
								</ul>
							)}
							{c.stack && stack.length > 0 && (
								<ul className='caseStory__stack' aria-label='Стек проекта'>
									{stack.map(s => (
										<Chip as='li' key={s}>
											{s}
										</Chip>
									))}
								</ul>
							)}
						</article>
					))}
				</div>

				<div className='caseStory__stageCol'>
					<div className='caseStory__stage'>
						<div className='caseStory__scene' role='img' aria-label={story.label}>
							<div className='caseStory__lapWrap'>
								<div className='caseStory__laptop'>
									<div className='caseStory__lapScreen' style={screenStyle(LAPTOP)}>
										<div className='caseStory__lapCanvas' style={{ width: LAPTOP.canvas.w, height: LAPTOP.canvas.h }}>
											<div className='caseStory__strip' style={{ height: LAPTOP.canvas.top }} />
											<div className='caseStory__viewport' style={{ top: LAPTOP.canvas.top, height: LAPTOP.canvas.h - LAPTOP.canvas.top }}>
												{story.screens.map((s, si) => {
													const onView = highlights.filter(x => x.h.screen === s.key && (x.h.view || !s.content))
													const onContent = highlights.filter(x => x.h.screen === s.key && !x.h.view && !!s.content)
													const click = clickOf(s.key)
													return (
														<div className='caseStory__screen' data-screen={s.key} key={s.key}>
															<img
																className='caseStory__view'
																src={s.view}
																alt=''
																width={1440}
																height={900}
																loading={si === 0 ? 'eager' : 'lazy'}
																decoding='async'
																draggable={false}
															/>
															{s.content && (
																<div className='caseStory__col'>
																	<div className='caseStory__move'>
																		<img src={s.content} alt='' width={1099} height={s.contentHeight} loading={si === 0 ? 'eager' : 'lazy'} decoding='async' draggable={false} />
																		{onContent.map(x => (
																			<Highlight h={x.h} id={x.id} key={x.id} />
																		))}
																	</div>
																</div>
															)}
															{onView.map(x => (
																<Highlight h={x.h} id={x.id} key={x.id} />
															))}
															{click && (
																<div className='caseStory__click' data-click={click.ci}>
																	<img
																		className='caseStory__panel'
																		src={click.click.panel.src}
																		alt=''
																		style={{ left: click.click.panel.x, top: click.click.panel.y, width: click.click.panel.w, height: click.click.panel.h }}
																		loading='lazy'
																		decoding='async'
																		draggable={false}
																	/>
																	<div className='caseStory__cursor' aria-hidden='true'>
																		<svg viewBox='0 0 24 24'>
																			<path d='M4 2l16 10.5-7 1.6 4.2 7.4-2.9 1.6-4.2-7.5L5 20z' fill='#fff' stroke='#111' strokeWidth='1.2' strokeLinejoin='round' />
																		</svg>
																	</div>
																</div>
															)}
														</div>
													)
												})}
											</div>
										</div>
									</div>
									<img className='caseStory__frame' src={LAPTOP.src} alt='' width={LAPTOP.w} height={LAPTOP.h} decoding='async' draggable={false} />
								</div>
							</div>

							<div className='caseStory__phone'>
								<div className='caseStory__phoneScreen' style={screenStyle(PHONE)}>
									<div className='caseStory__phoneCanvas' style={{ width: PHONE.canvas.w, height: PHONE.canvas.h }}>
										<div className='caseStory__phoneMove' style={{ top: PHONE.canvas.top + phone.headerHeight }}>
											<img src={phone.content} alt='' width={PHONE.canvas.w} height={phone.contentHeight} loading='lazy' decoding='async' draggable={false} />
										</div>
										{/* Статусная зона под островом в цвет шапки продукта и сама шапка из первого экрана */}
										<div className='caseStory__phoneTop' style={{ height: PHONE.canvas.top + phone.headerHeight }}>
											<div className='caseStory__phoneHeader' style={{ top: PHONE.canvas.top, height: phone.headerHeight }}>
												<img src={phone.view} alt='' width={phone.viewW} height={phone.viewH} loading='lazy' decoding='async' draggable={false} />
											</div>
										</div>
										<img
											className='caseStory__phoneNav'
											src={phone.nav.src}
											alt=''
											style={{ left: phone.nav.x, top: phone.nav.y, width: phone.nav.w, height: phone.nav.h }}
											loading='lazy'
											decoding='async'
											draggable={false}
										/>
										<i className='caseStory__phoneHome' aria-hidden='true' />
									</div>
								</div>
								<img className='caseStory__frame' src={PHONE.src} alt='' width={PHONE.w} height={PHONE.h} loading='lazy' decoding='async' draggable={false} />
							</div>
						</div>

						<p className='caseStory__caption'>
							<b className='caseStory__capNum'>01 / {pad2(story.chapters.length)}</b>
							<span className='caseStory__capText'>{story.site}</span>
						</p>
						<div className='caseStory__progress' aria-hidden='true'>
							<i className='caseStory__bar' />
						</div>
					</div>
				</div>
			</div>
		</section>
	)
}
