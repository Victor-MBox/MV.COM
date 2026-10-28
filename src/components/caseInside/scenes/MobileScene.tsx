import { motion, useTransform } from 'framer-motion'
import { Appear, Note } from '../kit'
import { NrPage } from '../product/base'
import { PartyChat, PartyMembers, PartyOwner, PartyPage, VoiceCard } from '../product/room'
import { PHONE, screenStyle } from '../../../data/devices'
import { NORANDOMS_STORY } from '../../../data/caseStory'
import { seg } from '../timeline'
import type { SceneProps } from './types'

const SHRINK = [0.05, 0.4] as const
const PHONE_AT = 0.3
const SCROLL = [0.5, 0.95] as const
/** Прокрутка мобильной страницы внутри телефона, px холста 390 */
const SCROLL_PX = [0, 1500] as const
const { phone } = NORANDOMS_STORY
const PHONE_W = 236
const K = PHONE_W / PHONE.w
const SCREEN_W = PHONE.screen.w * K

const XOTTAB = { name: 'Xottab', gender: 'male', avatar: 'bot' } as const

/** 08 · мобильная версия: страница пати сжимается, выезжает iPhone с настоящими мобильными экранами norandoms.team */
export default function MobileScene({ p }: SceneProps) {
	const deskScale = useTransform(p, [SHRINK[0], SHRINK[1]], [1, 0.34])
	const deskO = useTransform(p, [SHRINK[0], SHRINK[1], 0.5], [1, 0.5, 0.35])
	const phoneY = useTransform(p, [PHONE_AT, PHONE_AT + 0.15], [160, 0])
	const phoneO = useTransform(p, [PHONE_AT, PHONE_AT + 0.1], [0, 1])
	const scroll = useTransform(p, v => -(SCROLL_PX[0] + (SCROLL_PX[1] - SCROLL_PX[0]) * seg(v, SCROLL[0], SCROLL[1])))

	return (
		<NrPage className='sc-mobile'>
			<motion.div className='sc-mobile__desk' style={{ scale: deskScale, opacity: deskO }}>
				<PartyPage
					main={
						<>
							<VoiceCard />
							<PartyChat game='Valheim' messages={[{ author: XOTTAB, time: '18:40', text: 'Всем привет! Будут желающие — арендую и настрою сервер.', mine: true }]} />
						</>
					}
					sidebar={
						<>
							<PartyOwner owner={XOTTAB} desc='Ванильный сервер, без гонки за прогрессом.' status='Открыта' />
							<PartyMembers main={[{ person: XOTTAB, context: 'Наиграл 312 ч', presence: 'online' }]} bench={[]} mainSize={4} benchSize={2} />
						</>
					}
				/>
			</motion.div>

			<motion.div className='sc-mobile__phone' style={{ y: phoneY, opacity: phoneO, width: PHONE_W }}>
				<div className='sc-mobile__screen' style={screenStyle(PHONE)}>
					<div className='sc-mobile__canvas' style={{ width: PHONE.canvas.w, height: PHONE.canvas.h, transform: `scale(${(SCREEN_W / PHONE.canvas.w).toFixed(5)})` }}>
						<motion.div className='sc-mobile__move' style={{ top: PHONE.canvas.top + phone.headerHeight, y: scroll }}>
							<img src={phone.content} alt='' width={PHONE.canvas.w} height={phone.contentHeight} decoding='async' draggable={false} />
						</motion.div>
						<div className='sc-mobile__top' style={{ height: PHONE.canvas.top + phone.headerHeight }}>
							<div className='sc-mobile__header' style={{ top: PHONE.canvas.top, height: phone.headerHeight }}>
								<img src={phone.view} alt='' width={phone.viewW} height={phone.viewH} decoding='async' draggable={false} />
							</div>
						</div>
						<img className='sc-mobile__nav' src={phone.nav.src} alt='' style={{ left: phone.nav.x, top: phone.nav.y, width: phone.nav.w, height: phone.nav.h }} decoding='async' draggable={false} />
						<i className='sc-mobile__home' />
					</div>
				</div>
				<img className='sc-mobile__frame' src={PHONE.src} alt='' width={PHONE.w} height={PHONE.h} decoding='async' draggable={false} />
			</motion.div>

			<Appear p={p} at={0.5} className='sc-mobile__note sc-mobile__note--a'>
				<Note>те же шаблоны · раскладка через CSS</Note>
			</Appear>
			<Appear p={p} at={0.72} className='sc-mobile__app'>
				<div className='nr-card nr-card--deep sc-mobile__appCard'>
					<span className='nr-mono sc-mobile__appLabel'>mobile/ · Expo · React Native</span>
					<ul className='nr-log'>
						<li>
							<i>api ▸</i> только /api/mobile/*
						</li>
						<li>
							<i>push ▸</i> FCM / APNs
						</li>
						<li>
							<em>reverb ▸</em> те же каналы, что у сайта
						</li>
					</ul>
				</div>
			</Appear>
			<Appear p={p} at={0.9} className='sc-mobile__note sc-mobile__note--b'>
				<Note tone='accent'>телефон · ПК · Steam Deck</Note>
			</Appear>
		</NrPage>
	)
}
