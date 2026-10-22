import { HOME_FAQ_KEYS, getFaq } from '../../../data/faq'
import { H2 } from '../../../data/home'
import SectionHead from '../../../components/sectionHead/SectionHead'
import Reveal from '../../../components/reveal/Reveal'
import DimAccordion from '../../../components/dimAccordion/DimAccordion'

/**
 * Вопросы до начала работы (ТЗ от 21.10.2026, §12): пять вопросов аккордеоном, все закрыты, ширина 8/12 по центру.
 * Остальные — на /services#faq по ссылке «Другие вопросы» (без числа: оно устаревало при каждом изменении списка)
 */
export default function Faq() {
	const items = getFaq(HOME_FAQ_KEYS).map(f => ({ id: f.key, title: f.q, content: <p>{f.a}</p> }))

	return (
		<section className='section' id='faq'>
			<div className='container'>
				<div className='homeFaq__inner'>
					<SectionHead label='вопросы' title={H2.faq} action={{ label: 'Другие вопросы', to: '/services#faq' }} />
					<Reveal>
						<DimAccordion idPrefix='faq-home' items={items} multiple />
					</Reveal>
				</div>
			</div>
		</section>
	)
}
