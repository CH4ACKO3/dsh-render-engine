import assert from 'node:assert/strict'
import test from 'node:test'
import { ShikiEngine } from '../src/client/service.js'

function sourceOf(
  lines: Array<Array<{ content: string }>>,
  lineEndings: string[],
): string {
  return lines
    .map((line, index) => line.map(token => token.content).join('') + (lineEndings[index] ?? ''))
    .join('')
}

test('resolves common language aliases', () => {
  const shiki = new ShikiEngine()

  assert.equal(shiki.resolveLanguage('TS'), 'typescript')
  assert.equal(shiki.resolveLanguage('py'), 'python')
  assert.equal(shiki.resolveLanguage('cobol'), null)
})

test('tokenizes supported source with the DSH CSS variable theme', () => {
  const shiki = new ShikiEngine()
  const code = 'const answer: number = 42\n'
  const result = shiki.tokenize({ code, language: 'ts' })

  assert.equal(result.language, 'typescript')
  assert.equal(sourceOf(result.lines, result.lineEndings), code)
  assert.ok(result.lines.flat().some(token => token.color?.startsWith('var(--shiki-') === true))
})

test('preserves CRLF line endings', () => {
  const shiki = new ShikiEngine()
  const code = 'const x = 1\r\nconst y = 2\r\n'
  const result = shiki.tokenize({ code, language: 'ts' })

  assert.deepEqual(result.lineEndings, ['\r\n', '\r\n'])
  assert.equal(sourceOf(result.lines, result.lineEndings), code)
})

test('rejects unsupported languages at the engine boundary', () => {
  const shiki = new ShikiEngine()

  assert.throws(
    () => shiki.tokenize({ code: 'IDENTIFICATION DIVISION.', language: 'cobol' }),
    /Unsupported Shiki language: cobol/,
  )
})
