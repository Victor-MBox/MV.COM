import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, MotionConfig, motion } from 'framer-motion'

import LeftMenu from '../components/leftMenu/LeftMenu'
import TopHeader from '../components/topHeader/TopHeader'
import SiteHeader from '../components/siteHeader/SiteHeader'
import Card from '../components/cards/Cards'
import Footer from '../components/footer/Footer'
import SiteFooter from '../components/siteFooter/SiteFooter'
import MinimalFooter from '../components/minimalFooter/MinimalFooter'
import ScrollToTop from '../components/scrollToTop/ScrollToTop'
import ContactModalProvider from '../components/contactModal/ContactModalProvider'
import { isHome5Route, isTopHeaderRoute, isV2Route } from './routes'

import HomePage from '../pages/home/HomePage'
import Home2Page from '../pages/home2/Home2Page'
import HomePage3 from '../pages/home3/HomePage3'
import HomePage4 from '../pages/home4/HomePage4'
import HomePage5 from '../pages/home5/HomePage5'
import ServicesPage from '../pages/services/ServicesPage'
import OfferPage from '../pages/services/OfferPage'
import PortfolioPage from '../pages/portfolio/PortfolioPage'
import ProjectPage from '../pages/portfolio/ProjectPage'
import AboutPage from '../pages/about/AboutPage'
import BlogPage from '../pages/blog/BlogPage'
import PostPage from '../pages/blog/PostPage'
import ContactsPage from '../pages/contacts/ContactsPage'
import NotFoundPage from '../pages/NotFoundPage'

function App() {
	const location = useLocation()
	// /home3, /home4 и /home5 — главные на дизайн-системе 1.0 (docs/design-spec.md): свой футер §6.15, пока остальные страницы на старых токенах.
	// /home4 и /home5 вместо левого меню рендерят верхнюю шапку (TopHeader и SiteHeader), а .main--top отдаёт контейнер
	// и гаттеры секциям (docs/design-spec-home4.md §4.5); у /home5 свой футер MinimalFooter (ТЗ §15)
	const isV2 = isV2Route(location.pathname)
	const topHeader = isTopHeaderRoute(location.pathname)
	const home5 = isHome5Route(location.pathname)

	return (
		<MotionConfig reducedMotion='user'>
			<ContactModalProvider>
				<ScrollToTop />
				<div className={topHeader ? 'main main--top' : 'main'}>
					{home5 ? <SiteHeader /> : topHeader ? <TopHeader /> : <LeftMenu />}
					<div className='container'>
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
									<Route path='/home2' element={<Home2Page />} />
									<Route path='/home3' element={<HomePage3 />} />
									<Route path='/home4' element={<HomePage4 />} />
									<Route path='/home5' element={<HomePage5 />} />
									<Route path='/services' element={<ServicesPage />} />
									<Route path='/services/:offer' element={<OfferPage />} />
									<Route path='/portfolio' element={<PortfolioPage />} />
									<Route path='/portfolio/:slug' element={<ProjectPage />} />
									<Route path='/about' element={<AboutPage />} />
									<Route path='/blog' element={<BlogPage />} />
									<Route path='/blog/:slug' element={<PostPage />} />
									<Route path='/contacts' element={<ContactsPage />} />
									<Route path='*' element={<NotFoundPage />} />
								</Routes>
							</motion.div>
						</AnimatePresence>

						{home5 ? (
							<MinimalFooter />
						) : isV2 ? (
							<SiteFooter />
						) : (
							<Card className='card__footer'>
								<Footer />
							</Card>
						)}
					</div>
				</div>
			</ContactModalProvider>
		</MotionConfig>
	)
}

export default App
