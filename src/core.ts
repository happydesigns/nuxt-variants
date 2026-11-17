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
type Own<E> = "config" extends keyof NonNullable<E>
  ? NonNullable<E> extends { config?: infer C }
    ? [E] extends [{ config: unknown }]
      ? C
      : Partial<C>
    : {}
  : {};
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
export type VariantResolution<R, K extends keyof R> = {
  name: K;
  features: readonly VariantKey<R>[];
} & (
  | { active: true; config: ResolvedVariantConfig<R, K> }
  | { active: false; config: { [P in keyof ResolvedVariantConfig<R, K>]?: never } }
);

export interface VariantResolver<R extends VariantRegistryInput> {
  readonly registry: ReturnType<typeof normalizeVariantRegistry>;
  readonly names: readonly VariantKey<R>[];
  isName(value: unknown): value is VariantKey<R>;
  resolve<K extends VariantKey<R>>(name: K): VariantResolution<R, K>;
  resolve<K extends VariantKey<R>, const O extends VariantOverrides<R>>(
    name: K,
    overrides: (O & KnownFields<NoInfer<O>, VariantOverrides<R>>) | undefined,
  ): VariantResolution<R, K>;
}

function assertPlainData(value: unknown, active = new WeakSet<object>()): void {
  if (value && typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    if (!Array.isArray(value) && prototype !== Object.prototype && prototype !== null)
      throw new Error("[nuxt-variants] Registry config must use plain data objects and arrays.");
    if (active.has(value)) throw new Error("[nuxt-variants] Cyclic config data is not supported.");
    active.add(value);
    for (const item of Object.values(value)) assertPlainData(item, active);
    active.delete(value);
  }
  if (typeof value === "function" || typeof value === "symbol")
    throw new Error("[nuxt-variants] Config must contain cloneable plain data.");
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
  assertPlainData(input);
  assertPlainData(defaults);
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
  return Object.freeze({
    registry,
    names,
    isName,
    resolve<K extends VariantKey<R>>(
      name: K,
      overrides: VariantOverrides<R> = {},
    ): VariantResolution<R, K> {
      if (!isName(name)) throw new Error(`[nuxt-variants] Unknown variant "${String(name)}".`);
      assertPlainData(overrides);
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
