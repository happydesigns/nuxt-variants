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

  const connected = computed(() => Boolean(devtoolsClient.value));
  const currentVariant = computed(() =>
    data.value.variants.find((variant) => variant.name === selected.value),
  );

  async function loadData() {
    pending.value = true;
    error.value = undefined;

    try {
      const response = await fetch("/__nuxt-variants/devtools/data.json");

      if (!response.ok) {
        throw new Error(`DevTools data request failed with ${response.status}.`);
      }

      data.value = (await response.json()) as DevtoolsData;
      if (!data.value.variants.some((variant) => variant.name === selected.value)) {
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

  return {
    connected,
    currentVariant,
    data,
    error,
    pending,
    selected,
    reload: loadData,
  };
}
