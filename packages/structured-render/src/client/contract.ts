export type StructuredPrimitive = null | boolean | number | string

export type StructuredValue =
  | StructuredPrimitive
  | readonly StructuredValue[]
  | { readonly [key: string]: StructuredValue }

export interface StructuredRenderRequest {
  value: StructuredValue
  label?: string
  expandedDepth?: number
}

export interface StructuredRenderResult {
  html: string
  nodeCount: number
}

export interface StructuredRendererService {
  render(request: StructuredRenderRequest): StructuredRenderResult
}
