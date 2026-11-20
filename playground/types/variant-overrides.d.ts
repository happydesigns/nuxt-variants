// oxlint-disable-next-line unicorn/require-module-specifiers -- Mark this file as a module so the declaration augments the existing Nuxt types.
export {};

declare module "#nuxt-variants" {
  interface CustomVariantOverrides {
    hero: {
      heroHeight: "sm" | "md" | "lg" | "xl";
      heroOverlay: boolean;
      heroAlign: "left" | "center" | "right";
    };
  }
}
