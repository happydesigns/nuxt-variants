import type { CustomVariantRegistry, VariantConfigOf } from "#nuxt-variants";

type Expect<T extends true> = T;
type HasKey<T, K extends PropertyKey> = K extends keyof T ? true : false;
type IsAssignable<T, Expected> = [T] extends [Expected] ? true : false;

type ArticleConfig = VariantConfigOf<"article">;
type LandingConfig = VariantConfigOf<"landing">;
type EventConfig = VariantConfigOf<"event">;

export type ArticleIncludesInheritedFeatures = Expect<
  HasKey<ArticleConfig, "breadcrumbSeparator"> &
    HasKey<ArticleConfig, "heroHeight"> &
    HasKey<ArticleConfig, "titleTemplate"> &
    HasKey<ArticleConfig, "tocTitle">
>;

export type ArticleOverrideTypesAreWidened = Expect<
  IsAssignable<ArticleConfig["authorBox"], boolean | undefined> &
    IsAssignable<ArticleConfig["heroAlign"], string | undefined>
>;

export type LandingIncludesSidebarFeature = Expect<
  HasKey<LandingConfig, "sidebarPosition"> & HasKey<LandingConfig, "sidebarWidth">
>;

export type EventIncludesHeroAndBreadcrumbs = Expect<
  HasKey<EventConfig, "breadcrumbShowHome"> & HasKey<EventConfig, "heroOverlay">
>;

export type RegistryContainsKnownVariants = Expect<
  HasKey<CustomVariantRegistry, "article"> &
    HasKey<CustomVariantRegistry, "event"> &
    HasKey<CustomVariantRegistry, "landing">
>;
