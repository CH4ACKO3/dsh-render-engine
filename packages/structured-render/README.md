# @ch4acko3/dsh-structured-render

Safe, theme-aware structured data rendering for DeepSeek Harness Web plugins.

```ts
export const inject = ['structuredRenderer']

export function apply(ctx) {
  const result = ctx.structuredRenderer.render({
    label: 'response',
    value: { ready: true, items: [{ id: 1 }, { id: 2 }] },
    expandedDepth: 2,
  })

  console.log(result.html)
  console.log(result.nodeCount)
}
```

The service accepts JSON-compatible values, escapes labels and strings, and uses native `<details>` elements for keyboard-accessible disclosure. `expandedDepth` controls how many levels begin open and defaults to `1`.
