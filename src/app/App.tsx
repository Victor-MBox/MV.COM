import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'

import TopHeader from '../components/topHeader/TopHeader'
import SiteFooter from '../components/siteFooter/SiteFooter'
import ScrollToTop from '../components/scrollToTop/ScrollToTop'
import ContactModalProvider from '../components/contactModal/ContactModalProvider'
import CookieNotice from '../components/cookieNotice/CookieNotice'
import CookieSettings from '../components/cookieNotice/CookieSettings'

import HomePage from '../pages/home/HomePage'
import ServicesPage from '../pages/services/ServicesPage'
import OfferPage from '../pages/services/OfferPage'
import PromotionPage from '../pages/services/PromotionPage'
import PortfolioPage from '../pages/portfolio/PortfolioPage'
import ProjectPage from '../pages/portfolio/ProjectPage'
import AboutPage from '../pages/about/AboutPage'
import BlogPage from '../pages/blog/BlogPage'
import PostPage from '../pages/blog/PostPage'
import ContactsPage from '../pages/contacts/ContactsPage'
import LegalPage from '../pages/legal/LegalPage'
import { COOKIE_SETTINGS_ENABLED } from '../data/legal'
import NotFoundPage from '../pages/NotFoundPage'

/**
 * Каркас (docs/design-spec-home4.md §4): липкая верхняя шапка TopHeader, страница, SiteFooter. С 20.10.2026 — один каркас
 * для всего сайта: левого меню и условий по маршруту нет, секции сами держат контейнер и гаттеры (.container в _system.scss)
 */
function App() {
	const location = useLocation()

	return (
		<MotionConfig reducedMotion='user'>
			<ContactModalProvider>
				<TopHeader />
				{/* Цель ссылки «К содержанию» на любой странице: фокус переходит сюда, рамка не нужна (_system.scss) */}
				<main className='main' id='main' tabIndex={-1}>
					<AnimatePresence mode='wait' initial={false}>
						<motion.div
							key={location.pathname}
							className='page'
							initial={{ opacity: 0, y: 14 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -8 }}
							transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
						>
							<Routes location={location}>
								<Route path='/' element={<HomePage />} />
								<Route path='/services' element={<ServicesPage />} />
								{/* Обзор продвижения и вложенные услуги (SEO, реклама, аналитика — Offer.parent); остальные услуги — /services/:offer */}
								<Route path='/services/promotion' element={<PromotionPage />} />
								<Route path='/services/promotion/:offer' element={<OfferPage parent='promotion' />} />
								<Route path='/services/:offer' element={<OfferPage />} />
								<Route path='/portfolio' element={<PortfolioPage />} />
								<Route path='/portfolio/:slug' element={<ProjectPage />} />
								<Route path='/about' element={<AboutPage />} />
								<Route path='/blog' element={<BlogPage />} />
								<Route path='/blog/:slug' element={<PostPage />} />
								<Route path='/contacts' element={<ContactsPage />} />
								{/* Документы (data/legal.ts): одна страница-рендерер на три текста */}
								<Route path='/privacy' element={<LegalPage doc='privacy' />} />
								<Route path='/personal-data-consent' element={<LegalPage doc='consent' />} />
								<Route path='/cookies' element={<LegalPage doc='cookies' />} />
								<Route path='*' element={<NotFoundPage />} />
							</Routes>
							{/* Внутри страницы и после неё: прокрутка — когда старая страница ушла, а у новой отработали свои эффекты */}
							<ScrollToTop location={location} />
						</motion.div>
					</AnimatePresence>
				</main>
				<SiteFooter />
				{/* Информационное уведомление о хранилище (первое посещение) — портал в body; окно «Настройки cookie» скрыто до появления необязательных категорий */}
				<CookieNotice />
				{COOKIE_SETTINGS_ENABLED && <CookieSettings />}
			</ContactModalProvider>
		</MotionConfig>
	)
}

export default App
