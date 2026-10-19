import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { formatDate } from '../../data/posts'
import type { Post } from '../../data/posts'
import './PostTile.scss'

const MotionLink = motion.create(Link)

type Props = {
	post: Post
	/** Порядковый номер в сетке — задержка появления */
	index?: number
}

/** Плитка статьи для главной: тег, заголовок, анонс, дата и время чтения. Сетка — `.homePosts` */
export default function PostTile({ post, index = 0 }: Props) {
	return (
		<MotionLink
			to={`/blog/${post.slug}`}
			className='postTile'
			initial={{ opacity: 0, y: 18 }}
			whileInView={{ opacity: 1, y: 0 }}
			whileHover={{ y: -3 }}
			viewport={{ once: true, margin: '-40px' }}
			transition={{ duration: 0.4, delay: (index % 3) * 0.07, ease: [0.4, 0, 0.2, 1] }}
		>
			{post.tags[0] && <span className='postTile__tag'>{post.tags[0]}</span>}
			<h3 className='postTile__title'>{post.title}</h3>
			<span className='postTile__excerpt'>{post.excerpt}</span>
			<span className='postTile__meta'>
				<time dateTime={post.date}>{formatDate(post.date)}</time>
				<span>{post.readingTime} мин</span>
			</span>
		</MotionLink>
	)
}
