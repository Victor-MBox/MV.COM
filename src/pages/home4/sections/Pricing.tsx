import { PRICING, PRICING_MODELS } from '../../../data/pricing'
import { H2, PRICING_PANEL } from '../../../data/home4'
import { useContactModal } from '../../../components/contactModal/ContactModalContext'
import SectionHead from '../../../components/sectionHead/SectionHead'
import Reveal from '../../../components/reveal/Reveal'
import PriceCard from '../../../components/priceCard/PriceCard'

/** Сколько стоит (docs/design-spec-home4.md §6.5): три формата и широкая панель «что входит / что влияет»; estimate не выводится */
export default function Pricing() {
	const { open } = useContactModal()

	return (
		<section className='h4Section h4Pricing' id='pricing'>
			<div className='h4Container'>
				<SectionHead label='цены' title={H2.pricing} />
				<ul className='h4Pricing__cards'>
					{PRICING_MODELS.map((m, i) => (
						<Reveal as='li' key={m.key} index={i}>
							<PriceCard model={m} onDiscuss={open} />
						</Reveal>
					))}
				</ul>
				<Reveal className='h4Pricing__panel'>
					<div>
						<h3 className='h4Pricing__h'>{PRICING_PANEL.included}</h3>
						<ul className='h4Pricing__list'>
							{PRICING.included.map(item => (
								<li key={item}>
									<svg className='h4Pricing__check' viewBox='0 0 16 16' aria-hidden='true'>
										<path d='M3 8.5l3 3 7-7' fill='none' stroke='currentColor' strokeWidth='1.8' strokeLinecap='round' strokeLinejoin='round' />
									</svg>
									{item}
								</li>
							))}
						</ul>
					</div>
					<div>
						<h3 className='h4Pricing__h'>{PRICING_PANEL.factors}</h3>
						<ol className='h4Pricing__list'>
							{PRICING.factors.map((item, i) => (
								<li key={item}>
									<span className='h4Pricing__num'>{String(i + 1).padStart(2, '0')}</span>
									{item}
								</li>
							))}
						</ol>
					</div>
				</Reveal>
			</div>
		</section>
	)
}
