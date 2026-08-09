<script setup lang="ts">
const props = defineProps<{
  title: string;
  description: string;
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
  <NCard>
    <div class="panel-head">
      <div class="panel-head-copy">
        <div>
          <h2>{{ title }}</h2>
          <p>{{ description }}</p>
        </div>
        <NButton border :title="`Copy ${title} as JSON`" @click="copyCode">
          {{ copyLabel }}
        </NButton>
      </div>
    </div>
    <div class="panel-body">
      <JsonCodeBlock :code="code" />
    </div>
  </NCard>
</template>
