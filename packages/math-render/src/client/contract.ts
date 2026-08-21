export interface MathRenderRequest {
  source: string
  displayMode?: boolean
}

export interface MathRenderResult {
  html: string
  displayMode: boolean
}

export interface MathRendererService {
  render(request: MathRenderRequest): MathRenderResult
}
