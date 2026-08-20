import type { DiffDocument } from '@ch4acko3/dsh-diff-engine/client'

export interface DiffRenderResult {
  html: string
  files: number
  additions: number
  deletions: number
  highlighted: boolean
}

export interface DiffRendererService {
  render(document: DiffDocument): DiffRenderResult
}
