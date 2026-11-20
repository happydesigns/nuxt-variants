import type { VariantsDevtoolsRpcFunctions } from "@happydesigns/config-variants/devtools";

declare module "devframe" {
  interface DevframeRpcServerFunctions extends VariantsDevtoolsRpcFunctions {}
}
