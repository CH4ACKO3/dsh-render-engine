export interface DiffSourceFile {
  path: string
  content: string
  language?: string | undefined
}

export interface FilesDiffInput {
  kind: 'files'
  before: DiffSourceFile
  after: DiffSourceFile
}

export interface FileDiffFragment {
  path: string
  oldText: string | null
  newText: string
  language?: string | undefined
}

export interface FileDiffsInput {
  kind: 'file-diffs'
  diffs: readonly FileDiffFragment[]
}

export interface PatchDiffInput {
  kind: 'patch'
  patch: string
}

export type DiffInput = FilesDiffInput | FileDiffsInput | PatchDiffInput

export type DiffLineKind = 'context' | 'addition' | 'deletion' | 'metadata'
export type DiffFileStatus = 'modified' | 'created' | 'deleted' | 'renamed' | 'copied' | 'binary'
export type DiffSourceCompleteness = 'full' | 'fragment'

export interface DiffLine {
  kind: DiffLineKind
  content: string
  oldLine: number | null
  newLine: number | null
}

export interface DiffHunk {
  header: string
  oldStart: number
  oldLines: number
  newStart: number
  newLines: number
  lines: readonly DiffLine[]
}

export interface DiffSources {
  before: string
  after: string
}

export interface DiffFile {
  oldPath: string | null
  newPath: string | null
  language: string | null
  status: DiffFileStatus
  sourceCompleteness: DiffSourceCompleteness
  sources?: DiffSources | undefined
  hunks: readonly DiffHunk[]
}

export interface DiffDocument {
  files: readonly DiffFile[]
  additions: number
  deletions: number
}

export interface DiffEngineService {
  diff(input: DiffInput): DiffDocument
}
