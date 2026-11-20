import NuxtVariants, {
  VariantRegistryError,
  defineVariantRegistry,
  type ModuleOptions,
} from "@happydesigns/config-variants/nuxt";
import {
  createVariantSchemaResolver,
  defineVariantRegistry as defineSchemaVariantRegistry,
} from "@happydesigns/config-variants/schemas";

const registry = defineVariantRegistry({
  content: {},
  article: ["content"],
});

const schemaRegistry = defineSchemaVariantRegistry({
  content: {},
  article: ["content"],
});

const moduleOptions: ModuleOptions = {
  registry,
};

const error = new VariantRegistryError([]);

void NuxtVariants;
void createVariantSchemaResolver;
void error;
void moduleOptions;
void schemaRegistry;
