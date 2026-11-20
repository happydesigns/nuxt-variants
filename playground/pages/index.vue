<template>
  <UContainer as="main" class="max-w-6xl pb-12">
    <UPageHeader
      title="Config Variants"
      description="See how Markdown documents and Nuxt routes select variants from a shared registry."
      :ui="{ root: 'py-8 sm:py-12' }"
    >
      <template #links>
        <UButton to="/editorial" label="Editorial documents" trailing-icon="i-lucide-arrow-right" />
      </template>
    </UPageHeader>

    <section aria-labelledby="route-examples" class="mt-8 space-y-4">
      <h2 id="route-examples" class="text-lg font-semibold text-highlighted">
        Nuxt route examples
      </h2>
      <UPageGrid>
        <UPageCard
          title="Article"
          description="Turn off the table of contents and see the change in the inspector."
          to="/article"
        />
        <UPageCard
          title="Event"
          description="Compare its features and app overrides with the article."
          to="/event"
        />
        <UPageCard
          title="Landing"
          description="See the same layout with a sidebar and a larger hero."
          to="/landing"
        />
      </UPageGrid>
      <UButton to="/blog" color="neutral" variant="link" class="px-0">
        Nuxt Content v3 schema example
      </UButton>
    </section>
  </UContainer>
</template>
