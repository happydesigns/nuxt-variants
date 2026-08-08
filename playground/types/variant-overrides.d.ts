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
