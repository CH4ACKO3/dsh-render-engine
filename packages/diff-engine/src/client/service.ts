import { parsePatch, structuredPatch } from 'diff'
import type { StructuredPatch, StructuredPatchHunk } from 'diff'
import type {
  DiffDocument,
  DiffEngineService,
  DiffFile,
  DiffFileStatus,
  DiffHunk,
  DiffInput,
  DiffLine,
  DiffLineKind,
  DiffSourceCompleteness,
  DiffSources,
  FileDiffFragment,
} from './contract.js'

const CONTEXT_LINES = 3

function patchPath(path: string | undefined): string | null {
  if (path === undefined || path === '/dev/null') return null
  return path
}

function range(start: number, lines: number): string {
  return lines === 1 ? String(start) : `${start},${lines}`
}

function hunkHeader(hunk: StructuredPatchHunk): string {
  return `@@ -${range(hunk.oldStart, hunk.oldLines)} +${range(hunk.newStart, hunk.newLines)} @@`
}

function lineKind(line: string): DiffLineKind {
  if (line.startsWith('+')) return 'addition'
  if (line.startsWith('-')) return 'deletion'
  if (line.startsWith(' ')) return 'context'
  return 'metadata'
}

function normalizedHunk(hunk: StructuredPatchHunk): DiffHunk {
  let oldLine = hunk.oldStart
  let newLine = hunk.newStart
  const lines: DiffLine[] = hunk.lines.map((raw) => {
    const normalized = raw.endsWith('\r') ? raw.slice(0, -1) : raw
    const kind = lineKind(normalized)
    const content = kind === 'metadata' ? normalized : normalized.slice(1)
    const line: DiffLine = {
      kind,
      content,
      oldLine: kind === 'context' || kind === 'deletion' ? oldLine : null,
      newLine: kind === 'context' || kind === 'addition' ? newLine : null,
    }
    if (kind === 'context' || kind === 'deletion') oldLine += 1
    if (kind === 'context' || kind === 'addition') newLine += 1
    return line
  })

  return {
    header: hunkHeader(hunk),
    oldStart: hunk.oldStart,
    oldLines: hunk.oldLines,
    newStart: hunk.newStart,
    newLines: hunk.newLines,
    lines,
  }
}

function patchStatus(patch: StructuredPatch): DiffFileStatus {
  if (patch.isBinary === true) return 'binary'
  if (patch.isCopy === true) return 'copied'
  if (patch.isRename === true) return 'renamed'
  if (patch.isCreate === true || patch.oldFileName === '/dev/null') return 'created'
  if (patch.isDelete === true || patch.newFileName === '/dev/null') return 'deleted'
  return 'modified'
}

function normalizedFile(
  patch: StructuredPatch,
  sourceCompleteness: DiffSourceCompleteness,
  language: string | null,
  sources?: DiffSources,
  status = patchStatus(patch),
): DiffFile {
  return {
    oldPath: patchPath(patch.oldFileName),
    newPath: patchPath(patch.newFileName),
    language,
    status,
    sourceCompleteness,
    ...(sources === undefined ? {} : { sources }),
    hunks: patch.hunks.map(normalizedHunk),
  }
}

function document(files: readonly DiffFile[]): DiffDocument {
  let additions = 0
  let deletions = 0
  for (const file of files) {
    for (const hunk of file.hunks) {
      for (const line of hunk.lines) {
        if (line.kind === 'addition') additions += 1
        if (line.kind === 'deletion') deletions += 1
      }
    }
  }
  return { files, additions, deletions }
}

function fragmentFile(diff: FileDiffFragment): DiffFile {
  const before = diff.oldText ?? ''
  const patch = structuredPatch(
    diff.oldText === null ? '/dev/null' : diff.path,
    diff.path,
    before,
    diff.newText,
    undefined,
    undefined,
    { context: CONTEXT_LINES },
  )
  return normalizedFile(
    patch,
    'fragment',
    diff.language ?? null,
    { before, after: diff.newText },
    diff.oldText === null ? 'created' : 'modified',
  )
}

function meaningfulPatch(patch: StructuredPatch): boolean {
  return patch.hunks.length > 0
    || patch.oldFileName !== undefined
    || patch.newFileName !== undefined
    || patch.isBinary === true
    || patch.isRename === true
    || patch.isCopy === true
}

export class NormalizedDiffEngine implements DiffEngineService {
  diff(input: DiffInput): DiffDocument {
    switch (input.kind) {
      case 'files': {
        const patch = structuredPatch(
          input.before.path,
          input.after.path,
          input.before.content,
          input.after.content,
          undefined,
          undefined,
          { context: CONTEXT_LINES },
        )
        return document([normalizedFile(
          patch,
          'full',
          input.after.language ?? input.before.language ?? null,
          { before: input.before.content, after: input.after.content },
          input.before.path === input.after.path ? 'modified' : 'renamed',
        )])
      }
      case 'file-diffs':
        return document(input.diffs.map(fragmentFile))
      case 'patch':
        return document(parsePatch(input.patch)
          .filter(meaningfulPatch)
          .map(patch => normalizedFile(patch, 'fragment', null)))
    }
  }
}

export function createDiffEngine(): DiffEngineService {
  return new NormalizedDiffEngine()
}
