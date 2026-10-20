import { FAQ, HOME_FAQ_KEYS, getFaq } from '../../../data/faq'
import { H2 } from '../../../data/home4'
import SectionHead from '../../../components/sectionHead/SectionHead'
import Reveal from '../../../components/reveal/Reveal'
import DimAccordion from '../../../components/dimAccordion/DimAccordion'

/** Вопросы (docs/design-spec-home4.md §6.6): четыре вопроса аккордеоном, все закрыты, ширина 8/12 по центру */
export default function Faq() {
	const items = getFaq(HOME_FAQ_KEYS).map(f => ({ id: f.key, title: f.q, content: <p>{f.a}</p> }))

	return (
		<section className='h4Section' id='faq'>
			<div className='h4Container'>
				<div className='h4Faq__inner'>
					<SectionHead label='вопросы' title={H2.faq} action={{ label: `Все ${FAQ.length} вопросов`, to: '/services#faq' }} />
					<Reveal>
						<DimAccordion idPrefix='faq4' items={items} multiple />
					</Reveal>
				</div>
			</div>
		</section>
	)
}
