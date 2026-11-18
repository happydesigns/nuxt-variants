<script setup lang="ts">
const props = defineProps<{
  title: string;
  value: unknown;
}>();

const code = computed(() => JSON.stringify(props.value, null, 2));
const copyStatus = ref<"idle" | "copied" | "error">("idle");
let resetTimer: ReturnType<typeof setTimeout> | undefined;

const copyLabel = computed(() => {
  if (copyStatus.value === "copied") return "Copied";
  if (copyStatus.value === "error") return "Copy failed";
  return "Copy JSON";
});

async function copyCode() {
  if (resetTimer) clearTimeout(resetTimer);

  try {
    await navigator.clipboard.writeText(code.value);
    copyStatus.value = "copied";
  } catch {
    copyStatus.value = "error";
  }

  resetTimer = setTimeout(() => {
    copyStatus.value = "idle";
  }, 2000);
}

watch(code, () => {
  copyStatus.value = "idle";
});

onBeforeUnmount(() => {
  if (resetTimer) clearTimeout(resetTimer);
});
</script>

<template>
  <section class="min-w-0">
    <div class="mb-2 flex items-center justify-between gap-2">
      <h2 class="text-sm font-semibold text-highlighted">{{ title }}</h2>
      <UButton
        color="neutral"
        variant="outline"
        :title="`Copy ${title} as JSON`"
        :aria-label="copyStatus === 'idle' ? `Copy ${title} as JSON` : copyLabel"
        @click="copyCode"
      >
        <span aria-live="polite">{{ copyLabel }}</span>
      </UButton>
    </div>
    <pre
      class="overflow-auto rounded-lg border border-default bg-elevated/40 p-3 font-mono text-sm leading-6"
      tabindex="0"
      :aria-label="title"
    ><code>{{ code }}</code></pre>
  </section>
</template>
