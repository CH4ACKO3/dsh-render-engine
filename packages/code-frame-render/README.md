# @ch4acko3/dsh-code-frame-render

A browser-side Cordis service that renders syntax-highlighted source context with diagnostic ranges and messages. It performs no file IO and does not depend on an LSP implementation.

Positions are zero-based UTF-16 code-unit offsets, matching the LSP position model. Diagnostics from compilers, linters, tests, agents, or language servers can therefore be adapted into the same request shape.

```ts
const result = ctx.codeFrameRenderer.render({
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

console.log(result.html)
```
