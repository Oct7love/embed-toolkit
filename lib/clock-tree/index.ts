/* ------------------------------------------------------------------ */
/*  Clock-Tree Configurator — Pure calculation functions & C codegen   */
/* ------------------------------------------------------------------ */

import type {
  ClockConfig,
  ClockConstraints,
  ClockFrequencies,
  ClockViolation,
  PllParams,
} from "@/types/clock-tree";
import { getConstraintsById } from "./constraints";

/* ======================== Frequency helpers ======================== */

export function formatFreq(hz: number): string {
  if (hz >= 1_000_000) return `${(hz / 1_000_000).toFixed(hz % 1_000_000 === 0 ? 0 : 1)} MHz`;
  if (hz >= 1_000) return `${(hz / 1_000).toFixed(hz % 1_000 === 0 ? 0 : 1)} kHz`;
  return `${hz} Hz`;
}

/* ======================== PLL output calc ========================= */

function calcPllOutput(pll: PllParams, hsi: number, hse: number): { input: number; output: number; error?: string } {
  const srcFreq = pll.pllSrc === "HSI" ? hsi : hse;
  if (srcFreq <= 0) return { input: 0, output: 0, error: "时钟源频率为 0" };

  switch (pll.type) {
    case "f1": {
      const input = pll.pllSrc === "HSI" ? srcFreq / 2 : srcFreq;
      if (pll.pllMul <= 0) return { input, output: 0, error: "PLLMUL 不能为 0" };
      return { input, output: input * pll.pllMul };
    }
    case "f4": {
      if (pll.pllM <= 0) return { input: 0, output: 0, error: "PLLM 不能为 0（除零）" };
      if (pll.pllP <= 0) return { input: 0, output: 0, error: "PLLP 不能为 0（除零）" };
      const vcoInput = srcFreq / pll.pllM;
      const vcoOutput = vcoInput * pll.pllN;
      return { input: vcoInput, output: vcoOutput / pll.pllP };
    }
    case "h7": {
      if (pll.divM <= 0) return { input: 0, output: 0, error: "DIVM 不能为 0（除零）" };
      if (pll.divP <= 0) return { input: 0, output: 0, error: "DIVP 不能为 0（除零）" };
      const ref = srcFreq / pll.divM;
      const vco = ref * pll.divN;
      return { input: ref, output: vco / pll.divP };
    }
  }
}

/* ================= Full frequency chain calculation ================ */

export function calculateFrequencies(config: ClockConfig): ClockFrequencies {
  const constraints = getConstraintsById(config.chipId);
  const hsi = constraints.hsiFreq;
  const hse = config.hseFreq;

  const { input: pllInput, output: pllOutput } = calcPllOutput(config.pll, hsi, hse);

  let sysclk: number;
  switch (config.sysclkSource) {
    case "HSI":
      sysclk = hsi;
      break;
    case "HSE":
      sysclk = hse;
      break;
    case "PLL":
      sysclk = pllOutput;
      break;
  }

  const ahb = sysclk / config.ahbDiv;
  const apb1 = ahb / config.apb1Div;
  const apb2 = ahb / config.apb2Div;

  return { hsi, hse, pllInput, pllOutput, sysclk, ahb, apb1, apb2 };
}

/* =================== Constraint violation check =================== */

export function checkViolations(
  freqs: ClockFrequencies,
  constraints: ClockConstraints
): ClockViolation[] {
  const violations: ClockViolation[] = [];

  if (freqs.sysclk > constraints.maxSysclk) {
    violations.push({
      node: "SYSCLK",
      actual: freqs.sysclk,
      max: constraints.maxSysclk,
      message: `SYSCLK ${formatFreq(freqs.sysclk)} 超出最大值 ${formatFreq(constraints.maxSysclk)}`,
    });
  }
  if (freqs.ahb > constraints.maxAhb) {
    violations.push({
      node: "AHB",
      actual: freqs.ahb,
      max: constraints.maxAhb,
      message: `AHB ${formatFreq(freqs.ahb)} 超出最大值 ${formatFreq(constraints.maxAhb)}`,
    });
  }
  if (freqs.apb1 > constraints.maxApb1) {
    violations.push({
      node: "APB1",
      actual: freqs.apb1,
      max: constraints.maxApb1,
      message: `APB1 ${formatFreq(freqs.apb1)} 超出最大值 ${formatFreq(constraints.maxApb1)}`,
    });
  }
  if (freqs.apb2 > constraints.maxApb2) {
    violations.push({
      node: "APB2",
      actual: freqs.apb2,
      max: constraints.maxApb2,
      message: `APB2 ${formatFreq(freqs.apb2)} 超出最大值 ${formatFreq(constraints.maxApb2)}`,
    });
  }

  return violations;
}

/* ==================== Default config factory ====================== */

export function createDefaultConfig(chipId: string): ClockConfig {
  const c = getConstraintsById(chipId);

  let pll: PllParams;
  switch (c.pllType) {
    case "f1":
      pll = { type: "f1", pllMul: 9, pllSrc: "HSE" };
      break;
    case "f4":
      pll = { type: "f4", pllM: 4, pllN: 168, pllP: 2, pllQ: 7, pllSrc: "HSE" };
      break;
    case "h7":
      pll = { type: "h7", divM: 5, divN: 192, divP: 2, pllSrc: "HSE" };
      break;
  }

  return {
    chipId,
    hseFreq: c.defaultHseFreq,
    sysclkSource: "PLL",
    pll,
    ahbDiv: 1,
    apb1Div: c.pllType === "f1" ? 2 : c.pllType === "f4" ? 4 : 2,
    apb2Div: c.pllType === "f4" ? 2 : 1,
  };
}

/* ======================== C code generation ======================== */

export function generateCode(config: ClockConfig, freqs: ClockFrequencies): string {
  const constraints = getConstraintsById(config.chipId);
  const lines: string[] = [];

  lines.push("/**");
  lines.push(` * System Clock Configuration — ${constraints.name}`);
  lines.push(` * SYSCLK = ${formatFreq(freqs.sysclk)}`);
  lines.push(` * AHB    = ${formatFreq(freqs.ahb)}`);
  lines.push(` * APB1   = ${formatFreq(freqs.apb1)}`);
  lines.push(` * APB2   = ${formatFreq(freqs.apb2)}`);
  lines.push(" * Generated by Embed Toolkit Clock Tree Configurator");
  lines.push(" */");
  lines.push("void SystemClock_Config(void)");
  lines.push("{");

  // ---------- RCC Oscillator init ----------
  lines.push("  RCC_OscInitTypeDef RCC_OscInitStruct = {0};");
  lines.push("  RCC_ClkInitTypeDef RCC_ClkInitStruct = {0};");
  lines.push("");

  // Oscillator sources
  const useHSE = config.sysclkSource === "HSE" || config.pll.pllSrc === "HSE";
  const useHSI = config.sysclkSource === "HSI" || config.pll.pllSrc === "HSI";

  const oscTypes: string[] = [];
  if (useHSE) oscTypes.push("RCC_OSCILLATORTYPE_HSE");
  if (useHSI) oscTypes.push("RCC_OSCILLATORTYPE_HSI");
  lines.push(`  RCC_OscInitStruct.OscillatorType = ${oscTypes.join(" | ")};`);

  if (useHSE) {
    lines.push("  RCC_OscInitStruct.HSEState = RCC_HSE_ON;");
  }
  if (useHSI) {
    lines.push("  RCC_OscInitStruct.HSIState = RCC_HSI_ON;");
    lines.push("  RCC_OscInitStruct.HSICalibrationValue = RCC_HSICALIBRATION_DEFAULT;");
  }

  // PLL config
  if (config.sysclkSource === "PLL") {
    lines.push("  RCC_OscInitStruct.PLL.PLLState = RCC_PLL_ON;");
    lines.push(
      `  RCC_OscInitStruct.PLL.PLLSource = ${config.pll.pllSrc === "HSE" ? "RCC_PLLSOURCE_HSE" : "RCC_PLLSOURCE_HSI"};`
    );

    switch (config.pll.type) {
      case "f1":
        lines.push(`  RCC_OscInitStruct.PLL.PLLMUL = RCC_PLL_MUL${config.pll.pllMul};`);
        break;
      case "f4":
        lines.push(`  RCC_OscInitStruct.PLL.PLLM = ${config.pll.pllM};`);
        lines.push(`  RCC_OscInitStruct.PLL.PLLN = ${config.pll.pllN};`);
        lines.push(`  RCC_OscInitStruct.PLL.PLLP = RCC_PLLP_DIV${config.pll.pllP};`);
        lines.push(`  RCC_OscInitStruct.PLL.PLLQ = ${config.pll.pllQ};`);
        break;
      case "h7":
        lines.push(`  RCC_OscInitStruct.PLL.PLLM = ${config.pll.divM};`);
        lines.push(`  RCC_OscInitStruct.PLL.PLLN = ${config.pll.divN};`);
        lines.push(`  RCC_OscInitStruct.PLL.PLLP = ${config.pll.divP};`);
        break;
    }
  } else {
    lines.push("  RCC_OscInitStruct.PLL.PLLState = RCC_PLL_NONE;");
  }

  lines.push("  HAL_RCC_OscConfig(&RCC_OscInitStruct);");
  lines.push("");

  // ---------- RCC Clock init ----------
  const clkTypes = ["RCC_CLOCKTYPE_SYSCLK", "RCC_CLOCKTYPE_HCLK", "RCC_CLOCKTYPE_PCLK1", "RCC_CLOCKTYPE_PCLK2"];
  lines.push(`  RCC_ClkInitStruct.ClockType = ${clkTypes.join(" | ")};`);

  const sysclkSrcMap: Record<string, string> = {
    HSI: "RCC_SYSCLKSOURCE_HSI",
    HSE: "RCC_SYSCLKSOURCE_HSE",
    PLL: "RCC_SYSCLKSOURCE_PLLCLK",
  };
  lines.push(`  RCC_ClkInitStruct.SYSCLKSource = ${sysclkSrcMap[config.sysclkSource]};`);

  const ahbDivMap: Record<number, string> = {
    1: "RCC_SYSCLK_DIV1",
    2: "RCC_SYSCLK_DIV2",
    4: "RCC_SYSCLK_DIV4",
    8: "RCC_SYSCLK_DIV8",
    16: "RCC_SYSCLK_DIV16",
    64: "RCC_SYSCLK_DIV64",
    128: "RCC_SYSCLK_DIV128",
    256: "RCC_SYSCLK_DIV256",
    512: "RCC_SYSCLK_DIV512",
  };
  lines.push(`  RCC_ClkInitStruct.AHBCLKDivider = ${ahbDivMap[config.ahbDiv] ?? "RCC_SYSCLK_DIV1"};`);

  const apbDivMap: Record<number, string> = {
    1: "RCC_HCLK_DIV1",
    2: "RCC_HCLK_DIV2",
    4: "RCC_HCLK_DIV4",
    8: "RCC_HCLK_DIV8",
    16: "RCC_HCLK_DIV16",
  };
  lines.push(`  RCC_ClkInitStruct.APB1CLKDivider = ${apbDivMap[config.apb1Div] ?? "RCC_HCLK_DIV1"};`);
  lines.push(`  RCC_ClkInitStruct.APB2CLKDivider = ${apbDivMap[config.apb2Div] ?? "RCC_HCLK_DIV1"};`);
  lines.push("");

  // Flash latency
  const latency = freqs.ahb <= 24_000_000 ? 0 : freqs.ahb <= 48_000_000 ? 1 : freqs.ahb <= 72_000_000 ? 2 : freqs.ahb <= 100_000_000 ? 3 : freqs.ahb <= 150_000_000 ? 4 : freqs.ahb <= 200_000_000 ? 5 : freqs.ahb <= 250_000_000 ? 6 : 7;
  lines.push(`  HAL_RCC_ClockConfig(&RCC_ClkInitStruct, FLASH_LATENCY_${latency});`);

  lines.push("}");
  return lines.join("\n");
}
