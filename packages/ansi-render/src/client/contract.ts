export interface AnsiRenderRequest {
  text: string
}

export interface AnsiRenderResult {
  html: string
  styled: boolean
}

export interface AnsiRendererService {
  render(request: AnsiRenderRequest): AnsiRenderResult
}
