import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { execFileSync, spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";
import { existsSync, rmSync } from "node:fs";
import { createServer } from "node:net";
import { setTimeout } from "node:timers/promises";

const root = fileURLToPath(new URL("../", import.meta.url));
// Keep both consumers outside this checkout so ancestor node_modules cannot
// accidentally satisfy undeclared dependencies or optional peers.
const work = await fs.mkdtemp(path.join(tmpdir(), "config-variants-check-"));
process.once("exit", () => rmSync(work, { recursive: true, force: true, maxRetries: 5 }));
const consumer = path.join(work, "core-consumer");
await fs.mkdir(consumer);
const { name: portableName } = JSON.parse(
  await fs.readFile(path.join(root, "package.json"), "utf8"),
);
const nuxtEntry = `${portableName}/nuxt`;
async function installedVersion(name) {
  const manifest = path.join(root, "node_modules", name, "package.json");
  return JSON.parse(await fs.readFile(manifest, "utf8")).version;
}
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
const pnpm = process.env.npm_execpath;
if (!pnpm || !path.basename(pnpm).startsWith("pnpm"))
  throw new Error("Run the packed checks with pnpm test:package.");
function runPnpm(args, cwd) {
  const isScript = /\.[cm]?js$/.test(pnpm);
  return execFileSync(isScript ? process.execPath : pnpm, isScript ? [pnpm, ...args] : args, {
    cwd,
    encoding: "utf8",
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
}
const { filename, name, version, size, files } = JSON.parse(
  runPnpm(["--config.ignore-scripts=true", "pack", "--json", "--pack-destination", work], root),
);
const tarball = path.resolve(work, filename);
assert.equal(name, portableName);
assert.ok(files.some((file) => file.path === "dist/client/index.html"));

await fs.writeFile(
  path.join(consumer, "package.json"),
  JSON.stringify({ name: "variants-packed-consumer", private: true, type: "module" }),
);
run(["install", tarball, "--ignore-scripts", "--no-audit", "--no-fund"], consumer);
const coreProbe = `
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
const guard = registerHooks({ resolve(specifier, context, nextResolve) {
  assert.ok(!['nuxt', 'vue', '@nuxt/', 'comark-content', 'devframe'].some(prefix => specifier.startsWith(prefix)), specifier);
  return nextResolve(specifier, context);
}});
const { createVariantResolver } = await import('${portableName}');
guard.deregister();
const resolver=createVariantResolver({header:{config:{label:'Header'}},article:{extends:['header'],config:{title:'Own'}}});
assert.deepEqual(resolver.resolve('article').config,{title:'Own',label:'Header'});
assert.equal(resolver.resolve('article',{header:{active:false}}).config.label,undefined);
for(const peer of ['comark-content','devframe','nuxt','vue','@happydesigns/nuxt-variants']){
  assert.throws(()=>import.meta.resolve(peer),{code:'ERR_MODULE_NOT_FOUND'});
}
await assert.rejects(import('${portableName}/comark-content'), {code:'ERR_MODULE_NOT_FOUND', message: /comark-content/});
console.log('the main entry loads without framework or adapter imports');
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
    `comark-content@${await installedVersion("comark-content")}`,
    `devframe@${await installedVersion("devframe")}`,
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
import {createVariantResolver} from '${portableName}';
import {variantContent,variantField} from '${portableName}/comark-content';
import {defineVariantInspector,createVariantSnapshot} from '${portableName}/devtools';
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
 const definition=defineVariantInspector({snapshot:()=>createVariantSnapshot({configKey:'variants',registry:resolver.registry,sources:{}},{})});
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
  await fs.readFile(path.join(root, "test/platform-types.test-d.ts"), "utf8"),
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
const nuxtConsumer = path.join(work, "nuxt-consumer");
const { compatibility } = JSON.parse(
  await fs.readFile(path.join(root, "dist/module.json"), "utf8"),
);
const minimumNuxt = /^>=(\d+\.\d+\.\d+)$/.exec(compatibility?.nuxt)?.[1];
assert.ok(minimumNuxt, "The packed consumer requires a concrete Nuxt compatibility floor.");
const file = (tarball) => `file:${tarball.replaceAll("\\", "/")}`;
await fs.mkdir(path.join(nuxtConsumer, "app"), { recursive: true });
await fs.writeFile(
  path.join(nuxtConsumer, "package.json"),
  JSON.stringify({
    name: "variants-nuxt-consumer",
    private: true,
    type: "module",
    dependencies: {
      [portableName]: file(tarball),
      nuxt: minimumNuxt,
      zod: await installedVersion("zod"),
    },
  }),
);
runPnpm(["install", "--ignore-scripts"], nuxtConsumer);
await fs.writeFile(
  path.join(nuxtConsumer, "nuxt.config.ts"),
  `export default defineNuxtConfig({ compatibilityDate: '2026-05-04', devtools: { enabled: false }, modules: ['${portableName}'], variants: { configKey: 'pageVariants', registry: { base: { config: { heading: 'Packed inheritance' } }, article: { extends: 'base' } } } })`,
);
await fs.writeFile(
  path.join(nuxtConsumer, "app/app.config.ts"),
  `export default defineAppConfig({ pageVariants: { base: { config: { heading: 'Packed override' } } } })`,
);
await fs.writeFile(
  path.join(nuxtConsumer, "app/app.vue"),
  `<script setup lang="ts">const { config } = useVariant('article'); const variants = useVariants()</script><template><p>{{ config.heading }} ({{ variants.length }})</p></template>`,
);
await fs.writeFile(
  path.join(nuxtConsumer, "contracts.ts"),
  `import type { PageMeta } from '#app';\nimport type { VariantConfigOf } from '#nuxt-variants';\nconst page: PageMeta = { variant: 'article' };\n// @ts-expect-error unknown registry entry\nconst invalid: PageMeta = { variant: 'missing' };\ndeclare const config: VariantConfigOf<'article'>;\nconst heading: string | undefined = config.heading;\nvoid [page, invalid, heading];\n`,
);
await fs.writeFile(
  path.join(nuxtConsumer, "tsconfig.json"),
  JSON.stringify({ extends: "./.nuxt/tsconfig.json" }),
);
await fs.writeFile(
  path.join(nuxtConsumer, "check.mjs"),
  `import assert from 'node:assert/strict';
import { VariantRegistryError } from '${nuxtEntry}';
import { VariantRegistryError as CoreError } from '${portableName}';
import { createVariantSchemaResolver } from '${portableName}/schemas';
import { z } from 'zod';
assert.throws(() => import.meta.resolve('@happydesigns/nuxt-variants'), {code: 'ERR_MODULE_NOT_FOUND'});
assert.equal(VariantRegistryError, CoreError);
const schemas = createVariantSchemaResolver({base: {}, article: {extends: 'base'}}, {base: z.object({heading: z.string()})});
assert.deepEqual(schemas(['article']).parse({heading:'Article'}), {heading:'Article'});
`,
);
function runNode(args) {
  return execFileSync(process.execPath, args, {
    cwd: nuxtConsumer,
    env: { ...process.env, NUXT_TELEMETRY_DISABLED: "1" },
    encoding: "utf8",
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  });
}
runNode(["check.mjs"]);
const nuxtBin = path.join(nuxtConsumer, "node_modules/nuxt/bin/nuxt.mjs");
runNode([nuxtBin, "prepare"]);
runNode([path.join(root, "node_modules/vue-tsc/bin/vue-tsc.js"), "--noEmit"]);
runNode([nuxtBin, "generate"]);
assert.match(
  await fs.readFile(path.join(nuxtConsumer, ".output/public/index.html"), "utf8"),
  /<p>Packed override \(2\)<\/p>/,
);

const reservation = createServer();
await new Promise((resolve, reject) => {
  reservation.once("error", reject);
  reservation.listen(0, "127.0.0.1", resolve);
});
const { port } = reservation.address();
await new Promise((resolve, reject) => reservation.close((err) => (err ? reject(err) : resolve())));
const dev = spawn(
  process.execPath,
  [nuxtBin, "dev", "--host", "127.0.0.1", "--port", String(port), "--no-fork"],
  {
    cwd: nuxtConsumer,
    env: { ...process.env, NUXT_TELEMETRY_DISABLED: "1" },
    windowsHide: true,
    stdio: ["ignore", "pipe", "pipe"],
  },
);
let devOutput = "";
dev.stdout.on("data", (chunk) => (devOutput += chunk));
dev.stderr.on("data", (chunk) => (devOutput += chunk));
const devExit = new Promise((resolve) => dev.once("close", resolve));
try {
  const origin = `http://127.0.0.1:${port}`;
  const inspector = `${origin}/__nuxt-variants/devtools`;
  let page;
  for (let attempt = 0; attempt < 100 && dev.exitCode === null; attempt++) {
    try {
      const data = await fetch(`${inspector}/data.json`, { signal: AbortSignal.timeout(2000) });
      if (data.ok) {
        page = await fetch(inspector);
        break;
      }
    } catch {}
    await setTimeout(250);
  }
  assert.equal(page?.status, 200, `packed Nuxt inspector failed\n${devOutput}`);
  const entry = (await page.text()).match(/<script[^>]*src="([^"]+)"/)?.[1];
  assert.ok(entry?.startsWith("/__nuxt-variants/devtools/_nuxt/"));
  assert.equal((await fetch(new URL(entry, origin))).status, 200);
} finally {
  dev.kill();
  await devExit;
}

let verifiedArchive;
if (process.env.VARIANTS_PACKAGE_OUTPUT) {
  const destination = path.resolve(root, process.env.VARIANTS_PACKAGE_OUTPUT);
  await fs.mkdir(destination, { recursive: true });
  verifiedArchive = path.join(destination, path.basename(tarball));
  await fs.copyFile(tarball, verifiedArchive);
}

const report = {
  name,
  version,
  ...(verifiedArchive && { tarball: verifiedArchive }),
  size,
  coreOutput: coreOutput.trim(),
  platformOutput: platformOutput.trim(),
  typecheck: "passed",
  nuxt: "strict installation, shared error identity, schema helper, generated types, prerender and inspector assets passed",
};
console.log(JSON.stringify(report, null, 2));
