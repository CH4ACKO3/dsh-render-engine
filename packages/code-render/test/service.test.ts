import assert from 'node:assert/strict'
import test from 'node:test'
import type { SyntaxHighlighterService } from '@ch4acko3/dsh-syntax-highlight/client'
import { HtmlCodeRenderer } from '../src/client/service.js'

function plainRenderer(): HtmlCodeRenderer {
  const highlighter: SyntaxHighlighterService = {
    highlight: ({ code }) => ({
      language: null,
      highlighted: false,
      lines: code.split('\n').map(content => [{
        content,
        color: 'var(--shiki-foreground)',
      }]),
    }),
  }
  return new HtmlCodeRenderer(highlighter)
}

test('renders safe theme-aware HTML', () => {
  const result = plainRenderer().render({
    code: '<script>alert("x")</script> & done',
    language: 'text',
  })

  assert.equal(result.highlighted, false)
  assert.match(result.html, /class="shiki dsh-code-render"/)
  assert.match(result.html, /var\(--shiki-background\)/)
  assert.match(result.html, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt; &amp; done/)
  assert.doesNotMatch(result.html, /<script>/)
})

test('renders highlighted HTML without changing the source text', () => {
  const code = 'def greet(name):\n    return f"hello {name}"'
  const highlighter: SyntaxHighlighterService = {
    highlight: () => ({
      language: 'python',
      highlighted: true,
      lines: [
        [{ content: 'def', color: 'var(--shiki-token-keyword)' }, { content: ' greet(name):', color: 'var(--shiki-foreground)' }],
        [{ content: '    return f"hello {name}"', color: 'var(--shiki-token-string)' }],
      ],
    }),
  }
  const result = new HtmlCodeRenderer(highlighter).render({ code, language: 'py' })

  assert.equal(result.language, 'python')
  assert.equal(result.highlighted, true)
  assert.match(result.html, /var\(--shiki-token-keyword\)/)
  assert.equal(
    result.html
      .replace(/<[^>]+>/g, '')
      .replaceAll('&quot;', '"')
      .replaceAll('&#39;', "'")
      .replaceAll('&lt;', '<')
      .replaceAll('&gt;', '>')
      .replaceAll('&amp;', '&'),
    code,
  )
})
