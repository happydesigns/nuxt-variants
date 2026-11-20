import { comarkContent } from "comark-content";
import { variantContent, variantField } from "../../../src/portable/content";
import { variantGroups, variantResolver } from "../../variant-groups";

export default defineCachedEventHandler(
  async () => {
    const assets = useStorage("assets:editorial");
    const readFile = async (key: string) => {
      const body = await assets.getItem(key);
      if (typeof body !== "string") throw new Error(`Missing editorial asset "${key}".`);
      return body;
    };
    const content = comarkContent("editorial", {
      source: {
        schema: {
          type: "object",
          properties: {
            title: { type: "string" },
            variant: variantField(variantGroups.editorial),
          },
        },
        keys: async () => (await assets.getKeys()).filter((key) => key.endsWith(".md")),
        getItem: readFile,
        getItemRaw: readFile,
      },
      plugins: [
        variantContent({ resolver: variantResolver, allowedVariants: variantGroups.editorial }),
      ],
      onError: "throw",
    });
    try {
      await content.init({ partial: false });
      const files = await content.list();
      return await Promise.all(
        files.map(async ({ path }) => {
          const file = await content.get(path);
          if (!file) throw new Error(`Missing editorial document "${path}".`);
          const title: unknown = file.data.title;
          if (typeof title !== "string") throw new Error(`Missing title in "${path}".`);
          return { path, title, variant: content.variantName(file), nodes: file.nodes };
        }),
      );
    } finally {
      await content.dispose();
    }
  },
  { maxAge: 300, shouldBypassCache: () => import.meta.dev },
);
