import type { variantGroups } from "../variant-groups";

declare module "#app" {
  interface PageMeta {
    variant?: (typeof variantGroups)["pagePresets"][number];
  }
}
