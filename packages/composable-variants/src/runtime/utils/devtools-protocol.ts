import type { VariantOverrideRegistry } from "./variants";

export const VARIANTS_DEVFRAME_ID = "nuxt-variants";
export const VARIANTS_SNAPSHOT_RPC = "nuxt-variants:get-snapshot";
export const VARIANTS_HOST_CHANNEL = "nuxt-variants:host-context";

export interface VariantHostContext {
  variant?: string;
  overrides: VariantOverrideRegistry;
}

export interface VariantHostProtocol {
  functions: { pageScript: { getContext: () => VariantHostContext } };
  events: { panel: { contextChanged: (context: VariantHostContext) => void } };
}
