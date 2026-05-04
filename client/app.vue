<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

interface VariantEntry {
  name: string;
  extends: string[];
  configKeys: string[];
  base: unknown;
  app: unknown;
  resolvedConfig: Record<string, unknown>;
  activeFeatures: string[];
}

interface VariantDiagnostic {
  message: string;
}

interface DevtoolsData {
  configKey: string;
  variants: VariantEntry[];
  graph: Record<string, string[]>;
  diagnostics: VariantDiagnostic[];
}

const data = ref<DevtoolsData>({
  configKey: "variants",
  variants: [],
  graph: {},
  diagnostics: [],
});
const pending = ref(true);
const error = ref<string>();
const selected = ref<string>();

const currentVariant = computed(() =>
  data.value.variants.find((variant) => variant.name === selected.value),
);

function format(value: unknown) {
  return JSON.stringify(value, null, 2);
}

async function loadData() {
  pending.value = true;
  error.value = undefined;

  try {
    const response = await fetch("/__nuxt-variants/devtools/data.json");

    if (!response.ok) {
      throw new Error(`DevTools data request failed with ${response.status}.`);
    }

    data.value = (await response.json()) as DevtoolsData;
    selected.value = data.value.variants[0]?.name;
  } catch (cause) {
    error.value = cause instanceof Error ? cause.message : "Failed to load DevTools data.";
  } finally {
    pending.value = false;
  }
}

onMounted(() => {
  void loadData();
});
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="header">
        <div class="eyebrow">Nuxt Variants</div>
        <h1>Variant graph</h1>
      </div>

      <div class="summary">
        <div class="metric">
          <strong>{{ data.variants.length }}</strong>
          <span>variants</span>
        </div>
        <div class="metric">
          <strong>{{ Object.keys(data.graph).length }}</strong>
          <span>graph nodes</span>
        </div>
        <div class="metric">
          <strong>{{ data.diagnostics.length }}</strong>
          <span>diagnostics</span>
        </div>
      </div>

      <div class="variant-list">
        <button
          v-for="variant in data.variants"
          :key="variant.name"
          class="variant-button"
          :class="{ active: variant.name === selected }"
          type="button"
          @click="selected = variant.name"
        >
          <span class="variant-name">
            <span>{{ variant.name }}</span>
            <span>{{ variant.extends.length }}</span>
          </span>
          <span class="variant-meta">{{ variant.configKeys.length }} config keys</span>
        </button>
      </div>
    </aside>

    <main>
      <div class="content">
        <div v-if="pending" class="panel">
          <div class="panel-body">
            <p class="empty">Loading variants...</p>
          </div>
        </div>

        <div v-else-if="error" class="panel">
          <div class="panel-body">
            <p class="diagnostic">{{ error }}</p>
          </div>
        </div>

        <template v-else>
          <div class="toolbar">
            <select v-model="selected" class="select" aria-label="Variant">
              <option v-for="variant in data.variants" :key="variant.name" :value="variant.name">
                {{ variant.name }}
              </option>
            </select>
          </div>

          <section class="panel">
            <div class="panel-head">
              <h2>{{ currentVariant?.name ?? "Variant" }}</h2>
            </div>
            <div class="panel-body grid">
              <div>
                <h3>Extends</h3>
                <div class="chips">
                  <span v-for="parent in currentVariant?.extends ?? []" :key="parent" class="chip">
                    {{ parent }}
                  </span>
                  <span v-if="!currentVariant?.extends.length" class="empty">None</span>
                </div>
              </div>
              <div>
                <h3>Active Features</h3>
                <div class="chips">
                  <span
                    v-for="feature in currentVariant?.activeFeatures ?? []"
                    :key="feature"
                    class="chip active"
                  >
                    {{ feature }}
                  </span>
                  <span v-if="!currentVariant?.activeFeatures.length" class="empty">None</span>
                </div>
              </div>
            </div>
          </section>

          <section class="grid">
            <div class="panel">
              <div class="panel-head">
                <h2>Resolved Config</h2>
              </div>
              <div class="panel-body">
                <pre>{{ format(currentVariant?.resolvedConfig ?? {}) }}</pre>
              </div>
            </div>
            <div class="panel">
              <div class="panel-head">
                <h2>Config Layers</h2>
              </div>
              <div class="panel-body">
                <pre>{{ format({ base: currentVariant?.base, app: currentVariant?.app }) }}</pre>
              </div>
            </div>
          </section>

          <section class="panel">
            <div class="panel-head">
              <h2>Diagnostics</h2>
            </div>
            <div class="panel-body">
              <p v-if="!data.diagnostics.length" class="empty">No diagnostics.</p>
              <div
                v-for="diagnostic in data.diagnostics"
                :key="diagnostic.message"
                class="diagnostic"
              >
                {{ diagnostic.message }}
              </div>
            </div>
          </section>
        </template>
      </div>
    </main>
  </div>
</template>
