import { connectPanelChannel, type PanelChannel } from "devframe/in-page-channel";
import {
  VARIANTS_HOST_CHANNEL,
  type VariantHostContext,
  type VariantHostProtocol,
} from "../../src/runtime/utils/devtools-protocol";

/** Same-origin Nuxt page context; absent for generic and offline hosts. */
export function useVariantHostContext() {
  const context = shallowRef<VariantHostContext>();
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
      context.value = value;
    });
  });
  onScopeDispose(() => channel?.close());
  async function refresh() {
    if (channel) context.value = await channel.call("getContext");
  }
  return { context, refresh };
}
