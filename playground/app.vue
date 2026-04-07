<script setup lang="ts">
const { data: post } = await useAsyncData('hello-world', () =>
  queryCollection('blog').first(),
)

const articleVariant = useVariant('article')
</script>

<template>
  <div>
    <section>
      <h2>Build-time Content Schema (Nuxt Content v3)</h2>
      <p><strong>seoTitle:</strong> {{ post?.seoTitle }}</p>
      <p><strong>authorName:</strong> {{ post?.authorName }}</p>
    </section>

    <section>
      <h2>Runtime Variant Config (useVariant + app.config.ts override)</h2>
      <pre>{{ articleVariant }}</pre>
    </section>
  </div>
</template>
