import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import PageHead from '../../components/pageHead/PageHead'
import { LEGAL_DOCS, formatLegalDate } from '../../data/legal'
import type { LegalBlock, LegalDocKey } from '../../data/legal'
import { SITE_META } from '../../data/meta'
import { useDocumentMeta } from '../../hooks/useDocumentMeta'
import './LegalPage.scss'

const LINK = /\[([^\]]+)\]\(([^)\s]+)\)/g

/** `[текст](адрес)` в строке документа → ссылка: внутренний маршрут — Link, mailto — <a>, внешний адрес — в новой вкладке */
function renderInline(text: string): ReactNode[] {
	const out: ReactNode[] = []
	let last = 0
	for (const m of text.matchAll(LINK)) {
		const [raw, label, href] = m
		const i = m.index ?? 0
		if (i > last) out.push(text.slice(last, i))
		if (href.startsWith('/')) {
			out.push(
				<Link key={i} to={href}>
					{label}
				</Link>,
			)
		} else if (href.startsWith('mailto:')) {
			out.push(
				<a key={i} href={href}>
					{label}
				</a>,
			)
		} else {
			out.push(
				<a key={i} href={href} target='_blank' rel='noopener noreferrer'>
					{label}
				</a>,
			)
		}
		last = i + raw.length
	}
	if (last < text.length) out.push(text.slice(last))
	return out
}

/** Блок документа (data/legal.ts LegalBlock): подзаголовок с якорем, абзац, список, таблица, служебная строка */
function Block({ block }: { block: LegalBlock }) {
	switch (block.type) {
		case 'h2':
			return <h2 id={block.id}>{block.text}</h2>
		case 'ul':
			return (
				<ul>
					{block.items.map((item, i) => (
						<li key={i}>{renderInline(item)}</li>
					))}
				</ul>
			)
		case 'table':
			return (
				<div className='legalPage__tableWrap'>
					<table>
						<thead>
							<tr>
								{block.head.map(h => (
									<th key={h} scope='col'>
										{h}
									</th>
								))}
							</tr>
						</thead>
						<tbody>
							{block.rows.map((row, i) => (
								<tr key={i}>
									{row.map((cell, j) => (
										<td key={j} data-label={block.head[j]}>
											{renderInline(cell)}
										</td>
									))}
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)
		case 'note':
			return <p className='legalPage__note'>{block.text}</p>
		default:
			return <p>{renderInline(block.text)}</p>
	}
}

type Props = {
	doc: LegalDocKey
}

/**
 * Страница документа (ТЗ «документы, согласия, cookie» от 22.10.2026, §11): общая шапка `// документ` с H1, редакцией
 * и датой; текст в колонке до 820px (p, h2 с якорями, ul, таблицы); у длинной политики слева оглавление по H2.
 * Текст доступен сразу, без Reveal: документ читают и печатают, открывают по прямой ссылке. Футер здесь без формы
 * (SiteFooter). Один рендерер на /privacy, /personal-data-consent и /cookies — тексты в data/legal.ts
 */
export default function LegalPage({ doc: key }: Props) {
	const doc = LEGAL_DOCS[key]
	useDocumentMeta(SITE_META[key])
	const toc = doc.toc ? doc.blocks.filter(b => b.type === 'h2') : []

	return (
		<article className='legalPage' key={doc.key}>
			<PageHead
				label='документ'
				title={{ text: doc.title }}
				meta={
					<>
						Редакция {doc.version} · действует с {formatLegalDate(doc.effectiveDate)}
					</>
				}
				className='legalPage__head'
			/>

			<section className='section' aria-label='Текст документа'>
				<div className={`container legalPage__grid${toc.length ? ' legalPage__grid--toc' : ''}`}>
					{toc.length > 0 && (
						<nav className='legalPage__toc' aria-label='Содержание'>
							<p className='legalPage__tocLabel'>
								<span aria-hidden='true'>//</span> содержание
							</p>
							<ol>
								{toc.map(h => (
									<li key={h.id}>
										<a href={`#${h.id}`}>{h.text}</a>
									</li>
								))}
							</ol>
						</nav>
					)}
					<div className='legalPage__body'>
						{doc.blocks.map((b, i) => (
							<Block key={i} block={b} />
						))}
					</div>
				</div>
			</section>
		</article>
	)
}
