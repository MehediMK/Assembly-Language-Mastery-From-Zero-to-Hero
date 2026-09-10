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
      'Understand what interrupts are and how they enable responsive embedded systems.',
      'Learn the interrupt architecture of ARM Cortex-M: vector table, NVIC, priority levels.',
      'Master the ARM Cortex-M Nested Vectored Interrupt Controller (NVIC).',
      'Write interrupt service routines (ISRs) in assembly, handling register stacking and proper return.',
      'Master hardware automatic stacking of R0-R3, R12, LR, PC, and xPSR.',
      'Implement interrupt service routines (ISRs) returning via EXC_RETURN.',
      'Configure peripheral interrupts (e.g., UART receive, timer update) and enable them through the NVIC.',
      'Manage shared data between ISRs and main code safely (volatile, critical sections).',
      'Analyze real-time constraints: interrupt latency, priority inversion, and deadline miss.',
      'Implement a simple interrupt-driven UART echo and timer-based LED toggling.',
      'Analyze tail-chaining, interrupt latency, and priority preemption.'
    ],
    prerequisites: ['Chapters 1–36'],
    keyConcepts: [
      'Interrupt: An asynchronous event that causes the CPU to suspend current execution and jump to a handler.',
      'Interrupt Service Routine (ISR): The function that runs in response to an interrupt.',
      'Vector table: A table of function pointers for each exception/interrupt number.',
      'NVIC (Nested Vectored Interrupt Controller): Hardware that manages interrupt priorities and enabling.',
      'Priority levels: Higher priority interrupts preempt lower ones; Cortex-M supports 0-255.',
      'Exception entry/exit: Hardware automatically stacks registers (R0-R3, R12, LR, PC, xPSR) and unstacks on return.',
      'Hardware automatically pushes 8 registers to the stack on interrupt entry in 12 cycles.',
      'Tail-chaining: Back-to-back interrupts skip unnecessary state restore/save, reducing latency.',
      'Tail-chaining allows back-to-back interrupts without unstacking/restacking.',
      'Interrupt latency: Time from interrupt request to execution of the first ISR instruction.',
      'Critical section: Code region where interrupts are disabled to protect shared data.',
      'Real-time constraint: A deadline that must be met; violation may cause system failure.',
      'ISRs must clear peripheral interrupt flags to avoid infinite re-entry.'
    ],
    diagramType: 'interrupts_nvic',
    sections: [
      {
        id: 'sec-37-1',
        title: '37.1 Introduction to Interrupts',
        content: `In embedded systems, polling peripherals (continuously checking status flags) wastes CPU cycles and makes the system unresponsive. Interrupts provide a mechanism for hardware to notify the CPU when an event occurs (e.g., byte received, timer expired). The CPU suspends the current task, executes an Interrupt Service Routine (ISR), then returns to the interrupted code.

### Polling vs Interrupts
| Aspect | Polling | Interrupts |
|--------|---------|------------|
| CPU Usage | Continuous checking (wastes cycles) | Sleep until event (efficient) |
| Response Time | Variable (depends on loop) | Deterministic (interrupt latency) |
| Complexity | Simple | More complex (ISR design) |
| Power | Higher (CPU always active) | Lower (CPU can sleep) |
| Real-time | Poor (unbounded latency) | Excellent (bounded latency) |

### When to Use Polling
• Very high-frequency events (>1 MHz)
• Simple systems with no other tasks
• When interrupt latency is too high
• Debugging and testing

### When to Use Interrupts
• Low-frequency events (button presses, UART)
• Power-sensitive applications
• Real-time systems with deadlines
• Multi-tasking systems`,
        codeSnippets: []
      },
      {
        id: 'sec-37-2',
        title: '37.2 ARM Cortex-M Interrupt Architecture',
        content: `### Vector Table
The vector table contains addresses of exception and interrupt handlers. For Cortex-M4:
• Entries 0-15: System exceptions (NMI, HardFault, SysTick, etc.)
• Entries 16+: Device-specific interrupts (GPIO, UART, TIM, etc.)

### NVIC (Nested Vectored Interrupt Controller)
The NVIC manages interrupt enabling, prioritization, and nesting.

Key NVIC Registers:
| Register | Address | Purpose |
|----------|---------|---------|
| ISER0-7 | 0xE000E100 | Interrupt Set-Enable (write 1 to enable) |
| ICER0-7 | 0xE000E180 | Interrupt Clear-Enable (write 1 to disable) |
| ISPR0-7 | 0xE000E200 | Interrupt Set-Pending |
| ICPR0-7 | 0xE000E280 | Interrupt Clear-Pending |
| IABR0-7 | 0xE000E300 | Interrupt Active Bit (read-only) |
| IP0-239 | 0xE000E400 | Interrupt Priority (byte-accessible) |

### Priority and Preemption
• Higher priority = lower priority number (0 is highest)
• If BIR> in BASEPRI, interrupts with priority ≥ BIR are masked
• Higher priority interrupt can preempt lower priority ISR
• Same priority cannot nest (must finish before another same-priority can run)

### Exception Entry Sequence (Hardware Automatic)
1. Stacking: Push R0-R3, R12, LR, PC, xPSR to stack (8 registers, 32 bytes)
2. Fetch: Load handler address from vector table
3. Execute: Jump to handler

Total entry time: 12 cycles (minimum)

### EXC_RETURN
When an ISR finishes, it executes BX LR where LR contains a special EXC_RETURN value:
• 0xFFFFFFF1: Return to Thread mode using MSP
• 0xFFFFFFF9: Return to Thread mode using PSP
• 0xFFFFFFFD: Return to Thread mode using PSP, handshake pending exception

### Tail-Chaining
If a second interrupt is pending when the first ISR completes, the CPU skips restoring stacked registers and immediately enters the second ISR. This reduces transition latency to just 6 cycles.

### Interrupt Latency
The time from interrupt request to execution of first ISR instruction:
• Minimum: 12 cycles (exception entry)
• With tail-chaining: 6 cycles (back-to-back)
• With late-arriving: 12 cycles (higher priority arrives during stacking)`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'NVIC Enable Interrupt Example',
            code: `; Enable USART2 interrupt (IRQ 38)
; NVIC_ISER1 covers IRQs 32-63
; IRQ 38 - 32 = bit 6 in ISER1

LDR R0, =0xE000E104   ; NVIC_ISER1
MOV R1, #(1 << 6)     ; bit 6 = IRQ 38
STR R1, [R0]

; Set priority (optional, default is 0)
LDR R0, =0xE000E426   ; NVIC_IPR9 (IRQ 38 / 4 = 9.5 -> byte 38)
MOV R1, #0x80         ; priority 128 (mid-range)
STRB R1, [R0]

; Enable global interrupts
CPSIE i`
          }
        ]
      },
      {
        id: 'sec-37-3',
        title: '37.3 Writing Interrupt Service Routines',
        content: `### ISR Structure
An ISR must:
1. Be in the vector table (or use dynamic vector if VTOR allows)
2. Save any registers it modifies (unless using AAPCS-compliant code)
3. Clear the peripheral interrupt flag (critical!)
4. Return with BX LR (EXC_RETURN)

### Critical: Clear Interrupt Flag
If you don't clear the interrupt flag, the ISR will be called repeatedly in an infinite loop!

### Saving Context
Cortex-M hardware saves R0-R3, R12, LR, PC, xPSR automatically. If your ISR uses R4-R11, you must save/restore them manually:

Push {r4-r11}    ; save
; ... ISR code ...
Pop {r4-r11}     ; restore

### ISR Best Practices
1. Keep ISRs short and fast
2. Clear interrupt flags as early as possible
3. Don't use blocking operations (while loops)
4. Use volatile for shared variables
5. Consider using a ring buffer for UART receive
6. Avoid function calls that might re-enter

### ISR Example: UART Receive
When a byte is received, store it in a buffer or echo back immediately.`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'UART Receive ISR',
            code: `.thumb_func
.global USART2_IRQHandler
USART2_IRQHandler:
    ; Check RXNE flag
    LDR R0, =USART2_SR
    LDR R1, [R0]
    TST R1, #(1 << 5)    ; RXNE
    BEQ .exit

    ; Read byte (clears RXNE automatically!)
    LDR R0, =USART2_DR
    LDR R2, [R0]

    ; Echo back
    LDR R0, =USART2_DR
    STR R2, [R0]

.exit:
    BX LR                ; Return via EXC_RETURN

; Timer ISR example
.thumb_func
.global TIM2_IRQHandler
TIM2_IRQHandler:
    PUSH {r4-r11}        ; Save callee-saved registers

    ; Toggle LED
    LDR R0, =GPIOD_ODR
    LDR R1, [R0]
    EOR R1, R1, #(1<<12)
    STR R1, [R0]

    ; Clear update flag
    LDR R0, =TIM2_SR
    MOV R1, #0
    STR R1, [R0]

    POP {r4-r11}         ; Restore registers
    BX LR`
          }
        ]
      },
      {
        id: 'sec-37-4',
        title: '37.4 Shared Data and Critical Sections',
        content: `When ISRs and main code access shared variables, race conditions can occur.

### The Problem
Main code reads a 32-bit variable. Between reading the low and high halves, an ISR modifies it. The result is corrupted.

### Solution: Disable Interrupts
CPSID i          ; disable interrupts
; critical section
; ... access shared data ...
CPSIE i          ; enable interrupts

### Solution: Use Atomic Operations
For single-bit or single-word updates, use LDREX/STREX (exclusive load/store) or atomic registers like BSRR.

### Volatile Keyword
Variables modified by ISRs must be declared volatile in C. In assembly, this means:
• Always reload from memory before use
• Always store back immediately after modification
• Don't cache in registers across function calls

### Priority-Based Critical Sections
To only mask lower-priority interrupts:
MOV R0, #0x80    ; priority threshold
MSR BASEPRI, R0  ; only interrupts with priority >= 0x80 are masked
; ... critical section ...
MOV R0, #0
MSR BASEPRI, R0  ; unmask all

This allows higher-priority interrupts to still preempt!`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'Critical Section Examples',
            code: `; Example 1: Disable all interrupts
CPSID i
LDR R0, =shared_var
LDR R1, [R0]
ADD R1, R1, #1
STR R1, [R0]
CPSIE i

; Example 2: Priority-based masking
MOV R0, #0x80
MSR BASEPRI, R0   ; mask low-priority interrupts
; ... access shared data ...
MOV R0, #0
MSR BASEPRI, R0   ; unmask all

; Example 3: Atomic increment using LDREX/STREX
retry:
    LDREX R0, [R1]     ; exclusive load
    ADD R0, R0, #1
    STREX R2, R0, [R1] ; exclusive store
    CMP R2, #0
    BNE retry            ; retry if store failed`
          }
        ]
      },
      {
        id: 'sec-37-5',
        title: '37.5 Complete Example: Interrupt-Driven UART Echo',
        content: `We'll create a complete interrupt-driven UART echo system. The main loop can sleep or do other work while UART receive is handled in the background.

### System Architecture
1. UART receive interrupt triggers on each byte received
2. ISR stores byte in a ring buffer
3. Main loop reads from buffer and echoes back
4. Uses circular buffer to prevent data loss

### Ring Buffer Implementation
A ring buffer uses two pointers: head (write position) and tail (read position).
• When head == tail: buffer empty
• When (head+1) % SIZE == tail: buffer full
• Head advances on write, tail advances on read

### Advantages over Polling
• CPU can sleep or do other work while waiting
• No bytes lost even if main loop is busy
• Deterministic response time
• Lower power consumption`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'Interrupt-Driven UART with Ring Buffer',
            code: `.equ BUFFER_SIZE, 64
.equ BUFFER_MASK, 63

.section .bss
rx_head: .space 4
rx_tail: .space 4
rx_buffer: .space BUFFER_SIZE

.section .text
.thumb_func
.global USART2_IRQHandler
USART2_IRQHandler:
    PUSH {r4-r7, lr}

    ; Check RXNE
    LDR R0, =USART2_SR
    LDR R1, [R0]
    TST R1, #(1<<5)
    BEQ .exit

    ; Read byte
    LDR R0, =USART2_DR
    LDRB R4, [R0]

    ; Store in ring buffer
    LDR R5, =rx_head
    LDR R6, [R5]
    LDR R7, =rx_buffer
    STRB R4, [R7, R6]

    ; Advance head
    ADD R6, R6, #1
    AND R6, R6, #BUFFER_MASK
    STR R6, [R5]

.exit:
    POP {r4-r7, pc}

; Main: echo bytes from buffer
.global main
main:
    LDR r4, =rx_tail
    LDR r5, =rx_head
    LDR r6, =rx_buffer

.loop:
    CPSIE i            ; enable interrupts
    WFI                ; sleep until interrupt

    ; Check if buffer has data
    LDR r0, [r4]       ; tail
    LDR r1, [r5]       ; head
    CMP r0, r1
    BEQ .loop          ; empty, sleep again

    ; Read byte from buffer
    LDRB r2, [r6, r0]
    ADD r0, r0, #1
    AND r0, r0, #BUFFER_MASK
    STR r0, [r4]

    ; Echo back
    CPSID i
    LDR r7, =USART2_SR
.wait_tx:
    LDR r3, [r7]
    TST r3, #(1<<7)
    BEQ .wait_tx
    LDR r7, =USART2_DR
    STR r2, [r7]
    CPSIE i

    B .loop`
          }
        ]
      },
      {
        id: 'sec-37-6',
        title: '37.6 Debugging Interrupt-Driven Code',
        content: `Debugging ISRs can be challenging. Common issues and solutions:

### Common ISR Bugs
1. Not clearing interrupt flag → infinite ISR loop
2. Stack overflow in ISR (too many local variables)
3. Race conditions with shared data
4. Priority inversion (low-priority holds resource, high-priority waits)
5. Interrupt storm (too many interrupts, CPU never returns to main)

### Debugging Techniques
1. Toggle an LED at ISR entry/exit to verify it's being called
2. Use a counter variable to count ISR invocations
3. Check HardFault status registers for crash analysis
4. Use logic analyzer to verify interrupt timing
5. Enable only one interrupt at a time during development

### HardFault Analysis
When a HardFault occurs, check:
• CFSR (Configurable Fault Status Register): Shows fault type
• HFSR (HardFault Status Register): Shows hard fault source
• MMFAR (MemManage Fault Address): Shows faulting address
• BFAR (Bus Fault Address): Shows faulting address

Common causes:
• Stack overflow (corrupts other memory)
• Jumping to invalid address
• Accessing peripheral without clock enabled
• Unaligned access (on Cortex-M0)`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'HardFault Handler with LED Indicator',
            code: `.thumb_func
.global HardFault_Handler
HardFault_Handler:
    ; Turn on red LED (PD14) to indicate fault
    LDR R0, =0x40020C18   ; GPIOD_BSRR
    MOV R1, #(1<<14)      ; set bit 14
    STR R1, [R0]

    ; Read fault registers for debugging
    LDR R0, =0xE000ED28   ; CFSR
    LDR R1, [R0]
    LDR R2, =0xE000ED2C   ; HFSR
    LDR R3, [R2]

    ; Loop forever (infinite loop for debugger)
    B .

; Usage Fault Handler
.thumb_func
.global UsageFault_Handler
UsageFault_Handler:
    LDR R0, =0x40020C18
    MOV R1, #(1<<15)      ; PD15
    STR R1, [R0]
    B .`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-37-1',
        title: 'Exercise 37.1: Enable IRQ in NVIC',
        description: 'Enable USART2 (IRQ 38) in NVIC_ISER1.',
        solution: `LDR R0, =0xE000E104   ; NVIC_ISER1
MOV R1, #(1 << 6)     ; 38 - 32 = bit 6
STR R1, [R0]`,
        solutionLanguage: 'arm'
      },
      {
        id: 'ex-37-2',
        title: 'Exercise 37.2: Timer Interrupt',
        description: 'Write the ISR for TIM2 update interrupt. Toggle PD12 and clear the UIF flag.',
        solution: `TIM2_IRQHandler:
    LDR R0, =GPIOD_ODR
    LDR R1, [R0]
    EOR R1, R1, #(1<<12)
    STR R1, [R0]
    LDR R0, =TIM2_SR
    MOV R1, #0
    STR R1, [R0]
    BX LR`,
        solutionLanguage: 'arm'
      },
      {
        id: 'ex-37-3',
        title: 'Exercise 37.3: Priority Configuration',
        description: 'Set USART2 interrupt priority to 64 (higher than default 128).',
        solution: `; NVIC_IPR9 (IRQ 38 is byte 38 in priority register space)
LDR R0, =0xE000E426
MOV R1, #64           ; priority 64
STRB R1, [R0]`,
        solutionLanguage: 'arm'
      },
      {
        id: 'ex-37-4',
        title: 'Exercise 37.4: Nested Interrupts',
        description: 'Explain what happens when a higher-priority interrupt occurs during a lower-priority ISR.',
        solution: 'The higher-priority interrupt preempts the lower-priority ISR. Hardware saves additional context, and the higher-priority ISR executes. When it completes, the lower-priority ISR resumes. This is called interrupt nesting.',
        solutionLanguage: 'text'
      },
      {
        id: 'ex-37-5',
        title: 'Exercise 37.5: Ring Buffer Design',
        description: 'Design a ring buffer for UART receive with 128-byte capacity. Show the head/tail update logic.',
        solution: 'Use head (write pointer) and tail (read pointer). On receive: buffer[head] = byte; head = (head + 1) & 127. On read: byte = buffer[tail]; tail = (tail + 1) & 127. Empty when head == tail.',
        solutionLanguage: 'arm'
      }
    ],
    practiceQuestions: [
      {
        question: 'What is tail-chaining in ARM Cortex-M?',
        answer: 'Tail-chaining is a hardware optimization where if a second interrupt is pending while an ISR finishes, the CPU skips restoring the stacked registers and immediately enters the second ISR, reducing transition latency to just 6 cycles.'
      },
      {
        question: 'What is the difference between polling and interrupts?',
        answer: 'Polling requires the CPU to continuously check status flags in a loop, wasting cycles. Interrupts allow the hardware to signal the CPU when an event occurs, enabling efficient, deterministic response with lower latency and power consumption.'
      },
      {
        question: 'Why must ISRs clear the interrupt flag?',
        answer: 'If the interrupt flag is not cleared, the NVIC will immediately re-enter the ISR after it returns, creating an infinite loop that prevents the main code from executing and wastes CPU time.'
      },
      {
        question: 'What is EXC_RETURN and why is it used?',
        answer: 'EXC_RETURN is a special value loaded into the Link Register (LR) during exception entry. When the ISR executes BX LR, the hardware recognizes the EXC_RETURN value and automatically restores the stacked registers, returning to the interrupted code.'
      },
      {
        question: 'How do you protect shared data between ISR and main code?',
        answer: 'Methods include: 1) Disable interrupts (CPSID i/CPSIE i). 2) Use priority-based masking (BASEPRI). 3) Use atomic operations (LDREX/STREX). 4) Use hardware atomic registers (BSRR). 5) Use a ring buffer with proper synchronization.'
      },
      {
        question: 'What happens during a HardFault?',
        answer: 'A HardFault occurs for serious errors like invalid memory access, stack overflow, or executing invalid instructions. The CPU pushes registers to the stack, jumps to HardFault_Handler, and sets fault status registers (CFSR, HFSR) for debugging.'
      }
    ],
    summary: [
      'ISRs provide microsecond responsiveness to asynchronous hardware events.',
      'The NVIC manages preemption and deterministic prioritization.',
      'Hardware stacking/unstacking reduces ISR overhead.',
      'Tail-chaining enables efficient back-to-back interrupt handling.',
      'Always clear interrupt flags to prevent infinite ISR loops.',
      'Use critical sections to protect shared data.',
      'Keep ISRs short and non-blocking for best performance.',
      'Debug ISRs with LED indicators and fault register analysis.'
    ]
  },
  {
    id: 38,
    slug: 'chapter-38-low-power-bare-metal',
    level: 7,
    levelTitle: 'Embedded Systems and Real-Time Assembly',
    title: 'Chapter 38: Low-Power and Bare-Metal Programming',
    subtitle: 'WFI/WFE Instructions, Sleep Modes, Duty Cycling, and SLEEPONEXIT',
    learningObjectives: [
      'Understand the importance of power management in embedded systems.',
      'Master WFI (Wait For Interrupt) and WFE (Wait For Event) instructions.',
      'Configure sleep modes (Sleep, Deep Sleep, Stop, Standby) via System Control Register (SCR).',
      'Optimize energy consumption through clock gating and duty cycling.',
      'Implement a low-power timer-driven blinking LED system.',
      'Understand voltage scaling and dynamic power management.',
      'Measure and optimize power consumption in embedded applications.'
    ],
    prerequisites: ['Chapters 1–37'],
    keyConcepts: [
      'Power consumption in digital circuits: P = C × V² × f (dynamic) + V × I_leakage (static).',
      'WFI halts the CPU clock until an enabled interrupt wakes it.',
      'WFE halts until an event (interrupt, SEV, or wake-up event) occurs.',
      'SLEEPONEXIT automatically puts the CPU back to sleep on returning from an ISR.',
      'Duty cycling keeps the processor asleep >99% of the time to extend battery life.',
      'Clock gating disables unused peripheral clocks to reduce dynamic power.',
      'Voltage scaling reduces power by lowering supply voltage (requires frequency adjustment).',
      'Sleep modes: Sleep (CPU only), Deep Sleep (CPU + some peripherals), Stop (most clocks off), Standby (minimal power).',
      'RTC and wakeup sources: External interrupts, RTC alarms, UART activity can wake the MCU.'
    ],
    diagramType: 'low_power',
    sections: [
      {
        id: 'sec-38-1',
        title: '38.1 Why Low-Power Matters',
        content: `Power consumption is critical in battery-operated and energy-harvesting embedded systems.

### Power Consumption Components
• Dynamic Power: P_dynamic = C × V² × f (switching power)
  - C: capacitance (chip design)
  - V: supply voltage
  - f: switching frequency
• Static Power: P_static = V × I_leakage (leakage current)

### Key Insights
• Reducing voltage is most effective (P ∝ V²)
• Reducing frequency is linear but less effective
• Disabling clocks eliminates dynamic power for that block
• Deeper sleep modes reduce leakage

### Battery Life Estimation
For a CR2032 coin cell (220 mAh):
• Active mode (10 mA): ~22 hours
• Sleep mode (10 µA): ~2.5 years
• Standby mode (1 µA): ~25 years

### Power Domains
Modern MCUs have multiple power domains:
• Always-on domain: RTC, wakeup logic, backup registers
• Main domain: CPU, core peripherals
• I/O domain: GPIO pins, external interfaces

Each domain can be independently powered or clock-gated.`,
        codeSnippets: []
      },
      {
        id: 'sec-38-2',
        title: '38.2 WFI and WFE Instructions',
        content: `### WFI (Wait For Interrupt)
WFI halts the CPU clock until an enabled interrupt occurs. The CPU resumes execution at the next instruction after WFI.

Usage:
    wfi         ; CPU sleeps until interrupt
    nop         ; next instruction (first instruction after wake)

### WFE (Wait For Event)
WFE halts until an event occurs:
• Interrupt (if enabled)
• SEV (Send Event) instruction from another core
• External event signal
• Previous event (WFE maintains an event register)

### WFI vs WFE
| Feature | WFI | WFE |
|---------|-----|-----|
| Wake on interrupt | Yes | Yes |
| Wake on SEV | No | Yes |
| Event register | No | Yes |
| Typical use | Low-power sleep | Multi-core synchronization |

### Execution After Wake
After WFI/WFE, the CPU executes the next instruction. Common patterns:
1. Check if interrupt actually occurred
2. Re-check condition in a loop
3. Proceed to handle the event

### Important Notes
• WFI is interruptible by NMI and HardFault regardless of PRIMASK
• WFI respects BASEPRI and PRIMASK settings
• On Cortex-M4/M7, WFI also disables floating-point context save (if FPU is unused)`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'WFI Usage Patterns',
            code: `; Pattern 1: Simple WFI loop
loop:
    wfi                     ; sleep until interrupt
    ; handle interrupt or event
    b loop

; Pattern 2: WFI with condition check
main_loop:
    ldr r0, =flag
    ldr r1, [r0]
    cmp r1, #0
    bne handle_event
    wfi                     ; sleep if no event
    b main_loop

handle_event:
    ; process event
    mov r1, #0
    str r1, [r0]           ; clear flag
    b main_loop

; Pattern 3: WFE for multi-core sync
core0:
    sev                     ; send event to core1
    wfe                     ; wait for core1's event
    ; continue after sync

core1:
    wfe                     ; wait for core0's event
    sev                     ; send event to core0
    ; continue after sync`
          }
        ]
      },
      {
        id: 'sec-38-3',
        title: '38.3 Sleep Modes on ARM Cortex-M',
        content: `ARM Cortex-M provides multiple sleep modes with different power savings and wake-up times.

### Sleep Modes Overview
| Mode | CPU | Peripherals | Wake Time | Power |
|------|-----|-------------|-----------|-------|
| Sleep | Stopped | Running | Fastest (µs) | Medium |
| Deep Sleep | Stopped | Partially stopped | Fast (µs) | Low |
| Stop | Stopped | Most stopped | Slow (ms) | Very Low |
| Standby | Stopped | All stopped | Slowest (ms) | Lowest |

### System Control Register (SCR)
Address: 0xE000ED10

| Bit | Name | Description |
|-----|------|-------------|
| 1 | SLEEPDEEP | 1 = Deep sleep mode enabled |
| 2 | SLEEPONEXIT | 1 = Return to sleep on ISR exit |
| 4 | SEVONPEND | 1 = Send event on pending interrupt |

### Sleep (Normal Sleep)
• CPU clock halted
• All peripheral clocks continue
• Fastest wake-up (1-2 clock cycles)
• Use: Short idle periods, interrupt-driven systems

### Deep Sleep (Cortex-M specific)
• CPU clock halted
• Some peripheral clocks halted (varies by MCU)
• Faster wake-up than Sleep on some implementations
• Use: Medium idle periods

### Stop Mode (STM32 specific)
• CPU and most peripherals stopped
• Only LSE (32 kHz) or RTC continues
• Very low power (~2 µA)
• Wake-up via RTC, external interrupt, or UART
• Use: Long idle periods (seconds to minutes)

### Standby Mode (STM32 specific)
• Everything stopped except RTC and backup domain
• SRAM contents lost (except backup SRAM)
• Lowest power (~1-2 µA)
• Wake-up via WKUP pin, RTC, or reset
• Use: Very long idle periods, power-off scenarios`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'Sleep Mode Configuration',
            code: `.equ SCR, 0xE000ED10
.equ RCC_APB1ENR, 0x40023840
.equ PWR_CR, 0x40007000

; Enter Sleep mode
    cpsie i             ; ensure interrupts enabled
    wfi                 ; enter Sleep mode
    ; CPU wakes on any enabled interrupt

; Enter Deep Sleep mode
    ldr r0, =SCR
    ldr r1, [r0]
    orr r1, r1, #(1<<1)   ; SLEEPDEEP
    str r1, [r0]
    wfi

; Enter Stop mode (STM32)
    ldr r0, =PWR_CR
    ldr r1, [r0]
    orr r1, r1, #(1<<0)   ; PDDS (Power Down Deep Sleep)
    str r1, [r0]
    ldr r0, =SCR
    ldr r1, [r0]
    orr r1, r1, #(1<<1)   ; SLEEPDEEP
    str r1, [r0]
    wfi

; Enter Standby mode (STM32)
    ldr r0, =PWR_CR
    ldr r1, [r0]
    orr r1, r1, #(1<<1)   ; PDDS
    str r1, [r0]
    ldr r0, =SCR
    ldr r1, [r0]
    orr r1, r1, #(1<<1)   ; SLEEPDEEP
    str r1, [r0]
    wfi                     ; MCU resets after entering Standby`
          }
        ]
      },
      {
        id: 'sec-38-4',
        title: '38.4 Clock Gating and Peripheral Power Management',
        content: `Clock gating is the most effective way to reduce dynamic power. If a peripheral's clock is disabled, it consumes no dynamic power.

### STM32F4 Clock Domains
| Domain | Control Register | Peripherals |
|--------|------------------|-------------|
| AHB1 | RCC_AHB1ENR | GPIO, DMA, CRC, FLASH, RCC |
| AHB2 | RCC_AHB2ENR | USB, ADC |
| APB1 | RCC_APB1ENR | TIM2-7, USART2-3, I2C1-3, PWR |
| APB2 | RCC_APB2ENR | TIM1, USART1, ADC1-3, SPI1 |

### Clock Gating Strategy
1. Identify unused peripherals at startup
2. Disable their clocks immediately
3. Only enable clocks when needed
4. Disable after use if not needed continuously

### Example: Disable All Unused Peripherals
At reset, many peripheral clocks are enabled by default. Disable unused ones:

### I/O Pin Configuration for Low Power
• Set unused pins to analog mode (high impedance)
• Avoid floating inputs (causes leakage)
• Configure pull-up/pull-down as needed
• Don't leave pins toggling unnecessarily

### Voltage Scaling
Some MCUs support voltage scaling to trade performance for power:
• Scale 1 (high performance): Full speed
• Scale 2 (medium): Reduced max frequency
• Scale 3 (low power): Minimum frequency

Power savings from voltage scaling can be 30-50%.`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'Clock Gating Example',
            code: `.equ RCC_AHB1ENR, 0x40023830
.equ RCC_APB1ENR, 0x40023840
.equ RCC_APB2ENR, 0x40023844

Reset_Handler:
    ; Enable only GPIOD clock (bit 3)
    ldr r0, =RCC_AHB1ENR
    ldr r1, [r0]
    orr r1, r1, #(1<<3)    ; GPIOD only
    str r1, [r0]

    ; Disable GPIOA, GPIOB, GPIOC, GPIOE, GPIOF, GPIOG, GPIOH
    ; (already cleared by default, but explicit for clarity)
    ldr r1, [r0]
    bic r1, r1, #((1<<0)|(1<<1)|(1<<2)|(1<<4)|(1<<5)|(1<<6)|(1<<7))
    str r1, [r0]

    ; Enable only TIM2 clock (bit 0 in APB1)
    ldr r0, =RCC_APB1ENR
    ldr r1, [r0]
    orr r1, r1, #1         ; TIM2 only
    str r1, [r0]

    ; Disable USART2, USART3, I2C1, I2C2, I2C3, PWR
    ldr r1, [r0]
    bic r1, r1, #((1<<17)|(1<<18)|(1<<21)|(1<<22)|(1<<23)|(1<<28))
    str r1, [r0]

    ; Set unused GPIO pins to analog mode (11 in MODER)
    ; This reduces leakage on floating pins`
          }
        ]
      },
      {
        id: 'sec-38-5',
        title: '38.5 SLEEPONEXIT and ISR-Only Systems',
        content: `SLEEPONEXIT is a powerful feature for interrupt-driven systems where the main thread does nothing.

### How SLEEPONEXIT Works
When SLEEPONEXIT=1:
1. CPU starts, configures peripherals, enables interrupts
2. CPU executes WFI to sleep
3. Interrupt occurs, CPU wakes and runs ISR
4. ISR completes, CPU returns from exception
5. Instead of returning to thread mode, CPU immediately sleeps again

This means:
• No main loop needed
• CPU spends almost zero time executing instructions
• Maximum power savings

### Use Cases
• Sensor nodes that only wake on interrupt
• RTC-based wakeup systems
• UART-activated devices
• Button-press responders

### Implementation
1. Set SLEEPONEXIT in SCR
2. Configure all interrupts
3. Execute WFI once
4. CPU will sleep-wake-sleep-wake automatically

### Important: ISR Must Be Complete
Since the CPU never returns to main thread, the ISR must:
• Handle all system functions
• Clear all interrupt flags
• Not rely on main thread variables being updated

### SLEEPONEXIT vs Normal Sleep
| Feature | Normal Sleep | SLEEPONEXIT |
|---------|--------------|-------------|
| Main loop | Runs between ISRs | Never runs |
| Wake-up | ISR returns to main | ISR returns to sleep |
| Power | Higher (main loop active) | Lower (only ISRs run) |
| Complexity | Simple | Requires ISR-only design |`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'SLEEPONEXIT System',
            code: `.equ SCR, 0xE000ED10

Reset_Handler:
    ; Initialize peripherals
    bl init_gpio
    bl init_timer
    bl init_uart

    ; Enable interrupts
    cpsie i

    ; Enter sleep with SLEEPONEXIT
    ldr r0, =SCR
    ldr r1, [r0]
    orr r1, r1, #(1<<1)    ; SLEEPDEEP (optional)
    orr r1, r1, #(1<<2)    ; SLEEPONEXIT
    str r1, [r0]

    wfi                     ; CPU sleeps until interrupt
                            ; After ISR, returns to sleep automatically

; Main loop (never reached!)
main_loop:
    b main_loop

; Example ISR
TIM2_IRQHandler:
    ldr r0, =GPIOD_ODR
    ldr r1, [r0]
    eor r1, r1, #(1<<12)   ; toggle LED
    str r1, [r0]
    ; Clear interrupt flag
    ldr r0, =TIM2_SR
    mov r1, #0
    str r1, [r0]
    bx lr                   ; Returns to sleep, not main_loop!`
          }
        ]
      },
      {
        id: 'sec-38-6',
        title: '38.6 Duty Cycling and Wake-Up Sources',
        content: `Duty cycling alternates between active and sleep modes to minimize average power consumption.

### Duty Cycle Calculation
Duty Cycle = T_active / (T_active + T_sleep)

Power_saver = 1 - Duty_Cycle

Example: Active 1ms every 1000ms = 0.1% duty cycle
Power savings: 99.9% reduction in dynamic power

### Wake-Up Sources
| Source | Speed | Use Case |
|--------|-------|----------|
| External Interrupt (EXTI) | Fastest (µs) | Button, sensor |
| RTC Alarm | Slow (ms) | Scheduled tasks |
| UART Activity | Fast (µs) | Communication |
| Timer Overflow | Fast (µs) | Periodic tasks |
| Watchdog | Slow (ms) | Safety recovery |

### EXTI Configuration for Wake-Up
External interrupts can wake from any sleep mode:
1. Configure GPIO pin as input with interrupt
2. Select edge (rising/falling/both) in EXTI
3. Enable EXTI interrupt in NVIC
4. Enable wakeup in PWR (for Stop/Standby modes)

### RTC Wake-Up
RTC can generate periodic wakeup:
1. Configure RTC prescaler for 1 Hz or slower
2. Set alarm or wake-up timer
3. Enable RTC wake-up interrupt
4. MCU wakes at configured interval

### Multi-Period Wake-Up
For different wakeup intervals:
• Use RTC for long periods (hours, days)
• Use TIM for medium periods (seconds, minutes)
• Use SysTick for short periods (milliseconds)

### Example: Battery-Powered Sensor
A soil moisture sensor that:
1. Sleeps 99.9% of the time
2. Wakes every 5 minutes via RTC
3. Takes 10 measurements (10 ms each)
4. Averages and stores result
5. Transmits via LoRa (if needed)
6. Returns to sleep

Battery life with CR2032: >5 years!`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'RTC Wake-Up Configuration',
            code: `.equ RTC_BASE, 0x40028000
.equ RTC_CR, RTC_BASE + 0x04
.equ RTC_ISR, RTC_BASE + 0x0C
.equ RTC_WUTR, RTC_BASE + 0x2C
.equ PWR_CR, 0x40007000

configure_rtc_wakeup:
    ; Enable RTC clock
    ldr r0, =RCC_APB1ENR
    ldr r1, [r0]
    orr r1, r1, #(1<<28)   ; RTCEN
    str r1, [r0]

    ; Enable RTC wakeup timer interrupt
    ldr r0, =RTC_CR
    ldr r1, [r0]
    orr r1, r1, #(1<<10)   ; WUTE (wake-up timer enable)
    str r1, [r0]

    ; Set wake-up reload value (e.g., 30000 = 30 seconds at 1 Hz)
    ldr r0, =RTC_WUTR
    ldr r1, =30000
    str r1, [r0]

    ; Enable PWR clock and wakeup pin
    ldr r0, =PWR_CR
    ldr r1, [r0]
    orr r1, r1, #(1<<8)    ; UWUF (wake-up flag)
    str r1, [r0]

    ; Enter Stop mode with RTC wake-up
    ldr r0, =SCR
    ldr r1, [r0]
    orr r1, r1, #(1<<1)    ; SLEEPDEEP
    str r1, [r0]

    cpsie i
    wfi                     ; sleep until RTC wake-up`
          }
        ]
      },
      {
        id: 'sec-38-7',
        title: '38.7 Measuring and Optimizing Power',
        content: `### Power Measurement Techniques
1. Inline Ammeter: Measure current directly (most accurate)
2. Power Monitor: Specialized tools (e.g., Nordic Power Profiler)
3. MCU Internal ADC: Measure voltage across sense resistor
4. Energy Harvesting: Measure charge/discharge cycles

### Common Power Optimization Techniques
| Technique | Power Savings | Complexity |
|-----------|---------------|------------|
| Clock gating | 20-50% | Low |
| Sleep modes | 50-99% | Medium |
| Voltage scaling | 30-50% | Medium |
| Peripheral batching | 10-30% | Medium |
| DMA transfers | 20-40% | High |
| Optimized algorithms | 10-50% | High |

### Peripheral Batching
Instead of handling each peripheral immediately:
1. Collect multiple events/tasks
2. Wake up and process all at once
3. Return to sleep immediately

Reduces wake-up overhead and active time.

### DMA for Power Efficiency
DMA transfers data without CPU involvement:
• CPU can sleep during DMA transfers
• Useful for ADC, UART, SPI, I2C
• Reduces CPU active time significantly

### Software Optimization Tips
1. Use lookup tables instead of computation
2. Optimize algorithms for fewer operations
3. Avoid floating-point (use fixed-point)
4. Use appropriate data types (uint8_t vs uint32_t)
5. Minimize function call overhead
6. Unroll small loops

### Power Budgeting
Create a power budget during design:
1. Estimate active time per cycle
2. Calculate current for each mode
3. Sum weighted by duty cycle
4. Verify against battery capacity
5. Add safety margin (20-30%)

Example Budget:
• Active (10 mA × 1 ms): 10 µAs
• Sleep (2 µA × 999 ms): 1.998 µAs
• Total per second: ~12 µAs
• Average current: ~12 µA
• CR2032 life: 220 mAh / 12 µA ≈ 5 years`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'Power Optimization Examples',
            code: `; Example 1: Batch ADC readings
; Instead of reading ADC one at a time, use DMA to read all channels

; Configure DMA for ADC
ldr r0, =DMA2_S0CR
ldr r1, [r0]
orr r1, r1, #(1<<0)       ; EN
str r1, [r0]

; CPU can sleep while DMA transfers
wfi
; DMA completion interrupt wakes CPU

; Example 2: Optimize loop for power
; Bad: Check every iteration
loop_bad:
    ldr r0, =flag
    ldr r1, [r0]
    cmp r1, #0
    beq loop_bad

; Better: Sleep between checks
loop_better:
    wfi
    ldr r0, =flag
    ldr r1, [r0]
    cmp r1, #0
    beq loop_better

; Example 3: Use smaller data types
; Bad: Use 32-bit for small values
mov r0, #0           ; wastes 32 bits
ldr r1, [r0]

; Better: Use 8-bit when possible
ldrb r0, [r1]        ; load only 8 bits`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-38-1',
        title: 'Exercise 38.1: Duty Cycling Power Calculation',
        description: 'An MCU draws 10mA for 6ms every 10 seconds, and 2uA when asleep. Calculate average current draw and battery life with CR2032 (220 mAh).',
        solution: 'Active charge = 10mA × 6ms = 60 µAs. Sleep charge = 2µA × 9994ms = 19.99 µAs. Total per 10s = 79.99 µAs. Average current = 79.99 µAs / 10s = 8 µA. Battery life = 220 mAh / 8 µA ≈ 3.1 years.',
        solutionLanguage: 'c'
      },
      {
        id: 'ex-38-2',
        title: 'Exercise 38.2: SLEEPONEXIT Implementation',
        description: 'Design an interrupt-only system that toggles an LED every 500ms using SLEEPONEXIT. No main loop allowed.',
        solution: 'Set SLEEPONEXIT in SCR, configure TIM2 for 500ms interrupt, enable TIM2 interrupt in NVIC, execute WFI. TIM2_IRQHandler toggles LED and clears UIF.',
        solutionLanguage: 'arm'
      },
      {
        id: 'ex-38-3',
        title: 'Exercise 38.3: Clock Gating Strategy',
        description: 'Write code to disable all peripheral clocks except GPIOD and TIM2 on STM32F4.',
        solution: 'Write to RCC_AHB1ENR to enable only GPIOD (bit 3). Write to RCC_APB1ENR to enable only TIM2 (bit 0). Write to RCC_APB2ENR to disable all.',
        solutionLanguage: 'arm'
      },
      {
        id: 'ex-38-4',
        title: 'Exercise 38.4: Wake-Up Source Configuration',
        description: 'Configure an external interrupt on PA0 to wake from Stop mode on rising edge.',
        solution: 'Configure PA0 as input with pull-down, configure EXTI0 for rising edge, enable EXTI0 in NVIC, enable wakeup in PWR, set SLEEPDEEP, enter Stop mode with WFI.',
        solutionLanguage: 'arm'
      },
      {
        id: 'ex-38-5',
        title: 'Exercise 38-5: Power Budget Analysis',
        description: 'Create a power budget for a weather station that: wakes every 5 minutes, reads sensors for 50ms at 15mA, transmits data for 100ms at 40mA, then sleeps. Calculate battery life with 1000mAh battery.',
        solution: 'Active time per cycle: 50ms + 100ms = 150ms. Energy per cycle: (15mA×50ms) + (40mA×100ms) = 4.75 mAs. Sleep time: 299850ms. Sleep energy: 10µA×299.85s = 3 mAs. Total: 7.75 mAs per 5min. Average current: 7.75/300 = 25.8 µA. Battery life: 1000mAh / 25.8µA ≈ 4.4 years.',
        solutionLanguage: 'c'
      }
    ],
    practiceQuestions: [
      {
        question: 'What is the benefit of the SLEEPONEXIT bit in low-power systems?',
        answer: 'It avoids having the CPU return to thread mode and execute instructions in an idle loop between interrupts. The CPU returns directly from the ISR back into sleep mode, minimizing energy consumption and simplifying interrupt-only designs.'
      },
      {
        question: 'What is the difference between WFI and WFE?',
        answer: 'WFI halts the CPU until an enabled interrupt occurs. WFE halts until an event (interrupt, SEV instruction, or external event) occurs. WFE is useful for multi-core synchronization, while WFI is simpler for single-core low-power sleep.'
      },
      {
        question: 'How does clock gating reduce power consumption?',
        answer: 'Clock gating disables the clock signal to unused peripherals. Without a clock, the peripheral logic cannot switch states, eliminating dynamic power consumption (P = C × V² × f). This can reduce power by 20-50% depending on which peripherals are disabled.'
      },
      {
        question: 'What is the difference between Sleep, Stop, and Standby modes?',
        answer: 'Sleep stops only the CPU (peripherals continue). Stop stops CPU and most peripherals (only RTC continues, ~2µA). Standby stops everything except RTC and backup domain (~1µA), but SRAM contents are lost. Deeper modes have lower power but slower wake-up.'
      },
      {
        question: 'How do you calculate battery life for an embedded system?',
        answer: 'Calculate average current: I_avg = (I_active × T_active + I_sleep × T_sleep) / (T_active + T_sleep). Battery life = Battery capacity (mAh) / I_avg (mA). Add 20-30% safety margin for self-discharge and environmental factors.'
      },
      {
        question: 'What is duty cycling and why is it important?',
        answer: 'Duty cycling alternates between active and sleep modes to minimize average power consumption. A 1% duty cycle means the MCU is active 1% of the time and sleeping 99%, reducing average power by ~99%. This is essential for battery-powered devices to achieve years of operation.'
      }
    ],
    summary: [
      'Power consumption is critical in battery-operated embedded systems.',
      'WFI and WFE halt the CPU until an interrupt or event occurs.',
      'Multiple sleep modes provide trade-offs between power savings and wake-up time.',
      'Clock gating eliminates dynamic power for unused peripherals.',
      'SLEEPONEXIT enables efficient interrupt-only systems without a main loop.',
      'Duty cycling keeps the processor asleep >99% of the time for maximum battery life.',
      'Voltage scaling reduces power by lowering supply voltage.',
      'Power budgeting is essential for predicting battery life during design.',
      'DMA and peripheral batching reduce CPU active time.',
      'Always configure unused pins to analog mode to prevent leakage.'
    ]
  },
  {
    id: 39,
    slug: 'chapter-39-bootloaders-firmware-development',
    level: 7,
    levelTitle: 'Embedded Systems and Real-Time Assembly',
    title: 'Chapter 39: Bootloaders and Firmware Development',
    subtitle: 'Flash Memory Partitioning, VTOR Relocation, CRC Integrity, and Jump to App',
    learningObjectives: [
      'Understand the purpose and architecture of bootloaders in embedded systems.',
      'Design flash memory layouts separating bootloader and application zones.',
      'Relocate the vector table to application space using the VTOR register.',
      'Set the Main Stack Pointer (MSR MSP) and branch to application reset handler.',
      'Verify firmware binary integrity with CRC32 before execution.',
      'Understand firmware update mechanisms and safety considerations.',
      'Implement basic bootloader with application jump and CRC verification.'
    ],
    prerequisites: ['Chapters 1–38'],
    keyConcepts: [
      'Bootloader: Small program that runs at startup, checks for updates, and jumps to application.',
      'VTOR (0xE000ED08) relocates the vector table from 0x08000000 to the app offset.',
      'The jump sequence sets MSP to the application stack and branches to app Reset_Handler.',
      'Firmware headers include magic numbers, version, size, and checksums.',
      'Flash memory must be partitioned to prevent bootloader overwrite.',
      'CRC32 provides error detection for firmware integrity verification.',
      'Safe firmware update: validate new firmware before erasing old one.',
      'Dual-bank flash enables atomic firmware updates (A/B partitioning).',
      'Watchdog timer can recover from failed firmware updates.'
    ],
    diagramType: 'bootloaders',
    sections: [
      {
        id: 'sec-39-1',
        title: '39.1 Why Bootloaders?',
        content: `A bootloader is a small program that runs when the MCU powers up. Its primary purposes are:

### Bootloader Functions
1. **Firmware Update**: Receive new firmware via UART, USB, SPI, or other interface
2. **Integrity Check**: Verify firmware is valid before executing
3. **Application Selection**: Choose which application to run (dual-bank)
4. **Recovery Mode**: Enter recovery if application is corrupted
5. **Diagnostics**: Run self-tests or report system status

### Boot Process
1. MCU reset → Bootloader starts at 0x08000000
2. Check if update is requested (button, magic number, etc.)
3. If update: receive new firmware, verify, write to flash
4. If no update: verify existing firmware integrity
5. Jump to application at defined offset

### Flash Memory Partitioning
Typical layout for 512 KB flash:
| Region | Address | Size | Purpose |
|--------|---------|------|---------|
| Bootloader | 0x08000000 | 16 KB | Bootloader code |
| Application | 0x08004000 | 496 KB | User application |
| Backup (optional) | - | 496 KB | Previous firmware |

### Safety Considerations
• Never erase bootloader while running from it
• Verify firmware before erasing old one
• Use backup/restore for critical applications
• Implement watchdog for recovery
• Consider power failure during update

### Common Bootloader Protocols
• XMODEM: Simple, widely supported
• YMODEM: Improved XMODEM with 1K blocks
• ST-Link: STM32 specific, fast
• DFU (Device Firmware Upgrade): USB-based
• Custom: Application-specific protocols`,
        codeSnippets: []
      },
      {
        id: 'sec-39-2',
        title: '39.2 Flash Memory Layout and Protection',
        content: `### Flash Memory Characteristics
• Non-volatile: Retains data without power
• Erase before write: Must erase sector/block before programming
• Limited writes: Typically 10,000-100,000 erase cycles
• Sector erase: STM32F4 has sectors of 16KB, 64KB, 128KB
• Write protection: Can protect bootloader from accidental erasure

### Flash Programming Sequence
1. Unlock flash (if write-protected)
2. Erase sector(s)
3. Program word/byte
4. Verify (optional)
5. Lock flash

### Flash Registers (STM32F4)
| Register | Address | Purpose |
|----------|---------|---------|
| FLASH_ACR | 0x40023C00 | Access control (latency, prefetch) |
| FLASH_KEYR | 0x40023C04 | Unlock key |
| FLASH_SR | 0x40023C0C | Status register |
| FLASH_CR | 0x40023C10 | Control register (erase, program) |
| FLASH_OPTCR | 0x40023C14 | Option control (write protection) |

### Write Protection
STM32 provides sector-level write protection:
• Read-out protection (ROP): Prevents debug access
• Write protection (WRP): Prevents sector erasure/programming
• Option bytes: Configured at boot or via debugger

### Dual-Bank Flash
Some MCUs support dual-bank flash:
• Bank A: Current firmware
• Bank B: New firmware (or backup)
• Can erase one bank while running from other
• Enables atomic firmware updates

### Flash Erase Considerations
• Erase time: 1-8 seconds per sector (depending on size)
• Power consumption: High during erase
• Risk of power loss: Can corrupt data
• Mitigation: Checksum, journaling, dual-bank`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'Flash Unlock and Erase',
            code: `.equ FLASH_KEYR, 0x40023C04
.equ FLASH_SR,   0x40023C0C
.equ FLASH_CR,   0x40023C10

flash_unlock:
    ldr r0, =FLASH_KEYR
    ldr r1, =0x45670123    ; KEY1
    str r1, [r0]
    ldr r1, =0xCDEF89AB    ; KEY2
    str r1, [r0]
    bx lr

flash_erase_sector:
    ; R0 = sector number (0-7 for STM32F407)
    ldr r1, =FLASH_CR
wait_bsy:
    ldr r2, =FLASH_SR
    ldr r3, [r2]
    tst r3, #(1<<16)       ; BSY flag
    bne wait_bsy

    ldr r3, [r1]
    orr r3, r3, #(1<<13)   ; SER (sector erase)
    orr r3, r3, r0, lsl #3 ; sector number
    str r3, [r1]

    ; Start erase
    ldr r3, [r1]
    orr r3, r3, #(1<<16)   ; STRT
    str r3, [r1]

    ; Wait for completion
wait_bsy2:
    ldr r2, =FLASH_SR
    ldr r3, [r2]
    tst r3, #(1<<16)
    bne wait_bsy2

    ; Clear flags
    ldr r3, [r1]
    bic r3, r3, #(1<<13)
    str r3, [r1]
    bx lr`
          }
        ]
      },
      {
        id: 'sec-39-3',
        title: '39.3 CRC32 Firmware Verification',
        content: `CRC32 (Cyclic Redundancy Check) is commonly used to verify firmware integrity.

### CRC32 Algorithm
CRC32 computes a 32-bit checksum based on polynomial division:
• Polynomial: 0x04C11DB7 (standard) or 0xEDB88320 (reversed)
• Initial value: 0xFFFFFFFF
• Final XOR: 0xFFFFFFFF

### Why CRC32?
• Fast to compute (can be hardware-accelerated)
• Good error detection (detects 99.9999% of errors)
• Simple implementation
• Well-understood and widely supported

### Firmware Header Structure
A firmware header contains metadata for verification:
| Field | Size | Purpose |
|-------|------|---------|
| Magic | 4 bytes | Identifies valid firmware (e.g., 0xDEADBEEF) |
| Version | 4 bytes | Firmware version number |
| Size | 4 bytes | Firmware size in bytes |
| CRC32 | 4 bytes | CRC32 of firmware data |
| Entry | 4 bytes | Reset handler address |
| Reserved | 4 bytes | Future use |

### CRC32 Implementation in Assembly
CRC32 can be implemented efficiently using:
1. Table-based: Pre-computed 256-entry table (fast)
2. Bitwise: Compute one bit at a time (slow, small code)
3. Hardware: Use CRC peripheral if available (fastest)

### Verification Process
1. Read firmware header from flash
2. Verify magic number
3. Compute CRC32 over firmware data
4. Compare with stored CRC32
5. If match: valid firmware, jump to application
6. If mismatch: invalid firmware, stay in bootloader`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'CRC32 Table-Based Implementation',
            code: `.section .data
crc32_table:
    .word 0x00000000, 0x77073096, 0xEE0E612C, 0x990951BA
    .word 0x076DC419, 0x706AF48F, 0xE963A535, 0x9E6495A3
    ; ... (256 entries total)

.section .text
; R0 = data pointer, R1 = data length
; Returns R0 = CRC32 value
crc32_calc:
    push {r4-r7, lr}
    ldr r2, =0xFFFFFFFF    ; initial CRC
    ldr r3, =crc32_table

crc_loop:
    ldrb r4, [r0], #1      ; load byte, increment pointer
    eor r5, r2, r4         ; CRC ^ byte
    and r6, r5, #0xFF      ; index = (CRC ^ byte) & 0xFF
    ldr r7, [r3, r6, lsl #2]  ; table[index]
    lsr r2, r2, #8         ; CRC >> 8
    eor r2, r2, r7         ; (CRC >> 8) ^ table[index]
    subs r1, r1, #1
    bne crc_loop

    eor r0, r2, #0xFFFFFFFF  ; final XOR
    pop {r4-r7, pc}`
          }
        ]
      },
      {
        id: 'sec-39-4',
        title: '39.4 Bootloader Jump to Application',
        content: `The critical bootloader function is jumping to the application. This requires careful setup.

### Jump Sequence
1. Disable all interrupts (CPSID i)
2. Update VTOR to application vector table
3. Load application stack pointer from vector table
4. Load application reset handler address
5. Branch to application reset handler

### VTOR (Vector Table Offset Register)
Address: 0xE000ED08
Purpose: Relocates the vector table from default (0x00000000) to any 256-byte aligned address

### Stack Pointer Setup
The application's initial stack pointer is stored at offset 0 in its vector table. The bootloader must load this value and set MSP.

### Important Considerations
• Disable all peripherals before jump (prevent spurious interrupts)
• Clear pending interrupts in NVIC
• Disable SysTick (it may conflict with application)
• Ensure clock configuration is compatible
• Consider reset vs. jump (some peripherals need reset)

### Failed Jump Recovery
If application fails to start (e.g., invalid code), bootloader should:
1. Detect failure (watchdog, timeout, or return)
2. Log the failure
3. Attempt recovery (re-flash, enter recovery mode)
4. Never get stuck in an infinite loop

### Application Requirements
For the application to work after bootloader jump:
1. Must have valid vector table at expected address
2. Must handle its own clock configuration
3. Must initialize its own peripherals
4. Should not assume any specific startup state`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'Complete Bootloader Jump',
            code: `.equ APP_BASE, 0x08004000
.equ VTOR,     0xE000ED08
.equ NVIC_ICPR0, 0xE000E280   ; Interrupt Clear-Pending

JumpToApplication:
    ; Step 1: Disable all interrupts
    cpsid i

    ; Step 2: Disable SysTick
    ldr r0, =0xE000E010       ; SysTick_CSR
    mov r1, #0
    str r1, [r0]

    ; Step 3: Clear all NVIC pending interrupts
    ldr r0, =NVIC_ICPR0
    ldr r1, =0xFFFFFFFF
    str r1, [r0]              ; Clear 0-31
    add r0, r0, #4
    str r1, [r0]              ; Clear 32-63
    ; ... continue for all NVIC registers

    ; Step 4: Update VTOR
    ldr r0, =APP_BASE
    ldr r1, =VTOR
    str r0, [r1]

    ; Step 5: Load initial stack pointer
    ldr r2, [r0]              ; first word = initial SP
    msr msp, r2

    ; Step 6: Load reset handler address
    ldr r3, [r0, #4]          ; second word = reset handler

    ; Step 7: Jump to application
    bx r3

    ; Should never reach here
    b .`
          }
        ]
      },
      {
        id: 'sec-39-5',
        title: '39.5 Firmware Update Protocol',
        content: `A robust firmware update protocol ensures reliable field updates.

### Update States
1. **Idle**: No update in progress
2. **Receiving**: Downloading new firmware
3. **Validating**: Verifying CRC32 and other checks
4. **Flashing**: Writing to flash memory
5. **Verifying**: Reading back and comparing
6. **Complete**: Update successful
7. **Failed**: Update failed, restore backup

### Simple UART Update Protocol
1. Host sends "UPDATE" command
2. Bootloader enters receive mode
3. Host sends firmware size (4 bytes)
4. Host sends firmware data (N bytes)
5. Host sends CRC32 (4 bytes)
6. Bootloader verifies CRC
7. If valid: erase old firmware, write new, verify
8. If invalid: reject, stay in bootloader

### Packet Structure
| Field | Size | Purpose |
|-------|------|---------|
| Sync | 2 bytes | 0xAA55 synchronization |
| Command | 1 byte | 0x01=Write, 0x02=Verify, 0x03=Jump |
| Length | 2 bytes | Payload length |
| Payload | N bytes | Data |
| CRC16 | 2 bytes | CRC16 of packet |

### Error Handling
• Timeout: If no data for N seconds, abort
• CRC mismatch: Request retransmission
• Flash error: Retry, then abort
• Power loss: Dual-bank prevents corruption
• Communication error: Retry with backoff

### Security Considerations
• Authenticate firmware (HMAC, digital signature)
• Encrypt firmware (prevent reverse engineering)
• Prevent downgrade attacks (version checking)
• Secure boot chain (root of trust)`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'Simple Firmware Update Handler',
            code: `; UART-based firmware update
; Assumes USART2 already initialized

uart_update_handler:
    push {r4-r7, lr}

    ; Wait for "UPDATE" command
    bl uart_receive_string
    ldr r0, =update_cmd
    bl strcmp
    cmp r0, #0
    bne .not_update

    ; Send "OK" response
    ldr r0, =ok_msg
    bl uart_send_string

    ; Receive firmware size (4 bytes)
    bl uart_receive_word      ; R0 = size
    mov r4, r0               ; R4 = firmware size

    ; Receive firmware data
    ldr r5, =APP_BASE
    mov r6, #0               ; R6 = bytes received

.receive_loop:
    cmp r6, r4
    beq .receive_done
    bl uart_receive_byte
    strb r0, [r5, r6]
    add r6, r6, #1
    b .receive_loop

.receive_done:
    ; Receive CRC32
    bl uart_receive_word
    mov r7, r0               ; R7 = expected CRC

    ; Calculate CRC32 over received data
    mov r0, r5               ; data pointer
    mov r1, r4               ; data length
    bl crc32_calc

    ; Compare CRCs
    cmp r0, r7
    bne .crc_error

    ; CRC OK - verify and jump
    bl verify_firmware
    cmp r0, #0
    bne .verify_error

    ; Update successful
    ldr r0, =success_msg
    bl uart_send_string
    b JumpToApplication

.crc_error:
.verify_error:
.not_update:
    pop {r4-r7, pc}`
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
      },
      {
        id: 'ex-39-2',
        title: 'Exercise 39.2: Flash Erase Implementation',
        description: 'Write a function to erase flash sector 5 (0x08020000-0x0803FFFF) on STM32F4.',
        solution: 'Unlock flash (write KEY1=0x45670123, KEY2=0xCDEF89AB to FLASH_KEYR). Wait for BSY clear. Set SER bit and sector number in FLASH_CR. Set STRT bit. Wait for BSY clear.',
        solutionLanguage: 'arm'
      },
      {
        id: 'ex-39-3',
        title: 'Exercise 39.3: CRC32 Verification',
        description: 'Implement CRC32 calculation for a 1KB firmware image at 0x08004000.',
        solution: 'Use table-based CRC32 algorithm. Initialize CRC=0xFFFFFFFF. For each byte, XOR with CRC, use as index into 256-entry table, update CRC. Final XOR with 0xFFFFFFFF.',
        solutionLanguage: 'arm'
      },
      {
        id: 'ex-39-4',
        title: 'Exercise 39.4: Bootloader Header Structure',
        description: 'Design a firmware header with magic number, version, size, CRC32, and entry point.',
        solution: 'Offset 0: Magic (0xDEADBEEF), Offset 4: Version, Offset 8: Size, Offset 12: CRC32, Offset 16: Entry point. Total 20 bytes. Application starts at offset 32 (20-byte header + 12 bytes padding for alignment).',
        solutionLanguage: 'arm'
      },
      {
        id: 'ex-39-5',
        title: 'Exercise 39-5: Dual-Bank Update Logic',
        description: 'Design a dual-bank bootloader that can update firmware without power loss risk.',
        solution: 'Bank A (0x08000000): Current firmware. Bank B (0x08040000): Backup/New firmware. On update: receive new firmware to Bank B, verify CRC, swap banks by updating VTOR. If power loss during update, old firmware in Bank A remains valid.',
        solutionLanguage: 'arm'
      }
    ],
    practiceQuestions: [
      {
        question: 'Why is it necessary to update VTOR before jumping to an application?',
        answer: 'If VTOR is not updated, hardware interrupts occurring in the application would look up handler addresses in the bootloader\'s vector table at 0x08000000, causing crashes or unintended bootloader execution. VTOR tells the NVIC where the application\'s vector table is located.'
      },
      {
        question: 'What is the purpose of a magic number in a firmware header?',
        answer: 'A magic number (e.g., 0xDEADBEEF) is a unique identifier that validates the firmware header. If the magic number is incorrect, the bootloader knows the firmware is invalid or corrupted. It prevents jumping to random data that might look like a valid vector table.'
      },
      {
        question: 'Why should you verify firmware before erasing the old one?',
        answer: 'If you erase the old firmware first and the new firmware is invalid, the device becomes bricked (no working firmware). By verifying first, you ensure the new firmware is valid before destroying the old one, allowing fallback if something goes wrong.'
      },
      {
        question: 'What is the difference between a reset and a jump to application?',
        answer: 'A reset reinitializes all peripherals and starts from the reset vector. A jump only sets VTOR, MSP, and branches to the application. Jump is faster but leaves peripherals in unknown state. Reset is safer but slower and may affect external hardware.'
      },
      {
        question: 'How does dual-bank flash improve firmware update reliability?',
        answer: 'Dual-bank flash has two independent flash banks. The bootloader can write new firmware to the unused bank while running from the used bank. If power loss occurs during the update, the old firmware remains intact. After successful verification, the bootloader can swap banks or update VTOR.'
      },
      {
        question: 'What security considerations are important for bootloaders?',
        answer: 'Key security considerations: 1) Authenticate firmware (HMAC/signature) to prevent malicious code. 2) Encrypt firmware to prevent reverse engineering. 3) Prevent downgrade attacks with version checking. 4) Secure boot chain with root of trust. 5) Write protection for bootloader flash sectors.'
      }
    ],
    summary: [
      'Bootloaders enable safe firmware field updates and recovery.',
      'VTOR relocation and MSP re-initialization ensure seamless application execution.',
      'Flash memory must be carefully partitioned and protected.',
      'CRC32 provides reliable firmware integrity verification.',
      'Dual-bank flash enables atomic updates without power loss risk.',
      'Firmware headers contain metadata for validation and versioning.',
      'Safe update protocols verify before erasing old firmware.',
      'Security considerations include authentication, encryption, and anti-downgrade.'
    ]
  }
];
