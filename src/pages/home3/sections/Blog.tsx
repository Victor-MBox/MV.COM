import { POSTS, formatDate } from '../../../data/posts'
import { H2 } from '../../../data/home3'
import SectionHead from '../../../components/sectionHead/SectionHead'
import Reveal from '../../../components/reveal/Reveal'
import Box from '../../../components/box/Box'

const HOME_POSTS = POSTS.slice(0, 3)

/** Блог (docs/design-spec.md §7.6): три карточки без обложек и свечения. Нет статей — секции нет */
export default function Blog() {
	if (HOME_POSTS.length === 0) return null

	return (
		<section className='home3Section' id='blog'>
			<SectionHead label='блог' title={H2.blog} action={{ label: 'Все статьи', to: '/blog' }} />
			<div className='blog__grid'>
				{HOME_POSTS.map((post, i) => (
					<Reveal key={post.slug} index={i}>
						<Box to={`/blog/${post.slug}`} className='postBox' cursor='читать'>
							<p className='postBox__meta'>
								<time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readingTime} мин
							</p>
							<h3 className='postBox__title'>{post.title}</h3>
							<p className='postBox__excerpt'>{post.excerpt}</p>
						</Box>
					</Reveal>
				))}
			</div>
		</section>
	)
}
