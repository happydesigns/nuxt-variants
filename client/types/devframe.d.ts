import type { VariantsDevtoolsRpcFunctions } from "@happydesigns/composable-variants/devtools";

declare module "devframe" {
  interface DevframeRpcServerFunctions extends VariantsDevtoolsRpcFunctions {}
}
