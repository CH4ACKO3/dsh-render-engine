import assert from 'node:assert/strict'
import test from 'node:test'
import { NormalizedDiffEngine } from '../src/client/service.js'

const engine = new NormalizedDiffEngine()

test('computes a normalized diff from two complete files', () => {
  const before = 'const answer = 41\r\nconst ready = false\r\n'
  const after = 'const answer = 42\r\nconst ready = true\r\n'
  const result = engine.diff({
    kind: 'files',
    before: { path: 'src/answer.ts', content: before },
    after: { path: 'src/answer.ts', content: after, language: 'ts' },
  })

  assert.equal(result.files.length, 1)
  assert.equal(result.additions, 2)
  assert.equal(result.deletions, 2)
  assert.equal(result.files[0]?.sourceCompleteness, 'full')
  assert.equal(result.files[0]?.language, 'ts')
  assert.equal(result.files[0]?.sources?.before, before)
  assert.equal(result.files[0]?.sources?.after, after)
  assert.ok(result.files[0]?.hunks[0]?.lines.every(line => !line.content.endsWith('\r')))
  assert.deepEqual(
    result.files[0]?.hunks[0]?.lines.map(line => [line.kind, line.oldLine, line.newLine]),
    [
      ['deletion', 1, null],
      ['deletion', 2, null],
      ['addition', null, 1],
      ['addition', null, 2],
    ],
  )
})

test('normalizes DSH file diff fragments and create operations', () => {
  const result = engine.diff({
    kind: 'file-diffs',
    diffs: [
      { path: 'src/value.ts', oldText: 'const value = 1', newText: 'const value = 2', language: 'ts' },
      { path: 'src/new.ts', oldText: null, newText: 'export const ready = true', language: 'ts' },
    ],
  })

  assert.equal(result.files.length, 2)
  assert.equal(result.files[0]?.sourceCompleteness, 'fragment')
  assert.equal(result.files[1]?.status, 'created')
  assert.equal(result.files[1]?.oldPath, null)
  assert.equal(result.additions, 2)
  assert.equal(result.deletions, 1)
})

test('parses a multi-file Git patch into the same document format', () => {
  const result = engine.diff({
    kind: 'patch',
    patch: `diff --git a/src/a.ts b/src/a.ts
index 7898192..6178079 100644
--- a/src/a.ts
+++ b/src/a.ts
@@ -1 +1 @@
-export const value = 1
+export const value = 2
diff --git a/src/new.ts b/src/new.ts
new file mode 100644
--- /dev/null
+++ b/src/new.ts
@@ -0,0 +1 @@
+export const ready = true
`,
  })

  assert.equal(result.files.length, 2)
  assert.equal(result.files[0]?.oldPath, 'a/src/a.ts')
  assert.equal(result.files[0]?.newPath, 'b/src/a.ts')
  assert.equal(result.files[0]?.hunks[0]?.lines[0]?.oldLine, 1)
  assert.equal(result.files[0]?.hunks[0]?.lines[1]?.newLine, 1)
  assert.equal(result.files[1]?.status, 'created')
  assert.equal(result.files[1]?.oldPath, null)
  assert.equal(result.additions, 2)
  assert.equal(result.deletions, 1)
})

test('returns an empty document for an empty patch', () => {
  assert.deepEqual(engine.diff({ kind: 'patch', patch: '' }), {
    files: [],
    additions: 0,
    deletions: 0,
  })
})
