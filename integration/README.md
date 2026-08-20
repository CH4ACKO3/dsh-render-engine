# Browser integration test

`consumer` is a private DSH plugin that consumes all five publishable services inside a real browser Cordis runtime.

It verifies:

- Shiki resolves `ts` and preserves the tokenized source.
- Syntax highlighting preserves the source and reports `typescript`.
- An unsupported language returns plain tokens.
- Code rendering escapes source HTML.
- Rendered HTML uses DSH's `--shiki-*` theme variables.
- All three diff input kinds normalize into structured documents.
- Diff rendering highlights source tokens and escapes untrusted content.

## Run in an isolated DSH environment

Build the workspace, then link the packages and probe into a DSH Web profile in dependency order:

```sh
pnpm check
dsh plugin --profile web add link:/workspace/packages/shiki
dsh plugin --profile web add link:/workspace/packages/syntax-highlight
dsh plugin --profile web add link:/workspace/packages/code-render
dsh plugin --profile web add link:/workspace/packages/diff-engine
dsh plugin --profile web add link:/workspace/packages/diff-render
dsh plugin --profile web add link:/workspace/integration/consumer
dsh web
```

After loading the WebUI, read the `data-dsh-render-engine-integration` attribute from the document element and parse it as JSON. The integration test passes only when `passed` is `true`. The probe also logs the same result with the `[dsh-render-engine:integration]` prefix and throws when an assertion fails.
