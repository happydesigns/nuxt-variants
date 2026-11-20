import http from "node:http";
import fs from "node:fs/promises";
import { rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import vm from "node:vm";
import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import ts from "typescript";
import { comarkContent } from "comark-content";
import snapshot from "comark-content/sources/snapshot";
import { createDevServer } from "devframe/adapters/dev";
import { createBuild } from "devframe/adapters/build";
import { createVariantResolver, defineVariantGroups } from "@happydesigns/config-variants";
import { variantContent, variantField } from "@happydesigns/config-variants/comark-content";
import {
  createVariantsDevframe,
  createVariantDevtoolsData,
} from "@happydesigns/config-variants/devtools";
import { inspectorAssets as clientAssets } from "@happydesigns/config-variants/internal/inspector";

const root = fileURLToPath(new URL("../../", import.meta.url));
const req = createRequire(import.meta.resolve("@happydesigns/config-variants"));
const baselineAssets = path.join(root, ".tmp/comparison-baseline");
try {
  await fs.access(path.join(baselineAssets, "index.html"));
} catch {
  throw new Error("Released comparison UI is missing. Run pnpm compare:prepare first.");
}
const port = Number(process.env.VARIANTS_COMPARE_PORT ?? 4192);
const framePort = port + 1;
const registry = {
  header: { config: { header: { title: "Gemeinsamer Content-Rahmen" } } },
  toc: {
    config: { toc: { title: "Auf dieser Seite", items: ["Einführung", "Nächster Schritt"] } },
  },
  authors: { config: { authors: ["Redaktion"] } },
  progress: { config: { progress: { label: "Lernfortschritt", value: 40 } } },
  article: { extends: ["header", "toc", "authors"], config: { label: "Artikel" } },
  event: { extends: ["header", "toc"], config: { label: "Event" } },
  snippet: { extends: ["header"], config: { label: "Kurzbeitrag" } },
  course: { extends: ["header", "toc", "progress"], config: { label: "Kurs" } },
};
const documents = {
  article: {
    title: "Ein Inhalt, zwei Integrationen",
    body: "Beide Wege liefern denselben Inhalt und dieselben Layout-Fähigkeiten. Die Preview bindet Content über eine kleine Extension an und benötigt dafür keinen Nuxt-Host.",
  },
  event: {
    title: "Offene Sprechstunde",
    body: "Im Inspector steht beim Feld label, dass die Variante event den Wert aus der App-Konfiguration übernimmt.",
  },
  snippet: {
    title: "Weniger reicht oft aus",
    body: "Dieser Kurzbeitrag nutzt nur den Header. Für einzelne statische Layouts bleiben einfache typisierte Presets die günstigere Lösung.",
  },
  course: {
    title: "Ein Kurs mit eigenem Verhalten",
    body: "Ein Kurs ergänzt Lernfortschritt. Die Anwendung besitzt diese Fachlogik; die Content-Extension kennt lediglich die ausgewählte Variante.",
  },
};
const resolver = createVariantResolver(registry);
const groups = defineVariantGroups(resolver, {
  Editorial: ["article", "event"],
  "Content presets": ["article", "event", "snippet", "course"],
  Features: ["header", "toc", "authors", "progress"],
});
let state = { document: "article", toc: true, header: true };
const overrides = (current = state) => ({
  toc: { active: current.toc },
  header: { active: current.header },
  event: { config: { label: "Veranstaltung" } },
});
const sourceFiles = Object.fromEntries(
  Object.entries(documents).map(([name, doc]) => [
    name + ".md",
    `---\ntitle: ${doc.title}\nvariant: ${name}\n---\n${doc.body}`,
  ]),
);
async function createComparisonSource(name, keys, allowedVariants) {
  const plugins = [variantContent({ resolver, ...(allowedVariants && { allowedVariants }) })];
  const content = comarkContent(name, {
    source: {
      schema: { type: "object", properties: { variant: variantField(allowedVariants) } },
      keys: () => keys,
      getItem: (key) => sourceFiles[key],
      getItemRaw: (key) => sourceFiles[key],
    },
    plugins,
    onError: "throw",
    logger: false,
  });
  try {
    // The comparison resolves documents from the parsed JSON snapshot.
    return comarkContent(`${name}runtime`, {
      source: snapshot(JSON.parse(JSON.stringify(await content.snapshot()))),
      plugins,
      onError: "throw",
      logger: false,
    });
  } finally {
    await content.dispose();
  }
}
const editorial = new Set(groups.Editorial);
const editorialKeys = groups.Editorial.map((name) => `${name}.md`);
const [editorialSource, otherSource] = await Promise.all([
  createComparisonSource("editorial", editorialKeys, groups.Editorial),
  createComparisonSource(
    "comparison",
    Object.keys(sourceFiles).filter((key) => !editorialKeys.includes(key)),
  ),
]);

// Read the actual released helper implementation from this checkout's tag.
// It never writes or checks out baseline source, and is demo tooling only.
const baselineCache = new Map();
function loadBaseline(file) {
  if (baselineCache.has(file)) return baselineCache.get(file).exports;
  const mod = { exports: {} };
  baselineCache.set(file, mod);
  const source = execFileSync("git", ["show", `v0.2.0:${file}`], {
    cwd: root,
    encoding: "utf8",
    windowsHide: true,
  });
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText;
  const local = (id) =>
    id.startsWith(".")
      ? loadBaseline(path.posix.join(path.posix.dirname(file), id + ".ts"))
      : req(id);
  vm.runInThisContext(`(function(require,module,exports){${code}\n})`, {
    filename: "baseline:" + file,
  })(local, mod, mod.exports);
  return mod.exports;
}
const baseline = loadBaseline("src/runtime/utils/variants.ts");
function resolveBaseline(name, runtime) {
  const features = [...baseline.resolveVariantFeatures(name, registry, runtime)];
  // This is the same compiled-lineage path used by v0.2.0's useVariant.
  return {
    config: baseline.resolveVariantConfigFromLineage(features, registry, runtime),
    features,
  };
}
function canonical(value) {
  return JSON.stringify(value, (_key, item) =>
    item && typeof item === "object" && !Array.isArray(item)
      ? Object.fromEntries(Object.entries(item).sort(([a], [b]) => a.localeCompare(b)))
      : item,
  );
}
async function comparison() {
  const current = state;
  const restored = editorial.has(current.document) ? editorialSource : otherSource;
  const file = await restored.get("/" + current.document);
  const name = restored.variantName(file);
  const legacy = resolveBaseline(name, overrides(current));
  const preview = restored.resolveVariant(name, overrides(current));
  return {
    state: current,
    document: { ...documents[current.document], data: file.data, meta: file.meta.variant },
    legacy,
    preview,
    equivalent:
      canonical(legacy.config) === canonical(preview.config) &&
      canonical(legacy.features) === canonical(preview.features),
    inspector: `http://127.0.0.1:${framePort}/__nuxt-variants/devtools/?transport=devframe`,
  };
}
const metadata = { configKey: "variants", registry, sources: {}, groups };
const frame = createVariantsDevframe({
  clientAssets,
  snapshot: () => createVariantDevtoolsData(metadata, overrides()),
});
const offlineDir = await fs.mkdtemp(path.join(tmpdir(), "config-variants-comparison-"));
process.once("exit", () => rmSync(offlineDir, { recursive: true, force: true, maxRetries: 5 }));
await createBuild(frame, { outDir: offlineDir });
const frameServer = await createDevServer(frame, {
  host: "127.0.0.1",
  port: framePort,
  openBrowser: false,
  auth: false,
  mcp: false,
});
const mime = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
};
async function staticFile(response, dir, relative, legacy = false) {
  const target = path.resolve(dir, relative || "index.html");
  if (!target.startsWith(path.resolve(dir) + path.sep)) {
    response.writeHead(400).end();
    return;
  }
  try {
    let data = await fs.readFile(target);
    if (legacy && path.basename(target) === "index.html")
      data = Buffer.from(
        data.toString("utf8").replaceAll("/__nuxt-variants/devtools/", "/legacy/"),
      );
    response
      .writeHead(200, {
        "content-type": mime[path.extname(target)] ?? "application/octet-stream",
        "cache-control": "no-store",
      })
      .end(data);
  } catch {
    response.writeHead(404).end("Not found");
  }
}
const server = http.createServer(async (request, response) => {
  try {
    const expectedHost = `127.0.0.1:${port}`;
    if (request.headers.host !== expectedHost) {
      response.writeHead(403).end();
      return;
    }
    const url = new URL(request.url, `http://${expectedHost}`);
    response.setHeader("cache-control", "no-store");
    if (url.pathname === "/api/state") {
      if (request.method === "POST") {
        if (request.headers.origin && request.headers.origin !== `http://${expectedHost}`) {
          response.writeHead(403).end();
          return;
        }
        let body = "";
        for await (const chunk of request) {
          body += chunk;
          if (body.length > 4096) throw new Error("Body too large");
        }
        const next = JSON.parse(body);
        if (
          !Object.hasOwn(documents, next.document) ||
          typeof next.toc !== "boolean" ||
          typeof next.header !== "boolean"
        ) {
          response.writeHead(400).end();
          return;
        }
        state = { document: next.document, toc: next.toc, header: next.header };
      } else if (request.method !== "GET") {
        response.writeHead(405).end();
        return;
      }
      response.setHeader("content-type", "application/json");
      response.end(JSON.stringify(await comparison()));
      return;
    }
    if (url.pathname === "/legacy/data.json") {
      const data = createVariantDevtoolsData(metadata, overrides());
      for (const entry of data.variants) {
        entry.resolvedConfig = baseline.resolveVariantConfig(entry.name, registry, overrides());
        entry.activeFeatures = [
          ...baseline.resolveVariantFeatures(entry.name, registry, overrides()),
        ];
      }
      response.setHeader("content-type", "application/json");
      response.end(JSON.stringify(data));
      return;
    }
    if (url.pathname.startsWith("/legacy/")) {
      await staticFile(response, baselineAssets, decodeURIComponent(url.pathname.slice(8)), true);
      return;
    }
    if (url.pathname.startsWith("/offline/")) {
      await staticFile(response, offlineDir, decodeURIComponent(url.pathname.slice(9)));
      return;
    }
    if (url.pathname === "/") {
      response.setHeader("content-type", "text/html; charset=utf-8");
      response.end(await fs.readFile(new URL("./index.html", import.meta.url)));
      return;
    }
    response.writeHead(404).end();
  } catch (error) {
    console.error(error);
    if (!response.headersSent) response.writeHead(500);
    response.end("Comparison request failed");
  }
});
await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(port, "127.0.0.1", resolve);
});
console.log(`Comparison: http://127.0.0.1:${port}/`);
console.log(`DevFrame: ${frameServer.origin}/__nuxt-variants/devtools/?transport=devframe`);
console.log(`Offline: http://127.0.0.1:${port}/offline/?transport=devframe`);
async function close() {
  await frameServer.close();
  server.close();
  await Promise.all([editorialSource.dispose(), otherSource.dispose()]);
}
process.once("SIGINT", () => {
  void close().then(() => process.exit());
});
process.once("SIGTERM", () => {
  void close().then(() => process.exit());
});
