# @ch4acko3/dsh-table-render

Safe, responsive semantic table rendering for DeepSeek Harness Web plugins.

```ts
export const inject = ['tableRenderer']

export function apply(ctx) {
  const result = ctx.tableRenderer.render({
    caption: 'Package status',
    rows: [
      { package: 'markdown', status: 'ready', tests: 7 },
      { package: 'mermaid', status: 'ready', tests: 2 },
    ],
  })

  console.log(result.html)
}
```

Column order is inferred from the first appearance of each record key, or can be supplied explicitly with labels and alignment. Missing values, nulls, booleans, finite numbers, strings, and empty datasets receive distinct, accessible output.
