import { createCssVariablesTheme, createHighlighterCoreSync } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import type { HighlighterCore } from 'shiki/core'
import type { ShikiService, ShikiTokenizeRequest, ShikiTokenizeResult, SourceLineEnding } from './contract.js'
import { bundledLanguages, resolveLanguage, supportedLanguages } from './languages.js'

export const DSH_SHIKI_THEME = 'dsh-css-variables'

const theme = createCssVariablesTheme({
  name: DSH_SHIKI_THEME,
  variablePrefix: '--shiki-',
  fontStyle: true,
})

function lineEndingsOf(code: string): SourceLineEnding[] {
  return code.match(/\r\n|\r|\n/g) as SourceLineEnding[] | null ?? []
}

export class ShikiEngine implements ShikiService {
  readonly languages = supportedLanguages
  private highlighterInstance: HighlighterCore | undefined

  resolveLanguage(language: string | undefined): string | null {
    return resolveLanguage(language)
  }

  tokenize({ code, language: hint }: ShikiTokenizeRequest): ShikiTokenizeResult {
    const language = this.resolveLanguage(hint)
    if (language === null) throw new Error(`Unsupported Shiki language: ${hint}`)

    const { tokens } = this.highlighter().codeToTokens(code, {
      lang: language,
      theme: DSH_SHIKI_THEME,
    })

    return {
      language,
      lines: tokens.map(line => line.map(token => ({
        content: token.content,
        color: token.color,
        fontStyle: token.fontStyle,
      }))),
      lineEndings: lineEndingsOf(code),
    }
  }

  private highlighter(): HighlighterCore {
    this.highlighterInstance ??= createHighlighterCoreSync({
      themes: [theme],
      langs: bundledLanguages,
      engine: createJavaScriptRegexEngine({ forgiving: true }),
    })
    return this.highlighterInstance
  }
}

export function createShikiService(): ShikiService {
  return new ShikiEngine()
}
