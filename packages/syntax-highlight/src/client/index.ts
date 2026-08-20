import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@ch4acko3/dsh-shiki/client'
import type { SyntaxHighlighterService } from './contract.js'
import { SyntaxHighlighter } from './service.js'

declare module '@deepseek-ai/cordis' {
  interface Context {
    syntaxHighlighter: SyntaxHighlighterService
  }
}

export const name = '@ch4acko3/dsh-syntax-highlight'
export const inject = ['shiki'] as const

export function apply(ctx: ClientContext): void {
  ctx.provide('syntaxHighlighter', new SyntaxHighlighter(ctx.shiki))
}

export * from './contract.js'
export * from './service.js'
