import { Chapter } from '../types';

export const CHAPTERS_LEVEL_7: Chapter[] = [
  {
    id: 35,
    slug: 'chapter-35-embedded-systems-microcontrollers',
    level: 7,
    levelTitle: 'Embedded Systems and Real-Time Assembly',
    title: 'Chapter 35: Introduction to Embedded Systems and Microcontrollers',
    subtitle: 'ARM Cortex-M Architecture, Vector Tables, and Bare-Metal LED Blinking',
    learningObjectives: [
      'Define embedded systems and distinguish them from general-purpose computers.',
      'Understand the role of microcontrollers (MCUs) in embedded systems.',
      'Master ARM Cortex-M programmer model: R0-R12, SP (R13), LR (R14), PC (R15), xPSR.',
      'Learn about memory-mapped I/O and how peripherals are controlled via registers.',
      'Construct a bare-metal vector table with initial stack pointer and Reset_Handler.',
      'Write a complete Thumb-2 assembly program to blink an LED on STM32F4.',
      'Understand bare-metal programming: no operating system, direct hardware access.',
      'Recognize the importance of real-time constraints and how they shape software design.'
    ],
    prerequisites: ['Chapters 1–18'],
    keyConcepts: [
      'Microcontrollers integrate compute, memory, and peripheral buses on a single die.',
      'Memory-mapped I/O: Peripherals are accessed by reading/writing special memory addresses (registers).',
      'The vector table at 0x08000000 holds the initial SP and Reset Handler address.',
      'Bare-metal programming requires startup code, vector table, and linker script.',
      'Cross-compilers (arm-none-eabi-as/ld) build binaries for ARM targets.',
      'Real-time constraints: Deadlines that must be met; deterministic behavior is required.',
      'GPIO (General Purpose Input/Output): Simple digital pins configured as input or output.'
    ],
    diagramType: 'embedded_mcu',
    sections: [
      {
        id: 'sec-35-1',
        title: '35.1 What is an Embedded System?',
        content: `An embedded system is a computer system designed to perform a dedicated function, often with real-time computing constraints. Unlike a general-purpose PC, embedded systems are embedded as part of larger devices with specific purposes.

Key characteristics:
• Dedicated function: Performs a specific task (unlike a PC)
• Real-time constraints: Must respond to events within strict deadlines (e.g., airbag deployment)
• Resource constraints: Limited RAM, flash storage, and processing power
• Low power: Often battery-operated, requiring careful power management
• Reliability: Must operate continuously for years without failure
• Cost sensitivity: Often produced in millions; even cents matter in Bill of Materials

Common examples include microcontrollers in washing machines, automotive engine controllers, IoT sensors, medical devices (pacemakers, insulin pumps), industrial automation, and consumer electronics.

### Microcontrollers vs Microprocessors
• Microprocessor: Just a CPU; requires external memory, I/O controllers (e.g., x86 in PCs)
• Microcontroller: Integrates CPU, RAM, flash, and peripherals on a single chip (e.g., ARM Cortex-M, AVR, PIC)

### Common MCU Families
| Family | Bits | Clock | RAM | Typical Use |
|--------|------|-------|-----|-------------|
| AVR (ATmega328) | 8 | 16 MHz | 2 KB | Arduino, hobby projects |
| MSP430 | 16 | 25 MHz | 1-5 KB | Ultra-low power sensors |
| ARM Cortex-M0 | 32 | 48 MHz | 4-32 KB | Cost-sensitive IoT |
| ARM Cortex-M4 | 32 | 168 MHz | 128-256 KB | DSP, motor control |
| ARM Cortex-M7 | 32 | 480 MHz | 512 KB-1 MB | High-performance MCU |`,
        codeSnippets: []
      },
      {
        id: 'sec-35-2',
        title: '35.2 Memory-Mapped I/O',
        content: `In embedded systems, peripherals are controlled by reading and writing special registers. These registers are accessed via normal memory load/store instructions; they are mapped into the address space. This is called memory-mapped I/O (MMIO).

For example, on an ARM Cortex-M microcontroller, the GPIO port for pin configuration might be located at address 0x40020000. Writing a value to that address sets the mode (input/output) of the pins.

### Memory Map Visualization (STM32F407)
| Address Range | Region | Description |
|---------------|--------|-------------|
| 0x00000000-0x000FFFFF | Code Flash | Program memory (1 MB) |
| 0x08000000-0x080FFFFF | System Memory | Bootloader |
| 0x20000000-0x2001FFFF | SRAM | Data memory (128 KB) |
| 0x40000000-0x40007FFF | APB1 Peripherals | TIM2-7, USART2-3, I2C1-3 |
| 0x40020000-0x40023FFF | AHB1 Peripherals | GPIO A-H, RCC, FLASH |
| 0xE0000000-0xE00FFFFF | System Space | NVIC, SysTick, SCB |

### Peripheral Register Types
| Register Type | Read Behavior | Write Behavior | Example |
|---------------|---------------|----------------|---------|
| Read-only | Returns current state | Ignored | GPIO_IDR |
| Write-only | Undefined | Configures hardware | GPIO_BSRR |
| Read-write | Returns current state | Modifies state | GPIO_MODER |
| Write-1-to-clear | Returns current state | Clears bits | USART_SR |

Important: Reading from a peripheral register may have side effects (e.g., clearing a flag). In C, we use volatile. In assembly, we simply perform the load/store.`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'Memory-Mapped I/O Example',
            code: `; Set port B pin 0 as output
LDR R0, =0x40020400   ; GPIOB_MODER (mode register)
LDR R1, [R0]
ORR R1, R1, #0x1      ; set bits 0-1 to 01 (output)
STR R1, [R0]

; Set pin high
LDR R0, =0x40020414   ; GPIOB_ODR (output data register)
LDR R1, [R0]
ORR R1, R1, #0x1
STR R1, [R0]`
          }
        ]
      },
      {
        id: 'sec-35-3',
        title: '35.3 ARM Cortex-M Architecture Overview',
        content: `ARM Cortex-M is a family of 32-bit RISC microcontrollers widely used in embedded systems. It has a clean, simple instruction set (Thumb-2) and a well-defined programmer's model.

### Registers
• R0–R12: General-purpose registers
• R13 (SP): Stack Pointer (MSP and PSP variants)
• R14 (LR): Link Register (holds return address)
• R15 (PC): Program Counter
• xPSR: Program Status Register (flags, interrupt state)

### Special Registers
| Register | Purpose | Key Bits |
|----------|---------|----------|
| xPSR | Program Status | N, Z, C, V, T (Thumb state) |
| PRIMASK | Priority Mask | Bit 0: 1 = all exceptions disabled |
| BASEPRI | Base Priority | Bits 7-0: Priority threshold |
| CONTROL | Stack/Privilege | Bit 0: 0=MSP, 1=PSP; Bit 1: privilege level |

### Processor Modes
• Thread Mode: Normal execution of application code (can use MSP or PSP)
• Handler Mode: Executing exception/interrupt handler (always uses MSP)

### Memory Map (Cortex-M4)
• 0x00000000: Flash (code)
• 0x20000000: SRAM (data)
• 0x40000000: Peripherals (GPIO, timers, UART)
• 0xE000E000: System control block (NVIC, debug)

### Thumb-2 Instruction Set
Instructions can be 16-bit or 32-bit:
• Data processing: MOV, ADD, SUB, AND, ORR, EOR
• Load/store: LDR, STR (with various addressing modes)
• Branch: B, BL, BX
• Conditional execution: BEQ, BNE, etc.`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'ARM Thumb-2 Basic Instructions',
            code: `MOV R0, #5          ; R0 = 5
ADD R1, R0, #3      ; R1 = R0 + 3
SUB R2, R1, R0      ; R2 = R1 - R0
LDR R3, [R0]        ; R3 = memory[R0]
STR R3, [R1]        ; memory[R1] = R3
AND R4, R0, #0xFF   ; R4 = R0 AND 0xFF
ORR R5, R0, #0x100  ; R5 = R0 OR 0x100`
          }
        ]
      },
      {
        id: 'sec-35-4',
        title: '35.4 Bare-Metal Programming',
        content: `Bare-metal programming means writing software that runs directly on hardware without an operating system. The program must initialize the hardware, set up the stack, and manage all resources itself.

### Why Bare-Metal?
• No OS is available (most small MCUs don't have an OS)
• Deterministic timing is required (no OS scheduler jitter)
• Minimal resource usage (no OS overhead)
• Safety-critical systems (medical devices, automotive)
• Bootloaders and startup code (runs before OS loads)

### Startup Code
When the MCU resets, it reads the initial stack pointer from address 0x00000000 and the reset handler address from 0x00000004. The startup code performs:
1. Set the stack pointer (usually already set from vector table)
2. Copy initialized data from flash to RAM
3. Zero the BSS section
4. Call main function (if using C) or jump to main assembly routine

### Vector Table in Detail
| Entry | Name | Description |
|-------|------|-------------|
| 0 | Initial MSP | Main Stack Pointer value at reset |
| 1 | Reset | Reset handler address |
| 2 | NMI | Non-Maskable Interrupt handler |
| 3 | HardFault | Hard fault handler |
| 4-6 | MemManage/BusFault/UsageFault | Fault handlers |
| 11 | SVCall | Supervisor call |
| 14 | PendSV | Pendable service request |
| 15 | SysTick | System tick timer |
| 16+ | IRQ0+ | External interrupts |

### Linker Script
A linker script defines where sections are placed in memory:
MEMORY { FLASH (rx) : ORIGIN = 0x08000000, LENGTH = 512K
         RAM (rwx) : ORIGIN = 0x20000000, LENGTH = 128K }
SECTIONS { .isr_vector : { *(.isr_vector) } >FLASH
           .text : { *(.text) } >FLASH
           .data : { *(.data) } >RAM AT> FLASH
           .bss : { *(.bss) } >RAM }`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'Startup Code (Simplified)',
            code: `.section .isr_vector, "a"
.word _estack          ; initial stack pointer
.word Reset_Handler    ; reset handler

.section .text
Reset_Handler:
    ; Copy .data from flash to SRAM
    ldr r0, =_sdata
    ldr r1, =_edata
    ldr r2, =_sidata
    b 2f
1:  ldr r3, [r2], #4
    str r3, [r0], #4
2:  cmp r0, r1
    bne 1b

    ; Zero .bss
    ldr r0, =_sbss
    ldr r1, =_ebss
    movs r2, #0
    b 2f
1:  str r2, [r0], #4
2:  cmp r0, r1
    bne 1b

    ; Call main (if using C)
    bl main
    b .    ; loop forever if main returns`
          }
        ]
      },
      {
        id: 'sec-35-5',
        title: '35.5 Example: Blinking an LED (STM32F4 Discovery)',
        content: `As a classic first embedded program, we'll blink an LED on an STM32F4 board. The LED is connected to GPIO port D, pin 12 (PD12).

Steps to control the LED:
1. Enable the clock for GPIOD (via RCC_AHB1ENR register)
2. Configure PD12 as output (via GPIOD_MODER register)
3. Toggle PD12 (via GPIOD_ODR register) in a loop with a delay

### Code Walkthrough
1. Constants (.equ): Define register addresses for readability
2. Vector Table: Contains initial stack pointer and reset handler address
3. Reset Handler: Enable GPIOD clock, configure PD12 as output
4. Main Loop: Toggle LED with software delay

### Improving the Delay
The software delay is inaccurate because it depends on clock speed. A better approach uses SysTick timer:
• SysTick is a 24-bit countdown timer built into Cortex-M
• Configured via SYSTICK_RVR (reload value) and SYSTICK_CSR (control)
• More accurate than software loops`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'stm32f4_blink.s',
            code: `.syntax unified
.cpu cortex-m4
.thumb

.equ RCC_AHB1ENR,  0x40023830
.equ GPIOD_MODER,  0x40020C00
.equ GPIOD_ODR,    0x40020C14

.section .isr_vector, "a"
.word _estack          ; initial SP
.word Reset_Handler    ; reset vector

.section .text
.thumb_func
.global Reset_Handler
Reset_Handler:
    ; Enable GPIOD clock (bit 3)
    ldr r0, =RCC_AHB1ENR
    ldr r1, [r0]
    orr r1, r1, #(1 << 3)
    str r1, [r0]

    ; Configure PD12 as output (bits 24-25 = 01)
    ldr r0, =GPIOD_MODER
    ldr r1, [r0]
    bic r1, r1, #(3 << 24)
    orr r1, r1, #(1 << 24)
    str r1, [r0]

loop:
    ; Turn LED ON (PD12 high)
    ldr r0, =GPIOD_ODR
    ldr r1, [r0]
    orr r1, r1, #(1 << 12)
    str r1, [r0]

    ldr r2, =1000000
delay1:
    subs r2, r2, #1
    bne delay1

    ; Turn LED OFF (PD12 low)
    ldr r0, =GPIOD_ODR
    ldr r1, [r0]
    bic r1, r1, #(1 << 12)
    str r1, [r0]

    ldr r2, =1000000
delay2:
    subs r2, r2, #1
    bne delay2

    b loop

.section .bss
.align 3
_estack: .space 0x400`
          },
          {
            language: 'arm',
            title: 'SysTick Delay Function',
            code: `.equ SYSTICK_CSR, 0xE000E010
.equ SYSTICK_RVR, 0xE000E014

delay_ms:
    ; R0 = milliseconds to delay
    push {r4, lr}
    mov r4, r0
delay_loop:
    ldr r0, =SYSTICK_RVR
    mov r1, #16000      ; 1ms at 16MHz
    str r1, [r0]
    ldr r0, =SYSTICK_CSR
    mov r1, #1
    str r1, [r0]
wait_flag:
    ldr r0, =SYSTICK_CSR
    ldr r1, [r0]
    tst r1, #(1<<16)    ; COUNTFLAG
    beq wait_flag
    subs r4, r4, #1
    bne delay_loop
    pop {pc}`
          }
        ]
      },
      {
        id: 'sec-35-6',
        title: '35.6 Real-Time Considerations',
        content: `Embedded systems often have real-time requirements: they must respond to events within a guaranteed time.

### Real-Time Classification
| Category | Deadline | Example |
|----------|----------|---------|
| Hard real-time | Must meet, or system fails | Airbag deployment, pacemaker |
| Firm real-time | Should meet, occasional miss tolerable | Video frame rendering |
| Soft real-time | Best-effort, quality degrades | Network streaming |

### Timing Analysis
Understanding execution time is critical. Consider the LED blink delay:
• Software delay: cycles = N × (1 + 1) = 2N cycles
• At 16 MHz: each cycle = 62.5 ns
• 1,000,000 iterations × 2 cycles = 125 ms

### Worst-Case Execution Time (WCET)
For safety-critical systems, calculate maximum cycles through each code path. Factors affecting timing:
• Branch penalties vary by pipeline state
• Flash memory wait states affect fetch time
• Interrupts can preempt the delay

### Common Real-Time Pitfalls
1. Interrupts disabled too long
2. Unbounded loops (while(1) with no exit)
3. Recursive calls (unpredictable stack usage)
4. Dynamic memory allocation (malloc is slow)
5. Floating-point without FPU (very slow software emulation)`,
        codeSnippets: []
      },
      {
        id: 'sec-35-7',
        title: '35.7 Tools and Cross-Compilation',
        content: `To develop for embedded targets, you need a cross-toolchain: a compiler/assembler that runs on your PC but produces code for the target architecture.

### ARM Toolchain
• GNU Arm Embedded Toolchain: arm-none-eabi-gcc, arm-none-eabi-as, arm-none-eabi-ld
• LLVM/Clang with --target=arm-none-eabi
• IDE: STM32CubeIDE, Keil, IAR (commercial)

### Build Process
Source Code (.s, .c) → Assembler/Compiler → Object Files (.o) → Linker → ELF → ObjCopy → Binary (.bin) → Flash Programmer → MCU Flash

### Essential Debugging Tools
| Tool | Purpose | Example |
|------|---------|---------|
| OpenOCD | On-chip debugger | openocd -f interface/stlink.cfg |
| GDB | Debug symbols and stepping | arm-none-eabi-gdb firmware.elf |
| st-flash | Flash programming | st-flash write firmware.bin 0x08000000 |
| Logic Analyzer | Pin signal analysis | Saleae Logic, PulseView |

### Development Board Options
| Board | MCU | Price | Features |
|-------|-----|-------|----------|
| STM32F4 Discovery | STM32F407VG | ~$20 | LEDs, accelerometer, audio |
| Nucleo-F446RE | STM32F446RE | ~$13 | Arduino-compatible, ST-Link |
| Raspberry Pi Pico | RP2040 | ~$4 | Dual-core ARM, MicroPython |`,
        codeSnippets: [
          {
            language: 'bash',
            title: 'Build Commands',
            code: `# Assemble
arm-none-eabi-as -mcpu=cortex-m4 -o blink.o blink.s

# Link
arm-none-eabi-ld -T linker.ld -o blink.elf blink.o

# Convert to binary
arm-none-eabi-objcopy -O binary blink.elf blink.bin

# Flash to MCU
st-flash write blink.bin 0x08000000`
          }
        ]
      },
      {
        id: 'sec-35-8',
        title: '35.8 Common Pitfalls and Best Practices',
        content: `### Common Beginner Mistakes
1. Forgetting to enable peripheral clocks: Peripherals are clock-gated by default
2. Wrong memory access: Accessing non-existent address causes bus fault
3. Stack overflow: Insufficient stack space corrupts data
4. Incorrect vector table: Wrong initial SP or reset handler causes crash
5. Not aligning data: ARM requires word-aligned access for 32-bit operations
6. Missing return instruction: Functions must end with BX LR or POP {PC}

### Best Practices
1. Use symbolic names: Define register addresses with .equ for readability
2. Comment extensively: Embedded code is hardware-specific
3. Start with known-good code: Use vendor examples as foundation
4. Test incrementally: Get one peripheral working before adding another
5. Use version control: Track changes to understand what broke
6. Read the errata: Silicon bugs are common in MCUs
7. Design for debug: Include LED indicators and UART debug output

### Code Review Checklist
☑ Peripheral clock enabled before register access
☑ Stack pointer initialized correctly
☑ Vector table placed at correct address
☑ Data alignment requirements met
☑ No unbounded loops (all loops have exits)
☑ Interrupt handlers properly save/restore registers
☑ Memory barriers used where needed (DMA, multi-core)
☑ Power consumption considered (clock gating, sleep modes)`,
        codeSnippets: []
      }
    ],
    exercises: [
      {
        id: 'ex-35-1',
        title: 'Exercise 35.1: Toggle Pin PD13',
        description: 'Modify the blink program to toggle pin 13 instead of pin 12.',
        solution: 'Change #(1 << 12) to #(1 << 13) in ODR, and modify MODER bits from (3 << 24)/(1 << 24) to (3 << 26)/(1 << 26).',
        solutionLanguage: 'arm'
      },
      {
        id: 'ex-35-2',
        title: 'Exercise 35.2: Multi-LED Knight Rider',
        description: 'Write assembly code to create a "Knight Rider" effect on four LEDs connected to PD12-PD15. The pattern should shift left then right continuously.',
        solution: 'Use a shift register pattern with delay. Start with bit 12, shift left to 15, then shift right back to 12. Use EOR to toggle bits and delay between each step.',
        solutionLanguage: 'arm'
      },
      {
        id: 'ex-35-3',
        title: 'Exercise 35.3: Button Input',
        description: 'Extend the LED blink program to read a button connected to PA0. When pressed (active low), toggle LED faster; when released, use normal speed.',
        solution: 'Read GPIOA_IDR bit 0. If 0 (pressed), use shorter delay; if 1 (released), use longer delay.',
        solutionLanguage: 'arm'
      },
      {
        id: 'ex-35-4',
        title: 'Exercise 35.4: Timer-Based Blink',
        description: 'Replace the software delay with a hardware timer (TIM2). Configure TIM2 to generate a 1-second delay using prescaler and auto-reload register.',
        solution: 'Enable TIM2 clock, set PSC = 16000-1 (1 kHz), ARR = 1000 (1 second). Poll UIF flag or use interrupt.',
        solutionLanguage: 'arm'
      },
      {
        id: 'ex-35-5',
        title: 'Exercise 35.5: UART Debug Output',
        description: 'Write a minimal UART initialization routine for USART2 at 9600 baud (assuming 16 MHz clock). Then write a function to send a single character.',
        solution: 'Enable GPIOA and USART2 clocks, configure PA2/PA3 as AF7, set BRR = 1667 (0x683), enable TE/RE/UE. Poll TXE before writing to DR.',
        solutionLanguage: 'arm'
      }
    ],
    practiceQuestions: [
      {
        question: 'What are the first two entries of the ARM Cortex-M vector table?',
        answer: 'Entry 0 (address 0x00000000) is the initial Main Stack Pointer (MSP) value. Entry 1 (address 0x00000004) is the address of the Reset_Handler.'
      },
      {
        question: 'What is the difference between a microprocessor and a microcontroller?',
        answer: 'A microprocessor is just a CPU that requires external memory and I/O controllers. A microcontroller integrates CPU, RAM, flash, and peripherals on a single chip, making it self-contained and cost-effective for embedded applications.'
      },
      {
        question: 'Explain memory-mapped I/O. How do you read/write a peripheral register?',
        answer: 'Memory-mapped I/O maps peripheral registers into the processor address space. You access them using normal load/store instructions to specific memory addresses. For example, LDR R0, =0x40020C00 loads the GPIO MODER register address, then LDR R1, [R0] reads it.'
      },
      {
        question: 'Why is assembly language sometimes used in embedded systems?',
        answer: 'Assembly provides precise timing control, minimal code size, and direct hardware access. It is used in startup code, interrupt handlers, and performance-critical sections where every cycle matters.'
      },
      {
        question: 'What is cross-compilation? Which tools are used for ARM Cortex-M?',
        answer: 'Cross-compilation means building code on one architecture (x86 PC) that runs on another (ARM MCU). Tools include arm-none-eabi-as (assembler), arm-none-eabi-gcc (compiler), arm-none-eabi-ld (linker), and arm-none-eabi-objcopy (binary conversion).'
      }
    ],
    summary: [
      'Embedded systems are dedicated-function computers with real-time constraints and limited resources.',
      'Microcontrollers integrate CPU, memory, and peripherals on one chip.',
      'Memory-mapped I/O controls hardware via special addresses.',
      'ARM Cortex-M is a popular 32-bit MCU architecture with a simple programming model.',
      'Bare-metal programming requires startup code, vector table, and linker script.',
      'Blinking an LED is the "Hello World" of embedded systems.',
      'Real-time systems demand deterministic behavior and low interrupt latency.',
      'Cross-compilation with GNU Arm Embedded Toolchain enables development on a PC.'
    ]
  },
  {
    id: 36,
    slug: 'chapter-36-memory-mapped-io-peripherals',
    level: 7,
    levelTitle: 'Embedded Systems and Real-Time Assembly',
    title: 'Chapter 36: Memory-Mapped I/O and Peripheral Control',
    subtitle: 'MMIO Registers, Bitfields, Atomic BSRR Operations, and UART Transmission',
    learningObjectives: [
      'Control peripherals by reading and writing memory-mapped register addresses.',
      'Perform safe Read-Modify-Write (RMW) bit operations (ORR, BIC, EOR).',
      'Configure UART serial communication (baud rate, TX/RX, status polling).',
      'Use atomic bit set/reset registers (BSRR) to eliminate race conditions.'
    ],
    prerequisites: ['Chapters 1–35'],
    keyConcepts: [
      'Peripherals appear as memory addresses on the bus.',
      'BSRR allows atomic pin toggles in a single instruction without RMW.',
      'UART transmits serial data by polling the TXE status flag.'
    ],
    diagramType: 'mmio_peripherals',
    sections: [
      {
        id: 'sec-36-1',
        title: '36.1 UART Echo Driver in ARM Thumb-2 Assembly',
        content: `Transmitting and receiving ASCII characters over USART2:`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'uart_echo.s',
            code: `.equ USART2_SR,   0x40004400
.equ USART2_DR,   0x40004404
.equ USART2_BRR,  0x40004408
.equ USART2_CR1,  0x4000440C

main_loop:
    ; Wait for RXNE (bit 5)
    ldr r0, =USART2_SR
wait_rx:
    ldr r1, [r0]
    tst r1, #(1 << 5)
    beq wait_rx

    ; Read byte from DR
    ldr r0, =USART2_DR
    ldr r2, [r0]

    ; Wait for TXE (bit 7)
    ldr r0, =USART2_SR
wait_tx:
    ldr r1, [r0]
    tst r1, #(1 << 7)
    beq wait_tx

    ; Send echoed byte to DR
    ldr r0, =USART2_DR
    str r2, [r0]
    b main_loop`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-36-1',
        title: 'Exercise 36.1: Atomic Pin Set with BSRR',
        description: 'Set PD12 high using GPIOD_BSRR without an RMW sequence.',
        solution: `LDR R0, =0x40020C18   ; GPIOD_BSRR\nMOV R1, #(1 << 12)     ; lower 16 bits set pin\nSTR R1, [R0]`,
        solutionLanguage: 'arm'
      }
    ],
    practiceQuestions: [
      {
        question: 'Why are atomic registers like BSRR preferable to RMW on ODR?',
        answer: 'A Read-Modify-Write sequence takes multiple instructions. If an interrupt occurs between read and write and modifies another pin on the same port, the subsequent write overwrites the interrupt change. BSRR writes atomically in a single cycle.'
      }
    ],
    summary: ['MMIO treats hardware as memory addresses.', 'UART, GPIO, and timers are configured via memory-mapped control registers.']
  },
  {
    id: 37,
    slug: 'chapter-37-interrupt-handling-real-time',
    level: 7,
    levelTitle: 'Embedded Systems and Real-Time Assembly',
    title: 'Chapter 37: Interrupt Handling and Real-Time Constraints',
    subtitle: 'NVIC, Hardware Stacking, Priority Preemption, Tail-Chaining, and ISRs',
    learningObjectives: [
      'Understand the ARM Cortex-M Nested Vectored Interrupt Controller (NVIC).',
      'Master hardware automatic stacking of R0-R3, R12, LR, PC, and xPSR.',
      'Implement interrupt service routines (ISRs) returning via EXC_RETURN.',
      'Analyze tail-chaining, interrupt latency, and priority preemption.'
    ],
    prerequisites: ['Chapters 1–36'],
    keyConcepts: [
      'Hardware automatically pushes 8 registers to the stack on interrupt entry in 12 cycles.',
      'Tail-chaining allows back-to-back interrupts without unstacking/restacking.',
      'ISRs must clear peripheral interrupt flags to avoid infinite re-entry.'
    ],
    diagramType: 'interrupts_nvic',
    sections: [
      {
        id: 'sec-37-1',
        title: '37.1 Interrupt-Driven UART Receiver ISR',
        content: `Handling incoming serial characters in an ISR:`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'uart_isr.s',
            code: `.thumb_func
.global USART2_IRQHandler
USART2_IRQHandler:
    ; Check RXNE
    ldr r0, =USART2_SR
    ldr r1, [r0]
    tst r1, #(1 << 5)
    beq .exit

    ; Read byte (reading DR automatically clears RXNE flag!)
    ldr r0, =USART2_DR
    ldr r2, [r0]

    ; Store byte in ring buffer or echo back
    ldr r0, =USART2_DR
    str r2, [r0]

.exit:
    bx lr             ; hardware returns from exception via EXC_RETURN`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-37-1',
        title: 'Exercise 37.1: Enable IRQ in NVIC',
        description: 'Enable USART2 (IRQ 38) in NVIC_ISER1.',
        solution: `LDR R0, =0xE000E104   ; NVIC_ISER1\nMOV R1, #(1 << 6)      ; 38 - 32 = bit 6\nSTR R1, [R0]`,
        solutionLanguage: 'arm'
      }
    ],
    practiceQuestions: [
      {
        question: 'What is tail-chaining in ARM Cortex-M?',
        answer: 'Tail-chaining is a hardware optimization where if a second interrupt is pending while an ISR finishes, the CPU skips restoring the stacked registers and immediately enters the second ISR, reducing transition latency to just 6 cycles.'
      }
    ],
    summary: ['ISRs provide microsecond responsiveness to asynchronous hardware events.', 'The NVIC manages preemption and deterministic prioritization.']
  },
  {
    id: 38,
    slug: 'chapter-38-low-power-bare-metal',
    level: 7,
    levelTitle: 'Embedded Systems and Real-Time Assembly',
    title: 'Chapter 38: Low-Power and Bare-Metal Programming',
    subtitle: 'WFI/WFE Instructions, Sleep Modes, Duty Cycling, and SLEEPONEXIT',
    learningObjectives: [
      'Master WFI (Wait For Interrupt) and WFE (Wait For Event) instructions.',
      'Configure sleep modes (Sleep, Deep Sleep, Stop) via System Control Register (SCR).',
      'Optimize energy consumption through clock gating and duty cycling.',
      'Implement a low-power timer-driven blinking LED system.'
    ],
    prerequisites: ['Chapters 1–37'],
    keyConcepts: [
      'WFI halts the CPU clock until an enabled interrupt wakes it.',
      'SLEEPONEXIT automatically puts the CPU back to sleep on returning from an ISR.',
      'Duty cycling keeps the processor asleep >99% of the time to extend battery life.'
    ],
    diagramType: 'low_power',
    sections: [
      {
        id: 'sec-38-1',
        title: '38.1 Low-Power Blinking LED with SLEEPONEXIT',
        content: `System sleeps between 500 ms timer interrupts with zero idle CPU burn:`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'low_power_blink.s',
            code: `.equ SCR, 0xE000ED10

Reset_Handler:
    ; Configure timer TIM2 to fire every 500ms
    ; Enable TIM2 update interrupt in DIER and NVIC
    ; ...
    ; Set SLEEPONEXIT in System Control Register
    ldr r0, =SCR
    ldr r1, [r0]
    orr r1, r1, #(1 << 1)   ; SLEEPONEXIT
    str r1, [r0]

    cpsie i                 ; enable global interrupts
    wfi                     ; enter sleep!

main_loop:
    b main_loop             ; never reached!

TIM2_IRQHandler:
    ; Toggle LED pin
    ldr r0, =GPIOD_ODR
    ldr r1, [r0]
    eor r1, r1, #(1 << 12)
    str r1, [r0]

    ; Clear timer UIF flag
    ldr r0, =TIM2_SR
    mov r1, #0
    str r1, [r0]

    bx lr                   ; Returns, and SLEEPONEXIT automatically re-enters sleep!`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-38-1',
        title: 'Exercise 38.1: Duty Cycling Power Calculation',
        description: 'An MCU draws 10mA for 6ms every 10 seconds, and 2uA when asleep. Calculate average current draw.',
        solution: 'Active charge = 10mA * 6ms = 60uC. Sleep charge = 2uA * 9994ms = 19.99uC. Total charge per 10s = 79.99uC. Average current = 8 uA.',
        solutionLanguage: 'c'
      }
    ],
    practiceQuestions: [
      {
        question: 'What is the benefit of the SLEEPONEXIT bit in low-power systems?',
        answer: 'It avoids having the CPU return to thread mode and execute instructions in an idle loop between interrupts. The CPU returns directly from the ISR back into sleep mode, minimizing energy consumption.'
      }
    ],
    summary: ['WFI and SLEEPONEXIT eliminate idle power waste.', 'Embedded battery longevity depends on maximizing sleep duty cycles.']
  },
  {
    id: 39,
    slug: 'chapter-39-bootloaders-firmware-development',
    level: 7,
    levelTitle: 'Embedded Systems and Real-Time Assembly',
    title: 'Chapter 39: Bootloaders and Firmware Development',
    subtitle: 'Flash Memory Partitioning, VTOR Relocation, CRC Integrity, and Jump to App',
    learningObjectives: [
      'Design flash memory layouts separating bootloader and application zones.',
      'Relocate the vector table to application space using the VTOR register.',
      'Set the Main Stack Pointer (MSR MSP) and branch to application reset handler.',
      'Verify firmware binary integrity with CRC32 before execution.'
    ],
    prerequisites: ['Chapters 1–38'],
    keyConcepts: [
      'VTOR (0xE000ED08) relocates the vector table from 0x08000000 to the app offset.',
      'The jump sequence sets MSP to the application stack and branches to app Reset_Handler.',
      'Firmware headers include magic numbers, version, size, and checksums.'
    ],
    diagramType: 'bootloaders',
    sections: [
      {
        id: 'sec-39-1',
        title: '39.1 Bootloader Jump to Application Sequence',
        content: `Assembly routine jumping from bootloader to application at 0x08004000:`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'bootloader_jump.s',
            code: `.equ APP_BASE, 0x08004000
.equ VTOR,     0xE000ED08

JumpToApplication:
    ; Disable interrupts
    cpsid i

    ; Set VTOR to application vector table base
    ldr r0, =APP_BASE
    ldr r1, =VTOR
    str r0, [r1]

    ; Load initial Stack Pointer from first word of app vector table
    ldr r2, [r0]
    msr msp, r2

    ; Load Reset Handler address from second word
    ldr r3, [r0, #4]

    ; Jump to application!
    bx r3`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-39-1',
        title: 'Exercise 39.1: Jump to 0x08010000',
        description: 'Write the assembly jump sequence for an application located at 0x08010000.',
        solution: `ldr r0, =0x08010000\nldr r1, =0xE000ED08\nstr r0, [r1]\nldr r2, [r0]\nmsr msp, r2\nldr r3, [r0, #4]\nbx r3`,
        solutionLanguage: 'arm'
      }
    ],
    practiceQuestions: [
      {
        question: 'Why is it necessary to update VTOR before jumping to an application?',
        answer: 'If VTOR is not updated, hardware interrupts occurring in the application would look up handler addresses in the bootloader\'s vector table at 0x08000000, causing crashes or unintended bootloader execution.'
      }
    ],
    summary: ['Bootloaders enable safe firmware field updates.', 'VTOR relocation and MSP re-initialization ensure seamless application execution.']
  }
];
