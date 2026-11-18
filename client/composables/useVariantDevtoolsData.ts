import type { DevtoolsData } from "~/types/devtools";
import { createInspectorTransport, type InspectorTransport } from "~/utils/inspector-transport";
import { createVariantDevtoolsData } from "../../src/runtime/utils/devtools";
import { useVariantHostContext } from "./useVariantHostContext";
import { useNuxtRouteVariant } from "./useNuxtRouteVariant";

const emptyData: DevtoolsData = {
  configKey: "variants",
  variants: [],
  graph: {},
  diagnostics: [],
};

export function useVariantDevtoolsData() {
  const baseData = shallowRef<DevtoolsData>({ ...emptyData });
  const host = useVariantHostContext();
  const metadata = computed(() => {
    const snapshot = baseData.value;
    return {
      configKey: snapshot.configKey,
      registry: Object.fromEntries(
        snapshot.variants.map((entry) => [entry.name, entry.base ?? {}]),
      ),
      sources: Object.fromEntries(snapshot.variants.map((entry) => [entry.name, entry.sources])),
    };
  });
  const data = computed(() =>
    host.overrides.value
      ? createVariantDevtoolsData(metadata.value, host.overrides.value)
      : baseData.value,
  );
  const pending = ref(true);
  const error = ref<string>();
  const selected = ref<string>();
  const offline = ref(false);
  let transport: InspectorTransport | undefined;
  let disposed = false;
  let reading = false;

  const legacyRoute = useNuxtRouteVariant();
  const routeVariant = computed(() => host.variant.value ?? legacyRoute.value);
  const currentVariant = computed(() =>
    data.value.variants.find((variant) => variant.name === selected.value),
  );

  function selectRouteVariant() {
    if (data.value.variants.some((variant) => variant.name === routeVariant.value)) {
      selected.value = routeVariant.value;
      return true;
    }

    return false;
  }

  async function loadData() {
    if (reading || disposed) return;
    reading = true;
    pending.value = true;
    error.value = undefined;

    try {
      if (!transport) {
        const base = new URL(window.location.href);
        if (!base.pathname.endsWith("/")) base.pathname += "/";
        base.search = "";
        base.hash = "";
        transport = await createInspectorTransport(base);
        if (disposed) {
          transport.close();
          return;
        }
        offline.value = transport.offline;
      }
      const [snapshot] = await Promise.all([transport.read(), host.refresh()]);
      if (disposed) return;
      baseData.value = snapshot;
      if (
        !data.value.variants.some((variant) => variant.name === selected.value) &&
        !selectRouteVariant()
      ) {
        selected.value = data.value.variants[0]?.name;
      }
    } catch (cause) {
      transport?.close();
      transport = undefined;
      error.value = cause instanceof Error ? cause.message : "Failed to load DevTools data.";
    } finally {
      reading = false;
      pending.value = false;
    }
  }

  onMounted(() => {
    void loadData();
  });

  watch(routeVariant, selectRouteVariant);
  onScopeDispose(() => {
    disposed = true;
    transport?.close();
  });

  return {
    currentVariant,
    data,
    error,
    pending,
    routeVariant,
    selected,
    offline,
    reload: loadData,
  };
}
