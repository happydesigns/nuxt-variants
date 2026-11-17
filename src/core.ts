import { assertValidVariantInputs, assertValidVariantRegistry } from "./runtime/utils/diagnostics";
import { normalizeVariantRegistry, type VariantRegistryInput } from "./runtime/utils/registry";
import {
  createVariantResolutionPlan,
  hasVariantActivityOverrides,
  resolveVariantConfigFromLineage,
  resolveVariantFeatures,
  type VariantOverrideRegistry,
} from "./runtime/utils/variants";

export { defineVariantRegistry } from "./runtime/utils/registry";
export { VariantRegistryError } from "./runtime/utils/diagnostics";
export type { VariantRegistryInput, VariantOverrideRegistry };
export type VariantKey<R> = keyof R & string;
type Own<E> = E extends { config: infer C } ? C : {};
type Parents<E> = E extends readonly string[]
  ? E[number]
  : E extends { extends: infer P }
    ? P extends readonly string[]
      ? P[number]
      : P
    : never;
type Contributions<R, K, Seen = never> = K extends keyof R
  ? K extends Seen
    ? never
    : Own<R[K]> | Contributions<R, Parents<R[K]>, Seen | K>
  : never;
type Keys<U> = U extends unknown ? keyof U : never;
type Value<U, K extends PropertyKey> = U extends unknown
  ? K extends keyof U
    ? U[K]
    : never
  : never;
type Widen<T> = T extends string
  ? string
  : T extends number
    ? number
    : T extends boolean
      ? boolean
      : T extends readonly (infer E)[]
        ? Widen<E>[]
        : T extends object
          ? { -readonly [K in keyof T]: Widen<T[K]> }
          : T;
type Objects<U> = U extends readonly unknown[] ? never : U extends object ? U : never;
type NonObjects<U> = U extends readonly unknown[] ? Widen<U> : U extends object ? never : Widen<U>;
type InheritedValue<U> =
  | NonObjects<U>
  | ([Objects<U>] extends [never] ? never : Inherited<Objects<U>>);
type Inherited<U> = { [K in Keys<U>]?: InheritedValue<Value<U, K>> };
type Field<T, K extends PropertyKey> = K extends keyof T ? T[K] : undefined;
type Guaranteed<T> = {
  [K in keyof T]-?: {} extends Pick<T, K>
    ? never
    : [Extract<T[K], null | undefined>] extends [never]
      ? K
      : never;
}[keyof T];
type MergeValue<L, H> = H extends null | undefined
  ? L
  : H extends readonly unknown[]
    ? H
    : H extends object
      ? [Objects<L>] extends [never]
        ? H
        : Merge<[L] extends [Objects<L>] ? L : Inherited<Objects<L>>, H>
      : H;
type Merge<L, H> = {
  [K in Exclude<keyof L | keyof H, Guaranteed<L> | Guaranteed<H>>]?: MergeValue<
    Field<L, K>,
    Field<H, K>
  >;
} & { [K in Guaranteed<L> | Guaranteed<H>]-?: MergeValue<Field<L, K>, Field<H, K>> };
/** Own defaults are guaranteed only on an active result; inherited fields can disappear. */
export type ResolvedVariantConfig<R, K extends keyof R> = Merge<
  Inherited<Contributions<R, Parents<R[K]>>>,
  Widen<Own<R[K]>>
>;
type PartialConfig<T> = T extends readonly unknown[]
  ? T
  : T extends object
    ? { [K in keyof T]?: PartialConfig<T[K]> }
    : T;
export type VariantOverrides<R> = {
  [K in VariantKey<R>]?: {
    active?: boolean;
    config?: PartialConfig<ResolvedVariantConfig<R, K>> & Record<string, unknown>;
  };
};
export type VariantResolution<R, K extends keyof R> = {
  name: K;
  features: readonly VariantKey<R>[];
} & (
  | { active: true; config: ResolvedVariantConfig<R, K> }
  | { active: false; config: Record<string, never> }
);

export interface VariantResolver<R extends VariantRegistryInput> {
  readonly registry: ReturnType<typeof normalizeVariantRegistry>;
  readonly names: readonly VariantKey<R>[];
  isName(value: unknown): value is VariantKey<R>;
  resolve<K extends VariantKey<R>>(
    name: K,
    overrides?: VariantOverrides<R>,
  ): VariantResolution<R, K>;
}

function freeze<T>(value: T, active = new WeakSet<object>()): T {
  if (value && typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null)
      throw new Error("[nuxt-variants] Registry config must use plain data objects and arrays.");
    if (active.has(value)) throw new Error("[nuxt-variants] Cyclic config data is not supported.");
    active.add(value);
    for (const item of Object.values(value)) freeze(item, active);
    active.delete(value);
    Object.freeze(value);
  }
  return value;
}

/** Compile one registry per application/content instance, never per document/request. */
export function createVariantResolver<const R extends VariantRegistryInput>(
  input: R,
): VariantResolver<R> {
  const registry = freeze(structuredClone(normalizeVariantRegistry(input)));
  assertValidVariantRegistry(registry, {});
  const plan = createVariantResolutionPlan(registry);
  const names = Object.freeze(Object.keys(registry)) as readonly VariantKey<R>[];
  const isName = (value: unknown): value is VariantKey<R> =>
    typeof value === "string" && Object.hasOwn(registry, value);
  return Object.freeze({
    registry,
    names,
    isName,
    resolve<K extends VariantKey<R>>(
      name: K,
      overrides: VariantOverrides<R> = {},
    ): VariantResolution<R, K> {
      if (!isName(name)) throw new Error(`[nuxt-variants] Unknown variant "${String(name)}".`);
      assertValidVariantInputs({}, overrides);
      // Graph structure is immutable and was validated once. Validate only
      // the supplied override keys here, without traversing the graph again.
      const knownOverrides = Object.fromEntries(
        Object.keys(overrides)
          .filter(isName)
          .map((key) => [key, {}]),
      );
      assertValidVariantRegistry(knownOverrides, overrides);
      const runtime = overrides as VariantOverrideRegistry;
      const lineage = hasVariantActivityOverrides(runtime)
        ? [...resolveVariantFeatures(name, registry, runtime)]
        : (plan[name] ?? []);
      return {
        name,
        active: lineage.includes(name),
        features: [...lineage],
        config: structuredClone(resolveVariantConfigFromLineage(lineage, registry, runtime)),
        // Registry validation plus the shared resolver establish this mapped
        // type at runtime; TypeScript cannot infer recursive config merges.
      } as unknown as VariantResolution<R, K>;
    },
  });
}
