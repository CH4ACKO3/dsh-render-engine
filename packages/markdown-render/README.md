# @ch4acko3/dsh-markdown-render

A browser-side Cordis service that renders untrusted GitHub Flavored Markdown as sanitized, theme-aware HTML. Fenced code blocks reuse `ctx.codeRenderer`, so every downstream plugin gets the same language aliases, Shiki tokens, escaping, and DSH theme colors as the rest of the render engine.

```ts
export const inject = ['markdownRenderer']

export async function apply(ctx) {
  const result = await ctx.markdownRenderer.render({
    markdown: '# Result\n\n```ts\nconst answer = 42\n```',
  })
  console.log(result.html)
}
```

The renderer supports GFM tables, task lists, strikethrough, links, images, blockquotes, and fenced code. Raw HTML is displayed as text, unsafe URLs and executable markup are removed, and the returned HTML contains only fixed renderer styles plus sanitized Markdown output.

The only required rendering dependency is `ctx.codeRenderer`. At render time, a `mermaid` fence checks `ctx.get('mermaidRenderer')`; `$…$`, `$$…$$`, and `math`/`latex`/`tex`/`katex` fences check `ctx.get('mathRenderer')`. Active optional services receive the source and replace the fallback with safe SVG or MathML. Without them, Markdown remains readable as highlighted code or literal source. This package depends on neither Mermaid nor KaTeX, so either renderer can be installed or removed independently.

This package provides no ChatView, file browser, editor, or export workflow. Those belong in downstream plugins.
