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
      'Understand how memory-mapped I/O (MMIO) enables direct hardware control through normal memory access.',
      'Control peripherals by reading and writing memory-mapped register addresses.',
      'Master reading from and writing to peripheral registers using load and store instructions.',
      'Perform safe Read-Modify-Write (RMW) bit operations (ORR, BIC, EOR).',
      'Use bit manipulation techniques (OR, AND, XOR, shifts) to modify specific fields within registers.',
      'Configure UART serial communication (baud rate, TX/RX, status polling).',
      'Use atomic bit set/reset registers (BSRR) to eliminate race conditions.',
      'Control common peripherals: GPIO, UART, and timers on ARM Cortex-M.'
    ],
    prerequisites: ['Chapters 1–35'],
    keyConcepts: [
      'Memory-mapped I/O (MMIO): Peripheral registers are mapped into the processor address space.',
      'Peripheral register: Hardware location that controls or reports state of a peripheral.',
      'Read-modify-write (RMW): Sequence of read, mask/set bits, and write back.',
      'Bit fields: Groups of bits within a register holding specific configuration values.',
      'Atomic access: Use bit-banding or exclusive access to avoid race conditions.',
      'Side effects: Reading/writing certain registers triggers hardware actions.',
      'Clock gating: Peripherals must be powered and clocked before use.',
      'BSRR allows atomic pin toggles in a single instruction without RMW.',
      'UART transmits serial data by polling the TXE status flag.'
    ],
    diagramType: 'mmio_peripherals',
    sections: [
      {
        id: 'sec-36-1',
        title: '36.1 Introduction to Peripheral Control',
        content: `In embedded systems, the CPU interacts with the outside world through peripherals: GPIO pins, serial ports, timers, ADCs, etc. These peripherals are controlled by reading and writing special registers located at fixed memory addresses. This mechanism—memory-mapped I/O (MMIO)—allows software to treat hardware registers as ordinary memory variables.

Because assembly language gives direct access to load/store instructions, it is an excellent tool for writing efficient and precise peripheral control code.

### Why MMIO?
• Direct hardware control without special I/O instructions
• Same load/store instructions used for regular memory
• Simple programming model
• Portable across architectures (AVR, ARM, RISC-V)

### Accessing Registers in Assembly
To read or write a peripheral register, use load (LDR) and store (STR) instructions with an absolute address:

LDR R0, =0x40020C14   ; load address into R0
LDR R1, [R0]          ; read register value

LDR R0, =0x40020C14
MOV R1, #0x1000       ; value to write
STR R1, [R0]          ; write to register

Important: Peripheral registers can change at any time. In assembly, we simply perform the load/store each time. We must also ensure the CPU does not reorder or eliminate the access.`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'Basic MMIO Access',
            code: `; Read GPIO input
LDR R0, =0x40020C10   ; GPIOD_IDR
LDR R1, [R0]          ; read all pin states

; Write GPIO output
LDR R0, =0x40020C14   ; GPIOD_ODR
MOV R1, #0x1000       ; set bit 12
STR R1, [R0]          ; write to register`
          }
        ]
      },
      {
        id: 'sec-36-2',
        title: '36.2 Peripheral Register Access Patterns',
        content: `### Simple Write
Some registers are write-only. We write a full 32-bit value.

### Read-Modify-Write (RMW)
Often we need to change a subset of bits while leaving others unchanged:
1. Read the register
2. Modify the desired bits using bitwise operations
3. Write the result back

Example: Set bit 12 of GPIO D ODR (turn on LED) without affecting other pins:

### Bit Manipulation Techniques
| Technique | ARM Instruction | Example |
|-----------|-----------------|---------|
| Set bits | ORR Rn, Rn, #mask | ORR R1, R1, #(1<<12) |
| Clear bits | BIC Rn, Rn, #mask | BIC R1, R1, #(1<<12) |
| Toggle bits | EOR Rn, Rn, #mask | EOR R1, R1, #(1<<12) |
| Test bit | TST Rn, #mask | TST R1, #(1<<12) |
| Extract field | UBFX Rd, Rn, #lsb, #width | UBFX R0, R1, #4, #3 |
| Insert field | BFI Rd, Rn, #lsb, #width | BFI R0, R1, #4, #3 |

### Atomicity and Interrupts
If an interrupt occurs between the read and write of an RMW sequence, the interrupt service routine might modify the same register, causing a lost update. To prevent this:
• Disable interrupts around the RMW (CPSID i / CPSIE i)
• Use bit-banding for single-bit operations
• Use exclusive load/store (LDREX/STREX) for multi-bit atomic updates`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'Read-Modify-Write Examples',
            code: `; Set bit 12 (LED ON)
LDR R0, =0x40020C14   ; GPIOD_ODR
LDR R1, [R0]
ORR R1, R1, #(1<<12)
STR R1, [R0]

; Clear bit 12 (LED OFF)
LDR R0, =0x40020C14
LDR R1, [R0]
BIC R1, R1, #(1<<12)
STR R1, [R0]

; Toggle bit 12
LDR R0, =0x40020C14
LDR R1, [R0]
EOR R1, R1, #(1<<12)
STR R1, [R0]

; Set mode of pin 12 to output (MODER bits 24-25 = 01)
LDR R0, =0x40020C00   ; GPIOD_MODER
LDR R1, [R0]
BIC R1, R1, #(3<<24)  ; clear bits 24-25
ORR R1, R1, #(1<<24)  ; set to 01
STR R1, [R0]`
          }
        ]
      },
      {
        id: 'sec-36-3',
        title: '36.3 General Purpose I/O (GPIO) Control',
        content: `GPIO pins are the simplest peripheral. Each pin can be configured as input, output, alternate function, or analog.

### Enabling the GPIO Clock
Before using any GPIO port, its clock must be enabled in the Reset and Clock Control (RCC) peripheral. On STM32F4, RCC_AHB1ENR at 0x40023830. GPIOD is bit 3.

### Configuring Pin Mode
The GPIO port mode register (GPIOx_MODER) uses two bits per pin:
• 00: Input
• 01: General purpose output
• 10: Alternate function
• 11: Analog

### GPIO Registers Overview
| Register | Address Offset | Purpose |
|----------|----------------|---------|
| MODER | 0x00 | Mode selection (2 bits per pin) |
| OTYPER | 0x04 | Output type (push-pull/open-drain) |
| OSPEEDR | 0x08 | Output speed |
| PUPDR | 0x0C | Pull-up/pull-down |
| IDR | 0x10 | Input data (read pins) |
| ODR | 0x14 | Output data (read/write) |
| BSRR | 0x18 | Bit set/reset (write-only, atomic) |
| LCKR | 0x1C | Configuration lock |
| AFRL | 0x20 | Alternate function low |
| AFRH | 0x24 | Alternate function high |

### Writing and Reading Pin States
• ODR: Each bit sets pin high (1) or low (0). Can be read to see current state.
• BSRR: Writing 1 to lower 16 bits sets corresponding pin; upper 16 bits resets. Atomic!

Example to set PD12 high using BSRR:
LDR R0, =0x40020C18   ; GPIOD_BSRR
MOV R1, #(1<<12)      ; set bit 12 (lower half)
STR R1, [R0]

To reset, use upper half: MOV R1, #(1<<(12+16))

For input, read the input data register (IDR).`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'GPIO Configuration',
            code: `; Enable GPIOD clock (bit 3 in RCC_AHB1ENR)
LDR R0, =0x40023830
LDR R1, [R0]
ORR R1, R1, #(1<<3)
STR R1, [R0]

; Configure PD12 as output
LDR R0, =0x40020C00   ; GPIOD_MODER
LDR R1, [R0]
BIC R1, R1, #(3<<24)  ; clear bits 24-25
ORR R1, R1, #(1<<24)  ; set to 01
STR R1, [R0]

; Set PD12 high using BSRR (atomic)
LDR R0, =0x40020C18   ; GPIOD_BSRR
MOV R1, #(1<<12)
STR R1, [R0]

; Reset PD12 using BSRR (atomic)
MOV R1, #(1<<(12+16))
STR R1, [R0]`
          }
        ]
      },
      {
        id: 'sec-36-4',
        title: '36.4 UART Serial Communication',
        content: `A UART (Universal Asynchronous Receiver/Transmitter) provides serial communication. We'll configure USART2 on STM32F4 as an example.

### UART Configuration Steps
1. Enable clocks (GPIOA and USART2)
2. Configure GPIO pins for alternate function (PA2=TX, PA3=RX)
3. Set baud rate (BRR register)
4. Enable transmitter (TE), receiver (RE), and UART (UE)

### UART Registers
| Register | Address | Purpose |
|----------|---------|---------|
| USART_SR | 0x40004400 | Status register (TXE, RXNE flags) |
| USART_DR | 0x40004404 | Data register (send/receive) |
| USART_BRR | 0x40004408 | Baud rate register |
| USART_CR1 | 0x4000440C | Control register 1 (TE, RE, UE) |
| USART_CR2 | 0x40004410 | Control register 2 |
| USART_CR3 | 0x40004414 | Control register 3 |

### Baud Rate Calculation
For 16 MHz APB1 clock and 9600 baud:
BRR = 16000000 / 9600 = 1667 = 0x683

### Sending a Character
Poll the TXE flag (bit 7 in USART_SR), then write to DR:
wait_txe:
    LDR R0, =USART2_SR
    LDR R1, [R0]
    TST R1, #(1<<7)   ; TXE flag
    BEQ wait_txe
    LDR R0, =USART2_DR
    STR R2, [R0]      ; send character in R2

### Receiving a Character
Poll the RXNE flag (bit 5 in USART_SR), then read DR.`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'UART Initialization and Echo',
            code: `.equ RCC_AHB1ENR, 0x40023830
.equ RCC_APB1ENR, 0x40023840
.equ GPIOA_MODER, 0x40020000
.equ GPIOA_AFRL,  0x40020020
.equ USART2_SR,   0x40004400
.equ USART2_DR,   0x40004404
.equ USART2_BRR,  0x40004408
.equ USART2_CR1,  0x4000440C

Reset_Handler:
    ; Enable GPIOA clock (bit 0)
    LDR R0, =RCC_AHB1ENR
    LDR R1, [R0]
    ORR R1, R1, #1
    STR R1, [R0]

    ; Enable USART2 clock (bit 17)
    LDR R0, =RCC_APB1ENR
    LDR R1, [R0]
    ORR R1, R1, #(1<<17)
    STR R1, [R0]

    ; Configure PA2 (TX) and PA3 (RX) as AF7
    LDR R0, =GPIOA_MODER
    LDR R1, [R0]
    BIC R1, R1, #(3<<4)    ; PA2
    ORR R1, R1, #(2<<4)
    BIC R1, R1, #(3<<6)    ; PA3
    ORR R1, R1, #(2<<6)
    STR R1, [R0]

    ; Set AF7 for PA2/PA3
    LDR R0, =GPIOA_AFRL
    LDR R1, [R0]
    BIC R1, R1, #(0xF<<8)
    ORR R1, R1, #(7<<8)
    BIC R1, R1, #(0xF<<12)
    ORR R1, R1, #(7<<12)
    STR R1, [R0]

    ; Configure USART2: 9600 baud
    LDR R0, =USART2_BRR
    MOV R1, #0x683
    STR R1, [R0]

    ; Enable TE, RE, UE
    LDR R0, =USART2_CR1
    LDR R1, [R0]
    ORR R1, R1, #(1<<3)    ; TE
    ORR R1, R1, #(1<<2)    ; RE
    ORR R1, R1, #(1<<13)   ; UE
    STR R1, [R0]

main_loop:
    ; Wait for RXNE
    LDR R0, =USART2_SR
wait_rx:
    LDR R1, [R0]
    TST R1, #(1<<5)
    BEQ wait_rx

    ; Read byte
    LDR R0, =USART2_DR
    LDR R2, [R0]

    ; Echo back
    LDR R0, =USART2_SR
wait_tx:
    LDR R1, [R0]
    TST R1, #(1<<7)
    BEQ wait_tx

    LDR R0, =USART2_DR
    STR R2, [R0]

    B main_loop`
          }
        ]
      },
      {
        id: 'sec-36-5',
        title: '36.5 Timers and PWM',
        content: `Timers are used for delays, periodic interrupts, and PWM (Pulse Width Modulation). We'll briefly cover timer configuration for a simple delay.

### Timer Basics
A timer like TIM2 counts up from 0 to a value in the auto-reload register (ARR). The prescaler (PSC) divides the input clock.

### Timer Registers (TIM2)
| Register | Offset | Purpose |
|----------|--------|---------|
| CR1 | 0x00 | Control register 1 (CEN bit) |
| CR2 | 0x04 | Control register 2 |
| DIER | 0x0C | DMA/interrupt enable |
| SR | 0x10 | Status register (UIF flag) |
| EGR | 0x14 | Event generation |
| CNT | 0x24 | Current counter value |
| PSC | 0x28 | Prescaler |
| ARR | 0x2C | Auto-reload register |

### Creating a Delay
1. Enable TIM2 clock (APB1, bit 0)
2. Set prescaler and ARR
3. Enable counter (CEN bit in CR1)
4. Wait for update flag (UIF in SR), then clear it

For 1 ms delay at 16 MHz:
PSC = 16000-1 (1 kHz timer clock)
ARR = 1 (1 ms period)

### PWM Basics
PWM (Pulse Width Modulation) generates a square wave with configurable duty cycle. Use cases include:
• LED brightness control
• Motor speed control
• Servo positioning

Configure timer in PWM mode 1 or 2, set compare value (CCR) for duty cycle.`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'Timer Delay',
            code: `.equ TIM2_CR1,  0x40000000
.equ TIM2_SR,   0x40000010
.equ TIM2_PSC,  0x40000028
.equ TIM2_ARR,  0x4000002C

; Configure TIM2 for 1 ms delay
LDR R0, =TIM2_PSC
MOV R1, #16000-1     ; 16 MHz / 16000 = 1 kHz
STR R1, [R0]

LDR R0, =TIM2_ARR
MOV R1, #1           ; 1 ms
STR R1, [R0]

; Enable timer
LDR R0, =TIM2_CR1
LDR R1, [R0]
ORR R1, R1, #1       ; CEN
STR R1, [R0]

; Wait for update flag
wait:
    LDR R0, =TIM2_SR
    LDR R1, [R0]
    TST R1, #1        ; UIF
    BEQ wait
    ; Clear UIF
    BIC R1, R1, #1
    STR R1, [R0]`
          }
        ]
      },
      {
        id: 'sec-36-6',
        title: '36.6 Practical Example: Echo Program via UART',
        content: `We'll write a complete assembly program that echoes back any character received on USART2. This combines GPIO, UART, and polling.

### Complete Program Flow
1. Initialize system clock (if needed)
2. Enable GPIOA and USART2 clocks
3. Configure PA2/PA3 as alternate function (AF7)
4. Set baud rate and enable UART
5. Main loop: wait for RXNE, read byte, wait for TXE, send byte

### Polling vs Interrupts
This example uses polling (checking flags in a loop). Polling is simple but wastes CPU cycles. Interrupt-driven I/O (covered in Chapter 37) is more efficient.

### Common UART Issues
1. Baud rate mismatch: Both ends must use the same speed
2. Framing error: Check start/stop bits
3. Overrun error: Read DR before next byte arrives
4. Noise error: Check signal integrity

### Testing the Echo Program
1. Connect USB-to-serial adapter to PA2/PA3
2. Open terminal (115200 baud, 8N1)
3. Type characters - they should echo back`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'Complete UART Echo Program',
            code: `.syntax unified
.cpu cortex-m4
.thumb

.equ RCC_AHB1ENR, 0x40023830
.equ RCC_APB1ENR, 0x40023840
.equ GPIOA_MODER, 0x40020000
.equ GPIOA_AFRL,  0x40020020
.equ USART2_SR,   0x40004400
.equ USART2_DR,   0x40004404
.equ USART2_BRR,  0x40004408
.equ USART2_CR1,  0x4000440C

.section .isr_vector, "a"
.word _estack
.word Reset_Handler

.section .text
.thumb_func
.global Reset_Handler
Reset_Handler:
    ; Enable GPIOA clock
    LDR R0, =RCC_AHB1ENR
    LDR R1, [R0]
    ORR R1, R1, #1
    STR R1, [R0]

    ; Enable USART2 clock
    LDR R0, =RCC_APB1ENR
    LDR R1, [R0]
    ORR R1, R1, #(1<<17)
    STR R1, [R0]

    ; Configure PA2/PA3 as AF7
    LDR R0, =GPIOA_MODER
    LDR R1, [R0]
    BIC R1, R1, #(3<<4)
    ORR R1, R1, #(2<<4)
    BIC R1, R1, #(3<<6)
    ORR R1, R1, #(2<<6)
    STR R1, [R0]

    LDR R0, =GPIOA_AFRL
    LDR R1, [R0]
    BIC R1, R1, #(0xF<<8)
    ORR R1, R1, #(7<<8)
    BIC R1, R1, #(0xF<<12)
    ORR R1, R1, #(7<<12)
    STR R1, [R0]

    ; Configure USART2: 9600 baud
    LDR R0, =USART2_BRR
    MOV R1, #0x683
    STR R1, [R0]

    ; Enable TE, RE, UE
    LDR R0, =USART2_CR1
    LDR R1, [R0]
    ORR R1, R1, #(1<<3)
    ORR R1, R1, #(1<<2)
    ORR R1, R1, #(1<<13)
    STR R1, [R0]

main_loop:
    LDR R0, =USART2_SR
wait_rx:
    LDR R1, [R0]
    TST R1, #(1<<5)
    BEQ wait_rx

    LDR R0, =USART2_DR
    LDR R2, [R0]

    LDR R0, =USART2_SR
wait_tx:
    LDR R1, [R0]
    TST R1, #(1<<7)
    BEQ wait_tx

    LDR R0, =USART2_DR
    STR R2, [R0]

    B main_loop

.section .bss
.align 3
_estack: .space 0x400`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-36-1',
        title: 'Exercise 36.1: Atomic Pin Set with BSRR',
        description: 'Set PD12 high using GPIOD_BSRR without an RMW sequence.',
        solution: `LDR R0, =0x40020C18   ; GPIOD_BSRR
MOV R1, #(1 << 12)     ; lower 16 bits set pin
STR R1, [R0]`,
        solutionLanguage: 'arm'
      },
      {
        id: 'ex-36-2',
        title: 'Exercise 36.2: Toggle Multiple Pins',
        description: 'Write code to toggle PD12, PD13, PD14 simultaneously using ODR. What is the mask?',
        solution: `LDR R0, =0x40020C14   ; GPIOD_ODR
LDR R1, [R0]
EOR R1, R1, #((1<<12) | (1<<13) | (1<<14))
STR R1, [R0]
; Mask = 0x7000`,
        solutionLanguage: 'arm'
      },
      {
        id: 'ex-36-3',
        title: 'Exercise 36.3: UART Transmit String',
        description: 'Write an assembly routine that transmits a null-terminated string via UART using polling.',
        solution: 'Loop through string bytes, wait for TXE flag, write to DR. Use LDRB to load each byte and compare with 0 for null terminator.',
        solutionLanguage: 'arm'
      },
      {
        id: 'ex-36-4',
        title: 'Exercise 36.4: Timer Delay Function',
        description: 'Implement a delay_ms function that takes milliseconds in R0 and blocks using TIM2 polling.',
        solution: 'Configure TIM2 with PSC=16000-1 for 1 kHz. For each ms, set ARR=1, enable timer, wait for UIF, clear flag, disable timer.',
        solutionLanguage: 'arm'
      },
      {
        id: 'ex-36-5',
        title: 'Exercise 36.5: Read-Modify-Write Race Condition',
        description: 'Explain why RMW can be unsafe with interrupts enabled. Give an example.',
        solution: 'If interrupt modifies same register between read and write, the write overwrites the change. Example: Main sets bit 12, interrupt sets bit 13 between read and write, write only has bit 12 set, bit 13 lost.',
        solutionLanguage: 'text'
      }
    ],
    practiceQuestions: [
      {
        question: 'What is memory-mapped I/O? How does it differ from port-mapped I/O?',
        answer: 'Memory-mapped I/O maps peripheral registers into the processor address space, allowing access via load/store instructions. Port-mapped I/O uses separate address space and special IN/OUT instructions. Memory-mapped is simpler and more common in ARM/MCU designs.'
      },
      {
        question: 'Explain the read-modify-write sequence. Why is it used?',
        answer: 'RMW reads the current register value, modifies specific bits using AND/OR/XOR operations, and writes back. It is used to change individual bits without affecting others. For example, setting bit 12 while preserving all other bits.'
      },
      {
        question: 'Why must peripheral clocks be enabled before accessing a peripheral?',
        answer: 'Peripherals are clock-gated by default to save power. Without a clock signal, the peripheral logic cannot operate, and accessing its registers may cause a bus fault or return undefined values.'
      },
      {
        question: 'What is the purpose of the BSRR register in GPIO?',
        answer: 'BSRR (Bit Set/Reset Register) provides atomic bit manipulation. Writing 1 to lower 16 bits sets the corresponding pin; writing 1 to upper 16 bits resets it. This eliminates the need for read-modify-write sequences that can have race conditions with interrupts.'
      },
      {
        question: 'Describe how to send a byte over UART using polling.',
        answer: '1. Wait for TXE (Transmit Data Register Empty) flag in USART_SR. 2. Write the byte to USART_DR. The hardware serializes the data and transmits it. TXE is set when the data register is empty and ready for next byte.'
      },
      {
        question: 'Why is polling less efficient than interrupts for peripheral handling?',
        answer: 'Polling requires the CPU to continuously check status flags in a loop, wasting cycles even when no data is available. Interrupts allow the CPU to sleep or do other work until the peripheral signals readiness, improving efficiency and responsiveness.'
      },
      {
        question: 'How can you ensure atomic access to a peripheral register when interrupts are enabled?',
        answer: 'Methods include: 1) Disable interrupts around RMW (CPSID i/CPSIE i). 2) Use bit-banding for single-bit operations. 3) Use exclusive load/store (LDREX/STREX). 4) Use atomic registers like BSRR.'
      }
    ],
    summary: [
      'Memory-mapped I/O allows CPU to control hardware by reading/writing specific addresses.',
      'Read-modify-write is the standard pattern for modifying register bits.',
      'Clock gating: peripherals must be enabled before use.',
      'GPIO configuration involves setting mode bits; output data via ODR or BSRR.',
      'UART requires clock, pin alternate function, baud rate, and enabling TX/RX.',
      'Timers provide precise delays and periodic events.',
      'Polling flags is simple but wastes CPU; interrupts are more efficient.',
      'Always consider atomicity when using RMW in interrupt-prone environments.'
    ]
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
