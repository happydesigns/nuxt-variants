<script setup lang="ts">
import { MarkdownDocument } from "@comark/vue";

const { data: documents, error } = await useFetch("/api/editorial");
if (error.value) throw createError(error.value);

const selected = ref("/article");
const activeDocument = computed(() =>
  documents.value?.find((file) => file.path === selected.value),
);
const tabs = computed(() =>
  documents.value?.map(({ path, variant }) => ({
    label: variant === "article" ? "Article" : "Event",
    value: path,
  })),
);
const { config, features } = useVariant(() => activeDocument.value?.variant ?? "article");
</script>

<template>
  <UContainer as="main" class="max-w-3xl pb-12">
    <UPageHeader
      title="Editorial documents"
      description="Each Markdown document selects its variant in frontmatter. The page resolves the document’s features from the Nuxt registry and app config."
      :ui="{ root: 'py-8 sm:py-10' }"
    >
      <template #headline>
        <UButton to="/" color="neutral" variant="link" class="px-0">Playground</UButton>
      </template>
    </UPageHeader>

    <UTabs
      v-model="selected"
      :items="tabs"
      variant="link"
      aria-label="Editorial documents"
      class="mt-6"
    >
      <template #content>
        <UCard v-if="activeDocument" as="article">
          <template #header>
            <h2 class="text-xl font-semibold text-highlighted">{{ activeDocument.title }}</h2>
          </template>

          <MarkdownDocument :value="activeDocument" class="text-toned" />

          <template #footer>
            <dl class="grid gap-4 sm:grid-cols-[auto_1fr]">
              <dt class="text-sm font-medium">Applied features</dt>
              <dd class="flex flex-wrap gap-1.5">
                <UBadge
                  v-for="feature in features"
                  :key="feature"
                  color="neutral"
                  variant="soft"
                  class="font-mono"
                >
                  {{ feature }}
                </UBadge>
              </dd>
              <template v-if="config.tocTitle">
                <dt class="text-sm font-medium">Table of contents title</dt>
                <dd class="text-sm text-toned">{{ config.tocTitle }}</dd>
              </template>
            </dl>
          </template>
        </UCard>
      </template>
    </UTabs>
  </UContainer>
</template>
