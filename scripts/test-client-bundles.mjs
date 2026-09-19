import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../', import.meta.url));
const {JSDOM}=createRequire(join(root,'packages/markdown-render/package.json'))('jsdom');
const {Context}=createRequire(join(process.argv[2] ?? root,'probe.cjs'))('@deepseek-ai/cordis');
const dom=new JSDOM('<!doctype html><html><body></body></html>',{runScripts:'outside-only'});
const modules=new Map();
dom.window.__ModuleLoader__={load({id,factory}){modules.set(id,factory(()=>{throw new Error('Unexpected runtime import')}));}};
for(const dir of readdirSync(join(root,'packages'))){const p=JSON.parse(readFileSync(join(root,'packages',dir,'package.json')));assert(!p.dsh.client.inject.includes('@deepseek-ai/dsh-client-runtime'));dom.window.eval(readFileSync(join(root,'packages',dir,'lib/client.js'),'utf8'));}
const ctx=new Context();
const pending=[...modules];
while(pending.length){const i=pending.findIndex(([,m])=>(m.inject ?? []).every(k=>ctx.get(k)));assert(i>=0,'Unresolved renderer service dependency');const [name,m]=pending.splice(i,1)[0];m.apply(ctx);console.log('loaded',name);}
assert.equal(modules.size,12);
const md=await ctx.markdownRenderer.render({markdown:'# Hello\n\n```ts\nconst n = 1\n```\n\n<script>alert(1)</script>'});
assert(md.html.includes('Hello'));assert(md.html.includes('--shiki-'));assert(!md.html.includes('<script>'));
const table=ctx.tableRenderer.render({rows:[{value:'<script>bad</script>'}]});assert.equal(table.rowCount,1);assert(!table.html.includes('<script>'));
dom.window.close();console.log('PASS: 12 browser bundles register using upstream Cordis without legacy runtime; Markdown/code/table render.');


