import type {
  HighlightToken,
  SyntaxHighlighterService,
} from '@ch4acko3/dsh-syntax-highlight/client'
import type {
  CodeFrameDiagnostic,
  CodeFramePosition,
  CodeFrameRendererService,
  CodeFrameRenderRequest,
  CodeFrameRenderResult,
  CodeFrameSeverity,
} from './contract.js'

interface LineRange {
  start: number
  end: number
  severity: CodeFrameSeverity
}

const severityRank: Record<CodeFrameSeverity, number> = {
  error: 0,
  warning: 1,
  info: 2,
  hint: 3,
}

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

function diagnosticColor(severity: CodeFrameSeverity): string {
  if (severity === 'error') return 'var(--dsh-diagnostic-error,#d1242f)'
  if (severity === 'warning') return 'var(--dsh-diagnostic-warning,#9a6700)'
  if (severity === 'info') return 'var(--dsh-diagnostic-info,#0969da)'
  return 'var(--dsh-diagnostic-hint,#8250df)'
}

function positionAfter(left: CodeFramePosition, right: CodeFramePosition): boolean {
  return left.line > right.line || (left.line === right.line && left.character > right.character)
}

function validatePosition(label: string, position: CodeFramePosition, lines: string[]): void {
  if (!Number.isInteger(position.line) || !Number.isInteger(position.character)
    || position.line < 0 || position.character < 0) {
    throw new RangeError(`${label} must contain non-negative integer offsets`)
  }
  const line = lines[position.line]
  if (line === undefined || position.character > line.length) {
    throw new RangeError(`${label} is outside the source`)
  }
}

function validateDiagnostics(diagnostics: CodeFrameDiagnostic[], lines: string[]): void {
  for (const [index, diagnostic] of diagnostics.entries()) {
    if (!Object.hasOwn(severityRank, diagnostic.severity)) {
      throw new TypeError(`diagnostics[${index}].severity is unsupported`)
    }
    validatePosition(`diagnostics[${index}].range.start`, diagnostic.range.start, lines)
    validatePosition(`diagnostics[${index}].range.end`, diagnostic.range.end, lines)
    if (positionAfter(diagnostic.range.start, diagnostic.range.end)) {
      throw new RangeError(`diagnostics[${index}].range starts after it ends`)
    }
  }
}

function rangeOnLine(diagnostic: CodeFrameDiagnostic, line: number, length: number): LineRange | null {
  const { start, end } = diagnostic.range
  if (line < start.line || line > end.line) return null

  let rangeStart = line === start.line ? start.character : 0
  let rangeEnd = line === end.line ? end.character : length
  if (rangeStart === rangeEnd && start.line === end.line && length > 0) {
    if (rangeStart === length) rangeStart -= 1
    else rangeEnd += 1
  }
  if (rangeEnd <= rangeStart) return null
  return { start: rangeStart, end: rangeEnd, severity: diagnostic.severity }
}

function strongestRange(ranges: LineRange[], start: number, end: number): LineRange | undefined {
  return ranges
    .filter(range => range.start < end && range.end > start)
    .sort((left, right) => severityRank[left.severity] - severityRank[right.severity])[0]
}

function renderLineTokens(tokens: HighlightToken[], ranges: LineRange[]): string {
  let offset = 0
  return tokens.map((token) => {
    const tokenStart = offset
    const tokenEnd = tokenStart + token.content.length
    offset = tokenEnd
    const boundaries = new Set([tokenStart, tokenEnd])
    for (const range of ranges) {
      if (range.start > tokenStart && range.start < tokenEnd) boundaries.add(range.start)
      if (range.end > tokenStart && range.end < tokenEnd) boundaries.add(range.end)
    }
    const points = [...boundaries].sort((left, right) => left - right)
    return points.slice(0, -1).map((start, index) => {
      const end = points[index + 1]!
      const content = token.content.slice(start - tokenStart, end - tokenStart)
      const syntax = `<span style="${escapeHtml(tokenCss(token))}">${escapeHtml(content)}</span>`
      const range = strongestRange(ranges, start, end)
      if (range === undefined) return syntax
      const color = diagnosticColor(range.severity)
      return `<span class="dsh-code-frame-range dsh-code-frame-${range.severity}" style="background-color:color-mix(in srgb,${color} 12%,transparent);text-decoration:underline wavy ${color};text-underline-offset:3px">${syntax}</span>`
    }).join('')
  }).join('')
}

function renderDiagnostic(diagnostic: CodeFrameDiagnostic): string {
  const color = diagnosticColor(diagnostic.severity)
  return `<span class="dsh-code-frame-diagnostic dsh-code-frame-${diagnostic.severity}" data-severity="${diagnostic.severity}" style="display:grid;grid-template-columns:4.5ch minmax(0,1fr);column-gap:1ch;padding:.1em 1ch .35em;color:${color}"><span aria-hidden="true"></span><span><span style="font-weight:500">${diagnostic.severity}</span>: ${escapeHtml(diagnostic.message)}</span></span>`
}

export class HtmlCodeFrameRenderer implements CodeFrameRendererService {
  private readonly syntaxHighlighter: SyntaxHighlighterService

  constructor(syntaxHighlighter: SyntaxHighlighterService) {
    this.syntaxHighlighter = syntaxHighlighter
  }

  render(request: CodeFrameRenderRequest): CodeFrameRenderResult {
    const contextLines = request.contextLines ?? 2
    if (!Number.isInteger(contextLines) || contextLines < 0) {
      throw new RangeError('contextLines must be a non-negative integer')
    }

    const highlighted = this.syntaxHighlighter.highlight(request)
    const lines = highlighted.lines.map(line => line.map(token => token.content).join(''))
    validateDiagnostics(request.diagnostics, lines)

    const firstDiagnostic = request.diagnostics.length === 0
      ? 0
      : Math.min(...request.diagnostics.map(diagnostic => diagnostic.range.start.line))
    const lastDiagnostic = request.diagnostics.length === 0
      ? lines.length - 1
      : Math.max(...request.diagnostics.map(diagnostic => diagnostic.range.end.line))
    const firstLine = Math.max(0, firstDiagnostic - contextLines)
    const lastLine = Math.min(lines.length - 1, lastDiagnostic + contextLines)

    const renderedLines = highlighted.lines.slice(firstLine, lastLine + 1).map((tokens, relativeIndex) => {
      const line = firstLine + relativeIndex
      const lineContent = lines[line]!
      const ranges = request.diagnostics
        .map(diagnostic => rangeOnLine(diagnostic, line, lineContent.length))
        .filter((range): range is LineRange => range !== null)
      const diagnostics = request.diagnostics.filter(diagnostic => diagnostic.range.start.line === line)
      const marker = ranges.length > 0 ? '›' : ' '
      const source = `<span class="dsh-code-frame-line" data-line="${line + 1}" style="display:grid;grid-template-columns:1.5ch 3ch minmax(0,1fr);column-gap:0;padding:0 1ch"><span class="dsh-code-frame-marker" aria-hidden="true" style="color:${ranges.length > 0 ? diagnosticColor(ranges[0]!.severity) : 'inherit'}">${marker}</span><span class="dsh-code-frame-line-number" aria-hidden="true" style="padding-right:1ch;text-align:right;opacity:.55;user-select:none">${line + 1}</span><span class="dsh-code-frame-code">${renderLineTokens(tokens, ranges)}</span></span>`
      return source + diagnostics.map(renderDiagnostic).join('')
    }).join('')

    const header = request.fileName === undefined
      ? ''
      : `<span class="dsh-code-frame-header" style="display:block;padding:.45em .75em;border-bottom:1px solid var(--dsh-code-frame-border,rgb(127 127 127 / 20%));font-weight:500">${escapeHtml(request.fileName)}</span>`

    return {
      html: `<pre class="shiki dsh-code-frame-render" style="margin:0;overflow:auto;color:var(--shiki-foreground);background-color:var(--shiki-background);font:var(--dsw-font-markdown-code-block,13px/1.65 monospace)" tabindex="0"><code>${header}${renderedLines}</code></pre>`,
      language: highlighted.language,
      highlighted: highlighted.highlighted,
      diagnostics: request.diagnostics.length,
      firstLine,
      lastLine,
    }
  }
}
