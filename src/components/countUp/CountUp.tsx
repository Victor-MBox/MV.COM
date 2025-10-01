import React, { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

type Direction = 'up' | 'down'

interface CountUpProps {
        to: number
        from?: number
        direction?: Direction
	delay?: number // в секундах
	duration?: number // в секундах
	className?: string
	startWhen?: boolean // внешний триггер старта (вместе с in-view)
	separator?: string // например ' ' или ' ' (узкий неразрывный)
	onStart?: () => void
	onEnd?: () => void
	inViewMargin?: string // rootMargin для IO (по умолчанию '0px')
	inViewAmount?: number // порог видимости [0..1] (по умолчанию 0)
	ease?: string // ease для gsap (по умолчанию 'power2.out')
}

export default function CountUpGSAP({
        to,
        from: fromProp,
        direction = 'up',
	delay = 0,
	duration = 2,
	className = '',
	startWhen = true,
	separator = '',
	onStart,
	onEnd,
	inViewMargin = '0px',
	inViewAmount = 0,
	ease = 'power2.out',
}: CountUpProps) {
        const ref = useRef<HTMLSpanElement>(null)
        const tweenRef = useRef<gsap.core.Tween | null>(null)
        const startedRef = useRef(false) // чтобы не запускать повторно
        const ioRef = useRef<IntersectionObserver | null>(null)

        const resolvedFrom =
                fromProp ?? (direction === 'down' ? to : 0)
        const resolvedTo = to

        // Сколько знаков после запятой у числа
	const getDecimalPlaces = (num: number): number => {
		const s = String(num)
		if (!s.includes('.')) return 0
		const d = s.split('.')[1]
		return Number(d) !== 0 ? d.length : 0
	}
        const maxDecimals = Math.max(
                getDecimalPlaces(resolvedFrom),
                getDecimalPlaces(resolvedTo)
        )

	// Инициализируем стартовое значение в DOM
	useEffect(() => {
		if (!ref.current) return
                ref.current.textContent = formatNumber(resolvedFrom, separator, maxDecimals)
                // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [resolvedFrom, separator, maxDecimals])

	// Основная логика: ждём in-view И startWhen, затем один раз запускаем tween
	useEffect(() => {
		if (!ref.current) return

		// Если уже запущено — ничего не делаем
		if (startedRef.current) return

		// Если startWhen=false — тоже ждём
		if (!startWhen) return

		// Порог видимости через IntersectionObserver
		const el = ref.current
		ioRef.current = new IntersectionObserver(
			entries => {
				const entry = entries[0]
				if (!entry?.isIntersecting) return

				// стартуем один раз
				startedRef.current = true
				ioRef.current?.disconnect()

				// Готовим объект-счётчик
                                const valueObj = {
                                        value: resolvedFrom,
                                }

                                // Коллбэки
                                if (typeof onStart === 'function') onStart()

				// Убиваем предыдущий твина, если были (на всякий)
				tweenRef.current?.kill()

				// Анимация числа
                                tweenRef.current = gsap.to(valueObj, {
                                        value: resolvedTo,
					duration,
					delay,
					ease,
					onUpdate: () => {
						if (!ref.current) return
                                                const formatted = formatNumber(valueObj.value, separator, maxDecimals)
						ref.current.textContent = formatted
					},
					onComplete: () => {
						if (!ref.current) return
						// Финальный «щелчок» на целевой value, чтобы исключить артефакты округления
                                                ref.current.textContent = formatNumber(resolvedTo, separator, maxDecimals)
						if (typeof onEnd === 'function') onEnd()
					},
				})
			},
			{
				root: null,
				rootMargin: inViewMargin,
				threshold: inViewAmount, // 0 = касание, 1 = полностью
			}
		)

		ioRef.current.observe(el)

		return () => {
			ioRef.current?.disconnect()
		}
		// Важно: включаем в зависимости только флаги, которые реально меняют старт
	}, [
                startWhen,
                direction,
                resolvedFrom,
                resolvedTo,
                delay,
                duration,
                ease,
                separator,
                maxDecimals,
		inViewMargin,
		inViewAmount,
		onStart,
		onEnd,
	])

	// Чистим tween при размонтировании/смене зависимостей
	useEffect(() => {
		return () => {
			tweenRef.current?.kill()
			tweenRef.current = null
		}
	}, [])

	return <span ref={ref} className={className} />
}

// Форматирование с разделителем и фиксированным количеством знаков
function formatNumber(value: number, separator: string, decimals: number) {
	const opts: Intl.NumberFormatOptions = {
		useGrouping: !!separator,
		minimumFractionDigits: decimals > 0 ? decimals : 0,
		maximumFractionDigits: decimals > 0 ? decimals : 0,
	}
	const formatted = new Intl.NumberFormat('en-US', opts).format(value)
	return separator ? formatted.replace(/,/g, separator) : formatted
}
