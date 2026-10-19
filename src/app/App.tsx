import { Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'

import LeftMenu from '../components/leftMenu/LeftMenu'
import Card from '../components/cards/Cards'
import Footer from '../components/footer/Footer'
import ScrollToTop from '../components/scrollToTop/ScrollToTop'
import ContactModalProvider from '../components/contactModal/ContactModalProvider'

import HomePage from '../pages/home/HomePage'
import ServicesPage from '../pages/services/ServicesPage'
import DirectionPage from '../pages/services/DirectionPage'
import ServicePage from '../pages/services/ServicePage'
import PortfolioPage from '../pages/portfolio/PortfolioPage'
import ProjectPage from '../pages/portfolio/ProjectPage'
import AboutPage from '../pages/about/AboutPage'
import BlogPage from '../pages/blog/BlogPage'
import PostPage from '../pages/blog/PostPage'
import ContactsPage from '../pages/contacts/ContactsPage'
import NotFoundPage from '../pages/NotFoundPage'

function App() {
	const location = useLocation()

	return (
		<ContactModalProvider>
			<ScrollToTop />
			<div className='main'>
				<LeftMenu />
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
								<Route path='/services' element={<ServicesPage />} />
								<Route path='/services/:group' element={<DirectionPage />} />
								<Route path='/services/:group/:service' element={<ServicePage />} />
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

					<Card className='card__footer'>
						<Footer />
					</Card>
				</div>
			</div>
		</ContactModalProvider>
	)
}

export default App
