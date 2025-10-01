// scss
import { Fragment } from 'react'
import './InfoBlock.scss'

type Info = {
        label: string
        value: string
}

const INFO: Info[] = [
        { label: 'Стаж IT', value: '8 лет' },
        { label: 'Гражданство', value: 'РФ' },
        { label: 'Страна', value: 'Грузия' },
        { label: 'Возраст', value: '31' },
        { label: 'Язык', value: 'Русский' },
]

export default function InfoBlock() {
        return (
                <div className='infoBlock'>
                        {INFO.map(({ label, value }) => (
                                <Fragment key={label}>
                                        <span>{label}</span>
                                        <span>{value}</span>
                                </Fragment>
                        ))}
                </div>
        )
}
