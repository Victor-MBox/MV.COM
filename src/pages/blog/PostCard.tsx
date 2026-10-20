import type { Post } from '../../data/posts'
import { formatDate } from '../../data/posts'
import Box from '../../components/box/Box'
import Chip from '../../components/chip/Chip'
import './PostCard.scss'

type Props = {
	post: Post
}

const MAX_TAGS = 2

/**
 * Карточка статьи (docs/design-spec.md §7.6, §9): строка моно «дата · N мин», заголовок, анонс, до двух тегов.
 * Обложек нет — карточка текстовая. Вся карточка — ссылка на статью, курсор-подпись «читать»
 */
export default function PostCard({ post }: Props) {
	return (
		<Box to={`/blog/${post.slug}`} className='postCard' glow cursor='читать'>
			<p className='postCard__meta'>
				<time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readingTime} мин
			</p>
			<h3 className='postCard__title'>{post.title}</h3>
			<p className='postCard__excerpt'>{post.excerpt}</p>
			{post.tags.length > 0 && (
				<ul className='postCard__tags'>
					{post.tags.slice(0, MAX_TAGS).map(t => (
						<Chip as='li' key={t}>
							{t}
						</Chip>
					))}
				</ul>
			)}
		</Box>
	)
}
