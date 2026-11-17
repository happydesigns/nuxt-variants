<script setup lang="ts">
import { useVariantDevtoolsData } from "~/composables/useVariantDevtoolsData";

const { currentVariant, data, error, pending, reload, routeVariant, selected, transportLabel } =
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
  <UApp>
    <div class="shell">
      <DevtoolsSidebar
        v-model:selected="selected"
        :data="data"
        :route-variant="routeVariant"
        :pending="pending"
        :error="error"
      />

      <main>
        <div class="content">
          <LoadStatePanel
            :error="error"
            :pending="pending && data.variants.length === 0"
            @retry="reload"
          />

          <template v-if="!error && (!pending || data.variants.length > 0)">
            <header class="main-header">
              <div class="title-block">
                <h1>{{ currentVariant?.name ?? "Variant" }}</h1>
                <p>{{ currentVariantSummary }}</p>
              </div>

              <div class="header-meta">
                <div class="header-badges">
                  <UBadge color="neutral" variant="soft">{{ transportLabel }}</UBadge>
                  <UBadge color="neutral" variant="soft">
                    {{ currentVariant?.extends.length ?? 0 }}
                    extends
                  </UBadge>
                  <UBadge color="neutral" variant="soft">
                    {{ currentConfigKeyCount }}
                    {{ plural(currentConfigKeyCount, "config key") }}
                  </UBadge>
                  <UBadge :color="currentVariant?.active ? 'success' : 'warning'">
                    {{ currentVariant?.active ? "Enabled" : "Disabled" }}
                  </UBadge>
                  <UBadge v-if="data.diagnostics.length" color="warning" variant="soft">
                    {{ `${data.diagnostics.length} ${plural(data.diagnostics.length, "issue")}` }}
                  </UBadge>
                </div>

                <UButton
                  color="neutral"
                  variant="outline"
                  icon="i-lucide-refresh-cw"
                  :disabled="pending"
                  :loading="pending"
                  title="Refresh app-config overrides"
                  @click="reload"
                >
                  Refresh
                </UButton>
              </div>
            </header>

            <DiagnosticsPanel v-if="data.diagnostics.length" :diagnostics="data.diagnostics" />

            <VariantOverview :variant="currentVariant" />

            <section class="grid">
              <ConfigPanel
                title="Final Config"
                description="Resolved configuration after current overrides."
                :value="currentVariant?.resolvedConfig ?? {}"
              />
              <ConfigPanel
                title="Raw inputs"
                description="Registry defaults and current overrides before resolution."
                :value="{ base: currentVariant?.base, app: currentVariant?.app }"
              />
              <VariantSources class="grid-wide" :sources="currentVariant?.sources ?? []" />
            </section>
          </template>
        </div>
      </main>
    </div>
  </UApp>
</template>
