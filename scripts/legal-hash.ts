/**
 * Печатает содержимое для server/legal.json: версии и SHA-256 текстов документов из src/data/legal.ts.
 * Запуск: `npm run legal:hash` (vite-node из комплекта vitest). После правки текста документа — поднять его версию
 * в LEGAL_VERSIONS, выполнить скрипт и перенести вывод в server/legal.json; тест legal.test.ts сверяет оба файла
 */
import { createHash } from 'node:crypto'
import { LEGAL_DOCS, legalDocumentText } from '../src/data/legal'

const sha256 = (text: string) => createHash('sha256').update(text).digest('hex')
const entry = (key: 'consent' | 'privacy' | 'cookies') => ({ version: LEGAL_DOCS[key].version, sha256: sha256(legalDocumentText(LEGAL_DOCS[key])) })

console.log(JSON.stringify({ consent: entry('consent'), policy: entry('privacy'), cookies: entry('cookies') }, null, 2))
