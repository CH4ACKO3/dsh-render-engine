import type { SyntaxHighlightRequest } from '@ch4acko3/dsh-syntax-highlight/client'

export interface CodeRenderResult {
  html: string
  language: string | null
  highlighted: boolean
}

export interface CodeRendererService {
  render(request: SyntaxHighlightRequest): CodeRenderResult
}
