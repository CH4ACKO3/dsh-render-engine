import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { AnsiRendererService } from './contract.js'
import { HtmlAnsiRenderer } from './service.js'

declare module '@deepseek-ai/cordis' {
  interface Context {
    ansiRenderer: AnsiRendererService
  }
}

export const name = '@ch4acko3/dsh-ansi-render'
export const inject = [] as const

export function apply(ctx: ClientContext): void {
  ctx.provide('ansiRenderer', new HtmlAnsiRenderer())
}

export * from './contract.js'
export * from './service.js'
