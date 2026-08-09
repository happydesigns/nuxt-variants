import type { VariantDiagnostic as RuntimeVariantDiagnostic } from "../../src/runtime/utils/diagnostics";
import type {
  VariantDevtoolsData,
  VariantDevtoolsEntry,
  VariantSourceEntry,
} from "../../src/runtime/utils/devtools";

export type DevtoolsData = VariantDevtoolsData;
export type VariantDiagnostic = RuntimeVariantDiagnostic;
export type VariantEntry = VariantDevtoolsEntry;
export type VariantSource = VariantSourceEntry;
