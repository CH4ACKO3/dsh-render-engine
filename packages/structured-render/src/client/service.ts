import type {
  StructuredRendererService,
  StructuredRenderRequest,
  StructuredRenderResult,
  StructuredValue,
} from './contract.js'

const styles = `<style>
.dsh-structured-render{--dsh-structured-key:var(--shiki-token-keyword,currentColor);--dsh-structured-string:var(--shiki-token-string-expression,currentColor);--dsh-structured-number:var(--shiki-token-constant,currentColor);color:var(--dsw-color-text,var(--shiki-foreground));font:var(--dsw-font-markdown-code-block,13px/1.6 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace);font-variant-numeric:tabular-nums;overflow-wrap:anywhere}
.dsh-structured-render details{margin:0}.dsh-structured-render summary{display:flex;align-items:baseline;gap:.55em;min-height:1.6em;border-radius:4px;cursor:pointer;list-style:none}.dsh-structured-render summary::-webkit-details-marker{display:none}.dsh-structured-render summary::before{content:"";width:.42em;height:.42em;flex:0 0 auto;border-inline-end:1.5px solid currentColor;border-block-end:1.5px solid currentColor;opacity:.48;transform:rotate(-45deg);transform-origin:center;transition:transform 120ms ease-out}.dsh-structured-render details[open]>summary::before{transform:rotate(45deg)}
.dsh-structured-render summary:hover{background:color-mix(in srgb,currentColor 5%,transparent)}.dsh-structured-render summary:focus-visible{outline:2px solid var(--dsw-color-primary,#465bdb);outline-offset:2px}
.dsh-structured-children{margin-inline-start:.42em;padding-inline-start:1.2em;border-inline-start:1px solid color-mix(in srgb,currentColor 14%,transparent)}.dsh-structured-row{display:grid;grid-template-columns:minmax(0,max-content) minmax(0,1fr);gap:.55em;min-height:1.6em}.dsh-structured-key{color:var(--dsh-structured-key)}.dsh-structured-key::after{content:":";color:currentColor;opacity:.45}.dsh-structured-meta{font-size:.92em;opacity:.52}.dsh-structured-string{color:var(--dsh-structured-string)}.dsh-structured-number{color:var(--dsh-structured-number)}.dsh-structured-boolean{color:var(--shiki-token-keyword,currentColor)}.dsh-structured-null{font-style:italic;opacity:.58}
</style>`

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function assertExpandedDepth(value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError('expandedDepth must be a non-negative integer')
  }
}

function renderPrimitive(value: StructuredValue): string | undefined {
  if (value === null) return '<span class="dsh-structured-null">null</span>'
  if (typeof value === 'string') {
    return `<span class="dsh-structured-string">${escapeHtml(JSON.stringify(value))}</span>`
  }
  if (typeof value === 'boolean') {
    return `<span class="dsh-structured-boolean">${String(value)}</span>`
  }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('Structured values must contain finite numbers')
    return `<span class="dsh-structured-number">${String(value)}</span>`
  }
}

interface RenderedNode {
  html: string
  nodeCount: number
}

function renderNode(
  value: StructuredValue,
  label: string | undefined,
  depth: number,
  expandedDepth: number,
  ancestors: Set<object>,
): RenderedNode {
  const key = label === undefined ? '' : `<span class="dsh-structured-key">${escapeHtml(label)}</span>`
  const primitive = renderPrimitive(value)
  if (primitive !== undefined) {
    return {
      html: `<div class="dsh-structured-row">${key}<span>${primitive}</span></div>`,
      nodeCount: 1,
    }
  }

  if (value === null || typeof value !== 'object') {
    throw new TypeError('Structured values must be JSON-compatible')
  }
  const prototype = Object.getPrototypeOf(value)
  if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null) {
    throw new TypeError('Structured objects must use a plain object prototype')
  }
  if (ancestors.has(value)) throw new TypeError('Structured values must not contain circular references')

  const entries: ReadonlyArray<readonly [string, StructuredValue]> = Array.isArray(value)
    ? value.map((item, index) => [String(index), item] as const)
    : Object.entries(value)
  const noun = Array.isArray(value) ? (entries.length === 1 ? 'item' : 'items') : (entries.length === 1 ? 'key' : 'keys')
  const braces = Array.isArray(value) ? [`[`, `]`] : [`{`, `}`]
  const open = depth < expandedDepth ? ' open' : ''
  const nextAncestors = new Set(ancestors).add(value)
  const children = entries.map(([entryLabel, child]) => renderNode(
    child,
    entryLabel,
    depth + 1,
    expandedDepth,
    nextAncestors,
  ))
  const body = children.length === 0
    ? ''
    : `<div class="dsh-structured-children">${children.map(child => child.html).join('')}</div>`

  return {
    html: `<details${open}><summary>${key}<span>${braces[0]}<span class="dsh-structured-meta">${entries.length} ${noun}</span>${braces[1]}</span></summary>${body}</details>`,
    nodeCount: 1 + children.reduce((total, child) => total + child.nodeCount, 0),
  }
}

export class HtmlStructuredRenderer implements StructuredRendererService {
  render(request: StructuredRenderRequest): StructuredRenderResult {
    const expandedDepth = request.expandedDepth ?? 1
    assertExpandedDepth(expandedDepth)
    const rendered = renderNode(request.value, request.label, 0, expandedDepth, new Set())

    return {
      html: `${styles}<div class="dsh-structured-render">${rendered.html}</div>`,
      nodeCount: rendered.nodeCount,
    }
  }
}
