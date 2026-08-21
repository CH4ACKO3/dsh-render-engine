import assert from 'node:assert/strict'
import test from 'node:test'
import { JSDOM } from 'jsdom'
import { MathMlRenderer } from '../src/client/service.js'

const renderer = new MathMlRenderer()

test('renders inline TeX as native MathML without external styles', () => {
  const result = renderer.render({ source: String.raw`e^{i\pi} + 1 = 0` })
  const document = new JSDOM(result.html).window.document

  assert.equal(result.displayMode, false)
  assert.equal(document.querySelector('.dsh-math-render')?.tagName, 'SPAN')
  assert.equal(document.querySelector('math')?.getAttribute('display'), null)
  assert.match(document.querySelector('annotation')?.textContent ?? '', /e\^\{i\\pi\}/)
})

test('renders display TeX as a scrollable block', () => {
  const result = renderer.render({ source: String.raw`\sum_{n=1}^{\infty} \frac{1}{n^2}`, displayMode: true })
  const document = new JSDOM(result.html).window.document

  assert.equal(result.displayMode, true)
  assert.equal(document.querySelector('.dsh-math-render')?.tagName, 'DIV')
  assert.equal(document.querySelector('math')?.getAttribute('display'), 'block')
  assert.match(result.html, /overflow:auto/)
})

test('keeps trusted commands disabled and escapes TeX text', () => {
  const result = renderer.render({ source: String.raw`\text{<script>alert(1)</script>}` })
  const untrustedLink = renderer.render({ source: String.raw`\href{javascript:alert(1)}{click}` })

  assert.doesNotMatch(result.html, /<script>/)
  assert.match(result.html, /&lt;script&gt;/)
  assert.doesNotMatch(untrustedLink.html, /<a\b|href=/)
  assert.match(untrustedLink.html, /\\href/)
})
