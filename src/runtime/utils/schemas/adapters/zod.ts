import { z } from "zod";
import type { SchemaAdapter } from "./types";

type ZodObj = z.ZodObject<z.ZodRawShape>;

export const zodAdapter: SchemaAdapter<ZodObj> = {
  emptyObject() {
    return z.object({});
  },

  merge(base, extra) {
    return base.extend(extra.shape);
  },
};
