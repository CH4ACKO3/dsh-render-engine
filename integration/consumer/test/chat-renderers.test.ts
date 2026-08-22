import assert from 'node:assert/strict'
import test from 'node:test'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import {
  installedChatRendererCount,
  renderCommandState,
  resolveCommandOutput,
} from '../src/client/chat-renderers.js'

test('keeps running commands polite instead of reporting an error', () => {
  const output = resolveCommandOutput('/codedemo', null)
  assert.deepEqual(output, { kind: 'running', text: 'Running /codedemo…' })

  if (output.kind === 'ready') assert.fail('running output must not be renderable')
  const element = renderCommandState(output)
  assert.equal(element.props.role, 'status')
  assert.equal(element.props['aria-live'], 'polite')
})

test('announces failed commands assertively', () => {
  const output = resolveCommandOutput('/codedemo', { kind: 'error', text: 'boom' })
  assert.deepEqual(output, { kind: 'error', text: 'boom' })

  if (output.kind === 'ready') assert.fail('error output must not be renderable')
  const element = renderCommandState(output)
  assert.equal(element.props.role, 'alert')
  assert.equal(element.props['aria-live'], 'assertive')
})

test('treats successful commands without text as completed', () => {
  const output = resolveCommandOutput('/codedemo', { kind: 'success' })
  assert.deepEqual(output, { kind: 'empty', text: 'Command /codedemo completed.' })

  if (output.kind === 'ready') assert.fail('empty output must not be renderable')
  const element = renderCommandState(output)
  assert.equal(element.props.role, 'status')
  assert.equal(element.props['aria-live'], 'polite')
})

test('passes successful text to the renderer', () => {
  assert.deepEqual(
    resolveCommandOutput('/codedemo', { kind: 'success', text: 'const answer = 42' }),
    { kind: 'ready', text: 'const answer = 42' },
  )
})

test('counts actual ChatView adapter ledger entries', () => {
  const entries = [
    'codedemo',
    'framedemo',
    'ansidemo',
    'renderdemo',
    'markdowndemo',
    'structureddemo',
    'tabledemo',
    'unrelated',
  ]
    .map(key => ({ options: { key } }))
  const ctx = {
    slots: { entries: () => entries },
  } as unknown as ClientContext

  assert.equal(installedChatRendererCount(ctx), 7)
  entries.splice(2, 1)
  assert.equal(installedChatRendererCount(ctx), 6)
})
