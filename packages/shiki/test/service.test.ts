import assert from 'node:assert/strict'
import test from 'node:test'
import { ShikiEngine } from '../src/client/service.js'

function sourceOf(lines: Array<Array<{ content: string }>>): string {
  return lines.map(line => line.map(token => token.content).join('')).join('\n')
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
  assert.equal(sourceOf(result.lines), code)
  assert.ok(result.lines.flat().some(token => token.color?.startsWith('var(--shiki-') === true))
})

test('rejects unsupported languages at the engine boundary', () => {
  const shiki = new ShikiEngine()

  assert.throws(
    () => shiki.tokenize({ code: 'IDENTIFICATION DIVISION.', language: 'cobol' }),
    /Unsupported Shiki language: cobol/,
  )
})
