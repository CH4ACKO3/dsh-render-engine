import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { ShikiService } from './contract.js'
import { createShikiService } from './service.js'

declare module '@deepseek-ai/cordis' {
  interface Context {
    shiki: ShikiService
  }
}

export const name = '@ch4acko3/dsh-shiki'
export const inject = [] as const

export function apply(ctx: ClientContext): void {
  ctx.provide('shiki', createShikiService())
}

export * from './contract.js'
export * from './languages.js'
export * from './service.js'
