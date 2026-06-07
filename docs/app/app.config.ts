export default defineAppConfig({
  docus: {
    locale: "en",
  },
  header: {
    title: "Nuxt Variants",
  },
  seo: {
    title: "Nuxt Variants",
    description: "Centralized, deeply merged layout variant configuration for Nuxt applications.",
  },
  github: {
    url: "https://github.com/happydesigns/nuxt-variants",
    branch: "main",
    rootDir: "docs",
  },
  socials: {
    github: "https://github.com/happydesigns/nuxt-variants",
    npm: "https://npmjs.com/package/@happydesigns/nuxt-variants",
  },
  toc: {
    title: "On this page",
  },
  ui: {
    pageHero: {
      slots: {
        container: "flex flex-col lg:grid !py-12 sm:!py-16 lg:!py-20 !gap-10 sm:!gap-y-12",
        headline: "mb-3",
        title:
          "text-4xl sm:text-5xl lg:text-6xl text-pretty tracking-normal font-semibold text-highlighted",
        description: "text-base sm:text-lg/8 text-muted",
        body: "!mt-10",
        footer: "!mt-10",
        links: "flex flex-wrap gap-3",
      },
    },
    pageSection: {
      slots: {
        root: "border-y border-default",
        container: "flex flex-col lg:grid !py-16 sm:!py-20 lg:!py-24 !gap-12",
        title: "text-3xl sm:text-4xl text-pretty tracking-normal font-semibold text-highlighted",
        description: "text-base sm:text-lg text-muted max-w-3xl mx-auto",
        body: "!mt-12",
        features:
          "mx-auto max-w-6xl !gap-4 sm:grid-cols-3 [&>*]:rounded-xl [&>*]:border [&>*]:border-default [&>*]:bg-muted/20 [&>*]:p-7",
      },
    },
    pageCTA: {
      slots: {
        root: "relative isolate mx-auto my-16 max-w-5xl rounded-xl overflow-hidden sm:my-20",
        container: "flex flex-col lg:grid !px-6 !py-12 sm:!px-10 sm:!py-14 !gap-10",
        title: "text-2xl sm:text-3xl text-pretty tracking-normal font-semibold text-highlighted",
        description: "text-base text-muted",
        footer: "!mt-8",
        links: "flex flex-wrap gap-3",
      },
    },
  },
});
