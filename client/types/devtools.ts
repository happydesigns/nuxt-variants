export interface VariantEntry {
  name: string;
  extends: string[];
  configKeys: string[];
  base: unknown;
  app: unknown;
  resolvedConfig: Record<string, unknown>;
  activeFeatures: string[];
}

export interface VariantDiagnostic {
  message: string;
}

export interface DevtoolsData {
  configKey: string;
  variants: VariantEntry[];
  graph: Record<string, string[]>;
  diagnostics: VariantDiagnostic[];
}
