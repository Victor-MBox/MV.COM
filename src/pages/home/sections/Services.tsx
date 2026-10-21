import { H2 } from '../../../data/home'
import SectionHead from '../../../components/sectionHead/SectionHead'
import OfferGrid from '../../../components/offerGrid/OfferGrid'

/**
 * Услуги (ТЗ от 21.10.2026, §7): шесть статичных карточек — тот же каталог с иллюстрациями услуг, что на /services
 * (там с бо́льшими полями). Сцены иллюстраций играют при появлении карточки и по ховеру/фокусу — OfferGrid
 */
export default function Services() {
	return (
		<section className='section' id='services'>
			<div className='container'>
				<SectionHead label='услуги' title={H2.services} action={{ label: 'Все услуги', to: '/services' }} />
				<OfferGrid />
			</div>
		</section>
	)
}
