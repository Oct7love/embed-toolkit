import type {
  DecisionNode,
  QuestionNode,
  RecommendationNode,
} from "@/types/ipc-selector";

/* -------------------------------------------------------------------------- */
/*                          推荐方案叶节点                                     */
/* -------------------------------------------------------------------------- */

const REC_MUTEX_PI: RecommendationNode = {
  kind: "recommendation",
  id: "rec-mutex-pi",
  title: "Mutex（带优先级继承）",
  api: "xSemaphoreCreateMutex",
  scenario:
    "保护共享资源（如 SPI/I2C 总线、链表、文件句柄）。当多个不同优先级任务可能竞争同一资源时，优先级继承可避免高优先级任务被低优先级任务阻塞。",
  codeExample: {
    language: "c",
    code: `SemaphoreHandle_t xMutex = xSemaphoreCreateMutex();

// 任务中使用：
if (xSemaphoreTake(xMutex, portMAX_DELAY) == pdTRUE) {
    // 临界区：访问共享资源
    spi_write(buf, len);
    xSemaphoreGive(xMutex);
}`,
  },
  pitfalls: [
    "禁止在 ISR 中使用 Mutex（PI 机制依赖任务上下文）。中断里只能用 Binary Semaphore。",
    "禁止在持锁期间调用阻塞 API（如 vTaskDelay），会持续抬高低优先级任务的优先级。",
  ],
  alternatives: [
    {
      api: "xSemaphoreCreateRecursiveMutex",
      difference: "同一任务可重复 Take 不死锁，适合递归调用场景，但开销略大。",
    },
    {
      api: "taskENTER_CRITICAL",
      difference: "完全关中断，开销最小但临界区必须极短，否则影响实时性。",
    },
  ],
};

const REC_BINARY_SEM: RecommendationNode = {
  kind: "recommendation",
  id: "rec-binary-sem",
  title: "Binary Semaphore（二值信号量）",
  api: "xSemaphoreCreateBinary",
  scenario:
    "ISR → 任务的单向同步通知：中断里 xSemaphoreGiveFromISR，任务里 xSemaphoreTake 阻塞等待。⚠️ 不是互斥保护的合适选择——互斥请用 Mutex。",
  codeExample: {
    language: "c",
    code: `SemaphoreHandle_t xSyncSem = xSemaphoreCreateBinary();

// ISR 中：
void EXTI0_IRQHandler(void) {
    BaseType_t woken = pdFALSE;
    xSemaphoreGiveFromISR(xSyncSem, &woken);
    portYIELD_FROM_ISR(woken);
}

// 任务中：
xSemaphoreTake(xSyncSem, portMAX_DELAY);
// 处理事件`,
  },
  pitfalls: [
    "⚠️ 不要用作互斥锁：没有优先级继承，会触发优先级反转。互斥保护务必用 xSemaphoreCreateMutex。",
    "创建后初始值为 0，首次 Take 会阻塞直到有 Give。",
    "ISR 必须用 FromISR 版本并处理 xHigherPriorityTaskWoken。",
  ],
  alternatives: [
    {
      api: "xTaskNotifyGive / ulTaskNotifyTake",
      difference: "更轻量（~45% 更快）的 ISR→任务同步，无需额外 Semaphore 对象。首选方案。",
    },
    {
      api: "xSemaphoreCreateMutex",
      difference: "互斥保护请用 Mutex，带优先级继承。Binary Semaphore 不是互斥的正确工具。",
    },
  ],
};

const REC_QUEUE: RecommendationNode = {
  kind: "recommendation",
  id: "rec-queue",
  title: "Queue（消息队列）",
  api: "xQueueCreate",
  scenario:
    "跨任务/中断传递小尺寸固定结构数据（如传感器读数、命令包）。FIFO 语义，自带阻塞 API，是最通用的 IPC 方案。",
  codeExample: {
    language: "c",
    code: `typedef struct { uint8_t cmd; uint16_t val; } Msg_t;
QueueHandle_t xQ = xQueueCreate(10, sizeof(Msg_t));

// 发送：
Msg_t m = { .cmd = 1, .val = 42 };
xQueueSend(xQ, &m, portMAX_DELAY);

// 接收：
Msg_t r;
xQueueReceive(xQ, &r, portMAX_DELAY);`,
  },
  pitfalls: [
    "队列按值拷贝，元素过大会消耗大量 RAM 且性能下降。大对象应传指针。",
    "ISR 必须用 xQueueSendFromISR 并处理 pxHigherPriorityTaskWoken。",
  ],
  alternatives: [
    {
      api: "xStreamBufferCreate",
      difference: "适合不定长字节流，无固定元素大小限制。",
    },
    {
      api: "xTaskNotify",
      difference: "仅传 32-bit 数据，但比 Queue 快 ~45%，无需创建对象。",
    },
  ],
};

const REC_STREAM_BUFFER: RecommendationNode = {
  kind: "recommendation",
  id: "rec-stream-buffer",
  title: "Stream Buffer / Message Buffer",
  api: "xStreamBufferCreate / xMessageBufferCreate",
  scenario:
    "传输大块或不定长数据（如 UART/USB 接收流、网络包）。Stream Buffer 按字节流，Message Buffer 保留消息边界。",
  codeExample: {
    language: "c",
    code: `StreamBufferHandle_t xSB = xStreamBufferCreate(512, 1);

// ISR 中接收 UART 字节：
xStreamBufferSendFromISR(xSB, &byte, 1, &xWoken);

// 任务中读取：
uint8_t buf[64];
size_t n = xStreamBufferReceive(xSB, buf, 64, pdMS_TO_TICKS(100));`,
  },
  pitfalls: [
    "默认仅支持单读单写（SP/SC 无锁实现）。多读多写需自己加 Mutex 保护。",
    "Message Buffer 每条消息有 4 字节长度头开销，小消息场景不划算。",
  ],
  alternatives: [
    {
      api: "xQueueCreate",
      difference: "适合固定结构小消息，类型安全；不适合 KB 级流式数据。",
    },
    {
      api: "Ring Buffer (自实现)",
      difference: "无 RTOS 依赖，完全无锁，但需自行处理同步。",
    },
  ],
};

const REC_TASK_NOTIFY: RecommendationNode = {
  kind: "recommendation",
  id: "rec-task-notify",
  title: "Task Notification（任务通知）",
  api: "xTaskNotifyGive / ulTaskNotifyTake",
  scenario:
    "ISR 或任务向另一个特定任务发简单信号或 32-bit 数据。比信号量快 ~45%，比队列快更多，无需额外内存。",
  codeExample: {
    language: "c",
    code: `// 等待方（任务）：
ulTaskNotifyTake(pdTRUE, portMAX_DELAY); // 等到通知后清零
// 处理事件...

// 通知方（ISR）：
vTaskNotifyGiveFromISR(xTaskHandle, &xWoken);
portYIELD_FROM_ISR(xWoken);`,
  },
  pitfalls: [
    "每个任务只有一个通知值，多源通知会相互覆盖（除非用 eSetBits 模式）。",
    "通知发给特定任务句柄，不支持广播。多个任务等待同一事件应用 Event Group。",
  ],
  alternatives: [
    {
      api: "xSemaphoreCreateBinary",
      difference: "解耦发送/接收方（不需任务句柄），但开销稍大。",
    },
    {
      api: "xEventGroupSetBits",
      difference: "支持多任务广播 + 多事件组合等待。",
    },
  ],
};

const REC_EVENT_GROUP: RecommendationNode = {
  kind: "recommendation",
  id: "rec-event-group",
  title: "Event Group（事件组）",
  api: "xEventGroupCreate",
  scenario:
    "等待多个独立事件中的一个或全部发生（如：等 WiFi 连上 AND DHCP 完成 AND 时间同步完成）。也支持广播给多任务。",
  codeExample: {
    language: "c",
    code: `EventGroupHandle_t xEG = xEventGroupCreate();
#define BIT_WIFI   (1 << 0)
#define BIT_DHCP   (1 << 1)

// 等所有 bit 都置位：
xEventGroupWaitBits(xEG, BIT_WIFI | BIT_DHCP,
                    pdFALSE, pdTRUE, portMAX_DELAY);

// 其他任务/ISR 置位：
xEventGroupSetBits(xEG, BIT_WIFI);`,
  },
  pitfalls: [
    "最多 24 bit 事件（32-bit 平台），超出需多个 Event Group。",
    "ISR 中调用 xEventGroupSetBitsFromISR 实际是延迟到守护任务执行，存在延迟。",
  ],
  alternatives: [
    {
      api: "xTaskNotify (eSetBits)",
      difference: "更轻量，但只能通知单个任务，无法广播。",
    },
    {
      api: "Multiple Binary Semaphores",
      difference: "概念简单，但无法原子地 \"AND\" 等待多事件。",
    },
  ],
};

const REC_SOFTWARE_TIMER: RecommendationNode = {
  kind: "recommendation",
  id: "rec-software-timer",
  title: "Software Timer（软件定时器）",
  api: "xTimerCreate",
  scenario:
    "周期性触发回调，或一次性延迟执行。回调在 Timer 守护任务上下文运行，不占用调用任务时间。",
  codeExample: {
    language: "c",
    code: `void vTimerCb(TimerHandle_t xTimer) {
    // 回调内禁止阻塞，禁止调用 vTaskDelay
    led_toggle();
}

TimerHandle_t xT = xTimerCreate("blink",
    pdMS_TO_TICKS(500), pdTRUE, NULL, vTimerCb);
xTimerStart(xT, 0);`,
  },
  pitfalls: [
    "回调运行在 Timer 服务任务，优先级由 configTIMER_TASK_PRIORITY 决定，过低会导致回调延迟。",
    "回调内禁止阻塞调用（vTaskDelay、xSemaphoreTake 长超时等），会卡住所有定时器。",
  ],
  alternatives: [
    {
      api: "vTaskDelay / vTaskDelayUntil",
      difference: "周期任务用 vTaskDelayUntil 更精确，无守护任务延迟。",
    },
    {
      api: "硬件定时器 ISR",
      difference: "微秒级精度，但 ISR 内能做的事有限，复杂逻辑需配合通知机制。",
    },
  ],
};

const REC_VTASK_DELAY: RecommendationNode = {
  kind: "recommendation",
  id: "rec-vtask-delay",
  title: "vTaskDelayUntil（精确周期任务）",
  api: "vTaskDelayUntil / xTaskDelayUntil",
  scenario:
    "需要严格周期执行的任务（如控制环路、传感器采样），周期不受任务执行时间漂移影响。",
  codeExample: {
    language: "c",
    code: `void vCtrlTask(void *p) {
    TickType_t xLast = xTaskGetTickCount();
    const TickType_t xPeriod = pdMS_TO_TICKS(10);
    for (;;) {
        // 精确每 10ms 执行一次（含本次执行耗时）
        do_control_step();
        vTaskDelayUntil(&xLast, xPeriod);
    }
}`,
  },
  pitfalls: [
    "若任务一次执行时间超过周期，xLast 会落后过多，恢复后会连续唤醒补偿。",
    "vTaskDelay 不能保证精确周期，会累积漂移，周期任务必须用 DelayUntil。",
  ],
  alternatives: [
    {
      api: "xTimerCreate",
      difference: "解耦，回调由守护任务执行，但有调度延迟。",
    },
    {
      api: "硬件定时器中断",
      difference: "微秒级精度，但 ISR 内不能做复杂逻辑。",
    },
  ],
};

const REC_COUNTING_SEM: RecommendationNode = {
  kind: "recommendation",
  id: "rec-counting-sem",
  title: "Counting Semaphore（计数信号量）",
  api: "xSemaphoreCreateCounting",
  scenario:
    "管理 N 个同类资源（缓冲池、连接池），或统计中断次数避免漏中断。",
  codeExample: {
    language: "c",
    code: `// 5 个缓冲区资源
SemaphoreHandle_t xPool = xSemaphoreCreateCounting(5, 5);

// 申请：
xSemaphoreTake(xPool, portMAX_DELAY);
buf = alloc_from_pool();

// 释放：
free_to_pool(buf);
xSemaphoreGive(xPool);`,
  },
  pitfalls: [
    "信号量本身不分配资源，只计数。资源管理（如 alloc_from_pool）需自行实现并加锁。",
    "最大计数要预设合理，过大浪费 RAM，过小会限制并发度。",
  ],
  alternatives: [
    {
      api: "xQueueCreate",
      difference: "队列里直接存资源句柄，省去手动管理 free 列表。",
    },
    {
      api: "memory pool (heap_4)",
      difference: "FreeRTOS 自带堆方案，更通用但分配开销较大。",
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*                              决策树根                                       */
/* -------------------------------------------------------------------------- */

/** Q3a: ISR → 任务信号通知场景，1 对 1 还是 1 对多？ */
const Q3A_SIGNAL_FANOUT: QuestionNode = {
  kind: "question",
  id: "q3a-signal-fanout",
  question: "信号通知是单任务接收还是多任务共享？",
  options: [
    {
      value: "single",
      label: "1 对 1（ISR → 单个任务）",
      hint: "Task Notification 最轻量",
      next: REC_TASK_NOTIFY,
    },
    {
      value: "multi",
      label: "1 对多（多个任务需同步等待）",
      hint: "Binary Semaphore 可共享",
      next: REC_BINARY_SEM,
    },
  ],
};

/** Q3: 数据大小？ */
const Q3_DATA_SIZE: QuestionNode = {
  kind: "question",
  id: "q3-data-size",
  question: "传递的数据有什么特征？",
  options: [
    {
      value: "small-fixed",
      label: "小尺寸（<128B）固定结构",
      hint: "如命令包、传感器读数",
      next: REC_QUEUE,
    },
    {
      value: "large-stream",
      label: "大块或不定长数据流",
      hint: "如 UART 接收、网络包",
      next: REC_STREAM_BUFFER,
    },
    {
      value: "signal-only",
      label: "仅触发信号 / 32-bit 值",
      hint: "如 ISR 通知任务处理",
      next: Q3A_SIGNAL_FANOUT,
    },
    {
      value: "resource-pool",
      label: "管理 N 个同类资源",
      hint: "如缓冲池、连接池",
      next: REC_COUNTING_SEM,
    },
  ],
};


/** Q4: 周期触发方式 */
const Q4_PERIODIC: QuestionNode = {
  kind: "question",
  id: "q4-periodic",
  question: "需要怎样的周期/延时控制？",
  options: [
    {
      value: "callback",
      label: "解耦回调，可一次性或周期",
      hint: "回调由守护任务执行",
      next: REC_SOFTWARE_TIMER,
    },
    {
      value: "precise-loop",
      label: "任务内精确周期循环",
      hint: "如控制环、采样循环",
      next: REC_VTASK_DELAY,
    },
  ],
};

/** Q1（根节点）：核心问题分类 */
export const DECISION_TREE: QuestionNode = {
  kind: "question",
  id: "q1-root",
  question: "你要解决的核心问题是？",
  options: [
    {
      value: "mutex",
      label: "互斥保护共享资源",
      hint: "如总线、链表、文件句柄 → Mutex with PI",
      next: REC_MUTEX_PI,
    },
    {
      value: "ipc",
      label: "跨任务 / 中断传递数据",
      hint: "如命令、事件、字节流",
      next: Q3_DATA_SIZE,
    },
    {
      value: "events",
      label: "等待多个事件之一/全部",
      hint: "如等 WiFi+DHCP+NTP",
      next: REC_EVENT_GROUP,
    },
    {
      value: "periodic",
      label: "周期性触发任务",
      hint: "如 LED 闪烁、采样循环",
      next: Q4_PERIODIC,
    },
  ],
};

/* -------------------------------------------------------------------------- */
/*                             遍历工具函数                                    */
/* -------------------------------------------------------------------------- */

/**
 * 按用户答案路径遍历决策树。
 *
 * @param answers 用户的答案序列（按顺序的 option.value）
 * @returns 当前抵达的节点；若任意 answer 非法（找不到对应 option），返回 null
 *
 * - answers = []          → 根节点
 * - answers = [...]       → 沿路径走到对应节点
 * - 走到推荐叶节点后若仍有 answer 剩余 → 返回 null（路径过长）
 */
export function traverseTree(answers: string[]): DecisionNode | null {
  let current: DecisionNode = DECISION_TREE;

  for (const ans of answers) {
    if (current.kind !== "question") {
      // 已经在叶节点，但还有剩余答案 → 非法
      return null;
    }
    const question: QuestionNode = current;
    const opt = question.options.find((o) => o.value === ans);
    if (!opt) return null;
    current = opt.next;
  }

  return current;
}

/**
 * 递归收集决策树中的所有推荐叶节点。
 */
export function getAllRecommendations(
  node: DecisionNode = DECISION_TREE
): RecommendationNode[] {
  if (node.kind === "recommendation") {
    return [node];
  }
  const out: RecommendationNode[] = [];
  for (const opt of node.options) {
    out.push(...getAllRecommendations(opt.next));
  }
  return out;
}

/**
 * 给定答案路径，返回路径上每一步的 (问题文本, 用户选择 label) 用于面包屑显示。
 * 若路径非法，返回空数组。
 */
export function getBreadcrumbs(
  answers: string[]
): Array<{ question: string; choiceLabel: string }> {
  const crumbs: Array<{ question: string; choiceLabel: string }> = [];
  let current: DecisionNode = DECISION_TREE;

  for (const ans of answers) {
    if (current.kind !== "question") return [];
    const question: QuestionNode = current;
    const opt = question.options.find((o) => o.value === ans);
    if (!opt) return [];
    crumbs.push({ question: question.question, choiceLabel: opt.label });
    current = opt.next;
  }

  return crumbs;
}
