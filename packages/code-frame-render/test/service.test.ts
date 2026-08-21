import assert from 'node:assert/strict'
import test from 'node:test'
import type { SyntaxHighlighterService } from '@ch4acko3/dsh-syntax-highlight/client'
import { HtmlCodeFrameRenderer } from '../src/client/service.js'

function plainRenderer(): HtmlCodeFrameRenderer {
  const highlighter: SyntaxHighlighterService = {
    highlight: ({ code, language }) => ({
      language: language ?? null,
      highlighted: language !== undefined,
      lines: code.split(/\r\n|\r|\n/).map(content => [{
        content,
        color: 'var(--shiki-foreground)',
      }]),
      lineEndings: code.match(/\r\n|\r|\n/g) as Array<'\n' | '\r\n' | '\r'> | null ?? [],
    }),
  }
  return new HtmlCodeFrameRenderer(highlighter)
}

test('renders escaped source context and diagnostic messages', () => {
  const result = plainRenderer().render({
    code: 'first\nconst value = <unsafe>\nthird\nfourth\n',
    language: 'ts',
    fileName: '<app.ts>',
    contextLines: 1,
    diagnostics: [{
      range: {
        start: { line: 1, character: 14 },
        end: { line: 1, character: 22 },
      },
      message: '<script>alert(1)</script>',
      severity: 'error',
    }],
  })

  assert.equal(result.firstLine, 0)
  assert.equal(result.lastLine, 2)
  assert.equal(result.diagnostics, 1)
  assert.match(result.html, /class="shiki dsh-code-frame-render"/)
  assert.match(result.html, /&lt;app\.ts&gt;/)
  assert.match(result.html, /&lt;unsafe&gt;/)
  assert.match(result.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/)
  assert.match(result.html, /dsh-code-frame-error/)
  assert.doesNotMatch(result.html, /<script>/)
  assert.doesNotMatch(result.html, /data-line="4"/)
})

test('uses zero-based UTF-16 ranges without changing Unicode source', () => {
  const result = plainRenderer().render({
    code: '😀x',
    diagnostics: [{
      range: {
        start: { line: 0, character: 2 },
        end: { line: 0, character: 3 },
      },
      message: 'mark x',
      severity: 'warning',
    }],
  })

  assert.match(result.html, /😀/)
  assert.match(result.html, /dsh-code-frame-warning[^>]*><span[^>]*>x<\/span>/)
})

test('renders multiline and zero-width diagnostics', () => {
  const result = plainRenderer().render({
    code: 'alpha\nbeta\ngamma',
    diagnostics: [
      {
        range: {
          start: { line: 0, character: 2 },
          end: { line: 1, character: 2 },
        },
        message: 'multiline',
        severity: 'info',
      },
      {
        range: {
          start: { line: 2, character: 5 },
          end: { line: 2, character: 5 },
        },
        message: 'at end',
        severity: 'hint',
      },
    ],
  })

  assert.equal(result.diagnostics, 2)
  assert.match(result.html, /dsh-code-frame-info/)
  assert.match(result.html, /dsh-code-frame-hint/)
})

test('rejects source ranges outside the supplied code', () => {
  assert.throws(() => plainRenderer().render({
    code: 'one line',
    diagnostics: [{
      range: {
        start: { line: 1, character: 0 },
        end: { line: 1, character: 1 },
      },
      message: 'outside',
      severity: 'error',
    }],
  }), /outside the source/)
})

test('rejects unsupported runtime severity values', () => {
  assert.throws(() => plainRenderer().render({
    code: 'value',
    diagnostics: [{
      range: {
        start: { line: 0, character: 0 },
        end: { line: 0, character: 1 },
      },
      message: 'invalid severity',
      severity: '" onmouseover="alert(1)' as never,
    }],
  }), /severity is unsupported/)
})
