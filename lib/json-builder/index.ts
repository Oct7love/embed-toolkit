import type { JsonField, JsonValueType } from "@/types/json-builder";

let fieldCounter = 0;

export function createFieldId(): string {
  fieldCounter += 1;
  return `field-${Date.now()}-${fieldCounter}`;
}

export function createDefaultField(type: JsonValueType = "string"): JsonField {
  return {
    id: createFieldId(),
    key: "",
    type,
    value: getDefaultValue(type),
    children: type === "object" || type === "array" ? [] : [],
  };
}

export function getDefaultValue(type: JsonValueType): string | number | boolean | null {
  switch (type) {
    case "string":
      return "";
    case "number":
      return 0;
    case "boolean":
      return false;
    case "null":
      return null;
    case "array":
    case "object":
      return null;
  }
}

function buildValue(field: JsonField): unknown {
  switch (field.type) {
    case "string":
      return String(field.value ?? "");
    case "number": {
      const num = Number(field.value);
      return isNaN(num) ? 0 : num;
    }
    case "boolean":
      return Boolean(field.value);
    case "null":
      return null;
    case "object": {
      const obj: Record<string, unknown> = {};
      for (const child of field.children) {
        const key = child.key || `field_${child.id.slice(-4)}`;
        obj[key] = buildValue(child);
      }
      return obj;
    }
    case "array":
      return field.children.map((child) => buildValue(child));
  }
}

export function fieldsToObject(fields: JsonField[]): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    const key = field.key || `field_${field.id.slice(-4)}`;
    result[key] = buildValue(field);
  }
  return result;
}

export function generateJson(fields: JsonField[], formatted: boolean): string {
  const obj = fieldsToObject(fields);
  return formatted ? JSON.stringify(obj, null, 2) : JSON.stringify(obj);
}

export function moveFieldUp(fields: JsonField[], index: number): JsonField[] {
  if (index <= 0 || index >= fields.length) return fields;
  const next = [...fields];
  const temp = next[index - 1];
  next[index - 1] = next[index];
  next[index] = temp;
  return next;
}

export function moveFieldDown(fields: JsonField[], index: number): JsonField[] {
  if (index < 0 || index >= fields.length - 1) return fields;
  const next = [...fields];
  const temp = next[index + 1];
  next[index + 1] = next[index];
  next[index] = temp;
  return next;
}

export function updateFieldInList(
  fields: JsonField[],
  fieldId: string,
  updater: (field: JsonField) => JsonField
): JsonField[] {
  return fields.map((f) => {
    if (f.id === fieldId) return updater(f);
    if (f.children.length > 0) {
      return { ...f, children: updateFieldInList(f.children, fieldId, updater) };
    }
    return f;
  });
}

export function removeFieldFromList(fields: JsonField[], fieldId: string): JsonField[] {
  return fields
    .filter((f) => f.id !== fieldId)
    .map((f) => ({
      ...f,
      children: removeFieldFromList(f.children, fieldId),
    }));
}

export function addChildToField(
  fields: JsonField[],
  parentId: string,
  child: JsonField
): JsonField[] {
  return fields.map((f) => {
    if (f.id === parentId) {
      return { ...f, children: [...f.children, child] };
    }
    if (f.children.length > 0) {
      return { ...f, children: addChildToField(f.children, parentId, child) };
    }
    return f;
  });
}

export function moveChildUp(
  fields: JsonField[],
  parentId: string,
  childIndex: number
): JsonField[] {
  return fields.map((f) => {
    if (f.id === parentId) {
      return { ...f, children: moveFieldUp(f.children, childIndex) };
    }
    if (f.children.length > 0) {
      return { ...f, children: moveChildUp(f.children, parentId, childIndex) };
    }
    return f;
  });
}

export function moveChildDown(
  fields: JsonField[],
  parentId: string,
  childIndex: number
): JsonField[] {
  return fields.map((f) => {
    if (f.id === parentId) {
      return { ...f, children: moveFieldDown(f.children, childIndex) };
    }
    if (f.children.length > 0) {
      return { ...f, children: moveChildDown(f.children, parentId, childIndex) };
    }
    return f;
  });
}
