import { useEffect, useRef } from 'react'
import type { AnimationItem } from 'lottie-web'
import { NBSP } from '../../stat/formatStat'
import { MQ, useMediaQuery } from '../../../hooks/useMediaQuery'
import circle from '../../../resources/rgs/cover/circle.svg'
import flag from '../../../resources/rgs/cover/flag.webp'
import coin from '../../../resources/rgs/cover/coin_icon.svg'
import present from '../../../resources/rgs/cover/present_1.webp'
import woman from '../../../resources/rgs/cover/woman_1.webp'

/**
 * Элементы игры «ЖК Несчастье» для обложки кейса (ТЗ docs/rgs-case-page-spec.md §6, 29.10.2026). Разметка и классы —
 * из репозитория игры (`~/Desktop/Работа/rgs-online`, только чтение): логотип — `header/Header.jsx`, флажок —
 * `gameChooseComponent.jsx`, реплика —
 * `replica/Replica.jsx`, панель — `controlPanel/СontrolPanel.jsx` и `pagination/Pagination.jsx`; тексты — экраны 2 и 8
 * `voltageScreens.js`. Стили — `rgs/cover.scss`. Картинки — исходные ассеты игры с прозрачностью, уменьшенные до 2×
 * размера на холсте; флажок — растр из `flag.svg` игры (внутри svg — PNG 1024 px, 273 КБ), отрисованный в webp 256 px.
 * Отличия от игры только там, где нужен валидный HTML внутри ссылки-карточки: `<a>` флажка и `<button>` панели →
 * `<span>`, список точек шагов → `<span>`
 */

/** Подгружать плеер и анимацию логотипа, когда сцена ближе к экрану, чем на столько; вне этой зоны анимация на паузе */
const LOGO_MARGIN = '300px 0px'

/**
 * Анимированный логотип Росгосстраха из шапки игры: та же Lottie-анимация `headerAnim.json` (8 с по кругу: «РОСГОССТРАХ» →
 * буквы разлетаются → «РГС» с точкой → снова полное название) на синей пилюле из инлайн-стиля игры. Плеер — лёгкая
 * сборка lottie-web (только SVG, без eval): он и анимация грузятся отдельным чанком, когда сцена рядом с экраном, и
 * играют, только пока она видна. Пилюля проявляется, когда анимация готова (без пустой плашки). При reduced-motion —
 * неподвижный первый кадр с полным названием
 */
export function RgsLogo() {
	const ref = useRef<HTMLSpanElement>(null)
	const reduced = useMediaQuery(MQ.reduced)

	useEffect(() => {
		const box = ref.current
		if (!box) return
		let alive = true
		let anim: AnimationItem | undefined
		let visible = false
		let loading = false
		const sync = () => {
			if (!anim || reduced) return
			if (visible) anim.play()
			else anim.pause()
		}
		const load = () => {
			loading = true
			Promise.all([import('lottie-web/build/player/lottie_light'), import('../../../resources/rgs/cover/logo-anim.json')])
				.then(([{ default: lottie }, { default: data }]) => {
					if (!alive) return
					anim = lottie.loadAnimation({ container: box, renderer: 'svg', loop: true, autoplay: false, animationData: data })
					anim.addEventListener('DOMLoaded', () => {
						if (reduced) anim?.goToAndStop(0, true)
						box.classList.add('is-ready')
						sync()
					})
				})
				.catch(() => undefined) // без сети пилюля просто не появится
		}
		const io = new IntersectionObserver(
			entries => {
				visible = entries.some(e => e.isIntersecting)
				if (visible && !loading) load()
				sync()
			},
			{ rootMargin: LOGO_MARGIN }
		)
		io.observe(box)
		return () => {
			alive = false
			io.disconnect()
			anim?.destroy()
			box.classList.remove('is-ready')
		}
	}, [reduced])

	return <span className='rgs-logo' ref={ref} />
}

/** Флажок квартиры со стартового экрана: красный круг и флаг по центру */
export function RgsFlag() {
	return (
		<span className='circle-btn'>
			<img className='circle' src={circle} alt='' draggable={false} />
			<img className='flag' src={flag} alt='' draggable={false} />
		</span>
	)
}

/** Подарок финала */
export function RgsGift() {
	return <img src={present} alt='' width={340} height={406} draggable={false} />
}

/** Консультант Росгосстраха с папкой */
export function RgsConsultant() {
	return <img src={woman} alt='' width={400} height={900} draggable={false} />
}

/** Реплика консультанта, экран 8: хвост справа — к консультанту. Неразрывный пробел — предлог не висит в конце строки */
export function RgsReplica() {
	return (
		<div className='replica replica__woman'>
			<p>Случился перепад напряжения в{NBSP}электросети.</p>
			<svg width='55' height='32' viewBox='0 0 55 32' fill='none' aria-hidden='true'>
				<path
					d='M0.225246 29.6247L3.80712 2.30826C3.93766 1.31272 4.78609 0.568278 5.79014 0.568281L52.8751 0.568351C54.9524 0.568354 55.6527 3.34302 53.8242 4.3288L3.15739 31.6452C1.72179 32.4192 0.0132024 31.2419 0.225246 29.6247Z'
					fill='white'
				/>
			</svg>
		</div>
	)
}

/** Панель экрана 2: подсказка, кнопка «Помочь» и пять точек шагов, вторая активна */
export function RgsPanel() {
	return (
		<div className='controlPanel'>
			<p>Помогите починить сгоревшую технику</p>
			<span className='btn'>Помочь</span>
			<div className='pagination'>
				<span className='pagination__list'>
					{[0, 1, 2, 3, 4].map(i => (
						<span key={i} className={i === 1 ? 'active' : undefined} />
					))}
				</span>
			</div>
		</div>
	)
}

/** Монетка-бонус */
export function RgsCoin() {
	return <img src={coin} alt='' width={125} height={125} draggable={false} />
}
