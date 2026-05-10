<script setup lang="ts">
const outcomes = [
  {
    icon: "i-lucide-route",
    title: "Pages choose a name",
    description: [
      "Route meta selects ",
      { code: "article" },
      ", ",
      { code: "landing" },
      ", ",
      { code: "event" },
      ", or any variant your app owns.",
    ],
  },
  {
    icon: "i-lucide-git-merge",
    title: "The graph composes features",
    description: [
      { code: "extends" },
      " pulls in breadcrumbs, hero, SEO, sidebar, schemas, and local overrides.",
    ],
  },
  {
    icon: "i-lucide-panel-top",
    title: "Layouts consume one result",
    description: [
      { code: "useVariant" },
      " returns the merged config and feature checks for the current page.",
    ],
  },
];

const surfaces = [
  {
    icon: "i-lucide-layout-panel-left",
    title: "Layout behavior",
    description:
      "Switch hero size, breadcrumbs, sidebar placement, TOC, and editorial chrome without cloning layouts.",
  },
  {
    icon: "i-lucide-database",
    title: "Content schemas",
    description:
      "Keep Nuxt Content fields aligned with the same variant graph that powers rendering.",
  },
  {
    icon: "i-lucide-monitor-cog",
    title: "Debugging",
    description:
      "Inspect inheritance, config layers, resolved output, and diagnostics in Nuxt DevTools.",
  },
];

const guideLinks = [
  {
    label: "Install the module",
    to: "/docs/getting-started",
    icon: "i-lucide-rocket",
  },
  {
    label: "Understand the model",
    to: "/docs/concepts",
    icon: "i-lucide-book-open",
  },
  {
    label: "Reference the API",
    to: "/docs/api",
    icon: "i-lucide-code-xml",
  },
];
</script>

<template>
  <div class="overflow-hidden">
    <UPageHero
      headline="Typed layout variants for Nuxt"
      title="Modularize your Nuxt layouts."
      description="Define reusable layout capabilities once, compose them into named page variants, and let one Nuxt layout resolve the behavior each route needs."
      :ui="{
        container: 'py-12 sm:py-16 lg:py-20 gap-10',
        title:
          'text-5xl sm:text-7xl lg:text-8xl text-pretty tracking-tight font-bold text-highlighted',
        description: 'text-base sm:text-xl/8 text-muted max-w-3xl mx-auto',
        footer: 'mt-8',
      }"
    >
      <template #headline>
        <span
          class="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
        >
          <UIcon name="i-lucide-git-branch" class="size-4" />
          Typed layout variants for Nuxt
        </span>
      </template>

      <template #links>
        <UButton
          color="primary"
          size="xl"
          to="/docs/getting-started"
          trailing-icon="i-lucide-arrow-right"
        >
          Get started
        </UButton>

        <UButton
          color="neutral"
          icon="i-lucide-layout-template"
          size="xl"
          to="/docs/examples"
          variant="outline"
        >
          View examples
        </UButton>
      </template>

      <LandingWorkbench />
    </UPageHero>

    <UPageSection
      :ui="{
        container: 'py-12 sm:py-16 lg:py-20 gap-10',
        title: 'text-3xl sm:text-5xl text-pretty tracking-tight font-bold text-highlighted',
        description: 'text-base sm:text-lg text-muted',
      }"
    >
      <div class="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
        <div>
          <p class="mb-3 text-sm font-semibold text-primary">The mental model</p>
          <h2 class="text-3xl font-bold tracking-tight text-highlighted sm:text-5xl">
            A page variant is a composed feature set.
          </h2>
          <p class="mt-5 text-base leading-7 text-muted">
            Nuxt Variants keeps the app-specific decisions out of the layout file. The layout stays
            stable; page types carry the configuration.
          </p>
        </div>

        <div class="grid gap-3">
          <UPageFeature
            v-for="(outcome, index) in outcomes"
            :key="outcome.title"
            :icon="outcome.icon"
            orientation="horizontal"
            :ui="{
              root: 'rounded-xl border border-default bg-default p-4',
              leading:
                'flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-primary',
              leadingIcon: 'size-5',
              title: 'font-semibold text-highlighted',
              description: 'text-sm leading-6 text-muted',
            }"
          >
            <template #title>
              <span class="mr-2 text-xs font-medium text-muted">0{{ index + 1 }}</span>
              {{ outcome.title }}
            </template>

            <template #description>
              <span v-for="(part, partIndex) in outcome.description" :key="partIndex">
                <code
                  v-if="typeof part !== 'string'"
                  class="rounded-md border border-default bg-muted px-1.5 py-0.5 font-mono text-xs text-highlighted"
                >
                  {{ part.code }}
                </code>
                <template v-else>{{ part }}</template>
              </span>
            </template>
          </UPageFeature>
        </div>
      </div>
    </UPageSection>

    <UPageSection
      title="One graph, three places it pays off."
      description="The module stays deliberately small: it owns variant configuration and leaves rendering, styling, and content authoring to Nuxt."
      :features="surfaces"
      :ui="{
        container: 'py-12 sm:py-16 lg:py-20 gap-10',
        title: 'text-3xl sm:text-5xl text-pretty tracking-tight font-bold text-highlighted',
        description: 'text-base sm:text-lg text-muted max-w-3xl mx-auto',
        features:
          'mx-auto max-w-6xl gap-px overflow-hidden rounded-2xl border border-default bg-default sm:grid-cols-3 [&>*]:bg-muted/20 [&>*]:p-6',
      }"
    />

    <UPageSection
      :ui="{
        container: 'py-12 sm:py-16 lg:py-20 gap-8',
      }"
    >
      <div
        class="mx-auto flex max-w-5xl flex-col gap-6 rounded-2xl border border-default bg-default p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between"
      >
        <div>
          <p class="text-sm font-semibold text-primary">Next step</p>
          <h2 class="mt-2 text-2xl font-bold tracking-tight text-highlighted sm:text-3xl">
            Build the first variant graph in minutes.
          </h2>
        </div>

        <div class="grid gap-2 sm:grid-cols-3 lg:min-w-[520px]">
          <UButton
            v-for="link in guideLinks"
            :key="link.to"
            :to="link.to"
            :icon="link.icon"
            color="neutral"
            variant="subtle"
            size="lg"
            :label="link.label"
            trailing-icon="i-lucide-arrow-right"
            class="justify-between"
          />
        </div>
      </div>
    </UPageSection>
  </div>
</template>
