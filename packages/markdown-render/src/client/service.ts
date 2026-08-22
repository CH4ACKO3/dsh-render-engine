import type { CodeRendererService } from '@ch4acko3/dsh-code-render/client'
import type { DOMPurify } from 'dompurify'
import { Marked, type TokenizerAndRendererExtension, type Tokens } from 'marked'
import type { MarkdownRendererService, MarkdownRenderRequest, MarkdownRenderResult } from './contract.js'

const CODE_PLACEHOLDER = /<div data-dsh-markdown-code="(\d+)"><\/div>/g
const MATH_PLACEHOLDER = /<(?:div|span) data-dsh-markdown-math="(\d+)"><\/(?:div|span)>/g

export interface MarkdownCodeBlock {
  code: string
  language?: string
}

export type MarkdownCodeBlockEnhancer = (
  block: MarkdownCodeBlock,
) => MarkdownRenderResult | undefined | Promise<MarkdownRenderResult | undefined>

export interface MarkdownMath {
  source: string
  displayMode: boolean
  raw: string
}

export type MarkdownMathEnhancer = (
  math: MarkdownMath,
) => MarkdownRenderResult | undefined | Promise<MarkdownRenderResult | undefined>

interface MarkdownMathToken extends Tokens.Generic {
  source: string
  displayMode: boolean
}

const styles = `<style>
.dsh-markdown-render{color:var(--dsw-color-text,var(--shiki-foreground));font:var(--dsw-font-markdown-body,14px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif);overflow-wrap:anywhere}
.dsh-markdown-render>:first-child{margin-top:0}.dsh-markdown-render>:last-child{margin-bottom:0}
.dsh-markdown-render h1,.dsh-markdown-render h2,.dsh-markdown-render h3,.dsh-markdown-render h4,.dsh-markdown-render h5,.dsh-markdown-render h6{margin:1.35em 0 .55em;line-height:1.25}
.dsh-markdown-render h1{font-size:1.7em}.dsh-markdown-render h2{font-size:1.4em}.dsh-markdown-render h3{font-size:1.2em}
.dsh-markdown-render p,.dsh-markdown-render blockquote,.dsh-markdown-render ul,.dsh-markdown-render ol,.dsh-markdown-render table{margin:.8em 0}
.dsh-markdown-render a{color:var(--dsw-color-link,#465bdb)}
.dsh-markdown-render blockquote{padding:.05em 1em;color:var(--dsw-color-text-muted,currentColor);border-left:3px solid color-mix(in srgb,currentColor 22%,transparent)}
.dsh-markdown-render table{display:block;max-width:100%;overflow:auto;border-spacing:0;border-collapse:collapse}
.dsh-markdown-render th,.dsh-markdown-render td{padding:.4em .7em;border:1px solid color-mix(in srgb,currentColor 16%,transparent)}
.dsh-markdown-render th{font-weight:600;background:color-mix(in srgb,currentColor 5%,transparent)}
.dsh-markdown-render :not(pre)>code{padding:.15em .35em;background:color-mix(in srgb,currentColor 7%,transparent);border-radius:4px;font:var(--dsw-font-markdown-inline-code,.9em/1.4 monospace)}
.dsh-markdown-render img{max-width:100%;height:auto}.dsh-markdown-render input[type="checkbox"]{margin-inline:0 .45em}
.dsh-markdown-render hr{height:1px;margin:1.5em 0;background:color-mix(in srgb,currentColor 16%,transparent);border:0}
</style>`

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function languageOf(info: string | undefined): string | undefined {
  const language = info?.trim().split(/\s+/u)[0]
  return language === '' ? undefined : language
}

const inlineMathRule = /^\$(?!\$)((?:\\.|[^\\\n])*?(?:\\.|[^\\\n$]))\$(?=[\s?!.,:？！。，：]|$)/u

function inlineMathStart(source: string): number | undefined {
  let offset = 0
  let remaining = source
  while (remaining !== '') {
    const index = remaining.indexOf('$')
    if (index < 0) return
    if ((index === 0 || remaining[index - 1] === ' ') && inlineMathRule.test(remaining.slice(index))) {
      return offset + index
    }
    const consumed = index + 1
    const tail = remaining.slice(consumed)
    const extraDelimiters = /^\$+/u.exec(tail)?.[0].length ?? 0
    offset += consumed + extraDelimiters
    remaining = tail.slice(extraDelimiters)
  }
}

function mathExtensions(math: MarkdownMath[]): TokenizerAndRendererExtension[] {
  const renderToken = (token: Tokens.Generic) => {
    const { raw, source, displayMode } = token as MarkdownMathToken
    const index = math.push({ raw, source, displayMode }) - 1
    const tag = displayMode ? 'div' : 'span'
    return `<${tag} data-dsh-markdown-math="${index}"></${tag}>`
  }

  return [{
    name: 'dshMathBlock',
    level: 'block',
    start: source => source.indexOf('$$'),
    tokenizer(source) {
      const match = /^\$\$[ \t]*\n?([\s\S]*?)\n?\$\$(?:\n|$)/u.exec(source)
      const expression = match?.[1]?.trim()
      if (match === null || expression === undefined || expression === '') return
      return { type: 'dshMathBlock', raw: match[0], source: expression, displayMode: true }
    },
    renderer: renderToken,
  }, {
    name: 'dshMathInline',
    level: 'inline',
    start: inlineMathStart,
    tokenizer(source) {
      const match = inlineMathRule.exec(source)
      const expression = match?.[1]?.trim()
      if (match === null || expression === undefined) return
      return { type: 'dshMathInline', raw: match[0], source: expression, displayMode: false }
    },
    renderer: renderToken,
  }]
}

const renderFriendlyTildeExtension: TokenizerAndRendererExtension = {
  name: 'dshLiteralSingleTilde',
  level: 'inline',
  tokenizer(source) {
    if (!source.startsWith('~') || source.startsWith('~~')) return
    return { type: 'text', raw: '~', text: '~' }
  },
}

export class HtmlMarkdownRenderer implements MarkdownRendererService {
  private readonly codeRenderer: CodeRendererService
  private readonly purifier: DOMPurify
  private readonly enhanceCodeBlock: MarkdownCodeBlockEnhancer
  private readonly enhanceMath: MarkdownMathEnhancer

  constructor(
    codeRenderer: CodeRendererService,
    purifier: DOMPurify,
    enhanceCodeBlock: MarkdownCodeBlockEnhancer,
    enhanceMath: MarkdownMathEnhancer,
  ) {
    this.codeRenderer = codeRenderer
    this.purifier = purifier
    this.enhanceCodeBlock = enhanceCodeBlock
    this.enhanceMath = enhanceMath
  }

  async render(request: MarkdownRenderRequest): Promise<MarkdownRenderResult> {
    const codeBlocks: MarkdownCodeBlock[] = []
    const math: MarkdownMath[] = []
    const extensions = mathExtensions(math)
    if (request.mode === 'render-friendly') extensions.push(renderFriendlyTildeExtension)
    const marked = new Marked({
      extensions,
      gfm: true,
      renderer: {
        code: ({ text, lang }) => {
          const index = codeBlocks.push({
            code: text,
            language: languageOf(lang),
          }) - 1
          return `<div data-dsh-markdown-code="${index}"></div>`
        },
        html: ({ text }) => escapeHtml(text),
      },
    })
    const parsed = marked.parse(request.markdown)
    if (typeof parsed !== 'string') throw new Error('Markdown parser unexpectedly returned a promise')

    const sanitized = this.purifier.sanitize(parsed, {
      ADD_ATTR: ['data-dsh-markdown-code', 'data-dsh-markdown-math'],
      USE_PROFILES: { html: true },
    })
    const renderedCodeBlocks = await Promise.all(codeBlocks.map(async (block) => {
      const enhanced = await this.enhanceCodeBlock(block)
      return enhanced?.html ?? this.codeRenderer.render(block).html
    }))
    const renderedMath = await Promise.all(math.map(async (expression) => {
      const enhanced = await this.enhanceMath(expression)
      if (enhanced !== undefined) return enhanced.html
      if (expression.displayMode) {
        return this.codeRenderer.render({ code: expression.raw, language: 'latex' }).html
      }
      return `<code class="dsh-markdown-math-source">${escapeHtml(expression.raw)}</code>`
    }))
    const withCode = sanitized.replace(CODE_PLACEHOLDER, (_placeholder, rawIndex: string) => {
      const block = renderedCodeBlocks[Number(rawIndex)]
      if (block === undefined) throw new Error(`Markdown code block ${rawIndex} is missing`)
      return block
    })
    const content = withCode.replace(MATH_PLACEHOLDER, (_placeholder, rawIndex: string) => {
      const expression = renderedMath[Number(rawIndex)]
      if (expression === undefined) throw new Error(`Markdown math expression ${rawIndex} is missing`)
      return expression
    })

    return {
      html: `${styles}<div class="dsh-markdown-render">${content}</div>`,
    }
  }
}
