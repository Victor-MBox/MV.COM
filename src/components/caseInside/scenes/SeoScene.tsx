import { motion, useTransform } from 'framer-motion'
import { Appear, Icon, Note } from '../kit'
import { NrPage } from '../product/base'
import { GameHero, GamePromo, ProfileTabs } from '../product/pages'
import { useAfter, useCount } from '../timeline'
import type { SceneProps } from './types'

const GAME = { id: 730, slug: 'counter-strike-2', title: 'Counter-Strike 2', seekers: 146, steam: 297, parties: 2 }
const TEMPLATE_AT = 0.16
const FILL_AT = 0.3
const PAGE_AT = 0.44
const PROMO_AT = 0.6
const LOG_AT = 0.72
const SITEMAP = ['sitemap.xml', '├ sitemap-static.xml', '├ sitemap-games-1.xml', '├ sitemap-games-2.xml', '├ sitemap-parties.xml', '└ sitemap-teammates.xml']

/** 04 · страницы и seo: строка таблицы игр → Blade-шаблон → настоящая страница игры; карта сайта по секциям и журнал ботов */
export default function SeoScene({ p }: SceneProps) {
	const filled = useAfter(p, FILL_AT)
	const page = useAfter(p, PAGE_AT)
	const promo = useAfter(p, PROMO_AT)
	const flow1 = useTransform(p, [TEMPLATE_AT - 0.06, TEMPLATE_AT], [0, 1])
	const seekers = useCount(p, 0.62, 0.7, 0, GAME.seekers)
	const steam = useCount(p, 0.62, 0.7, 0, GAME.steam)
	const title = filled ? GAME.title : '{{ $game->title }}'

	return (
		<NrPage className='sc-seo'>
			<div className='sc-seo__main'>
				<div className='sc-seo__left'>
					<Appear p={p} at={0.02} until={LOG_AT} className='nr-card nr-card--deep sc-seo__data'>
						<span className='nr-mono sc-seo__cardLabel'>
							<Icon name='cog' size={11} /> games · строка
						</span>
						<dl className='sc-seo__kv'>
							<dt>id</dt>
							<dd>{GAME.id}</dd>
							<dt>slug</dt>
							<dd>{GAME.slug}</dd>
							<dt>title</dt>
							<dd>{GAME.title}</dd>
							<dt>steam_deck</dt>
							<dd className='nr-green'>true</dd>
							<dt>seekers</dt>
							<dd>{GAME.seekers}</dd>
						</dl>
					</Appear>
					<motion.span className='sc-seo__arrow' style={{ opacity: flow1 }}>
						↓
					</motion.span>
					<Appear p={p} at={TEMPLATE_AT} until={LOG_AT} className='nr-card nr-card--deep sc-seo__tpl'>
						<span className='nr-mono sc-seo__cardLabel'>
							<Icon name='page' size={11} /> games/show.blade.php
						</span>
						<pre className={`sc-seo__code${filled ? ' is-filled' : ''}`}>
							{'<title>'}
							<i>Тиммейты и пати для </i>
							<em>{title}</em>
							{' | NoRandoms</title>\n'}
							{'<h1 class="game-hero__title">'}
							<i>Тиммейты и пати для </i>
							<em>{title}</em>
							{'</h1>\n'}
							{'Ищут тиммейта: '}
							<em>{filled ? GAME.seekers : '{{ $seekers }}'}</em>
							{' игроков\n'}
							{'@foreach ($faq as $q) … @endforeach'}
						</pre>
					</Appear>
					<Appear p={p} at={LOG_AT} className='nr-card nr-card--deep sc-seo__sitemap'>
						<span className='nr-mono sc-seo__cardLabel'>
							<Icon name='clock' size={11} /> schedule:run · seo:sitemap:generate
						</span>
						<div className='nr-log'>
							{SITEMAP.map((line, i) => (
								<Appear p={p} at={LOG_AT + 0.02 + i * 0.02} key={line} y={4}>
									{line}
								</Appear>
							))}
						</div>
					</Appear>
					<Appear p={p} at={0.86} className='nr-card nr-card--deep sc-seo__bots'>
						<span className='nr-mono sc-seo__cardLabel'>
							<Icon name='globe' size={11} /> access.log
						</span>
						<div className='nr-log'>
							<Appear p={p} at={0.88} y={4}>
								<i>YandexBot</i> GET /games/valheim <em>200</em>
							</Appear>
							<Appear p={p} at={0.92} y={4}>
								<i>Googlebot</i> GET /games/dota-2?tab=players <em>200</em>
							</Appear>
							<Appear p={p} at={0.96} y={4}>
								<i>YandexBot</i> GET /sitemap-games-2.xml <em>200</em>
							</Appear>
						</div>
					</Appear>
				</div>

				<div className='sc-seo__page'>
					<Appear p={p} at={PAGE_AT} y={14} className='sc-seo__hero'>
						<GameHero
							title={`Тиммейты и пати для ${GAME.title}`}
							description={`Найдите игроков по ${GAME.title} с похожим стилем и праймтаймом в NoRandoms. Смотрите активные пати, оценивайте пул игроков и собирайте команду под кооп или рейтинг.`}
							cover='cs2'
							deck
							genres='Экшены, Бесплатные'
						/>
					</Appear>
					{page && (
						<Appear p={p} at={PAGE_AT + 0.06} y={8}>
							<ProfileTabs active={0} />
						</Appear>
					)}
					{promo && (
						<Appear p={p} at={PROMO_AT} y={10}>
							<GamePromo game={GAME.title} seekers={<motion.span>{seekers}</motion.span>} parties={GAME.parties} steam={<motion.span>{steam}</motion.span>} />
						</Appear>
					)}
					<Appear p={p} at={FILL_AT + 0.04} until={PAGE_AT + 0.06} className='sc-seo__note'>
						<Note tone='accent'>серверный HTML: поисковик получает готовую страницу</Note>
					</Appear>
				</div>
			</div>
		</NrPage>
	)
}
