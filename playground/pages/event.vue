<template>
  <div>
    <h2>Event body</h2>
    <p>This page uses the <strong>event</strong> variant which extends <code>breadcrumbs</code> and <code>hero</code>.</p>
    <p>The hero is taller (<code>heroHeight: lg</code>), has an overlay, and is centre-aligned — all set in the <code>event</code> variant's own config overriding the base <code>hero</code> defaults.</p>
    <p>Because this variant does not extend <code>toc</code> or <code>sidebar</code>, neither of those panels is rendered by the shared layout.</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'content', variant: 'event' })
</script>
