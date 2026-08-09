<script setup lang="ts">
import { useVariantDevtoolsData } from "~/composables/useVariantDevtoolsData";

const { currentVariant, data, error, pending, reload, routeVariant, selected } =
  useVariantDevtoolsData();

function plural(count: number, singular: string, pluralForm = `${singular}s`) {
  return count === 1 ? singular : pluralForm;
}

function formatList(values: string[]) {
  if (values.length === 0) {
    return "";
  }

  if (values.length === 1) {
    return values[0];
  }

  if (values.length === 2) {
    return `${values[0]} and ${values[1]}`;
  }

  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

const currentVariantSummary = computed(() => {
  const variant = currentVariant.value;

  if (!variant) {
    return "Select a variant to inspect how Nuxt Variants resolves it.";
  }

  const configCount = Object.keys(variant.resolvedConfig).length;
  const configText = `${configCount} config ${plural(configCount, "key")}`;

  if (variant.extends.length > 0) {
    return `Merges ${formatList(variant.extends)} before ${variant.name}. Final config has ${configText}.`;
  }

  return `Does not extend another variant. Final config has ${configText}.`;
});

const currentConfigKeyCount = computed(() =>
  currentVariant.value ? Object.keys(currentVariant.value.resolvedConfig).length : 0,
);
</script>

<template>
  <div class="shell">
    <DevtoolsSidebar v-model:selected="selected" :data="data" :route-variant="routeVariant" />

    <main>
      <div class="content">
        <LoadStatePanel :error="error" :pending="pending" @retry="reload" />

        <template v-if="!pending && !error">
          <header class="main-header">
            <div class="title-block">
              <h1>{{ currentVariant?.name ?? "Variant" }}</h1>
              <p>{{ currentVariantSummary }}</p>
            </div>

            <div class="header-meta">
              <div class="header-badges">
                <NBadge n="gray">
                  {{ currentVariant?.extends.length ?? 0 }}
                  extends
                </NBadge>
                <NBadge n="gray">
                  {{ currentConfigKeyCount }}
                  {{ plural(currentConfigKeyCount, "config key") }}
                </NBadge>
                <NBadge :n="currentVariant?.active ? 'green' : 'orange'">
                  {{ currentVariant?.active ? "Enabled" : "Disabled" }}
                </NBadge>
                <NBadge v-if="data.diagnostics.length" n="orange">
                  {{ `${data.diagnostics.length} ${plural(data.diagnostics.length, "issue")}` }}
                </NBadge>
              </div>

              <NButton
                border
                icon="i-carbon-renew"
                :disabled="pending"
                title="Refresh app-config overrides"
                @click="reload"
              >
                Refresh
              </NButton>
            </div>
          </header>

          <DiagnosticsPanel v-if="data.diagnostics.length" :diagnostics="data.diagnostics" />

          <VariantOverview :variant="currentVariant" />

          <section class="grid">
            <ConfigPanel
              title="Final Config"
              description="The object returned by useVariant for the selected variant."
              :value="currentVariant?.resolvedConfig ?? {}"
            />
            <ConfigPanel
              title="Raw inputs"
              description="The merged Nuxt registry entry and app.config override before resolution."
              :value="{ base: currentVariant?.base, app: currentVariant?.app }"
            />
            <VariantSources class="grid-wide" :sources="currentVariant?.sources ?? []" />
          </section>
        </template>
      </div>
    </main>
  </div>
</template>
