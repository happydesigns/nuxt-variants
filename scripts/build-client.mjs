import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const clientRoot = resolve(root, "client");
const source = resolve(clientRoot, ".output/public");
const target = resolve(root, "dist/client");

const nuxtBin = resolve(root, "node_modules/nuxt/bin/nuxt.mjs");
const build = spawnSync(process.execPath, [nuxtBin, "generate", clientRoot], {
  cwd: root,
  stdio: "inherit",
});

if (build.status !== 0) {
  throw new Error("Nuxt Variants DevTools client build failed.");
}

if (!existsSync(source)) {
  throw new Error(`Built client output directory not found: ${source}`);
}

rmSync(target, { recursive: true, force: true });
cpSync(source, target, {
  recursive: true,
});
