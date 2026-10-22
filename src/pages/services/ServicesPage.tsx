import { Link } from 'react-router-dom'
import PageHead from '../../components/pageHead/PageHead'
import OfferGrid, { CatalogFooter } from '../../components/offerGrid/OfferGrid'
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
import { CATALOG_GROUPS } from '../../data/offers'
import './ServicesPage.scss'

// Первый экран /services — тексты ТЗ «расширить услуги» от 22.10.2026, §4
const HEAD = {
	title: { text: 'Сайты, приложения и продвижение', accent: 'продвижение' },
	lead: 'Разрабатываю сайты, приложения и интерактивные проекты, подключаю внешние системы и занимаюсь продвижением. Выберите задачу — на странице услуги описаны состав работ, стоимость и порядок сотрудничества.',
}

// Заголовок общего FAQ без числа пунктов (ТЗ от 22.10.2026, §10)
const FAQ_TITLE = { text: 'Вопросы перед началом работы', accent: 'перед началом работы' }

/** «6 услуг», «2 услуги», «1 услуга» */
const services = (n: number) => {
	const d = n % 10
	const dd = n % 100
	if (d === 1 && dd !== 11) return `${n} услуга`
	if (d >= 2 && d <= 4 && (dd < 12 || dd > 14)) return `${n} услуги`
	return `${n} услуг`
}

/** Якорь секции группы каталога — те же id, что у секций ниже */
const groupAnchor = (key: string) => `catalog-${key}`

/**
 * Оглавление каталога в правой колонке шапки (правка владельца от 22.10.2026: справа от H1 было пусто): три группы
 * со счётчиком услуг — тихие строки моно без акцента, ссылки на секции этой же страницы (плавная прокрутка — ScrollToTop)
 */
function CatalogIndex() {
	return (
		<nav className='servicesPage__index' aria-label='Разделы каталога'>
			<p className='servicesPage__indexLabel'>
				<span aria-hidden='true'>//</span> в каталоге
			</p>
			<ul>
				{CATALOG_GROUPS.map(g => (
					<li key={g.key}>
						<Link to={`/services#${groupAnchor(g.key)}`}>
							<span className='servicesPage__indexTitle'>{g.title.text}</span>
							<span className='servicesPage__indexMeta'>
								{services(g.offers.length)}
								<span aria-hidden='true'> ↓</span>
							</span>
						</Link>
					</li>
				))}
			</ul>
		</nav>
	)
}

/**
 * Услуги (content.md §5.2; docs/design-spec.md §9): шапка с оглавлением каталога справа → каталог тремя группами под видимыми H2 (сайты и приложения,
 * интеграции и поддержка, продвижение и аналитика со ссылкой на обзор продвижения — CATALOG_GROUPS, карточки с
 * мини-интерфейсами), под последней группой оговорка и строка для агентств → стоимость и условия → ответственность и
 * процесс → все вопросы аккордеоном (#faq, сюда ведёт «Другие вопросы» с главной и /contacts)
 */
export default function ServicesPage() {
	const { open } = useContactModal()
	useDocumentMeta(SITE_META.services)
	const faq = FAQ.map(f => ({ id: f.key, title: f.q, content: <p>{f.a}</p> }))
	const last = CATALOG_GROUPS.length - 1

	return (
		<div className='servicesPage'>
			<PageHead
				label='услуги'
				title={HEAD.title}
				lead={HEAD.lead}
				actions={<Button onClick={() => open()}>{HEADER_CTA}</Button>}
				aside={<CatalogIndex />}
			/>

			{CATALOG_GROUPS.map((group, i) => (
				<section className='section' id={groupAnchor(group.key)} key={group.key} aria-labelledby={`${groupAnchor(group.key)}-title`}>
					<div className='container'>
						<SectionHead label={group.label} title={group.title} action={group.link} titleId={`${groupAnchor(group.key)}-title`} />
						<OfferGrid offers={group.offers} spacious label={group.title.text} />
						{i === last && <CatalogFooter />}
					</div>
				</section>
			))}

			<PricingBlock />

			<ProcessSteps />

			<section className='section' id='faq'>
				<div className='container servicesPage__faq'>
					<SectionHead label='вопросы' title={FAQ_TITLE} />
					<Reveal>
						<DimAccordion idPrefix='faq' items={faq} multiple />
					</Reveal>
				</div>
			</section>
		</div>
	)
}
