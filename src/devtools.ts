import { fileURLToPath } from "node:url";
import packageMetadata from "../package.json";
import { defineDevframe, defineRpcFunction } from "devframe";
import type { VariantDevtoolsData } from "./runtime/utils/devtools";
import { VARIANTS_DEVFRAME_ID } from "./runtime/utils/devtools-protocol";

export { createVariantDevtoolsData } from "./runtime/utils/devtools";
export type { VariantDevtoolsData, VariantDevtoolsMetadata } from "./runtime/utils/devtools";
export { VARIANTS_DEVFRAME_ID, VARIANTS_SNAPSHOT_RPC } from "./runtime/utils/devtools-protocol";

export interface VariantsDevframeOptions {
  /** Called per query, never cached: do not close over request-specific overrides. */
  snapshot: () => VariantDevtoolsData | Promise<VariantDevtoolsData>;
  /** Existing inspector build, or a host-provided replacement. */
  clientAssets?: string;
  basePath?: string;
}

/** One read-only inspector definition for Vite/Nuxt hosts and offline builds. */
export function createVariantsDevframe(options: VariantsDevframeOptions) {
  return defineDevframe({
    id: VARIANTS_DEVFRAME_ID,
    name: "Variants",
    version: packageMetadata.version,
    packageName: "@happydesigns/nuxt-variants",
    description: "Inspect variant inheritance, current config and diagnostics.",
    homepage: "https://github.com/happydesigns/nuxt-variants",
    importMetaUrl: import.meta.url,
    basePath: options.basePath ?? "/__nuxt-variants/devtools/",
    clientAssets: options.clientAssets ?? fileURLToPath(new URL("./client/", import.meta.url)),
    setup(ctx) {
      ctx.scope(VARIANTS_DEVFRAME_ID).rpc.register(
        defineRpcFunction({
          name: "get-snapshot",
          type: "query",
          snapshot: true,
          jsonSerializable: true,
          handler: async () => options.snapshot(),
        }),
      );
    },
  });
}

/** Hosts may extend their own DevFrame registry with this map once. */
export interface VariantsDevtoolsRpcFunctions {
  "nuxt-variants:get-snapshot": () => Promise<VariantDevtoolsData>;
}
