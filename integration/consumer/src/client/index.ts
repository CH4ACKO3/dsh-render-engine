import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@ch4acko3/dsh-ansi-render/client'
import type {} from '@ch4acko3/dsh-code-frame-render/client'
import type {} from '@ch4acko3/dsh-code-render/client'
import type {} from '@ch4acko3/dsh-diff-engine/client'
import type {} from '@ch4acko3/dsh-diff-render/client'
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
  diffInputKinds: boolean
  diffHighlighted: boolean
  diffEscapedHtml: boolean
  codeFrameEscapedHtml: boolean
  ansiStyled: boolean
  ansiEscapedHtml: boolean
}

export const name = '@ch4acko3/dsh-render-engine-integration'
export const inject = [
  'shiki',
  'syntaxHighlighter',
  'codeRenderer',
  'codeFrameRenderer',
  'diffEngine',
  'diffRenderer',
  'ansiRenderer',
] as const

function sourceOf(
  lines: Array<Array<{ content: string }>>,
  lineEndings: string[],
): string {
  return lines
    .map((line, index) => line.map(token => token.content).join('') + (lineEndings[index] ?? ''))
    .join('')
}

export function apply(ctx: ClientContext): void {
  const source = 'const answer: number = 42\r\nconst ready = true\r\n'
  const raw = ctx.shiki.tokenize({ code: source, language: 'ts' })
  const highlighted = ctx.syntaxHighlighter.highlight({ code: source, language: 'ts' })
  const fallback = ctx.syntaxHighlighter.highlight({ code: '<unsafe>', language: 'cobol' })
  const rendered = ctx.codeRenderer.render({ code: '<script>alert(1)</script>', language: 'text' })
  const filesDiff = ctx.diffEngine.diff({
    kind: 'files',
    before: { path: 'sample.ts', content: 'const value = 1\n' },
    after: { path: 'sample.ts', content: 'const value = <script>\n', language: 'ts' },
  })
  const fragmentsDiff = ctx.diffEngine.diff({
    kind: 'file-diffs',
    diffs: [{ path: 'sample.ts', oldText: 'const value = 1', newText: 'const value = 2', language: 'ts' }],
  })
  const patchDiff = ctx.diffEngine.diff({
    kind: 'patch',
    patch: '--- a/sample.ts\n+++ b/sample.ts\n@@ -1 +1 @@\n-const value = 1\n+const value = 2\n',
  })
  const renderedDiff = ctx.diffRenderer.render(filesDiff)
  const renderedFrame = ctx.codeFrameRenderer.render({
    code: 'const value = <unsafe>\n',
    language: 'ts',
    fileName: '<sample.ts>',
    diagnostics: [{
      range: {
        start: { line: 0, character: 14 },
        end: { line: 0, character: 22 },
      },
      message: '<unsafe diagnostic>',
      severity: 'error',
    }],
  })
  const renderedAnsi = ctx.ansiRenderer.render({
    text: '\u001b[1;31mERROR\u001b[0m <script>alert(1)</script>',
  })

  const result: IntegrationResult = {
    passed: false,
    language: highlighted.language ?? '',
    tokenizedSource: sourceOf(raw.lines, raw.lineEndings),
    highlightedSource: sourceOf(highlighted.lines, highlighted.lineEndings),
    fallbackIsPlain: !fallback.highlighted && sourceOf(fallback.lines, fallback.lineEndings) === '<unsafe>',
    escapedHtml: rendered.html.includes('&lt;script&gt;') && !rendered.html.includes('<script>'),
    themedHtml: rendered.html.includes('var(--shiki-background)') && rendered.html.includes('var(--shiki-foreground)'),
    diffInputKinds: filesDiff.files.length === 1
      && fragmentsDiff.files.length === 1
      && patchDiff.files.length === 1,
    diffHighlighted: renderedDiff.highlighted,
    diffEscapedHtml: renderedDiff.html.includes('&lt;script&gt;') && !renderedDiff.html.includes('<script>'),
    codeFrameEscapedHtml: renderedFrame.html.includes('&lt;unsafe&gt;')
      && renderedFrame.html.includes('&lt;unsafe diagnostic&gt;')
      && !renderedFrame.html.includes('<sample.ts>'),
    ansiStyled: renderedAnsi.styled,
    ansiEscapedHtml: renderedAnsi.html.includes('&lt;script&gt;') && !renderedAnsi.html.includes('<script>'),
  }
  result.passed = result.language === 'typescript'
    && result.tokenizedSource === source
    && result.highlightedSource === source
    && result.fallbackIsPlain
    && result.escapedHtml
    && result.themedHtml
    && result.diffInputKinds
    && result.diffHighlighted
    && result.diffEscapedHtml
    && result.codeFrameEscapedHtml
    && result.ansiStyled
    && result.ansiEscapedHtml

  document.documentElement.dataset.dshRenderEngineIntegration = JSON.stringify(result)
  console.info('[dsh-render-engine:integration]', JSON.stringify(result))
  if (!result.passed) throw new Error('DSH Render Engine integration probe failed')

  ctx.effect(() => installPreview(ctx, result.passed), 'dsh-render-engine: preview')
}
