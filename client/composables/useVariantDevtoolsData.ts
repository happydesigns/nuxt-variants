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
  const data = computed(() => {
    if (!host.context.value) return baseData.value;
    const snapshot = baseData.value;
    return createVariantDevtoolsData(
      {
        configKey: snapshot.configKey,
        registry: Object.fromEntries(
          snapshot.variants.map((entry) => [entry.name, entry.base ?? {}]),
        ),
        sources: Object.fromEntries(snapshot.variants.map((entry) => [entry.name, entry.sources])),
      },
      host.context.value.overrides,
    );
  });
  const pending = ref(true);
  const error = ref<string>();
  const selected = ref<string>();
  const transportLabel = ref("");
  let transport: InspectorTransport | undefined;
  let disposed = false;

  const legacyRoute = useNuxtRouteVariant();
  const routeVariant = computed(() => host.context.value?.variant ?? legacyRoute.value);
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
        transportLabel.value = transport.label;
      }
      const [snapshot] = await Promise.all([transport.read(), host.refresh()]);
      baseData.value = snapshot;
      if (
        !selectRouteVariant() &&
        !data.value.variants.some((variant) => variant.name === selected.value)
      ) {
        selected.value = data.value.variants[0]?.name;
      }
    } catch (cause) {
      transport?.close();
      transport = undefined;
      error.value = cause instanceof Error ? cause.message : "Failed to load DevTools data.";
    } finally {
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
    transportLabel,
    reload: loadData,
  };
}
