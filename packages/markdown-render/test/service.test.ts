import assert from 'node:assert/strict'
import test from 'node:test'
import type { CodeRendererService, CodeRenderResult } from '@ch4acko3/dsh-code-render/client'
import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import {
  HtmlMarkdownRenderer,
  type MarkdownCodeBlockEnhancer,
  type MarkdownMathEnhancer,
} from '../src/client/service.js'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function renderer(
  onCode?: (code: string, language: string | undefined) => void,
  enhanceCodeBlock: MarkdownCodeBlockEnhancer = () => undefined,
  enhanceMath: MarkdownMathEnhancer = () => undefined,
): HtmlMarkdownRenderer {
  const codeRenderer: CodeRendererService = {
    render: ({ code, language }): CodeRenderResult => {
      onCode?.(code, language)
      return {
        html: `<pre class="shiki dsh-code-render"><code>${escapeHtml(code)}</code></pre>`,
        language: language ?? null,
        highlighted: language !== undefined,
      }
    },
  }
  const window = new JSDOM('').window
  return new HtmlMarkdownRenderer(codeRenderer, createDOMPurify(window), enhanceCodeBlock, enhanceMath)
}

test('renders common GFM structures as theme-aware HTML', async () => {
  const result = await renderer().render({
    markdown: `# Build result

- [x] tests
- [ ] release

| package | status |
| --- | --- |
| renderer | **ready** |

~~obsolete~~`,
  })

  assert.match(result.html, /class="dsh-markdown-render"/)
  assert.match(result.html, /var\(--dsw-color-text/)
  assert.match(result.html, /<h1>Build result<\/h1>/)
  const document = new JSDOM(result.html).window.document
  assert.equal(document.querySelectorAll('input[type="checkbox"]').length, 2)
  assert.equal(document.querySelector<HTMLInputElement>('input[type="checkbox"]')?.checked, true)
  assert.match(result.html, /<table>/)
  assert.match(result.html, /<strong>ready<\/strong>/)
  assert.match(result.html, /<del>obsolete<\/del>/)
})

test('keeps GFM single-tilde strikethrough by default', async () => {
  const result = await renderer().render({ markdown: '~approximately~ and ~~obsolete~~' })

  assert.match(result.html, /<del>approximately<\/del>/)
  assert.match(result.html, /<del>obsolete<\/del>/)
})

test('treats single tildes as text in render-friendly mode', async () => {
  const result = await renderer().render({
    markdown: '~approximately~ and ~~obsolete~~ and `~literal~`',
    mode: 'render-friendly',
  })

  assert.match(result.html, /~approximately~ and <del>obsolete<\/del>/)
  assert.match(result.html, /<code>~literal~<\/code>/)
  assert.doesNotMatch(result.html, /<del>approximately<\/del>/)
})

test('delegates fenced code blocks to the shared code renderer', async () => {
  const calls: Array<{ code: string, language: string | undefined }> = []
  const result = await renderer((code, language) => calls.push({ code, language })).render({
    markdown: '```ts title="sample"\nconst answer = 42\n```',
  })

  assert.deepEqual(calls, [{ code: 'const answer = 42', language: 'ts' }])
  assert.match(result.html, /class="shiki dsh-code-render"/)
  assert.match(result.html, /const answer = 42/)
  assert.doesNotMatch(result.html, /data-dsh-markdown-code/)
})

test('upgrades Mermaid fences when an optional renderer becomes available', async () => {
  const codeCalls: string[] = []
  let mermaidRenderer: MarkdownCodeBlockEnhancer | undefined
  const markdownRenderer = renderer(code => codeCalls.push(code), block => mermaidRenderer?.(block))

  const fallback = await markdownRenderer.render({
    markdown: '```mermaid\ngraph TD\n  A --> B\n```',
  })
  assert.match(fallback.html, /class="shiki dsh-code-render"/)
  assert.deepEqual(codeCalls, ['graph TD\n  A --> B'])

  mermaidRenderer = async ({ code, language }) => ({
    html: `<svg data-renderer="${language}"><text>${escapeHtml(code)}</text></svg>`,
  })
  const enhanced = await markdownRenderer.render({
    markdown: '```mermaid\ngraph TD\n  A --> B\n```',
  })
  assert.match(enhanced.html, /<svg data-renderer="mermaid">/)
  assert.match(enhanced.html, /graph TD/)
  assert.deepEqual(codeCalls, ['graph TD\n  A --> B'])
})

test('upgrades inline, block, and fenced math when an optional renderer becomes available', async () => {
  const codeCalls: Array<{ code: string, language?: string }> = []
  let mathRenderer: MarkdownMathEnhancer | undefined
  const markdownRenderer = renderer(
    (code, language) => codeCalls.push({ code, language }),
    block => block.language === 'math'
      ? mathRenderer?.({ source: block.code, displayMode: true, raw: block.code })
      : undefined,
    expression => mathRenderer?.(expression),
  )
  const markdown = 'Euler: $e^{i\\pi} + 1 = 0$.\n\n$$\n\\sum_{n=1}^{\\infty} \\frac{1}{n^2}\n$$\n\n```math\na^2 + b^2 = c^2\n```'

  const fallback = await markdownRenderer.render({ markdown })
  assert.match(fallback.html, /class="dsh-markdown-math-source"/)
  assert.equal(codeCalls.length, 2)

  const calls: Array<{ source: string, displayMode: boolean }> = []
  mathRenderer = async ({ source, displayMode }) => {
    calls.push({ source, displayMode })
    const tag = displayMode ? 'div' : 'span'
    return { html: `<${tag} class="dsh-math-render">${escapeHtml(source)}</${tag}>` }
  }
  const enhanced = await markdownRenderer.render({ markdown })

  assert.equal((enhanced.html.match(/class="dsh-math-render"/g) ?? []).length, 3)
  assert.equal(codeCalls.length, 2)
  assert.deepEqual(calls.map(call => call.displayMode), [true, false, true])
})

test('does not treat currency or code content as math', async () => {
  const mathCalls: string[] = []
  const result = await renderer(
    undefined,
    undefined,
    expression => {
      mathCalls.push(expression.source)
      return { html: '<span class="dsh-math-render"></span>' }
    },
  ).render({
    markdown: 'Prices moved from $5 and $10. Keep `$literal$` unchanged.\n\n```text\n$also-literal$\n```',
  })

  assert.deepEqual(mathCalls, [])
  assert.match(result.html, /Prices moved from \$5 and \$10/)
  assert.match(result.html, /<code>\$literal\$<\/code>/)
  assert.match(result.html, /\$also-literal\$/)
})

test('displays raw HTML as text and removes executable URLs', async () => {
  const result = await renderer().render({
    markdown: `<script>alert('x')</script>

<img src=x onerror="alert(1)">

[unsafe](javascript:alert(1)) [safe](https://example.com)`,
  })

  const document = new JSDOM(result.html).window.document
  assert.equal(document.querySelector('script'), null)
  assert.equal(document.querySelector('[onerror]'), null)
  assert.equal(document.querySelector('a[href^="javascript:"]'), null)
  assert.match(result.html, /&lt;script&gt;/)
  assert.equal(document.querySelector('a[href="https://example.com"]')?.textContent, 'safe')
})

test('does not let source HTML forge a code-block placeholder', async () => {
  const result = await renderer().render({
    markdown: '<div data-dsh-markdown-code="0"></div><span data-dsh-markdown-math="0"></span>',
  })

  assert.match(result.html, /&lt;div data-dsh-markdown-code=&quot;0&quot;&gt;&lt;\/div&gt;/)
  assert.match(result.html, /&lt;span data-dsh-markdown-math=&quot;0&quot;&gt;&lt;\/span&gt;/)
  assert.doesNotMatch(result.html, /class="shiki dsh-code-render"/)
  assert.doesNotMatch(result.html, /class="dsh-math-render"/)
})
