<script setup lang="ts">
import { useVariantDevtoolsData } from "~/composables/useVariantDevtoolsData";

const { connected, currentVariant, data, error, pending, selected } = useVariantDevtoolsData();
</script>

<template>
  <div class="shell">
    <DevtoolsSidebar v-model:selected="selected" :connected="connected" :data="data" />

    <main>
      <div class="content">
        <LoadStatePanel :error="error" :pending="pending" />

        <template v-if="!pending && !error">
          <VariantToolbar v-model:selected="selected" :variants="data.variants" />

          <VariantOverview :variant="currentVariant" />

          <section class="grid">
            <ConfigPanel
              icon="i-carbon-code"
              title="Resolved Config"
              :value="currentVariant?.resolvedConfig ?? {}"
            />
            <ConfigPanel
              icon="i-carbon-layers"
              title="Config Layers"
              :value="{ base: currentVariant?.base, app: currentVariant?.app }"
            />
          </section>

          <DiagnosticsPanel :diagnostics="data.diagnostics" />
        </template>
      </div>
    </main>
  </div>
</template>
