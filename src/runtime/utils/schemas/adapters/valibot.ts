import { createRequire } from "node:module";
import type * as v from "valibot";
import type { SchemaAdapter } from "./types";

type ValibotObj = v.ObjectSchema<v.ObjectEntries, undefined>;

const _require = createRequire(import.meta.url);

function getV(): typeof v {
  try {
    return _require("valibot") as typeof v;
  } catch {
    throw new Error(
      "[nuxt-content-traits] Valibot schema detected but valibot is not installed. " +
        "Run: npm install valibot",
    );
  }
}

export const valibotAdapter: SchemaAdapter<ValibotObj> = {
  emptyObject() {
    return getV().object({});
  },

  merge(base, extra) {
    return getV().object({ ...base.entries, ...extra.entries });
  },
};
