import SplitLines from '../components/splitLines/SplitLines'
import Reveal from '../components/reveal/Reveal'
import Button from '../components/button/Button'
import { useDocumentMeta } from '../hooks/useDocumentMeta'
import { SITE_META } from '../data/meta'
import './NotFoundPage.scss'

/**
 * 404 (docs/design-spec.md §9): девиз «Страницы нет.» кеглем финала главной, строка текста и две текстовые ссылки.
 * Мета — «Страница не найдена» с noindex и без canonical; HTTP-статус 404 отдаёт хостинг, не приложение
 */
export default function NotFoundPage() {
	useDocumentMeta(SITE_META.notFound)
	return (
		<section className='section notFound'>
			<div className='container notFound__in'>
				<SplitLines as='h1' className='notFound__title' lines={['Страницы', 'нет.']} trigger='now' />
				<Reveal className='notFound__text' delay={0.16}>
					<p>Возможно, ссылка устарела или в адресе опечатка.</p>
				</Reveal>
				<Reveal className='notFound__actions' delay={0.24}>
					<Button variant='text' to='/'>
						На главную
					</Button>
					<Button variant='text' to='/services'>
						Услуги
					</Button>
				</Reveal>
			</div>
		</section>
	)
}
