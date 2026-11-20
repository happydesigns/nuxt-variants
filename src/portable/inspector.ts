import { fileURLToPath } from "node:url";

export const inspectorAssets = fileURLToPath(new URL("./client", import.meta.url));
