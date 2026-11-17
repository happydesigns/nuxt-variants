import type { VariantsDevtoolsRpcFunctions } from "../../src/devtools";

declare module "devframe" {
  interface DevframeRpcServerFunctions extends VariantsDevtoolsRpcFunctions {}
}
