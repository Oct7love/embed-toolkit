import type {
  MqttParseResult,
  MqttFixedHeader,
  MqttTreeNode,
  MqttByteSegment,
  QoSLevel,
} from "@/types/mqtt-parser";
import { MQTT_PACKET_TYPE_NAMES } from "@/types/mqtt-parser";
import { decodeRemainingLength, decodeMqttString, bytesToHexString } from "./utils";

/**
 * Parse an MQTT packet from raw bytes.
 */
export function parseMqttPacket(bytes: number[]): MqttParseResult {
  const errors: string[] = [];
  const tree: MqttTreeNode[] = [];
  const segments: MqttByteSegment[] = [];

  if (bytes.length === 0) {
    return { valid: false, tree: [], errors: ["输入数据为空"], segments: [] };
  }

  if (bytes.length < 2) {
    errors.push("数据长度不足，最少需要 2 字节");
    return { valid: false, tree: [], errors, segments: [] };
  }

  // Parse fixed header
  const fixedHeader = parseFixedHeader(bytes);
  if (!fixedHeader) {
    errors.push("无法解析固定头");
    return { valid: false, tree: [], errors, segments: [] };
  }

  const headerTotalBytes = 1 + fixedHeader.remainingLengthBytes;

  // Fixed header segment
  segments.push({
    bytes: bytes.slice(0, 1),
    hex: bytesToHexString(bytes.slice(0, 1)),
    label: "报文类型+标志",
    category: "fixed-header",
  });

  segments.push({
    bytes: bytes.slice(1, headerTotalBytes),
    hex: bytesToHexString(bytes.slice(1, headerTotalBytes)),
    label: "剩余长度",
    category: "fixed-header",
  });

  // Build fixed header tree
  const fixedHeaderNode: MqttTreeNode = {
    label: "固定头 (Fixed Header)",
    category: "fixed-header",
    byteRange: [0, headerTotalBytes],
    children: [
      {
        label: "报文类型",
        value: `${fixedHeader.packetTypeName} (${fixedHeader.packetType})`,
        hex: bytesToHexString([fixedHeader.rawByte]),
        category: "fixed-header",
      },
      {
        label: "DUP",
        value: fixedHeader.dup ? "1 (重发)" : "0",
        category: "fixed-header",
      },
      {
        label: "QoS",
        value: String(fixedHeader.qos),
        category: "fixed-header",
      },
      {
        label: "RETAIN",
        value: fixedHeader.retain ? "1 (保留)" : "0",
        category: "fixed-header",
      },
      {
        label: "剩余长度",
        value: `${fixedHeader.remainingLength} 字节 (${fixedHeader.remainingLengthBytes} 字节编码)`,
        hex: bytesToHexString(bytes.slice(1, headerTotalBytes)),
        category: "fixed-header",
      },
    ],
  };
  tree.push(fixedHeaderNode);

  // Validate packet type
  if (!MQTT_PACKET_TYPE_NAMES[fixedHeader.packetType]) {
    errors.push(`未知报文类型: ${fixedHeader.packetType}`);
  }

  // Validate remaining length
  const expectedTotal = headerTotalBytes + fixedHeader.remainingLength;
  if (bytes.length < expectedTotal) {
    errors.push(
      `数据不完整: 需要 ${expectedTotal} 字节, 实际 ${bytes.length} 字节`
    );
  }

  // Parse variable header + payload based on packet type
  const bodyBytes = bytes.slice(headerTotalBytes);
  const bodyOffset = headerTotalBytes;

  switch (fixedHeader.packetType) {
    case 1: // CONNECT
      parseConnect(bodyBytes, bodyOffset, tree, segments, errors);
      break;
    case 2: // CONNACK
      parseConnack(bodyBytes, bodyOffset, tree, segments, errors);
      break;
    case 3: // PUBLISH
      parsePublish(bodyBytes, bodyOffset, fixedHeader, tree, segments, errors);
      break;
    case 4: // PUBACK
    case 5: // PUBREC
    case 6: // PUBREL
    case 7: // PUBCOMP
      parsePacketIdOnly(bodyBytes, bodyOffset, fixedHeader.packetTypeName, tree, segments, errors);
      break;
    case 8: // SUBSCRIBE
      parseSubscribe(bodyBytes, bodyOffset, tree, segments, errors);
      break;
    case 9: // SUBACK
      parseSuback(bodyBytes, bodyOffset, tree, segments, errors);
      break;
    case 10: // UNSUBSCRIBE
      parseUnsubscribe(bodyBytes, bodyOffset, tree, segments, errors);
      break;
    case 11: // UNSUBACK
      parsePacketIdOnly(bodyBytes, bodyOffset, fixedHeader.packetTypeName, tree, segments, errors);
      break;
    case 12: // PINGREQ
    case 13: // PINGRESP
      // No variable header or payload
      break;
    case 14: // DISCONNECT
      // No variable header or payload
      break;
    default:
      if (bodyBytes.length > 0) {
        segments.push({
          bytes: bodyBytes,
          hex: bytesToHexString(bodyBytes),
          label: "未解析数据",
          category: "error",
        });
      }
  }

  return {
    valid: errors.length === 0,
    fixedHeader,
    tree,
    errors,
    segments,
  };
}

function parseFixedHeader(bytes: number[]): MqttFixedHeader | null {
  if (bytes.length < 2) return null;

  const firstByte = bytes[0];
  const packetType = (firstByte >> 4) & 0x0f;
  const dup = ((firstByte >> 3) & 0x01) === 1;
  const qos = ((firstByte >> 1) & 0x03) as QoSLevel;
  const retain = (firstByte & 0x01) === 1;

  const rl = decodeRemainingLength(bytes, 1);
  if (!rl) return null;

  return {
    packetType,
    packetTypeName: MQTT_PACKET_TYPE_NAMES[packetType] ?? `RESERVED(${packetType})`,
    dup,
    qos,
    retain,
    remainingLength: rl.value,
    remainingLengthBytes: rl.bytesUsed,
    rawByte: firstByte,
  };
}

function parseConnect(
  body: number[],
  baseOffset: number,
  tree: MqttTreeNode[],
  segments: MqttByteSegment[],
  errors: string[]
) {
  if (body.length < 10) {
    errors.push("CONNECT 报文可变头长度不足");
    return;
  }

  const varHeaderChildren: MqttTreeNode[] = [];

  // Protocol Name
  const protoName = decodeMqttString(body, 0);
  if (!protoName) {
    errors.push("无法解析协议名");
    return;
  }

  varHeaderChildren.push({
    label: "协议名",
    value: protoName.value,
    hex: bytesToHexString(body.slice(0, protoName.bytesConsumed)),
    category: "variable-header",
  });

  let pos = protoName.bytesConsumed;

  // Protocol Level
  if (pos >= body.length) { errors.push("数据不完整"); return; }
  const protocolLevel = body[pos];
  varHeaderChildren.push({
    label: "协议级别",
    value: protocolLevel === 4 ? "4 (MQTT 3.1.1)" : protocolLevel === 5 ? "5 (MQTT 5.0)" : String(protocolLevel),
    hex: bytesToHexString([body[pos]]),
    category: "variable-header",
  });
  pos++;

  // Connect Flags
  if (pos >= body.length) { errors.push("数据不完整"); return; }
  const flags = body[pos];
  const hasUsername = (flags & 0x80) !== 0;
  const hasPassword = (flags & 0x40) !== 0;
  const willRetain = (flags & 0x20) !== 0;
  const willQos = ((flags >> 3) & 0x03) as QoSLevel;
  const willFlag = (flags & 0x04) !== 0;
  const cleanSession = (flags & 0x02) !== 0;

  varHeaderChildren.push({
    label: "连接标志",
    hex: bytesToHexString([flags]),
    category: "variable-header",
    children: [
      { label: "Clean Session", value: cleanSession ? "1" : "0", category: "variable-header" },
      { label: "Will Flag", value: willFlag ? "1" : "0", category: "variable-header" },
      { label: "Will QoS", value: String(willQos), category: "variable-header" },
      { label: "Will Retain", value: willRetain ? "1" : "0", category: "variable-header" },
      { label: "Has Password", value: hasPassword ? "1" : "0", category: "variable-header" },
      { label: "Has Username", value: hasUsername ? "1" : "0", category: "variable-header" },
    ],
  });
  pos++;

  // Keep Alive
  if (pos + 1 >= body.length) { errors.push("数据不完整"); return; }
  const keepAlive = (body[pos] << 8) | body[pos + 1];
  varHeaderChildren.push({
    label: "Keep Alive",
    value: `${keepAlive} 秒`,
    hex: bytesToHexString(body.slice(pos, pos + 2)),
    category: "variable-header",
  });
  pos += 2;

  segments.push({
    bytes: body.slice(0, pos),
    hex: bytesToHexString(body.slice(0, pos)),
    label: "可变头",
    category: "variable-header",
  });

  tree.push({
    label: "可变头 (Variable Header)",
    category: "variable-header",
    byteRange: [baseOffset, baseOffset + pos],
    children: varHeaderChildren,
  });

  // Payload
  const payloadChildren: MqttTreeNode[] = [];

  // Client ID
  const clientId = decodeMqttString(body, pos);
  if (clientId) {
    payloadChildren.push({
      label: "Client ID",
      value: clientId.value || "(空)",
      category: "payload",
    });
    pos += clientId.bytesConsumed;
  }

  // Will Topic & Will Message
  if (willFlag) {
    const willTopic = decodeMqttString(body, pos);
    if (willTopic) {
      payloadChildren.push({ label: "Will Topic", value: willTopic.value, category: "payload" });
      pos += willTopic.bytesConsumed;
    }
    const willMessage = decodeMqttString(body, pos);
    if (willMessage) {
      payloadChildren.push({ label: "Will Message", value: willMessage.value, category: "payload" });
      pos += willMessage.bytesConsumed;
    }
  }

  // Username
  if (hasUsername) {
    const username = decodeMqttString(body, pos);
    if (username) {
      payloadChildren.push({ label: "Username", value: username.value, category: "payload" });
      pos += username.bytesConsumed;
    }
  }

  // Password
  if (hasPassword) {
    const password = decodeMqttString(body, pos);
    if (password) {
      payloadChildren.push({ label: "Password", value: password.value, category: "payload" });
      pos += password.bytesConsumed;
    }
  }

  if (payloadChildren.length > 0) {
    segments.push({
      bytes: body.slice(varHeaderChildren.length > 0 ? pos - (clientId?.bytesConsumed ?? 0) : pos, pos),
      hex: bytesToHexString(body.slice(pos - (clientId?.bytesConsumed ?? 0))),
      label: "有效载荷",
      category: "payload",
    });

    tree.push({
      label: "有效载荷 (Payload)",
      category: "payload",
      children: payloadChildren,
    });
  }
}

function parseConnack(
  body: number[],
  baseOffset: number,
  tree: MqttTreeNode[],
  segments: MqttByteSegment[],
  errors: string[]
) {
  if (body.length < 2) {
    errors.push("CONNACK 报文可变头长度不足");
    return;
  }

  const sessionPresent = (body[0] & 0x01) === 1;
  const returnCode = body[1];

  const returnCodeNames: Record<number, string> = {
    0: "连接已接受",
    1: "不可接受的协议版本",
    2: "标识符被拒绝",
    3: "服务器不可用",
    4: "用户名或密码错误",
    5: "未授权",
  };

  segments.push({
    bytes: body.slice(0, 2),
    hex: bytesToHexString(body.slice(0, 2)),
    label: "可变头",
    category: "variable-header",
  });

  tree.push({
    label: "可变头 (Variable Header)",
    category: "variable-header",
    byteRange: [baseOffset, baseOffset + 2],
    children: [
      {
        label: "Session Present",
        value: sessionPresent ? "1" : "0",
        hex: bytesToHexString([body[0]]),
        category: "variable-header",
      },
      {
        label: "返回码",
        value: `${returnCode} (${returnCodeNames[returnCode] ?? "未知"})`,
        hex: bytesToHexString([body[1]]),
        category: "variable-header",
      },
    ],
  });
}

function parsePublish(
  body: number[],
  baseOffset: number,
  fixedHeader: MqttFixedHeader,
  tree: MqttTreeNode[],
  segments: MqttByteSegment[],
  errors: string[]
) {
  let pos = 0;

  // Topic Name
  const topic = decodeMqttString(body, pos);
  if (!topic) {
    errors.push("无法解析 Topic 名称");
    return;
  }

  const varHeaderChildren: MqttTreeNode[] = [
    {
      label: "Topic 名称",
      value: topic.value,
      hex: bytesToHexString(body.slice(pos, pos + topic.bytesConsumed)),
      category: "variable-header",
    },
  ];
  pos += topic.bytesConsumed;

  // Packet Identifier (only for QoS 1 or 2)
  if (fixedHeader.qos > 0) {
    if (pos + 2 > body.length) {
      errors.push("PUBLISH 报文缺少 Packet Identifier");
      return;
    }
    const packetId = (body[pos] << 8) | body[pos + 1];
    varHeaderChildren.push({
      label: "Packet ID",
      value: String(packetId),
      hex: bytesToHexString(body.slice(pos, pos + 2)),
      category: "variable-header",
    });
    pos += 2;
  }

  segments.push({
    bytes: body.slice(0, pos),
    hex: bytesToHexString(body.slice(0, pos)),
    label: "可变头",
    category: "variable-header",
  });

  tree.push({
    label: "可变头 (Variable Header)",
    category: "variable-header",
    byteRange: [baseOffset, baseOffset + pos],
    children: varHeaderChildren,
  });

  // Payload
  if (pos < body.length) {
    const payloadBytes = body.slice(pos);
    let payloadStr: string;
    try {
      payloadStr = new TextDecoder("utf-8", { fatal: true }).decode(
        new Uint8Array(payloadBytes)
      );
    } catch {
      payloadStr = bytesToHexString(payloadBytes);
    }

    segments.push({
      bytes: payloadBytes,
      hex: bytesToHexString(payloadBytes),
      label: "有效载荷",
      category: "payload",
    });

    tree.push({
      label: "有效载荷 (Payload)",
      category: "payload",
      byteRange: [baseOffset + pos, baseOffset + body.length],
      children: [
        {
          label: "数据",
          value: payloadStr,
          hex: bytesToHexString(payloadBytes),
          category: "payload",
        },
      ],
    });
  }
}

function parsePacketIdOnly(
  body: number[],
  baseOffset: number,
  typeName: string,
  tree: MqttTreeNode[],
  segments: MqttByteSegment[],
  errors: string[]
) {
  if (body.length < 2) {
    errors.push(`${typeName} 报文缺少 Packet Identifier`);
    return;
  }
  const packetId = (body[0] << 8) | body[1];

  segments.push({
    bytes: body.slice(0, 2),
    hex: bytesToHexString(body.slice(0, 2)),
    label: "可变头",
    category: "variable-header",
  });

  tree.push({
    label: "可变头 (Variable Header)",
    category: "variable-header",
    byteRange: [baseOffset, baseOffset + 2],
    children: [
      {
        label: "Packet ID",
        value: String(packetId),
        hex: bytesToHexString(body.slice(0, 2)),
        category: "variable-header",
      },
    ],
  });
}

function parseSubscribe(
  body: number[],
  baseOffset: number,
  tree: MqttTreeNode[],
  segments: MqttByteSegment[],
  errors: string[]
) {
  if (body.length < 2) {
    errors.push("SUBSCRIBE 报文缺少 Packet Identifier");
    return;
  }

  const packetId = (body[0] << 8) | body[1];
  let pos = 2;

  segments.push({
    bytes: body.slice(0, 2),
    hex: bytesToHexString(body.slice(0, 2)),
    label: "可变头",
    category: "variable-header",
  });

  tree.push({
    label: "可变头 (Variable Header)",
    category: "variable-header",
    byteRange: [baseOffset, baseOffset + 2],
    children: [
      {
        label: "Packet ID",
        value: String(packetId),
        hex: bytesToHexString(body.slice(0, 2)),
        category: "variable-header",
      },
    ],
  });

  // Payload: topic filters + QoS
  const subscriptions: MqttTreeNode[] = [];
  let subIndex = 0;
  while (pos < body.length) {
    const topicFilter = decodeMqttString(body, pos);
    if (!topicFilter) {
      errors.push("无法解析 Topic Filter");
      break;
    }
    pos += topicFilter.bytesConsumed;

    if (pos >= body.length) {
      errors.push("缺少 QoS 字节");
      break;
    }
    const qos = body[pos] & 0x03;
    pos++;
    subIndex++;

    subscriptions.push({
      label: `订阅 #${subIndex}`,
      category: "payload",
      children: [
        { label: "Topic Filter", value: topicFilter.value, category: "payload" },
        { label: "QoS", value: String(qos), category: "payload" },
      ],
    });
  }

  if (subscriptions.length > 0) {
    segments.push({
      bytes: body.slice(2),
      hex: bytesToHexString(body.slice(2)),
      label: "有效载荷",
      category: "payload",
    });

    tree.push({
      label: "有效载荷 (Payload)",
      category: "payload",
      children: subscriptions,
    });
  }
}

function parseSuback(
  body: number[],
  baseOffset: number,
  tree: MqttTreeNode[],
  segments: MqttByteSegment[],
  errors: string[]
) {
  if (body.length < 2) {
    errors.push("SUBACK 报文缺少 Packet Identifier");
    return;
  }

  const packetId = (body[0] << 8) | body[1];

  segments.push({
    bytes: body.slice(0, 2),
    hex: bytesToHexString(body.slice(0, 2)),
    label: "可变头",
    category: "variable-header",
  });

  tree.push({
    label: "可变头 (Variable Header)",
    category: "variable-header",
    byteRange: [baseOffset, baseOffset + 2],
    children: [
      {
        label: "Packet ID",
        value: String(packetId),
        hex: bytesToHexString(body.slice(0, 2)),
        category: "variable-header",
      },
    ],
  });

  // Payload: return codes
  if (body.length > 2) {
    const returnCodes = body.slice(2);
    const rcNames: Record<number, string> = {
      0: "QoS 0",
      1: "QoS 1",
      2: "QoS 2",
      128: "Failure",
    };

    const rcChildren: MqttTreeNode[] = returnCodes.map((rc, i) => ({
      label: `返回码 #${i + 1}`,
      value: `${rc} (${rcNames[rc] ?? "未知"})`,
      hex: bytesToHexString([rc]),
      category: "payload" as const,
    }));

    segments.push({
      bytes: returnCodes,
      hex: bytesToHexString(returnCodes),
      label: "有效载荷",
      category: "payload",
    });

    tree.push({
      label: "有效载荷 (Payload)",
      category: "payload",
      children: rcChildren,
    });
  }
}

function parseUnsubscribe(
  body: number[],
  baseOffset: number,
  tree: MqttTreeNode[],
  segments: MqttByteSegment[],
  errors: string[]
) {
  if (body.length < 2) {
    errors.push("UNSUBSCRIBE 报文缺少 Packet Identifier");
    return;
  }

  const packetId = (body[0] << 8) | body[1];
  let pos = 2;

  segments.push({
    bytes: body.slice(0, 2),
    hex: bytesToHexString(body.slice(0, 2)),
    label: "可变头",
    category: "variable-header",
  });

  tree.push({
    label: "可变头 (Variable Header)",
    category: "variable-header",
    byteRange: [baseOffset, baseOffset + 2],
    children: [
      {
        label: "Packet ID",
        value: String(packetId),
        hex: bytesToHexString(body.slice(0, 2)),
        category: "variable-header",
      },
    ],
  });

  // Payload: topic filters
  const topics: MqttTreeNode[] = [];
  while (pos < body.length) {
    const topicFilter = decodeMqttString(body, pos);
    if (!topicFilter) {
      errors.push("无法解析 Topic Filter");
      break;
    }
    pos += topicFilter.bytesConsumed;
    topics.push({
      label: "Topic Filter",
      value: topicFilter.value,
      category: "payload",
    });
  }

  if (topics.length > 0) {
    segments.push({
      bytes: body.slice(2),
      hex: bytesToHexString(body.slice(2)),
      label: "有效载荷",
      category: "payload",
    });

    tree.push({
      label: "有效载荷 (Payload)",
      category: "payload",
      children: topics,
    });
  }
}
