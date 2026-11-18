import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { existsSync } from "node:fs";

const root = fileURLToPath(new URL("../", import.meta.url));
const work = path.join(root, ".tmp", "packed-platform-" + Date.now());
// Keep the consumer outside this checkout so ancestor node_modules cannot
// accidentally satisfy undeclared dependencies or optional peers.
const consumer = path.join(tmpdir(), "nuxt-variants-consumer-" + Date.now());
await fs.mkdir(work, { recursive: true });
await fs.mkdir(consumer, { recursive: true });
const npm = [
  process.env.npm_execpath?.endsWith("npm-cli.js") ? process.env.npm_execpath : undefined,
  path.join(path.dirname(process.execPath), "node_modules/npm/bin/npm-cli.js"),
  path.resolve(path.dirname(process.execPath), "../lib/node_modules/npm/bin/npm-cli.js"),
].find((candidate) => candidate && existsSync(candidate));
if (!npm) throw new Error("Cannot locate npm-cli.js beside this Node installation.");
const run = (args, cwd) =>
  execFileSync(process.execPath, [npm, ...args], {
    cwd,
    encoding: "utf8",
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
const packed = JSON.parse(
  run(["pack", "--ignore-scripts", "--json", "--pack-destination", work], root),
)[0];
const tarball = path.join(work, packed.filename);
await fs.writeFile(
  path.join(consumer, "package.json"),
  JSON.stringify({ name: "variants-packed-consumer", private: true, type: "module" }),
);
run(
  [
    "install",
    tarball,
    "--ignore-scripts",
    "--legacy-peer-deps",
    "--omit=optional",
    "--no-audit",
    "--no-fund",
  ],
  consumer,
);
const coreProbe = `
import assert from 'node:assert/strict';
import { createVariantResolver } from '@happydesigns/nuxt-variants/core';
const resolver=createVariantResolver({header:{config:{label:'Header'}},article:{extends:['header'],config:{title:'Own'}}});
assert.deepEqual(resolver.resolve('article').config,{title:'Own',label:'Header'});
assert.equal(resolver.resolve('article',{header:{active:false}}).config.label,undefined);
for(const peer of ['comark-content','devframe','nuxt','vue']){
  assert.throws(()=>import.meta.resolve(peer),{code:'ERR_MODULE_NOT_FOUND'});
}
console.log('core import and resolution work without optional platform peers, Nuxt or Vue');
`;
await fs.writeFile(path.join(consumer, "core.mjs"), coreProbe);
const coreOutput = execFileSync(process.execPath, ["core.mjs"], {
  cwd: consumer,
  encoding: "utf8",
  windowsHide: true,
});
run(
  [
    "install",
    "comark-content@0.6.2",
    "devframe@1.3.5",
    "--ignore-scripts",
    "--legacy-peer-deps",
    "--no-audit",
    "--no-fund",
  ],
  consumer,
);
await fs.writeFile(
  path.join(consumer, "platform.mjs"),
  `
import assert from 'node:assert/strict';
import {createVariantResolver} from '@happydesigns/nuxt-variants/core';
import {variantContent,variantField} from '@happydesigns/nuxt-variants/content';
import {createVariantsDevframe,createVariantDevtoolsData} from '@happydesigns/nuxt-variants/devtools';
import {comarkContent,generateSourceTypes} from 'comark-content';
import {createBuild} from 'devframe/adapters/build';
import {existsSync,readFileSync} from 'node:fs';
import {join} from 'node:path';
const resolver=createVariantResolver({article:{config:{title:'Own'}}});
const instance=comarkContent('packed',{source:{schema:{type:'object',properties:{variant:variantField()}},keys:()=>['page.md'],getItem:()=> '---\\nvariant: article\\n---\\nBody',getItemRaw:()=>''},plugins:[variantContent({resolver})],logger:false,onError:'throw'});
try{
 const page=await instance.get('/page');
 assert.equal(instance.variantName(page),'article');
 assert.equal(instance.resolveVariant('article').config.title,'Own');
 assert.match(await generateSourceTypes(instance),/variant\\??: "article"/);
 const definition=createVariantsDevframe({snapshot:()=>createVariantDevtoolsData({configKey:'variants',registry:resolver.registry,sources:{}},{})});
 await createBuild(definition,{outDir:'offline'});
 assert.ok(existsSync('offline/__connection.json'));
 const html = readFileSync('offline/index.html', 'utf8');
 assert.ok(html.includes('id="__nuxt"'), 'offline index must mount the Nuxt app');
 const entry = html.match(/<script[^>]*src="([^"]+)"/)?.[1];
 assert.ok(entry?.startsWith('./_nuxt/'), 'inspector entry must load from its mount directory');
 assert.ok(existsSync(join('offline', entry)), 'inspector entry must exist in the offline copy');
 console.log('packed Content plugin, typegen, default client assets and offline DevFrame build passed');
}finally{await instance.dispose();}
`,
);
const platformOutput = execFileSync(process.execPath, ["platform.mjs"], {
  cwd: consumer,
  encoding: "utf8",
  windowsHide: true,
});
await fs.writeFile(
  path.join(consumer, "contracts.ts"),
  (await fs.readFile(path.join(root, "test/platform-types.test-d.ts"), "utf8")).replaceAll(
    "../src/",
    "@happydesigns/nuxt-variants/",
  ),
);
await fs.writeFile(
  path.join(consumer, "tsconfig.json"),
  JSON.stringify({
    compilerOptions: {
      target: "ES2022",
      module: "ESNext",
      moduleResolution: "Bundler",
      strict: true,
      noEmit: true,
      skipLibCheck: true,
      types: [],
    },
    files: ["contracts.ts"],
  }),
);
execFileSync(
  process.execPath,
  [path.join(root, "node_modules/typescript/bin/tsc"), "-p", path.join(consumer, "tsconfig.json")],
  { cwd: consumer, encoding: "utf8", windowsHide: true },
);
const report = {
  version: packed.version,
  tarball,
  consumer,
  bytes: packed.size,
  unpackedBytes: packed.unpackedSize,
  coreOutput: coreOutput.trim(),
  platformOutput: platformOutput.trim(),
  typecheck: "passed",
};
assert.equal(
  packed.version,
  JSON.parse(await fs.readFile(path.join(root, "package.json"), "utf8")).version,
);
await fs.writeFile(path.join(work, "results.json"), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
