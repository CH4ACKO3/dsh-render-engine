import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@ch4acko3/dsh-code-render/client'
import DOMPurify from 'dompurify'
import type { MarkdownRendererService, MarkdownRenderResult } from './contract.js'
import type { MarkdownCodeBlock, MarkdownMath } from './service.js'
import { HtmlMarkdownRenderer } from './service.js'

interface MermaidRendererService {
  render(request: { source: string }): MarkdownRenderResult | Promise<MarkdownRenderResult>
}

interface MathRendererService {
  render(request: { source: string, displayMode?: boolean }): MarkdownRenderResult | Promise<MarkdownRenderResult>
}

const mathFenceLanguages = new Set(['katex', 'latex', 'math', 'tex'])

declare module '@deepseek-ai/cordis' {
  interface Context {
    markdownRenderer: MarkdownRendererService
  }
}

export const name = '@ch4acko3/dsh-markdown-render'
export const inject = ['codeRenderer'] as const

export function apply(ctx: ClientContext): void {
  const enhanceCodeBlock = (block: MarkdownCodeBlock) => {
    if (block.language === 'mermaid') {
      const renderer = ctx.get('mermaidRenderer') as MermaidRendererService | undefined
      return renderer?.render({ source: block.code })
    }
    if (block.language !== undefined && mathFenceLanguages.has(block.language)) {
      const renderer = ctx.get('mathRenderer') as MathRendererService | undefined
      return renderer?.render({ source: block.code, displayMode: true })
    }
  }
  const enhanceMath = (math: MarkdownMath) => {
    const renderer = ctx.get('mathRenderer') as MathRendererService | undefined
    return renderer?.render(math)
  }

  ctx.provide('markdownRenderer', new HtmlMarkdownRenderer(
    ctx.codeRenderer,
    DOMPurify,
    enhanceCodeBlock,
    enhanceMath,
  ))
}

export * from './contract.js'
export * from './service.js'
