<script setup lang="ts">
import { useVariantDevtoolsData } from "~/composables/useVariantDevtoolsData";
const { currentVariant, data, error, pending, reload, routeVariant, selected, offline } =
  useVariantDevtoolsData();
const heading = useTemplateRef("heading");
const details = useTemplateRef("details");
const hasComposition = computed(() => {
  const variant = currentVariant.value;
  return (
    !!variant &&
    (variant.extends.length > 0 || variant.activeFeatures.length > 1 || variant.sources.length > 0)
  );
});
const sectionLinks = computed(() => [
  { id: "variant-fields", label: "Fields" },
  ...(hasComposition.value ? [{ id: "variant-composition", label: "Composition" }] : []),
  { id: "variant-json", label: "JSON" },
]);
const activeSection = ref("variant-fields");

watch(selected, () => details.value?.scrollIntoView({ block: "start" }), { flush: "post" });

watch(
  [details, sectionLinks, selected],
  ([content, links], _, onCleanup) => {
    const scrollPanel = content?.parentElement;
    if (!content || !scrollPanel) return;
    const sections = links.flatMap(({ id }) => {
      const section = content.querySelector<HTMLElement>(`#${id}`);
      return section ? [section] : [];
    });
    const updateActiveSection = () => {
      const top = scrollPanel.getBoundingClientRect().top;
      const lastVisible = sections.findLast(
        (section) => section.getBoundingClientRect().top <= top + 32,
      );
      const atEnd =
        scrollPanel.scrollTop > 0 &&
        scrollPanel.scrollHeight - scrollPanel.clientHeight - scrollPanel.scrollTop <= 1;
      // A short section near the end may be visible without reaching the top.
      const focused = sections.find(
        (section) =>
          section === document.activeElement && section.getBoundingClientRect().top >= top,
      );
      activeSection.value =
        (atEnd ? (focused ?? sections.at(-1)) : (lastVisible ?? sections[0]))?.id ??
        "variant-fields";
    };
    const observer = new ResizeObserver(updateActiveSection);
    observer.observe(content);
    observer.observe(scrollPanel);
    scrollPanel.addEventListener("scroll", updateActiveSection, { passive: true });
    updateActiveSection();
    onCleanup(() => {
      observer.disconnect();
      scrollPanel.removeEventListener("scroll", updateActiveSection);
    });
  },
  { flush: "post" },
);

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
      <UDashboardPanel
        id="inspector"
        role="main"
        :ui="{ body: 'gap-4 [scrollbar-gutter:stable] sm:gap-5' }"
      >
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
          <UDashboardToolbar
            v-if="currentVariant && !error"
            as="nav"
            aria-label="Variant sections"
            class="min-h-10 justify-start gap-1 py-1"
          >
            <UButton
              v-for="section in sectionLinks"
              :key="section.id"
              :href="`#${section.id}`"
              :aria-current="activeSection === section.id ? 'location' : undefined"
              external
              color="neutral"
              variant="ghost"
              size="sm"
              class="border-b-2 border-transparent aria-[current=location]:border-primary aria-[current=location]:text-primary"
              @click="activeSection = section.id"
              >{{ section.label }}</UButton
            >
          </UDashboardToolbar>
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
                @select-source="inspectRelative"
              />
              <VariantOverview
                v-if="hasComposition"
                :variant="currentVariant"
                :entries="data.variants"
                @select="inspectRelative"
              />
              <UCard
                id="variant-json"
                :key="currentVariant.name"
                as="section"
                aria-labelledby="variant-json-heading"
                tabindex="-1"
                class="@container min-w-0 scroll-mt-4"
                :ui="{ header: 'px-3 py-2.5 sm:px-4', body: 'px-3 py-3 sm:px-4 sm:py-3' }"
              >
                <template #header>
                  <h2 id="variant-json-heading" class="text-base font-semibold text-highlighted">
                    JSON
                  </h2>
                </template>
                <div class="grid min-w-0 gap-4 @3xl:grid-cols-2">
                  <LazyConfigPanel title="Resolved config" :value="currentVariant.resolvedConfig" />
                  <LazyConfigPanel
                    title="Raw inputs"
                    :value="{ base: currentVariant.base, app: currentVariant.app }"
                  />
                </div>
              </UCard>
            </template>
            <p v-else class="text-sm text-muted" role="status">No variants registered.</p>
          </div>
        </template>
      </UDashboardPanel>
    </UDashboardGroup>
  </UApp>
</template>
