import { createVariantResolver, defineVariantGroups } from "../src/core";
import { variantRegistry } from "./variants";

export const variantGroups = defineVariantGroups(createVariantResolver(variantRegistry), {
  pagePresets: ["article", "event", "landing"],
  features: ["breadcrumbs", "hero", "toc", "sidebar", "seo"],
});
