import type {
  TableCellValue,
  TableColumn,
  TableRendererService,
  TableRenderRequest,
  TableRenderResult,
  TableRow,
} from './contract.js'

const styles = `<style>
.dsh-table-render{max-width:100%;overflow:auto;color:var(--dsw-color-text,var(--shiki-foreground));font:var(--dsw-font-markdown-body,13px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif);scrollbar-color:color-mix(in srgb,currentColor 28%,transparent) transparent}.dsh-table-render:focus-visible{outline:2px solid var(--dsw-color-primary,#465bdb);outline-offset:2px}.dsh-table-render table{width:100%;border-spacing:0;border-collapse:separate;font-variant-numeric:tabular-nums}.dsh-table-render caption{padding:.75em .85em;text-align:start;font-weight:600;border-bottom:1px solid color-mix(in srgb,currentColor 14%,transparent)}
.dsh-table-render th,.dsh-table-render td{padding:.62em .85em;text-align:start;vertical-align:top;border-bottom:1px solid color-mix(in srgb,currentColor 11%,transparent)}.dsh-table-render th{position:sticky;top:0;z-index:1;background:var(--dsh-table-header,var(--shiki-background,#fff));font-size:.92em;font-weight:600;white-space:nowrap}.dsh-table-render tbody tr:hover{background:color-mix(in srgb,currentColor 4%,transparent)}.dsh-table-render tbody tr:last-child td{border-bottom:0}.dsh-table-render td{white-space:pre-wrap;overflow-wrap:anywhere}.dsh-table-render [data-align="center"]{text-align:center}.dsh-table-render [data-align="end"]{text-align:end}.dsh-table-number{text-align:end;font-family:var(--dsw-font-markdown-code-block,ui-monospace,SFMono-Regular,Menlo,Consolas,monospace)}.dsh-table-boolean{color:var(--shiki-token-keyword,currentColor)}.dsh-table-null,.dsh-table-missing{font-style:italic;opacity:.55}.dsh-table-empty{text-align:center!important;padding:1.1em!important;opacity:.62}
</style>`

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function inferColumns(rows: readonly TableRow[]): TableColumn[] {
  const keys = new Set<string>()
  for (const row of rows) {
    for (const key of Object.keys(row)) keys.add(key)
  }
  return [...keys].map(key => ({ key }))
}

function validateColumns(columns: readonly TableColumn[]): void {
  const keys = new Set<string>()
  for (const column of columns) {
    if (column.key === '') throw new TypeError('Table column keys must not be empty')
    if (keys.has(column.key)) throw new TypeError(`Duplicate table column key: ${column.key}`)
    keys.add(column.key)
  }
}

function renderCell(value: TableCellValue | undefined): { content: string, className?: string } {
  if (value === undefined) return { content: '—', className: 'dsh-table-missing' }
  if (value === null) return { content: 'null', className: 'dsh-table-null' }
  if (typeof value === 'boolean') return { content: String(value), className: 'dsh-table-boolean' }
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('Table cells must contain finite numbers')
    return { content: String(value), className: 'dsh-table-number' }
  }
  if (typeof value === 'string') return { content: escapeHtml(value) }
  throw new TypeError('Table cells must contain strings, finite numbers, booleans, null, or undefined')
}

function alignAttribute(column: TableColumn): string {
  if (column.align === undefined) return ''
  if (column.align === 'start' || column.align === 'center' || column.align === 'end') {
    return ` data-align="${column.align}"`
  }
  throw new TypeError(`Unsupported table column alignment: ${String(column.align)}`)
}

export class HtmlTableRenderer implements TableRendererService {
  render(request: TableRenderRequest): TableRenderResult {
    const columns = request.columns === undefined ? inferColumns(request.rows) : [...request.columns]
    validateColumns(columns)
    const caption = request.caption === undefined ? '' : `<caption>${escapeHtml(request.caption)}</caption>`
    const head = columns.length === 0
      ? ''
      : `<thead><tr>${columns.map(column => `<th scope="col"${alignAttribute(column)}>${escapeHtml(column.label ?? column.key)}</th>`).join('')}</tr></thead>`
    const rows = request.rows.length === 0
      ? (columns.length === 0 ? '' : `<tr><td class="dsh-table-empty" colspan="${columns.length}">${escapeHtml(request.emptyText ?? 'No rows')}</td></tr>`)
      : request.rows.map(row => `<tr>${columns.map(column => {
          const cell = renderCell(row[column.key])
          const className = cell.className === undefined ? '' : ` class="${cell.className}"`
          return `<td${className}${alignAttribute(column)}>${cell.content}</td>`
        }).join('')}</tr>`).join('')
    const empty = columns.length === 0
      ? `<div class="dsh-table-empty">${escapeHtml(request.emptyText ?? 'No data')}</div>`
      : `<table>${caption}${head}<tbody>${rows}</tbody></table>`

    return {
      html: `${styles}<div class="dsh-table-render" tabindex="0">${empty}</div>`,
      rowCount: request.rows.length,
      columnCount: columns.length,
    }
  }
}
