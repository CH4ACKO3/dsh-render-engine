export type TableCellValue = null | boolean | number | string

export type TableRow = Readonly<Record<string, TableCellValue | undefined>>

export interface TableColumn {
  key: string
  label?: string
  align?: 'start' | 'center' | 'end'
}

export interface TableRenderRequest {
  rows: readonly TableRow[]
  columns?: readonly TableColumn[]
  caption?: string
  emptyText?: string
}

export interface TableRenderResult {
  html: string
  rowCount: number
  columnCount: number
}

export interface TableRendererService {
  render(request: TableRenderRequest): TableRenderResult
}
