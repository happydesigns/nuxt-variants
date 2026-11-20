import { useDevtoolsClient } from "@nuxt/devtools-kit/iframe-client";
import type { Router } from "vue-router";

/** Optional Nuxt host bridge; standalone and offline viewers have no router. */
export function useNuxtRouteVariant() {
  const client = useDevtoolsClient();
  return computed(() => {
    // DevTools v4 exposes host injections as unknown across the iframe bridge.
    const router = client.value?.host?.nuxt.$router as Router | undefined;
    const name = router?.currentRoute.value.meta.variant;
    return typeof name === "string" ? name : undefined;
  });
}
