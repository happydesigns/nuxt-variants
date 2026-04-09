<script setup lang="ts">
const route = useRoute();

const variantName = computed(() => route.meta.variant ?? "unknown");
const pageTitle = computed(
  () => String(variantName.value).charAt(0).toUpperCase() + String(variantName.value).slice(1),
);

const { config, has } = useVariant(variantName);
const { config: tocConfig } = useVariant("toc");

const hasBreadcrumbs = has("breadcrumbs");
const hasHero = has("hero");
const hasToc = has("toc");
const hasSidebar = has("sidebar");

const heroHeights: Record<string, string> = {
  sm: "180px",
  md: "280px",
  lg: "380px",
  xl: "480px",
};
</script>

<template>
  <div class="min-h-screen bg-default flex flex-col">
    <!-- Top bar -->
    <div class="border-b border-default flex divide-x divide-default h-11 shrink-0">
      <NuxtLink
        to="/"
        class="flex items-center px-5 text-xs font-mono text-muted hover:text-highlighted hover:bg-muted transition-colors no-underline shrink-0"
      >
        ← variants
      </NuxtLink>
      <div class="flex items-center px-5 gap-1.5 shrink-0">
        <span class="font-mono text-xs text-muted">layout</span>
        <span class="text-muted text-xs">/</span>
        <span class="font-mono text-xs text-highlighted">content</span>
      </div>
      <div class="flex items-center px-5 gap-1.5">
        <span class="font-mono text-xs text-muted">variant</span>
        <span class="text-muted text-xs">/</span>
        <span class="font-mono text-xs text-primary font-semibold">{{ variantName }}</span>
      </div>
    </div>

    <!-- Breadcrumbs -->
    <div
      v-if="hasBreadcrumbs"
      class="border-b border-default px-5 py-2 flex items-center gap-1.5 font-mono text-xs bg-muted"
    >
      <span v-if="config.breadcrumbShowHome" class="text-muted">Home</span>
      <span class="text-dimmed">{{ config.breadcrumbSeparator }}</span>
      <span class="text-highlighted">{{ variantName }}</span>
    </div>

    <!-- Hero -->
    <div
      v-if="hasHero"
      class="border-b border-default relative overflow-hidden shrink-0 bg-terminal"
      :style="{ minHeight: heroHeights[config.heroHeight ?? 'md'] }"
    >
      <div
        class="absolute inset-0 bg-grid-dark"
        :style="{ opacity: config.heroOverlay ? 0.6 : 1 }"
      />
      <div
        class="relative flex flex-col justify-end p-8 h-full"
        :style="{
          minHeight: heroHeights[config.heroHeight ?? 'md'],
          alignItems:
            config.heroAlign === 'center'
              ? 'center'
              : config.heroAlign === 'right'
                ? 'flex-end'
                : 'flex-start',
        }"
      >
        <div :class="config.heroAlign === 'center' ? 'text-center' : ''">
          <p class="font-mono text-[10px] text-white/50 mb-2 uppercase tracking-widest m-0">
            height:{{ config.heroHeight }} &nbsp;·&nbsp; overlay:{{
              config.heroOverlay
            }}
            &nbsp;·&nbsp; align:{{ config.heroAlign }}
          </p>
          <slot name="hero-title">
            <h1 class="text-4xl font-bold text-white m-0 tracking-tight">{{ pageTitle }}</h1>
          </slot>
          <slot name="hero-subtitle" />
        </div>
      </div>
    </div>

    <!-- Body: sidebar | main | toc -->
    <div class="flex divide-x divide-default flex-1 min-h-64">
      <!-- Sidebar -->
      <aside
        v-if="hasSidebar"
        class="shrink-0 bg-muted flex flex-col"
        :style="{
          order: config.sidebarPosition === 'left' ? -1 : 1,
          width: `${config.sidebarWidth}px`,
        }"
      >
        <div class="border-b border-default px-5 py-3">
          <span class="font-mono text-[10px] text-muted uppercase tracking-widest">Sidebar</span>
        </div>
        <div class="p-5 flex flex-col gap-3">
          <div
            v-for="[k, v] in [
              ['position', config.sidebarPosition],
              ['width', `${config.sidebarWidth}px`],
              ['collapsible', config.sidebarCollapsible],
            ]"
            :key="k"
            class="flex items-center justify-between"
          >
            <span class="font-mono text-xs text-muted">{{ k }}</span>
            <span class="font-mono text-xs text-highlighted">{{ v }}</span>
          </div>
          <slot name="sidebar" />
        </div>
      </aside>

      <!-- Main -->
      <main class="flex-1 p-8 min-w-0">
        <slot />
      </main>

      <!-- TOC -->
      <aside
        v-if="hasToc"
        class="w-52 shrink-0 bg-muted flex flex-col"
        :style="{ position: config.tocSticky ? 'sticky' : 'static', top: 0 }"
      >
        <div class="border-b border-default px-5 py-3">
          <span class="font-mono text-[10px] text-muted uppercase tracking-widest">{{
            config.tocTitle
          }}</span>
        </div>
        <div class="p-5 flex flex-col gap-3">
          <div
            v-for="[k, v] in [
              ['maxDepth', config.tocMaxDepth],
              ['sticky', config.tocSticky],
            ]"
            :key="k"
            class="flex items-center justify-between"
          >
            <span class="font-mono text-xs text-muted">{{ k }}</span>
            <span class="font-mono text-xs text-highlighted">{{ v }}</span>
          </div>
          <div class="border-t border-default pt-3 flex flex-col gap-1.5 mt-1">
            <span class="font-mono text-xs text-muted">Introduction</span>
            <span class="font-mono text-xs text-muted">Section 1</span>
            <span v-if="(config.tocMaxDepth ?? 1) >= 2" class="font-mono text-xs text-dimmed pl-3"
              >↳ Subsection 1.1</span
            >
            <span v-if="(config.tocMaxDepth ?? 1) >= 3" class="font-mono text-xs text-dimmed pl-6"
              >↳ Deep 1.1.1</span
            >
            <span class="font-mono text-xs text-muted">Section 2</span>
          </div>
          <slot name="toc" />
        </div>
      </aside>
    </div>

    <!-- Debug panel -->
    <div class="border-t border-default bg-terminal shrink-0">
      <!-- Header row -->
      <div class="border-b border-white/10 flex divide-x divide-white/10">
        <div class="px-5 py-3 shrink-0">
          <span class="font-mono text-[10px] text-white/50 uppercase tracking-widest"
            >Resolved config</span
          >
        </div>
        <div class="px-5 py-3 flex items-center gap-2 flex-1">
          <span class="font-mono text-xs text-primary">{{ variantName }}</span>
        </div>
        <div class="px-5 py-3 flex items-center gap-2 shrink-0">
          <span class="font-mono text-[10px] text-white/50 uppercase tracking-widest mr-2"
            >flags</span
          >
          <span
            v-for="[name, active] in [
              ['breadcrumbs', hasBreadcrumbs],
              ['hero', hasHero],
              ['toc', hasToc],
              ['sidebar', hasSidebar],
            ]"
            :key="String(name)"
            :class="active ? 'text-success border-success/30' : 'text-white/40 border-white/10'"
            class="font-mono text-[10px] px-2 py-0.5 border rounded-sm ml-1"
          >
            {{ active ? "✓" : "✗" }} {{ name }}
          </span>
        </div>
      </div>

      <!-- Config rows -->
      <div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] divide-x divide-white/5">
        <div
          v-for="(value, key) in config"
          :key="key"
          class="flex items-center px-5 py-3 border-b border-white/5 hover:bg-white/5 transition-colors gap-4"
        >
          <span class="font-mono text-xs text-white/50 shrink-0 w-36">{{ key }}</span>
          <span class="font-mono text-xs text-white/85">{{ value }}</span>
        </div>
      </div>

      <!-- TOC defaults (if applicable) -->
      <template v-if="hasToc">
        <div class="border-t border-white/10 px-5 py-3">
          <span class="font-mono text-[10px] text-white/50 uppercase tracking-widest"
            >toc feature defaults</span
          >
        </div>
        <div class="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] divide-x divide-white/5">
          <div
            v-for="(value, key) in tocConfig"
            :key="key"
            class="flex items-center px-5 py-3 border-b border-white/5 hover:bg-white/5 transition-colors gap-4"
          >
            <span class="font-mono text-xs text-white/50 shrink-0 w-36">{{ key }}</span>
            <span class="font-mono text-xs text-white/85">{{ value }}</span>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
