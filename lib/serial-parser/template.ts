import type { ProtocolField, ProtocolTemplate, FieldType, ChecksumMethod } from "@/types/serial-parser";

let fieldIdCounter = 0;

/**
 * Generate a unique field ID.
 */
export function generateFieldId(): string {
  fieldIdCounter++;
  return `field-${Date.now()}-${fieldIdCounter}`;
}

/**
 * Create a new field with default values.
 */
export function createField(overrides?: Partial<ProtocolField>): ProtocolField {
  return {
    id: generateFieldId(),
    name: "新字段",
    offset: 0,
    length: 1,
    type: "custom" as FieldType,
    ...overrides,
  };
}

/**
 * Create the default "Typical UART" template.
 */
export function createDefaultTemplate(): ProtocolTemplate {
  return {
    id: "default",
    name: "典型 UART 协议",
    createdAt: Date.now(),
    fields: [
      createField({
        name: "帧头",
        offset: 0,
        length: 2,
        type: "header" as FieldType,
        expectedValue: "AA55",
      }),
      createField({
        name: "数据长度",
        offset: 2,
        length: 1,
        type: "length" as FieldType,
      }),
      createField({
        name: "数据区",
        offset: 3,
        length: 3,
        type: "data" as FieldType,
      }),
      createField({
        name: "校验和",
        offset: 6,
        length: 1,
        type: "checksum" as FieldType,
        checksumMethod: "xor" as ChecksumMethod,
        checksumRange: [2, 6],
      }),
    ],
  };
}
