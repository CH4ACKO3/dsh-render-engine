import assert from 'node:assert/strict'
import test from 'node:test'
import { HtmlStructuredRenderer } from '../src/client/service.js'

const renderer = new HtmlStructuredRenderer()

test('renders nested JSON values as an expandable tree', () => {
  const result = renderer.render({
    label: 'response',
    expandedDepth: 2,
    value: {
      ready: true,
      count: 2,
      items: [{ id: 'alpha' }, null],
    },
  })

  assert.equal(result.nodeCount, 7)
  assert.match(result.html, /class="dsh-structured-render"/)
  assert.equal((result.html.match(/<details open>/g) ?? []).length, 2)
  assert.match(result.html, />response</)
  assert.match(result.html, />items</)
  assert.match(result.html, />&quot;alpha&quot;</)
})

test('escapes labels and string values', () => {
  const result = renderer.render({
    label: '<root>',
    value: { '<script>': '<img src=x onerror=alert(1)>' },
  })

  assert.match(result.html, /&lt;root&gt;/)
  assert.match(result.html, /&lt;script&gt;/)
  assert.match(result.html, /&lt;img src=x onerror=alert\(1\)&gt;/)
  assert.doesNotMatch(result.html, /<script>|<img/)
})

test('renders empty containers and primitive roots', () => {
  assert.match(renderer.render({ value: [] }).html, /0 items/)
  assert.match(renderer.render({ value: {} }).html, /0 keys/)
  assert.match(renderer.render({ value: 'ready' }).html, /&quot;ready&quot;/)
})

test('rejects invalid depth, non-finite numbers, and circular values', () => {
  assert.throws(() => renderer.render({ value: null, expandedDepth: -1 }), /non-negative integer/)
  assert.throws(() => renderer.render({ value: Number.NaN }), /finite numbers/)

  const circular: { self?: unknown } = {}
  circular.self = circular
  assert.throws(
    () => renderer.render({ value: circular as never }),
    /circular references/,
  )
  assert.throws(
    () => renderer.render({ value: new Date() as never }),
    /plain object prototype/,
  )
})
