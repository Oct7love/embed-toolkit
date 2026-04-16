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

  // 二阶模型需要保存前两步状态
  let y1 = initialValue; // y[n-1]
  let y2 = initialValue; // y[n-2]
  let u1 = 0; // u[n-1]

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
        // 二阶振荡：H(s) = wn^2 / (s^2 + 2*zeta*wn*s + wn^2)
        // 状态空间离散化（欧拉法）
        // 令 y'' + 2*zeta*wn*y' + wn^2*y = wn^2 * gain * u
        // 用差分近似：
        //   y'' ≈ (y[n+1] - 2*y[n] + y[n-1]) / dt^2
        //   y'  ≈ (y[n] - y[n-1]) / dt
        const wn = plantParams.wn ?? 10;
        const zeta = plantParams.zeta ?? 0.5;

        const wn2 = wn * wn;
        const dt2 = dt * dt;

        // y[n+1] = (wn^2 * gain * u * dt^2 + (2 + 2*zeta*wn*dt)*y[n]  - (1 + 2*zeta*wn*dt - wn^2*dt^2) ... )
        // 标准差分方程重排：
        // y[n+1] = (wn^2 * gain * u * dt^2 + 2*y[n] - y[n-1] + 2*zeta*wn*dt*(y[n] - y[n-1]) - wn^2*dt^2*y[n])
        // 简化：(1) * y[n+1] = wn2*gain*u*dt2 + (2 - wn2*dt2)*y1 - y2 + 2*zeta*wn*dt*(y1 - y2)
        // 但更精准：用分母为 (1 + 2*zeta*wn*dt + wn2*dt2) 来保证稳定性（双线性近似思路）
        const denom = 1 + 2 * zeta * wn * dt + wn2 * dt2;
        const nextY =
          (wn2 * gain * u * dt2 + (2 + 2 * zeta * wn * dt) * y1 - y2) / denom;

        y2 = y1;
        y1 = nextY;
        processVariable = nextY;
        break;
      }
      case "integrator": {
        // 纯积分：H(s) = gain / s
        // 离散化：y[n+1] = y[n] + gain * u * dt
        processVariable = processVariable + gain * u * dt;
        break;
      }
    }

    // 二阶模型用 y1/y2 跟踪，但首次要同步
    if (plantModel !== "second-order") {
      y1 = processVariable;
      y2 = processVariable;
    }

    u1 = u;
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
  if (data.length === 0 || setpoint === 0) {
    return {
      riseTime: Infinity,
      overshoot: 0,
      settlingTime: Infinity,
      steadyStateError: 0,
    };
  }

  const threshold90 = setpoint * 0.9;
  const tolerance = Math.abs(setpoint) * 0.02; // ±2%

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
  const overshoot = Math.max(
    0,
    ((Math.abs(maxValue) - Math.abs(setpoint)) / Math.abs(setpoint)) * 100
  );

  // 调节时间：最后一次偏离 ±2% 的时间
  let settlingTime = Infinity;
  for (let i = data.length - 1; i >= 0; i--) {
    if (Math.abs(data[i].processVariable - setpoint) > tolerance) {
      settlingTime = i < data.length - 1 ? data[i + 1].time : data[i].time;
      break;
    }
  }
  // 如果从未偏离 ±2%（初始就在范围内），设为 0
  if (settlingTime === Infinity) {
    // 检查是否所有点都在范围内
    const allInRange = data.every(
      (p) => Math.abs(p.processVariable - setpoint) <= tolerance
    );
    if (allInRange) {
      settlingTime = 0;
    }
  }

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
