export type BitOperationType = "SET" | "CLR" | "TOGGLE" | "READ";

export type CodeStyle = "macro" | "inline";

export interface BitOperationConfig {
  registerName: string;
  selectedBits: number[];
  operation: BitOperationType;
  codeStyle: CodeStyle;
}

export interface GeneratedCode {
  code: string;
  language: string;
}
