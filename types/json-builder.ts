export type JsonValueType = "string" | "number" | "boolean" | "null" | "array" | "object";

export interface JsonField {
  id: string;
  key: string;
  type: JsonValueType;
  value: string | number | boolean | null;
  children: JsonField[];
}

export interface JsonTemplate {
  id: string;
  name: string;
  description: string;
  fields: JsonField[];
  createdAt: number;
}

export interface JsonBuilderStore {
  templates: JsonTemplate[];
  addTemplate: (template: JsonTemplate) => void;
  deleteTemplate: (id: string) => void;
  updateTemplate: (id: string, partial: Partial<JsonTemplate>) => void;
}
