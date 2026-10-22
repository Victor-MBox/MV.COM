import { H2 } from '../../../data/home'
import SectionHead from '../../../components/sectionHead/SectionHead'
import OfferGrid, { CatalogFooter, MoreOffers } from '../../../components/offerGrid/OfferGrid'

/**
 * Услуги (ТЗ от 21.10.2026, §7): шесть основных карточек — тот же каталог с иллюстрациями услуг, что в первой группе
 * /services (там с бо́льшими полями). Под ними — оговорка, «Также могу помочь» с пятью ссылками на новые услуги
 * (ТЗ от 22.10.2026, §4: без второго каталога из 11 карточек) и строка для агентств. Сцены иллюстраций играют при
 * появлении карточки и по ховеру/фокусу — OfferGrid
 */
export default function Services() {
	return (
		<section className='section' id='services'>
			<div className='container'>
				<SectionHead label='услуги' title={H2.services} action={{ label: 'Все услуги', to: '/services' }} />
				<OfferGrid />
				<CatalogFooter>
					<MoreOffers />
				</CatalogFooter>
			</div>
		</section>
	)
}
