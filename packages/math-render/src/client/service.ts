import katex from 'katex'
import type { MathRendererService, MathRenderRequest, MathRenderResult } from './contract.js'

export class MathMlRenderer implements MathRendererService {
  render(request: MathRenderRequest): MathRenderResult {
    const displayMode = request.displayMode ?? false
    const content = katex.renderToString(request.source, {
      displayMode,
      output: 'mathml',
      strict: 'error',
      throwOnError: true,
      trust: false,
    })
    const tag = displayMode ? 'div' : 'span'
    const style = displayMode
      ? 'display:block;margin:1em 0;overflow:auto;text-align:center'
      : 'display:inline-block;max-width:100%;vertical-align:middle'

    return {
      html: `<${tag} class="dsh-math-render" data-display-mode="${displayMode}" style="${style}">${content}</${tag}>`,
      displayMode,
    }
  }
}
