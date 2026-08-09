import { useDevtoolsClient } from "@nuxt/devtools-kit/iframe-client";
import type { DevtoolsData } from "~/types/devtools";

const emptyData: DevtoolsData = {
  configKey: "variants",
  variants: [],
  graph: {},
  diagnostics: [],
};

export function useVariantDevtoolsData() {
  const devtoolsClient = useDevtoolsClient();
  const data = ref<DevtoolsData>({ ...emptyData });
  const pending = ref(true);
  const error = ref<string>();
  const selected = ref<string>();

  const routeVariant = computed(() => {
    const variant = devtoolsClient.value?.host?.nuxt.$router.currentRoute.value.meta.variant;
    return typeof variant === "string" ? variant : undefined;
  });
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
      const base = window.location.href.endsWith("/")
        ? window.location.href
        : `${window.location.href}/`;
      const response = await fetch(new URL("data.json", base));

      if (!response.ok) {
        throw new Error(`DevTools data request failed with ${response.status}.`);
      }

      data.value = (await response.json()) as DevtoolsData;
      if (
        !selectRouteVariant() &&
        !data.value.variants.some((variant) => variant.name === selected.value)
      ) {
        selected.value = data.value.variants[0]?.name;
      }
    } catch (cause) {
      error.value = cause instanceof Error ? cause.message : "Failed to load DevTools data.";
    } finally {
      pending.value = false;
    }
  }

  onMounted(() => {
    void loadData();
  });

  watch(routeVariant, selectRouteVariant);

  return {
    currentVariant,
    data,
    error,
    pending,
    routeVariant,
    selected,
    reload: loadData,
  };
}
