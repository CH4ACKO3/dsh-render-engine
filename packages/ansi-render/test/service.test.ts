import assert from 'node:assert/strict'
import test from 'node:test'
import { HtmlAnsiRenderer } from '../src/client/service.js'

const renderer = new HtmlAnsiRenderer()

test('renders ANSI colors and styles as self-contained HTML', () => {
  const result = renderer.render({
    text: '\u001b[1;31mERROR\u001b[0m \u001b[4;38;5;46mready\u001b[0m',
  })

  assert.equal(result.styled, true)
  assert.match(result.html, /class="dsh-ansi-render"/)
  assert.match(result.html, /font-weight:bold/)
  assert.match(result.html, /text-decoration:underline/)
  assert.match(result.html, /color:rgb\(/)
  assert.doesNotMatch(result.html, /\u001b/)
})

test('escapes source HTML and rejects unsafe hyperlink schemes', () => {
  const result = renderer.render({
    text: '<script>alert(1)</script>\n\u001b]8;;javascript:alert(1)\u0007click\u001b]8;;\u0007',
  })

  assert.match(result.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/)
  assert.doesNotMatch(result.html, /<script>/)
  assert.doesNotMatch(result.html, /href="javascript:/)
})

test('preserves plain text and line endings', () => {
  const text = 'line one\r\nline two\n'
  const result = renderer.render({ text })

  assert.equal(result.styled, false)
  assert.equal(result.html.replace(/<[^>]+>/g, ''), text)
})
