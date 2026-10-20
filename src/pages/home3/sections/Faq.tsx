import { FAQ, HOME_FAQ_KEYS, getFaq } from '../../../data/faq'
import { H2 } from '../../../data/home3'
import SectionHead from '../../../components/sectionHead/SectionHead'
import Reveal from '../../../components/reveal/Reveal'
import DimAccordion from '../../../components/dimAccordion/DimAccordion'

/** Вопросы (docs/design-spec.md §7.7): четыре вопроса, можно открыть несколько, ширина 8/12 по центру */
export default function Faq() {
	const items = getFaq(HOME_FAQ_KEYS).map(f => ({ id: f.key, title: f.q, content: <p>{f.a}</p> }))

	return (
		<section className='home3Section' id='faq'>
			<div className='faq__inner'>
				<SectionHead label='вопросы' title={H2.faq} action={{ label: `Все ${FAQ.length} вопросов`, to: '/services#faq' }} />
				<Reveal>
					<DimAccordion idPrefix='faq' items={items} multiple />
				</Reveal>
			</div>
		</section>
	)
}
