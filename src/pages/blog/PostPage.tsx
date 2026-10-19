import { Link, useParams } from 'react-router-dom'
import PageHeader from '../../components/pageHeader/PageHeader'
import FooterBanner from '../../components/footerBanner/FooterBanner'
import { POSTS, formatDate, getPost } from '../../data/posts'
import type { PostBlock } from '../../data/posts'
import NotFoundPage from '../NotFoundPage'
import './BlogPage.scss'

function Block({ block }: { block: PostBlock }) {
	switch (block.type) {
		case 'h2':
			return <h2>{block.text}</h2>
		case 'ul':
			return (
				<ul>
					{block.items.map(i => (
						<li key={i}>{i}</li>
					))}
				</ul>
			)
		case 'quote':
			return <blockquote>{block.text}</blockquote>
		case 'code':
			return (
				<pre>
					<code>{block.code}</code>
				</pre>
			)
		default:
			return <p>{block.text}</p>
	}
}

export default function PostPage() {
	const { slug } = useParams()
	const post = getPost(slug)
	if (!post) return <NotFoundPage />

	const others = POSTS.filter(p => p.slug !== post.slug).slice(0, 2)

	return (
		<article className='post' key={post.slug}>
			<PageHeader
				title={post.title}
				crumbs={[{ label: 'Блог', to: '/blog' }, { label: formatDate(post.date) }]}
				aside={
					<div className='post__aside'>
						<span>{post.readingTime} мин чтения</span>
						<ul className='post__tags'>
							{post.tags.map(t => (
								<li key={t} className='tag'>
									{t}
								</li>
							))}
						</ul>
					</div>
				}
			/>

			{post.cover && (
				<div className='post__cover'>
					<img src={post.cover} alt='' />
				</div>
			)}

			<div className='post__layout'>
				<div className='post__content'>
					{post.content.map((b, i) => (
						<Block key={i} block={b} />
					))}
				</div>
				<aside className='post__sidebar'>
					<div className='post__sidebar-title'>Ещё в блоге</div>
					{others.map(o => (
						<Link key={o.slug} to={`/blog/${o.slug}`} className='post__more'>
							<time dateTime={o.date}>{formatDate(o.date)}</time>
							<strong>{o.title}</strong>
						</Link>
					))}
					<Link to='/blog' className='link-btn'>
						<span>Все статьи</span>
					</Link>
				</aside>
			</div>

			<FooterBanner />
		</article>
	)
}
