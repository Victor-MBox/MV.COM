import { getOffer } from '../../../data/offers'
import { H2, SHOWCASE_ORDER } from '../../../data/home'
import SectionHead from '../../../components/sectionHead/SectionHead'
import Reveal from '../../../components/reveal/Reveal'
import OfferShowcase from '../../../components/offerShowcase/OfferShowcase'
import type { ShowcaseItem } from '../../../components/offerShowcase/OfferShowcase'

const ITEMS = SHOWCASE_ORDER.map(key => ({ key, offer: getOffer(key) })).filter((i): i is ShowcaseItem => !!i.offer)

/** Услуги (docs/design-spec-home4.md §6.3): витрина-переключатель на семь офферов с мини-интерфейсами */
export default function Services() {
	return (
		<section className='section' id='services'>
			<div className='container'>
				<SectionHead label='услуги' title={H2.services} action={{ label: 'Все услуги', to: '/services' }} />
				<Reveal>
					<OfferShowcase items={ITEMS} />
				</Reveal>
			</div>
		</section>
	)
}
