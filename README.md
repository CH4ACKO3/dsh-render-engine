# DSH Render Engine

English | [简体中文](./README.zh-CN.md)

A small monorepo of browser-side rendering services for DeepSeek Harness Web plugins. It separates Shiki tokenization, stable syntax-highlight tokens, and safe HTML code-block rendering into three independently publishable npm packages.

## Packages

| Package | Cordis service | Responsibility |
| --- | --- | --- |
| `@ch4acko3/dsh-shiki` | `ctx.shiki` | Owns one shared Shiki engine and the bundled language set. |
| `@ch4acko3/dsh-syntax-highlight` | `ctx.syntaxHighlighter` | Converts source code into stable, theme-aware tokens with a plain-text fallback. |
| `@ch4acko3/dsh-code-render` | `ctx.codeRenderer` | Converts highlight tokens into escaped HTML code blocks. |

The dependency direction is intentionally one-way:

```text
dsh-shiki <- dsh-syntax-highlight <- dsh-code-render
```

The repository root and `integration/consumer` are private. Only the three packages under `packages/` are intended for publication.

## Features

- One lazily initialized Shiki engine shared by DSH Web plugins.
- Stable token data independent of Shiki's internal token shape.
- Original LF, CRLF, and CR line endings preserved across every service layer.
- CSS-variable colors that follow the DSH theme.
- Plain-text fallback for an absent or unsupported language hint.
- Escaped source text in the generated HTML.
- A private interactive preview for inspecting code, tokens, and rendered HTML in a real DSH browser runtime.

Bundled languages: Bash, C, C++, CSS, Go, HTML, Java, JavaScript, JSX, JSON, Markdown, Python, Rust, SQL, TSX, TypeScript, and YAML. Common aliases such as `sh`, `js`, `md`, `py`, `rs`, `ts`, `yml`, and `zsh` are accepted.

## Requirements

- Node.js `^22.22.3 || >=24.11.1`
- pnpm `11.19.0`
- DeepSeek Harness `0.1.0-rc.8` for loading the plugins in DSH Web

## Local development

```sh
pnpm install
pnpm check
```

`pnpm check` builds every workspace package, runs TypeScript checks, and executes the unit tests.

## Using the services

Declare only the service your plugin consumes. Cordis will load its dependencies through the package chain.

```ts
export const inject = ['codeRenderer']

export function apply(ctx) {
  const result = ctx.codeRenderer.render({
    code: 'const answer: number = 42',
    language: 'ts',
  })

  console.log(result.language)    // "typescript"
  console.log(result.highlighted) // true
  console.log(result.html)        // escaped, theme-aware HTML
}
```

Use the lower-level services when structured data is needed:

```ts
const raw = ctx.shiki.tokenize({ code, language: 'ts' })
const highlighted = ctx.syntaxHighlighter.highlight({ code, language: 'ts' })
```

`ctx.shiki.tokenize()` requires a supported language. `ctx.syntaxHighlighter.highlight()` and `ctx.codeRenderer.render()` accept an absent or unknown language and return a non-highlighted plain-text result.

## Local DSH preview

Build the workspace, add the three services and the private preview consumer to a DSH Web profile, then start DSH Web:

```sh
pnpm build

dsh plugin --profile web add "file:$PWD/packages/shiki"
dsh plugin --profile web add "file:$PWD/packages/syntax-highlight"
dsh plugin --profile web add "file:$PWD/packages/code-render"
dsh plugin --profile web add "file:$PWD/integration/consumer"
dsh web
```

Open the URL printed by `dsh web`. The preview overlay lets you edit source code, choose a language, and switch between the rendered preview, structured tokens, and escaped HTML. The integration consumer is for local verification only and must not be published.

## Repository layout

```text
packages/
  shiki/              Shared Shiki engine
  syntax-highlight/   Stable highlight-token service
  code-render/        Safe HTML renderer
integration/
  consumer/           Private DSH browser probe and preview
```

## License

[MIT](./LICENSE)
