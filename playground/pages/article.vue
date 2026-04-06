<template>
  <div>
    <h2>Article body</h2>
    <p>
      This page calls <code>useVariant('article')</code> with a <strong>literal string</strong>.
      TypeScript infers the return type as
      <code>ComputedRef&lt;Partial&lt;BreadcrumbsConfig &amp; HeroConfig &amp; TocConfig&gt;&gt;</code>
      — no cast needed.
    </p>
    <table>
      <tr><td><code>tocTitle</code></td><td>{{ config.tocTitle }}</td></tr>
      <tr><td><code>tocMaxDepth</code></td><td>{{ config.tocMaxDepth }}</td></tr>
      <tr><td><code>heroHeight</code></td><td>{{ config.heroHeight }}</td></tr>
      <tr><td><code>heroAlign</code></td><td>{{ config.heroAlign }}</td></tr>
      <tr><td><code>breadcrumbSeparator</code></td><td>{{ config.breadcrumbSeparator }}</td></tr>
    </table>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'content', variant: 'article' })

const config = useVariant('article')
</script>
