import type { DOMPurify } from 'dompurify'
import type { MermaidRendererService, MermaidRenderRequest, MermaidRenderResult } from './contract.js'

export interface MermaidApi {
  initialize(config: { startOnLoad: boolean, securityLevel: 'strict' }): void
  render(id: string, source: string): Promise<{ svg: string }>
}

export class SvgMermaidRenderer implements MermaidRendererService {
  private nextId = 0

  constructor(
    private readonly mermaid: MermaidApi,
    private readonly purifier: DOMPurify,
  ) {
    mermaid.initialize({ startOnLoad: false, securityLevel: 'strict' })
  }

  async render(request: MermaidRenderRequest): Promise<MermaidRenderResult> {
    const id = `dsh-mermaid-${++this.nextId}`
    const { svg } = await this.mermaid.render(id, request.source)
    const sanitized = this.purifier.sanitize(svg, {
      USE_PROFILES: { svg: true, svgFilters: true },
    })
    if (sanitized === '') throw new Error('Mermaid produced an empty SVG')

    return {
      html: `<div class="dsh-mermaid-render" style="max-width:100%;overflow:auto;text-align:center">${sanitized}</div>`,
    }
  }
}
