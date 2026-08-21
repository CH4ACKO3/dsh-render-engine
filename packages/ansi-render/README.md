# @ch4acko3/dsh-ansi-render

A browser-side Cordis service that renders ANSI terminal output as escaped HTML. It supports common SGR styles, 16-color, 256-color, true-color, and allowlisted HTTP or HTTPS terminal hyperlinks through `ansi_up`.

```ts
const result = ctx.ansiRenderer.render({
  text: '\u001b[1;31mERROR\u001b[0m build failed',
})

console.log(result.html)
```

The service creates a fresh parser for each render call. It does not emulate a terminal, execute control sequences, or maintain cursor state between requests.
