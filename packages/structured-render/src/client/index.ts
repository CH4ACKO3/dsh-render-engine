import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { StructuredRendererService } from './contract.js'
import { HtmlStructuredRenderer } from './service.js'

declare module '@deepseek-ai/cordis' {
  interface Context {
    structuredRenderer: StructuredRendererService
  }
}

export const name = '@ch4acko3/dsh-structured-render'
export const inject = [] as const

export function apply(ctx: ClientContext): void {
  ctx.provide('structuredRenderer', new HtmlStructuredRenderer())
}

export * from './contract.js'
export * from './service.js'
