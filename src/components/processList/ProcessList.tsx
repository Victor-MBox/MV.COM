import { motion } from 'framer-motion'
import { PROCESS } from '../../data/experience'
import './ProcessList.scss'

type Props = {
	className?: string
	/** timeline — четыре колонки с линией через номера (/services, офферы); rows — строки с крупным номером слева (главная); columns — колонки с тонким крупным номером под верхней линией (/home2) */
	variant?: 'timeline' | 'rows' | 'columns'
}

/** Четыре шага работы без картинок — единственный процесс на сайте (content.md §4.4). Шаги появляются по очереди */
export default function ProcessList({ className = '', variant = 'timeline' }: Props) {
	return (
		<ol className={`processList${variant === 'timeline' ? '' : ` processList--${variant}`} ${className}`.trim()}>
			{PROCESS.map((step, i) => (
				<motion.li
					key={step.step}
					initial={{ opacity: 0, y: 16 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true, margin: '-40px' }}
					transition={{ duration: 0.4, delay: i * 0.1, ease: [0.4, 0, 0.2, 1] }}
				>
					<span className='processList__num'>{step.step}</span>
					<h3>{step.title}</h3>
					<p>{step.text}</p>
				</motion.li>
			))}
		</ol>
	)
}
