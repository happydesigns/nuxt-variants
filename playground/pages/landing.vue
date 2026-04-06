<template>
  <div>
    <h2>Landing body</h2>
    <p>
      This page calls <code>useVariant('landing')</code> with a <strong>literal string</strong>.
      TypeScript infers the return type as
      <code>ComputedRef&lt;Partial&lt;HeroConfig &amp; SidebarConfig&gt;&gt;</code>
      — no cast needed.
    </p>
    <table>
      <tr><td><code>heroHeight</code></td><td>{{ config.heroHeight }}</td></tr>
      <tr><td><code>heroOverlay</code></td><td>{{ config.heroOverlay }}</td></tr>
      <tr><td><code>sidebarPosition</code></td><td>{{ config.sidebarPosition }}</td></tr>
      <tr><td><code>sidebarWidth</code></td><td>{{ config.sidebarWidth }}</td></tr>
      <tr><td><code>sidebarCollapsible</code></td><td>{{ config.sidebarCollapsible }}</td></tr>
    </table>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'content', variant: 'landing' })

const config = useVariant('landing')
</script>
