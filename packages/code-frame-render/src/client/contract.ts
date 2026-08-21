export type CodeFrameSeverity = 'error' | 'warning' | 'info' | 'hint'

export interface CodeFramePosition {
  /** Zero-based line number. */
  line: number
  /** Zero-based UTF-16 code-unit offset, matching LSP positions. */
  character: number
}

export interface CodeFrameRange {
  start: CodeFramePosition
  end: CodeFramePosition
}

export interface CodeFrameDiagnostic {
  range: CodeFrameRange
  message: string
  severity: CodeFrameSeverity
}

export interface CodeFrameRenderRequest {
  code: string
  language?: string | undefined
  fileName?: string | undefined
  diagnostics: CodeFrameDiagnostic[]
  contextLines?: number | undefined
}

export interface CodeFrameRenderResult {
  html: string
  language: string | null
  highlighted: boolean
  diagnostics: number
  firstLine: number
  lastLine: number
}

export interface CodeFrameRendererService {
  render(request: CodeFrameRenderRequest): CodeFrameRenderResult
}
