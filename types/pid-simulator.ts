/** PID 控制器配置 */
export interface PIDConfig {
  kp: number;
  ki: number;
  kd: number;
  setpoint: number;
  initialValue: number;
  simulationTime: number;
  /** 采样周期（毫秒） */
  samplePeriod: number;
  plantModel: PlantModel;
  plantParams: PlantParams;
}

export type PlantModel = "first-order" | "second-order" | "integrator";

export interface PlantParams {
  /** 一阶惯性时间常数 */
  tau?: number;
  /** 二阶振荡自然频率 */
  wn?: number;
  /** 二阶振荡阻尼比 */
  zeta?: number;
  /** 系统增益 */
  gain: number;
}

/** 仿真数据点 */
export interface SimPoint {
  time: number;
  setpoint: number;
  processVariable: number;
  error: number;
  controlOutput: number;
}

/** PID 性能指标 */
export interface PIDMetrics {
  /** 上升时间（秒）：首次达到 90% 目标值 */
  riseTime: number;
  /** 超调量（%）：(max - setpoint) / setpoint * 100 */
  overshoot: number;
  /** 调节时间（秒）：最后一次偏离 ±2% 目标值的时间 */
  settlingTime: number;
  /** 稳态误差：最后 10% 数据点的平均误差 */
  steadyStateError: number;
}

/** 仿真结果 */
export interface PIDSimulationResult {
  data: SimPoint[];
  metrics: PIDMetrics;
}

/** 预设配置 */
export interface PIDPreset {
  name: string;
  description: string;
  config: Partial<PIDConfig>;
}
