import { Link } from 'react-router-dom'
import { formatDate } from '../../../data/posts'
import { BLOG_HEAD, BLOG_VISIBLE, SECTIONS, latestPosts } from '../../../data/home5'
import SectionIntro from '../../../components/sectionIntro/SectionIntro'
import Reveal from '../../../components/reveal/Reveal'

/**
 * Блог (ТЗ §13): три последние статьи строками — категория, заголовок, дата, стрелка; без обложек.
 * Пока в posts.ts примеры, секция видна только в dev (BLOG_VISIBLE); в production появится с BLOG_PUBLISHED = true
 */
export default function Blog() {
	if (!BLOG_VISIBLE) return null
	const posts = latestPosts()
	if (!posts.length) return null
	const { num, label, id } = SECTIONS.blog

	return (
		<section className='h5Section h5Blog' id={id} aria-labelledby={`${id}-title`}>
			<div className='h5Container'>
				<Reveal y={16}>
					<SectionIntro
						id={`${id}-title`}
						num={num}
						label={label}
						title={BLOG_HEAD.title}
						lead={BLOG_HEAD.lead}
						action={{ label: BLOG_HEAD.action, to: '/blog' }}
					/>
				</Reveal>
				<ul className='h5Blog__list'>
					{posts.map((post, i) => (
						<Reveal as='li' key={post.slug} index={i} y={16}>
							<Link to={`/blog/${post.slug}`} className='h5Post'>
								<span className='h5Post__cat'>{post.tags[0]}</span>
								<h3 className='h5Post__title'>{post.title}</h3>
								<span className='h5Post__foot'>
									<time dateTime={post.date}>{formatDate(post.date)}</time>
									<i aria-hidden='true'>↗</i>
								</span>
							</Link>
						</Reveal>
					))}
				</ul>
			</div>
		</section>
	)
}
