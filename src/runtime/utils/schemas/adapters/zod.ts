import { createRequire } from "node:module";
import type { z } from "zod";
import type { SchemaAdapter } from "./types";

type ZodObj = z.ZodObject<z.ZodRawShape>;

const _require = createRequire(import.meta.url);

function getZod(): typeof z {
  try {
    return (_require("zod") as { z: typeof z }).z;
  } catch {
    throw new Error(
      "[nuxt-variants] Zod schema detected but zod is not installed. " + "Run: npm install zod",
    );
  }
}

export const zodAdapter: SchemaAdapter<ZodObj> = {
  emptyObject() {
    return getZod().object({});
  },

  merge(base, extra) {
    return base.extend(extra.shape);
  },
};
