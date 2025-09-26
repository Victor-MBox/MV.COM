// scss
import './NumbersCard.scss'

import CountUp from '../countUp/CountUp'

export default function NumbersCard() {
	return (
		<section className='numbersCard'>
			<div>
				<CountUp
					from={0}
					to={8}
					separator=','
					direction='up'
					duration={4}
					className='count-up-text'
				/>
				<span>Лет опыта</span>
			</div>

			<div>
				<CountUp
					from={0}
					to={83}
					separator=','
					direction='up'
					duration={2}
					className='count-up-text'
				/>
				<span>Выполненных проекта</span>
			</div>

			<div>
				<CountUp
					from={0}
					to={60}
					separator=','
					direction='up'
					duration={3}
					className='count-up-text'
				/>
				<span>Счастливых клиентов</span>
			</div>

			<div>
				<CountUp
					from={0}
					to={20}
					separator=','
					direction='up'
					duration={4}
					className='count-up-text'
				/>
				<span>Хз что тут</span>
			</div>
		</section>
	)
}
