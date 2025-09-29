'use client'

import React, { useLayoutEffect, useMemo, useRef } from 'react'
import { gsap } from 'gsap'

type MeteorsProps = {
	number?: number // сколько метеоров
	angleDeg?: number // угол падения (отрицательный = вправо-вниз)
	speedRange?: [number, number] // секунды на «пролёт»
	sizeRange?: [number, number] // толщина хвоста (px)
	lengthRange?: [number, number] // длина хвоста (px)
	blur?: number // blur хвоста (px)
	color?: string // цвет хвоста
	className?: string
}

export function MeteorsGSAP({
	number = 30,
	angleDeg = -25,
	speedRange = [1.2, 2.2],
	sizeRange = [2, 4],
	lengthRange = [80, 160],
	blur = 2,
	color = 'rgba(255,255,255,0.9)',
	className = '',
}: MeteorsProps) {
	const rootRef = useRef<HTMLDivElement>(null)
	const items = useMemo(() => Array.from({ length: number }), [number])
	const elsRef = useRef<HTMLDivElement[]>([])
	const killers = useRef<gsap.core.Tween[]>([])

	useLayoutEffect(() => {
		const root = rootRef.current
		if (!root) return

		const rand = gsap.utils.random

		const areaW = () => root.clientWidth
		const areaH = () => root.clientHeight

		const angle = (angleDeg * Math.PI) / 180

		const animate = (el: HTMLDivElement) => {
			// старт — чуток за пределами видимой области, чтобы «влетал»
			const startX = rand(-0.15 * areaW(), 0.05 * areaW())
			const startY = rand(-0.2 * areaH(), 0.2 * areaH())

			// длина прогона по диагонали
			const distance = rand(areaW() * 0.6, areaW() * 1.2)
			const endX = startX + Math.cos(angle) * distance
			const endY = startY + Math.sin(angle) * distance

			// визуальные параметры
			const thickness = rand(sizeRange[0], sizeRange[1])
			const length = rand(lengthRange[0], lengthRange[1])
			const duration = rand(speedRange[0], speedRange[1])

			// подготовка DOM-стилей
			gsap.set(el, {
				x: startX,
				y: startY,
				rotate: angleDeg,
				width: length,
				height: thickness,
				opacity: 0,
				filter: `blur(${blur}px)`,
				backgroundImage: `linear-gradient(90deg, ${color} 0%, rgba(255,255,255,0) 70%)`,
				transformOrigin: 'left center',
				willChange: 'transform, opacity',
			})

			// сам полёт
			const tween = gsap.fromTo(
				el,
				{ opacity: 0 },
				{
					opacity: 1,
					x: endX,
					y: endY,
					ease: 'none',
					duration,
					// лёгкое мерцание/затухание на концах
					keyframes: [
						{ opacity: 0, duration: 0.05 * duration },
						{ opacity: 1, duration: 0.85 * duration },
						{ opacity: 0, duration: 0.1 * duration },
					],
					onComplete: () => animate(el), // по кругу
				}
			)

			killers.current.push(tween)
		}

		elsRef.current.forEach(el => el && animate(el))

		return () => {
			killers.current.forEach(k => k?.kill())
			killers.current = []
		}
	}, [angleDeg, speedRange, sizeRange, lengthRange, blur, color])

	return (
		<div
			ref={rootRef}
			className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
			aria-hidden='true'
		>
			{items.map((_, i) => (
				<div
					key={i}
					ref={el => {
						if (el) elsRef.current[i] = el
					}}
					className='meteor'
					style={{
						position: 'absolute',
						left: 0,
						top: 0,
						backgroundRepeat: 'no-repeat',
						borderRadius: 999,
						boxShadow: `0 0 6px rgba(255,255,255,0.6)`, // лёгкое свечение
					}}
				/>
			))}
		</div>
	)
}
