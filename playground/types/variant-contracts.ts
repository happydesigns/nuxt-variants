import type { CustomVariantRegistry, VariantConfigOf } from "#nuxt-variants";

type Expect<T extends true> = T;
type HasKey<T, K extends PropertyKey> = K extends keyof T ? true : false;
type IsAssignable<T, Expected> = [T] extends [Expected] ? true : false;
type IsEqual<Left, Right> =
  (<T>() => T extends Left ? 1 : 2) extends <T>() => T extends Right ? 1 : 2 ? true : false;

type ArticleConfig = VariantConfigOf<"article">;
type LandingConfig = VariantConfigOf<"landing">;
type EventConfig = VariantConfigOf<"event">;
type PreviewConfig = VariantConfigOf<"preview">;

export type ArticleIncludesInheritedFeatures = Expect<
  HasKey<ArticleConfig, "breadcrumbSeparator"> &
    HasKey<ArticleConfig, "heroHeight"> &
    HasKey<ArticleConfig, "titleTemplate"> &
    HasKey<ArticleConfig, "tocTitle">
>;

export type ArticleMergesBaseAndAppConfig = Expect<
  HasKey<ArticleConfig, "articleLayout"> & HasKey<ArticleConfig, "tocTitle">
>;

export type ArticleOverrideTypesAreWidened = Expect<
  IsAssignable<ArticleConfig["authorBox"], boolean | undefined> &
    IsEqual<ArticleConfig["heroAlign"], "left" | "center" | "right" | undefined>
>;

export type FeatureTypeRefinementsFlowIntoDescendants = Expect<
  IsEqual<ArticleConfig["heroHeight"], "sm" | "md" | "lg" | "xl" | undefined> &
    IsEqual<EventConfig["heroHeight"], "sm" | "md" | "lg" | "xl" | undefined>
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
    HasKey<CustomVariantRegistry, "landing"> &
    HasKey<CustomVariantRegistry, "preview">
>;

export type PreviewIncludesAppOnlyConfig = Expect<HasKey<PreviewConfig, "previewMode">>;
