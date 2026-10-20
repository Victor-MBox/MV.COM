import { FINAL_META, FINAL_TITLE, STRIP, WATERMARK } from '../../../data/home'
import { useContactModal } from '../../../components/contactModal/ContactModalContext'
import SplitLines from '../../../components/splitLines/SplitLines'
import Reveal from '../../../components/reveal/Reveal'
import Button from '../../../components/button/Button'
import Marquee from '../../../components/marquee/Marquee'
import Watermark from '../../../components/watermark/Watermark'

/**
 * Финал (docs/design-spec-home4.md §6.9): инвертированная бегущая строка офферов с ✦, «Давайте работать» в две строки,
 * кнопка в модалку, мета-ряд FINAL_META («Работаю удалённо» · роль; города и часов нет — решение владельца от 20.10.2026)
 * и водяной знак. Встроенной формы нет; футер рендерит App (SiteFooter)
 */
export default function Final() {
	const { open } = useContactModal()

	return (
		<section className='section homeFinal' id='contact'>
			<div className='homeFinal__strip'>
				<Marquee duration={30} label='Услуги'>
					{STRIP.map(title => (
						<span key={title} className='homeFinal__stripItem'>
							{title}
							<i aria-hidden='true'>✦</i>
						</span>
					))}
				</Marquee>
			</div>
			<div className='container homeFinal__in'>
				<SplitLines as='h2' className='homeFinal__title' lines={FINAL_TITLE} />
				<Reveal className='homeFinal__cta'>
					<Button onClick={() => open()}>Обсудить проект</Button>
				</Reveal>
				<Reveal className='homeFinal__meta'>
					{FINAL_META.map(item => (
						<span key={item}>{item}</span>
					))}
				</Reveal>
			</div>
			<Watermark text={WATERMARK} className='homeFinal__mark' />
		</section>
	)
}
