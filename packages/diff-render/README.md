# @ch4acko3/dsh-diff-render

A browser-side Cordis service that renders `@ch4acko3/dsh-diff-engine` documents as escaped, theme-aware HTML. Diff rows keep their addition, deletion, context, and metadata semantics while source text is highlighted through `ctx.syntaxHighlighter` when the file language is supported.

```ts
export const inject = ['diffEngine', 'diffRenderer']

export function apply(ctx) {
  const document = ctx.diffEngine.diff({
    kind: 'files',
    before: { path: 'app.ts', content: 'const value = 1\n' },
    after: { path: 'app.ts', content: 'const value = 2\n' },
  })
  const result = ctx.diffRenderer.render(document)
  console.log(result.html)
}
```

Complete file snapshots are highlighted as complete sources and mapped back through their old and new line numbers. Patch-only inputs reconstruct each hunk's before and after fragments, so their source-language highlighting is fragment-scoped. Diff state uses row backgrounds and gutters without replacing the source token colors.
