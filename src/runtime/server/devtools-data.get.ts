import { defineEventHandler, setHeader } from "h3";
import { useRuntimeConfig } from "#imports";

export default defineEventHandler((event) => {
  setHeader(event, "content-type", "application/json; charset=utf-8");
  return useRuntimeConfig(event).variantDevtoolsData ?? {};
});
