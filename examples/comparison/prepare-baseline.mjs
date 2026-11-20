import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../../", import.meta.url));
const baselineVersion = "0.2.0";
const target = path.join(root, ".tmp", "comparison-baseline");
await fs.mkdir(target, { recursive: true });
const metadata = await fetch(
  `https://registry.npmjs.org/@happydesigns%2fnuxt-variants/${baselineVersion}`,
);
if (!metadata.ok) throw new Error(`Baseline registry lookup failed: ${metadata.status}`);
const published = await metadata.json();
if (published.version !== baselineVersion) throw new Error("Unexpected baseline version");
const response = await fetch(published.dist.tarball);
if (!response.ok) throw new Error(`Baseline download failed: ${response.status}`);
const data = Buffer.from(await response.arrayBuffer());
const [algorithm, digest] = published.dist.integrity.split("-");
if (algorithm !== "sha512" || createHash(algorithm).update(data).digest("base64") !== digest)
  throw new Error("Baseline tarball integrity mismatch");
const archive = path.join(target, "release.tgz");
await fs.writeFile(archive, data);
const entries = execFileSync("tar", ["-tf", archive], { encoding: "utf8", windowsHide: true })
  .trim()
  .split(/\r?\n/);
const assets = entries.filter((entry) => entry.startsWith("package/dist/client/"));
if (
  !assets.includes("package/dist/client/index.html") ||
  assets.some((entry) => entry.split("/").includes(".."))
)
  throw new Error("Baseline inspector assets are missing or invalid");
execFileSync("tar", ["-xf", archive, "-C", target, "--strip-components=3", ...assets], {
  windowsHide: true,
});
await fs.writeFile(
  path.join(target, "baseline.json"),
  JSON.stringify(
    {
      version: published.version,
      integrity: published.dist.integrity,
      tarball: published.dist.tarball,
    },
    null,
    2,
  ),
);
console.log(`Verified released ${baselineVersion} inspector: ${target}`);
