<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string;
    title?: string;
    description?: string;
  }>(),
  {
    eyebrow: "The mental model",
    title: "One layout can serve every page type.",
    description:
      "Nuxt Variants keeps app-specific decisions out of the layout file. Features stay small, page variants compose them, and the layout consumes one resolved result.",
  },
);
</script>

<template>
  <section>
    <UContainer class="py-16 sm:py-20">
      <div class="grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-14">
        <div>
          <p class="mb-3 text-sm font-semibold text-primary">{{ eyebrow }}</p>
          <h2 class="text-3xl font-semibold tracking-normal text-highlighted sm:text-4xl">
            {{ title }}
          </h2>
          <div class="mt-5 text-base leading-7 text-muted [&_p]:m-0">
            {{ description }}
          </div>
        </div>

        <div class="grid gap-4">
          <slot />
        </div>
      </div>
    </UContainer>
  </section>
</template>
