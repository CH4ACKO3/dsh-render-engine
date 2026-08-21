import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@ch4acko3/dsh-ansi-render/client'
import type {} from '@ch4acko3/dsh-code-frame-render/client'
import type {} from '@ch4acko3/dsh-code-render/client'
import type {} from '@ch4acko3/dsh-diff-engine/client'
import type {} from '@ch4acko3/dsh-diff-render/client'
import type {} from '@ch4acko3/dsh-shiki/client'
import type {} from '@ch4acko3/dsh-syntax-highlight/client'

const ROOT_ID = 'dsh-render-engine-preview'
const STYLE_ID = 'dsh-render-engine-preview-styles'
const SAMPLE_CODE = `type RenderResult = {
  language: string
  highlighted: boolean
}

export function render(code: string): RenderResult {
  return {
    language: 'typescript',
    highlighted: code.length > 0,
  }
}`

const SAMPLE_BEFORE = `type RenderResult = {
  language: string
}

export function render(code: string): RenderResult {
  return {
    language: 'plaintext',
  }
}`

const styles = `
#${ROOT_ID} {
  --dre-accent: #465bdb;
  --dre-accent-soft: #eef0ff;
  --dre-border: #dedfe2;
  --dre-muted: #68707d;
  --dre-surface: #ffffff;
  --dre-surface-raised: #f7f8fa;
  position: fixed;
  z-index: 2147483000;
  inset: 16px 16px 16px auto;
  display: grid;
  grid-template-rows: auto auto minmax(150px, 0.8fr) minmax(180px, 1fr);
  width: min(460px, calc(100vw - 32px));
  overflow: hidden;
  color: #0f1115;
  color-scheme: light;
  background: var(--dre-surface);
  border: 1px solid var(--dre-border);
  border-radius: 14px;
  box-shadow: 0 18px 48px rgb(15 23 42 / 18%);
  font: 13px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", sans-serif;
}

#${ROOT_ID}[data-collapsed="true"] {
  inset: auto 16px 16px auto;
  display: block;
  width: auto;
  border-radius: 12px;
}

#${ROOT_ID} * { box-sizing: border-box; }
#${ROOT_ID} ::selection { color: white; background: var(--dre-accent); }

#${ROOT_ID} .dre-header {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 58px;
  padding: 10px 12px 10px 16px;
  border-bottom: 1px solid var(--dre-border);
}

#${ROOT_ID} .dre-title { min-width: 0; flex: 1; }
#${ROOT_ID} .dre-title strong { display: block; font-size: 14px; font-weight: 650; }
#${ROOT_ID} .dre-title span { display: block; overflow: hidden; color: var(--dre-muted); font-size: 11px; text-overflow: ellipsis; white-space: nowrap; }

#${ROOT_ID} .dre-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #22663d;
  font-size: 11px;
  font-weight: 650;
}

#${ROOT_ID} .dre-status::before {
  width: 7px;
  height: 7px;
  background: #2e9b59;
  border-radius: 50%;
  content: "";
}

#${ROOT_ID} .dre-icon-button,
#${ROOT_ID} .dre-tab,
#${ROOT_ID} .dre-launcher {
  color: inherit;
  background: transparent;
  border: 0;
  font: inherit;
  cursor: pointer;
}

#${ROOT_ID} .dre-icon-button {
  display: grid;
  width: 32px;
  height: 32px;
  place-items: center;
  border-radius: 9px;
}

#${ROOT_ID} .dre-icon-button:hover { background: var(--dre-surface-raised); }
#${ROOT_ID} .dre-icon-button svg { width: 16px; height: 16px; fill: none; stroke: currentColor; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.8; }

#${ROOT_ID} .dre-pipeline {
  display: grid;
  grid-template-columns: 1fr auto 1fr auto 1fr;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  color: var(--dre-muted);
  background: var(--dre-surface-raised);
  border-bottom: 1px solid var(--dre-border);
  font-size: 11px;
}

#${ROOT_ID} .dre-pipeline b { color: #0f1115; font-weight: 600; text-align: center; }
#${ROOT_ID} .dre-pipeline i { width: 12px; height: 1px; background: var(--dre-border); }

#${ROOT_ID} .dre-editor {
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 0;
  padding: 14px 16px 0;
}

#${ROOT_ID} .dre-field-row { display: flex; align-items: end; gap: 10px; margin-bottom: 8px; }
#${ROOT_ID} .dre-field { display: grid; gap: 4px; color: var(--dre-muted); font-size: 11px; }
#${ROOT_ID} .dre-field:first-child { flex: 1; }

#${ROOT_ID} select {
  min-height: 32px;
  padding: 0 30px 0 10px;
  color: #0f1115;
  background: var(--dre-surface);
  border: 1px solid var(--dre-border);
  border-radius: 9px;
  font: inherit;
}

#${ROOT_ID} textarea {
  width: 100%;
  min-height: 0;
  resize: none;
  padding: 12px;
  color: #0f1115;
  caret-color: var(--dre-accent);
  background: var(--dre-surface-raised);
  border: 1px solid transparent;
  border-radius: 10px 10px 0 0;
  outline: none;
  font: 12px/1.55 var(--ds-font-family-code, "SF Mono", Consolas, monospace);
  tab-size: 2;
}

#${ROOT_ID} textarea:focus,
#${ROOT_ID} select:focus-visible,
#${ROOT_ID} button:focus-visible {
  outline: 2px solid var(--dre-accent);
  outline-offset: 2px;
}

#${ROOT_ID} .dre-output {
  display: grid;
  grid-template-rows: auto 1fr;
  min-height: 0;
  margin: 0 16px 16px;
  overflow: hidden;
  border: 1px solid var(--dre-border);
  border-radius: 0 0 12px 12px;
}

#${ROOT_ID} .dre-tabs { display: flex; align-items: center; gap: 2px; padding: 6px; overflow-x: auto; border-bottom: 1px solid var(--dre-border); }
#${ROOT_ID} .dre-tab { min-height: 30px; padding: 0 10px; border-radius: 8px; color: var(--dre-muted); font-size: 12px; }
#${ROOT_ID} .dre-tab:hover { color: #0f1115; background: var(--dre-surface-raised); }
#${ROOT_ID} .dre-tab[aria-selected="true"] { color: var(--dre-accent); background: var(--dre-accent-soft); font-weight: 650; }

#${ROOT_ID} .dre-pane { min-height: 0; overflow: auto; }
#${ROOT_ID} .dre-pane[hidden] { display: none; }
#${ROOT_ID} .dre-pane::-webkit-scrollbar,
#${ROOT_ID} textarea::-webkit-scrollbar { width: 10px; height: 10px; }
#${ROOT_ID} .dre-pane::-webkit-scrollbar-thumb,
#${ROOT_ID} textarea::-webkit-scrollbar-thumb { background: var(--dre-border); border: 3px solid transparent; border-radius: 10px; background-clip: padding-box; }

#${ROOT_ID} .dre-rendered { min-height: 100%; padding: 14px; background: var(--dre-surface-raised); }
#${ROOT_ID} .dre-rendered .shiki { min-width: max-content; margin: 0; padding: 14px; overflow: auto; border-radius: 9px; font: 12px/1.65 var(--ds-font-family-code, monospace); }
#${ROOT_ID} .dre-rendered .line { display: block; }

#${ROOT_ID} pre.dre-data {
  min-height: 100%;
  margin: 0;
  padding: 14px;
  white-space: pre-wrap;
  word-break: break-word;
  color: #0f1115;
  background: var(--dre-surface-raised);
  font: 11px/1.55 var(--ds-font-family-code, monospace);
}

#${ROOT_ID} .dre-launcher {
  display: none;
  min-width: 112px;
  min-height: 44px;
  padding: 0 14px;
  color: white;
  background: var(--dre-accent);
  border-radius: 11px;
  box-shadow: 0 8px 24px rgb(70 91 219 / 28%);
  font-weight: 650;
}

#${ROOT_ID}[data-collapsed="true"] > :not(.dre-launcher) { display: none; }
#${ROOT_ID}[data-collapsed="true"] .dre-launcher { display: block; }

@media (max-width: 720px) {
  #${ROOT_ID} { inset: 8px; width: auto; }
  #${ROOT_ID}[data-collapsed="true"] { inset: auto 8px 8px auto; }
  #${ROOT_ID} .dre-pipeline { padding-inline: 12px; }
  #${ROOT_ID} .dre-editor { padding-inline: 12px; }
  #${ROOT_ID} .dre-output { margin-inline: 12px; }
}
`

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

export function installPreview(ctx: ClientContext, integrationPassed: boolean): () => void {
  document.getElementById(ROOT_ID)?.remove()
  document.getElementById(STYLE_ID)?.remove()

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = styles
  document.head.append(style)

  const root = document.createElement('aside')
  root.id = ROOT_ID
  root.setAttribute('aria-label', '开发内容渲染实验台')
  root.dataset.collapsed = 'false'
  root.innerHTML = `
    <!--
      THESIS: Make the Shiki → Tokens → HTML mechanism directly inspectable without turning DSH into a dashboard.
      OWN-WORLD: Inherit DSH's light system UI; one bordered right-side tool surface; monospace only for code and data.
      STORY: Edit source, choose a language, inspect code, diagnostic, diff, and terminal outputs, and collapse the tool when finished.
      FIRST VIEWPORT: A 460px desktop tool window; below 720px, fill the viewport inside an 8px safe inset.
      FORM: local-extension/no-roll — scoped extension, so no concept seed was run.
      FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md.
    -->
    <header class="dre-header">
      <div class="dre-title">
        <strong>开发内容渲染实验台</strong>
        <span>code, diagnostics, diff, ANSI, and safe HTML</span>
      </div>
      <span class="dre-status">${integrationPassed ? '服务正常' : '检查失败'}</span>
      <button class="dre-icon-button" type="button" aria-label="收起预览" aria-expanded="true">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m8 10 4 4 4-4"/></svg>
      </button>
    </header>
    <div class="dre-pipeline" aria-label="渲染管线">
      <b>Normalize</b><i></i><b>Highlight</b><i></i><b>HTML</b>
    </div>
    <section class="dre-editor">
      <div class="dre-field-row">
        <label class="dre-field">
          <span>语言</span>
          <select data-role="language"></select>
        </label>
      </div>
      <textarea data-role="source" aria-label="示例代码" spellcheck="false">${escapeHtml(SAMPLE_CODE)}</textarea>
    </section>
    <section class="dre-output">
      <div class="dre-tabs" role="tablist" aria-label="输出类型">
        <button class="dre-tab" id="dre-tab-preview" type="button" role="tab" aria-controls="dre-pane-preview" aria-selected="true" tabindex="0" data-tab="preview">预览</button>
        <button class="dre-tab" id="dre-tab-frame" type="button" role="tab" aria-controls="dre-pane-frame" aria-selected="false" tabindex="-1" data-tab="frame">Frame</button>
        <button class="dre-tab" id="dre-tab-diff" type="button" role="tab" aria-controls="dre-pane-diff" aria-selected="false" tabindex="-1" data-tab="diff">Diff</button>
        <button class="dre-tab" id="dre-tab-ansi" type="button" role="tab" aria-controls="dre-pane-ansi" aria-selected="false" tabindex="-1" data-tab="ansi">ANSI</button>
        <button class="dre-tab" id="dre-tab-tokens" type="button" role="tab" aria-controls="dre-pane-tokens" aria-selected="false" tabindex="-1" data-tab="tokens">Tokens</button>
        <button class="dre-tab" id="dre-tab-html" type="button" role="tab" aria-controls="dre-pane-html" aria-selected="false" tabindex="-1" data-tab="html">HTML</button>
      </div>
      <div class="dre-pane dre-rendered" id="dre-pane-preview" data-pane="preview" role="tabpanel" aria-labelledby="dre-tab-preview"></div>
      <div class="dre-pane dre-rendered" id="dre-pane-frame" data-pane="frame" role="tabpanel" aria-labelledby="dre-tab-frame" hidden></div>
      <div class="dre-pane dre-rendered" id="dre-pane-diff" data-pane="diff" role="tabpanel" aria-labelledby="dre-tab-diff" hidden></div>
      <div class="dre-pane dre-rendered" id="dre-pane-ansi" data-pane="ansi" role="tabpanel" aria-labelledby="dre-tab-ansi" hidden></div>
      <pre class="dre-pane dre-data" id="dre-pane-tokens" data-pane="tokens" role="tabpanel" aria-labelledby="dre-tab-tokens" hidden></pre>
      <pre class="dre-pane dre-data" id="dre-pane-html" data-pane="html" role="tabpanel" aria-labelledby="dre-tab-html" hidden></pre>
    </section>
    <button class="dre-launcher" type="button">打开渲染预览</button>
  `
  document.body.append(root)

  const language = root.querySelector<HTMLSelectElement>('[data-role="language"]')
  const source = root.querySelector<HTMLTextAreaElement>('[data-role="source"]')
  const previewPane = root.querySelector<HTMLElement>('[data-pane="preview"]')
  const framePane = root.querySelector<HTMLElement>('[data-pane="frame"]')
  const diffPane = root.querySelector<HTMLElement>('[data-pane="diff"]')
  const ansiPane = root.querySelector<HTMLElement>('[data-pane="ansi"]')
  const tokensPane = root.querySelector<HTMLElement>('[data-pane="tokens"]')
  const htmlPane = root.querySelector<HTMLElement>('[data-pane="html"]')
  if (language === null || source === null || previewPane === null || framePane === null || diffPane === null || ansiPane === null || tokensPane === null || htmlPane === null) {
    throw new Error('Render preview failed to create its controls')
  }

  const options = [
    ...ctx.shiki.languages.map(value => ({ label: value, value })),
    { label: '纯文本（回退）', value: 'text' },
  ]
  language.innerHTML = options
    .map(option => `<option value="${escapeHtml(option.value)}">${escapeHtml(option.label)}</option>`)
    .join('')
  language.value = 'typescript'

  const render = () => {
    const request = { code: source.value, language: language.value }
    const highlighted = ctx.syntaxHighlighter.highlight(request)
    const rendered = ctx.codeRenderer.render(request)
    const diff = ctx.diffEngine.diff({
      kind: 'files',
      before: { path: 'sample.ts', content: SAMPLE_BEFORE, language: language.value },
      after: { path: 'sample.ts', content: source.value, language: language.value },
    })
    const renderedDiff = ctx.diffRenderer.render(diff)
    const sourceLines = source.value.split(/\r\n|\r|\n/)
    const foundLine = sourceLines.findIndex(line => line.length > 0)
    const diagnosticLine = foundLine < 0 ? 0 : foundLine
    const diagnosticLength = sourceLines[diagnosticLine]?.length ?? 0
    const renderedFrame = ctx.codeFrameRenderer.render({
      code: source.value,
      language: language.value,
      fileName: 'sample.ts',
      diagnostics: [{
        range: {
          start: { line: diagnosticLine, character: 0 },
          end: { line: diagnosticLine, character: Math.min(8, diagnosticLength) },
        },
        message: '示例诊断范围',
        severity: 'warning',
      }],
    })
    const renderedAnsi = ctx.ansiRenderer.render({
      text: `\u001b[1;32mPASS\u001b[0m render ${source.value.length} source units\n\u001b[36mINFO\u001b[0m ANSI colors preserved`,
    })
    previewPane.innerHTML = rendered.html
    framePane.innerHTML = renderedFrame.html
    diffPane.innerHTML = renderedDiff.html
    ansiPane.innerHTML = renderedAnsi.html
    tokensPane.textContent = JSON.stringify(highlighted, null, 2)
    htmlPane.textContent = rendered.html
  }

  const tabs = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-tab]'))
  const collapseButton = root.querySelector<HTMLButtonElement>('.dre-icon-button')
  const launcher = root.querySelector<HTMLButtonElement>('.dre-launcher')
  if (collapseButton === null || launcher === null) throw new Error('Render preview failed to create its buttons')

  const selectTab = (selected: string, moveFocus = false) => {
    for (const tab of root.querySelectorAll<HTMLElement>('[data-tab]')) {
      const active = tab.dataset.tab === selected
      tab.setAttribute('aria-selected', String(active))
      tab.tabIndex = active ? 0 : -1
      if (active && moveFocus) tab.focus()
    }
    for (const pane of root.querySelectorAll<HTMLElement>('[data-pane]')) {
      pane.hidden = pane.dataset.pane !== selected
    }
  }

  const onInput = () => render()
  const onClick = (event: Event) => {
    const target = event.target
    if (!(target instanceof Element)) return
    const tab = target.closest<HTMLElement>('[data-tab]')
    if (tab?.dataset.tab !== undefined) selectTab(tab.dataset.tab)
    if (target.closest('.dre-icon-button') !== null) {
      root.dataset.collapsed = 'true'
      collapseButton.setAttribute('aria-expanded', 'false')
      launcher.focus()
    }
    if (target.closest('.dre-launcher') !== null) {
      root.dataset.collapsed = 'false'
      collapseButton.setAttribute('aria-expanded', 'true')
      collapseButton.focus()
    }
  }

  const onKeydown = (event: KeyboardEvent) => {
    const target = event.target
    if (!(target instanceof HTMLElement) || target.dataset.tab === undefined) return
    const index = tabs.indexOf(target as HTMLButtonElement)
    if (index < 0) return
    const keyOffset = event.key === 'ArrowRight' ? 1 : event.key === 'ArrowLeft' ? -1 : 0
    let next = index
    if (keyOffset !== 0) next = (index + keyOffset + tabs.length) % tabs.length
    if (event.key === 'Home') next = 0
    if (event.key === 'End') next = tabs.length - 1
    if (next === index && !['Home', 'End'].includes(event.key)) return
    event.preventDefault()
    const selected = tabs[next]?.dataset.tab
    if (selected !== undefined) selectTab(selected, true)
  }

  source.addEventListener('input', onInput)
  language.addEventListener('change', onInput)
  root.addEventListener('click', onClick)
  root.addEventListener('keydown', onKeydown)
  render()

  return () => {
    source.removeEventListener('input', onInput)
    language.removeEventListener('change', onInput)
    root.removeEventListener('click', onClick)
    root.removeEventListener('keydown', onKeydown)
    root.remove()
    style.remove()
  }
}
