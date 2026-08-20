import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@ch4acko3/dsh-diff-engine/client'
import type {} from '@ch4acko3/dsh-syntax-highlight/client'
import type { DiffRendererService } from './contract.js'
import { HtmlDiffRenderer } from './service.js'

declare module '@deepseek-ai/cordis' {
  interface Context {
    diffRenderer: DiffRendererService
  }
}

export const name = '@ch4acko3/dsh-diff-render'
export const inject = ['syntaxHighlighter'] as const

export function apply(ctx: ClientContext): void {
  ctx.provide('diffRenderer', new HtmlDiffRenderer(ctx.syntaxHighlighter))
}

export * from './contract.js'
export * from './service.js'
