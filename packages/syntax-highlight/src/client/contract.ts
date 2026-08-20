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

export interface SyntaxHighlightResult {
  language: string | null
  highlighted: boolean
  lines: HighlightToken[][]
}

export interface SyntaxHighlighterService {
  highlight(request: SyntaxHighlightRequest): SyntaxHighlightResult
}
