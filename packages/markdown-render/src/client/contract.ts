export type MarkdownRenderMode = 'gfm' | 'render-friendly'

export interface MarkdownRenderRequest {
  markdown: string
  mode?: MarkdownRenderMode
}

export interface MarkdownRenderResult {
  html: string
}

export interface MarkdownRendererService {
  render(request: MarkdownRenderRequest): Promise<MarkdownRenderResult>
}
