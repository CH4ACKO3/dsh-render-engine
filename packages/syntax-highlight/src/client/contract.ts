export interface SyntaxHighlightRequest {
  code: string
  language?: string | undefined
}

export interface HighlightTokenStyle {
  italic?: true
  bold?: true
  underline?: true
  strikethrough?: true
}

export interface HighlightToken {
  content: string
  color: string
  style?: HighlightTokenStyle
}

export type SourceLineEnding = '\n' | '\r\n' | '\r'

export interface SyntaxHighlightResult {
  language: string | null
  highlighted: boolean
  lines: HighlightToken[][]
  lineEndings: SourceLineEnding[]
}

export interface SyntaxHighlighterService {
  highlight(request: SyntaxHighlightRequest): SyntaxHighlightResult
}
