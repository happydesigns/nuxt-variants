import NuxtVariants, {
  VariantRegistryError,
  defineVariantRegistry,
  type ModuleOptions,
} from "@happydesigns/nuxt-variants";
import {
  createVariantSchemaResolver,
  defineVariantRegistry as defineSchemaVariantRegistry,
} from "@happydesigns/nuxt-variants/schemas";

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
