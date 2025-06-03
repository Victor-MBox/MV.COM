// scss
import './Skills.scss'
type Skill = { name: string; percent: number }

const skills: Skill[] = [
	{ name: 'React.js', percent: 70 },
	{ name: 'WordPress', percent: 90 },
	{ name: 'GSAP-анимации', percent: 80 },
	{ name: 'CRM Интеграции', percent: 70 },
	{ name: 'SEO', percent: 50 },
	{ name: 'Design', percent: 40 },
]

export default function Skills() {
	return (
		<>
			<div className='title'>Навыки</div>

			<div className='skills'>
				{skills.map(({ name, percent }) => (
					<div className='skills__item' key={name}>
						<div className='skill'>{name}</div>
						<div className='percent'>{percent}%</div>

						{/* передаём число сразу в ширину */}
						<div className='scale'>
							<span className='scale__bg' />
							<span
								className='scale__active'
								style={{ width: `${percent}%` }} // ← здесь вся магия
							/>
						</div>
					</div>
				))}
			</div>
		</>
	)
}
