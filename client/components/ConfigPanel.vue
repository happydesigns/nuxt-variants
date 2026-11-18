<script setup lang="ts">
import { highlightJson } from "~/utils/json-highlighter";

const props = defineProps<{
  filename: string;
  value: unknown;
  hideHeader?: boolean;
}>();

const code = computed(() => JSON.stringify(props.value, null, 2));
const lines = computed(() => highlightJson(code.value));
const copyLabel = computed(() => `Copy ${props.filename} as JSON`);
</script>

<template>
  <div class="min-w-0">
    <ProsePre
      :code="code"
      :filename="filename"
      :hide-header="hideHeader"
      language="json"
      :copy="{ 'aria-label': copyLabel, title: copyLabel }"
      :ui="{
        root: 'm-0 min-w-0',
        base: 'max-h-[32rem] rounded-none border-0 bg-elevated/40 -outline-offset-3 scheme-light dark:scheme-dark',
        copy: 'top-2 lg:opacity-100',
      }"
      tabindex="0"
      :aria-label="filename"
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
  </div>
</template>
