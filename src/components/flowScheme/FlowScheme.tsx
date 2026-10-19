import { motion } from 'framer-motion'
import { Fragment } from 'react'
import './FlowScheme.scss'

type Props = { nodes: string[] }

/** Схема процесса: узлы слева направо, появляются по очереди при прокрутке */
export default function FlowScheme({ nodes }: Props) {
	return (
		<div className='flow' role='img' aria-label={`Схема: ${nodes.join(' → ')}`}>
			{nodes.map((n, i) => (
				<Fragment key={n}>
					<motion.span
						className='flow__node'
						initial={{ opacity: 0, y: 10 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: '-40px' }}
						transition={{ duration: 0.35, delay: i * 0.12 }}
					>
						<i>{String(i + 1).padStart(2, '0')}</i>
						{n}
					</motion.span>
					{i < nodes.length - 1 && (
						<motion.span
							className='flow__arrow'
							aria-hidden='true'
							initial={{ opacity: 0, scaleX: 0 }}
							whileInView={{ opacity: 1, scaleX: 1 }}
							viewport={{ once: true, margin: '-40px' }}
							transition={{ duration: 0.3, delay: i * 0.12 + 0.1 }}
						/>
					)}
				</Fragment>
			))}
		</div>
	)
}
