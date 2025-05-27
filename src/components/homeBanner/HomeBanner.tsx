// scss
import './HomeBanner.scss'

// img
import banner from '../../resources/victor.png'

export default function HomeBanner() {
	return (
		<div className='homeBanner'>
			<h1 className='homeBanner__title'>Разработка без лишнего шума</h1>
			<p className='homeBanner__subtitle'>
				<p>
					&lt; <span>code</span> &gt;
				</p>
				 Я создаю веб-интерфейсы 
				<p>
					&lt;/ <span>code</span> &gt;
				</p>
			</p>
			<button className='btn'>
				<span>Скачать CV</span>
			</button>
			<img src={banner} alt='victor' />
		</div>
	)
}
