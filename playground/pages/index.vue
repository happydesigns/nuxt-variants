<script setup lang="ts">
const registry = useVariants();

type VariantEntry = ReturnType<typeof useVariants>["value"][number];

const features = computed(() => registry.value.filter((v: VariantEntry) => !v.extends.length));
const layouts = computed(() => registry.value.filter((v: VariantEntry) => v.extends.length > 0));
</script>

<template>
  <div class="min-h-screen bg-default flex flex-col">

    <!-- Hero -->
    <div class="border-b border-default py-24 px-8 flex flex-col items-center text-center gap-5">
      <div class="inline-flex items-center gap-2 border border-default rounded-full px-3 py-1 text-xs text-muted font-mono">
        <span class="size-1.5 rounded-full bg-success inline-block" />
        nuxt-variants playground
      </div>
      <h1 class="text-5xl font-bold text-highlighted tracking-tight m-0">
        Configuration<br />done right.
      </h1>
      <p class="text-muted text-sm max-w-sm leading-relaxed m-0">
        A centralized, deeply-merging configuration engine for Nuxt layouts.
      </p>
    </div>

    <!-- Features section -->
    <div class="border-b border-default">
      <div class="border-b border-default flex divide-x divide-default bg-muted">
        <div class="px-6 py-3 shrink-0">
          <span class="font-mono text-xs text-dimmed uppercase tracking-widest">Features</span>
        </div>
        <div class="px-6 py-3 text-xs text-muted flex-1">
          Base building blocks — no <code>extends</code>, just config defaults.
        </div>
      </div>
      <div class="grid grid-cols-[repeat(5,1fr)] divide-x divide-default bg-default">
        <div v-for="f in features" :key="f.name" class="p-6 flex flex-col gap-4">
          <span class="font-mono text-sm font-semibold text-highlighted capitalize">{{ f.name }}</span>
          <div class="flex flex-col gap-1.5">
            <span v-for="k in f.configKeys" :key="k" class="font-mono text-[11px] text-muted">{{ k }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Layout variants section -->
    <div class="border-b border-default">
      <div class="border-b border-default flex divide-x divide-default bg-muted">
        <div class="px-6 py-3 shrink-0">
          <span class="font-mono text-xs text-dimmed uppercase tracking-widest">Layout variants</span>
        </div>
        <div class="px-6 py-3 text-xs text-muted flex-1">
          Compose features and override config. Click to preview.
        </div>
      </div>
      <div class="grid grid-cols-[repeat(3,1fr)] divide-x divide-default bg-default">
        <NuxtLink
          v-for="v in layouts"
          :key="v.name"
          :to="`/${v.name}`"
          class="p-6 no-underline group hover:bg-muted transition-colors flex flex-col gap-4"
        >
          <div class="flex items-center justify-between">
            <span class="font-mono text-sm font-semibold text-highlighted capitalize group-hover:text-primary transition-colors">{{ v.name }}</span>
            <span class="text-dimmed group-hover:text-primary transition-colors">→</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="p in v.extends"
              :key="p"
              class="font-mono text-[11px] text-muted border border-default px-2 py-0.5 rounded-sm"
            >{{ p }}</span>
          </div>
        </NuxtLink>
      </div>
    </div>

    <!-- Schema merging section -->
    <div>
      <div class="border-b border-default flex divide-x divide-default bg-muted">
        <div class="px-6 py-3 shrink-0">
          <span class="font-mono text-xs text-dimmed uppercase tracking-widest">Schema merging</span>
        </div>
        <div class="px-6 py-3 text-xs text-muted flex-1">
          <code>mergeVariantSchemas</code> walks the inheritance graph at build time and produces a merged Zod schema for Nuxt Content v3.
        </div>
      </div>
      <div class="grid grid-cols-[1fr_auto] divide-x divide-default border-b border-default bg-default">
        <NuxtLink
          to="/blog"
          class="p-6 no-underline group hover:bg-muted transition-colors flex flex-col gap-3"
        >
          <div class="flex items-center justify-between">
            <span class="font-mono text-sm font-semibold text-highlighted group-hover:text-primary transition-colors">blog collection</span>
            <span class="text-dimmed group-hover:text-primary transition-colors">→</span>
          </div>
          <div class="flex gap-3 font-mono text-[11px] text-muted">
            <span>article → seo</span>
            <span class="text-dimmed">·</span>
            <span>seoTitle</span>
            <span class="text-dimmed">·</span>
            <span>authorName</span>
          </div>
        </NuxtLink>
        <div class="p-6 flex flex-col gap-2 w-64">
          <span class="font-mono text-[10px] text-dimmed uppercase tracking-widest">variant chain</span>
          <div class="flex items-center gap-2 font-mono text-xs">
            <span class="text-muted">article</span>
            <span class="text-dimmed">→</span>
            <span class="text-muted">seo</span>
          </div>
          <div class="flex items-center gap-2 font-mono text-xs text-dimmed mt-1">
            <span>SQLite-backed · Nuxt Content v3</span>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
