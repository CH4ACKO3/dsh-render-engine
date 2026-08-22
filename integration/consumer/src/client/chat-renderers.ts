import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@ch4acko3/dsh-ansi-render/client'
import type { CodeFrameRenderRequest } from '@ch4acko3/dsh-code-frame-render/client'
import type {} from '@ch4acko3/dsh-code-render/client'
import type {} from '@ch4acko3/dsh-diff-engine/client'
import type {} from '@ch4acko3/dsh-diff-render/client'
import type {} from '@ch4acko3/dsh-markdown-render/client'
import type { StructuredRenderRequest } from '@ch4acko3/dsh-structured-render/client'
import type { TableRenderRequest } from '@ch4acko3/dsh-table-render/client'
import { createElement, useEffect, useState } from 'react'

type CommandProps = PropsRuntime<'conversation.chat.commandview'>
type DiffProps = CommandProps & Pick<ClientContext, 'diffEngine' | 'diffRenderer'>
type CodeProps = CommandProps & Pick<ClientContext, 'codeRenderer'>
type CodeFrameProps = CommandProps & Pick<ClientContext, 'codeFrameRenderer'>
type AnsiProps = CommandProps & Pick<ClientContext, 'ansiRenderer'>
type MarkdownProps = CommandProps & Pick<ClientContext, 'markdownRenderer'>
type StructuredProps = CommandProps & Pick<ClientContext, 'structuredRenderer'>
type TableProps = CommandProps & Pick<ClientContext, 'tableRenderer'>
type CommandOutcome = CommandProps['node']['outcome']
type MarkdownRenderState =
  | { kind: 'loading' }
  | { kind: 'ready', html: string }
  | { kind: 'error', error: unknown }

const CHAT_RENDERER_KEYS = [
  'codedemo',
  'framedemo',
  'ansidemo',
  'renderdemo',
  'markdowndemo',
  'structureddemo',
  'tabledemo',
] as const

export type CommandOutput =
  | { kind: 'running' | 'error' | 'empty', text: string }
  | { kind: 'ready', text: string }

const cardStyle = {
  width: 'min(100%, 760px)',
  overflow: 'hidden',
  border: '1px solid color-mix(in srgb, currentColor 12%, transparent)',
  borderRadius: '8px',
  background: 'var(--shiki-background, #fff)',
} as const

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  padding: '8px 10px',
  borderBottom: '1px solid color-mix(in srgb, currentColor 10%, transparent)',
} as const

const labelStyle = {
  color: 'currentColor',
  fontSize: '11px',
  fontWeight: 500,
  opacity: 0.62,
} as const

export function resolveCommandOutput(command: string, outcome: CommandOutcome): CommandOutput {
  if (outcome === null) {
    return { kind: 'running', text: `Running ${command}…` }
  }
  if (outcome.kind === 'error') {
    return { kind: 'error', text: outcome.text ?? `Command ${command} failed.` }
  }
  if (outcome.text === undefined) {
    return { kind: 'empty', text: `Command ${command} completed.` }
  }
  return { kind: 'ready', text: outcome.text }
}

export function renderCommandState(output: Exclude<CommandOutput, { kind: 'ready' }>) {
  const failed = output.kind === 'error'
  return createElement('div', {
    'aria-live': failed ? 'assertive' : 'polite',
    role: failed ? 'alert' : 'status',
    style: cardStyle,
  }, createElement('div', { style: { padding: '14px' } }, output.text))
}

function renderCard(command: string, label: string, ariaLabel: string, html: string) {
  return createElement('article', {
    'aria-label': ariaLabel,
    'data-render-engine-command-card': command.slice(1),
    style: cardStyle,
  },
  createElement('header', { style: headerStyle },
    createElement('span', { style: { fontSize: '12px', fontWeight: 500 } }, command),
    createElement('span', { style: labelStyle }, label)),
  createElement('div', { dangerouslySetInnerHTML: { __html: html } }))
}

function renderFailure(command: string, error: unknown) {
  const reason = error instanceof Error ? error.message : String(error)
  return renderCommandState({ kind: 'error', text: `Unable to render output: ${reason}` })
}

function RenderCodeCard({ node, codeRenderer }: CodeProps) {
  const output = resolveCommandOutput('/codedemo', node.outcome)
  if (output.kind !== 'ready') return renderCommandState(output)
  try {
    const rendered = codeRenderer.render({ code: output.text, language: 'ts' })
    return renderCard('/codedemo', 'syntax highlight', 'Syntax-highlighted code rendered by DSH Render Engine', rendered.html)
  } catch (error) {
    return renderFailure('/codedemo', error)
  }
}

function RenderCodeFrameCard({ node, codeFrameRenderer }: CodeFrameProps) {
  const output = resolveCommandOutput('/framedemo', node.outcome)
  if (output.kind !== 'ready') return renderCommandState(output)
  try {
    const request = JSON.parse(output.text) as CodeFrameRenderRequest
    const rendered = codeFrameRenderer.render(request)
    return renderCard('/framedemo', 'code frame', 'Diagnostic code frame rendered by DSH Render Engine', rendered.html)
  } catch (error) {
    return renderFailure('/framedemo', error)
  }
}

function RenderAnsiCard({ node, ansiRenderer }: AnsiProps) {
  const output = resolveCommandOutput('/ansidemo', node.outcome)
  if (output.kind !== 'ready') return renderCommandState(output)
  try {
    const rendered = ansiRenderer.render({ text: output.text })
    return renderCard('/ansidemo', 'ANSI', 'ANSI terminal output rendered by DSH Render Engine', rendered.html)
  } catch (error) {
    return renderFailure('/ansidemo', error)
  }
}

function RenderDiffCard({ node, diffEngine, diffRenderer }: DiffProps) {
  const output = resolveCommandOutput('/renderdemo', node.outcome)
  if (output.kind !== 'ready') return renderCommandState(output)
  try {
    const document = diffEngine.diff({ kind: 'patch', patch: output.text })
    const rendered = diffRenderer.render(document)
    return renderCard('/renderdemo', 'structured diff', 'Syntax-highlighted diff rendered by DSH Render Engine', rendered.html)
  } catch (error) {
    return renderFailure('/renderdemo', error)
  }
}

function RenderMarkdownReadyCard({ markdown, markdownRenderer }: { markdown: string, markdownRenderer: MarkdownProps['markdownRenderer'] }) {
  const [state, setState] = useState<MarkdownRenderState>({ kind: 'loading' })

  useEffect(() => {
    let active = true
    markdownRenderer.render({ markdown }).then(
      rendered => active && setState({ kind: 'ready', html: rendered.html }),
      error => active && setState({ kind: 'error', error }),
    )
    return () => {
      active = false
    }
  }, [markdown, markdownRenderer])

  if (state.kind === 'loading') {
    return renderCommandState({ kind: 'running', text: 'Rendering /markdowndemo…' })
  }
  if (state.kind === 'error') return renderFailure('/markdowndemo', state.error)
  return renderCard('/markdowndemo', 'GFM', 'Markdown rendered by DSH Render Engine', state.html)
}

function RenderMarkdownCard({ node, markdownRenderer }: MarkdownProps) {
  const output = resolveCommandOutput('/markdowndemo', node.outcome)
  if (output.kind !== 'ready') return renderCommandState(output)
  return createElement(RenderMarkdownReadyCard, {
    key: output.text,
    markdown: output.text,
    markdownRenderer,
  })
}

function RenderStructuredCard({ node, structuredRenderer }: StructuredProps) {
  const output = resolveCommandOutput('/structureddemo', node.outcome)
  if (output.kind !== 'ready') return renderCommandState(output)
  try {
    const request = JSON.parse(output.text) as StructuredRenderRequest
    const rendered = structuredRenderer.render(request)
    return renderCard(
      '/structureddemo',
      'structured data',
      'Expandable structured data rendered by DSH Render Engine',
      rendered.html,
    )
  } catch (error) {
    return renderFailure('/structureddemo', error)
  }
}

function RenderTableCard({ node, tableRenderer }: TableProps) {
  const output = resolveCommandOutput('/tabledemo', node.outcome)
  if (output.kind !== 'ready') return renderCommandState(output)
  try {
    const request = JSON.parse(output.text) as TableRenderRequest
    const rendered = tableRenderer.render(request)
    return renderCard('/tabledemo', 'table', 'Semantic table rendered by DSH Render Engine', rendered.html)
  } catch (error) {
    return renderFailure('/tabledemo', error)
  }
}

export function installChatRenderers(ctx: ClientContext): void {
  ctx.slots.inject('conversation.chat.commandview', () => ctx.slots.register({
    name: 'conversation.chat.commandview',
    key: 'codedemo',
    inject: () => ({ codeRenderer: ctx.codeRenderer }),
  }, RenderCodeCard))
  ctx.slots.inject('conversation.chat.commandview', () => ctx.slots.register({
    name: 'conversation.chat.commandview',
    key: 'framedemo',
    inject: () => ({ codeFrameRenderer: ctx.codeFrameRenderer }),
  }, RenderCodeFrameCard))
  ctx.slots.inject('conversation.chat.commandview', () => ctx.slots.register({
    name: 'conversation.chat.commandview',
    key: 'ansidemo',
    inject: () => ({ ansiRenderer: ctx.ansiRenderer }),
  }, RenderAnsiCard))
  ctx.slots.inject('conversation.chat.commandview', () => ctx.slots.register({
    name: 'conversation.chat.commandview',
    key: 'renderdemo',
    inject: () => ({
      diffEngine: ctx.diffEngine,
      diffRenderer: ctx.diffRenderer,
    }),
  }, RenderDiffCard))
  ctx.slots.inject('conversation.chat.commandview', () => ctx.slots.register({
    name: 'conversation.chat.commandview',
    key: 'markdowndemo',
    inject: () => ({ markdownRenderer: ctx.markdownRenderer }),
  }, RenderMarkdownCard))
  ctx.slots.inject('conversation.chat.commandview', () => ctx.slots.register({
    name: 'conversation.chat.commandview',
    key: 'structureddemo',
    inject: () => ({ structuredRenderer: ctx.structuredRenderer }),
  }, RenderStructuredCard))
  ctx.slots.inject('conversation.chat.commandview', () => ctx.slots.register({
    name: 'conversation.chat.commandview',
    key: 'tabledemo',
    inject: () => ({ tableRenderer: ctx.tableRenderer }),
  }, RenderTableCard))
}

export function installedChatRendererCount(ctx: ClientContext): number {
  const installedKeys = new Set(
    ctx.slots.entries('conversation.chat.commandview').map(entry => entry.options.key),
  )
  return CHAT_RENDERER_KEYS.filter(key => installedKeys.has(key)).length
}
