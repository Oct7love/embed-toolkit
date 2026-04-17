import type { ApiEntry } from "@/types/api-cheatsheet";

export const FREERTOS_APIS: ApiEntry[] = [
  // ==================== Task ====================
  {
    library: "FreeRTOS",
    category: "Task",
    name: "xTaskCreate",
    signature:
      "BaseType_t xTaskCreate(TaskFunction_t pxTaskCode, const char * const pcName, const configSTACK_DEPTH_TYPE usStackDepth, void * const pvParameters, UBaseType_t uxPriority, TaskHandle_t * const pxCreatedTask)",
    params: [
      { name: "pxTaskCode", type: "TaskFunction_t", desc: "任务函数指针，原型为 void task(void *)" },
      { name: "pcName", type: "const char *", desc: "任务名称，仅用于调试，长度受 configMAX_TASK_NAME_LEN 限制" },
      { name: "usStackDepth", type: "configSTACK_DEPTH_TYPE", desc: "栈深度，单位是 word（不是 byte）" },
      { name: "pvParameters", type: "void *", desc: "传递给任务函数的参数" },
      { name: "uxPriority", type: "UBaseType_t", desc: "任务优先级，0 ~ configMAX_PRIORITIES-1" },
      { name: "pxCreatedTask", type: "TaskHandle_t *", desc: "返回创建的任务句柄，可填 NULL" },
    ],
    returns: "pdPASS 表示成功，errCOULD_NOT_ALLOCATE_REQUIRED_MEMORY 表示堆不足",
    usage: `TaskHandle_t xHandle = NULL;
BaseType_t ret = xTaskCreate(
    vMyTask,        /* 任务函数 */
    "MyTask",       /* 名称 */
    256,            /* 栈深度（word） */
    NULL,           /* 参数 */
    2,              /* 优先级 */
    &xHandle);      /* 句柄 */
configASSERT(ret == pdPASS);`,
    pitfalls: [
      "usStackDepth 单位是 word（4 字节），不是字节，常被误用",
      "优先级数值越大越高，与某些 RTOS 相反",
      "任务函数必须是死循环，return 会触发 configASSERT 或 hard fault",
      "不能在中断中调用，需要在调度器启动前或任务上下文中调用",
    ],
  },
  {
    library: "FreeRTOS",
    category: "Task",
    name: "xTaskCreateStatic",
    signature:
      "TaskHandle_t xTaskCreateStatic(TaskFunction_t pxTaskCode, const char * const pcName, const uint32_t ulStackDepth, void * const pvParameters, UBaseType_t uxPriority, StackType_t * const puxStackBuffer, StaticTask_t * const pxTaskBuffer)",
    params: [
      { name: "pxTaskCode", type: "TaskFunction_t", desc: "任务函数指针" },
      { name: "pcName", type: "const char *", desc: "任务名" },
      { name: "ulStackDepth", type: "uint32_t", desc: "栈深度（word），需匹配 puxStackBuffer 大小" },
      { name: "pvParameters", type: "void *", desc: "任务参数" },
      { name: "uxPriority", type: "UBaseType_t", desc: "优先级" },
      { name: "puxStackBuffer", type: "StackType_t *", desc: "用户提供的栈缓冲区" },
      { name: "pxTaskBuffer", type: "StaticTask_t *", desc: "用户提供的 TCB 缓冲区" },
    ],
    returns: "成功返回任务句柄，失败返回 NULL",
    usage: `static StackType_t xStack[256];
static StaticTask_t xTaskBuf;
TaskHandle_t xHandle = xTaskCreateStatic(
    vMyTask, "MyTask", 256, NULL, 2,
    xStack, &xTaskBuf);
configASSERT(xHandle);`,
    pitfalls: [
      "需要 configSUPPORT_STATIC_ALLOCATION = 1",
      "ulStackDepth 必须等于 puxStackBuffer 元素数量，否则会越界",
      "栈缓冲区和 TCB 必须长生命周期（static 或全局）",
    ],
  },
  {
    library: "FreeRTOS",
    category: "Task",
    name: "vTaskDelete",
    signature: "void vTaskDelete(TaskHandle_t xTaskToDelete)",
    params: [
      { name: "xTaskToDelete", type: "TaskHandle_t", desc: "要删除的任务句柄，NULL 表示删除当前任务" },
    ],
    returns: "无",
    usage: `/* 删除自己 */
vTaskDelete(NULL);

/* 删除其它任务 */
vTaskDelete(xOtherTask);`,
    pitfalls: [
      "需要 INCLUDE_vTaskDelete = 1",
      "动态创建的任务删除后，TCB 和栈由空闲任务回收，需要让出 CPU",
      "静态创建的任务删除后，资源不会被释放",
      "持有互斥锁的任务被删除会导致优先级翻转，应避免",
    ],
  },
  {
    library: "FreeRTOS",
    category: "Task",
    name: "vTaskDelay",
    signature: "void vTaskDelay(const TickType_t xTicksToDelay)",
    params: [
      { name: "xTicksToDelay", type: "TickType_t", desc: "延迟的 tick 数，可用 pdMS_TO_TICKS(ms) 转换" },
    ],
    returns: "无",
    usage: `/* 延迟 100ms */
vTaskDelay(pdMS_TO_TICKS(100));`,
    pitfalls: [
      "实际延迟会比指定 tick 短最多 1 个 tick（取决于调用时刻）",
      "不能在中断中调用，会触发 configASSERT",
      "周期性任务应使用 vTaskDelayUntil，避免漂移",
    ],
  },
  {
    library: "FreeRTOS",
    category: "Task",
    name: "vTaskDelayUntil",
    signature:
      "void vTaskDelayUntil(TickType_t * const pxPreviousWakeTime, const TickType_t xTimeIncrement)",
    params: [
      { name: "pxPreviousWakeTime", type: "TickType_t *", desc: "上次唤醒时间，由函数自动更新" },
      { name: "xTimeIncrement", type: "TickType_t", desc: "周期 tick 数" },
    ],
    returns: "无（FreeRTOS v10.4+ 提供 xTaskDelayUntil 返回 BaseType_t）",
    usage: `TickType_t xLastWakeTime = xTaskGetTickCount();
const TickType_t xPeriod = pdMS_TO_TICKS(10);
for (;;) {
    vTaskDelayUntil(&xLastWakeTime, xPeriod);
    /* 每 10ms 严格执行一次 */
    do_work();
}`,
    pitfalls: [
      "pxPreviousWakeTime 首次调用前必须用 xTaskGetTickCount() 初始化",
      "若任务被阻塞超过一个周期，会立即返回不再 delay",
      "周期 0 等同直接返回，可能导致循环饥饿",
    ],
  },
  {
    library: "FreeRTOS",
    category: "Task",
    name: "vTaskSuspend",
    signature: "void vTaskSuspend(TaskHandle_t xTaskToSuspend)",
    params: [
      { name: "xTaskToSuspend", type: "TaskHandle_t", desc: "要挂起的任务句柄，NULL 表示挂起自己" },
    ],
    returns: "无",
    usage: `vTaskSuspend(xWorkerTask);
/* ...do something... */
vTaskResume(xWorkerTask);`,
    pitfalls: [
      "需要 INCLUDE_vTaskSuspend = 1",
      "挂起持有互斥锁的任务会引发死锁",
      "嵌套调用无效：连续 suspend 两次只需一次 resume",
    ],
  },
  {
    library: "FreeRTOS",
    category: "Task",
    name: "vTaskResume",
    signature: "void vTaskResume(TaskHandle_t xTaskToResume)",
    params: [
      { name: "xTaskToResume", type: "TaskHandle_t", desc: "要恢复的任务句柄" },
    ],
    returns: "无",
    usage: `vTaskResume(xWorkerTask);`,
    pitfalls: [
      "中断中必须用 xTaskResumeFromISR",
      "对未被 suspend 的任务调用无害但无意义",
    ],
  },
  {
    library: "FreeRTOS",
    category: "Task",
    name: "vTaskStartScheduler",
    signature: "void vTaskStartScheduler(void)",
    params: [],
    returns: "正常情况下不会返回；返回意味着堆不足以创建 idle 或 timer 任务",
    usage: `int main(void) {
    HAL_Init();
    SystemClock_Config();
    xTaskCreate(vAppTask, "App", 512, NULL, 2, NULL);
    vTaskStartScheduler();
    /* 不应到达这里 */
    for (;;);
}`,
    pitfalls: [
      "调用前必须完成时钟和 SysTick 配置",
      "若 configUSE_TIMERS = 1，需要预留堆给 timer 任务",
      "main 中调用后切勿放业务逻辑",
    ],
  },
  // ==================== Semaphore / Mutex ====================
  {
    library: "FreeRTOS",
    category: "Semaphore",
    name: "xSemaphoreCreateBinary",
    signature: "SemaphoreHandle_t xSemaphoreCreateBinary(void)",
    params: [],
    returns: "成功返回信号量句柄，堆不足返回 NULL",
    usage: `SemaphoreHandle_t xSem = xSemaphoreCreateBinary();
configASSERT(xSem);
/* 初始状态为空，必须先 give 才能 take */`,
    pitfalls: [
      "创建后初始为空，立即 take 会阻塞",
      "二值信号量不支持优先级继承，互斥场景应改用 Mutex",
      "需要 configSUPPORT_DYNAMIC_ALLOCATION = 1",
    ],
  },
  {
    library: "FreeRTOS",
    category: "Semaphore",
    name: "xSemaphoreCreateMutex",
    signature: "SemaphoreHandle_t xSemaphoreCreateMutex(void)",
    params: [],
    returns: "成功返回 Mutex 句柄，失败返回 NULL",
    usage: `SemaphoreHandle_t xMutex = xSemaphoreCreateMutex();
configASSERT(xMutex);
xSemaphoreTake(xMutex, portMAX_DELAY);
/* critical section */
xSemaphoreGive(xMutex);`,
    pitfalls: [
      "Mutex 不能在 ISR 中使用（要用二值信号量）",
      "支持优先级继承但不支持递归（递归用 xSemaphoreCreateRecursiveMutex）",
      "持有者必须自己 give，其它任务 give 会失败",
    ],
  },
  {
    library: "FreeRTOS",
    category: "Semaphore",
    name: "xSemaphoreCreateCounting",
    signature:
      "SemaphoreHandle_t xSemaphoreCreateCounting(UBaseType_t uxMaxCount, UBaseType_t uxInitialCount)",
    params: [
      { name: "uxMaxCount", type: "UBaseType_t", desc: "计数上限" },
      { name: "uxInitialCount", type: "UBaseType_t", desc: "初始计数值" },
    ],
    returns: "成功返回句柄，失败返回 NULL",
    usage: `/* 资源池：5 个可用资源 */
SemaphoreHandle_t xPool = xSemaphoreCreateCounting(5, 5);`,
    pitfalls: [
      "uxInitialCount 不能大于 uxMaxCount",
      "适合资源池或事件计数，不适合互斥",
    ],
  },
  {
    library: "FreeRTOS",
    category: "Semaphore",
    name: "xSemaphoreTake",
    signature: "BaseType_t xSemaphoreTake(SemaphoreHandle_t xSemaphore, TickType_t xTicksToWait)",
    params: [
      { name: "xSemaphore", type: "SemaphoreHandle_t", desc: "信号量句柄" },
      { name: "xTicksToWait", type: "TickType_t", desc: "超时 tick，0 = 不等待，portMAX_DELAY = 永久等待" },
    ],
    returns: "pdTRUE 成功，pdFALSE 超时",
    usage: `if (xSemaphoreTake(xSem, pdMS_TO_TICKS(100)) == pdTRUE) {
    /* got it */
    xSemaphoreGive(xSem);
} else {
    /* timeout */
}`,
    pitfalls: [
      "ISR 中必须用 xSemaphoreTakeFromISR（极少这么做）",
      "portMAX_DELAY 永久等待要求 INCLUDE_vTaskSuspend = 1",
      "Mutex 必须在同一任务中 give，否则被检测到会断言",
    ],
  },
  {
    library: "FreeRTOS",
    category: "Semaphore",
    name: "xSemaphoreGive",
    signature: "BaseType_t xSemaphoreGive(SemaphoreHandle_t xSemaphore)",
    params: [
      { name: "xSemaphore", type: "SemaphoreHandle_t", desc: "信号量句柄" },
    ],
    returns: "pdTRUE 成功，pdFALSE 失败（如二值信号量已满或非持有者 give Mutex）",
    usage: `xSemaphoreGive(xSem);`,
    pitfalls: [
      "ISR 中必须用 xSemaphoreGiveFromISR",
      "二值信号量已经被 give 后再次 give 返回 pdFALSE",
      "Mutex 只能由当前持有者 give",
    ],
  },
  {
    library: "FreeRTOS",
    category: "Semaphore",
    name: "xSemaphoreGiveFromISR",
    signature:
      "BaseType_t xSemaphoreGiveFromISR(SemaphoreHandle_t xSemaphore, BaseType_t *pxHigherPriorityTaskWoken)",
    params: [
      { name: "xSemaphore", type: "SemaphoreHandle_t", desc: "信号量句柄" },
      { name: "pxHigherPriorityTaskWoken", type: "BaseType_t *", desc: "若唤醒了更高优先级任务，会被置为 pdTRUE" },
    ],
    returns: "pdTRUE 成功，errQUEUE_FULL 已满",
    usage: `void EXTI0_IRQHandler(void) {
    BaseType_t xWoken = pdFALSE;
    xSemaphoreGiveFromISR(xSem, &xWoken);
    portYIELD_FROM_ISR(xWoken);
}`,
    pitfalls: [
      "必须在最后调用 portYIELD_FROM_ISR，否则切换会延迟到下次 tick",
      "中断优先级必须 ≤ configMAX_SYSCALL_INTERRUPT_PRIORITY，否则未定义行为",
      "Mutex 不能在 ISR 中 give",
    ],
  },
  // ==================== Queue ====================
  {
    library: "FreeRTOS",
    category: "Queue",
    name: "xQueueCreate",
    signature: "QueueHandle_t xQueueCreate(UBaseType_t uxQueueLength, UBaseType_t uxItemSize)",
    params: [
      { name: "uxQueueLength", type: "UBaseType_t", desc: "队列容量（item 数量）" },
      { name: "uxItemSize", type: "UBaseType_t", desc: "每个 item 的字节数" },
    ],
    returns: "成功返回队列句柄，堆不足返回 NULL",
    usage: `QueueHandle_t xQueue = xQueueCreate(10, sizeof(uint32_t));
configASSERT(xQueue);`,
    pitfalls: [
      "队列按值传递（拷贝），大对象建议传指针并自行管理生命周期",
      "占用堆 ≈ uxQueueLength × uxItemSize + 队列控制块",
      "uxItemSize = 0 时队列退化为信号量",
    ],
  },
  {
    library: "FreeRTOS",
    category: "Queue",
    name: "xQueueSend",
    signature:
      "BaseType_t xQueueSend(QueueHandle_t xQueue, const void *pvItemToQueue, TickType_t xTicksToWait)",
    params: [
      { name: "xQueue", type: "QueueHandle_t", desc: "队列句柄" },
      { name: "pvItemToQueue", type: "const void *", desc: "指向要发送的数据，按 uxItemSize 拷贝" },
      { name: "xTicksToWait", type: "TickType_t", desc: "队列满时阻塞超时" },
    ],
    returns: "pdTRUE 成功，errQUEUE_FULL 超时",
    usage: `uint32_t v = 0xDEADBEEF;
if (xQueueSend(xQueue, &v, pdMS_TO_TICKS(10)) != pdTRUE) {
    /* full */
}`,
    pitfalls: [
      "ISR 中必须用 xQueueSendFromISR",
      "传指针时务必保证数据生命周期长于消费者读取时间",
      "xQueueSend 等同 xQueueSendToBack",
    ],
  },
  {
    library: "FreeRTOS",
    category: "Queue",
    name: "xQueueSendFromISR",
    signature:
      "BaseType_t xQueueSendFromISR(QueueHandle_t xQueue, const void *pvItemToQueue, BaseType_t *pxHigherPriorityTaskWoken)",
    params: [
      { name: "xQueue", type: "QueueHandle_t", desc: "队列句柄" },
      { name: "pvItemToQueue", type: "const void *", desc: "数据指针" },
      { name: "pxHigherPriorityTaskWoken", type: "BaseType_t *", desc: "唤醒高优任务标志" },
    ],
    returns: "pdTRUE 成功，errQUEUE_FULL 满",
    usage: `void USART1_IRQHandler(void) {
    uint8_t byte = USART1->DR;
    BaseType_t xWoken = pdFALSE;
    xQueueSendFromISR(xRxQueue, &byte, &xWoken);
    portYIELD_FROM_ISR(xWoken);
}`,
    pitfalls: [
      "ISR 优先级必须 ≤ configMAX_SYSCALL_INTERRUPT_PRIORITY",
      "队列满时不会阻塞，直接返回 errQUEUE_FULL",
      "结尾不调用 portYIELD_FROM_ISR 会导致响应延迟",
    ],
  },
  {
    library: "FreeRTOS",
    category: "Queue",
    name: "xQueueReceive",
    signature:
      "BaseType_t xQueueReceive(QueueHandle_t xQueue, void *pvBuffer, TickType_t xTicksToWait)",
    params: [
      { name: "xQueue", type: "QueueHandle_t", desc: "队列句柄" },
      { name: "pvBuffer", type: "void *", desc: "接收缓冲区，必须 ≥ uxItemSize" },
      { name: "xTicksToWait", type: "TickType_t", desc: "队列空时阻塞超时" },
    ],
    returns: "pdTRUE 收到数据，pdFALSE 超时",
    usage: `uint32_t v;
if (xQueueReceive(xQueue, &v, portMAX_DELAY) == pdTRUE) {
    process(v);
}`,
    pitfalls: [
      "pvBuffer 必须足够大，否则栈被覆盖",
      "ISR 中必须用 xQueueReceiveFromISR",
      "Receive 后 item 从队列中移除，Peek 不移除",
    ],
  },
  {
    library: "FreeRTOS",
    category: "Queue",
    name: "xQueuePeek",
    signature:
      "BaseType_t xQueuePeek(QueueHandle_t xQueue, void *pvBuffer, TickType_t xTicksToWait)",
    params: [
      { name: "xQueue", type: "QueueHandle_t", desc: "队列句柄" },
      { name: "pvBuffer", type: "void *", desc: "接收缓冲区" },
      { name: "xTicksToWait", type: "TickType_t", desc: "超时 tick" },
    ],
    returns: "pdTRUE 成功，pdFALSE 超时",
    usage: `uint32_t v;
xQueuePeek(xQueue, &v, 0);
/* item 仍在队列中 */`,
    pitfalls: [
      "Peek 不会从队列中移除元素",
      "ISR 中要用 xQueuePeekFromISR",
    ],
  },
  {
    library: "FreeRTOS",
    category: "Queue",
    name: "uxQueueMessagesWaiting",
    signature: "UBaseType_t uxQueueMessagesWaiting(QueueHandle_t xQueue)",
    params: [
      { name: "xQueue", type: "QueueHandle_t", desc: "队列句柄" },
    ],
    returns: "队列中当前 item 数量",
    usage: `if (uxQueueMessagesWaiting(xQueue) > 0) {
    /* drain queue */
}`,
    pitfalls: [
      "返回值仅是查询时刻的快照，多任务环境下可能立即变化",
      "ISR 中应使用 uxQueueMessagesWaitingFromISR",
    ],
  },
  // ==================== Software Timer ====================
  {
    library: "FreeRTOS",
    category: "Timer",
    name: "xTimerCreate",
    signature:
      "TimerHandle_t xTimerCreate(const char * const pcTimerName, const TickType_t xTimerPeriodInTicks, const UBaseType_t uxAutoReload, void * const pvTimerID, TimerCallbackFunction_t pxCallbackFunction)",
    params: [
      { name: "pcTimerName", type: "const char *", desc: "定时器名（调试用）" },
      { name: "xTimerPeriodInTicks", type: "TickType_t", desc: "周期（tick）" },
      { name: "uxAutoReload", type: "UBaseType_t", desc: "pdTRUE 自动重载，pdFALSE 单次" },
      { name: "pvTimerID", type: "void *", desc: "用户 ID，可在回调中区分多个 timer" },
      { name: "pxCallbackFunction", type: "TimerCallbackFunction_t", desc: "回调函数 void cb(TimerHandle_t)" },
    ],
    returns: "成功返回句柄，失败返回 NULL",
    usage: `TimerHandle_t xTimer = xTimerCreate(
    "Tmr", pdMS_TO_TICKS(500), pdTRUE, NULL, vTimerCb);
xTimerStart(xTimer, 0);`,
    pitfalls: [
      "需要 configUSE_TIMERS = 1，并由 timer service task 执行回调",
      "回调在 timer 任务中运行，不要做耗时操作",
      "周期不能为 0",
    ],
  },
  {
    library: "FreeRTOS",
    category: "Timer",
    name: "xTimerStart",
    signature: "BaseType_t xTimerStart(TimerHandle_t xTimer, TickType_t xTicksToWait)",
    params: [
      { name: "xTimer", type: "TimerHandle_t", desc: "定时器句柄" },
      { name: "xTicksToWait", type: "TickType_t", desc: "向 timer 命令队列发送的阻塞超时" },
    ],
    returns: "pdPASS 成功，pdFAIL 命令队列满",
    usage: `xTimerStart(xTimer, 0);`,
    pitfalls: [
      "实际启动延迟取决于 timer service task 调度",
      "对已运行 timer 调用相当于重置周期",
      "ISR 中必须用 xTimerStartFromISR",
    ],
  },
  {
    library: "FreeRTOS",
    category: "Timer",
    name: "xTimerStop",
    signature: "BaseType_t xTimerStop(TimerHandle_t xTimer, TickType_t xTicksToWait)",
    params: [
      { name: "xTimer", type: "TimerHandle_t", desc: "定时器句柄" },
      { name: "xTicksToWait", type: "TickType_t", desc: "命令队列阻塞超时" },
    ],
    returns: "pdPASS 成功，pdFAIL 失败",
    usage: `xTimerStop(xTimer, 0);`,
    pitfalls: [
      "停止操作异步执行，立即查询状态可能仍在运行",
      "ISR 中用 xTimerStopFromISR",
    ],
  },
  {
    library: "FreeRTOS",
    category: "Timer",
    name: "xTimerChangePeriod",
    signature:
      "BaseType_t xTimerChangePeriod(TimerHandle_t xTimer, TickType_t xNewPeriod, TickType_t xTicksToWait)",
    params: [
      { name: "xTimer", type: "TimerHandle_t", desc: "定时器句柄" },
      { name: "xNewPeriod", type: "TickType_t", desc: "新周期（tick）" },
      { name: "xTicksToWait", type: "TickType_t", desc: "命令队列超时" },
    ],
    returns: "pdPASS 成功，pdFAIL 失败",
    usage: `xTimerChangePeriod(xTimer, pdMS_TO_TICKS(1000), 0);`,
    pitfalls: [
      "无论 timer 是否运行，调用后都会立即启动并以新周期重新计时",
      "新周期不能为 0",
    ],
  },
  // ==================== Stream Buffer ====================
  {
    library: "FreeRTOS",
    category: "Stream Buffer",
    name: "xStreamBufferCreate",
    signature:
      "StreamBufferHandle_t xStreamBufferCreate(size_t xBufferSizeBytes, size_t xTriggerLevelBytes)",
    params: [
      { name: "xBufferSizeBytes", type: "size_t", desc: "缓冲区字节数" },
      { name: "xTriggerLevelBytes", type: "size_t", desc: "触发读取的最低字节数" },
    ],
    returns: "成功返回句柄，失败返回 NULL",
    usage: `StreamBufferHandle_t xSb = xStreamBufferCreate(256, 1);`,
    pitfalls: [
      "Stream buffer 仅支持单生产者+单消费者，多写/多读需用 Mutex 保护",
      "需要 configUSE_STREAM_BUFFERS = 1（v11+）或对应宏",
      "实际可存储字节数 = xBufferSizeBytes - 1",
    ],
  },
  {
    library: "FreeRTOS",
    category: "Stream Buffer",
    name: "xStreamBufferSend",
    signature:
      "size_t xStreamBufferSend(StreamBufferHandle_t xStreamBuffer, const void *pvTxData, size_t xDataLengthBytes, TickType_t xTicksToWait)",
    params: [
      { name: "xStreamBuffer", type: "StreamBufferHandle_t", desc: "句柄" },
      { name: "pvTxData", type: "const void *", desc: "数据指针" },
      { name: "xDataLengthBytes", type: "size_t", desc: "字节数" },
      { name: "xTicksToWait", type: "TickType_t", desc: "阻塞超时" },
    ],
    returns: "实际写入的字节数（可能小于请求）",
    usage: `size_t sent = xStreamBufferSend(xSb, buf, len, pdMS_TO_TICKS(10));`,
    pitfalls: [
      "返回值可能小于 xDataLengthBytes（缓冲区不足以容纳全部）",
      "ISR 中必须用 xStreamBufferSendFromISR",
      "数据按字节流，无包边界，需要协议层自己分包",
    ],
  },
  {
    library: "FreeRTOS",
    category: "Stream Buffer",
    name: "xStreamBufferReceive",
    signature:
      "size_t xStreamBufferReceive(StreamBufferHandle_t xStreamBuffer, void *pvRxData, size_t xBufferLengthBytes, TickType_t xTicksToWait)",
    params: [
      { name: "xStreamBuffer", type: "StreamBufferHandle_t", desc: "句柄" },
      { name: "pvRxData", type: "void *", desc: "接收缓冲区" },
      { name: "xBufferLengthBytes", type: "size_t", desc: "缓冲区容量" },
      { name: "xTicksToWait", type: "TickType_t", desc: "阻塞超时" },
    ],
    returns: "实际读取的字节数",
    usage: `uint8_t buf[64];
size_t n = xStreamBufferReceive(xSb, buf, sizeof(buf), portMAX_DELAY);`,
    pitfalls: [
      "返回字节数受 trigger level 影响：阻塞模式下需累计到 trigger 才唤醒",
      "ISR 中必须用 xStreamBufferReceiveFromISR",
    ],
  },
  // ==================== Event Group ====================
  {
    library: "FreeRTOS",
    category: "Event Group",
    name: "xEventGroupCreate",
    signature: "EventGroupHandle_t xEventGroupCreate(void)",
    params: [],
    returns: "成功返回句柄，失败返回 NULL",
    usage: `EventGroupHandle_t xEvents = xEventGroupCreate();
configASSERT(xEvents);`,
    pitfalls: [
      "默认 8 位可用（configUSE_16_BIT_TICKS = 1 时）或 24 位（32 位 tick），高位被内部使用",
      "需要 configUSE_EVENT_GROUPS = 1（新版本）",
    ],
  },
  {
    library: "FreeRTOS",
    category: "Event Group",
    name: "xEventGroupSetBits",
    signature:
      "EventBits_t xEventGroupSetBits(EventGroupHandle_t xEventGroup, const EventBits_t uxBitsToSet)",
    params: [
      { name: "xEventGroup", type: "EventGroupHandle_t", desc: "事件组句柄" },
      { name: "uxBitsToSet", type: "EventBits_t", desc: "要置位的 bit 掩码" },
    ],
    returns: "set 操作完成后的事件位值",
    usage: `xEventGroupSetBits(xEvents, BIT_0 | BIT_2);`,
    pitfalls: [
      "ISR 中必须用 xEventGroupSetBitsFromISR（且需要 daemon task）",
      "返回值是设置后的状态，可能已被其它任务清掉",
    ],
  },
  {
    library: "FreeRTOS",
    category: "Event Group",
    name: "xEventGroupWaitBits",
    signature:
      "EventBits_t xEventGroupWaitBits(EventGroupHandle_t xEventGroup, const EventBits_t uxBitsToWaitFor, const BaseType_t xClearOnExit, const BaseType_t xWaitForAllBits, TickType_t xTicksToWait)",
    params: [
      { name: "xEventGroup", type: "EventGroupHandle_t", desc: "事件组句柄" },
      { name: "uxBitsToWaitFor", type: "EventBits_t", desc: "等待的 bit 掩码" },
      { name: "xClearOnExit", type: "BaseType_t", desc: "返回前是否清除等待位" },
      { name: "xWaitForAllBits", type: "BaseType_t", desc: "pdTRUE 等待全部 bit，pdFALSE 任一" },
      { name: "xTicksToWait", type: "TickType_t", desc: "阻塞超时" },
    ],
    returns: "返回当前事件位（可能因超时而未满足）",
    usage: `EventBits_t bits = xEventGroupWaitBits(
    xEvents, BIT_0 | BIT_1, pdTRUE, pdTRUE, portMAX_DELAY);
if ((bits & (BIT_0 | BIT_1)) == (BIT_0 | BIT_1)) {
    /* both bits set */
}`,
    pitfalls: [
      "返回值需要再次按 mask 判断，不能直接当 bool",
      "xClearOnExit 仅在条件满足时清除，超时不会清",
      "ISR 中不能直接调用",
    ],
  },
];
