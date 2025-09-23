// scss
import './MyStack.scss'

const STACK = [
	'html',
	'css',
	'sass',
	'scss',
	'js',
	'ts',
	'react',
	'redux',
	'api',
	'galp',
	'linux',
	'vite',
]

export default function MyStack() {
	return (
		<>
			<div className='title'>Мой стек</div>
			<ul className='mystack' aria-label='Список технологий'>
				{STACK.map(k => (
					<li
						key={k}
						className={`mystack__item mystack__item--${k}`}
						title={k}
						aria-label={k}
					/>
				))}
			</ul>
		</>
	)
}
