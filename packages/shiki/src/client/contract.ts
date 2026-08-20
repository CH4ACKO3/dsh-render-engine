export interface ShikiTokenizeRequest {
  code: string
  language: string
}

export interface ShikiToken {
  content: string
  color?: string | undefined
  fontStyle?: number | undefined
}

export type SourceLineEnding = '\n' | '\r\n' | '\r'

export interface ShikiTokenizeResult {
  language: string
  lines: ShikiToken[][]
  lineEndings: SourceLineEnding[]
}

export interface ShikiService {
  readonly languages: readonly string[]
  resolveLanguage(language: string | undefined): string | null
  tokenize(request: ShikiTokenizeRequest): ShikiTokenizeResult
}
