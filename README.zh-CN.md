# DSH Render Engine

[English](./README.md) | 简体中文

一个面向 DeepSeek Harness Web 插件的轻量浏览器端渲染服务 monorepo。项目将 Shiki 分词、稳定的语法高亮 token，以及安全的 HTML 代码块渲染拆分为三个可以独立发布的 npm 包。

## 包结构

| 包 | Cordis 服务 | 职责 |
| --- | --- | --- |
| `@ch4acko3/dsh-shiki` | `ctx.shiki` | 管理一个共享的 Shiki 引擎和内置语言集合。 |
| `@ch4acko3/dsh-syntax-highlight` | `ctx.syntaxHighlighter` | 将源码转换为稳定、响应主题的 token；无法识别语言时回退为纯文本。 |
| `@ch4acko3/dsh-code-render` | `ctx.codeRenderer` | 将高亮 token 转换为经过转义的 HTML 代码块。 |

依赖方向保持单向：

```text
dsh-shiki <- dsh-syntax-highlight <- dsh-code-render
```

仓库根包和 `integration/consumer` 均为私有包。只有 `packages/` 下的三个包计划对外发布。

## 功能

- 多个 DSH Web 插件共享一个延迟初始化的 Shiki 引擎。
- 提供不依赖 Shiki 内部 token 结构的稳定数据模型。
- 在每一层服务中保留原始 LF、CRLF 和 CR 换行符。
- 使用 CSS 变量输出颜色，跟随 DSH 主题。
- 语言未提供或不受支持时自动回退为纯文本。
- 生成 HTML 时转义源码内容。
- 提供私有交互式预览，可在真实 DSH 浏览器运行时中查看代码、token 和渲染结果。

内置语言：Bash、C、C++、CSS、Go、HTML、Java、JavaScript、JSX、JSON、Markdown、Python、Rust、SQL、TSX、TypeScript 和 YAML。支持 `sh`、`js`、`md`、`py`、`rs`、`ts`、`yml`、`zsh` 等常见别名。

## 环境要求

- Node.js `^22.22.3 || >=24.11.1`
- pnpm `11.19.0`
- 在 DSH Web 中加载插件时需要 DeepSeek Harness `0.1.0-rc.8`

## 本地开发

```sh
pnpm install
pnpm check
```

`pnpm check` 会构建所有 workspace 包、执行 TypeScript 检查并运行单元测试。

## 使用服务

插件只需声明自己直接使用的服务，Cordis 会沿包依赖链加载其余服务。

```ts
export const inject = ['codeRenderer']

export function apply(ctx) {
  const result = ctx.codeRenderer.render({
    code: 'const answer: number = 42',
    language: 'ts',
  })

  console.log(result.language)    // "typescript"
  console.log(result.highlighted) // true
  console.log(result.html)        // 已转义、响应主题的 HTML
}
```

需要结构化数据时，可以直接使用更底层的服务：

```ts
const raw = ctx.shiki.tokenize({ code, language: 'ts' })
const highlighted = ctx.syntaxHighlighter.highlight({ code, language: 'ts' })
```

`ctx.shiki.tokenize()` 要求传入受支持的语言。`ctx.syntaxHighlighter.highlight()` 和 `ctx.codeRenderer.render()` 可以接收缺失或未知的语言，并返回未高亮的纯文本结果。

## 本地 DSH 预览

先构建 workspace，再将三个服务插件和私有预览 consumer 添加到 DSH Web profile，最后启动 DSH Web：

```sh
pnpm build

dsh plugin --profile web add "file:$PWD/packages/shiki"
dsh plugin --profile web add "file:$PWD/packages/syntax-highlight"
dsh plugin --profile web add "file:$PWD/packages/code-render"
dsh plugin --profile web add "file:$PWD/integration/consumer"
dsh web
```

打开 `dsh web` 输出的地址。预览浮层支持编辑源码、选择语言，并在渲染预览、结构化 token 和转义后的 HTML 之间切换。integration consumer 仅用于本地验证，不应发布。

## 仓库结构

```text
packages/
  shiki/              共享 Shiki 引擎
  syntax-highlight/   稳定的高亮 token 服务
  code-render/        安全 HTML 渲染器
integration/
  consumer/           私有 DSH 浏览器探针和预览
```

## 发布

GitHub Actions 中的 `Publish packages` 工作流会使用 npm Trusted Publishing（OIDC），按依赖顺序手动发布三个包。每次发布前先更新包版本并推送到 `main`，等待 CI 通过，然后运行该工作流并选择 `latest` 或 `next` npm 标签。

npm 只允许为已经存在的包配置 Trusted Publisher，因此首次 `0.1.0` 需要通过已登录的本地 npm CLI 发布一次。完成首次发布后，将三个包绑定到 `CH4ACKO3/dsh-render-engine` 仓库的 `release.yml` 工作流：

```sh
npm install --global npm@11.19.0
npm login
pnpm --dir packages/shiki publish --access public
pnpm --dir packages/syntax-highlight publish --access public
pnpm --dir packages/code-render publish --access public

npm trust github @ch4acko3/dsh-shiki --repo CH4ACKO3/dsh-render-engine --file release.yml --allow-publish --yes
npm trust github @ch4acko3/dsh-syntax-highlight --repo CH4ACKO3/dsh-render-engine --file release.yml --allow-publish --yes
npm trust github @ch4acko3/dsh-code-render --repo CH4ACKO3/dsh-render-engine --file release.yml --allow-publish --yes
```

Trusted Publishing 要求 npm 11.15 或更高版本，并要求 npm 账号启用双重验证。GitHub 中不保存长期 npm token。

## 许可证

[MIT](./LICENSE)
