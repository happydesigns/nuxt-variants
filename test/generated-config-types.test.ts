import { join } from "node:path";
import { tmpdir } from "node:os";
import ts from "typescript";
import { describe, expect, it, vi } from "vitest";
import type { Nuxt } from "nuxt/schema";
import module, { type ModuleOptions } from "../src/module";

const template = vi.hoisted(() => ({ getContents: undefined as (() => string) | undefined }));

vi.mock("@nuxt/kit", () => ({
  defineNuxtModule: (definition: unknown) => definition,
  createResolver: () => ({ resolve: (...parts: string[]) => join(...parts) }),
  addTypeTemplate: (value: { getContents: () => string }) => {
    template.getContents = value.getContents;
  },
  addTemplate: vi.fn(),
  addImportsDir: vi.fn(),
  addServerHandler: vi.fn(),
}));
vi.mock("@nuxt/devtools-kit", () => ({ addCustomTab: vi.fn() }));
vi.mock("node:fs", async (importOriginal) => ({
  ...(await importOriginal<typeof import("node:fs")>()),
  mkdirSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

function checkConsumer(
  registry: NonNullable<ModuleOptions["registry"]>,
  appConfigType: string,
  consumer: string,
  exactOptionalPropertyTypes: boolean,
  overrides = "",
): string[] {
  const definition = module as unknown as {
    setup: (options: ModuleOptions, nuxt: Nuxt) => void;
  };
  definition.setup({ registry }, {
    options: {
      appConfig: {},
      buildDir: join(tmpdir(), "nuxt-variants-generated-types"),
      alias: {},
      dev: false,
      _layers: [],
      runtimeConfig: {},
      app: { baseURL: "/" },
    },
    hook: vi.fn(),
  } as unknown as Nuxt);

  const directory = join(tmpdir(), "nuxt-variants-consumer");
  const virtualFiles = new Map(
    [
      [
        join(directory, "generated.ts"),
        template.getContents!().replace(
          "export interface CustomVariantOverrides {}",
          `export interface CustomVariantOverrides { ${overrides} }`,
        ),
      ],
      [
        join(directory, "schema.d.ts"),
        `declare module 'nuxt/schema' { export interface AppConfig { variants: ${appConfigType} } }
declare module 'vue-router' { interface RouteMeta {} }`,
      ],
      [
        join(directory, "consumer.ts"),
        `import type { VariantConfigOf } from './generated';
type Config = VariantConfigOf<'target'>;
declare const consumer: Config;
${consumer}`,
      ],
    ].map(([file, contents]) => [ts.sys.resolvePath(file!), contents!]),
  );
  const options: ts.CompilerOptions = {
    strict: true,
    noEmit: true,
    skipLibCheck: false,
    exactOptionalPropertyTypes,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    types: [],
  };
  const host = ts.createCompilerHost(options);
  const readFile = host.readFile.bind(host);
  const fileExists = host.fileExists.bind(host);
  const getSourceFile = host.getSourceFile.bind(host);
  host.readFile = (file) => virtualFiles.get(ts.sys.resolvePath(file)) ?? readFile(file);
  host.fileExists = (file) => virtualFiles.has(ts.sys.resolvePath(file)) || fileExists(file);
  host.directoryExists = (file) =>
    ts.sys.resolvePath(file) === ts.sys.resolvePath(directory) || ts.sys.directoryExists(file);
  host.getSourceFile = (file, languageVersion, onError, shouldCreateNewSourceFile) => {
    const source = virtualFiles.get(ts.sys.resolvePath(file));
    return source === undefined
      ? getSourceFile(file, languageVersion, onError, shouldCreateNewSourceFile)
      : ts.createSourceFile(file, source, languageVersion);
  };
  const program = ts.createProgram([...virtualFiles.keys()], options, host);
  return ts
    .getPreEmitDiagnostics(program)
    .map((diagnostic) => ts.flattenDiagnosticMessageText(diagnostic.messageText, " "));
}

describe.each([false, true])("generated config contracts (exact optional: %s)", (exact) => {
  it("preserves required own fields while inherited fields can disappear", () => {
    expect(
      checkConsumer(
        {
          parent: { config: { value: { inherited: "parent" } } },
          target: { extends: ["parent"], config: { value: { title: "own" } } },
        },
        "{}",
        `if (consumer.value) {
  consumer.value.title.toUpperCase();
  consumer.value.inherited?.toUpperCase();
  // @ts-expect-error A parent can be disabled independently.
  consumer.value.inherited.toUpperCase();
}
const disabled: Config = {};
const active: Config = { value: { title: 'own' } };
// @ts-expect-error An existing own object must retain its title.
const invalid: Config = { value: {} };`,
        exact,
      ),
    ).toEqual([]);
  });

  it("applies own app config precedence and replaces arrays", () => {
    expect(
      checkConsumer(
        { target: { config: { value: { title: 1, keep: true }, list: [1] } } },
        "{ target: { config: { value: { title: string }; list: { label: string }[] } } }",
        `if (consumer.value) { consumer.value.title.toUpperCase(); consumer.value.keep.valueOf(); }
for (const item of consumer.list ?? []) item.label.toUpperCase();
const valid: Config = { value: { title: 'app', keep: true }, list: [{ label: 'app' }] };
// @ts-expect-error Replaced scalar type must be rejected.
const invalid: Config = { value: { title: 1, keep: true } };
// @ts-expect-error Arrays replace their former element contract.
const invalidArray: Config = { list: [1] };`,
        exact,
      ),
    ).toEqual([]);
  });

  it("accepts conflicting parent values across dynamic activity states", () => {
    expect(
      checkConsumer(
        {
          base: { config: { value: { title: 1 } } },
          later: { config: { value: { title: "later" } } },
          target: { extends: ["base", "later"], config: { value: { own: true } } },
        },
        "{}",
        `const states: Config[] = [{}, {value: {own: true}}, {value: {title: 1, own: true}}, {value: {title: 'later', own: true}}];
if (consumer.value) {
  consumer.value.own.valueOf();
  const title: string | number | undefined = consumer.value.title;
}
// @ts-expect-error A boolean title is unrelated to either parent.
const invalid: Config = {value: {title: false, own: true}};`,
        exact,
      ),
    ).toEqual([]);
  });

  it("keeps complete manual replacements and inherited refinements", () => {
    expect(
      checkConsumer(
        {
          parent: { config: { value: { align: "left", hidden: 1 } } },
          target: { extends: ["parent"], config: { value: { title: "own", align: "left" } } },
        },
        "{}",
        `if (consumer.value) {
  consumer.value.title.toUpperCase();
  const align: 'left' | 'right' = consumer.value.align;
  // @ts-expect-error The complete replacement hides omitted fields.
  consumer.value.hidden;
}
// @ts-expect-error Parent refinements also constrain descendants.
const invalid: Config = {value: {title: 'own', align: 'center'}};`,
        exact,
        'parent: {value: {align: "left" | "right"}}',
      ),
    ).toEqual([]);
  });
});
