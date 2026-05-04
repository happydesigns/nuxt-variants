import { cpSync, existsSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "client");
const target = resolve(root, "dist/client");

if (!existsSync(source)) {
  throw new Error(`Client source directory not found: ${source}`);
}

rmSync(target, { recursive: true, force: true });
cpSync(source, target, {
  recursive: true,
  filter: (path) => !path.includes("node_modules"),
});
