import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import DOMPurify from 'dompurify'
import mermaid from 'mermaid'
import type { MermaidRendererService } from './contract.js'
import { SvgMermaidRenderer, type MermaidApi } from './service.js'

declare module '@deepseek-ai/cordis' {
  interface Context {
    mermaidRenderer: MermaidRendererService
  }
}

export const name = '@ch4acko3/dsh-mermaid-render'
export const inject = [] as const

export function apply(ctx: ClientContext): void {
  ctx.provide('mermaidRenderer', new SvgMermaidRenderer(mermaid as MermaidApi, DOMPurify))
}

export * from './contract.js'
export * from './service.js'
