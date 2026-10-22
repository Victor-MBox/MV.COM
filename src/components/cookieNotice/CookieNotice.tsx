import { useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { dismissNotice, getNoticeState, openCookieSettings, subscribeNotice } from '../../consent/privacyNotice'
import type { NoticeState } from '../../consent/privacyNotice'
import { COOKIE_NOTICE, COOKIE_SETTINGS_ENABLED, LEGAL_DOCS } from '../../data/legal'
import Button from '../button/Button'
import './CookieNotice.scss'

const serverSnapshot = (): NoticeState => 'dismissed'

/**
 * Информационное уведомление о хранилище при первом посещении (ТЗ §10, режим «аналитики нет»): компактная панель
 * внизу экрана, не перекрывает сайт и навигацию. «Понятно» закрывает её и сохраняет отметку (privacyNotice.ts),
 * ссылка — на /cookies; кнопка «Настройки» (окно CookieSettings) скрыта, пока COOKIE_SETTINGS_ENABLED = false. Прокрутка и ожидание ничего не включают — включать
 * нечего. Портал в body, под меню и модалкой (--z-notice)
 */
export default function CookieNotice() {
	const state = useSyncExternalStore(subscribeNotice, getNoticeState, serverSnapshot)

	return createPortal(
		<AnimatePresence>
			{state === 'open' && (
				<motion.section
					className='cookieNotice'
					role='region'
					aria-label={COOKIE_NOTICE.ariaLabel}
					initial={{ opacity: 0, y: 24 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 24 }}
					transition={{ duration: 0.3, ease: [0.2, 0.7, 0.2, 1] }}
				>
					<p className='cookieNotice__text'>
						{COOKIE_NOTICE.text} {COOKIE_NOTICE.more}
						<Link to={LEGAL_DOCS.cookies.path}>{COOKIE_NOTICE.link}</Link>.
					</p>
					<div className='cookieNotice__actions'>
						{COOKIE_SETTINGS_ENABLED && (
							<Button variant='secondary' onClick={openCookieSettings}>
								{COOKIE_NOTICE.settings}
							</Button>
						)}
						<Button onClick={() => dismissNotice()}>{COOKIE_NOTICE.accept}</Button>
					</div>
				</motion.section>
			)}
		</AnimatePresence>,
		document.body,
	)
}
