# Browser integration test

`consumer` is a private DSH plugin that consumes all twelve publishable services inside a real browser Cordis runtime.

It verifies:

- Shiki resolves `ts` and preserves the tokenized source.
- Syntax highlighting preserves the source and reports `typescript`.
- An unsupported language returns plain tokens.
- Code rendering escapes source HTML.
- Rendered HTML uses DSH's `--shiki-*` theme variables.
- Markdown rendering sanitizes executable markup and delegates ordinary code, Mermaid, and TeX to the active renderer services.
- Mermaid rendering produces sanitized SVG and math rendering produces native MathML.
- Structured data rendering produces an escaped expandable tree.
- Table rendering produces an escaped semantic table with inferred or explicit columns.
- All three diff input kinds normalize into structured documents.
- Diff rendering highlights source tokens and escapes untrusted content.
- Code-frame rendering applies diagnostic ranges and escapes source, file names, and messages.
- ANSI rendering preserves styles while escaping source HTML.

## Run in an isolated DSH environment

Build the workspace, then link the packages and probe into a DSH Web profile in dependency order:

```sh
pnpm check
dsh plugin --profile web add link:/workspace/packages/shiki
dsh plugin --profile web add link:/workspace/packages/syntax-highlight
dsh plugin --profile web add link:/workspace/packages/code-render
dsh plugin --profile web add link:/workspace/packages/mermaid-render
dsh plugin --profile web add link:/workspace/packages/math-render
dsh plugin --profile web add link:/workspace/packages/markdown-render
dsh plugin --profile web add link:/workspace/packages/structured-render
dsh plugin --profile web add link:/workspace/packages/table-render
dsh plugin --profile web add link:/workspace/packages/code-frame-render
dsh plugin --profile web add link:/workspace/packages/diff-engine
dsh plugin --profile web add link:/workspace/packages/diff-render
dsh plugin --profile web add link:/workspace/packages/ansi-render
dsh plugin --profile web add link:/workspace/integration/consumer
dsh web
```

After loading the WebUI, read the `data-dsh-render-engine-integration` attribute from the document element and parse it as JSON. The integration test passes only when `passed` is `true`. The probe also logs the same result with the `[dsh-render-engine:integration]` prefix and throws when an assertion fails.
