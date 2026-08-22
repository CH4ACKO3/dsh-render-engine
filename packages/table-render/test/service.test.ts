import assert from 'node:assert/strict'
import test from 'node:test'
import { HtmlTableRenderer } from '../src/client/service.js'

const renderer = new HtmlTableRenderer()

test('renders inferred record columns as a semantic table', () => {
  const result = renderer.render({
    caption: 'Package status',
    rows: [
      { package: 'markdown', status: 'ready', tests: 7 },
      { package: 'mermaid', status: 'ready', tests: 2 },
    ],
  })

  assert.equal(result.rowCount, 2)
  assert.equal(result.columnCount, 3)
  assert.match(result.html, /<caption>Package status<\/caption>/)
  assert.match(result.html, /<th scope="col">package<\/th>/)
  assert.match(result.html, /class="dsh-table-number">7<\/td>/)
})

test('supports explicit labels, alignment, missing values, and empty rows', () => {
  const columns = [
    { key: 'name', label: 'Package' },
    { key: 'downloads', label: 'Downloads', align: 'end' as const },
  ]
  const result = renderer.render({ columns, rows: [{ name: 'renderer' }] })
  const empty = renderer.render({ columns, rows: [], emptyText: 'Nothing yet' })

  assert.match(result.html, /data-align="end">Downloads/)
  assert.match(result.html, /class="dsh-table-missing" data-align="end">—/)
  assert.match(empty.html, /colspan="2">Nothing yet/)
})

test('escapes captions, headings, strings, and empty-state text', () => {
  const result = renderer.render({
    caption: '<script>',
    columns: [{ key: '<name>', label: '<Name>' }],
    rows: [{ '<name>': '<img src=x>' }],
  })
  const empty = renderer.render({ rows: [], emptyText: '<empty>' })

  assert.match(result.html, /&lt;script&gt;/)
  assert.match(result.html, /&lt;Name&gt;/)
  assert.match(result.html, /&lt;img src=x&gt;/)
  assert.doesNotMatch(result.html, /<script>|<img/)
  assert.match(empty.html, /&lt;empty&gt;/)
})

test('rejects duplicate columns and unsupported numeric values', () => {
  assert.throws(
    () => renderer.render({ columns: [{ key: 'id' }, { key: 'id' }], rows: [] }),
    /Duplicate table column key/,
  )
  assert.throws(
    () => renderer.render({ rows: [{ value: Number.POSITIVE_INFINITY }] }),
    /finite numbers/,
  )
  assert.throws(
    () => renderer.render({
      columns: [{ key: 'value', align: 'end\" onclick=\"alert(1)' as never }],
      rows: [{ value: 1 }],
    }),
    /Unsupported table column alignment/,
  )
})
