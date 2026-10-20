import './Watermark.scss'

type Props = {
	text: string
	className?: string
}

/** Водяной знак (docs/design-spec-home4.md §5.6): огромное слово в верхнем регистре, opacity .06, за содержимым финала; один раз на странице */
export default function Watermark({ text, className }: Props) {
	return (
		<span className={['watermark', className ?? ''].filter(Boolean).join(' ')} aria-hidden='true'>
			{text}
		</span>
	)
}
