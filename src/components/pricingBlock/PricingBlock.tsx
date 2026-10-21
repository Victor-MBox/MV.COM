import { PRICING, PRICING_MODELS } from '../../data/pricing'
import { H2, PRICING_PANEL } from '../../data/home'
import { useContactModal } from '../contactModal/ContactModalContext'
import SectionHead from '../sectionHead/SectionHead'
import type { Headline } from '../sectionHead/SectionHead'
import Reveal from '../reveal/Reveal'
import PriceCard from '../priceCard/PriceCard'
import './PricingBlock.scss'

type Props = {
	label?: string
	title?: Headline
	/** Полная версия /services (content.md §4.3): под панелью — как читать цифры, условия, пример поддержки, чем не занимаюсь */
	details?: boolean
	id?: string
}

/** Строки полной версии: подпись моно слева, содержимое справа */
const DETAIL_ROWS = (): { label: string; items: string[] }[] => [
	{ label: 'оценка', items: [PRICING.estimate] },
	{ label: 'как читать цифры', items: PRICING.reading },
	{ label: 'фиксируем до старта', items: PRICING.terms },
	{ label: 'поддержка, пример', items: [PRICING.supportExample] },
	{ label: 'чем не занимаюсь', items: PRICING.notDoing },
]

/**
 * Сколько стоит (docs/design-spec-home4.md §6.5; content.md §4.3): три формата PriceCard и широкая панель «что входит /
 * что влияет». На главной — без details (estimate не выводится: «30 минут» и «два дня» уже в тексте шага 01), на /services — полная версия
 */
export default function PricingBlock({ label = 'цены', title = H2.pricing, details = false, id = 'pricing' }: Props) {
	const { open } = useContactModal()

	return (
		<section className='section pricingBlock' id={id}>
			<div className='container'>
				<SectionHead label={label} title={title} />
				<ul className='pricingBlock__cards'>
					{PRICING_MODELS.map((m, i) => (
						<Reveal as='li' key={m.key} index={i}>
							<PriceCard model={m} onDiscuss={open} />
						</Reveal>
					))}
				</ul>
				<Reveal className='pricingBlock__panel'>
					<div>
						<h3 className='pricingBlock__h'>{PRICING_PANEL.included}</h3>
						<ul className='pricingBlock__list'>
							{PRICING.included.map(item => (
								<li key={item}>
									<svg className='pricingBlock__check' viewBox='0 0 16 16' aria-hidden='true'>
										<path d='M3 8.5l3 3 7-7' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' />
									</svg>
									{item}
								</li>
							))}
						</ul>
						<p className='pricingBlock__note'>{PRICING_PANEL.includedNote}</p>
					</div>
					<div>
						<h3 className='pricingBlock__h'>{PRICING_PANEL.factors}</h3>
						<ol className='pricingBlock__list'>
							{PRICING.factors.map((item, i) => (
								<li key={item}>
									<span className='pricingBlock__num'>{String(i + 1).padStart(2, '0')}</span>
									{item}
								</li>
							))}
						</ol>
					</div>
				</Reveal>
				{details && (
					<Reveal as='div' className='pricingBlock__details'>
						<dl>
							{DETAIL_ROWS().map(row => (
								<div key={row.label}>
									<dt>{row.label}</dt>
									<dd>
										{row.items.length === 1 ? (
											<p>{row.items[0]}</p>
										) : (
											<ul>
												{row.items.map(item => (
													<li key={item}>{item}</li>
												))}
											</ul>
										)}
									</dd>
								</div>
							))}
						</dl>
					</Reveal>
				)}
			</div>
		</section>
	)
}
