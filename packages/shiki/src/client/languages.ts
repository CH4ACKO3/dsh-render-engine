import langBash from '@shikijs/langs/shellscript'
import langC from '@shikijs/langs/c'
import langCpp from '@shikijs/langs/cpp'
import langCss from '@shikijs/langs/css'
import langGo from '@shikijs/langs/go'
import langHtml from '@shikijs/langs/html'
import langJava from '@shikijs/langs/java'
import langJavaScript from '@shikijs/langs/javascript'
import langJsx from '@shikijs/langs/jsx'
import langJson from '@shikijs/langs/json'
import langMarkdown from '@shikijs/langs/markdown'
import langPython from '@shikijs/langs/python'
import langRust from '@shikijs/langs/rust'
import langSql from '@shikijs/langs/sql'
import langTsx from '@shikijs/langs/tsx'
import langTypeScript from '@shikijs/langs/typescript'
import langYaml from '@shikijs/langs/yaml'

export const bundledLanguages = [
  langBash,
  langC,
  langCpp,
  langCss,
  langGo,
  langHtml,
  langJava,
  langJavaScript,
  langJsx,
  langJson,
  langMarkdown,
  langPython,
  langRust,
  langSql,
  langTsx,
  langTypeScript,
  langYaml,
]

export const supportedLanguages = [
  'shellscript',
  'c',
  'cpp',
  'css',
  'go',
  'html',
  'java',
  'javascript',
  'jsx',
  'json',
  'markdown',
  'python',
  'rust',
  'sql',
  'tsx',
  'typescript',
  'yaml',
] as const

const aliases = new Map<string, string>([
  ['bash', 'shellscript'],
  ['c', 'c'],
  ['cpp', 'cpp'],
  ['css', 'css'],
  ['go', 'go'],
  ['html', 'html'],
  ['java', 'java'],
  ['javascript', 'javascript'],
  ['js', 'javascript'],
  ['jsx', 'jsx'],
  ['json', 'json'],
  ['jsonc', 'json'],
  ['markdown', 'markdown'],
  ['md', 'markdown'],
  ['python', 'python'],
  ['py', 'python'],
  ['rs', 'rust'],
  ['rust', 'rust'],
  ['sh', 'shellscript'],
  ['shell', 'shellscript'],
  ['shellscript', 'shellscript'],
  ['sql', 'sql'],
  ['ts', 'typescript'],
  ['tsx', 'tsx'],
  ['typescript', 'typescript'],
  ['yaml', 'yaml'],
  ['yml', 'yaml'],
  ['zsh', 'shellscript'],
])

export function resolveLanguage(language: string | undefined): string | null {
  if (language === undefined) return null
  return aliases.get(language.trim().toLowerCase()) ?? null
}
