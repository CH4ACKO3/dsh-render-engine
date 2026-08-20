import assert from 'node:assert/strict'
import test from 'node:test'
import type { ShikiService } from '@ch4acko3/dsh-shiki/client'
import { SyntaxHighlighter } from '../src/client/service.js'

function sourceOf(lines: Array<Array<{ content: string }>>): string {
  return lines.map(line => line.map(token => token.content).join('')).join('\n')
}

test('converts Shiki tokens into stable highlight tokens', () => {
  const shiki: ShikiService = {
    languages: ['typescript'],
    resolveLanguage: () => 'typescript',
    tokenize: ({ code }) => ({
      language: 'typescript',
      lines: [[
        { content: code.slice(0, 5), color: 'var(--shiki-token-keyword)', fontStyle: 2 },
        { content: code.slice(5), color: 'var(--shiki-foreground)' },
      ]],
    }),
  }
  const highlighter = new SyntaxHighlighter(shiki)
  const code = 'const answer: number = 42\n'
  const result = highlighter.highlight({ code, language: 'ts' })

  assert.equal(result.language, 'typescript')
  assert.equal(result.highlighted, true)
  assert.equal(sourceOf(result.lines), code)
  assert.ok(result.lines.flat().some(token => token.color.startsWith('var(--shiki-')))
  assert.equal(result.lines[0]?.[0]?.style?.bold, true)
})

test('returns plain tokens when the language is absent or unsupported', () => {
  const shiki: ShikiService = {
    languages: [],
    resolveLanguage: () => null,
    tokenize: () => { throw new Error('tokenize must not be called') },
  }
  const highlighter = new SyntaxHighlighter(shiki)
  const code = 'IDENTIFICATION DIVISION.\nPROGRAM-ID. HELLO.'
  const result = highlighter.highlight({ code, language: 'cobol' })

  assert.equal(result.language, null)
  assert.equal(result.highlighted, false)
  assert.equal(sourceOf(result.lines), code)
  assert.ok(result.lines.flat().every(token => token.color === 'var(--shiki-foreground)'))
})
