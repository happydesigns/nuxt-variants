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
  const baseData = shallowRef<DevtoolsData>();
  const hasSnapshot = computed(() => baseData.value !== undefined);
  const host = useVariantHostContext();
  const metadata = computed(() => {
    const snapshot = baseData.value ?? emptyData;
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
      : (baseData.value ?? emptyData),
  );
  const pending = ref(true);
  const error = ref<string>();
  const selected = ref<string>();
  const linkedVariant = ref<string>();
  const linkedField = ref<string>();
  const linkNotice = ref<string>();
  const offline = ref(false);
  let transport: InspectorTransport | undefined;
  let disposed = false;
  let reading = false;
  let initialLoad = true;

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
    if (reading || disposed) return false;
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
          return false;
        }
        offline.value = transport.offline;
      }
      const [snapshot] = await Promise.all([transport.read(), host.refresh()]);
      if (disposed) return false;
      baseData.value = snapshot;
      if (initialLoad) {
        initialLoad = false;
        const requested = linkedVariant.value;
        if (requested && data.value.variants.some((variant) => variant.name === requested)) {
          selected.value = requested;
        } else if (requested) {
          linkNotice.value = `Variant "${requested}" was not found in this registry.`;
        }
      }
      if (
        !data.value.variants.some((variant) => variant.name === selected.value) &&
        !selectRouteVariant()
      ) {
        selected.value = data.value.variants[0]?.name;
      }
      return true;
    } catch (cause) {
      transport?.close();
      transport = undefined;
      error.value = cause instanceof Error ? cause.message : "Failed to load DevTools data.";
      return false;
    } finally {
      reading = false;
      pending.value = false;
    }
  }

  onMounted(() => {
    const params = new URLSearchParams(window.location.search);
    linkedVariant.value = params.get("variant") || undefined;
    linkedField.value = params.get("field") || undefined;
    void loadData();
  });

  watch(routeVariant, () => {
    if (initialLoad || (linkedVariant.value && selected.value === linkedVariant.value)) return;
    selectRouteVariant();
  });
  onScopeDispose(() => {
    disposed = true;
    transport?.close();
  });

  return {
    currentVariant,
    data,
    error,
    pending,
    hasSnapshot,
    routeVariant,
    selected,
    linkedField: computed(() =>
      selected.value === linkedVariant.value ? linkedField.value : undefined,
    ),
    linkNotice,
    offline,
    reload: loadData,
  };
}
