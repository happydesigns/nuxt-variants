<template>
  <UPageSection
    :ui="{
      container: 'py-12 sm:py-16 lg:py-20 gap-10',
      title: 'text-3xl sm:text-5xl text-pretty tracking-tight font-bold text-highlighted',
      description: 'text-base sm:text-lg text-muted',
    }"
  >
    <div class="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
      <div>
        <p class="mb-3 text-sm font-semibold text-primary">
          <slot name="eyebrow" />
        </p>
        <h2 class="text-3xl font-bold tracking-tight text-highlighted sm:text-5xl">
          <slot name="title" />
        </h2>
        <div class="mt-5 text-base leading-7 text-muted [&_p]:m-0">
          <slot name="description" />
        </div>
      </div>

      <div class="grid gap-3">
        <slot />
      </div>
    </div>
  </UPageSection>
</template>
