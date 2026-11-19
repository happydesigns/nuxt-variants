import { createVariantResolver, defineVariantGroups } from "../src/core";
import { variantRegistry } from "./variants";

export const variantResolver = createVariantResolver(variantRegistry);
export const variantGroups = defineVariantGroups(variantResolver, {
  editorial: ["article", "event"],
  pagePresets: ["article", "event", "landing"],
  features: ["breadcrumbs", "hero", "toc", "sidebar", "seo"],
});
