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
  <ProsePre
    :code="code"
    :filename="title"
    language="json"
    :copy="{ 'aria-label': copyLabel, title: copyLabel }"
    :ui="{
      root: 'm-0 min-w-0',
      header: 'min-h-11 pe-12',
      icon: 'hidden',
      filename: 'truncate',
      base: 'max-h-[32rem] scheme-light dark:scheme-dark',
      copy: 'top-2 lg:opacity-100',
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
</template>
