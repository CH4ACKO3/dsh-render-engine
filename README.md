# DSH Render Engine

English | [简体中文](./README.zh-CN.md)

A small monorepo of browser-side rendering services for DeepSeek Harness Web plugins. It separates Shiki tokenization, stable syntax-highlight tokens, Markdown, structured data, semantic tables, Mermaid diagrams, TeX math, normalized diffs, diagnostic code frames, ANSI terminal output, and safe HTML rendering into twelve independently publishable npm packages.

## Renderer services, not a frontend

The twelve published packages do **not** ship a page, panel, ChatView card, or other concrete frontend. They register reusable browser-side Cordis services such as `ctx.codeRenderer`, `ctx.markdownRenderer`, `ctx.structuredRenderer`, `ctx.tableRenderer`, and `ctx.diffRenderer`. A downstream plugin chooses the host surface and interaction, calls the services with its own data, and receives normalized structures, stable tokens, SVG, MathML, or escaped theme-aware HTML that it can embed in that surface.

The ChatView cards shown below belong only to the private `integration/consumer`. They demonstrate one possible adapter built on the public services; they are not UI bundled with the published renderer packages.

## See it in ChatView

The same persisted patch is expanded on both sides. Native DSH presents it as plain text; a downstream adapter can call `dsh-diff-engine` and `dsh-diff-render` to produce a structured, themed, syntax-aware review surface.

![The same expanded patch shown as plain unified text in native DSH ChatView and as a structured, syntax-highlighted diff with the Render Engine adapter](./docs/assets/chatview-rendering-comparison.png)

Both sides use the same persisted command output. The private integration consumer connects the public services to a real DSH conversation slot so their effect can be compared with the native fallback.

### More real ChatView comparisons

The same TypeScript source changes from an expanded plain-text command result into a compact syntax-highlighted code surface.

![The same TypeScript source shown as plain text in native DSH ChatView and with syntax highlighting through the Code Render adapter](./docs/assets/chatview-code-comparison.png)

A raw diagnostic request becomes a focused code frame with source context, line numbers, an underlined range, and the error message beside the affected line.

![The same diagnostic shown as raw JSON in native DSH ChatView and as an annotated source frame through the Code Frame adapter](./docs/assets/chatview-code-frame-comparison.png)

ANSI control sequences are interpreted into readable terminal color and emphasis while preserving the original text.

![The same terminal output shown with visible ANSI escape sequences in native DSH ChatView and with terminal styling through the ANSI Render adapter](./docs/assets/chatview-ansi-comparison.png)

## Packages

| Package | Cordis service | Responsibility |
| --- | --- | --- |
| `@ch4acko3/dsh-shiki` | `ctx.shiki` | Owns one shared Shiki engine and the bundled language set. |
| `@ch4acko3/dsh-syntax-highlight` | `ctx.syntaxHighlighter` | Converts source code into stable, theme-aware tokens with a plain-text fallback. |
| `@ch4acko3/dsh-code-render` | `ctx.codeRenderer` | Converts highlight tokens into escaped HTML code blocks. |
| `@ch4acko3/dsh-markdown-render` | `ctx.markdownRenderer` | Renders untrusted GFM as sanitized, theme-aware HTML and delegates fenced code to `ctx.codeRenderer`. |
| `@ch4acko3/dsh-mermaid-render` | `ctx.mermaidRenderer` | Renders untrusted Mermaid definitions as sanitized SVG. |
| `@ch4acko3/dsh-math-render` | `ctx.mathRenderer` | Renders TeX expressions as accessible native MathML with KaTeX. |
| `@ch4acko3/dsh-structured-render` | `ctx.structuredRenderer` | Renders JSON-compatible values as escaped, expandable HTML trees. |
| `@ch4acko3/dsh-table-render` | `ctx.tableRenderer` | Renders record arrays as escaped, responsive semantic HTML tables. |
| `@ch4acko3/dsh-code-frame-render` | `ctx.codeFrameRenderer` | Renders source context with diagnostic ranges and messages. |
| `@ch4acko3/dsh-diff-engine` | `ctx.diffEngine` | Normalizes complete file snapshots, DSH file diffs, and unified patches into one structured document. |
| `@ch4acko3/dsh-diff-render` | `ctx.diffRenderer` | Renders normalized diffs as escaped HTML with source-language highlighting. |
| `@ch4acko3/dsh-ansi-render` | `ctx.ansiRenderer` | Converts ANSI terminal output into escaped, self-contained HTML. |

The dependency direction is intentionally one-way:

```text
dsh-code-render -------+--> dsh-syntax-highlight --> dsh-shiki
dsh-markdown-render -----> dsh-code-render
        + - - optional --> dsh-mermaid-render
        + - - optional --> dsh-math-render
dsh-code-frame-render -+
dsh-diff-render ---------> dsh-diff-engine
        +-----------------> dsh-syntax-highlight
dsh-ansi-render             (standalone)
dsh-mermaid-render          (standalone)
dsh-math-render             (standalone)
dsh-structured-render       (standalone)
dsh-table-render            (standalone)
```

The repository root and `integration/consumer` are private. Only the twelve packages under `packages/` are intended for publication.

## Features

- One lazily initialized Shiki engine shared by DSH Web plugins.
- Stable token data independent of Shiki's internal token shape.
- Original LF, CRLF, and CR line endings preserved across every service layer.
- CSS-variable colors that follow the DSH theme.
- Plain-text fallback for an absent or unsupported language hint.
- Escaped source text in the generated HTML.
- Sanitized GitHub Flavored Markdown with raw HTML rendered as text and fenced code delegated to the shared code renderer.
- Sanitized Mermaid SVG rendering with strict Mermaid security settings.
- TeX rendering as native MathML without stylesheet or font-file requirements.
- Expandable structured-data trees with JSON type styling and configurable initial depth.
- Responsive semantic tables with inferred or explicit columns, alignment, and empty states.
- Three explicit diff inputs: complete files, DSH `FileDiff` fragments, and unified or Git patches.
- One stable diff document with file, hunk, line, status, source-completeness, and summary data.
- Source-language token colors layered over semantic addition, deletion, context, and metadata rows.
- Diagnostic code frames with zero-based UTF-16 ranges compatible with LSP positions, without an LSP dependency.
- Safe ANSI SGR, 16-color, 256-color, true-color, and allowlisted hyperlink rendering.
- A private interactive preview for inspecting code, diagnostics, diffs, ANSI output, tokens, and HTML in a real DSH browser runtime.

Bundled languages: Bash, C, C++, CSS, Diff, Go, HTML, Java, JavaScript, JSX, JSON, Markdown, Python, Rust, SQL, TSX, TypeScript, and YAML. Common aliases such as `sh`, `js`, `md`, `patch`, `py`, `rs`, `ts`, `yml`, and `zsh` are accepted.

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

Render untrusted Markdown without binding the renderer to a particular ChatView or file browser:

```ts
const renderedMarkdown = await ctx.markdownRenderer.render({
  markdown: '# Result\n\n```ts\nconst answer = 42\n```',
})

console.log(renderedMarkdown.html)
```

The Markdown service supports GFM tables, task lists, strikethrough, inline `$…$` math, `$$…$$` display math, and `math`/`latex`/`tex`/`katex` fences. It displays raw HTML as text, sanitizes generated links and images, and sends ordinary fenced code through `ctx.codeRenderer`. At render time it uses `ctx.get('mermaidRenderer')` and `ctx.get('mathRenderer')` when those optional services exist; missing services leave readable code or source fallbacks. The Markdown package depends on neither Mermaid nor KaTeX.

Use the optional rich renderers directly when Markdown is not involved:

```ts
const diagram = await ctx.mermaidRenderer.render({ source: 'graph TD\n  A --> B' })
const formula = ctx.mathRenderer.render({ source: String.raw`e^{i\pi} + 1 = 0` })
```

Render structured tool output or record arrays without binding them to a particular panel:

```ts
const tree = ctx.structuredRenderer.render({
  label: 'response',
  value: { ready: true, items: [{ id: 1 }, { id: 2 }] },
  expandedDepth: 2,
})

const table = ctx.tableRenderer.render({
  caption: 'Package status',
  rows: [
    { package: 'markdown', tests: 7, ready: true },
    { package: 'mermaid', tests: 2, ready: true },
  ],
})
```

The structured renderer accepts JSON-compatible values rather than serialized JSON text. The table renderer accepts scalar record cells, infers column order from first appearance, and also supports explicit labels and alignment.

Normalize and render complete files, DSH file-diff fragments, or a unified patch through the same document format:

```ts
const document = ctx.diffEngine.diff({
  kind: 'files',
  before: { path: 'app.ts', content: 'const value = 1\n' },
  after: { path: 'app.ts', content: 'const value = 2\n' },
})

const rendered = ctx.diffRenderer.render(document)
console.log(rendered.html)
```

The diff engine performs no file IO and runs no Git commands. Complete files retain their source snapshots for full-source syntax highlighting. Patch-only and DSH fragment inputs are highlighted with the source context available inside each hunk.

Render compiler, linter, test, agent, or LSP-compatible diagnostics through the same code-frame model:

```ts
const frame = ctx.codeFrameRenderer.render({
  code: 'const value = missing\n',
  language: 'ts',
  fileName: 'app.ts',
  diagnostics: [{
    range: {
      start: { line: 0, character: 14 },
      end: { line: 0, character: 21 },
    },
    message: 'Cannot find name "missing"',
    severity: 'error',
  }],
})

const terminal = ctx.ansiRenderer.render({
  text: '\u001b[1;31mERROR\u001b[0m build failed',
})
```

Code-frame positions use zero-based UTF-16 code-unit offsets. The renderer performs no source lookup or LSP communication. ANSI rendering is request-local and does not emulate terminal cursor state.

## Local DSH preview

Build the workspace, add the twelve services and the private preview consumer to a DSH Web profile, then start DSH Web:

```sh
pnpm build

dsh plugin --profile web add "file:$PWD/packages/shiki"
dsh plugin --profile web add "file:$PWD/packages/syntax-highlight"
dsh plugin --profile web add "file:$PWD/packages/code-render"
dsh plugin --profile web add "file:$PWD/packages/mermaid-render"
dsh plugin --profile web add "file:$PWD/packages/math-render"
dsh plugin --profile web add "file:$PWD/packages/markdown-render"
dsh plugin --profile web add "file:$PWD/packages/structured-render"
dsh plugin --profile web add "file:$PWD/packages/table-render"
dsh plugin --profile web add "file:$PWD/packages/code-frame-render"
dsh plugin --profile web add "file:$PWD/packages/diff-engine"
dsh plugin --profile web add "file:$PWD/packages/diff-render"
dsh plugin --profile web add "file:$PWD/packages/ansi-render"
dsh plugin --profile web add "file:$PWD/integration/consumer"
dsh web
```

Open the URL printed by `dsh web`. The preview overlay lets you edit source code, choose a language, and switch between code, code-frame, diff, ANSI, structured-tree, semantic-table, token, and escaped HTML outputs. Run `/codedemo`, `/markdowndemo`, `/structureddemo`, `/tabledemo`, `/framedemo`, `/ansidemo`, or `/renderdemo` in ChatView to exercise the same services through native command slots. The integration consumer is for local verification only and must not be published.

## Repository layout

```text
packages/
  shiki/              Shared Shiki engine
  syntax-highlight/   Stable highlight-token service
  code-render/        Safe HTML renderer
  markdown-render/    Sanitized GFM renderer
  mermaid-render/     Sanitized Mermaid SVG renderer
  math-render/        KaTeX MathML renderer
  structured-render/  Expandable JSON-compatible value renderer
  table-render/       Responsive semantic table renderer
  code-frame-render/  Diagnostic source-context renderer
  diff-engine/        Multi-input normalized diff engine
  diff-render/        Syntax-highlighted HTML diff renderer
  ansi-render/        Safe ANSI terminal HTML renderer
integration/
  consumer/           Private DSH browser probe and preview
```

## Publishing

The `Publish packages` GitHub Actions workflow publishes one independently versioned package through npm Trusted Publishing (OIDC). No long-lived npm token is stored in GitHub. Each package must have its npm Trusted Publisher configured before its first release.

Releases are tag-driven:

1. Update the package version and push the commit to `main`.
2. Wait for CI to pass on that commit.
3. Create and push a matching package Tag, for example `dsh-code-render@0.2.0`.

Each Tag publishes only its named package, so the twelve packages may use different versions. Stable tags publish to npm `latest`; prerelease tags such as `dsh-code-render@0.2.0-next.0` publish to npm `next`. The workflow rejects unknown packages, malformed tags, tags whose commit is not on `main`, package-version mismatches, and versions that already exist on npm before publishing begins.

## License

[MIT](./LICENSE)
