import type { PIDPreset } from "@/types/pid-simulator";

export const PID_PRESETS: PIDPreset[] = [
  {
    name: "电机调速",
    description: "直流电机转速控制，一阶惯性模型",
    config: {
      kp: 2,
      ki: 0.5,
      kd: 0.1,
      plantModel: "first-order",
      plantParams: { tau: 0.1, gain: 1 },
      simulationTime: 5,
      samplePeriod: 10,
    },
  },
  {
    name: "温度控制",
    description: "加热系统温度调节，大惯性一阶系统",
    config: {
      kp: 5,
      ki: 0.1,
      kd: 1,
      plantModel: "first-order",
      plantParams: { tau: 10, gain: 1 },
      simulationTime: 30,
      samplePeriod: 50,
    },
  },
  {
    name: "平衡车",
    description: "倒立摆姿态控制，二阶振荡系统",
    config: {
      kp: 30,
      ki: 5,
      kd: 3,
      plantModel: "second-order",
      plantParams: { wn: 10, zeta: 0.1, gain: 1 },
      simulationTime: 5,
      samplePeriod: 10,
    },
  },
];
