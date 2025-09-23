// img
import avatar from '../../resources/avatar.png'

// components
import ThemeButton from '../themeButton/ThemeButton'
import SocBtn from '../socBtn/SocBtn'

import ShinyText from '../shinyText/ShinyText'

// scss
import './LeftMenu.scss'

export default function LeftMenu() {
	return (
		<div className='leftMenu'>
			<div className='leftMenu__wrapper smooth'>
				<div className='avatar'>
					<div className='avatar__wrapper'>
						<img src={avatar} alt='avatar' />
						<div className='decor'></div>
					</div>
					<div className='name'>Виктор Мацаков</div>
					<div className='stack'>Full-stack developer </div>
				</div>
				<div className='menu'>
					<ul>
						<li className='active'>
							<a href='##'>
								<svg
									width='24'
									height='24'
									viewBox='0 0 24 24'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										d='M2 12.2039C2 9.91549 2 8.77128 2.5192 7.82274C3.0384 6.87421 3.98695 6.28551 5.88403 5.10813L7.88403 3.86687C9.88939 2.62229 10.8921 2 12 2C13.1079 2 14.1106 2.62229 16.116 3.86687L18.116 5.10812C20.0131 6.28551 20.9616 6.87421 21.4808 7.82274C22 8.77128 22 9.91549 22 12.2039V13.725C22 17.6258 22 19.5763 20.8284 20.7881C19.6569 22 17.7712 22 14 22H10C6.22876 22 4.34315 22 3.17157 20.7881C2 19.5763 2 17.6258 2 13.725V12.2039Z'
										stroke='white'
										stroke-width='2'
									/>
									<path
										d='M15 18H9'
										stroke='white'
										stroke-width='2'
										stroke-linecap='round'
									/>
								</svg>
								<p>Главная</p>
							</a>
						</li>
						<li>
							<a href='##'>
								<svg
									width='24'
									height='24'
									viewBox='0 0 24 24'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										d='M14 6H10C8.64413 6 7.53199 6 6.60915 6.05445C4.96519 6.15144 3.92193 6.42122 3.17157 7.17157C2 8.34315 2 10.2288 2 14C2 17.7712 2 19.6569 3.17157 20.8284C4.34315 22 6.22876 22 10 22H14C17.7712 22 19.6569 22 20.8284 20.8284C22 19.6569 22 17.7712 22 14C22 10.2288 22 8.34315 20.8284 7.17157C20.0781 6.42122 19.0348 6.15144 17.3909 6.05445C16.468 6 15.3559 6 14 6Z'
										stroke='white'
										stroke-width='2'
									/>
									<path
										d='M6.60938 6.05445C7.43282 6.03358 8.15925 5.45491 8.43944 4.68032C8.44806 4.65649 8.4569 4.62999 8.47457 4.57697L8.50023 4.5C8.54241 4.37344 8.56351 4.31014 8.58608 4.254C8.87427 3.53712 9.54961 3.05037 10.3208 3.00366C10.3812 3 10.4479 3 10.5814 3H13.4191C13.5525 3 13.6192 3 13.6796 3.00366C14.4508 3.05037 15.1262 3.53712 15.4144 4.254C15.4369 4.31014 15.458 4.37343 15.5002 4.5L15.5259 4.57697C15.5435 4.62992 15.5524 4.65651 15.561 4.68032C15.8412 5.45491 16.5676 6.03358 17.3911 6.05445'
										stroke='white'
										stroke-width='2'
									/>
									<path
										d='M21.6618 8.71973C18.6519 10.6761 17.147 11.6543 15.5605 12.1472C13.2416 12.8677 10.7586 12.8677 8.43963 12.1472C6.85313 11.6543 5.34822 10.6761 2.33838 8.71973'
										stroke='white'
										stroke-width='2'
										stroke-linecap='round'
									/>
									<path
										d='M8 11V13'
										stroke='white'
										stroke-width='2'
										stroke-linecap='round'
									/>
									<path
										d='M16 11V13'
										stroke='white'
										stroke-width='2'
										stroke-linecap='round'
									/>
								</svg>
								<p>Портфолио</p>
							</a>
						</li>
						<li>
							<a href='##'>
								<svg
									width='24'
									height='24'
									viewBox='0 0 24 24'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<circle cx='9' cy='9' r='2' stroke='white' stroke-width='2' />
									<path
										d='M13 15C13 16.1046 13 17 9 17C5 17 5 16.1046 5 15C5 13.8954 6.79086 13 9 13C11.2091 13 13 13.8954 13 15Z'
										stroke='white'
										stroke-width='2'
									/>
									<path
										d='M2 12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12C22 15.7712 22 17.6569 20.8284 18.8284C19.6569 20 17.7712 20 14 20H10C6.22876 20 4.34315 20 3.17157 18.8284C2 17.6569 2 15.7712 2 12Z'
										stroke='white'
										stroke-width='2'
									/>
									<path
										d='M19 12H15'
										stroke='white'
										stroke-width='2'
										stroke-linecap='round'
									/>
									<path
										d='M19 9H14'
										stroke='white'
										stroke-width='2'
										stroke-linecap='round'
									/>
									<path
										d='M19 15H16'
										stroke='white'
										stroke-width='2'
										stroke-linecap='round'
									/>
								</svg>
								<p>Обо мне</p>
							</a>
						</li>

						<li>
							<a href='##'>
								<svg
									width='24'
									height='24'
									viewBox='0 0 24 24'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										d='M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.04346 16.4525C3.22094 16.8088 3.28001 17.2161 3.17712 17.6006L2.58151 19.8267C2.32295 20.793 3.20701 21.677 4.17335 21.4185L6.39939 20.8229C6.78393 20.72 7.19121 20.7791 7.54753 20.9565C8.88837 21.6244 10.4003 22 12 22Z'
										stroke='white'
										stroke-width='2'
									/>
									<path
										d='M8 10.5H16'
										stroke='white'
										stroke-width='2'
										stroke-linecap='round'
									/>
									<path
										d='M8 14H13.5'
										stroke='white'
										stroke-width='2'
										stroke-linecap='round'
									/>
								</svg>
								<p>Блог</p>
							</a>
						</li>
						<li>
							<a href='##'>
								<svg
									width='24'
									height='24'
									viewBox='0 0 24 24'
									fill='none'
									xmlns='http://www.w3.org/2000/svg'
								>
									<path
										d='M2 12C2 8.22876 2 6.34315 3.17157 5.17157C4.34315 4 6.22876 4 10 4H14C17.7712 4 19.6569 4 20.8284 5.17157C22 6.34315 22 8.22876 22 12C22 15.7712 22 17.6569 20.8284 18.8284C19.6569 20 17.7712 20 14 20H10C6.22876 20 4.34315 20 3.17157 18.8284C2 17.6569 2 15.7712 2 12Z'
										stroke='white'
										stroke-width='2'
									/>
									<path
										d='M6 8L8.1589 9.79908C9.99553 11.3296 10.9139 12.0949 12 12.0949C13.0861 12.0949 14.0045 11.3296 15.8411 9.79908L18 8'
										stroke='white'
										stroke-width='2'
										stroke-linecap='round'
									/>
								</svg>
								<p>Контакты</p>
							</a>
						</li>
					</ul>
				</div>
				<div className='leftMenu__btns'>
					<ThemeButton />
					<button className='btn'>
						<ShinyText
							text='Связатьсяㅤ💬'
							disabled={false}
							speed={3}
							className='custom-class'
						/>
					</button>
					<SocBtn />
				</div>
			</div>
		</div>
	)
}
