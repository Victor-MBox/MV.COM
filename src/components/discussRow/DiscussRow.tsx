import Button from '../button/Button'
import Reveal from '../reveal/Reveal'
import './DiscussRow.scss'

type Props = {
	/** Что прислать: «Пришлите ссылку на сайт и расскажите…» */
	text: string
	/** Подпись кнопки — открывает окно обращения с темой страницы */
	cta: string
	onClick: () => void
	/** Соседние услуги под строкой — обычные текстовые ссылки */
	links?: { label: string; to: string }[]
	linksLabel?: string
}

/**
 * Обращение в конце страницы услуги и обзора продвижения (ТЗ от 22.10.2026): строка «что прислать» и кнопка в окно
 * обращения (secondary — primary на этом экране уже у формы футера), под ней ссылки на смежные услуги. Своей формы нет —
 * она в футере
 */
export default function DiscussRow({ text, cta, onClick, links = [], linksLabel = 'смежные услуги' }: Props) {
	return (
		<div className='discussRow'>
			<Reveal className='discussRow__main'>
				<p className='discussRow__text'>{text}</p>
				<Button variant='secondary' onClick={onClick}>
					{cta}
				</Button>
			</Reveal>
			{links.length > 0 && (
				<Reveal className='discussRow__links' delay={0.08}>
					<p className='discussRow__label'>{linksLabel}</p>
					<ul aria-label={linksLabel}>
						{links.map(l => (
							<li key={l.to}>
								<Button variant='text' to={l.to}>
									{l.label}
								</Button>
							</li>
						))}
					</ul>
				</Reveal>
			)}
		</div>
	)
}
