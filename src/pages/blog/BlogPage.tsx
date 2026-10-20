import PageHead from '../../components/pageHead/PageHead'
import Reveal from '../../components/reveal/Reveal'
import CtaBlock from '../../components/ctaBlock/CtaBlock'
import { POSTS } from '../../data/posts'
import PostCard from './PostCard'
import './BlogPage.scss'

// TODO (владелец): H1 блога (docs/design-spec.md §7.6, вариант «Пишу о том, что делаю»); лид — из прежней версии страницы
const HEAD = {
	title: { text: 'Пишу о том, что делаю', accent: 'что делаю' },
	lead: 'Заметки о фронтенде, анимациях, WordPress и интеграциях — то, что пригодилось мне на проектах и может пригодиться вам.',
}

/**
 * Блог (docs/design-spec.md §9): шапка → список статей карточками в две колонки (как секция блога на главной, §7.6) → CTA.
 * Раздел скрыт из меню, пока посты — заглушки; страница готова к реальным статьям
 */
export default function BlogPage() {
	return (
		<div className='blogPage'>
			<PageHead label='блог' title={HEAD.title} lead={HEAD.lead} />

			<section className='section' id='posts' aria-label='Статьи'>
				<div className='container'>
					<ul className='blogPage__grid'>
						{POSTS.map((post, i) => (
							<Reveal as='li' key={post.slug} index={i} className='blogPage__item'>
								<PostCard post={post} />
							</Reveal>
						))}
					</ul>
				</div>
			</section>

			<CtaBlock />
		</div>
	)
}
