import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@ch4acko3/dsh-syntax-highlight/client'
import type { CodeFrameRendererService } from './contract.js'
import { HtmlCodeFrameRenderer } from './service.js'

declare module '@deepseek-ai/cordis' {
  interface Context {
    codeFrameRenderer: CodeFrameRendererService
  }
}

export const name = '@ch4acko3/dsh-code-frame-render'
export const inject = ['syntaxHighlighter'] as const

export function apply(ctx: ClientContext): void {
  ctx.provide('codeFrameRenderer', new HtmlCodeFrameRenderer(ctx.syntaxHighlighter))
}

export * from './contract.js'
export * from './service.js'
