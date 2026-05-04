<script setup lang="ts">
import { useVariantDevtoolsData } from "~/composables/useVariantDevtoolsData";

const { currentVariant, data, error, pending, selected } = useVariantDevtoolsData();

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

  return `Base variant with no parents. Final config has ${configText}.`;
});

const currentConfigKeyCount = computed(() =>
  currentVariant.value ? Object.keys(currentVariant.value.resolvedConfig).length : 0,
);
</script>

<template>
  <div class="shell">
    <DevtoolsSidebar v-model:selected="selected" :data="data" />

    <main>
      <div class="content">
        <LoadStatePanel :error="error" :pending="pending" />

        <template v-if="!pending && !error">
          <header class="main-header">
            <div class="title-block">
              <h1>{{ currentVariant?.name ?? "Variant" }}</h1>
              <p>{{ currentVariantSummary }}</p>
            </div>

            <div class="header-badges">
              <NBadge n="gray">
                {{ currentVariant?.extends.length ?? 0 }}
                {{ plural(currentVariant?.extends.length ?? 0, "parent") }}
              </NBadge>
              <NBadge n="gray">
                {{ currentConfigKeyCount }}
                {{ plural(currentConfigKeyCount, "config key") }}
              </NBadge>
              <NBadge v-if="data.diagnostics.length" n="orange">
                {{ `${data.diagnostics.length} ${plural(data.diagnostics.length, "issue")}` }}
              </NBadge>
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
              title="Source Layers"
              description="The module defaults and runtime app.config override before merging."
              :value="{ base: currentVariant?.base, app: currentVariant?.app }"
            />
          </section>
        </template>
      </div>
    </main>
  </div>
</template>
