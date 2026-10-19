import { Link } from 'react-router-dom'

export default function NotFoundPage() {
	return (
		<section className='notFound'>
			<span className='notFound__code'>404</span>
			<h1>Такой страницы нет</h1>
			<p>Возможно, ссылка устарела или в адресе опечатка.</p>
			<Link to='/' className='btn btn_light'>
				<span className='btn__label'>На главную</span>
			</Link>
		</section>
	)
}
