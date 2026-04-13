import { calculateCRC } from "@/lib/checksum-calculator/crc";
import { getPresetByName } from "@/lib/checksum-calculator/presets";
import type {
  ModbusRequest,
  ModbusFrame,
  ModbusFrameField,
  ModbusFunctionCode,
} from "@/types/modbus-generator";

const FIELD_COLORS = {
  slaveAddress: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
  functionCode: "bg-green-500/20 text-green-700 dark:text-green-300",
  startAddress: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-300",
  quantity: "bg-purple-500/20 text-purple-700 dark:text-purple-300",
  writeValue: "bg-orange-500/20 text-orange-700 dark:text-orange-300",
  byteCount: "bg-pink-500/20 text-pink-700 dark:text-pink-300",
  crc: "bg-red-500/20 text-red-700 dark:text-red-300",
  mbapTxId: "bg-cyan-500/20 text-cyan-700 dark:text-cyan-300",
  mbapProtocol: "bg-teal-500/20 text-teal-700 dark:text-teal-300",
  mbapLength: "bg-indigo-500/20 text-indigo-700 dark:text-indigo-300",
  mbapUnit: "bg-blue-500/20 text-blue-700 dark:text-blue-300",
};

function toHexByte(value: number): string {
  return value.toString(16).toUpperCase().padStart(2, "0");
}

function toHexWord(value: number): string {
  return value.toString(16).toUpperCase().padStart(4, "0");
}

function isReadFunction(fc: ModbusFunctionCode): boolean {
  return fc === 1 || fc === 2 || fc === 3 || fc === 4;
}

function isSingleWriteFunction(fc: ModbusFunctionCode): boolean {
  return fc === 5 || fc === 6;
}

function buildPDU(request: ModbusRequest): Uint8Array {
  const { functionCode, startAddress, quantity, writeValues } = request;

  if (isReadFunction(functionCode)) {
    // Read: FC + StartAddr(2) + Quantity(2)
    return new Uint8Array([
      functionCode,
      (startAddress >> 8) & 0xff,
      startAddress & 0xff,
      (quantity >> 8) & 0xff,
      quantity & 0xff,
    ]);
  }

  if (isSingleWriteFunction(functionCode)) {
    // Write Single: FC + Addr(2) + Value(2)
    const value = functionCode === 5 ? (quantity ? 0xff00 : 0x0000) : quantity;
    return new Uint8Array([
      functionCode,
      (startAddress >> 8) & 0xff,
      startAddress & 0xff,
      (value >> 8) & 0xff,
      value & 0xff,
    ]);
  }

  if (functionCode === 15) {
    // Write Multiple Coils: FC + StartAddr(2) + Quantity(2) + ByteCount + Data
    const values = writeValues ?? [];
    const byteCount = Math.ceil(quantity / 8);
    const dataBytes = new Uint8Array(byteCount);
    for (let i = 0; i < quantity; i++) {
      if (values[i]) {
        dataBytes[Math.floor(i / 8)] |= 1 << (i % 8);
      }
    }
    const pdu = new Uint8Array(6 + byteCount);
    pdu[0] = functionCode;
    pdu[1] = (startAddress >> 8) & 0xff;
    pdu[2] = startAddress & 0xff;
    pdu[3] = (quantity >> 8) & 0xff;
    pdu[4] = quantity & 0xff;
    pdu[5] = byteCount;
    pdu.set(dataBytes, 6);
    return pdu;
  }

  if (functionCode === 16) {
    // Write Multiple Registers: FC + StartAddr(2) + Quantity(2) + ByteCount + Data
    const values = writeValues ?? [];
    const byteCount = quantity * 2;
    const pdu = new Uint8Array(6 + byteCount);
    pdu[0] = functionCode;
    pdu[1] = (startAddress >> 8) & 0xff;
    pdu[2] = startAddress & 0xff;
    pdu[3] = (quantity >> 8) & 0xff;
    pdu[4] = quantity & 0xff;
    pdu[5] = byteCount;
    for (let i = 0; i < quantity; i++) {
      const v = values[i] ?? 0;
      pdu[6 + i * 2] = (v >> 8) & 0xff;
      pdu[6 + i * 2 + 1] = v & 0xff;
    }
    return pdu;
  }

  return new Uint8Array([functionCode]);
}

function buildRTUFields(
  request: ModbusRequest,
  pdu: Uint8Array,
  crc: number
): ModbusFrameField[] {
  const { functionCode, startAddress, quantity, writeValues } = request;
  const fields: ModbusFrameField[] = [];

  fields.push({
    name: "从站地址",
    hex: toHexByte(request.slaveAddress),
    description: `从站地址: ${request.slaveAddress}`,
    color: FIELD_COLORS.slaveAddress,
  });

  fields.push({
    name: "功能码",
    hex: toHexByte(functionCode),
    description: `功能码: 0x${toHexByte(functionCode)}`,
    color: FIELD_COLORS.functionCode,
  });

  fields.push({
    name: "起始地址",
    hex: toHexWord(startAddress),
    description: `起始地址: 0x${toHexWord(startAddress)} (${startAddress})`,
    color: FIELD_COLORS.startAddress,
  });

  if (isReadFunction(functionCode)) {
    fields.push({
      name: "数量",
      hex: toHexWord(quantity),
      description: `数量: ${quantity}`,
      color: FIELD_COLORS.quantity,
    });
  } else if (functionCode === 5) {
    const value = quantity ? 0xff00 : 0x0000;
    fields.push({
      name: "写入值",
      hex: toHexWord(value),
      description: quantity ? "线圈 ON (0xFF00)" : "线圈 OFF (0x0000)",
      color: FIELD_COLORS.writeValue,
    });
  } else if (functionCode === 6) {
    fields.push({
      name: "写入值",
      hex: toHexWord(quantity),
      description: `写入值: ${quantity} (0x${toHexWord(quantity)})`,
      color: FIELD_COLORS.writeValue,
    });
  } else if (functionCode === 15 || functionCode === 16) {
    fields.push({
      name: "数量",
      hex: toHexWord(quantity),
      description: `数量: ${quantity}`,
      color: FIELD_COLORS.quantity,
    });

    const byteCount = pdu[5];
    fields.push({
      name: "字节数",
      hex: toHexByte(byteCount),
      description: `字节数: ${byteCount}`,
      color: FIELD_COLORS.byteCount,
    });

    const dataBytes = pdu.slice(6);
    const dataHex = Array.from(dataBytes)
      .map((b) => toHexByte(b))
      .join(" ");
    const values = writeValues ?? [];
    fields.push({
      name: "数据",
      hex: dataHex,
      description:
        functionCode === 16
          ? `写入值: [${values.slice(0, quantity).join(", ")}]`
          : `线圈数据: ${dataHex}`,
      color: FIELD_COLORS.writeValue,
    });
  }

  const crcLo = crc & 0xff;
  const crcHi = (crc >> 8) & 0xff;
  fields.push({
    name: "CRC",
    hex: `${toHexByte(crcLo)} ${toHexByte(crcHi)}`,
    description: `CRC-16/MODBUS: 0x${toHexWord(crc)}`,
    color: FIELD_COLORS.crc,
  });

  return fields;
}

function buildTCPFields(
  request: ModbusRequest,
  pdu: Uint8Array
): ModbusFrameField[] {
  const fields: ModbusFrameField[] = [];
  const length = pdu.length + 1; // PDU + Unit ID

  fields.push({
    name: "事务 ID",
    hex: "00 01",
    description: "事务标识符: 0x0001",
    color: FIELD_COLORS.mbapTxId,
  });

  fields.push({
    name: "协议 ID",
    hex: "00 00",
    description: "协议标识符: 0x0000 (Modbus)",
    color: FIELD_COLORS.mbapProtocol,
  });

  fields.push({
    name: "长度",
    hex: toHexWord(length),
    description: `后续字节数: ${length}`,
    color: FIELD_COLORS.mbapLength,
  });

  fields.push({
    name: "单元 ID",
    hex: toHexByte(request.slaveAddress),
    description: `单元标识符: ${request.slaveAddress}`,
    color: FIELD_COLORS.mbapUnit,
  });

  // Add PDU fields (same as RTU but without slave address and CRC)
  const rtuFields = buildRTUFields(
    request,
    pdu,
    0
  );
  // Skip slave address (first) and CRC (last)
  fields.push(...rtuFields.slice(1, -1));

  return fields;
}

export function generateModbusFrame(request: ModbusRequest): ModbusFrame {
  const pdu = buildPDU(request);

  // Build RTU frame: SlaveAddr + PDU + CRC
  const rtuWithoutCRC = new Uint8Array(1 + pdu.length);
  rtuWithoutCRC[0] = request.slaveAddress;
  rtuWithoutCRC.set(pdu, 1);

  const modbusPreset = getPresetByName("CRC-16/MODBUS")!;
  const crc = calculateCRC(rtuWithoutCRC, modbusPreset);
  const crcLo = crc & 0xff;
  const crcHi = (crc >> 8) & 0xff;

  const rtuFrame = new Uint8Array(rtuWithoutCRC.length + 2);
  rtuFrame.set(rtuWithoutCRC);
  rtuFrame[rtuFrame.length - 2] = crcLo;
  rtuFrame[rtuFrame.length - 1] = crcHi;

  // Build TCP frame: MBAP Header + PDU
  const mbapLength = pdu.length + 1;
  const tcpFrame = new Uint8Array(7 + pdu.length);
  tcpFrame[0] = 0x00; tcpFrame[1] = 0x01; // Transaction ID
  tcpFrame[2] = 0x00; tcpFrame[3] = 0x00; // Protocol ID
  tcpFrame[4] = (mbapLength >> 8) & 0xff;
  tcpFrame[5] = mbapLength & 0xff;
  tcpFrame[6] = request.slaveAddress;
  tcpFrame.set(pdu, 7);

  const rtuHex = Array.from(rtuFrame).map((b) => toHexByte(b)).join(" ");
  const tcpHex = Array.from(tcpFrame).map((b) => toHexByte(b)).join(" ");

  return {
    rtu: rtuHex,
    tcp: tcpHex,
    rtuFields: buildRTUFields(request, pdu, crc),
    tcpFields: buildTCPFields(request, pdu),
  };
}

export function getDefaultQuantity(fc: ModbusFunctionCode): number {
  if (isReadFunction(fc)) return 10;
  if (fc === 5) return 1; // ON
  if (fc === 6) return 0;
  if (fc === 15 || fc === 16) return 1;
  return 1;
}

export function getQuantityLabel(fc: ModbusFunctionCode): string {
  if (isReadFunction(fc)) return "数量";
  if (fc === 5) return "线圈值 (1=ON, 0=OFF)";
  if (fc === 6) return "写入值";
  if (fc === 15) return "线圈数量";
  if (fc === 16) return "寄存器数量";
  return "数量";
}

export function needsWriteValues(fc: ModbusFunctionCode): boolean {
  return fc === 15 || fc === 16;
}
