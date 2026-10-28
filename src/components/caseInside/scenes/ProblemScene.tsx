import { motion, useTransform } from 'framer-motion'
import { Appear, Avatar, Note } from '../kit'
import { NrPage } from '../product/base'
import { TeammateCard } from '../product/cards'
import { useStep } from '../timeline'
import type { SceneProps } from './types'

const CHAT = [
	{ who: 'Kirill', tone: 0, text: '+1 кс, есть микро' },
	{ who: 'nagibator', tone: 1, text: 'го дотку? без токсиков плз' },
	{ who: 'Xottab', tone: 2, text: 'ищу 2 в R.E.P.O., сейчас' },
	{ who: 'Masha', tone: 3, text: 'вальхейм вечером, релакс, 25+' },
	{ who: 'Vasilevs', tone: 4, text: 'cs2, ап ранга, микро обяз, с 20 до 24', key: true },
	{ who: 'Den', tone: 5, text: 'кто в пик?' },
	{ who: 'Kirill', tone: 0, text: '@all ???' },
]
const MSG_FROM = 0.03
const MSG_STEP = 0.05
const SPLIT = 0.46
/** Поля анкеты заполняются по шагам: описание, статус, устройства, Steam */
const FILL = [0.56, 0.64, 0.72, 0.82]

/** 01 · задача: поток сообщений из чужого чата → настоящая карточка анкеты NoRandoms заполняется полями */
export default function ProblemScene({ p }: SceneProps) {
	const chatDim = useTransform(p, [SPLIT, SPLIT + 0.1], [1, 0.4])
	const step = useStep(p, [SPLIT, ...FILL])
	const keyed = step > 0
	const filled = Math.max(0, step - 1)

	return (
		<NrPage className='sc-problem'>
			<div className='sc-problem__main'>
				<motion.div className='sc-problem__chatWrap' style={{ opacity: chatDim }}>
					<div className='nr-card nr-card--deep sc-problem__chat'>
						<div className='sc-problem__chatHead'>
							<span className='nr-mono'># поиск-пати</span>
							<span className='nr-mono'>общий чат</span>
						</div>
						<div className='sc-problem__feed'>
							{CHAT.map((m, i) => (
								<Appear p={p} at={MSG_FROM + i * MSG_STEP} key={i} className={`nr-msg${m.key && keyed ? ' is-key' : ''}`}>
									<Avatar name={m.who} tone={m.tone} size={22} />
									<span className='nr-msg__body'>
										<span className='nr-msg__meta'>
											<b>{m.who}</b>
										</span>
										{m.text}
									</span>
								</Appear>
							))}
						</div>
						<Appear p={p} at={SPLIT + 0.1} className='sc-problem__noteWrap'>
							<Note>
								свободный текст <span className='nr-muted'>· не отфильтровать</span>
							</Note>
						</Appear>
					</div>
				</motion.div>

				<div className='sc-problem__right'>
					<Appear p={p} at={0} until={SPLIT - 0.04} y={0} className='sc-problem__empty'>
						<span>
							анкета игрока
							<br />
							<span className='nr-mono'>пока ничего не известно</span>
						</span>
					</Appear>
					<Appear p={p} at={SPLIT} y={16} className='sc-problem__card'>
						<TeammateCard
							person={{ name: 'Vasilevs', gender: 'male' }}
							presence={filled >= 2 ? 'recent' : 'offline'}
							status={filled >= 2 ? 'Активно ищу пати' : 'Не беспокоить'}
							about={filled >= 1 ? '30 лет. Играю почти в любое время, с 8 до 24 по МСК. CS2 — ап ранга, микрофон обязателен. Без токсичности.' : undefined}
							chips={filled >= 3 ? ['ПК', 'Геймпад'] : []}
							steamGame={filled >= 4 ? 'Counter-Strike 2' : undefined}
						/>
					</Appear>
					<Appear p={p} at={0.92} className='sc-problem__noteWrap sc-problem__noteWrap--right'>
						<Note tone='accent'>анкета: поля-справочники — по ним ищут и сравнивают</Note>
					</Appear>
				</div>
			</div>
		</NrPage>
	)
}
