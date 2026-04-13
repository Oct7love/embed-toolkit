/** MQTT packet types (4-bit, values 1-15) */
export type MqttPacketType =
  | 1   // CONNECT
  | 2   // CONNACK
  | 3   // PUBLISH
  | 4   // PUBACK
  | 5   // PUBREC
  | 6   // PUBREL
  | 7   // PUBCOMP
  | 8   // SUBSCRIBE
  | 9   // SUBACK
  | 10  // UNSUBSCRIBE
  | 11  // UNSUBACK
  | 12  // PINGREQ
  | 13  // PINGRESP
  | 14; // DISCONNECT

export const MQTT_PACKET_TYPE_NAMES: Record<number, string> = {
  1:  "CONNECT",
  2:  "CONNACK",
  3:  "PUBLISH",
  4:  "PUBACK",
  5:  "PUBREC",
  6:  "PUBREL",
  7:  "PUBCOMP",
  8:  "SUBSCRIBE",
  9:  "SUBACK",
  10: "UNSUBSCRIBE",
  11: "UNSUBACK",
  12: "PINGREQ",
  13: "PINGRESP",
  14: "DISCONNECT",
};

/** QoS level */
export type QoSLevel = 0 | 1 | 2;

/** Fixed header parsed result */
export interface MqttFixedHeader {
  packetType: number;
  packetTypeName: string;
  dup: boolean;
  qos: QoSLevel;
  retain: boolean;
  remainingLength: number;
  /** Number of bytes used by the remaining length encoding */
  remainingLengthBytes: number;
  /** Raw byte of the first byte (type + flags) */
  rawByte: number;
}

/** A node in the parsed tree */
export interface MqttTreeNode {
  /** Display label */
  label: string;
  /** Hex representation of relevant bytes */
  hex?: string;
  /** Decoded value */
  value?: string;
  /** Color category */
  category: "fixed-header" | "variable-header" | "payload" | "error";
  /** Child nodes */
  children?: MqttTreeNode[];
  /** Byte range [start, end) for highlighting */
  byteRange?: [number, number];
}

/** Full MQTT parse result */
export interface MqttParseResult {
  /** Whether parsing succeeded */
  valid: boolean;
  /** Fixed header info */
  fixedHeader?: MqttFixedHeader;
  /** Tree representation */
  tree: MqttTreeNode[];
  /** Error messages */
  errors: string[];
  /** The parsed bytes breakdown for highlighting */
  segments: MqttByteSegment[];
}

/** A segment of bytes with color info for the highlighter */
export interface MqttByteSegment {
  bytes: number[];
  hex: string;
  label: string;
  category: "fixed-header" | "variable-header" | "payload" | "error";
}

/** Colors for MQTT categories */
export const MQTT_COLORS: Record<string, { bg: string; text: string; hex: string }> = {
  "fixed-header":    { bg: "bg-blue-500/20",   text: "text-blue-600 dark:text-blue-400",   hex: "#3B82F6" },
  "variable-header": { bg: "bg-orange-500/20", text: "text-orange-600 dark:text-orange-400", hex: "#F97316" },
  "payload":         { bg: "bg-green-500/20",  text: "text-green-600 dark:text-green-400",  hex: "#22C55E" },
  "error":           { bg: "bg-red-500/20",    text: "text-red-600 dark:text-red-400",      hex: "#EF4444" },
};
