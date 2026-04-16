import type {
  PIDConfig,
  PIDMetrics,
  PIDSimulationResult,
  SimPoint,
} from "@/types/pid-simulator";

/** 控制输出限幅范围 */
const OUTPUT_MIN = -1000;
const OUTPUT_MAX = 1000;

/**
 * 运行 PID 仿真
 *
 * 离散化 PID 控制器驱动给定系统模型，返回时间序列数据和性能指标。
 */
export function simulatePID(config: PIDConfig): PIDSimulationResult {
  const {
    kp,
    ki,
    kd,
    setpoint,
    initialValue,
    simulationTime,
    samplePeriod,
    plantModel,
    plantParams,
  } = config;

  const dt = samplePeriod / 1000; // ms → s
  const steps = Math.ceil(simulationTime / dt);
  const gain = plantParams.gain;

  const data: SimPoint[] = [];

  let processVariable = initialValue;
  let prevError = setpoint - initialValue;
  let integral = 0;

  // 二阶状态空间：y1 = 位置（输出），y2 = 速度
  let y1 = initialValue; // x1 (position / output)
  let y2 = 0;            // x2 (velocity)

  for (let i = 0; i <= steps; i++) {
    const time = i * dt;

    const error = setpoint - processVariable;

    // PID 控制器
    const P = kp * error;
    integral += ki * error * dt;
    const D = i === 0 ? 0 : kd * (error - prevError) / dt;
    let controlOutput = P + integral + D;

    // 限幅
    controlOutput = Math.max(OUTPUT_MIN, Math.min(OUTPUT_MAX, controlOutput));

    // 抗积分饱和：如果输出已饱和且积分项和误差同号，停止积分累加
    if (
      (controlOutput >= OUTPUT_MAX && ki * error > 0) ||
      (controlOutput <= OUTPUT_MIN && ki * error < 0)
    ) {
      integral -= ki * error * dt;
    }

    data.push({
      time: Math.round(time * 1e4) / 1e4, // 保留 4 位小数避免浮点漂移
      setpoint,
      processVariable,
      error,
      controlOutput,
    });

    // 更新系统模型（计算下一步 processVariable）
    const u = controlOutput;

    switch (plantModel) {
      case "first-order": {
        // 一阶惯性：H(s) = gain / (tau*s + 1)
        // 离散化（前向欧拉）：y[n+1] = y[n] + dt/tau * (gain*u - y[n])
        const tau = plantParams.tau ?? 1;
        processVariable =
          processVariable + (dt / tau) * (gain * u - processVariable);
        break;
      }
      case "second-order": {
        // 二阶振荡：H(s) = gain * wn^2 / (s^2 + 2*zeta*wn*s + wn^2)
        // 状态空间法：x1 = y, x2 = y'
        //   x1' = x2
        //   x2' = wn^2 * gain * u - 2*zeta*wn*x2 - wn^2*x1
        // 半隐式欧拉（先更新 x2 再更新 x1，数值稳定性更好）
        const wn = plantParams.wn ?? 10;
        const zeta = plantParams.zeta ?? 0.5;
        const wn2 = wn * wn;

        // y2 作为 x2（速度），y1 作为 x1（位置）
        const x2New = y2 + dt * (wn2 * gain * u - 2 * zeta * wn * y2 - wn2 * y1);
        const x1New = y1 + dt * x2New;

        y1 = x1New;
        y2 = x2New;
        processVariable = x1New;
        break;
      }
      case "integrator": {
        // 纯积分：H(s) = gain / s
        // 离散化：y[n+1] = y[n] + gain * u * dt
        processVariable = processVariable + gain * u * dt;
        break;
      }
    }

    // 非二阶模型：同步 y1（位置）= processVariable，y2（速度）= 0
    if (plantModel !== "second-order") {
      y1 = processVariable;
      y2 = 0;
    }

    prevError = error;
  }

  const metrics = calculateMetrics(data, setpoint);

  return { data, metrics };
}

/**
 * 从仿真数据中计算 PID 性能指标
 */
export function calculateMetrics(
  data: SimPoint[],
  setpoint: number
): PIDMetrics {
  if (data.length === 0) {
    return {
      riseTime: Infinity,
      overshoot: 0,
      settlingTime: Infinity,
      steadyStateError: 0,
    };
  }

  // setpoint=0 时用绝对阈值
  const absSetpoint = Math.abs(setpoint);
  const threshold90 = setpoint === 0 ? 0 : setpoint * 0.9;
  const tolerance = absSetpoint > 0 ? absSetpoint * 0.02 : 0.02; // ±2%（setpoint=0 时用绝对值 0.02）

  // 上升时间：首次达到 90% 目标值
  let riseTime = Infinity;
  for (const point of data) {
    if (
      (setpoint > 0 && point.processVariable >= threshold90) ||
      (setpoint < 0 && point.processVariable <= threshold90)
    ) {
      riseTime = point.time;
      break;
    }
  }

  // 超调量
  let maxValue: number;
  if (setpoint > 0) {
    maxValue = Math.max(...data.map((p) => p.processVariable));
  } else {
    maxValue = Math.min(...data.map((p) => p.processVariable));
  }
  const overshoot =
    absSetpoint > 0
      ? Math.max(0, ((Math.abs(maxValue) - absSetpoint) / absSetpoint) * 100)
      : Math.abs(maxValue) > tolerance
        ? Math.abs(maxValue) * 100 // setpoint=0 时用绝对值
        : 0;

  // 调节时间：最后一个偏离 ±2% 带的时刻之后的时间
  // 如果最终（最后一个点）仍在 ±2% 带外，视为未收敛 → Infinity
  let settlingTime = Infinity;
  const lastPoint = data[data.length - 1];
  const lastInBand = Math.abs(lastPoint.processVariable - setpoint) <= tolerance;

  if (lastInBand) {
    // 从末尾向前找最后一次偏离
    for (let i = data.length - 1; i >= 0; i--) {
      if (Math.abs(data[i].processVariable - setpoint) > tolerance) {
        // 进入 band 的时刻 = 下一个点
        settlingTime = i < data.length - 1 ? data[i + 1].time : lastPoint.time;
        break;
      }
    }
    // 如果一直在 band 内（包括初始就在范围）
    if (settlingTime === Infinity) {
      settlingTime = 0;
    }
  }
  // else: lastInBand = false → settlingTime stays Infinity（未收敛）

  // 稳态误差：最后 10% 数据点的平均误差
  const last10Count = Math.max(1, Math.floor(data.length * 0.1));
  const last10Points = data.slice(-last10Count);
  const steadyStateError =
    last10Points.reduce(
      (sum, p) => sum + Math.abs(p.processVariable - setpoint),
      0
    ) / last10Points.length;

  return { riseTime, overshoot, settlingTime, steadyStateError };
}
