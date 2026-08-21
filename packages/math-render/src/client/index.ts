import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { MathRendererService } from './contract.js'
import { MathMlRenderer } from './service.js'

declare module '@deepseek-ai/cordis' {
  interface Context {
    mathRenderer: MathRendererService
  }
}

export const name = '@ch4acko3/dsh-math-render'
export const inject = [] as const

export function apply(ctx: ClientContext): void {
  ctx.provide('mathRenderer', new MathMlRenderer())
}

export * from './contract.js'
export * from './service.js'
