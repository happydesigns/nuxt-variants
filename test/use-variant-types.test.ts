import { describe, it, expectTypeOf } from "vitest";
import type { ModuleOptions } from "../src/module";

type UnionToIntersection<U> = (U extends unknown ? (x: U) => void : never) extends (
  x: infer I,
) => void
  ? I
  : never;

type AnyVariantConfigFor<Registry> = keyof Registry extends never
  ? Record<string, unknown>
  : Partial<UnionToIntersection<Registry[keyof Registry]>>;

describe("AnyVariantConfig (string / unknown key fallback type)", () => {
  type MockRegistry = {
    article: { title: string; hasDate: boolean };
    hero: { fullscreen: boolean; columns: number };
  };

  type Config = AnyVariantConfigFor<MockRegistry>;

  it("exposes keys from every registry entry config", () => {
    expectTypeOf<Config>().toHaveProperty("title");
    expectTypeOf<Config>().toHaveProperty("hasDate");
    expectTypeOf<Config>().toHaveProperty("fullscreen");
    expectTypeOf<Config>().toHaveProperty("columns");
  });

  it("all keys are optional (Partial<...>)", () => {
    expectTypeOf<Config["title"]>().toEqualTypeOf<string | undefined>();
    expectTypeOf<Config["hasDate"]>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<Config["fullscreen"]>().toEqualTypeOf<boolean | undefined>();
    expectTypeOf<Config["columns"]>().toEqualTypeOf<number | undefined>();
  });

  it("falls back to Record<string, unknown> when the registry is empty", () => {
    type EmptyRegistry = Record<never, never>;
    type EmptyConfig = AnyVariantConfigFor<EmptyRegistry>;

    expectTypeOf<EmptyConfig>().toEqualTypeOf<Record<string, unknown>>();
  });
});

describe("ModuleOptions registry entry contract", () => {
  type RegistryEntryInput = ModuleOptions["registry"][string];

  it("accepts the documented active flag on full entries", () => {
    expectTypeOf<{
      active: false;
      extends: ["seo"];
      config: { hidden: true };
    }>().toMatchTypeOf<RegistryEntryInput>();
  });

  it("keeps array shorthand entries accepted", () => {
    expectTypeOf<["seo", "hero"]>().toMatchTypeOf<RegistryEntryInput>();
  });
});
