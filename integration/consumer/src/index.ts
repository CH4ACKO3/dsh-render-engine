import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-commands'

const DEMO_CODE = `type RenderResult = {
  language: string
  highlighted: boolean
}

export function render(code: string): RenderResult {
  return {
    language: 'typescript',
    highlighted: code.length > 0,
  }
}
`

const DEMO_CODE_FRAME = JSON.stringify({
  code: `interface User {
  name: string
  age: number
}

const user: User = {
  name: 'Ada',
  age: 'thirty',
}
`,
  language: 'ts',
  fileName: 'src/user.ts',
  diagnostics: [{
    range: {
      start: { line: 7, character: 7 },
      end: { line: 7, character: 15 },
    },
    message: "Type 'string' is not assignable to type 'number'.",
    severity: 'error',
  }],
  contextLines: 2,
}, null, 2)

const DEMO_ANSI = `\u001b[1;36mDSH Render Engine\u001b[0m \u001b[2mvalidation\u001b[0m
\u001b[32m✓\u001b[0m 26 tests passed
\u001b[33m⚠\u001b[0m 1 optional dependency skipped
\u001b[31m✗\u001b[0m example deployment blocked`

const DEMO_PATCH = `diff --git a/src/greeting.ts b/src/greeting.ts
index 34ddf2a..64c809f 100644
--- a/src/greeting.ts
+++ b/src/greeting.ts
@@ -1,3 +1,5 @@
-export function greet(name: string) {
-  return \`Hello, \${name}.\`
+export function greet(name: string, excited = false) {
+  const message = \`Hello, \${name}\`
+
+  return excited ? \`\${message}!\` : \`\${message}.\`
 }
`

export const inject = ['commands'] as const

export function apply(ctx: Context): () => void {
  const dispose = [
    ctx.commands.register({
      name: 'codedemo',
      description: 'Show the DSH Code Render ChatView fixture',
      recordInput: false,
      handler: () => ({ kind: 'success', text: DEMO_CODE }),
    }),
    ctx.commands.register({
      name: 'framedemo',
      description: 'Show the DSH Code Frame Render ChatView fixture',
      recordInput: false,
      handler: () => ({ kind: 'success', text: DEMO_CODE_FRAME }),
    }),
    ctx.commands.register({
      name: 'ansidemo',
      description: 'Show the DSH ANSI Render ChatView fixture',
      recordInput: false,
      handler: () => ({ kind: 'success', text: DEMO_ANSI }),
    }),
    ctx.commands.register({
      name: 'renderdemo',
      description: 'Show the DSH Diff Render ChatView fixture',
      recordInput: false,
      handler: () => ({ kind: 'success', text: DEMO_PATCH }),
    }),
  ]
  return () => dispose.reverse().forEach(disposeCommand => disposeCommand())
}
