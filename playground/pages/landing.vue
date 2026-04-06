<template>
  <div>
    <h2>Landing body</h2>
    <p>This page uses the <strong>landing</strong> variant which extends <code>hero</code> and <code>sidebar</code>.</p>
    <p>The sidebar is on the <strong>left</strong> (overriding the base <code>right</code> default) and is collapsible. The hero is the tallest (<code>heroHeight: xl</code>) with a dark overlay.</p>
    <p>Because this variant does not extend <code>breadcrumbs</code> or <code>toc</code>, neither of those panels is rendered by the shared layout.</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'content', variant: 'landing' })
</script>
