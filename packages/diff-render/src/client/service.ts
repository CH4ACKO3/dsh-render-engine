import type { DiffDocument, DiffFile, DiffHunk, DiffLine } from '@ch4acko3/dsh-diff-engine/client'
import type {
  HighlightToken,
  SyntaxHighlighterService,
  SyntaxHighlightResult,
} from '@ch4acko3/dsh-syntax-highlight/client'
import type { DiffRendererService, DiffRenderResult } from './contract.js'

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

function renderTokens(tokens: readonly HighlightToken[] | undefined, content: string): string {
  if (tokens === undefined) return escapeHtml(content)
  return tokens
    .map(token => `<span style="${escapeHtml(tokenCss(token))}">${escapeHtml(token.content)}</span>`)
    .join('')
}

function languageOf(file: DiffFile): string | undefined {
  if (file.language !== null) return file.language
  const path = file.newPath ?? file.oldPath
  if (path === null) return undefined
  const name = path.slice(path.lastIndexOf('/') + 1)
  const dot = name.lastIndexOf('.')
  return dot < 0 ? undefined : name.slice(dot + 1)
}

function lineTokens(result: SyntaxHighlightResult | undefined, line: number | null): readonly HighlightToken[] | undefined {
  if (result === undefined || line === null) return undefined
  return result.lines[line - 1]
}

function rowStyle(kind: DiffLine['kind']): string {
  const common = 'display:grid;grid-template-columns:4ch 4ch 2ch minmax(0,1fr);min-width:max-content;white-space:pre'
  if (kind === 'addition') return `${common};background-color:var(--dsh-diff-addition-background,rgb(46 160 67 / 15%))`
  if (kind === 'deletion') return `${common};background-color:var(--dsh-diff-deletion-background,rgb(248 81 73 / 15%))`
  if (kind === 'metadata') return `${common};color:var(--dsh-diff-metadata-color,var(--shiki-foreground));opacity:.7`
  return common
}

function marker(line: DiffLine): string {
  if (line.kind === 'addition') return '+'
  if (line.kind === 'deletion') return '-'
  return line.kind === 'context' ? ' ' : ''
}

function renderLine(line: DiffLine, tokens: readonly HighlightToken[] | undefined): string {
  const oldLine = line.oldLine === null ? '' : String(line.oldLine)
  const newLine = line.newLine === null ? '' : String(line.newLine)
  return `<span class="dsh-diff-line dsh-diff-${line.kind}" data-kind="${line.kind}" style="${rowStyle(line.kind)}"><span class="dsh-diff-old-line" style="padding:0 .75ch;text-align:right;opacity:.55;user-select:none">${oldLine}</span><span class="dsh-diff-new-line" style="padding:0 .75ch;text-align:right;opacity:.55;user-select:none">${newLine}</span><span class="dsh-diff-marker" style="text-align:center;user-select:none">${marker(line)}</span><span class="dsh-diff-code">${renderTokens(tokens, line.content)}</span></span>`
}

interface RenderedHunk {
  html: string
  highlighted: boolean
}

function fragmentSource(hunk: DiffHunk, side: 'before' | 'after'): string {
  return hunk.lines
    .filter(line => line.kind === 'context' || line.kind === (side === 'before' ? 'deletion' : 'addition'))
    .map(line => line.content)
    .join('\n')
}

function renderHunk(
  hunk: DiffHunk,
  language: string | undefined,
  highlighter: SyntaxHighlighterService,
  before: SyntaxHighlightResult | undefined,
  after: SyntaxHighlightResult | undefined,
): RenderedHunk {
  const fragmentBefore = before ?? highlighter.highlight({ code: fragmentSource(hunk, 'before'), language })
  const fragmentAfter = after ?? highlighter.highlight({ code: fragmentSource(hunk, 'after'), language })
  let oldFragmentLine = 1
  let newFragmentLine = 1
  const rows = hunk.lines.map((line) => {
    let tokens: readonly HighlightToken[] | undefined
    if (before !== undefined || after !== undefined) {
      tokens = line.kind === 'deletion'
        ? lineTokens(fragmentBefore, line.oldLine)
        : lineTokens(fragmentAfter, line.newLine)
    } else if (line.kind === 'deletion') {
      tokens = lineTokens(fragmentBefore, oldFragmentLine)
    } else if (line.kind === 'addition' || line.kind === 'context') {
      tokens = lineTokens(fragmentAfter, newFragmentLine)
    }

    if (line.kind === 'context' || line.kind === 'deletion') oldFragmentLine += 1
    if (line.kind === 'context' || line.kind === 'addition') newFragmentLine += 1
    return renderLine(line, tokens)
  }).join('')

  const header = `<span class="dsh-diff-hunk-header" style="display:block;padding:0 1ch;color:var(--dsh-diff-hunk-color,var(--shiki-foreground));background-color:var(--dsh-diff-hunk-background,rgb(56 139 253 / 12%));opacity:.8">${escapeHtml(hunk.header)}</span>`
  return {
    html: header + rows,
    highlighted: fragmentBefore.highlighted || fragmentAfter.highlighted,
  }
}

interface RenderedFile {
  html: string
  highlighted: boolean
}

function renderFile(file: DiffFile, highlighter: SyntaxHighlighterService): RenderedFile {
  const language = languageOf(file)
  const before = file.sources === undefined
    ? undefined
    : highlighter.highlight({ code: file.sources.before, language })
  const after = file.sources === undefined
    ? undefined
    : highlighter.highlight({ code: file.sources.after, language })
  const hunks = file.hunks.map(hunk => renderHunk(hunk, language, highlighter, before, after))
  const path = file.newPath ?? file.oldPath ?? '(unknown file)'
  const empty = file.hunks.length === 0
    ? `<span class="dsh-diff-empty" style="display:block;padding:.5em 1em;opacity:.7">${file.status === 'binary' ? 'Binary files differ' : 'No textual changes'}</span>`
    : ''
  return {
    html: `<section class="dsh-diff-file" data-status="${file.status}" data-source-completeness="${file.sourceCompleteness}"><header class="dsh-diff-file-header" style="padding:.45em .75em;border-bottom:1px solid var(--dsh-diff-border,rgb(127 127 127 / 20%));font-weight:500">${escapeHtml(path)}</header><pre class="dsh-diff-content" style="margin:0;overflow:auto;font:inherit">${hunks.map(hunk => hunk.html).join('')}${empty}</pre></section>`,
    highlighted: (before?.highlighted ?? false)
      || (after?.highlighted ?? false)
      || hunks.some(hunk => hunk.highlighted),
  }
}

export class HtmlDiffRenderer implements DiffRendererService {
  private readonly syntaxHighlighter: SyntaxHighlighterService

  constructor(syntaxHighlighter: SyntaxHighlighterService) {
    this.syntaxHighlighter = syntaxHighlighter
  }

  render(document: DiffDocument): DiffRenderResult {
    const files = document.files.map(file => renderFile(file, this.syntaxHighlighter))
    return {
      html: `<div class="dsh-diff-render" style="color:var(--shiki-foreground);background-color:var(--shiki-background);font:var(--dsw-font-markdown-code-block,13px/1.65 monospace)">${files.map(file => file.html).join('')}</div>`,
      files: document.files.length,
      additions: document.additions,
      deletions: document.deletions,
      highlighted: files.some(file => file.highlighted),
    }
  }
}

export function createDiffRenderer(syntaxHighlighter: SyntaxHighlighterService): DiffRendererService {
  return new HtmlDiffRenderer(syntaxHighlighter)
}
