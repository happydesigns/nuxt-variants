<template>
  <div>
    <h2>Event body</h2>
    <p>
      This page calls <code>useVariant('event')</code> with a <strong>literal string</strong>.
      TypeScript infers the return type as
      <code>ComputedRef&lt;Partial&lt;BreadcrumbsConfig &amp; HeroConfig&gt;&gt;</code>
      — no cast needed.
    </p>
    <table>
      <tr>
        <td><code>heroHeight</code></td>
        <td>{{ config.heroHeight }}</td>
      </tr>
      <tr>
        <td><code>heroOverlay</code></td>
        <td>{{ config.heroOverlay }}</td>
      </tr>
      <tr>
        <td><code>heroAlign</code></td>
        <td>{{ config.heroAlign }}</td>
      </tr>
      <tr>
        <td><code>breadcrumbSeparator</code></td>
        <td>{{ config.breadcrumbSeparator }}</td>
      </tr>
    </table>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "content", variant: "event" });

const config = useVariant("event");
</script>
