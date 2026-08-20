import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@ch4acko3/dsh-syntax-highlight/client'
import type { CodeRendererService } from './contract.js'
import { HtmlCodeRenderer } from './service.js'

declare module '@deepseek-ai/cordis' {
  interface Context {
    codeRenderer: CodeRendererService
  }
}

export const name = '@ch4acko3/dsh-code-render'
export const inject = ['syntaxHighlighter'] as const

export function apply(ctx: ClientContext): void {
  ctx.provide('codeRenderer', new HtmlCodeRenderer(ctx.syntaxHighlighter))
}

export * from './contract.js'
export * from './service.js'
