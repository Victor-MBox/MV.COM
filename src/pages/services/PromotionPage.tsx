import { Link } from 'react-router-dom'
import PageHead from '../../components/pageHead/PageHead'
import SectionHead from '../../components/sectionHead/SectionHead'
import OfferGrid from '../../components/offerGrid/OfferGrid'
import Reveal from '../../components/reveal/Reveal'
import Button from '../../components/button/Button'
import DiscussRow from '../../components/discussRow/DiscussRow'
import { useContactModal } from '../../components/contactModal/ContactModalContext'
import { useDocumentMeta } from '../../hooks/useDocumentMeta'
import { SITE_META } from '../../data/meta'
import { PROMOTION } from '../../data/promotion'
import './PromotionPage.scss'

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * Обзор способов продвижения /services/promotion (ТЗ от 22.10.2026, §5): шапка с крошками Главная → Услуги →
 * Продвижение сайтов и кнопкой «Обсудить продвижение» → три карточки SEO, рекламы и аналитики из общих данных офферов
 * (те же цены и условия, что на их страницах и в каталоге) → «С чего начать» тремя вопросами → обращение. Подробного
 * состава, FAQ и цен трёх услуг здесь нет — они на страницах услуг
 */
export default function PromotionPage() {
	const { open } = useContactModal()
	useDocumentMeta(SITE_META.promotion)

	return (
		<div className='promotionPage'>
			<PageHead
				label={PROMOTION.label}
				title={PROMOTION.title}
				lead={PROMOTION.lead}
				meta={
					<>
						<Link to='/'>Главная</Link> · <Link to='/services'>Услуги</Link> · {PROMOTION.name}
					</>
				}
				actions={
					<>
						<Button onClick={() => open(PROMOTION.name)}>{PROMOTION.cta}</Button>
						<Button variant='text' to='/services'>
							Все услуги
						</Button>
					</>
				}
			/>

			<section className='section' id='directions' aria-label='Способы продвижения'>
				<div className='container'>
					<OfferGrid offers={PROMOTION.offers} spacious label='Способы продвижения' />
				</div>
			</section>

			<section className='section' id='start'>
				<div className='container promotionPage__narrow'>
					<SectionHead label='с чего начать' title={PROMOTION.start.title} />
					<Reveal as='ol' className='promotionPage__start'>
						{PROMOTION.start.items.map((item, i) => (
							<li key={item.q}>
								<span className='promotionPage__num'>{pad(i + 1)}</span>
								<div>
									<h3 className='promotionPage__q'>{item.q}</h3>
									<p className='promotionPage__a'>{item.a}</p>
								</div>
							</li>
						))}
					</Reveal>
					<Reveal as='p' className='promotionPage__note'>
						{PROMOTION.start.note}
					</Reveal>
				</div>
			</section>

			<section className='section' id='discuss'>
				<div className='container promotionPage__narrow'>
					<DiscussRow text={PROMOTION.final.text} cta={PROMOTION.final.cta} onClick={() => open(PROMOTION.name)} />
				</div>
			</section>
		</div>
	)
}
