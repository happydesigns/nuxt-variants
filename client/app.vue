<script setup lang="ts">
import { useVariantDevtoolsData } from "~/composables/useVariantDevtoolsData";
const {
  currentVariant,
  data,
  error,
  pending,
  hasSnapshot,
  reload,
  routeVariant,
  selected,
  offline,
  linkedField,
  linkNotice,
} = useVariantDevtoolsData();
const heading = useTemplateRef("heading");
const details = useTemplateRef("details");
const sectionLinks = [
  { id: "variant-composition", label: "Composition" },
  { id: "variant-fields", label: "Fields" },
  { id: "variant-json", label: "Configuration" },
];
const activeSection = ref("variant-composition");
const overridesOnly = ref(false);
const refreshed = ref(false);
const refreshStatus = computed(() => {
  if (pending.value && hasSnapshot.value) return "Refreshing registry…";
  return refreshed.value ? "Registry refreshed" : "";
});
let refreshFeedback: ReturnType<typeof setTimeout> | undefined;

async function refreshRegistry() {
  if (pending.value) return;
  clearTimeout(refreshFeedback);
  refreshed.value = false;
  if (await reload()) {
    refreshed.value = true;
    refreshFeedback = setTimeout(() => (refreshed.value = false), 1600);
  }
}

onScopeDispose(() => clearTimeout(refreshFeedback));

watch(
  selected,
  () => {
    const target = linkedField.value
      ? details.value?.querySelector("#variant-fields")
      : details.value;
    target?.scrollIntoView({ block: "start" });
  },
  { flush: "post" },
);

watch(
  [details, selected],
  ([content], _, onCleanup) => {
    const scrollPanel = content?.parentElement;
    if (!content || !scrollPanel) return;
    const sections = sectionLinks.flatMap(({ id }) => {
      const section = content.querySelector<HTMLElement>(`#${id}`);
      return section ? [section] : [];
    });
    const updateActiveSection = () => {
      const top = scrollPanel.getBoundingClientRect().top;
      const activeElement = document.activeElement;
      const linkedRow = activeElement?.matches("tr[data-linked-field]")
        ? activeElement.getBoundingClientRect()
        : undefined;
      if (linkedRow && linkedRow.bottom > top && linkedRow.top < top + scrollPanel.clientHeight) {
        activeSection.value = "variant-fields";
        return;
      }
      const lastVisible = sections.findLast(
        (section) => section.getBoundingClientRect().top <= top + 32,
      );
      const atEnd =
        scrollPanel.scrollHeight - scrollPanel.clientHeight - scrollPanel.scrollTop <= 1;
      // A short section near the end may be visible without reaching the top.
      const focused = sections.find(
        (section) =>
          section.closest("section")?.contains(activeElement) &&
          section.getBoundingClientRect().top >= top,
      );
      activeSection.value =
        (
          (atEnd ? focused : undefined) ??
          (atEnd && scrollPanel.scrollTop > 0 ? sections.at(-1) : (lastVisible ?? sections[0]))
        )?.id ?? "variant-composition";
    };
    const observer = new ResizeObserver(updateActiveSection);
    observer.observe(content);
    observer.observe(scrollPanel);
    scrollPanel.addEventListener("scroll", updateActiveSection, { passive: true });
    scrollPanel.addEventListener("focusin", updateActiveSection);
    updateActiveSection();
    onCleanup(() => {
      observer.disconnect();
      scrollPanel.removeEventListener("scroll", updateActiveSection);
      scrollPanel.removeEventListener("focusin", updateActiveSection);
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
            class="overflow-y-hidden [scrollbar-gutter:stable]"
            :ui="{ left: 'min-w-0', title: 'min-w-0 font-mono text-lg', right: 'shrink-0' }"
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
                v-else-if="hasSnapshot"
                color="neutral"
                variant="ghost"
                :icon="refreshed ? 'i-lucide-check' : 'i-lucide-refresh-cw'"
                aria-label="Refresh registry"
                :aria-disabled="pending || undefined"
                :title="refreshStatus || 'Refresh registry'"
                class="cursor-pointer aria-disabled:cursor-pointer"
                :ui="{
                  leadingIcon: pending
                    ? 'motion-safe:animate-spin motion-safe:[animation-delay:150ms]'
                    : refreshed
                      ? 'text-primary'
                      : undefined,
                }"
                @click="refreshRegistry"
              />
              <span class="sr-only" role="status">{{ refreshStatus }}</span>
            </template>
          </UDashboardNavbar>
          <UDashboardToolbar
            v-if="currentVariant"
            as="nav"
            aria-label="Variant sections"
            class="min-h-10 items-stretch justify-start gap-1"
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
              class="rounded-none border-b-2 border-transparent aria-[current=location]:border-primary aria-[current=location]:text-primary"
              @click="activeSection = section.id"
              >{{ section.label }}</UButton
            >
          </UDashboardToolbar>
        </template>
        <template #body>
          <LoadStatePanel
            v-if="error || (pending && !hasSnapshot)"
            :error="error"
            :pending="pending"
            @retry="refreshRegistry"
          />
          <div
            v-if="hasSnapshot"
            ref="details"
            class="flex min-w-0 scroll-mt-4 flex-col gap-5 sm:scroll-mt-6 sm:gap-6"
          >
            <DiagnosticsPanel v-if="data.diagnostics.length" :diagnostics="data.diagnostics" />
            <p v-if="linkNotice" role="status" class="text-sm text-muted">{{ linkNotice }}</p>
            <template v-if="currentVariant">
              <VariantComposition
                :variant="currentVariant"
                :entries="data.variants"
                @select="inspectRelative"
              />
              <VariantFields
                :key="currentVariant.name"
                v-model:overrides-only="overridesOnly"
                :variant="currentVariant"
                :entries="data.variants"
                :linked-field="linkedField"
                @select-source="inspectRelative"
              />
              <VariantConfiguration :key="currentVariant.name" :variant="currentVariant" />
            </template>
            <p v-else class="text-sm text-muted" role="status">No variants registered.</p>
          </div>
        </template>
      </UDashboardPanel>
    </UDashboardGroup>
  </UApp>
</template>
