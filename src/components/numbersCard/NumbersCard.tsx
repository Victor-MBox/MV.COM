// scss
import './NumbersCard.scss'

import CountUp from '../countUp/CountUp'

type Stat = {
        label: string
        value: number
        duration: number
}

const STATS: Stat[] = [
        { label: 'Лет опыта', value: 8, duration: 4 },
        { label: 'Выполненных проектов', value: 83, duration: 2 },
        { label: 'Счастливых клиентов', value: 60, duration: 3 },
        { label: 'Запущенных MVP', value: 20, duration: 4 },
]

export default function NumbersCard() {
        return (
                <section className='numbersCard'>
                        {STATS.map(({ label, value, duration }) => (
                                <div key={label}>
                                        <CountUp
                                                from={0}
                                                to={value}
                                                separator=','
                                                direction='up'
                                                duration={duration}
                                                className='count-up-text'
                                        />
                                        <span>{label}</span>
                                </div>
                        ))}
                </section>
        )
}
