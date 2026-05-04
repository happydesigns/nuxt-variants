<script setup lang="ts">
import type { VariantEntry } from "~/types/devtools";

defineProps<{
  variant?: VariantEntry;
}>();
</script>

<template>
  <section class="panel">
    <div class="panel-head">
      <h2>{{ variant?.name ?? "Variant" }}</h2>
    </div>
    <div class="panel-body grid">
      <div>
        <h3>Extends</h3>
        <div class="chips">
          <span v-for="parent in variant?.extends ?? []" :key="parent" class="chip">
            {{ parent }}
          </span>
          <span v-if="!variant?.extends.length" class="empty">None</span>
        </div>
      </div>
      <div>
        <h3>Active Features</h3>
        <div class="chips">
          <span v-for="feature in variant?.activeFeatures ?? []" :key="feature" class="chip active">
            {{ feature }}
          </span>
          <span v-if="!variant?.activeFeatures.length" class="empty">None</span>
        </div>
      </div>
    </div>
  </section>
</template>
