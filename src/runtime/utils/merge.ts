import { createDefu, type DefuFn } from "defu";

export const defuReplaceArray: DefuFn = createDefu((obj, key, value) => {
  if (Array.isArray(obj[key]) || Array.isArray(value)) {
    obj[key] = value;
    return true;
  }
});
