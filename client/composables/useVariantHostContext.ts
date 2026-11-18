import { connectPanelChannel, type PanelChannel } from "devframe/in-page-channel";
import {
  VARIANTS_HOST_CHANNEL,
  type VariantHostContext,
  type VariantHostProtocol,
} from "../../src/runtime/utils/devtools-protocol";

/** Same-origin Nuxt page context; absent for generic and offline hosts. */
export function useVariantHostContext() {
  const variant = ref<string>();
  const overrides = shallowRef<VariantHostContext["overrides"]>();
  let previousOverrides: string | undefined;
  let revision = 0;
  function apply(context: VariantHostContext) {
    variant.value = context.variant;
    // Each channel message has a fresh object, including route-only updates.
    const serialized = JSON.stringify(context.overrides);
    if (serialized !== previousOverrides) {
      previousOverrides = serialized;
      overrides.value = context.overrides;
    }
  }
  let channel: PanelChannel<VariantHostProtocol> | undefined;
  onMounted(() => {
    if (new URLSearchParams(window.location.search).get("host") !== "nuxt") return;
    channel = connectPanelChannel<VariantHostProtocol>({
      name: VARIANTS_HOST_CHANNEL,
      functions: {},
      events: { contextChanged: {} },
      allowedOrigins: [window.location.origin],
      heartbeat: false,
      callTimeoutMs: 8000,
    });
    channel.on("contextChanged", (value) => {
      revision++;
      apply(value);
    });
  });
  onScopeDispose(() => {
    revision++;
    channel?.close();
  });
  async function refresh() {
    if (!channel) return;
    const requested = revision;
    const result = await channel.call("getContext");
    if (requested === revision) apply(result);
  }
  return { variant, overrides, refresh };
}
