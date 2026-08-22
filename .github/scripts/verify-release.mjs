import fs from 'node:fs'

const tag = process.argv[2]
const match = /^(dsh-[a-z-]+)@((?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)(?:-[0-9A-Za-z]+(?:[.-][0-9A-Za-z]+)*)?)$/.exec(tag ?? '')

if (match === null) {
  throw new Error(`Release tag must look like dsh-code-render@1.2.3, received: ${tag ?? '<missing>'}`)
}

const [, packageSlug, version] = match
const packageDirectories = {
  'dsh-shiki': 'packages/shiki',
  'dsh-ansi-render': 'packages/ansi-render',
  'dsh-diff-engine': 'packages/diff-engine',
  'dsh-syntax-highlight': 'packages/syntax-highlight',
  'dsh-code-render': 'packages/code-render',
  'dsh-markdown-render': 'packages/markdown-render',
  'dsh-mermaid-render': 'packages/mermaid-render',
  'dsh-math-render': 'packages/math-render',
  'dsh-structured-render': 'packages/structured-render',
  'dsh-table-render': 'packages/table-render',
  'dsh-code-frame-render': 'packages/code-frame-render',
  'dsh-diff-render': 'packages/diff-render',
}

const packageDirectory = packageDirectories[packageSlug]
if (packageDirectory === undefined) throw new Error(`Unknown release package: ${packageSlug}`)

const manifest = JSON.parse(fs.readFileSync(`${packageDirectory}/package.json`, 'utf8'))
if (manifest.name !== `@ch4acko3/${packageSlug}`) {
  throw new Error(`Release package mismatch: ${packageSlug} resolves to ${manifest.name}`)
}
if (manifest.version !== version) {
  throw new Error(`Release tag ${tag} does not match ${manifest.name} version ${manifest.version}`)
}

const distTag = version.includes('-') ? 'next' : 'latest'

process.stdout.write([
  `PACKAGE_SLUG=${packageSlug}`,
  `PACKAGE_DIR=${packageDirectory}`,
  `PACKAGE_NAME=${manifest.name}`,
  `PACKAGE_VERSION=${version}`,
  `DIST_TAG=${distTag}`,
  '',
].join('\n'))
