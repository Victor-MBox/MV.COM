import { useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useScrollLock } from '../../hooks/useScrollLock'
import './Gallery.scss'

export type GalleryImage = { src: string; caption: string }

type Props = {
	images: GalleryImage[]
	title: string
}

const Arrow = ({ dir }: { dir: 'left' | 'right' }) => (
	<svg viewBox='0 0 24 24' aria-hidden='true'>
		<path
			d={dir === 'left' ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'}
			fill='none'
			stroke='currentColor'
			strokeWidth='2'
			strokeLinecap='round'
			strokeLinejoin='round'
		/>
	</svg>
)

export default function Gallery({ images, title }: Props) {
	const [active, setActive] = useState(0)
	const [direction, setDirection] = useState(1)
	const [isOpen, setIsOpen] = useState(false)
	const count = images.length

	const go = useCallback(
		(delta: number) => {
			setDirection(delta)
			setActive(i => (i + delta + count) % count)
		},
		[count]
	)

	const select = (i: number) => {
		setDirection(i > active ? 1 : -1)
		setActive(i)
	}

	useScrollLock(isOpen)

	// Клавиатура: стрелки листают, Esc закрывает лайтбокс
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === 'ArrowRight') go(1)
			if (e.key === 'ArrowLeft') go(-1)
			if (e.key === 'Escape') setIsOpen(false)
		}
		if (!isOpen) return
		document.addEventListener('keydown', onKey)
		return () => document.removeEventListener('keydown', onKey)
	}, [isOpen, go])

	if (count === 0) return null
	const current = images[active]

	const slide = {
		enter: (d: number) => ({ x: d > 0 ? 60 : -60, opacity: 0 }),
		center: { x: 0, opacity: 1 },
		exit: (d: number) => ({ x: d > 0 ? -60 : 60, opacity: 0 }),
	}

	return (
		<div className='gallery'>
			<div className='gallery__stage'>
				<AnimatePresence initial={false} custom={direction} mode='popLayout'>
					<motion.button
						key={current.src}
						type='button'
						className='gallery__main'
						custom={direction}
						variants={slide}
						initial='enter'
						animate='center'
						exit='exit'
						transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
						onClick={() => setIsOpen(true)}
						aria-label={`Открыть изображение «${current.caption}» на весь экран`}
					>
						<img src={current.src} alt={`${title}: ${current.caption}`} />
					</motion.button>
				</AnimatePresence>

				<button type='button' className='gallery__nav gallery__nav--prev' onClick={() => go(-1)} aria-label='Предыдущее'>
					<Arrow dir='left' />
				</button>
				<button type='button' className='gallery__nav gallery__nav--next' onClick={() => go(1)} aria-label='Следующее'>
					<Arrow dir='right' />
				</button>

				<div className='gallery__caption'>
					<span className='gallery__counter'>
						{String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}
					</span>
					<span>{current.caption}</span>
				</div>
			</div>

			<ul className='gallery__thumbs' aria-label='Миниатюры'>
				{images.map((img, i) => (
					<li key={img.src}>
						<button
							type='button'
							className={`gallery__thumb${i === active ? ' is-active' : ''}`}
							onClick={() => select(i)}
							aria-label={img.caption}
							aria-current={i === active}
						>
							<img src={img.src} alt='' loading='lazy' />
						</button>
					</li>
				))}
			</ul>

			{createPortal(
				<AnimatePresence>
					{isOpen && (
						<motion.div
							className='lightbox'
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							transition={{ duration: 0.2 }}
							onMouseDown={e => {
								if (e.target === e.currentTarget) setIsOpen(false)
							}}
							role='dialog'
							aria-modal='true'
							aria-label={`${title}: галерея`}
						>
							<button type='button' className='lightbox__close' onClick={() => setIsOpen(false)} aria-label='Закрыть'>
								<svg viewBox='0 0 24 24' aria-hidden='true'>
									<path d='M6 6l12 12M18 6L6 18' stroke='currentColor' strokeWidth='2' strokeLinecap='round' />
								</svg>
							</button>
							<button type='button' className='lightbox__nav lightbox__nav--prev' onClick={() => go(-1)} aria-label='Предыдущее'>
								<Arrow dir='left' />
							</button>
							<AnimatePresence initial={false} custom={direction} mode='popLayout'>
								<motion.figure
									key={current.src}
									className='lightbox__figure'
									custom={direction}
									variants={slide}
									initial='enter'
									animate='center'
									exit='exit'
									transition={{ duration: 0.3 }}
								>
									<img src={current.src} alt={`${title}: ${current.caption}`} />
									<figcaption>
										<span>{String(active + 1).padStart(2, '0')} / {String(count).padStart(2, '0')}</span>
										{current.caption}
									</figcaption>
								</motion.figure>
							</AnimatePresence>
							<button type='button' className='lightbox__nav lightbox__nav--next' onClick={() => go(1)} aria-label='Следующее'>
								<Arrow dir='right' />
							</button>
						</motion.div>
					)}
				</AnimatePresence>,
				document.body
			)}
		</div>
	)
}
