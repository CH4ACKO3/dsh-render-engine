# @ch4acko3/dsh-syntax-highlight

A browser-side Cordis service that converts the shared `ctx.shiki` output into a stable token model for DeepSeek Harness plugins.

```ts
export const inject = ['syntaxHighlighter']

export function apply(ctx) {
  const result = ctx.syntaxHighlighter.highlight({
    code: 'const answer = 42',
    language: 'ts',
  })
  console.log(result.lines)
}
```

Unknown or absent language hints return plain tokens instead of throwing. The result's `lineEndings` field preserves the source's original LF, CRLF, or CR separators.
