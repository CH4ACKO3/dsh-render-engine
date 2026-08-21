# @ch4acko3/dsh-math-render

A browser-side Cordis service that renders TeX expressions as native MathML with KaTeX.

```ts
export const inject = ['mathRenderer']

export function apply(ctx) {
  const result = ctx.mathRenderer.render({
    source: String.raw`e^{i\pi} + 1 = 0`,
    displayMode: true,
  })
  console.log(result.html)
}
```

KaTeX runs with trusted commands disabled and emits native MathML, so consumers do not need a stylesheet or bundled font files. The service provides rendering only and does not ship an editor or ChatView card.
