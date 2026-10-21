import PageHead from '../../components/pageHead/PageHead'
import OfferGrid from '../../components/offerGrid/OfferGrid'
import PricingBlock from '../../components/pricingBlock/PricingBlock'
import ProcessSteps from '../../components/processSteps/ProcessSteps'
import SectionHead from '../../components/sectionHead/SectionHead'
import DimAccordion from '../../components/dimAccordion/DimAccordion'
import Reveal from '../../components/reveal/Reveal'
import Button from '../../components/button/Button'
import { useContactModal } from '../../components/contactModal/ContactModalContext'
import { FAQ } from '../../data/faq'
import './ServicesPage.scss'

// TODO (владелец): H1 и лид страницы услуг (content.md §5.2); в H1 — одно выделение
const HEAD = {
	title: { text: 'Сайты, сервисы и интеграции с понятной ценой', muted: 'с понятной ценой' },
	lead: 'Лендинги, магазины, личные кабинеты, CRM и поддержка. Один исполнитель на весь проект, смета и срок — до старта.',
}

/**
 * Услуги (content.md §5.2; docs/design-spec.md §9): шапка → семь офферов карточками → «Сколько стоит» полностью →
 * процесс (общий компонент) → все вопросы аккордеоном (#faq, сюда ведёт «Все вопросы» с главной) → CTA
 */
export default function ServicesPage() {
	const { open } = useContactModal()
	const faq = FAQ.map(f => ({ id: f.key, title: f.q, content: <p>{f.a}</p> }))

	return (
		<div className='servicesPage'>
			<PageHead
				label='услуги'
				title={HEAD.title}
				lead={HEAD.lead}
				actions={<Button onClick={() => open()}>Обсудить задачу</Button>}
			/>

			<section className='section' id='offers' aria-label='Офферы'>
				<div className='container'>
					<OfferGrid />
				</div>
			</section>

			<PricingBlock details />

			<ProcessSteps withWhy={false} />

			<section className='section' id='faq'>
				<div className='container servicesPage__faq'>
					<SectionHead label='вопросы' title={{ text: `${FAQ.length} вопросов до старта`, accent: 'до старта' }} />
					<Reveal>
						<DimAccordion idPrefix='faq' items={faq} multiple />
					</Reveal>
				</div>
			</section>
		</div>
	)
}
