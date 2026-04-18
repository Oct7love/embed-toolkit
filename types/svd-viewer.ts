/** CMSIS-SVD 解析后的内存数据结构（仅保留可视化所需字段） */

export interface SvdField {
  name: string;
  bitOffset: number;
  bitWidth: number;
  description?: string;
}

export interface SvdRegister {
  name: string;
  addressOffset: number;
  /** 寄存器复位值（如 SVD 未指定则为 0） */
  resetValue: number;
  /** 寄存器位宽，默认 32 */
  size: number;
  description?: string;
  fields: SvdField[];
}

export interface SvdPeripheral {
  name: string;
  baseAddress: number;
  description?: string;
  registers: SvdRegister[];
}

export interface SvdDevice {
  name: string;
  description?: string;
}

export interface SvdParsed {
  device: SvdDevice;
  peripherals: SvdPeripheral[];
}

/** 搜索命中：register 或 field 命中关键字 */
export interface SvdMatch {
  peripheralName: string;
  registerName: string;
  /** 命中的 field 名，若仅 register 名命中则为 null */
  fieldName: string | null;
}
