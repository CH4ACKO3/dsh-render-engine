export interface MermaidRenderRequest {
  source: string
}

export interface MermaidRenderResult {
  html: string
}

export interface MermaidRendererService {
  render(request: MermaidRenderRequest): Promise<MermaidRenderResult>
}
