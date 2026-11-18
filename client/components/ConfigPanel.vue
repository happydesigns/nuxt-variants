<script setup lang="ts">
import { highlightJson } from "~/utils/json-highlighter";

const props = defineProps<{
  title: string;
  value: unknown;
}>();

const code = computed(() => JSON.stringify(props.value, null, 2));
const lines = computed(() => highlightJson(code.value));
const copyLabel = computed(() => `Copy ${props.title} as JSON`);
</script>

<template>
  <section class="min-w-0">
    <h3 class="text-sm font-medium text-muted">{{ title }}</h3>
    <ProsePre
      :code="code"
      language="json"
      :copy="{ 'aria-label': copyLabel, title: copyLabel }"
      :ui="{
        root: 'mt-2 mb-0',
        base: 'max-h-[32rem] scheme-light dark:scheme-dark',
        copy: 'lg:opacity-100',
      }"
      tabindex="0"
      :aria-label="title"
    >
      <code
        ><template v-for="(line, index) in lines" :key="index"
          ><span v-for="token in line" :key="token.offset" :style="token.htmlStyle">{{
            token.content
          }}</span
          >{{ index < lines.length - 1 ? "\n" : "" }}</template
        ></code
      >
    </ProsePre>
  </section>
</template>
