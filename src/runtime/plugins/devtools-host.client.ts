import { createPageScriptChannel } from "devframe/in-page-channel";
import { watch } from "vue";
import { defineNuxtPlugin, useAppConfig, useRouter } from "#app";
import { variantsConfigKey } from "#variants-runtime";
import {
  VARIANTS_HOST_CHANNEL,
  type VariantHostContext,
  type VariantHostProtocol,
} from "../utils/devtools-protocol";

/** Development-only read bridge. Exposes neither routing actions nor config writes. */
export default defineNuxtPlugin((app) => {
  const router = useRouter();
  const config = useAppConfig();
  function read(): VariantHostContext {
    const variant = router.currentRoute.value.meta.variant;
    const overrides = (config as Record<string, unknown>)[variantsConfigKey] ?? {};
    return {
      ...(typeof variant === "string" ? { variant } : {}),
      overrides: JSON.parse(JSON.stringify(overrides)),
    };
  }
  const channel = createPageScriptChannel<VariantHostProtocol>({
    name: VARIANTS_HOST_CHANNEL,
    allowedOrigins: [window.location.origin],
    heartbeat: false,
    functions: { getContext: { type: "query", jsonSerializable: true, handler: read } },
  });
  const stop = watch(
    [
      () => router.currentRoute.value.meta.variant,
      () => (config as Record<string, unknown>)[variantsConfigKey],
    ],
    () => {
      if (channel.panels.length) channel.emit("contextChanged", read());
    },
    { deep: true },
  );
  const dispose = () => {
    stop();
    channel.close();
  };
  app.vueApp.onUnmount(dispose);
  if (import.meta.hot) import.meta.hot.dispose(dispose);
});
