<script setup lang="ts">
import { useVariantDevtoolsData } from "~/composables/useVariantDevtoolsData";
const { currentVariant, data, error, pending, reload, routeVariant, selected, transportLabel } =
  useVariantDevtoolsData();
const heading = useTemplateRef("heading");
async function inspectRelative(name: string) {
  selected.value = name;
  await nextTick();
  heading.value?.focus();
}
const tabs = [
  { label: "Fields", slot: "fields", value: "fields" },
  { label: "Composition", slot: "composition", value: "composition" },
  { label: "JSON", slot: "json", value: "json" },
];
</script>
<template>
  <UApp>
    <UDashboardGroup unit="rem" :persistent="false" storage-key="composable-variants-inspector">
      <DevtoolsSidebar
        v-model:selected="selected"
        :entries="data.variants"
        :route-variant="routeVariant"
      />
      <UDashboardPanel id="inspector" role="main" :ui="{ body: 'gap-4 sm:gap-5' }">
        <template #header>
          <UDashboardNavbar
            :ui="{ left: 'min-w-0', title: 'min-w-0 font-mono', right: 'shrink-0' }"
          >
            <template #title>
              <span
                ref="heading"
                tabindex="-1"
                class="block truncate"
                :title="currentVariant?.name"
                >{{ currentVariant?.name ?? "Variants" }}</span
              >
            </template>
            <template #trailing>
              <UBadge
                v-if="currentVariant && !currentVariant.active"
                color="neutral"
                variant="subtle"
                size="sm"
                >Disabled</UBadge
              >
            </template>
            <template #right>
              <span v-if="transportLabel" class="text-xs text-muted">{{ transportLabel }}</span>
              <UButton
                color="neutral"
                variant="ghost"
                icon="i-lucide-refresh-cw"
                aria-label="Refresh registry"
                title="Refresh registry"
                :loading="pending"
                :disabled="pending"
                @click="reload"
              />
            </template>
          </UDashboardNavbar>
        </template>
        <template #body>
          <LoadStatePanel
            v-if="error || (pending && !currentVariant)"
            :error="error"
            :pending="pending"
            @retry="reload"
          />
          <template v-else>
            <DiagnosticsPanel v-if="data.diagnostics.length" :diagnostics="data.diagnostics" />
            <UTabs
              v-if="currentVariant"
              :items="tabs"
              variant="link"
              default-value="fields"
              size="md"
              :ui="{
                root: 'w-full min-w-0 items-stretch gap-4',
                list: 'justify-start',
                trigger: 'grow-0',
                content: 'w-full min-w-0',
              }"
            >
              <template #fields>
                <VariantFields
                  :key="currentVariant.name"
                  :variant="currentVariant"
                  :entries="data.variants"
                />
              </template>
              <template #composition>
                <VariantOverview
                  :variant="currentVariant"
                  :entries="data.variants"
                  @select="inspectRelative"
                />
              </template>
              <template #json>
                <div class="grid min-w-0 gap-5 xl:grid-cols-2">
                  <ConfigPanel title="Resolved config" :value="currentVariant.resolvedConfig" />
                  <ConfigPanel
                    title="Raw inputs"
                    :value="{ base: currentVariant.base, app: currentVariant.app }"
                  />
                </div>
              </template>
            </UTabs>
            <p v-else class="text-sm text-muted" role="status">No variants registered.</p>
          </template>
        </template>
      </UDashboardPanel>
    </UDashboardGroup>
  </UApp>
</template>
