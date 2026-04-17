import type { ApiEntry } from "@/types/api-cheatsheet";

export const STM32_HAL_APIS: ApiEntry[] = [
  // ==================== GPIO ====================
  {
    library: "STM32 HAL",
    category: "GPIO",
    name: "HAL_GPIO_Init",
    signature: "void HAL_GPIO_Init(GPIO_TypeDef *GPIOx, GPIO_InitTypeDef *GPIO_Init)",
    params: [
      { name: "GPIOx", type: "GPIO_TypeDef *", desc: "GPIO 端口（GPIOA~GPIOH）" },
      { name: "GPIO_Init", type: "GPIO_InitTypeDef *", desc: "初始化结构体指针" },
    ],
    returns: "无",
    usage: `__HAL_RCC_GPIOA_CLK_ENABLE();
GPIO_InitTypeDef GPIO_InitStruct = {0};
GPIO_InitStruct.Pin   = GPIO_PIN_5;
GPIO_InitStruct.Mode  = GPIO_MODE_OUTPUT_PP;
GPIO_InitStruct.Pull  = GPIO_NOPULL;
GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_LOW;
HAL_GPIO_Init(GPIOA, &GPIO_InitStruct);`,
    pitfalls: [
      "调用前必须先开 GPIO 时钟（__HAL_RCC_GPIOx_CLK_ENABLE）",
      "GPIO_InitStruct 必须显式初始化为 0，残留值可能导致错误模式",
      "复用功能（AF）模式必须额外设置 Alternate 字段",
    ],
  },
  {
    library: "STM32 HAL",
    category: "GPIO",
    name: "HAL_GPIO_WritePin",
    signature:
      "void HAL_GPIO_WritePin(GPIO_TypeDef *GPIOx, uint16_t GPIO_Pin, GPIO_PinState PinState)",
    params: [
      { name: "GPIOx", type: "GPIO_TypeDef *", desc: "GPIO 端口" },
      { name: "GPIO_Pin", type: "uint16_t", desc: "引脚掩码（GPIO_PIN_x）" },
      { name: "PinState", type: "GPIO_PinState", desc: "GPIO_PIN_SET 或 GPIO_PIN_RESET" },
    ],
    returns: "无",
    usage: `HAL_GPIO_WritePin(GPIOA, GPIO_PIN_5, GPIO_PIN_SET);
HAL_GPIO_WritePin(GPIOA, GPIO_PIN_5, GPIO_PIN_RESET);`,
    pitfalls: [
      "写入到输入模式 GPIO 不会有效果（写的是 ODR）",
      "频繁调用有函数调用开销，关键路径建议直接操作 BSRR",
      "GPIO_Pin 是掩码，可同时写多个引脚",
    ],
  },
  {
    library: "STM32 HAL",
    category: "GPIO",
    name: "HAL_GPIO_TogglePin",
    signature: "void HAL_GPIO_TogglePin(GPIO_TypeDef *GPIOx, uint16_t GPIO_Pin)",
    params: [
      { name: "GPIOx", type: "GPIO_TypeDef *", desc: "GPIO 端口" },
      { name: "GPIO_Pin", type: "uint16_t", desc: "引脚掩码" },
    ],
    returns: "无",
    usage: `/* 心跳 LED */
HAL_GPIO_TogglePin(GPIOA, GPIO_PIN_5);`,
    pitfalls: [
      "翻转读取的是 ODR，不是真实电平",
      "高频翻转测速时，HAL 调用开销不可忽略",
    ],
  },
  {
    library: "STM32 HAL",
    category: "GPIO",
    name: "HAL_GPIO_ReadPin",
    signature: "GPIO_PinState HAL_GPIO_ReadPin(GPIO_TypeDef *GPIOx, uint16_t GPIO_Pin)",
    params: [
      { name: "GPIOx", type: "GPIO_TypeDef *", desc: "GPIO 端口" },
      { name: "GPIO_Pin", type: "uint16_t", desc: "引脚掩码（一次只读一个）" },
    ],
    returns: "GPIO_PIN_SET 或 GPIO_PIN_RESET",
    usage: `if (HAL_GPIO_ReadPin(GPIOC, GPIO_PIN_13) == GPIO_PIN_RESET) {
    /* button pressed (active low) */
}`,
    pitfalls: [
      "一次只能读一个 pin，多 pin 同时读取需直接访问 IDR",
      "读到的是真实输入电平（IDR），不受 ODR 影响",
      "按键消抖必须自己加（软件延时或边沿计数）",
    ],
  },
  {
    library: "STM32 HAL",
    category: "GPIO",
    name: "HAL_GPIO_EXTI_IRQHandler",
    signature: "void HAL_GPIO_EXTI_IRQHandler(uint16_t GPIO_Pin)",
    params: [
      { name: "GPIO_Pin", type: "uint16_t", desc: "触发中断的 EXTI 引脚" },
    ],
    returns: "无",
    usage: `void EXTI0_IRQHandler(void) {
    HAL_GPIO_EXTI_IRQHandler(GPIO_PIN_0);
}

void HAL_GPIO_EXTI_Callback(uint16_t GPIO_Pin) {
    if (GPIO_Pin == GPIO_PIN_0) {
        /* handle */
    }
}`,
    pitfalls: [
      "必须在 stm32xxxx_it.c 的对应 IRQHandler 中调用，否则中断无法清除",
      "回调 HAL_GPIO_EXTI_Callback 是 weak 的，需要用户重写",
      "ISR 中应只置标志，复杂处理放任务上下文",
    ],
  },
  {
    library: "STM32 HAL",
    category: "GPIO",
    name: "HAL_GPIO_DeInit",
    signature: "void HAL_GPIO_DeInit(GPIO_TypeDef *GPIOx, uint32_t GPIO_Pin)",
    params: [
      { name: "GPIOx", type: "GPIO_TypeDef *", desc: "GPIO 端口" },
      { name: "GPIO_Pin", type: "uint32_t", desc: "引脚掩码" },
    ],
    returns: "无",
    usage: `HAL_GPIO_DeInit(GPIOA, GPIO_PIN_5);`,
    pitfalls: [
      "DeInit 后引脚回到模拟输入（高阻），不会自动关时钟",
      "不影响其它 pin 的配置",
    ],
  },
  // ==================== UART ====================
  {
    library: "STM32 HAL",
    category: "UART",
    name: "HAL_UART_Init",
    signature: "HAL_StatusTypeDef HAL_UART_Init(UART_HandleTypeDef *huart)",
    params: [
      { name: "huart", type: "UART_HandleTypeDef *", desc: "UART 句柄，需预先填充 Init 结构" },
    ],
    returns: "HAL_OK 成功，其它表示失败",
    usage: `huart1.Instance = USART1;
huart1.Init.BaudRate   = 115200;
huart1.Init.WordLength = UART_WORDLENGTH_8B;
huart1.Init.StopBits   = UART_STOPBITS_1;
huart1.Init.Parity     = UART_PARITY_NONE;
huart1.Init.Mode       = UART_MODE_TX_RX;
huart1.Init.HwFlowCtl  = UART_HWCONTROL_NONE;
huart1.Init.OverSampling = UART_OVERSAMPLING_16;
if (HAL_UART_Init(&huart1) != HAL_OK) Error_Handler();`,
    pitfalls: [
      "波特率误差 > 3% 时通讯不稳，需要核对 PCLK",
      "MspInit 中要开 GPIO 和 UART 时钟、配置 AF 引脚",
      "WordLength 包含奇偶位：8N1 选 UART_WORDLENGTH_8B，8E1 要选 9B",
    ],
  },
  {
    library: "STM32 HAL",
    category: "UART",
    name: "HAL_UART_Transmit",
    signature:
      "HAL_StatusTypeDef HAL_UART_Transmit(UART_HandleTypeDef *huart, const uint8_t *pData, uint16_t Size, uint32_t Timeout)",
    params: [
      { name: "huart", type: "UART_HandleTypeDef *", desc: "UART 句柄" },
      { name: "pData", type: "const uint8_t *", desc: "数据指针" },
      { name: "Size", type: "uint16_t", desc: "字节数" },
      { name: "Timeout", type: "uint32_t", desc: "超时 ms，HAL_MAX_DELAY 永久等待" },
    ],
    returns: "HAL_OK / HAL_ERROR / HAL_BUSY / HAL_TIMEOUT",
    usage: `uint8_t msg[] = "Hello\\r\\n";
HAL_UART_Transmit(&huart1, msg, sizeof(msg) - 1, 100);`,
    pitfalls: [
      "阻塞调用，可能拖慢任务，长数据建议用 _IT 或 _DMA 版本",
      "ISR 中调用会导致死锁（基于 HAL_GetTick 计时）",
      "返回 HAL_BUSY 通常因前一次 _IT/_DMA 未结束",
    ],
  },
  {
    library: "STM32 HAL",
    category: "UART",
    name: "HAL_UART_Receive",
    signature:
      "HAL_StatusTypeDef HAL_UART_Receive(UART_HandleTypeDef *huart, uint8_t *pData, uint16_t Size, uint32_t Timeout)",
    params: [
      { name: "huart", type: "UART_HandleTypeDef *", desc: "UART 句柄" },
      { name: "pData", type: "uint8_t *", desc: "接收缓冲区" },
      { name: "Size", type: "uint16_t", desc: "期望接收字节数" },
      { name: "Timeout", type: "uint32_t", desc: "超时 ms" },
    ],
    returns: "HAL_OK / HAL_TIMEOUT / HAL_ERROR",
    usage: `uint8_t buf[10];
HAL_UART_Receive(&huart1, buf, 10, 1000);`,
    pitfalls: [
      "必须提前知道字节数，不适合不定长协议",
      "不定长建议用 HAL_UARTEx_ReceiveToIdle_DMA",
      "TIMEOUT 时已收到的字节会留在缓冲区，但 ErrorCode 会被置位",
    ],
  },
  {
    library: "STM32 HAL",
    category: "UART",
    name: "HAL_UART_Transmit_IT",
    signature:
      "HAL_StatusTypeDef HAL_UART_Transmit_IT(UART_HandleTypeDef *huart, const uint8_t *pData, uint16_t Size)",
    params: [
      { name: "huart", type: "UART_HandleTypeDef *", desc: "UART 句柄" },
      { name: "pData", type: "const uint8_t *", desc: "数据指针，发送期间不可释放" },
      { name: "Size", type: "uint16_t", desc: "字节数" },
    ],
    returns: "HAL_OK 启动成功，HAL_BUSY 已有传输在进行",
    usage: `static uint8_t txbuf[64];
memcpy(txbuf, "data", 4);
HAL_UART_Transmit_IT(&huart1, txbuf, 4);
/* 完成后 HAL_UART_TxCpltCallback 被调用 */`,
    pitfalls: [
      "pData 必须在传输完成前保持有效（不能用栈上的临时变量退出函数）",
      "需要在 NVIC 中使能 USARTx_IRQn 并调用 HAL_UART_IRQHandler",
      "重入调用前必须等 TxCplt 回调或检查 gState",
    ],
  },
  {
    library: "STM32 HAL",
    category: "UART",
    name: "HAL_UART_Receive_DMA",
    signature:
      "HAL_StatusTypeDef HAL_UART_Receive_DMA(UART_HandleTypeDef *huart, uint8_t *pData, uint16_t Size)",
    params: [
      { name: "huart", type: "UART_HandleTypeDef *", desc: "UART 句柄（需关联 hdma_rx）" },
      { name: "pData", type: "uint8_t *", desc: "接收缓冲区" },
      { name: "Size", type: "uint16_t", desc: "字节数（DMA 循环时为缓冲区大小）" },
    ],
    returns: "HAL_OK / HAL_BUSY / HAL_ERROR",
    usage: `static uint8_t rxbuf[256];
HAL_UART_Receive_DMA(&huart1, rxbuf, sizeof(rxbuf));
/* 半满/满中断回调 HAL_UART_RxHalfCpltCallback / RxCpltCallback */`,
    pitfalls: [
      "缓冲区应放在 DMA 可访问的 RAM 区（避免 CCM、ITCM）",
      "Cache 一致性：使能 D-Cache 时需要 Invalidate（M7）",
      "不定长接收建议用 HAL_UARTEx_ReceiveToIdle_DMA + IDLE 中断",
    ],
  },
  {
    library: "STM32 HAL",
    category: "UART",
    name: "HAL_UART_RxCpltCallback",
    signature: "void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart)",
    params: [
      { name: "huart", type: "UART_HandleTypeDef *", desc: "触发回调的 UART 句柄" },
    ],
    returns: "无",
    usage: `void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart) {
    if (huart->Instance == USART1) {
        /* re-arm */
        HAL_UART_Receive_IT(&huart1, rxbuf, 1);
    }
}`,
    pitfalls: [
      "weak 函数，必须用户实现，否则无效果",
      "在中断上下文运行，禁止使用阻塞 API（如 HAL_Delay）",
      "DMA 模式下若未循环，回调后必须重新启动接收",
    ],
  },
  // ==================== I2C ====================
  {
    library: "STM32 HAL",
    category: "I2C",
    name: "HAL_I2C_Init",
    signature: "HAL_StatusTypeDef HAL_I2C_Init(I2C_HandleTypeDef *hi2c)",
    params: [
      { name: "hi2c", type: "I2C_HandleTypeDef *", desc: "I2C 句柄，需预填 Init 结构" },
    ],
    returns: "HAL_OK 成功",
    usage: `hi2c1.Instance = I2C1;
hi2c1.Init.ClockSpeed     = 400000;
hi2c1.Init.DutyCycle      = I2C_DUTYCYCLE_2;
hi2c1.Init.OwnAddress1    = 0;
hi2c1.Init.AddressingMode = I2C_ADDRESSINGMODE_7BIT;
if (HAL_I2C_Init(&hi2c1) != HAL_OK) Error_Handler();`,
    pitfalls: [
      "F4 系列用 ClockSpeed，F0/L4/H7 用 Timing 寄存器（用 STM32CubeMX 算）",
      "总线上拉电阻必须配，否则线电平浮空",
      "若总线被锁死，Init 前需要手动产生 9 个 SCL 脉冲解锁",
    ],
  },
  {
    library: "STM32 HAL",
    category: "I2C",
    name: "HAL_I2C_Master_Transmit",
    signature:
      "HAL_StatusTypeDef HAL_I2C_Master_Transmit(I2C_HandleTypeDef *hi2c, uint16_t DevAddress, uint8_t *pData, uint16_t Size, uint32_t Timeout)",
    params: [
      { name: "hi2c", type: "I2C_HandleTypeDef *", desc: "I2C 句柄" },
      { name: "DevAddress", type: "uint16_t", desc: "从机地址（左移 1 位后的地址）" },
      { name: "pData", type: "uint8_t *", desc: "数据指针" },
      { name: "Size", type: "uint16_t", desc: "字节数" },
      { name: "Timeout", type: "uint32_t", desc: "超时 ms" },
    ],
    returns: "HAL_OK / HAL_ERROR / HAL_BUSY / HAL_TIMEOUT",
    usage: `uint8_t data[2] = {0x01, 0xAB};
HAL_I2C_Master_Transmit(&hi2c1, 0x68 << 1, data, 2, 100);`,
    pitfalls: [
      "DevAddress 必须左移 1 位（HAL 内部会附加 R/W 位）",
      "总线异常会卡住直到 Timeout，建议加复位策略",
      "F4 库 BUSY 标志被卡时只能 DeInit/Init 恢复",
    ],
  },
  {
    library: "STM32 HAL",
    category: "I2C",
    name: "HAL_I2C_Mem_Read",
    signature:
      "HAL_StatusTypeDef HAL_I2C_Mem_Read(I2C_HandleTypeDef *hi2c, uint16_t DevAddress, uint16_t MemAddress, uint16_t MemAddSize, uint8_t *pData, uint16_t Size, uint32_t Timeout)",
    params: [
      { name: "hi2c", type: "I2C_HandleTypeDef *", desc: "I2C 句柄" },
      { name: "DevAddress", type: "uint16_t", desc: "设备地址（已左移）" },
      { name: "MemAddress", type: "uint16_t", desc: "寄存器地址" },
      { name: "MemAddSize", type: "uint16_t", desc: "I2C_MEMADD_SIZE_8BIT 或 _16BIT" },
      { name: "pData", type: "uint8_t *", desc: "接收缓冲区" },
      { name: "Size", type: "uint16_t", desc: "字节数" },
      { name: "Timeout", type: "uint32_t", desc: "超时 ms" },
    ],
    returns: "HAL_OK / HAL_ERROR / HAL_BUSY / HAL_TIMEOUT",
    usage: `uint8_t reg_val;
HAL_I2C_Mem_Read(&hi2c1, 0x68 << 1, 0x75,
                 I2C_MEMADD_SIZE_8BIT, &reg_val, 1, 100);`,
    pitfalls: [
      "MemAddSize 选错会导致从机收到错的寄存器地址",
      "EEPROM 有内部地址自增，连续读会自动 +1",
      "部分传感器需要在地址 MSB 置 1 表示 auto-increment",
    ],
  },
  {
    library: "STM32 HAL",
    category: "I2C",
    name: "HAL_I2C_IsDeviceReady",
    signature:
      "HAL_StatusTypeDef HAL_I2C_IsDeviceReady(I2C_HandleTypeDef *hi2c, uint16_t DevAddress, uint32_t Trials, uint32_t Timeout)",
    params: [
      { name: "hi2c", type: "I2C_HandleTypeDef *", desc: "I2C 句柄" },
      { name: "DevAddress", type: "uint16_t", desc: "设备地址" },
      { name: "Trials", type: "uint32_t", desc: "重试次数" },
      { name: "Timeout", type: "uint32_t", desc: "每次超时 ms" },
    ],
    returns: "HAL_OK 设备应答，HAL_ERROR 无应答",
    usage: `if (HAL_I2C_IsDeviceReady(&hi2c1, 0x68 << 1, 3, 100) == HAL_OK) {
    /* device online */
}`,
    pitfalls: [
      "EEPROM 在内部写时不会应答，可用此函数轮询",
      "DevAddress 同样要左移 1 位",
    ],
  },
  // ==================== SPI ====================
  {
    library: "STM32 HAL",
    category: "SPI",
    name: "HAL_SPI_Init",
    signature: "HAL_StatusTypeDef HAL_SPI_Init(SPI_HandleTypeDef *hspi)",
    params: [
      { name: "hspi", type: "SPI_HandleTypeDef *", desc: "SPI 句柄" },
    ],
    returns: "HAL_OK 成功",
    usage: `hspi1.Instance               = SPI1;
hspi1.Init.Mode              = SPI_MODE_MASTER;
hspi1.Init.Direction         = SPI_DIRECTION_2LINES;
hspi1.Init.DataSize          = SPI_DATASIZE_8BIT;
hspi1.Init.CLKPolarity       = SPI_POLARITY_LOW;
hspi1.Init.CLKPhase          = SPI_PHASE_1EDGE;
hspi1.Init.NSS               = SPI_NSS_SOFT;
hspi1.Init.BaudRatePrescaler = SPI_BAUDRATEPRESCALER_8;
hspi1.Init.FirstBit          = SPI_FIRSTBIT_MSB;
HAL_SPI_Init(&hspi1);`,
    pitfalls: [
      "CPOL/CPHA 必须与从机一致，否则数据全错",
      "NSS 软件管理时需手动操作 CS 引脚",
      "BaudRatePrescaler 是 PCLK 分频，注意计算实际 SCK 频率",
    ],
  },
  {
    library: "STM32 HAL",
    category: "SPI",
    name: "HAL_SPI_Transmit",
    signature:
      "HAL_StatusTypeDef HAL_SPI_Transmit(SPI_HandleTypeDef *hspi, const uint8_t *pData, uint16_t Size, uint32_t Timeout)",
    params: [
      { name: "hspi", type: "SPI_HandleTypeDef *", desc: "SPI 句柄" },
      { name: "pData", type: "const uint8_t *", desc: "数据指针" },
      { name: "Size", type: "uint16_t", desc: "字节数（16-bit 模式下是 half-word 数）" },
      { name: "Timeout", type: "uint32_t", desc: "超时 ms" },
    ],
    returns: "HAL_OK / HAL_ERROR / HAL_BUSY / HAL_TIMEOUT",
    usage: `HAL_GPIO_WritePin(CS_GPIO_Port, CS_Pin, GPIO_PIN_RESET);
HAL_SPI_Transmit(&hspi1, txbuf, 4, 100);
HAL_GPIO_WritePin(CS_GPIO_Port, CS_Pin, GPIO_PIN_SET);`,
    pitfalls: [
      "CS 必须用户管理（拉低/拉高）",
      "Size 在 16-bit DataSize 时是 half-word 数量，不是字节数",
      "全双工 SPI 用 Transmit 时 RX 数据会被丢弃",
    ],
  },
  {
    library: "STM32 HAL",
    category: "SPI",
    name: "HAL_SPI_TransmitReceive",
    signature:
      "HAL_StatusTypeDef HAL_SPI_TransmitReceive(SPI_HandleTypeDef *hspi, const uint8_t *pTxData, uint8_t *pRxData, uint16_t Size, uint32_t Timeout)",
    params: [
      { name: "hspi", type: "SPI_HandleTypeDef *", desc: "SPI 句柄" },
      { name: "pTxData", type: "const uint8_t *", desc: "发送缓冲区" },
      { name: "pRxData", type: "uint8_t *", desc: "接收缓冲区" },
      { name: "Size", type: "uint16_t", desc: "数据数" },
      { name: "Timeout", type: "uint32_t", desc: "超时 ms" },
    ],
    returns: "HAL_OK / HAL_ERROR / HAL_BUSY / HAL_TIMEOUT",
    usage: `uint8_t tx[3] = {0x9F, 0xFF, 0xFF};
uint8_t rx[3] = {0};
HAL_SPI_TransmitReceive(&hspi1, tx, rx, 3, 100);`,
    pitfalls: [
      "TX/RX 必须等长",
      "全双工是真正的字节交换，先发再收",
      "TX 与 RX 缓冲区可以是同一个，会原地覆盖",
    ],
  },
  {
    library: "STM32 HAL",
    category: "SPI",
    name: "HAL_SPI_Transmit_DMA",
    signature:
      "HAL_StatusTypeDef HAL_SPI_Transmit_DMA(SPI_HandleTypeDef *hspi, const uint8_t *pData, uint16_t Size)",
    params: [
      { name: "hspi", type: "SPI_HandleTypeDef *", desc: "SPI 句柄（需关联 hdma_tx）" },
      { name: "pData", type: "const uint8_t *", desc: "数据指针" },
      { name: "Size", type: "uint16_t", desc: "数据数" },
    ],
    returns: "HAL_OK 启动成功",
    usage: `HAL_GPIO_WritePin(CS_GPIO_Port, CS_Pin, GPIO_PIN_RESET);
HAL_SPI_Transmit_DMA(&hspi1, txbuf, len);
/* 在 HAL_SPI_TxCpltCallback 中拉高 CS */`,
    pitfalls: [
      "CS 不能在调用后立即拉高，要在 TxCpltCallback 中处理",
      "缓冲区在 DMA 完成前不可释放或修改",
      "M7 D-Cache 需 Clean before send，Invalidate before receive",
    ],
  },
  // ==================== TIM ====================
  {
    library: "STM32 HAL",
    category: "TIM",
    name: "HAL_TIM_Base_Init",
    signature: "HAL_StatusTypeDef HAL_TIM_Base_Init(TIM_HandleTypeDef *htim)",
    params: [
      { name: "htim", type: "TIM_HandleTypeDef *", desc: "TIM 句柄" },
    ],
    returns: "HAL_OK 成功",
    usage: `htim2.Instance               = TIM2;
htim2.Init.Prescaler         = 8400 - 1;   /* 84MHz / 8400 = 10kHz */
htim2.Init.CounterMode       = TIM_COUNTERMODE_UP;
htim2.Init.Period            = 10000 - 1;  /* 10kHz / 10000 = 1Hz */
htim2.Init.ClockDivision     = TIM_CLOCKDIVISION_DIV1;
htim2.Init.AutoReloadPreload = TIM_AUTORELOAD_PRELOAD_ENABLE;
HAL_TIM_Base_Init(&htim2);`,
    pitfalls: [
      "Prescaler 和 Period 实际值 = 寄存器值 + 1",
      "高级定时器（TIM1/8）必须置 BDTR.MOE 才能输出 PWM",
      "TIM 时钟可能是 APB×1 或 ×2，要看 RCC 配置",
    ],
  },
  {
    library: "STM32 HAL",
    category: "TIM",
    name: "HAL_TIM_Base_Start_IT",
    signature: "HAL_StatusTypeDef HAL_TIM_Base_Start_IT(TIM_HandleTypeDef *htim)",
    params: [
      { name: "htim", type: "TIM_HandleTypeDef *", desc: "TIM 句柄" },
    ],
    returns: "HAL_OK 成功",
    usage: `HAL_TIM_Base_Start_IT(&htim2);
/* 周期到达后 HAL_TIM_PeriodElapsedCallback 被调用 */`,
    pitfalls: [
      "必须使能 TIMx_IRQn 并在 IT 中调用 HAL_TIM_IRQHandler",
      "回调中禁止 HAL_Delay",
      "Start_IT 启用更新中断，Start 仅启动定时器不开中断",
    ],
  },
  {
    library: "STM32 HAL",
    category: "TIM",
    name: "HAL_TIM_PWM_Start",
    signature: "HAL_StatusTypeDef HAL_TIM_PWM_Start(TIM_HandleTypeDef *htim, uint32_t Channel)",
    params: [
      { name: "htim", type: "TIM_HandleTypeDef *", desc: "TIM 句柄" },
      { name: "Channel", type: "uint32_t", desc: "TIM_CHANNEL_1 ~ TIM_CHANNEL_4" },
    ],
    returns: "HAL_OK 成功",
    usage: `__HAL_TIM_SET_COMPARE(&htim2, TIM_CHANNEL_1, 5000);  /* 50% duty */
HAL_TIM_PWM_Start(&htim2, TIM_CHANNEL_1);`,
    pitfalls: [
      "使用前必须 HAL_TIM_PWM_Init",
      "高级定时器还需 HAL_TIMEx_PWMN_Start 才能输出互补 PWM",
      "GPIO 必须配置为 AF Push-Pull",
    ],
  },
  {
    library: "STM32 HAL",
    category: "TIM",
    name: "HAL_TIM_IC_Start_IT",
    signature: "HAL_StatusTypeDef HAL_TIM_IC_Start_IT(TIM_HandleTypeDef *htim, uint32_t Channel)",
    params: [
      { name: "htim", type: "TIM_HandleTypeDef *", desc: "TIM 句柄" },
      { name: "Channel", type: "uint32_t", desc: "通道" },
    ],
    returns: "HAL_OK 成功",
    usage: `HAL_TIM_IC_Start_IT(&htim3, TIM_CHANNEL_1);
/* 边沿触发后 HAL_TIM_IC_CaptureCallback 被调用 */`,
    pitfalls: [
      "捕获寄存器必须及时读取，否则会被覆盖（OvfCapture）",
      "需要先 HAL_TIM_IC_Init 并配置极性、滤波",
    ],
  },
  {
    library: "STM32 HAL",
    category: "TIM",
    name: "HAL_TIM_PeriodElapsedCallback",
    signature: "void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim)",
    params: [
      { name: "htim", type: "TIM_HandleTypeDef *", desc: "触发回调的 TIM" },
    ],
    returns: "无",
    usage: `void HAL_TIM_PeriodElapsedCallback(TIM_HandleTypeDef *htim) {
    if (htim->Instance == TIM2) {
        /* 1Hz tick */
    }
}`,
    pitfalls: [
      "weak 函数，不重写则啥也不做",
      "ISR 上下文，禁止阻塞调用",
      "多个 TIM 共用同一回调，必须用 Instance 区分",
    ],
  },
  // ==================== ADC ====================
  {
    library: "STM32 HAL",
    category: "ADC",
    name: "HAL_ADC_Start",
    signature: "HAL_StatusTypeDef HAL_ADC_Start(ADC_HandleTypeDef *hadc)",
    params: [
      { name: "hadc", type: "ADC_HandleTypeDef *", desc: "ADC 句柄" },
    ],
    returns: "HAL_OK 成功",
    usage: `HAL_ADC_Start(&hadc1);
HAL_ADC_PollForConversion(&hadc1, 100);
uint32_t v = HAL_ADC_GetValue(&hadc1);`,
    pitfalls: [
      "首次启动前需要 HAL_ADCEx_Calibration_Start（L4/H7）",
      "采样时间 + 转换时间需 ≥ 信号源阻抗对应的最小值",
      "连续转换模式下不要重复 Start，会触发 OVR",
    ],
  },
  {
    library: "STM32 HAL",
    category: "ADC",
    name: "HAL_ADC_PollForConversion",
    signature:
      "HAL_StatusTypeDef HAL_ADC_PollForConversion(ADC_HandleTypeDef *hadc, uint32_t Timeout)",
    params: [
      { name: "hadc", type: "ADC_HandleTypeDef *", desc: "ADC 句柄" },
      { name: "Timeout", type: "uint32_t", desc: "超时 ms" },
    ],
    returns: "HAL_OK 转换完成，HAL_TIMEOUT 超时",
    usage: `if (HAL_ADC_PollForConversion(&hadc1, 10) == HAL_OK) {
    uint32_t v = HAL_ADC_GetValue(&hadc1);
}`,
    pitfalls: [
      "阻塞调用，多通道扫描建议改用 DMA",
      "Timeout = 0 时立即返回当前状态",
    ],
  },
  {
    library: "STM32 HAL",
    category: "ADC",
    name: "HAL_ADC_Start_DMA",
    signature:
      "HAL_StatusTypeDef HAL_ADC_Start_DMA(ADC_HandleTypeDef *hadc, uint32_t *pData, uint32_t Length)",
    params: [
      { name: "hadc", type: "ADC_HandleTypeDef *", desc: "ADC 句柄" },
      { name: "pData", type: "uint32_t *", desc: "DMA 目标缓冲区" },
      { name: "Length", type: "uint32_t", desc: "采样次数" },
    ],
    returns: "HAL_OK 成功",
    usage: `static uint16_t adc_buf[8];
HAL_ADC_Start_DMA(&hadc1, (uint32_t *)adc_buf, 8);`,
    pitfalls: [
      "Length 是 ADC 数据数（按 DMA 数据宽度），不是字节",
      "缓冲区类型应与 ADC 分辨率匹配（12-bit 用 uint16_t 即可）",
      "扫描模式下 Rank 顺序与缓冲区顺序对应",
    ],
  },
  // ==================== DMA ====================
  {
    library: "STM32 HAL",
    category: "DMA",
    name: "HAL_DMA_Init",
    signature: "HAL_StatusTypeDef HAL_DMA_Init(DMA_HandleTypeDef *hdma)",
    params: [
      { name: "hdma", type: "DMA_HandleTypeDef *", desc: "DMA 句柄" },
    ],
    returns: "HAL_OK 成功",
    usage: `hdma_usart1_rx.Instance                 = DMA2_Stream2;
hdma_usart1_rx.Init.Channel             = DMA_CHANNEL_4;
hdma_usart1_rx.Init.Direction           = DMA_PERIPH_TO_MEMORY;
hdma_usart1_rx.Init.PeriphInc           = DMA_PINC_DISABLE;
hdma_usart1_rx.Init.MemInc              = DMA_MINC_ENABLE;
hdma_usart1_rx.Init.PeriphDataAlignment = DMA_PDATAALIGN_BYTE;
hdma_usart1_rx.Init.MemDataAlignment    = DMA_MDATAALIGN_BYTE;
hdma_usart1_rx.Init.Mode                = DMA_CIRCULAR;
hdma_usart1_rx.Init.Priority            = DMA_PRIORITY_HIGH;
HAL_DMA_Init(&hdma_usart1_rx);
__HAL_LINKDMA(&huart1, hdmarx, hdma_usart1_rx);`,
    pitfalls: [
      "外设 ↔ DMA Stream/Channel 必须查参考手册的映射表",
      "必须 __HAL_LINKDMA 把 DMA 句柄绑到外设句柄",
      "F4/H7 不同 DMA 控制器有不同寄存器布局",
    ],
  },
  {
    library: "STM32 HAL",
    category: "DMA",
    name: "HAL_DMA_Abort",
    signature: "HAL_StatusTypeDef HAL_DMA_Abort(DMA_HandleTypeDef *hdma)",
    params: [
      { name: "hdma", type: "DMA_HandleTypeDef *", desc: "DMA 句柄" },
    ],
    returns: "HAL_OK 成功",
    usage: `HAL_DMA_Abort(&hdma_usart1_rx);
HAL_UART_Receive_DMA(&huart1, rxbuf, sizeof(rxbuf));  /* 重启 */`,
    pitfalls: [
      "Abort 后必须等待 EN 位被硬件清零再启动新传输",
      "ISR 中应使用 HAL_DMA_Abort_IT",
      "Abort 不会触发完成回调",
    ],
  },
];
