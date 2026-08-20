import type { ShikiService } from '@ch4acko3/dsh-shiki/client'
import type {
  HighlightToken,
  HighlightTokenStyle,
  SourceLineEnding,
  SyntaxHighlighterService,
  SyntaxHighlightRequest,
  SyntaxHighlightResult,
} from './contract.js'

const FOREGROUND = 'var(--shiki-foreground)'

function tokenStyle(fontStyle: number | undefined): HighlightTokenStyle | undefined {
  if (fontStyle === undefined || fontStyle <= 0) return undefined
  const style: HighlightTokenStyle = {}
  if ((fontStyle & 1) !== 0) style.italic = true
  if ((fontStyle & 2) !== 0) style.bold = true
  if ((fontStyle & 4) !== 0) style.underline = true
  if ((fontStyle & 8) !== 0) style.strikethrough = true
  return style
}

function lineEndingsOf(code: string): SourceLineEnding[] {
  return code.match(/\r\n|\r|\n/g) as SourceLineEnding[] | null ?? []
}

function plainLines(code: string): HighlightToken[][] {
  return code.split(/\r\n|\r|\n/).map(content => [{ content, color: FOREGROUND }])
}

export class SyntaxHighlighter implements SyntaxHighlighterService {
  private readonly shiki: ShikiService

  constructor(shiki: ShikiService) {
    this.shiki = shiki
  }

  highlight({ code, language: hint }: SyntaxHighlightRequest): SyntaxHighlightResult {
    const language = this.shiki.resolveLanguage(hint)
    if (language === null) {
      return {
        language: null,
        highlighted: false,
        lines: plainLines(code),
        lineEndings: lineEndingsOf(code),
      }
    }

    const result = this.shiki.tokenize({ code, language })
    return {
      language: result.language,
      highlighted: true,
      lines: result.lines.map(line => line.map((token) => {
        const style = tokenStyle(token.fontStyle)
        return {
          content: token.content,
          color: token.color ?? FOREGROUND,
          ...(style === undefined ? {} : { style }),
        }
      })),
      lineEndings: result.lineEndings,
    }
  }
}
