# @ch4acko3/dsh-shiki

A browser-side Cordis service that owns one lazily created Shiki engine for DeepSeek Harness Web plugins.

```ts
export const inject = ['shiki']

export function apply(ctx) {
  const result = ctx.shiki.tokenize({
    code: 'const answer = 42',
    language: 'ts',
  })
  console.log(result.lines)
}
```

`resolveLanguage()` accepts common aliases, including `patch` for the bundled `diff` grammar. `tokenize()` requires a supported language and returns Shiki tokens using DSH's `--shiki-*` CSS variables. Its `lineEndings` field preserves the source's original LF, CRLF, or CR separators.
