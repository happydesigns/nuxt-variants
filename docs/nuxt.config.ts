export default defineNuxtConfig({
  extends: ["docus"],
  compatibilityDate: "latest",
  site: {
    name: "Nuxt Variants",
  },
  vite: {
    optimizeDeps: {
      include: [],
    },
  },
});
