<script setup lang="ts">
const registry = useVariants();

type VariantEntry = ReturnType<typeof useVariants>["value"][number];

const features = computed(() => registry.value.filter((v: VariantEntry) => !v.extends.length));
const layouts = computed(() => registry.value.filter((v: VariantEntry) => v.extends.length > 0));
</script>

<template>
  <div class="min-h-screen bg-default flex flex-col">
    <section
      class="border-b border-default px-5 py-16 sm:px-8 sm:py-20 flex flex-col items-center text-center gap-5"
    >
      <div
        class="inline-flex items-center gap-2 border border-default rounded-full px-3 py-1 text-xs text-muted font-mono"
      >
        <span class="size-1.5 rounded-full bg-success inline-block" />
        Nuxt Variants playground
      </div>
      <h1 class="text-4xl sm:text-5xl font-bold text-highlighted tracking-tight m-0">
        One layout,<br />many page variants.
      </h1>
      <p class="text-muted text-sm max-w-xl leading-relaxed m-0">
        This playground shows feature composition, runtime app.config overrides, typed useVariant
        calls, and Nuxt Content schema merging in one small app.
      </p>
    </section>

    <section class="border-b border-default">
      <div
        class="border-b border-default flex flex-col sm:flex-row sm:divide-x divide-default bg-muted"
      >
        <div class="px-6 py-3 shrink-0">
          <span class="font-mono text-xs text-dimmed uppercase tracking-widest">Base features</span>
        </div>
        <div class="px-6 py-3 text-xs text-muted flex-1">
          Entries with no parents. They define reusable defaults in <code>nuxt.config.ts</code>.
        </div>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 border-b border-default">
        <div
          v-for="f in features"
          :key="f.name"
          class="p-6 flex flex-col gap-4 border-r border-b border-default last:border-r-0"
        >
          <span class="font-mono text-sm font-semibold text-highlighted capitalize">{{
            f.name
          }}</span>
          <div class="flex flex-col gap-1.5">
            <span v-for="k in f.configKeys" :key="k" class="font-mono text-[11px] text-muted">{{
              k
            }}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="border-b border-default">
      <div
        class="border-b border-default flex flex-col sm:flex-row sm:divide-x divide-default bg-muted"
      >
        <div class="px-6 py-3 shrink-0">
          <span class="font-mono text-xs text-dimmed uppercase tracking-widest"
            >Layout variants</span
          >
        </div>
        <div class="px-6 py-3 text-xs text-muted flex-1">
          Each route uses one shared content layout and changes behavior by choosing a variant.
        </div>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-3 border-b border-default">
        <NuxtLink
          v-for="v in layouts"
          :key="v.name"
          :to="`/${v.name}`"
          class="p-6 no-underline group hover:bg-muted transition-colors flex flex-col gap-4 border-r border-b border-default last:border-r-0"
        >
          <div class="flex items-center justify-between gap-4">
            <span
              class="font-mono text-sm font-semibold text-highlighted capitalize group-hover:text-primary transition-colors"
              >{{ v.name }}</span
            >
            <span class="text-dimmed group-hover:text-primary transition-colors">-&gt;</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <span
              v-for="p in v.extends"
              :key="p"
              class="font-mono text-[11px] text-muted border border-default px-2 py-0.5 rounded-sm"
              >{{ p }}</span
            >
          </div>
        </NuxtLink>
      </div>
    </section>

    <section>
      <div
        class="border-b border-default flex flex-col sm:flex-row sm:divide-x divide-default bg-muted"
      >
        <div class="px-6 py-3 shrink-0">
          <span class="font-mono text-xs text-dimmed uppercase tracking-widest"
            >Schema merging</span
          >
        </div>
        <div class="px-6 py-3 text-xs text-muted flex-1">
          <code>@happydesigns/nuxt-variants/schemas</code> reuses the graph for Nuxt Content v3.
        </div>
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-[1fr_18rem] border-b border-default">
        <NuxtLink
          to="/blog"
          class="p-6 no-underline group hover:bg-muted transition-colors flex flex-col gap-3 border-r border-default"
        >
          <div class="flex items-center justify-between gap-4">
            <span
              class="font-mono text-sm font-semibold text-highlighted group-hover:text-primary transition-colors"
              >blog collection</span
            >
            <span class="text-dimmed group-hover:text-primary transition-colors">-&gt;</span>
          </div>
          <div class="flex flex-wrap gap-3 font-mono text-[11px] text-muted">
            <span>article -&gt; seo</span>
            <span class="text-dimmed">|</span>
            <span>seoTitle</span>
            <span class="text-dimmed">|</span>
            <span>authorName</span>
          </div>
        </NuxtLink>
        <div class="p-6 flex flex-col gap-2">
          <span class="font-mono text-[10px] text-dimmed uppercase tracking-widest"
            >variant chain</span
          >
          <div class="flex items-center gap-2 font-mono text-xs">
            <span class="text-muted">article</span>
            <span class="text-dimmed">-&gt;</span>
            <span class="text-muted">seo</span>
          </div>
          <div class="flex items-center gap-2 font-mono text-xs text-dimmed mt-1">
            <span>SQLite-backed | Nuxt Content v3</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
