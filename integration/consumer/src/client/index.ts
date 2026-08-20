import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@ch4acko3/dsh-code-render/client'
import type {} from '@ch4acko3/dsh-shiki/client'
import type {} from '@ch4acko3/dsh-syntax-highlight/client'
import { installPreview } from './preview.js'

interface IntegrationResult {
  passed: boolean
  language: string
  tokenizedSource: string
  highlightedSource: string
  fallbackIsPlain: boolean
  escapedHtml: boolean
  themedHtml: boolean
}

export const name = '@ch4acko3/dsh-render-engine-integration'
export const inject = ['shiki', 'syntaxHighlighter', 'codeRenderer'] as const

function sourceOf(lines: Array<Array<{ content: string }>>): string {
  return lines.map(line => line.map(token => token.content).join('')).join('\n')
}

export function apply(ctx: ClientContext): void {
  const source = 'const answer: number = 42'
  const raw = ctx.shiki.tokenize({ code: source, language: 'ts' })
  const highlighted = ctx.syntaxHighlighter.highlight({ code: source, language: 'ts' })
  const fallback = ctx.syntaxHighlighter.highlight({ code: '<unsafe>', language: 'cobol' })
  const rendered = ctx.codeRenderer.render({ code: '<script>alert(1)</script>', language: 'text' })

  const result: IntegrationResult = {
    passed: false,
    language: highlighted.language ?? '',
    tokenizedSource: sourceOf(raw.lines),
    highlightedSource: sourceOf(highlighted.lines),
    fallbackIsPlain: !fallback.highlighted && sourceOf(fallback.lines) === '<unsafe>',
    escapedHtml: rendered.html.includes('&lt;script&gt;') && !rendered.html.includes('<script>'),
    themedHtml: rendered.html.includes('var(--shiki-background)') && rendered.html.includes('var(--shiki-foreground)'),
  }
  result.passed = result.language === 'typescript'
    && result.tokenizedSource === source
    && result.highlightedSource === source
    && result.fallbackIsPlain
    && result.escapedHtml
    && result.themedHtml

  document.documentElement.dataset.dshRenderEngineIntegration = JSON.stringify(result)
  console.info('[dsh-render-engine:integration]', JSON.stringify(result))
  if (!result.passed) throw new Error('DSH Render Engine integration probe failed')

  ctx.effect(() => installPreview(ctx, result.passed), 'dsh-render-engine: preview')
}
