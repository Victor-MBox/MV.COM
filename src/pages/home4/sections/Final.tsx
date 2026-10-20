import { FINAL_META, FINAL_TITLE, STRIP, WATERMARK } from '../../../data/home4'
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
		<section className='h4Section h4Final' id='contact'>
			<div className='h4Final__strip'>
				<Marquee duration={30} label='Услуги'>
					{STRIP.map(title => (
						<span key={title} className='h4Final__stripItem'>
							{title}
							<i aria-hidden='true'>✦</i>
						</span>
					))}
				</Marquee>
			</div>
			<div className='h4Container h4Final__in'>
				<SplitLines as='h2' className='h4Final__title' lines={FINAL_TITLE} />
				<Reveal className='h4Final__cta'>
					<Button onClick={() => open()}>Обсудить проект</Button>
				</Reveal>
				<Reveal className='h4Final__meta'>
					{FINAL_META.map(item => (
						<span key={item}>{item}</span>
					))}
				</Reveal>
			</div>
			<Watermark text={WATERMARK} className='h4Final__mark' />
		</section>
	)
}
