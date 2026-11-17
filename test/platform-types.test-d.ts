import { createVariantResolver } from "../src/core";
import { variantContent } from "../src/content";
import { comarkContent } from "comark-content";

const resolver = createVariantResolver({
  header: { config: { heading: { inherited: "optional" } } },
  article: { extends: ["header"], config: { heading: { own: "required" }, count: 1 } },
});
const result = resolver.resolve("article");
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
