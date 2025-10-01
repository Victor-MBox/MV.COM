// scss
import './HomeBanner.scss'

// img
import banner from '../../resources/victor.png'

export default function HomeBanner() {
        return (
                <section className='homeBanner'>
                        <h1 className='homeBanner__title'>Разработка без лишнего шума</h1>
                        <div className='homeBanner__subtitle' role='presentation'>
                                <span className='homeBanner__subtitle-code' aria-hidden='true'>
                                        &lt; <span>code</span> &gt;
                                </span>
                                <span className='homeBanner__subtitle-text'>Я создаю веб-интерфейсы</span>
                                <span className='homeBanner__subtitle-code' aria-hidden='true'>
                                        &lt;/ <span>code</span> &gt;
                                </span>
                        </div>
                        <button className='btn btn_light' type='button'>
                                <span className='btn__label'>
                                        Скачать CV
                                        <svg
                                                width='24'
                                                height='24'
                                                viewBox='0 0 24 24'
                                                fill='none'
                                                xmlns='http://www.w3.org/2000/svg'
                                        >
                                                <path
                                                        d='M3 15C3 17.8284 3 19.2426 3.87868 20.1213C4.75736 21 6.17157 21 9 21H15C17.8284 21 19.2426 21 20.1213 20.1213C21 19.2426 21 17.8284 21 15'
                                                        stroke-width='1.5'
                                                        stroke-linecap='round'
                                                        stroke-linejoin='round'
                                                />
                                                <path
                                                        d='M12 3V16M12 16L16 11.625M12 16L8 11.625'
                                                        stroke-width='1.5'
                                                        stroke-linecap='round'
                                                        stroke-linejoin='round'
                                                />
                                        </svg>
                                </span>
                        </button>
                        <img src={banner} alt='victor' />
                </section>
        )
}
