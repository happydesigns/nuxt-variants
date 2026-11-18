<script setup lang="ts">
import { useVariantDevtoolsData } from "~/composables/useVariantDevtoolsData";
const { currentVariant, data, error, pending, reload, routeVariant, selected, offline } =
  useVariantDevtoolsData();
const heading = useTemplateRef("heading");
const details = useTemplateRef("details");

watch(selected, () => details.value?.scrollIntoView({ block: "start" }), { flush: "post" });

async function inspectRelative(name: string) {
  selected.value = name;
  await nextTick();
  heading.value?.focus({ preventScroll: true });
}
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
              <span v-if="offline" class="text-xs text-muted">Offline snapshot</span>
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
          <div
            v-else
            ref="details"
            class="flex min-w-0 scroll-mt-4 flex-col gap-5 sm:scroll-mt-6 sm:gap-6"
          >
            <DiagnosticsPanel v-if="data.diagnostics.length" :diagnostics="data.diagnostics" />
            <template v-if="currentVariant">
              <VariantFields
                :key="currentVariant.name"
                :variant="currentVariant"
                :entries="data.variants"
              />
              <VariantOverview
                :variant="currentVariant"
                :entries="data.variants"
                @select="inspectRelative"
              />
              <section
                :key="currentVariant.name"
                aria-labelledby="variant-json"
                class="@container min-w-0 border-t border-default pt-5"
              >
                <h2 id="variant-json" class="mb-3 text-base font-semibold text-highlighted">
                  JSON
                </h2>
                <div class="grid min-w-0 gap-4 @3xl:grid-cols-2">
                  <LazyConfigPanel title="Resolved config" :value="currentVariant.resolvedConfig" />
                  <LazyConfigPanel
                    title="Raw inputs"
                    :value="{ base: currentVariant.base, app: currentVariant.app }"
                  />
                </div>
              </section>
            </template>
            <p v-else class="text-sm text-muted" role="status">No variants registered.</p>
          </div>
        </template>
      </UDashboardPanel>
    </UDashboardGroup>
  </UApp>
</template>
