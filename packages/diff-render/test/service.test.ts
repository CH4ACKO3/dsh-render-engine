import assert from 'node:assert/strict'
import test from 'node:test'
import type { DiffDocument } from '@ch4acko3/dsh-diff-engine/client'
import type { SyntaxHighlighterService } from '@ch4acko3/dsh-syntax-highlight/client'
import { HtmlDiffRenderer } from '../src/client/service.js'

function highlighter(): SyntaxHighlighterService {
  return {
    highlight: ({ code, language }) => ({
      language: language === 'ts' ? 'typescript' : null,
      highlighted: language === 'ts',
      lines: code.split(/\r\n|\r|\n/).map(content => [{
        content,
        color: content.includes('const') ? 'var(--shiki-token-keyword)' : 'var(--shiki-foreground)',
      }]),
      lineEndings: code.match(/\r\n|\r|\n/g) as Array<'\n' | '\r\n' | '\r'> | null ?? [],
    }),
  }
}

test('renders source-highlighted additions and deletions from complete snapshots', () => {
  const document: DiffDocument = {
    files: [{
      oldPath: 'src/value.ts',
      newPath: 'src/value.ts',
      language: null,
      status: 'modified',
      sourceCompleteness: 'full',
      sources: {
        before: 'const value = 1\n',
        after: 'const value = 2\n',
      },
      hunks: [{
        header: '@@ -1 +1 @@',
        oldStart: 1,
        oldLines: 1,
        newStart: 1,
        newLines: 1,
        lines: [
          { kind: 'deletion', content: 'const value = 1', oldLine: 1, newLine: null },
          { kind: 'addition', content: 'const value = 2', oldLine: null, newLine: 1 },
        ],
      }],
    }],
    additions: 1,
    deletions: 1,
  }

  const result = new HtmlDiffRenderer(highlighter()).render(document)

  assert.equal(result.highlighted, true)
  assert.equal(result.files, 1)
  assert.match(result.html, /dsh-diff-deletion/)
  assert.match(result.html, /dsh-diff-addition/)
  assert.match(result.html, /var\(--shiki-token-keyword\)/)
  assert.match(result.html, /data-source-completeness="full"/)
})

test('highlights patch fragments by reconstructing each side of a hunk', () => {
  const document: DiffDocument = {
    files: [{
      oldPath: 'a/src/value.ts',
      newPath: 'b/src/value.ts',
      language: null,
      status: 'modified',
      sourceCompleteness: 'fragment',
      hunks: [{
        header: '@@ -10,2 +10,2 @@',
        oldStart: 10,
        oldLines: 2,
        newStart: 10,
        newLines: 2,
        lines: [
          { kind: 'context', content: 'export {}', oldLine: 10, newLine: 10 },
          { kind: 'deletion', content: 'const value = 1', oldLine: 11, newLine: null },
          { kind: 'addition', content: 'const value = 2', oldLine: null, newLine: 11 },
        ],
      }],
    }],
    additions: 1,
    deletions: 1,
  }

  const result = new HtmlDiffRenderer(highlighter()).render(document)

  assert.equal(result.highlighted, true)
  assert.match(result.html, /@@ -10,2 \+10,2 @@/)
  assert.match(result.html, />10<\/span><span class="dsh-diff-new-line"[^>]*>10</)
})

test('escapes untrusted paths, source text, and metadata', () => {
  const document: DiffDocument = {
    files: [{
      oldPath: null,
      newPath: '<img src=x onerror=alert(1)>.txt',
      language: null,
      status: 'created',
      sourceCompleteness: 'fragment',
      hunks: [{
        header: '@@ <unsafe> @@',
        oldStart: 0,
        oldLines: 0,
        newStart: 1,
        newLines: 1,
        lines: [{ kind: 'addition', content: '<script>alert(1)</script>', oldLine: null, newLine: 1 }],
      }],
    }],
    additions: 1,
    deletions: 0,
  }

  const result = new HtmlDiffRenderer(highlighter()).render(document)

  assert.doesNotMatch(result.html, /<script>|<img/)
  assert.match(result.html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/)
  assert.match(result.html, /&lt;img src=x onerror=alert\(1\)&gt;/)
  assert.match(result.html, /@@ &lt;unsafe&gt; @@/)
})
