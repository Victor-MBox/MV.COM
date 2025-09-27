// scss
import './FooterBanner.scss'

export default function FooterBanner() {
	return (
		<section className='footerBanner'>
			<h2 className='footerBanner__title'>
				Есть проект? Свяжитесь со мной и я помогу воплотить его в жизнь
			</h2>
			<p className='footerBanner__subtitle'>
				Оставьте заявку на сайте или напишите в удобный для вас мессенджер
			</p>
			<button className='btn btn_light'>
				<p>Оставить заявку</p>
			</button>
		</section>
	)
}
