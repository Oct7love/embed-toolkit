/**
 * 内置示例 SVD（裁剪自公开 STM32F103 SVD，仅含 GPIOA / RCC 各几个寄存器）
 * 仅作"加载示例"按钮使用，体积约 4KB。
 */
export const EXAMPLE_SVD = `<?xml version="1.0" encoding="utf-8"?>
<device schemaVersion="1.1">
  <name>STM32F103-mini</name>
  <description>Minimal STM32F103 sample (GPIOA + RCC subset)</description>
  <peripherals>
    <peripheral>
      <name>GPIOA</name>
      <description>General purpose I/O port A</description>
      <baseAddress>0x40010800</baseAddress>
      <registers>
        <register>
          <name>CRL</name>
          <description>Port configuration register low</description>
          <addressOffset>0x0</addressOffset>
          <size>0x20</size>
          <resetValue>0x44444444</resetValue>
          <fields>
            <field>
              <name>MODE0</name>
              <description>Port n.0 mode bits</description>
              <bitOffset>0</bitOffset>
              <bitWidth>2</bitWidth>
            </field>
            <field>
              <name>CNF0</name>
              <description>Port n.0 configuration bits</description>
              <bitOffset>2</bitOffset>
              <bitWidth>2</bitWidth>
            </field>
            <field>
              <name>MODE1</name>
              <description>Port n.1 mode bits</description>
              <bitOffset>4</bitOffset>
              <bitWidth>2</bitWidth>
            </field>
            <field>
              <name>CNF1</name>
              <description>Port n.1 configuration bits</description>
              <bitOffset>6</bitOffset>
              <bitWidth>2</bitWidth>
            </field>
            <field>
              <name>MODE2</name>
              <bitOffset>8</bitOffset>
              <bitWidth>2</bitWidth>
            </field>
            <field>
              <name>CNF2</name>
              <bitOffset>10</bitOffset>
              <bitWidth>2</bitWidth>
            </field>
            <field>
              <name>MODE3</name>
              <bitOffset>12</bitOffset>
              <bitWidth>2</bitWidth>
            </field>
            <field>
              <name>CNF3</name>
              <bitOffset>14</bitOffset>
              <bitWidth>2</bitWidth>
            </field>
          </fields>
        </register>
        <register>
          <name>ODR</name>
          <description>Port output data register</description>
          <addressOffset>0xC</addressOffset>
          <size>0x20</size>
          <resetValue>0x00000000</resetValue>
          <fields>
            <field>
              <name>ODR0</name>
              <description>Port output data</description>
              <bitOffset>0</bitOffset>
              <bitWidth>1</bitWidth>
            </field>
            <field>
              <name>ODR1</name>
              <bitOffset>1</bitOffset>
              <bitWidth>1</bitWidth>
            </field>
            <field>
              <name>ODR2</name>
              <bitOffset>2</bitOffset>
              <bitWidth>1</bitWidth>
            </field>
            <field>
              <name>ODR3</name>
              <bitOffset>3</bitOffset>
              <bitWidth>1</bitWidth>
            </field>
          </fields>
        </register>
        <register>
          <name>BSRR</name>
          <description>Port bit set/reset register</description>
          <addressOffset>0x10</addressOffset>
          <size>0x20</size>
          <resetValue>0x00000000</resetValue>
          <fields>
            <field>
              <name>BS0</name>
              <description>Set bit 0</description>
              <bitOffset>0</bitOffset>
              <bitWidth>1</bitWidth>
            </field>
            <field>
              <name>BR0</name>
              <description>Reset bit 0</description>
              <bitOffset>16</bitOffset>
              <bitWidth>1</bitWidth>
            </field>
          </fields>
        </register>
      </registers>
    </peripheral>
    <peripheral>
      <name>RCC</name>
      <description>Reset and clock control</description>
      <baseAddress>0x40021000</baseAddress>
      <registers>
        <register>
          <name>CR</name>
          <description>Clock control register</description>
          <addressOffset>0x0</addressOffset>
          <size>0x20</size>
          <resetValue>0x00000083</resetValue>
          <fields>
            <field>
              <name>HSION</name>
              <description>Internal high-speed clock enable</description>
              <bitOffset>0</bitOffset>
              <bitWidth>1</bitWidth>
            </field>
            <field>
              <name>HSIRDY</name>
              <description>Internal high-speed clock ready flag</description>
              <bitOffset>1</bitOffset>
              <bitWidth>1</bitWidth>
            </field>
            <field>
              <name>HSEON</name>
              <description>External high-speed clock enable</description>
              <bitOffset>16</bitOffset>
              <bitWidth>1</bitWidth>
            </field>
            <field>
              <name>HSERDY</name>
              <description>External high-speed clock ready flag</description>
              <bitOffset>17</bitOffset>
              <bitWidth>1</bitWidth>
            </field>
            <field>
              <name>PLLON</name>
              <description>PLL enable</description>
              <bitOffset>24</bitOffset>
              <bitWidth>1</bitWidth>
            </field>
            <field>
              <name>PLLRDY</name>
              <description>PLL ready flag</description>
              <bitOffset>25</bitOffset>
              <bitWidth>1</bitWidth>
            </field>
          </fields>
        </register>
        <register>
          <name>APB2ENR</name>
          <description>APB2 peripheral clock enable register</description>
          <addressOffset>0x18</addressOffset>
          <size>0x20</size>
          <resetValue>0x00000000</resetValue>
          <fields>
            <field>
              <name>AFIOEN</name>
              <description>Alternate function IO clock enable</description>
              <bitOffset>0</bitOffset>
              <bitWidth>1</bitWidth>
            </field>
            <field>
              <name>IOPAEN</name>
              <description>IO port A clock enable</description>
              <bitOffset>2</bitOffset>
              <bitWidth>1</bitWidth>
            </field>
            <field>
              <name>IOPBEN</name>
              <description>IO port B clock enable</description>
              <bitOffset>3</bitOffset>
              <bitWidth>1</bitWidth>
            </field>
            <field>
              <name>USART1EN</name>
              <description>USART1 clock enable</description>
              <bitOffset>14</bitOffset>
              <bitWidth>1</bitWidth>
            </field>
          </fields>
        </register>
      </registers>
    </peripheral>
  </peripherals>
</device>`;
