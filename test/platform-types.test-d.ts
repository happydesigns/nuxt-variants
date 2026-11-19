import { createVariantResolver } from "@happydesigns/composable-variants";
import { variantContent } from "@happydesigns/composable-variants/comark-content";
import { comarkContent } from "comark-content";

const resolver = createVariantResolver({
  header: { config: { heading: { inherited: "optional" } } },
  article: { extends: ["header"], config: { heading: { own: "required" }, count: 1 } },
});
const result = resolver.resolve("article");
// @ts-expect-error A disabled variant has no own defaults until the active branch is known.
result.config.count.toFixed();
if (result.active) {
  result.config.heading.own.toUpperCase();
  result.config.heading.inherited?.toUpperCase();
  result.config.count.toFixed();
  // @ts-expect-error Inherited fields can disappear when a parent is inactive.
  result.config.heading.inherited.toUpperCase();
}
// @ts-expect-error The resolver exposes known variant names only.
resolver.resolve("missing");
// @ts-expect-error Known override values keep their inferred types.
resolver.resolve("article", { article: { config: { count: "wrong" } } });
const content = comarkContent("typedsample", {
  plugins: [variantContent({ resolver, defaultVariant: "article" })],
});
content.resolveVariant("article", { header: { active: false } });
// @ts-expect-error Content methods preserve the resolver's name union.
content.resolveVariant("missing");
// @ts-expect-error Default identities must belong to the same resolver.
variantContent({ resolver, defaultVariant: "missing" });

const layered = createVariantResolver(
  { left: { config: { title: "Text" } }, progress: {}, course: ["left", "progress"] },
  { progress: { config: { courseProgress: { storagePrefix: "course-progress" } } } },
);
const courseContent = comarkContent("typedcourse", {
  plugins: [variantContent({ resolver: layered })],
});
const course = courseContent.resolveVariant("course", {
  progress: { config: { courseProgress: { storagePrefix: "reader" } } },
});
if (course.active) {
  course.config.courseProgress?.storagePrefix?.toUpperCase();
  // @ts-expect-error Application default fields retain their value types in Content.
  course.config.courseProgress?.storagePrefix?.toFixed();
  // @ts-expect-error Parent activation controls the availability of the field.
  course.config.courseProgress.storagePrefix.toUpperCase();
}
const conflict = {
  progress: { config: { courseProgress: { storagePrefix: "reader" }, title: 123 } },
};
// @ts-expect-error A named override cannot supply a sibling's field.
layered.resolve("course", conflict);
const siblings = createVariantResolver({
  left: { config: { title: "Text" } },
  right: {},
  page: ["left", "right"],
});
// @ts-expect-error Empty entries cannot introduce untyped fields at resolution time.
siblings.resolve("page", { right: { config: { title: 123 } } });
// @ts-expect-error Additional defaults must belong to registered variants.
createVariantResolver({ page: {} }, { page: {}, missing: {} });

declare const maybeDefaults: { page?: { config?: { title: number } } };
const maybe = createVariantResolver({ page: { config: { title: "Text" } } }, maybeDefaults).resolve(
  "page",
);
if (maybe.active) {
  const title: string | number = maybe.config.title;
  void title;
  // @ts-expect-error The optional app config can replace the registry string with a number.
  maybe.config.title.toUpperCase();
}

// Separately declared entries can have optional or widened parent names.
const optionalParent: { extends?: "numeric" } = {};
optionalParent.extends = "numeric";
const dynamicParent = { extends: "numeric" };
const mixed = createVariantResolver({
  text: { config: { title: "Text" } },
  numeric: { config: { title: 7 } },
  optionalParent,
  dynamicParent,
  optional: ["text", "optionalParent"],
  dynamic: ["text", "dynamicParent"],
});
const optional = mixed.resolve("optional");
if (optional.active) {
  // @ts-expect-error The optional parent can contribute a number.
  optional.config.title?.toUpperCase();
}
const dynamic = mixed.resolve("dynamic");
if (dynamic.active) {
  // @ts-expect-error A dynamically chosen parent can contribute either title type.
  dynamic.config.title?.toUpperCase();
}
declare const documentName: "text" | "numeric";
const selected = mixed.resolve(documentName);
if (selected.active && selected.name === "numeric") selected.config.title.toFixed();
if (selected.active && selected.name === "text") selected.config.title.toUpperCase();

declare const conditionalEntry: { config: { title: number } } | { active: false };
const fromEntry = createVariantResolver({
  base: { config: { title: "Text" } },
  conditionalEntry,
  page: ["base", "conditionalEntry"],
}).resolve("page");
if (fromEntry.active) {
  // @ts-expect-error The conditional entry can supply a numeric title.
  fromEntry.config.title?.toUpperCase();
}

declare const conditionalDefaults:
  | { base: { config: { title: number } } }
  | { other: { active: false } };
const fromDefaults = createVariantResolver(
  { base: { config: { title: "Text" } }, other: {} },
  conditionalDefaults,
).resolve("base");
if (fromDefaults.active) {
  // @ts-expect-error The selected defaults can replace the string with a number.
  fromDefaults.config.title.toUpperCase();
}
