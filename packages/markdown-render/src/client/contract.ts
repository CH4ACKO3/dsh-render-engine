export interface MarkdownRenderRequest {
  markdown: string
}

export interface MarkdownRenderResult {
  html: string
}

export interface MarkdownRendererService {
  render(request: MarkdownRenderRequest): Promise<MarkdownRenderResult>
}
