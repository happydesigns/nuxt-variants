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
          <header class="main-header">
            <div>
              <NIconTitle
                icon="i-carbon-network-3"
                :text="currentVariant?.name ?? 'Variant'"
                text-2xl
                font-700
              />
              <p mt2 text-sm op60>
                Resolved inheritance, feature composition, and app config overrides.
              </p>
            </div>

            <div class="header-badges">
              <NBadge n="green">
                {{ currentVariant?.activeFeatures.length ?? 0 }} active features
              </NBadge>
              <NBadge n="gray"> {{ currentVariant?.extends.length ?? 0 }} parents </NBadge>
              <NBadge :n="data.diagnostics.length ? 'orange' : 'green'">
                {{ data.diagnostics.length }} diagnostics
              </NBadge>
            </div>
          </header>

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
