<script setup lang="ts">
const props = defineProps<{
  code: string;
}>();

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function tokenClass(token: string, index: number, code: string) {
  if (token.startsWith('"')) {
    return /^\s*:/.test(code.slice(index + token.length)) ? "json-key" : "json-string";
  }

  if (token === "true" || token === "false") {
    return "json-boolean";
  }

  if (token === "null") {
    return "json-null";
  }

  return "json-number";
}

function highlightJson(code: string) {
  const tokenPattern =
    /"(?:\\u[\da-fA-F]{4}|\\[^u]|[^\\"])*"|\btrue\b|\bfalse\b|\bnull\b|-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/g;
  let output = "";
  let lastIndex = 0;

  for (const match of code.matchAll(tokenPattern)) {
    const token = match[0];
    const index = match.index ?? 0;

    output += escapeHtml(code.slice(lastIndex, index));
    output += `<span class="${tokenClass(token, index, code)}">${escapeHtml(token)}</span>`;
    lastIndex = index + token.length;
  }

  output += escapeHtml(code.slice(lastIndex));

  return output;
}

const highlightedLines = computed(() => highlightJson(props.code).split("\n"));
</script>

<template>
  <pre class="json-code"><code><span
    v-for="(line, index) in highlightedLines"
    :key="index"
    class="json-line"
  ><span class="json-line-number">{{ index + 1 }}</span><span
    class="json-line-content"
    v-html="line || '&nbsp;'"
  /></span></code></pre>
</template>
