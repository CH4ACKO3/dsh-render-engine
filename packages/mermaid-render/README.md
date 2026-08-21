# @ch4acko3/dsh-mermaid-render

A browser-side Cordis service that renders untrusted Mermaid definitions as sanitized SVG diagrams.

```ts
export const inject = ['mermaidRenderer']

export async function apply(ctx) {
  const result = await ctx.mermaidRenderer.render({
    source: 'graph TD\n  Parse --> Render',
  })
  console.log(result.html)
}
```

Mermaid runs with `securityLevel: 'strict'`; the generated SVG is sanitized again before it is returned. The service provides rendering only and does not ship a ChatView card or diagram editor.
