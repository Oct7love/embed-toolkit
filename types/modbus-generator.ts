export type ModbusFunctionCode = 1 | 2 | 3 | 4 | 5 | 6 | 15 | 16;

export interface ModbusRequest {
  slaveAddress: number;
  functionCode: ModbusFunctionCode;
  startAddress: number;
  quantity: number;
  writeValues?: number[];
}

export interface ModbusFrameField {
  name: string;
  hex: string;
  description: string;
  color: string;
}

export interface ModbusFrame {
  rtu: string;
  tcp: string;
  rtuFields: ModbusFrameField[];
  tcpFields: ModbusFrameField[];
}

export const FUNCTION_CODE_NAMES: Record<ModbusFunctionCode, string> = {
  1: "01 - 读线圈 (Read Coils)",
  2: "02 - 读离散输入 (Read Discrete Inputs)",
  3: "03 - 读保持寄存器 (Read Holding Registers)",
  4: "04 - 读输入寄存器 (Read Input Registers)",
  5: "05 - 写单个线圈 (Write Single Coil)",
  6: "06 - 写单个寄存器 (Write Single Register)",
  15: "0F - 写多个线圈 (Write Multiple Coils)",
  16: "10 - 写多个寄存器 (Write Multiple Registers)",
};
