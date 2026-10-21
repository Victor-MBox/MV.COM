import PageHead from '../../components/pageHead/PageHead'
import OfferGrid from '../../components/offerGrid/OfferGrid'
import PricingBlock from '../../components/pricingBlock/PricingBlock'
import ProcessSteps from '../../components/processSteps/ProcessSteps'
import SectionHead from '../../components/sectionHead/SectionHead'
import DimAccordion from '../../components/dimAccordion/DimAccordion'
import Reveal from '../../components/reveal/Reveal'
import Button from '../../components/button/Button'
import { useContactModal } from '../../components/contactModal/ContactModalContext'
import { useDocumentMeta } from '../../hooks/useDocumentMeta'
import { FAQ } from '../../data/faq'
import { HEADER_CTA } from '../../data/home'
import { SITE_META } from '../../data/meta'
import './ServicesPage.scss'

// Первый экран /services — тексты ТЗ от 21.10.2026, §7
const HEAD = {
	title: { text: 'Разработка и доработка сайтов', accent: 'доработка' },
	lead: 'Создаю сайты и веб-сервисы, подключаю внешние системы и развиваю существующие проекты. Выберите ближайшую задачу — на странице услуги описаны результат и условия работы.',
}

/**
 * Услуги (content.md §5.2; docs/design-spec.md §9): шапка → каталог из шести услуг и строки для агентств (тот же, что
 * на главной, с мини-интерфейсами) → стоимость и условия полностью → процесс → все вопросы аккордеоном (#faq, сюда
 * ведёт «Другие вопросы» с главной и /contacts)
 */
export default function ServicesPage() {
	const { open } = useContactModal()
	useDocumentMeta(SITE_META.services)
	const faq = FAQ.map(f => ({ id: f.key, title: f.q, content: <p>{f.a}</p> }))

	return (
		<div className='servicesPage'>
			<PageHead
				label='услуги'
				title={HEAD.title}
				lead={HEAD.lead}
				actions={<Button onClick={() => open()}>{HEADER_CTA}</Button>}
			/>

			<section className='section' id='offers' aria-label='Услуги'>
				<div className='container'>
					<OfferGrid spacious />
				</div>
			</section>

			<PricingBlock details />

			<ProcessSteps />

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
