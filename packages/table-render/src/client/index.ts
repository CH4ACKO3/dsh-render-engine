import type { Context as ClientContext } from '@deepseek-ai/cordis'
import type { TableRendererService } from './contract.js'
import { HtmlTableRenderer } from './service.js'

declare module '@deepseek-ai/cordis' {
  interface Context {
    tableRenderer: TableRendererService
  }
}

export const name = '@ch4acko3/dsh-table-render'
export const inject = [] as const

export function apply(ctx: ClientContext): void {
  ctx.provide('tableRenderer', new HtmlTableRenderer())
}

export * from './contract.js'
export * from './service.js'
