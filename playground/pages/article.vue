<template>
  <div>
    <h2>Article body</h2>
    <p>This page uses the <strong>article</strong> variant which extends <code>breadcrumbs</code>, <code>hero</code>, and <code>toc</code>.</p>
    <p>The <code>tocMaxDepth</code> and <code>tocTitle</code> values are overridden at runtime via <code>app.config.ts</code>, demonstrating live config layering without a rebuild.</p>
    <p>Because this variant extends <code>toc</code>, the Table of Contents panel is rendered by the shared layout. Because it does <em>not</em> extend <code>sidebar</code>, the sidebar panel is absent.</p>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'content', variant: 'article' })
</script>
