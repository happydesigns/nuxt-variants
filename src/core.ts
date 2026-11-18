import { assertValidVariantInputs, assertValidVariantRegistry } from "./runtime/utils/diagnostics";
import { normalizeVariantRegistry, type VariantRegistryInput } from "./runtime/utils/registry";
import { defuReplaceArray } from "./runtime/utils/merge";
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
// A typed defaults map can omit an entry or its config at runtime.
type EntryConfig<E> = E extends { config?: infer C }
  ? "config" extends keyof E
    ? C
    : never
  : never;
type Own<E> = [EntryConfig<E>] extends [never]
  ? {}
  : [E] extends [{ config: unknown }]
    ? EntryConfig<E>
    : Partial<EntryConfig<E>>;
type Parents<E> = E extends readonly string[]
  ? E[number]
  : E extends { extends?: infer P }
    ? P extends readonly string[]
      ? P[number]
      : Extract<P, string>
    : never;
// Walk a generation of parents together so shared ancestors contribute once.
// A widened parent name can resolve to any registered entry.
type OwnAt<R, Names> = Names extends keyof R ? Own<R[Names]> : never;
type Contributions<
  R,
  P,
  Seen = never,
  Fields = never,
  Next extends keyof R = Exclude<Extract<keyof R, P>, Seen>,
> = string extends P
  ? Fields | OwnAt<R, keyof R>
  : [Next] extends [never]
    ? Fields
    : Contributions<R, Parents<R[Next]>, Seen | Next, Fields | OwnAt<R, Next>>;
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
type Field<T, K extends PropertyKey> = T extends unknown
  ? K extends keyof T
    ? T[K]
    : undefined
  : never;
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
export type ResolvedVariantConfig<R, K extends keyof R> = string extends keyof R
  ? Record<string, unknown>
  : Merge<Inherited<Contributions<R, Parents<R[K]>>>, Widen<Own<R[K]>>>;
type PartialConfig<T> = T extends readonly unknown[]
  ? T
  : T extends object
    ? { [K in keyof T]?: PartialConfig<T[K]> }
    : T;
export type VariantOverrides<R> = {
  [K in VariantKey<R>]?: {
    active?: boolean;
    config?: keyof ResolvedVariantConfig<R, K> extends never
      ? Record<string, never>
      : PartialConfig<ResolvedVariantConfig<R, K>>;
  };
};
// Structural assignment normally lets named variables introduce undeclared fields.
// Such a field could shadow a typed value on a sibling in the resolved graph.
type KnownFields<T, Shape> = unknown extends Shape
  ? T
  : T extends readonly unknown[]
    ? T
    : T extends object
      ? {
          [K in keyof T]: K extends Keys<NonNullable<Shape>>
            ? KnownFields<T[K], Value<NonNullable<Shape>, K>>
            : never;
        }
      : T;
type WithDefaults<R, D> = {
  [K in keyof R]: {
    extends: Extract<Parents<R[K]>, string>[];
    config: Merge<Own<R[K]>, Own<Field<D, K>>>;
  };
};
export type VariantResolution<R, K extends keyof R> = K extends keyof R
  ? {
      name: K;
      features: readonly VariantKey<R>[];
    } & (
      | { active: true; config: ResolvedVariantConfig<R, K> }
      | { active: false; config: { [P in keyof ResolvedVariantConfig<R, K>]?: never } }
    )
  : never;

export interface VariantResolver<in out R extends VariantRegistryInput> {
  readonly registry: ReturnType<typeof normalizeVariantRegistry>;
  readonly names: readonly VariantKey<R>[];
  isName(value: unknown): value is VariantKey<R>;
  resolve<K extends VariantKey<R>>(name: K): VariantResolution<R, K>;
  resolve<K extends VariantKey<R>, const O extends VariantOverrides<R>>(
    name: K,
    overrides: (O & KnownFields<NoInfer<O>, VariantOverrides<R>>) | undefined,
  ): VariantResolution<R, K>;
}

function assertPlainData(value: unknown, checked = new WeakMap<object, boolean>()): void {
  if (value && typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null)
      throw new Error("[nuxt-variants] Registry config must use plain data objects and arrays.");
    const complete = checked.get(value);
    if (complete === false) throw new Error("[nuxt-variants] Cyclic config data is not supported.");
    if (complete) return;
    checked.set(value, false);
    // Cloning drops symbols and non-enumerable fields and invokes getters.
    // Validate descriptors so the value we copy is exactly the declared data.
    for (const key of Reflect.ownKeys(value)) {
      if (Array.isArray(value) && key === "length") continue;
      const descriptor = Object.getOwnPropertyDescriptor(value, key)!;
      if (typeof key !== "string" || !descriptor.enumerable || !("value" in descriptor))
        throw new Error(
          "[nuxt-variants] Config fields must be enumerable, string-keyed data properties.",
        );
      assertPlainData(descriptor.value, checked);
    }
    checked.set(value, true);
  }
  if (typeof value === "function" || typeof value === "symbol")
    throw new Error("[nuxt-variants] Config must contain cloneable plain data.");
}

function assertPlainMap(value: unknown): void {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new Error("[nuxt-variants] Registry and override maps must be plain objects.");
  assertPlainData(value);
}

function freeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const item of Object.values(value)) freeze(item);
  }
  return value;
}

/** Compile one registry per application/content instance, never per document/request. */
export function createVariantResolver<const R extends VariantRegistryInput>(
  input: R,
): VariantResolver<R>;
export function createVariantResolver<
  const R extends VariantRegistryInput,
  const D extends Partial<Record<VariantKey<NoInfer<R>>, VariantOverrideRegistry[string]>>,
>(
  input: R,
  defaults: D & Record<Exclude<keyof D, keyof R>, never>,
): VariantResolver<WithDefaults<R, D>>;
export function createVariantResolver<const R extends VariantRegistryInput>(
  input: R,
  defaults: VariantOverrideRegistry = {},
) {
  assertPlainMap(input);
  assertPlainMap(defaults);
  const normalized = normalizeVariantRegistry(input);
  assertValidVariantInputs({}, defaults);
  assertValidVariantRegistry(normalized, defaults);
  for (const [name, entry] of Object.entries(defaults)) {
    const base = normalized[name]!;
    if (entry.active !== undefined) base.active = entry.active;
    if (entry.config) base.config = defuReplaceArray({}, entry.config, base.config);
  }
  const registry = freeze(structuredClone(normalized));
  const plan = createVariantResolutionPlan(registry);
  const names = Object.freeze(Object.keys(registry)) as readonly VariantKey<R>[];
  const isName = (value: unknown): value is VariantKey<R> =>
    typeof value === "string" && Object.hasOwn(registry, value);
  const resolvedDefaults = new Map<string, Record<string, unknown>>();
  function getDefaultConfig(name: string, lineage: readonly string[]) {
    const cached = resolvedDefaults.get(name);
    if (cached) return cached;
    const config = resolveVariantConfigFromLineage(lineage, registry, {});
    resolvedDefaults.set(name, config);
    return config;
  }
  return Object.freeze({
    registry,
    names,
    isName,
    resolve<K extends VariantKey<R>>(
      name: K,
      overrides?: VariantOverrides<R>,
    ): VariantResolution<R, K> {
      if (!isName(name)) throw new Error(`[nuxt-variants] Unknown variant "${String(name)}".`);
      if (overrides !== undefined) assertPlainMap(overrides);
      const entries = overrides ?? {};
      const keys = Object.keys(entries);
      // Graph structure is immutable and was validated once. Validate only
      // the supplied override keys here, without traversing the graph again.
      if (keys.length) {
        assertValidVariantInputs({}, entries);
        const known = Object.fromEntries(keys.filter(isName).map((key) => [key, {}]));
        assertValidVariantRegistry(known, entries);
      }
      const runtime = entries as VariantOverrideRegistry;
      const lineage =
        keys.length && hasVariantActivityOverrides(runtime)
          ? [...resolveVariantFeatures(name, registry, runtime)]
          : (plan[name] ?? []);
      const config = keys.length
        ? resolveVariantConfigFromLineage(lineage, registry, runtime)
        : getDefaultConfig(name, lineage);
      return {
        name,
        active: lineage.includes(name),
        features: [...lineage],
        config: structuredClone(config),
        // Registry validation plus the shared resolver establish this mapped
        // type at runtime; TypeScript cannot infer recursive config merges.
      } as unknown as VariantResolution<R, K>;
    },
  });
}
