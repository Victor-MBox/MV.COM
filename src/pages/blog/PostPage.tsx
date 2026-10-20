import { Link, useParams } from 'react-router-dom'
import PageHead from '../../components/pageHead/PageHead'
import SectionHead from '../../components/sectionHead/SectionHead'
import Reveal from '../../components/reveal/Reveal'
import Chip from '../../components/chip/Chip'
import CtaBlock from '../../components/ctaBlock/CtaBlock'
import { POSTS, formatDate, getPost } from '../../data/posts'
import type { PostBlock } from '../../data/posts'
import NotFoundPage from '../NotFoundPage'
import PostCard from './PostCard'
import './PostPage.scss'

/** Блок статьи (src/data/posts.ts PostBlock): абзац, подзаголовок, список, цитата, код */
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

/**
 * Статья (docs/design-spec.md §9): шапка с крошкой, датой и временем чтения, теги → тело в колонке 68ch →
 * «Ещё в блоге» двумя карточками → CTA. Нет поста — 404
 */
export default function PostPage() {
	const { slug } = useParams()
	const post = getPost(slug)
	if (!post) return <NotFoundPage />

	const others = POSTS.filter(p => p.slug !== post.slug).slice(0, 2)
	const meta = (
		<span className='postPage__meta'>
			<Link to='/blog'>Блог</Link> · <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readingTime} мин чтения
		</span>
	)

	return (
		<article className='postPage' key={post.slug}>
			<PageHead
				label='статья'
				title={{ text: post.title }}
				meta={meta}
				actions={
					post.tags.length > 0 && (
						<ul className='postPage__tags' aria-label='Теги'>
							{post.tags.map(t => (
								<Chip as='li' key={t}>
									{t}
								</Chip>
							))}
						</ul>
					)
				}
				className='postPage__head'
			/>

			<section className='section' id='content' aria-label='Текст статьи'>
				<div className='container postPage__grid'>
					<Reveal className='postPage__body'>
						{post.content.map((b, i) => (
							<Block key={i} block={b} />
						))}
					</Reveal>
				</div>
			</section>

			{others.length > 0 && (
				<section className='section' id='more'>
					<div className='container'>
						<SectionHead label='ещё' title={{ text: 'Ещё в блоге' }} action={{ label: 'Все статьи', to: '/blog' }} />
						<ul className='postPage__more'>
							{others.map((o, i) => (
								<Reveal as='li' key={o.slug} index={i} className='postPage__moreItem'>
									<PostCard post={o} />
								</Reveal>
							))}
						</ul>
					</div>
				</section>
			)}

			<CtaBlock />
		</article>
	)
}
