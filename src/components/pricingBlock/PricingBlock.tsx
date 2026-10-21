import { AFTER_LAUNCH, PRICING, PRICING_MODELS } from '../../data/pricing'
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
	/** Полная версия /services (content.md §4.3): под панелью — как читать цифры и чем не занимаюсь */
	details?: boolean
	id?: string
}

/** Строки полной версии: подпись моно слева, содержимое справа */
const DETAIL_ROWS = (): { label: string; items: string[] }[] => [
	{ label: 'как читать цифры', items: PRICING.reading },
	{ label: 'чем не занимаюсь', items: PRICING.notDoing },
]

/**
 * Стоимость и условия работы (ТЗ от 21.10.2026, §9): три формата PriceCard, панель «Что согласуем перед началом работ /
 * Что влияет на цену» и строка «после запуска» — исправление своих ошибок отдельно от новых задач. Третий формат —
 * «Техническое обслуживание» со ссылкой на пакеты /services/support#packages. На /services с `details` — ещё строки
 * «как читать цифры» и «чем не занимаюсь» (пример «8 часов × 3 500 ₽» снят: его заменили пакеты)
 */
export default function PricingBlock({ label = 'стоимость', title = H2.pricing, details = false, id = 'pricing' }: Props) {
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
						<h3 className='pricingBlock__h'>{PRICING_PANEL.agree}</h3>
						<ul className='pricingBlock__list pricingBlock__list--dots'>
							{PRICING.agree.map(item => (
								<li key={item}>{item}</li>
							))}
						</ul>
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
				<Reveal as='div' className='pricingBlock__details'>
					<dl>
						<div>
							<dt>{PRICING_PANEL.after}</dt>
							<dd>
								<p>{AFTER_LAUNCH}</p>
							</dd>
						</div>
						{details &&
							DETAIL_ROWS().map(row => (
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
			</div>
		</section>
	)
}
