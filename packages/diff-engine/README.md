# @ch4acko3/dsh-diff-engine

A browser-side Cordis service that normalizes complete file snapshots, DSH `FileDiff` fragments, and unified or Git patches into one structured diff document.

```ts
export const inject = ['diffEngine']

export function apply(ctx) {
  const document = ctx.diffEngine.diff({
    kind: 'files',
    before: { path: 'app.ts', content: 'const value = 1\n' },
    after: { path: 'app.ts', content: 'const value = 2\n', language: 'ts' },
  })
  console.log(document.files[0].hunks)
}
```

The engine performs no file IO and runs no Git commands. Callers provide the content or patch explicitly. Complete snapshots retain their original source text, including LF, CRLF, or CR separators, so downstream renderers can map source-language tokens back to diff lines. Patch and DSH fragment inputs are marked as fragment-complete because they may omit surrounding source context.
