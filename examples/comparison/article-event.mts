import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { comarkContent } from "comark-content";
import sqlite from "comark-content/database/sqlite-node";
import sqlQuery from "comark-content/plugins/sql-query";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { z } from "zod";
import { createVariantResolver, type VariantRegistryInput } from "@happydesigns/config-variants";
import { variantContent } from "@happydesigns/config-variants/comark-content";
import { createVariantSchemaResolver } from "@happydesigns/config-variants/schemas";

type Collection = "article" | "event";
const common = [
  "published",
  "header",
  "toc",
  "surround",
  "copyButton",
  "separator",
  "backButton",
] as const;
type Feature = (typeof common)[number] | "authors" | "category" | "dates" | "links" | "location";
const presets = {
  article: ["dates", "authors", "category", ...common],
  event: ["dates", "location", "category", "links", ...common],
} as const satisfies Record<Collection, readonly Feature[]>;

function presetSchema(features: readonly Feature[], traits: Record<string, z.ZodObject>) {
  const shape: z.ZodRawShape = Object.assign(
    {},
    ...features.map((key) => traits[key]?.shape ?? {}),
  );
  return z.object(shape);
}

// The UI schemas expect Date. Comark's markdown frontmatter supplies ISO strings.
function schemaInput(data: Record<string, unknown>) {
  const input = { ...data };
  for (const key of ["date", "dateEnd"]) {
    if (typeof input[key] === "string") input[key] = new Date(input[key]);
  }
  return input;
}
function render(title: string, data: Record<string, unknown>, features: readonly string[]) {
  const location = data.location as { name: string } | undefined;
  return renderToString(
    createSSRApp({
      render: () =>
        h("article", [
          h("h1", title),
          h("p", String(data.category ?? "")),
          features.includes("authors") && Array.isArray(data.authors)
            ? h("p", { class: "authors" }, data.authors.join(", "))
            : null,
          features.includes("location") && location ? h("address", location.name) : null,
          features.includes("toc") && data.toc ? h("nav", "Contents") : null,
        ]),
    }),
  );
}

const uiPath = process.argv[2];
if (!uiPath)
  throw new Error("Pass the path to the happydesigns UI checkout as the first argument.");
const ui = path.resolve(uiPath);
const registry: VariantRegistryInput = (
  await import(pathToFileURL(path.join(ui, "schemas/variants.ts")).href)
).variantRegistry;
const traits: Record<string, z.ZodObject> = (
  await import(pathToFileURL(path.join(ui, "schemas/traits.ts")).href)
).variantSchemas;
const resolver = createVariantResolver(registry);
const changed = {
  ...traits,
  category: z.object({ category: z.string().trim().min(1).optional() }),
};

for (const collection of ["article", "event"] as const) {
  const files = path.join(ui, "playground/content", collection + "s");
  const keys = (await readdir(files)).filter((name) => name.endsWith(".md")).sort();
  assert.ok(keys.length > 0);
  const source = {
    schema: {
      type: "object",
      properties: { category: { type: "string" }, published: { type: "boolean" } },
    } as const,
    keys: () => keys,
    getItem: (key: string) => readFile(path.join(files, key), "utf8"),
    getItemRaw: (key: string) => readFile(path.join(files, key), "utf8"),
  };
  const shared = { source, logger: false, onError: "throw" } as const;
  const graph = comarkContent("graph" + collection, {
    ...shared,
    plugins: [
      sqlQuery({ database: sqlite() }),
      variantContent({ resolver, defaultVariant: collection }),
    ],
  });
  const flat = comarkContent("preset" + collection, {
    ...shared,
    plugins: [sqlQuery({ database: sqlite() })],
  });
  try {
    const [graphRows, flatRows] = await Promise.all([graph.list(), flat.list()]);
    const published = (rows: typeof flatRows) =>
      rows
        .filter((row) => row.data.published !== false)
        .map((row) => row.path)
        .sort();
    assert.deepEqual(published(graphRows), published(flatRows));
    assert.equal(graphRows.length, keys.length);
    assert.equal(flatRows.length, keys.length);
    const category = flatRows.find((row) => typeof row.data.category === "string")?.data.category;
    assert.equal(typeof category, "string");
    const expectedPaths = flatRows
      .filter((row) => row.data.category === category && row.data.published === true)
      .map((row) => row.path)
      .sort();
    assert.ok(expectedPaths.length);
    for (const content of [flat, graph]) {
      const rows = await content
        .query()
        .where("data.published", "=", true)
        .where("data.category", "=", category)
        .order("path", "ASC")
        .all();
      assert.deepEqual(
        rows.map((row) => row.path),
        expectedPaths,
      );
    }
    const features = presets[collection];
    const stages = [traits, changed].map(
      (table) =>
        [
          createVariantSchemaResolver(resolver.registry, table)([collection]),
          presetSchema(features, table),
        ] as const,
    );
    let ssrPairs = 0;
    for (const key of keys) {
      const url = "/" + key.slice(0, -3);
      const [a, b] = await Promise.all([graph.get(url), flat.get(url)]);
      assert.ok(a && b);
      const identity = graph.variantName(a);
      assert.equal(identity, collection);
      const resolved = graph.resolveVariant(identity);
      assert.deepEqual(resolved.features, [...features, collection]);
      for (const [stage, [graphSchema, flatSchema]] of stages.entries()) {
        const validate = (data: Record<string, unknown>) => graphSchema["~standard"].validate(data);
        const original = schemaInput(a.data);
        const left = await validate(original);
        const right = flatSchema.safeParse(schemaInput(b.data));
        assert.ok(!left.issues && right.success, key);
        assert.deepEqual(left.value, right.data);
        const graphHtml: string = await render(
          a.data.title,
          left.value as Record<string, unknown>,
          resolved.features,
        );
        const flatHtml: string = await render(b.data.title, right.data, features);
        assert.equal(graphHtml, flatHtml);
        if (collection === "event")
          assert.equal(graphHtml.includes("<address>"), !!a.data.location);
        assert.equal(
          graphHtml.includes('class="authors"'),
          collection === "article" && Array.isArray(a.data.authors),
        );
        ssrPairs++;
        const blank = { ...original, category: "   " };
        assert.equal(!(await validate(blank)).issues, stage === 0);
        assert.equal(flatSchema.safeParse(blank).success, stage === 0);
        const padded = { ...original, category: "  Workshop  " };
        const trimmed = await validate(padded);
        assert.ok(!trimmed.issues);
        const expected = stage === 0 ? padded.category : "Workshop";
        assert.equal((trimmed.value as Record<string, unknown>).category, expected);
        assert.equal(flatSchema.parse(padded).category, expected);
        const invalid = { ...original, [collection === "article" ? "authors" : "location"]: 42 };
        assert.ok((await validate(invalid)).issues);
        assert.equal(flatSchema.safeParse(invalid).success, false);
      }
    }
    console.log(
      `${collection}: ${keys.length} documents, ${published(graphRows).length} published, ${ssrPairs} equal SSR pairs; schema and membership checks passed.`,
    );
  } finally {
    await Promise.all([graph.dispose(), flat.dispose()]);
  }
}
