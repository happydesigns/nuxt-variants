import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { createVariantResolver } from "@happydesigns/composable-variants";
import { variantContent, variantField } from "@happydesigns/composable-variants/comark-content";

if (!process.argv[2]) throw new Error("Pass the path to an installed Course checkout.");
const course = resolve(process.argv[2]);
const baselineSnapshot = process.argv[3];
const requireBuildIdentity = process.argv[4] === "--require-build-identity";
if (requireBuildIdentity && !baselineSnapshot)
  throw new Error("Pass the baseline snapshot before --require-build-identity.");
const layer = join(course, "packages", "nuxt");
const sourceDir = join(layer, "preview", "content");
const fromCourse = createRequire(join(course, "package.json"));
const fromLayer = createRequire(join(layer, "package.json"));
const { tsImport } = fromCourse("tsx/esm/api");
const loadCourse = (file) => tsImport(pathToFileURL(join(layer, file)).href, import.meta.url);
const { courseVariantRegistry } = await loadCourse("schemas/variants.ts");
const { createPreviewContent } = await loadCourse("preview/content.ts");
const { comarkContent, generateSourceTypes } = fromLayer("comark-content");
const { comarkContent: runtime } = fromLayer("comark-content/runtime");
const { default: fs } = fromLayer("comark-content/sources/fs");
const { default: snapshot } = fromLayer("comark-content/sources/snapshot");
const resolver = createVariantResolver(courseVariantRegistry);
const baseline = createPreviewContent(sourceDir);
const parsed = comarkContent("coursePilot", {
  source: fs(sourceDir, { schema: { type: "object", properties: { variant: variantField() } } }),
  markdown: baseline.options.markdown,
  plugins: [variantContent({ resolver, defaultVariant: "course" })],
  onError: "throw",
});
let restored;
let previousBuild;
let currentBuild;
try {
  await baseline.init({ partial: false, ignoreCache: true });
  await parsed.init({ partial: false, ignoreCache: true });
  const types = await generateSourceTypes(parsed);
  const names = resolver.names.map((name) => JSON.stringify(name)).join(" | ");
  assert.ok(types.includes("variant?: " + names));
  assert.ok(types.includes("'data.variant'?: " + names));
  restored = runtime("courseRestored", {
    source: snapshot(JSON.parse(JSON.stringify(await parsed.snapshot()))),
    plugins: [variantContent({ resolver })],
    onError: "throw",
  });
  const paths = async (content) => (await content.list()).map((entry) => entry.path).sort();
  const expected = await paths(baseline);
  assert.ok(expected.length > 0);
  assert.deepEqual(await paths(restored), expected);
  if (baselineSnapshot) {
    // Compare two Nitro builds. Node and Nitro can tokenize Shiki spans differently.
    const openBuild = async (name, file) =>
      runtime(name, {
        source: snapshot(JSON.parse(await readFile(file, "utf8"))),
        onError: "throw",
      });
    previousBuild = await openBuild("previousCourse", baselineSnapshot);
    currentBuild = await openBuild(
      "currentCourse",
      join(course, "playground/.output/public/api/course-preview/snapshot.json"),
    );
    assert.deepEqual(await paths(previousBuild), expected);
    assert.deepEqual(await paths(currentBuild), expected);
  }
  for (const path of expected) {
    const before = await baseline.get(path);
    const after = await restored.get(path);
    assert.deepEqual(after.nodes, JSON.parse(JSON.stringify(before.nodes)), path);
    assert.deepEqual(after.data, JSON.parse(JSON.stringify(before.data)), path);
    if (previousBuild) {
      const previous = await previousBuild.get(path);
      const current = await currentBuild.get(path);
      assert.deepEqual(current.nodes, previous.nodes, path);
      assert.deepEqual(current.data, previous.data, path);
      if (requireBuildIdentity) assert.deepEqual(current.meta.variant, { name: "course" }, path);
    }
    assert.deepEqual(after.meta.variant, { name: "course" }, path);
    assert.equal(restored.variantName(after), "course");
  }
  assert.deepEqual(
    [...restored.resolveVariant("course").features].sort(),
    [...resolver.names].sort(),
  );
  const override = {
    courseProgress: { config: { courseProgress: { storagePrefix: "course-pilot" } } },
  };
  assert.equal(
    restored.resolveVariant("course", override).config.courseProgress.storagePrefix,
    "course-pilot",
  );
  console.log(
    `Verified ${expected.length} Course documents and ${resolver.names.length} variant names on Comark Content ${fromLayer("comark-content/package.json").version}.`,
  );
} finally {
  await Promise.all([
    baseline.dispose(),
    parsed.dispose(),
    restored?.dispose(),
    previousBuild?.dispose(),
    currentBuild?.dispose(),
  ]);
}
