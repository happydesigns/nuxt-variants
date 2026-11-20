import { defineEventHandler, setHeader } from "h3";
import { useAppConfig, useRuntimeConfig } from "#imports";
import { createVariantSnapshot, type VariantDevtoolsMetadata } from "../utils/devtools";
import type { VariantOverrideRegistry } from "../utils/variants";

export default defineEventHandler((event) => {
  setHeader(event, "content-type", "application/json; charset=utf-8");
  const runtimeConfig = useRuntimeConfig(event) as unknown as {
    variantDevtoolsMetadata?: VariantDevtoolsMetadata;
  };
  const metadata = runtimeConfig.variantDevtoolsMetadata;
  if (!metadata) return {};

  const appConfig = useAppConfig() as Record<string, unknown>;
  const appRegistry = (appConfig[metadata.configKey] ?? {}) as VariantOverrideRegistry;

  return createVariantSnapshot(metadata, appRegistry);
});
