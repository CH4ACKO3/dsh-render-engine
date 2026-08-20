import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { DiffEngineService } from './contract.js'
import { NormalizedDiffEngine } from './service.js'

declare module '@deepseek-ai/cordis' {
  interface Context {
    diffEngine: DiffEngineService
  }
}

export const name = '@ch4acko3/dsh-diff-engine'

export function apply(ctx: ClientContext): void {
  ctx.provide('diffEngine', new NormalizedDiffEngine())
}

export * from './contract.js'
export * from './service.js'
