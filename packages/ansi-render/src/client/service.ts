import { AnsiUp } from 'ansi_up'
import type { AnsiRendererService, AnsiRenderRequest, AnsiRenderResult } from './contract.js'

export class HtmlAnsiRenderer implements AnsiRendererService {
  render(request: AnsiRenderRequest): AnsiRenderResult {
    const converter = new AnsiUp()
    const content = converter.ansi_to_html(request.text)
    return {
      html: `<pre class="dsh-ansi-render" style="margin:0;padding:.75em 1em;overflow:auto;color:var(--dsh-ansi-foreground,var(--shiki-foreground));background-color:var(--dsh-ansi-background,var(--shiki-background));font:var(--dsw-font-markdown-code-block,13px/1.65 monospace)" tabindex="0"><code>${content}</code></pre>`,
      styled: content.includes('<span') || content.includes('<a '),
    }
  }
}
