import assert from 'node:assert/strict'
import test from 'node:test'
import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import { SvgMermaidRenderer, type MermaidApi } from '../src/client/service.js'

function renderer(render: MermaidApi['render']) {
  const initializeCalls: unknown[] = []
  const api: MermaidApi = {
    initialize: config => initializeCalls.push(config),
    render,
  }
  const window = new JSDOM('').window
  return {
    initializeCalls,
    renderer: new SvgMermaidRenderer(api, createDOMPurify(window)),
  }
}

test('uses strict Mermaid mode and returns sanitized SVG', async () => {
  const calls: Array<{ id: string, source: string }> = []
  const subject = renderer(async (id, source) => {
    calls.push({ id, source })
    return {
      svg: '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><script>alert(1)</script><text>ready</text></svg>',
    }
  })

  const result = await subject.renderer.render({ source: 'graph TD\n  A --> B' })

  assert.deepEqual(subject.initializeCalls, [{ startOnLoad: false, securityLevel: 'strict' }])
  assert.deepEqual(calls, [{ id: 'dsh-mermaid-1', source: 'graph TD\n  A --> B' }])
  assert.match(result.html, /class="dsh-mermaid-render"/)
  assert.match(result.html, /<svg/)
  assert.match(result.html, /<text>ready<\/text>/)
  assert.doesNotMatch(result.html, /<script|onload=/)
})

test('uses a distinct id for each diagram', async () => {
  const ids: string[] = []
  const subject = renderer(async (id) => {
    ids.push(id)
    return { svg: '<svg xmlns="http://www.w3.org/2000/svg"><text>diagram</text></svg>' }
  })

  await subject.renderer.render({ source: 'graph TD\n  A --> B' })
  await subject.renderer.render({ source: 'graph TD\n  B --> C' })

  assert.deepEqual(ids, ['dsh-mermaid-1', 'dsh-mermaid-2'])
})
