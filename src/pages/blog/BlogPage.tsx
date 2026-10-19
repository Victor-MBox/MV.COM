import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import PageHeader from '../../components/pageHeader/PageHeader'
import FooterBanner from '../../components/footerBanner/FooterBanner'
import { POSTS, formatDate } from '../../data/posts'
import './BlogPage.scss'

export default function BlogPage() {
	const [featured, ...rest] = POSTS

	return (
		<>
			<PageHeader
				title='Блог'
				subtitle='Заметки о фронтенде, анимациях, WordPress и интеграциях — то, что пригодилось мне на проектах и может пригодиться вам.'
			/>

			<Link to={`/blog/${featured.slug}`} className='blogFeatured'>
				{featured.cover && (
					<div className='blogFeatured__media'>
						<img src={featured.cover} alt='' />
					</div>
				)}
				<div className='blogFeatured__body'>
					<div className='post__meta'>
						<time dateTime={featured.date}>{formatDate(featured.date)}</time>
						<span>{featured.readingTime} мин чтения</span>
					</div>
					<h2>{featured.title}</h2>
					<p>{featured.excerpt}</p>
					<ul className='post__tags'>
						{featured.tags.map(t => (
							<li key={t} className='tag'>
								{t}
							</li>
						))}
					</ul>
				</div>
			</Link>

			<section className='blogGrid'>
				{rest.map((post, i) => (
					<motion.article
						key={post.slug}
						className='postCard'
						initial={{ opacity: 0, y: 24 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: '-40px' }}
						transition={{ duration: 0.4, delay: i * 0.06 }}
					>
						<Link to={`/blog/${post.slug}`}>
							{post.cover && (
								<div className='postCard__media'>
									<img src={post.cover} alt='' loading='lazy' />
								</div>
							)}
							<div className='postCard__body'>
								<div className='post__meta'>
									<time dateTime={post.date}>{formatDate(post.date)}</time>
									<span>{post.readingTime} мин</span>
								</div>
								<h3>{post.title}</h3>
								<p>{post.excerpt}</p>
							</div>
						</Link>
					</motion.article>
				))}
			</section>

			<FooterBanner />
		</>
	)
}
