# @ch4acko3/dsh-code-render

A browser-side Cordis service that renders `ctx.syntaxHighlighter` tokens as safe, theme-aware HTML code blocks.

```ts
export const inject = ['codeRenderer']

export function apply(ctx) {
  const result = ctx.codeRenderer.render({
    code: 'const answer = 42',
    language: 'ts',
  })
  console.log(result.html)
}
```

Source text and HTML attributes are escaped. Colors follow DSH's `--shiki-*` CSS variables, and original LF, CRLF, or CR line endings are retained.
