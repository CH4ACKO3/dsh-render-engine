import type {
  HighlightToken,
  SourceLineEnding,
  SyntaxHighlighterService,
  SyntaxHighlightRequest,
} from '@ch4acko3/dsh-syntax-highlight/client'
import type { CodeRendererService, CodeRenderResult } from './contract.js'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function tokenCss(token: HighlightToken): string {
  const declarations = [`color:${token.color}`]
  if (token.style?.italic === true) declarations.push('font-style:italic')
  if (token.style?.bold === true) declarations.push('font-weight:bold')
  const decorations = [
    token.style?.underline === true ? 'underline' : undefined,
    token.style?.strikethrough === true ? 'line-through' : undefined,
  ].filter(value => value !== undefined)
  if (decorations.length > 0) declarations.push(`text-decoration:${decorations.join(' ')}`)
  return declarations.join(';')
}

function renderLines(lines: HighlightToken[][], lineEndings: SourceLineEnding[]): string {
  return lines.map((line, index) => {
    const tokens = line
      .map(token => `<span style="${escapeHtml(tokenCss(token))}">${escapeHtml(token.content)}</span>`)
      .join('')
    return `<span class="line">${tokens}</span>${lineEndings[index] ?? ''}`
  }).join('')
}

export class HtmlCodeRenderer implements CodeRendererService {
  private readonly syntaxHighlighter: SyntaxHighlighterService

  constructor(syntaxHighlighter: SyntaxHighlighterService) {
    this.syntaxHighlighter = syntaxHighlighter
  }

  render(request: SyntaxHighlightRequest): CodeRenderResult {
    const result = this.syntaxHighlighter.highlight(request)
    return {
      html: `<pre class="shiki dsh-code-render" style="margin:0;padding:.75em 1em;overflow:auto;color:var(--shiki-foreground);background-color:var(--shiki-background);font:var(--dsw-font-markdown-code-block,13px/1.65 monospace)" tabindex="0"><code>${renderLines(result.lines, result.lineEndings)}</code></pre>`,
      language: result.language,
      highlighted: result.highlighted,
    }
  }
}
