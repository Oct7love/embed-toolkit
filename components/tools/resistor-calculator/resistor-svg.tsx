"use client";

import type { ColorName, BandCount } from "@/types/resistor-calculator";
import { getColorByName } from "@/lib/resistor-calculator";

interface ResistorSvgProps {
  bands: ColorName[];
  bandCount: BandCount;
}

/** 电阻外观 SVG 可视化 */
export function ResistorSvg({ bands, bandCount }: ResistorSvgProps) {
  // 电阻本体参数
  const bodyX = 80;
  const bodyY = 30;
  const bodyW = 240;
  const bodyH = 60;
  const bodyRx = 12;

  // 引脚
  const leadY = bodyY + bodyH / 2;

  // 色环位置
  const bandPositions = getBandPositions(bandCount, bodyX, bodyW);
  const bandWidth = 16;
  const bandHeight = bodyH - 4;

  return (
    <svg
      viewBox="0 0 400 120"
      className="w-full max-w-md mx-auto"
      role="img"
      aria-label="电阻色环图"
    >
      {/* 引脚 */}
      <line
        x1="10"
        y1={leadY}
        x2={bodyX}
        y2={leadY}
        stroke="currentColor"
        strokeWidth="3"
        className="text-muted-foreground"
      />
      <line
        x1={bodyX + bodyW}
        y1={leadY}
        x2="390"
        y2={leadY}
        stroke="currentColor"
        strokeWidth="3"
        className="text-muted-foreground"
      />

      {/* 电阻本体 */}
      <rect
        x={bodyX}
        y={bodyY}
        width={bodyW}
        height={bodyH}
        rx={bodyRx}
        className="fill-[#d4c5a9] dark:fill-[#8b7e6a]"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.3"
      />

      {/* 色环 */}
      {bandPositions.map((xPos, i) => {
        if (i >= bands.length) return null;
        const color = getColorByName(bands[i]);
        return (
          <g key={i}>
            <rect
              x={xPos - bandWidth / 2}
              y={bodyY + 2}
              width={bandWidth}
              height={bandHeight}
              rx={2}
              fill={color.hex}
              stroke={color.name === "black" ? "#444" : "rgba(0,0,0,0.2)"}
              strokeWidth="0.5"
            />
            {/* 色环标签 */}
            <text
              x={xPos}
              y={bodyY + bodyH + 16}
              textAnchor="middle"
              className="fill-muted-foreground text-[10px]"
            >
              {color.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/** 根据环数计算色环位置 */
function getBandPositions(
  bandCount: BandCount,
  bodyX: number,
  bodyW: number
): number[] {
  const margin = 30;
  const usableW = bodyW - margin * 2;

  if (bandCount === 4) {
    // 4 环：前3环紧凑，第4环（精度）右侧有间隔
    return [
      bodyX + margin + usableW * 0.1,
      bodyX + margin + usableW * 0.25,
      bodyX + margin + usableW * 0.4,
      bodyX + margin + usableW * 0.8,
    ];
  }
  if (bandCount === 5) {
    return [
      bodyX + margin + usableW * 0.08,
      bodyX + margin + usableW * 0.22,
      bodyX + margin + usableW * 0.36,
      bodyX + margin + usableW * 0.5,
      bodyX + margin + usableW * 0.82,
    ];
  }
  // 6 环
  return [
    bodyX + margin + usableW * 0.06,
    bodyX + margin + usableW * 0.19,
    bodyX + margin + usableW * 0.32,
    bodyX + margin + usableW * 0.45,
    bodyX + margin + usableW * 0.72,
    bodyX + margin + usableW * 0.88,
  ];
}
