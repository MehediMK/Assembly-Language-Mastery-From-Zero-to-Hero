import { Chapter } from '../types';

export const CHAPTERS_LEVEL_7: Chapter[] = [
  {
    "id": 35,
    "slug": "chapter-35-embedded-systems-microcontrollers",
    "level": 7,
    "levelTitle": "Embedded Systems and Real-Time Assembly",
    "title": "Chapter 35: Introduction to Embedded Systems and Microcontrollers",
    "subtitle": "ARM Cortex-M Architecture, Vector Tables, and Bare-Metal LED Blinking",
    "learningObjectives": [
      "Define embedded systems and distinguish them from general-purpose computers.",
      "Understand the role of microcontrollers (MCUs) in embedded systems.",
      "Learn about memory-mapped I/O and how peripherals are controlled via registers.",
      "Explore a typical microcontroller architecture, using ARM Cortex-M as an example.",
      "Write basic assembly code for an MCU, including startup code and GPIO manipulation.",
      "Understand bare-metal programming: no operating system, direct hardware access.",
      "Recognize the importance of real-time constraints and how they shape software design.",
      "Set the stage for more advanced embedded topics (interrupts, low-power, bootloaders)."
    ],
    "prerequisites": [
      "Solid understanding of assembly language fundamentals and CPU architecture (Chapters 1–18).",
      "Familiarity with memory, addressing modes, and I/O concepts (Chapters 3, 6, 16).",
      "Basic knowledge of C programming (helpful for toolchain integration).",
      "Experience with low-level debugging tools like GDB (Chapter 17)."
    ],
    "keyConcepts": [
      "Embedded system: A computer system designed for a specific function within a larger system, often with real-time constraints and limited resources.",
      "Microcontroller (MCU): A single chip containing CPU, memory, and peripherals; self-contained and cheap.",
      "Memory-mapped I/O: Peripherals are accessed by reading/writing special memory addresses (registers).",
      "Bare-metal programming: Writing software that runs directly on hardware without an operating system.",
      "Vector table: A table of addresses for exception and interrupt handlers, stored at a fixed location.",
      "Startup code: Assembly code that runs after reset, initializing the stack pointer, clearing BSS, and calling main.",
      "GPIO (General Purpose Input/Output): Simple digital pins that can be configured as input or output.",
      "Real-time constraints: Deadlines that must be met; often deterministic behavior is required.",
      "Cross-compilation: Building code for a different target architecture using a toolchain (e.g., arm-none-eabi-gcc)."
    ],
    "diagramType": "embedded_mcu",
    "sections": [
      {
        "id": "sec-35-1",
        "title": "35.1 What is an Embedded System?",
        "content": "An embedded system is a computer system designed to perform a dedicated function, often with real-time computing constraints. It is embedded as part of a larger device. Examples include:\n\n- Microcontrollers in washing machines, microwave ovens, and automotive engine controllers.\n- Digital signal processors in audio equipment.\n- System-on-chip (SoC) in smartphones (though these often run full OS like Linux, but have embedded aspects).\n- Microcontrollers in IoT devices, sensors, and wearables.\n\nKey characteristics:\n\n- Dedicated function: Unlike a general-purpose PC, an embedded system performs a specific task.\n- Real-time constraints: Many embedded systems must respond to events within strict deadlines (e.g., airbag deployment).\n- Resource constraints: Limited RAM, flash storage, and processing power.\n- Low power: Often battery-operated, requiring careful power management.\n- Reliability: Must operate continuously for years without failure.\n\nEmbedded systems range from tiny 8-bit MCUs to powerful 32-bit or 64-bit processors. Assembly language is often used in the most resource-constrained or performance-critical parts."
      },
      {
        "id": "sec-35-1-1",
        "title": "35.1.1 Microcontrollers vs Microprocessors",
        "content": "- Microprocessor: Just a CPU; requires external memory, I/O controllers, etc. Used in PCs (x86).\n- Microcontroller: Integrates CPU, RAM, flash (program memory), and peripherals (timers, UART, I2C, GPIO, ADC) on a single chip. Examples: ARM Cortex-M, AVR, PIC, MSP430.\n\nMCUs are the heart of most embedded systems. They are self-contained, low-cost, and designed for control applications.\n\nClarification: Modern microprocessors/SoCs can integrate many peripherals, and Cortex-M is an IP core used inside MCU products. The simple distinction is a useful starting point rather than an absolute packaging rule."
      },
      {
        "id": "sec-35-2",
        "title": "35.2 Memory-Mapped I/O",
        "content": "In embedded systems, peripherals are controlled by reading and writing special registers. These registers are accessed via normal memory load/store instructions; they are mapped into the address space. This is called memory-mapped I/O.\n\nFor example, on an ARM Cortex-M microcontroller, the GPIO (General Purpose Input/Output) port for pin configuration might be located at address 0x40020000. Writing a value to that address sets the mode (input/output) of the pins. Writing to another offset (e.g., 0x40020014) sets the output data register, which controls whether pins are high or low.\n\nIn assembly, we treat these addresses as memory:\n\nClarification: GPIO addresses here are STM32-family examples, not architectural Cortex-M constants. The GPIOB draft ORs bit 0 without clearing bit 1, so it cannot ensure mode 01 from an arbitrary prior state. Enable GPIOB’s clock first, clear the two-bit field, then set the output bit. Volatile does not itself provide atomicity or a hardware memory barrier.",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "Set port B pin 0 as output (example)",
            "code": "; Set port B pin 0 as output (example)\nLDR R0, =0x40020400   ; GPIOB_MODER (mode register)\nLDR R1, [R0]\nORR R1, R1, #0x1      ; set bits 0-1 to 01 (output)\nSTR R1, [R0]\n\n; Set pin high\nLDR R0, =0x40020414   ; GPIOB_ODR (output data register)\nLDR R1, [R0]\nORR R1, R1, #0x1\nSTR R1, [R0]",
            "explanation": "This example uses ARM assembly syntax because ARM is dominant in embedded. However, the concept applies to any architecture: write to a memory address to control hardware.\n\nImportant: Reading from a peripheral register may have side effects (e.g., clearing a flag). Therefore, the compiler/hardware must not optimize away accesses. In C, we use volatile. In assembly, we simply perform the load/store."
          }
        ]
      },
      {
        "id": "sec-35-3",
        "title": "35.3 ARM Cortex-M Architecture Overview",
        "content": "ARM Cortex-M is a family of 32-bit RISC microcontrollers widely used in embedded systems. It has a clean, simple instruction set (Thumb-2) and a well-defined programmer's model. We'll use it as our example architecture.\n\nClarification: Cortex-M0/M0+ use a smaller Thumb instruction subset than Cortex-M3/M4. The complete project explicitly targets Cortex-M4. Original listings with semicolon comments mix assembler conventions; GNU Arm assembly examples below use @ or C-style comments."
      },
      {
        "id": "sec-35-3-1",
        "title": "35.3.1 Registers",
        "content": "- R0–R12: General-purpose registers.\n- R13 (SP): Stack Pointer.\n- R14 (LR): Link Register (holds return address).\n- R15 (PC): Program Counter.\n- xPSR: Program Status Register (flags, interrupt state).\n\nIn Thumb mode (the only mode on Cortex-M), instructions can be 16-bit or 32-bit."
      },
      {
        "id": "sec-35-3-2",
        "title": "35.3.2 Memory Map",
        "content": "The address space is fixed by the architecture. Typical layout for a Cortex-M4 (STM32F4):\n\n- 0x00000000 – Flash (code)\n- 0x1FFF0000 – System memory (bootloader)\n- 0x20000000 – SRAM (data)\n- 0x40000000 – Peripherals (GPIO, timers, UART, etc.)\n- 0xE000E000 – System control block (NVIC, debug)\n\nClarification: On STM32F407, main flash is at 0x08000000; address zero is a boot-dependent alias. The 0xE000E000 region contains system control peripherals; SCB itself begins at 0xE000ED00. Check the exact MCU memory map rather than assuming all listed addresses are architectural constants."
      },
      {
        "id": "sec-35-3-3",
        "title": "35.3.3 Instruction Set (Thumb-2)",
        "content": "A subset of ARM instructions used in Thumb-2:\n\n- Data processing: MOV, ADD, SUB, AND, ORR, EOR\n- Load/store: LDR, STR (with various addressing modes)\n- Branch: B, BL, BX\n- Conditional execution (some instructions can be conditionally executed with suffixes like BEQ)\n\nExample:\n\nClarification: The MOV/ADD/LDR/STR snippet demonstrates syntax only: addresses 5 and 8 are not valid application RAM buffers. Use valid RAM addresses for runnable loads/stores. Conditional data-processing instructions in Thumb can require an IT block; conditional branches are distinct.",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "35.3.3 Instruction Set (Thumb-2) — listing 1",
            "code": "MOV R0, #5          ; R0 = 5\nADD R1, R0, #3      ; R1 = R0 + 3\nLDR R2, [R0]        ; R2 = memory[R0]\nSTR R2, [R1]        ; memory[R1] = R2",
            "explanation": "Note: ARM instructions often have a three-operand format (dest, src1, src2). Immediate values are limited and may need to be loaded via a literal pool (using LDR Rn, =constant)."
          },
          {
            "language": "arm",
            "title": "Original source Solution 35.2",
            "code": "ADD R0, R0, R1",
            "explanation": "The complete function below adds assembler metadata and a return instruction."
          }
        ]
      },
      {
        "id": "sec-35-4",
        "title": "35.4 Bare-Metal Programming",
        "content": "Bare-metal programming means writing software that runs directly on hardware without an operating system. The program must initialize the hardware, set up the stack, and manage all resources itself."
      },
      {
        "id": "sec-35-4-1",
        "title": "35.4.1 Startup Code",
        "content": "When the MCU resets, it reads the initial stack pointer from address 0x00000000 and the reset handler address from 0x00000004 (the second entry in the vector table). The startup code is typically written in assembly and performs:\n\n1. Set the stack pointer (usually already set from vector table, but can be done manually).\n2. Copy initialized data from flash to RAM (if using C global variables).\n3. Zero the BSS section.\n4. Call the main function (if using C) or jump to the main assembly routine.\n\nExample startup code for ARM Cortex-M (simplified):\n\nClarification: Provide .syntax unified, .cpu cortex-m4, .thumb and .thumb_func for GNU assembly. The complete startup handles empty data/BSS ranges, defines a full vector table with defaults, and uses linker-defined boundaries. The initial stack pointer is a RAM top address, not the start of a .space declaration.",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "35.4.1 Startup Code — listing 1",
            "code": ".section .isr_vector, \"a\"\n.global _start\n_start:\n    .word _estack          ; initial stack pointer\n    .word Reset_Handler    ; reset handler\n\n.section .text\nReset_Handler:\n    ; Copy .data from flash to SRAM\n    ldr r0, =_sdata\n    ldr r1, =_edata\n    ldr r2, =_sidata\n    b 2f\n1:  ldr r3, [r2], #4\n    str r3, [r0], #4\n2:  cmp r0, r1\n    bne 1b\n\n    ; Zero .bss\n    ldr r0, =_sbss\n    ldr r1, =_ebss\n    movs r2, #0\n    b 2f\n1:  str r2, [r0], #4\n2:  cmp r0, r1\n    bne 1b\n\n    ; Call main (if using C)\n    bl main\n    ; If main returns, loop forever\n    b .",
            "explanation": "In pure assembly, you might not need C startup; you can just start your code directly."
          }
        ]
      },
      {
        "id": "sec-35-4-2",
        "title": "35.4.2 Linker Script",
        "content": "A linker script defines where sections are placed in memory. For an MCU, it maps code to flash and data to SRAM. Example snippet:\n\nClarification: The original snippet omits _estack, _sidata and section boundaries required by startup. The complete script below supplies them, retains the vector table and reserves stack space. It targets STM32F407VG: 1 MiB flash and the 128 KiB SRAM1/SRAM2 region; separate CCM RAM is not used. Board reference: https://www.st.com/en/evaluation-tools/stm32f4discovery.html",
        "codeSnippets": [
          {
            "language": "text",
            "title": "35.4.2 Linker Script — listing 1",
            "code": "MEMORY\n{\n  FLASH (rx)  : ORIGIN = 0x08000000, LENGTH = 512K\n  RAM   (rwx) : ORIGIN = 0x20000000, LENGTH = 128K\n}\n\nSECTIONS\n{\n  .isr_vector : { *(.isr_vector) } >FLASH\n  .text : { *(.text) } >FLASH\n  .data : { *(.data) } >RAM AT> FLASH\n  .bss  : { *(.bss) } >RAM\n}",
            "explanation": "This is necessary for the linker to know where to place code and data."
          },
          {
            "language": "text",
            "title": "Complete stm32f4.ld",
            "code": "/* stm32f4.ld: STM32F407VG, 1 MiB flash, 128 KiB SRAM1+SRAM2.\n   Separate 64 KiB CCM RAM is intentionally not allocated here. */\nENTRY(Reset_Handler)\nMEMORY {\n    FLASH (rx) : ORIGIN = 0x08000000, LENGTH = 1M\n    RAM (rwx)  : ORIGIN = 0x20000000, LENGTH = 128K\n}\nSECTIONS {\n    .isr_vector : { KEEP(*(.isr_vector)) } > FLASH\n    .text : { *(.text*) *(.rodata*) . = ALIGN(4); } > FLASH\n    .data : {\n        . = ALIGN(4); _sdata = .;\n        *(.data*)\n        . = ALIGN(4); _edata = .;\n    } > RAM AT> FLASH\n    _sidata = LOADADDR(.data);\n    .bss (NOLOAD) : {\n        . = ALIGN(4); _sbss = .;\n        *(.bss*) *(COMMON)\n        . = ALIGN(4); _ebss = .;\n    } > RAM\n    .stack ORIGIN(RAM) + LENGTH(RAM) - 1024 (NOLOAD) : {\n        _sstack = .;\n        . += 1024;\n        _estack = .;\n    } > RAM\n    ASSERT(_ebss <= _sstack, \"RAM data overlaps reserved stack\")\n    ASSERT((_estack & 7) == 0, \"Initial SP must be 8-byte aligned\")\n}",
            "explanation": "Defines all startup symbols, flash load address for .data, a 1 KiB stack at RAM top and linker assertions preventing RAM overlap. Adapt it only after checking a different MCU’s memory map."
          }
        ]
      },
      {
        "id": "sec-35-5",
        "title": "35.5 Example: Blinking an LED (STM32F4 Discovery)",
        "content": "As a classic first embedded program, we'll blink an LED on an STM32F4 board. The LED is connected to GPIO port D, pin 12 (PD12). To control it, we need to:\n\n1. Enable the clock for GPIOD (via RCC_AHB1ENR register).\n2. Configure PD12 as output (via GPIOD_MODER register).\n3. Toggle PD12 (via GPIOD_ODR register) in a loop with a delay.\n\nWe'll show assembly code (ARM Thumb-2) for this. Note that this is for educational purposes; actual code would use a C startup and possibly library.\n\nClarification: The original _estack label marks the bottom of its reserved block, while the stack grows downward. Use the linked RAM top instead. The companion initializes GPIO output characteristics and uses BSRR for per-pin set/reset. Board wiring and supply/clock configuration still require hardware verification. Register reference: https://www.st.com/resource/en/reference_manual/dm00031020-stm32f405415-stm32f407417-stm32f427437-and-stm32f429439-advanced-armbased-32bit-mcus-stmicroelectronics.pdf",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "stm32f4_blink.s",
            "code": "; stm32f4_blink.s\n; Assemble with: arm-none-eabi-as -o blink.o blink.s\n; Link with: arm-none-eabi-ld -T stm32f4.ld -o blink.elf blink.o\n\n.syntax unified\n.cpu cortex-m4\n.thumb\n\n; Register addresses (simplified, actual addresses from datasheet)\n.equ RCC_BASE,       0x40023800\n.equ RCC_AHB1ENR,    RCC_BASE + 0x30\n.equ GPIOD_BASE,     0x40020C00\n.equ GPIOD_MODER,    GPIOD_BASE + 0x00\n.equ GPIOD_ODR,      GPIOD_BASE + 0x14\n\n; Vector table\n.section .isr_vector, \"a\"\n.word _estack          ; initial SP\n.word Reset_Handler\n\n.section .text\n.thumb_func\n.global Reset_Handler\nReset_Handler:\n    ; Enable GPIOD clock (bit 3 in RCC_AHB1ENR)\n    ldr r0, =RCC_AHB1ENR\n    ldr r1, [r0]\n    orr r1, r1, #(1 << 3)\n    str r1, [r0]\n\n    ; Configure PD12 as output: MODER bits 24-25 = 01\n    ldr r0, =GPIOD_MODER\n    ldr r1, [r0]\n    bic r1, r1, #(3 << 24)   ; clear bits 24-25\n    orr r1, r1, #(1 << 24)   ; set to 01\n    str r1, [r0]\n\n    ; Main loop\nloop:\n    ; Turn LED on (set PD12 high)\n    ldr r0, =GPIOD_ODR\n    ldr r1, [r0]\n    orr r1, r1, #(1 << 12)\n    str r1, [r0]\n\n    ; Delay (simple busy loop)\n    ldr r2, =1000000\ndelay1:\n    subs r2, r2, #1\n    bne delay1\n\n    ; Turn LED off (clear PD12)\n    ldr r0, =GPIOD_ODR\n    ldr r1, [r0]\n    bic r1, r1, #(1 << 12)\n    str r1, [r0]\n\n    ; Delay\n    ldr r2, =1000000\ndelay2:\n    subs r2, r2, #1\n    bne delay2\n\n    b loop\n\n.section .bss\n.align 3\n_estack: .space 0x400   ; define stack space",
            "explanation": "This code uses the vector table, enables the clock, configures the pin, and toggles it with a software delay. The exact addresses and bit positions depend on the specific MCU; consult the reference manual."
          },
          {
            "language": "arm",
            "title": "Complete STM32F407VG blink.s",
            "code": "/* blink.s: STM32F407VG Discovery, PD12 LED, Cortex-M4 Thumb. */\n.syntax unified\n.cpu cortex-m4\n.thumb\n.ifndef LED_PIN\n.equ LED_PIN,12\n.endif\n.equ RCC_AHB1ENR,0x40023830\n.equ GPIOD_MODER,0x40020c00\n.equ GPIOD_OTYPER,0x40020c04\n.equ GPIOD_OSPEEDR,0x40020c08\n.equ GPIOD_PUPDR,0x40020c0c\n.equ GPIOD_BSRR,0x40020c18\n.section .isr_vector,\"a\",%progbits\n.global vectors\nvectors:\n    .word _estack,Reset_Handler\n    .word Default_Handler,Default_Handler,Default_Handler\n    .word Default_Handler,Default_Handler\n    .word 0,0,0,0\n    .word Default_Handler,Default_Handler,0\n    .word Default_Handler,Default_Handler\n    .rept 82\n    .word Default_Handler\n    .endr\n.section .text.Reset_Handler,\"ax\",%progbits\n.global Reset_Handler\n.type Reset_Handler,%function\n.thumb_func\nReset_Handler:\n    ldr r0,=0xe000ed08      @ VTOR: use the linked vector-table address\n    ldr r1,=vectors\n    str r1,[r0]\n    dsb\n    isb\n    ldr r0,=_sdata\n    ldr r1,=_edata\n    ldr r2,=_sidata\n1:\n    cmp r0,r1\n    bhs 2f\n    ldr r3,[r2],#4\n    str r3,[r0],#4\n    b 1b\n2:\n    ldr r0,=_sbss\n    ldr r1,=_ebss\n    movs r2,#0\n3:\n    cmp r0,r1\n    bhs 4f\n    str r2,[r0],#4\n    b 3b\n4:\n    bl main\n    b .\n.size Reset_Handler,.-Reset_Handler\n.section .text,\"ax\",%progbits\n.thumb_func\nDefault_Handler:\n    b .\n.global main\n.type main,%function\n.thumb_func\nmain:\n    ldr r0,=RCC_AHB1ENR\n    ldr r1,[r0]\n    orr r1,r1,#(1<<3)\n    str r1,[r0]\n    ldr r1,[r0]            @ read back after enabling peripheral clock\n    ldr r0,=GPIOD_BSRR\n    ldr r1,=(1<<(LED_PIN+16))\n    str r1,[r0]            @ start with LED low\n    ldr r0,=GPIOD_OTYPER\n    ldr r1,[r0]\n    bic r1,r1,#(1<<LED_PIN)\n    str r1,[r0]            @ push-pull\n    ldr r0,=GPIOD_OSPEEDR\n    ldr r1,[r0]\n    bic r1,r1,#(3<<(LED_PIN*2))\n    str r1,[r0]            @ low speed\n    ldr r0,=GPIOD_PUPDR\n    ldr r1,[r0]\n    bic r1,r1,#(3<<(LED_PIN*2))\n    str r1,[r0]            @ no pull\n    ldr r0,=GPIOD_MODER\n    ldr r1,[r0]\n    bic r1,r1,#(3<<(LED_PIN*2))\n    orr r1,r1,#(1<<(LED_PIN*2))\n    str r1,[r0]\nblink_loop:\n    ldr r0,=GPIOD_BSRR\n    ldr r1,=(1<<LED_PIN)\n    str r1,[r0]\n    bl delay\n    ldr r0,=GPIOD_BSRR\n    ldr r1,=(1<<(LED_PIN+16))\n    str r1,[r0]\n    bl delay\n    b blink_loop\n.thumb_func\ndelay:\n    ldr r2,=1000000\n1:\n    subs r2,r2,#1\n    bne 1b\n    bx lr\n.section .data,\"aw\",%progbits\n.global initialized_example\ninitialized_example: .word 0x12345678\n.section .bss,\"aw\",%nobits\n.balign 4\n.global zeroed_example\nzeroed_example: .space 4",
            "explanation": "Includes vectors, data copying, BSS clearing, valid Thumb handlers and PD12 GPIO initialization. The delay is approximate; this program leaves the reset clock configuration unchanged. No FPU instructions are used."
          },
          {
            "language": "arm",
            "title": "Corrected retained SysTick delay feature",
            "code": ".syntax unified\n.cpu cortex-m4\n.thumb\n.text\n.global delay_ms_systick\n.thumb_func\ndelay_ms_systick:\n    cmp r0,#0\n    beq 3f\n    push {r4,lr}\n    mov r4,r0\n    ldr r0,=0xe000e010\n    movs r1,#0\n    str r1,[r0]            @ exclusively own SysTick for this blocking delay\n    ldr r1,=15999          @ 16000 core-clock cycles at an assumed 16 MHz\n    str r1,[r0,#4]\n    movs r1,#0\n    str r1,[r0,#8]         @ clear current count and COUNTFLAG\n    movs r1,#5             @ ENABLE + CLKSOURCE, no interrupt\n    str r1,[r0]\n1:\n    ldr r1,[r0]\n    tst r1,#(1<<16)\n    beq 1b\n    subs r4,r4,#1\n    bne 1b\n    movs r1,#0\n    str r1,[r0]\n    pop {r4,pc}\n3:\n    bx lr",
            "explanation": "Assumes a 16 MHz core clock and exclusive SysTick ownership. Reload is cycles−1, CURRENT is cleared, and CLKSOURCE selects the core clock. R4 and LR are restored together; zero milliseconds returns immediately. Interrupts or polling gaps can cause missed wraps, so this is a blocking demonstration, not a hard deadline service."
          }
        ]
      },
      {
        "id": "sec-35-6",
        "title": "35.6 Real-Time Considerations",
        "content": "Embedded systems often have real-time requirements: they must respond to events within a guaranteed time. This affects design:\n\n- Determinism: Code paths must have bounded execution times.\n- Interrupt latency: The time from an interrupt request to the handler execution must be minimal.\n- Priority management: Some tasks are more urgent; interrupts can be prioritized.\n- Avoid blocking: Use polling or interrupts instead of busy-wait for long periods.\n\nAssembly language gives precise control over timing, but high-level languages can also be used with careful design. For critical sections, assembly may be needed.\n\nIn later chapters, we'll cover interrupts (Chapter 37) and low-power techniques (Chapter 38).\n\nClarification: A busy polling loop also blocks unless explicitly bounded or cooperatively scheduled. A decrement plus taken conditional branch is not universally two cycles; pipeline refill, instruction fetch, flash wait states, interrupts and clock settings affect timing. Use timer-based deadlines when timing matters. Cortex-M4 timing reference: https://documentation-service.arm.com/static/5fce431be167456a35b36ade"
      },
      {
        "id": "sec-35-7",
        "title": "35.7 Tools and Cross-Compilation",
        "content": "To develop for embedded targets, you need a cross-toolchain: a compiler/assembler that runs on your PC but produces code for the target architecture. For ARM Cortex-M, common toolchains:\n\n- GNU Arm Embedded Toolchain: arm-none-eabi-gcc, arm-none-eabi-as, arm-none-eabi-ld.\n- LLVM/Clang with --target=arm-none-eabi.\n- IDE: STM32CubeIDE, Keil, IAR (commercial).\n\nAssembling an ARM assembly file:",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "35.7 Tools and Cross-Compilation — listing 1",
            "code": "arm-none-eabi-as -mcpu=cortex-m4 -o blink.o blink.s\narm-none-eabi-ld -T linker.ld -o blink.elf blink.o\narm-none-eabi-objcopy -O binary blink.elf blink.bin   # for flashing",
            "explanation": "Flashing the binary to the MCU requires a programmer (e.g., ST-Link, J-Link) and software like st-flash or openocd."
          },
          {
            "language": "bash",
            "title": "Build and inspect the complete project",
            "code": "arm-none-eabi-as -mcpu=cortex-m4 -mthumb -g blink.s -o blink.o\narm-none-eabi-ld -T stm32f4.ld -Map=blink.map blink.o -o blink.elf\narm-none-eabi-objcopy -O binary blink.elf blink.bin\narm-none-eabi-readelf -h -S blink.elf\narm-none-eabi-objdump -s -j .isr_vector blink.elf",
            "explanation": "Confirm vector word 0 is 0x20020000, reset-vector bit 0 is set, code is in flash and data/BSS/stack are in RAM. Cross-building verifies encoding/link layout; it does not prove electrical behavior or blink timing."
          }
        ]
      },
      {
        "id": "sec-35-supplement",
        "title": "Additional embedded design topics",
        "content": "Preserved from the newer ebook expansion, with register and timing corrections.\n\nMCU families include 8-bit AVR, 16-bit MSP430 and 32-bit Cortex-M devices. Clock speed and RAM are properties of a specific MCU implementation, not guarantees of the CPU core family. Production cost, energy, peripherals, debugging support and worst-case timing matter alongside raw speed.\n\nCortex-M4 has Thread mode and Handler mode. Handler mode uses MSP; Thread mode may use MSP or PSP. CONTROL bit 0 is nPRIV and bit 1 is SPSEL. PRIMASK masks configurable-priority exceptions, not NMI or HardFault; BASEPRI provides a priority threshold. These are separate from the arithmetic flags in xPSR.\n\nPeripheral access policies differ: GPIO_IDR is read-only; MODER is read/write; BSRR accepts bit set/reset commands. Do not label all USART_SR flags write-one-to-clear: STM32F407 status flags have specific documented read/write sequences. Main flash is 0x08000000, not the system boot ROM; address zero is a boot alias.\n\nHard real-time systems require deadlines to be met. A firm deadline makes a late result useless, while a soft deadline miss degrades quality. Analyze worst-case paths, memory stalls and interrupt preemption. Bounded allocation and bounded recursion can be appropriate; neither is automatically forbidden. Intentional event loops are normal, but work between required responses must be bounded.\n\nRetained development workflow: compile/assemble, link an ELF and map, inspect it, create a binary if required, then use a compatible probe. OpenOCD and GDB support on-chip debugging; logic analyzers observe pin timing. Board options include STM32F4 Discovery, Nucleo-F446RE and Raspberry Pi Pico, whose MCU families and peripherals differ. Check exact variants and current specifications rather than treating illustrative price or memory figures as fixed.\n\nReview peripheral clock enables, valid register addresses and access widths, stack capacity, vector placement, Thumb handler addresses, return paths and applicable silicon errata. Use symbolic constants, incremental peripheral tests and useful debug output. Cortex-M4 supports some unaligned normal-memory accesses, but instructions and device-memory accesses have stricter requirements; align objects rather than assuming every unaligned access is supported."
      }
    ],
    "exercises": [
      {
        "id": "ex-35-1",
        "title": "Exercise 35.1: Memory-Mapped I/O Concept",
        "description": "Explain what memory-mapped I/O is. Give an example of a peripheral register and how you would set a bit to configure a pin as output.",
        "solution": " .syntax unified\n .cpu cortex-m4\n .thumb\n ldr r0,=0x40023830\n ldr r1,[r0]\n orr r1,r1,#(1<<3)\n str r1,[r0]\n ldr r1,[r0]\n ldr r0,=0x40020c00\n ldr r1,[r0]\n bic r1,r1,#(3<<24)\n orr r1,r1,#(1<<24)\n str r1,[r0]",
        "solutionExplanation": "Memory-mapped I/O means that peripheral registers are mapped into the memory address space. To access a register, you load/store to a specific address. Example: on STM32F4, GPIOD_MODER is at 0x40020C00. To set PD12 as output, you set bits 24-25 to 01 (binary). In assembly: read register, clear bits 24-25 (AND with ~(3<<24)), set bit 24 (OR with 1<<24), write back. This initialization fragment enables GPIOD before touching MODER; it assumes the STM32F407 map and privileged bare-metal execution.",
        "solutionLanguage": "arm"
      },
      {
        "id": "ex-35-2",
        "title": "Exercise 35.2: ARM Assembly Basics",
        "description": "Write a short ARM Thumb-2 assembly sequence that adds two numbers and stores the result in a register. Assume numbers are in R0 and R1; store result in R0.",
        "solution": " .syntax unified\n .cpu cortex-m4\n .thumb\n .text\n .global add_two\n .type add_two,%function\n .thumb_func\nadd_two:\n ADD R0, R0, R1\n bx lr",
        "solutionLanguage": "arm",
        "solutionExplanation": "This adds R1 to R0 and stores result in R0. Under AAPCS, R0/R1 hold the two word arguments and R0 returns their modulo-2^32 sum. R4–R11 are untouched."
      },
      {
        "id": "ex-35-3",
        "title": "Exercise 35.3: Startup Code Analysis",
        "description": "Describe the purpose of the vector table and what happens at reset on a Cortex-M MCU. What are the first two entries?",
        "solution": "The vector table is an array of addresses at the beginning of flash. On reset, the CPU loads the initial stack pointer from the first word, then loads the reset handler address from the second word and jumps to it. The first two entries are: initial SP and reset handler.",
        "solutionExplanation": "Check the complete vector table against the linker map. The initial SP is eight-byte aligned at 0x20020000; Reset_Handler is in flash with the Thumb bit set. Flash aliasing at reset depends on STM32 boot configuration."
      },
      {
        "id": "ex-35-4",
        "title": "Exercise 35.4: Simple Delay Loop",
        "description": "Write an ARM assembly delay loop that counts down from 1,000,000 to zero using a register. How many cycles does each iteration take (approximately)? What factors affect the actual delay time?",
        "solution": ".syntax unified\n.cpu cortex-m4\n.thumb\n.text\n.global delay_demo\n.thumb_func\ndelay_demo:\n    ldr r2, =1000000\ndelay:\n    subs r2, r2, #1\n    bne delay\n    bx lr",
        "solutionLanguage": "arm",
        "solutionExplanation": "Each iteration takes 2 cycles (subs + bne) on Cortex-M if no branch penalty. Actual time depends on clock frequency. If clock is 16 MHz, each cycle is 62.5 ns, so 2 cycles = 125 ns per iteration, total ~125 ms. Correction: the two-cycle estimate ignores taken-branch refill and memory-system effects and is not a guaranteed Cortex-M4 delay. Measure the actual clock/cycles or use a hardware timer; no exact 125 ms claim is made for the completed blink."
      },
      {
        "id": "ex-35-5",
        "title": "Exercise 35.5: Blink LED Modification",
        "description": "Modify the STM32F4 blink example to toggle a different pin (e.g., PD13). Show the changes needed in the code (addresses and bit positions). Assume the pin is already connected to an LED.",
        "solution": "arm-none-eabi-as -mcpu=cortex-m4 -mthumb --defsym LED_PIN=13 blink.s -o blink13.o\narm-none-eabi-ld -T stm32f4.ld blink13.o -o blink13.elf\narm-none-eabi-objdump -d blink13.elf",
        "solutionExplanation": "Change the bit from 12 to 13 in the ORR/BIC immediate values for ODR, and adjust the MODER bits from 24-25 to 26-27. Addresses remain same (GPIOD). So in code, #(1 << 12) becomes #(1 << 13), and #(3 << 24) / #(1 << 24) become #(3 << 26) / #(1 << 26). The complete source makes the pin a build-time LED_PIN symbol, applying it consistently to mode, type, speed, pull and BSRR masks.",
        "solutionLanguage": "bash"
      },
      {
        "id": "ex-35-supplement-1",
        "title": "Additional exercise: Multi-LED Knight Rider",
        "description": "Write assembly code to create a \"Knight Rider\" effect on four LEDs connected to PD12-PD15. The pattern should shift left then right continuously.",
        "solution": "Use a shift register pattern with delay. Start with bit 12, shift left to 15, then shift right back to 12. Use EOR to toggle bits and delay between each step.",
        "solutionLanguage": "text",
        "solutionExplanation": "Preserved additional exercise from the newer ebook expansion. Configure PD12–PD15 as outputs, then step the one-hot sequence 0x1000,0x2000,0x4000,0x8000,0x4000,0x2000. Write (0xF000<<16)|pattern to BSRR so only the intended LED remains lit; pause between steps using the corrected delay."
      },
      {
        "id": "ex-35-supplement-2",
        "title": "Additional exercise: Button Input",
        "description": "Extend the LED blink program to read a button connected to PA0. When pressed (active low), toggle LED faster; when released, use normal speed.",
        "solution": "Read GPIOA_IDR bit 0. If 0 (pressed), use shorter delay; if 1 (released), use longer delay.",
        "solutionLanguage": "text",
        "solutionExplanation": "Preserved additional exercise from the newer ebook expansion. The exercise describes an external active-low button. The Discovery onboard USER button on PA0 is active-high; choose the polarity from the actual wiring. Enable GPIOA, configure PA0 as input with the appropriate pull, read IDR bit 0, and debounce before acting."
      },
      {
        "id": "ex-35-supplement-3",
        "title": "Additional exercise: Timer-Based Blink",
        "description": "Replace the software delay with a hardware timer (TIM2). Configure TIM2 to generate a 1-second delay using prescaler and auto-reload register.",
        "solution": "Enable TIM2 clock, set PSC = 16000-1 (1 kHz), ARR = 1000 (1 second). Poll UIF flag or use interrupt.",
        "solutionLanguage": "text",
        "solutionExplanation": "Preserved additional exercise from the newer ebook expansion. At a 16 MHz TIM2 input clock, use PSC=15999 and ARR=999 for one second: period=(PSC+1)*(ARR+1)/fTIM. Generate UG to load the prescaler, clear UIF, then enable and poll. ARR=1000 would produce 1001 ticks."
      },
      {
        "id": "ex-35-supplement-4",
        "title": "Additional exercise: UART Debug Output",
        "description": "Write a minimal UART initialization routine for USART2 at 9600 baud (assuming 16 MHz clock). Then write a function to send a single character.",
        "solution": "Enable GPIOA and USART2 clocks, configure PA2/PA3 as AF7, set BRR = 1667 (0x683), enable TE/RE/UE. Poll TXE before writing to DR.",
        "solutionLanguage": "text",
        "solutionExplanation": "Preserved additional exercise from the newer ebook expansion. The stated 9600-baud BRR=0x683 is for 16 MHz peripheral clock with oversampling by 16. Configure PA2/PA3 AF7, enable the clocks, and set TE/RE/UE. Preserve the character while polling TXE; Chapter 36 completes the transmitter and receiver."
      }
    ],
    "practiceQuestions": [
      {
        "question": "What is an embedded system? Give three examples.",
        "answer": "An embedded system performs a dedicated role inside a larger device, such as appliance control, a vehicle sensor controller or a wearable monitor. Many, but not all, have strict timing, memory or energy constraints."
      },
      {
        "question": "What is the difference between a microprocessor and a microcontroller?",
        "answer": "An MCU commonly integrates CPU, SRAM, nonvolatile memory and control peripherals. An application microprocessor commonly relies on external memory and supports richer systems; modern SoCs blur the distinction. Cortex-M names a processor core family, not a complete MCU vendor part."
      },
      {
        "question": "Explain memory-mapped I/O. How do you read/write a peripheral register?",
        "answer": "Peripheral registers occupy addresses accessed with load/store instructions. Follow the exact device manual for access width and side effects. Use volatile in C to retain accesses, while separately addressing ordering and synchronization; do not treat peripheral space like ordinary RAM."
      },
      {
        "question": "What is the role of the vector table in an ARM Cortex-M microcontroller?",
        "answer": "The vector table supplies the initial main stack pointer and handler addresses. At reset the core obtains its initial state from the reset-mapped table. Handler entries carry Thumb state in bit 0; the table can be relocated where the core supports VTOR."
      },
      {
        "question": "Describe the steps performed by startup code in a bare-metal program.",
        "answer": "Establish a valid stack and vector base, copy initialized data from its flash load address to RAM, zero BSS, perform required platform initialization, then call main. Pure assembly still needs any hardware and memory initialization on which its code depends."
      },
      {
        "question": "What is a linker script, and why is it needed in embedded development?",
        "answer": "A linker script places sections and defines symbols connecting startup code with flash/RAM layout. It specifies vector retention, data load/run addresses, BSS boundaries and stack limits. Its memory sizes must match the exact MCU, not just the Cortex-M core."
      },
      {
        "question": "How would you enable a GPIO clock and configure a pin as output on an STM32F4? List the registers involved.",
        "answer": "For the STM32F407 GPIOD example, enable RCC_AHB1ENR bit 3, read back, configure MODER’s two-bit pin field to 01, and select output type/speed/pulls. Write BSRR to set or reset the output bit without read-modify-writing ODR."
      },
      {
        "question": "What is a real-time constraint? How does it affect software design?",
        "answer": "A real-time requirement is a deadline, not simply high average speed. Bound worst-case execution and interrupt latency, account for contention and blocking, and select scheduling/timers accordingly. Polling can itself block if implemented as an unbounded wait."
      },
      {
        "question": "Why is assembly language sometimes used in embedded systems? In which parts?",
        "answer": "Assembly is useful in startup, exception entry, context switching, special-instruction access and measured critical kernels. Most embedded application logic can remain in C or another suitable language; handwritten assembly alone does not guarantee better speed or timing."
      },
      {
        "question": "What is cross-compilation? Which tools are used for ARM Cortex-M development?",
        "answer": "Cross-compilation produces code for a target different from the development host. GNU Arm Embedded tools include arm-none-eabi-gcc, as, ld, objcopy and gdb; Clang can also target ARM. A compatible probe and flashing/debug software connect the result to hardware."
      }
    ],
    "summary": [
      "Embedded systems are dedicated-function computers with real-time constraints and limited resources.",
      "Microcontrollers integrate CPU, memory, and peripherals on one chip.",
      "Memory-mapped I/O controls hardware via special addresses.",
      "ARM Cortex-M is a popular 32-bit MCU architecture with a simple programming model.",
      "Bare-metal programming requires startup code, vector table, and linker script.",
      "Blinking an LED is the \"Hello World\" of embedded systems, demonstrating GPIO control.",
      "Real-time systems demand deterministic behavior and low interrupt latency.",
      "Cross-compilation with GNU Arm Embedded Toolchain enables development on a PC.",
      "In the next chapter, we'll explore memory-mapped I/O and peripheral control in more depth."
    ]
  },
  {
    "id": 36,
    "slug": "chapter-36-memory-mapped-io-peripherals",
    "level": 7,
    "levelTitle": "Embedded Systems and Real-Time Assembly",
    "title": "Chapter 36: Memory-Mapped I/O and Peripheral Control",
    "subtitle": "MMIO Registers, Bitfields, Atomic BSRR Operations, and UART Transmission",
    "learningObjectives": [
      "Understand how memory-mapped I/O (MMIO) enables direct hardware control through normal memory access.",
      "Master reading from and writing to peripheral registers using load and store instructions.",
      "Use bit manipulation techniques (OR, AND, XOR, shifts) to modify specific fields within registers.",
      "Implement read-modify-write sequences safely, especially for registers with side effects.",
      "Control common peripherals: GPIO, UART, and timers on an ARM Cortex-M microcontroller.",
      "Write bare-metal assembly programs that configure and use peripherals without an operating system.",
      "Recognize the importance of volatile access and memory barriers when interacting with hardware.",
      "Prepare for more advanced topics: interrupts and DMA (covered in later chapters)."
    ],
    "prerequisites": [
      "Solid understanding of assembly programming fundamentals (Chapters 1–13).",
      "Knowledge of embedded systems and microcontrollers (Chapter 35).",
      "Familiarity with ARM Cortex-M architecture and instruction set (Chapter 35).",
      "Basic understanding of digital electronics: pins, clocks, and serial communication (conceptual).",
      "Experience with bitwise operations and logic instructions (Chapter 7)."
    ],
    "keyConcepts": [
      "Memory-mapped I/O (MMIO): Peripheral registers are mapped into the processor’s address space; software accesses them with load/store instructions.",
      "Peripheral register: A hardware location that controls or reports the state of a peripheral (e.g., GPIO direction, UART data).",
      "Read-modify-write (RMW): A sequence of read, mask/set bits, and write back to change a subset of bits without affecting others.",
      "Bit fields: Groups of bits within a register that hold a specific configuration value (e.g., mode bits for a pin).",
      "Atomic access: For multi-bit fields or single-bit flags, use bit-banding or exclusive access to avoid race conditions with interrupts/DMA.",
      "Side effects: Reading or writing certain registers triggers hardware actions (e.g., clearing an interrupt flag). Compilers/CPUs must not optimize away such accesses.",
      "Clock gating: Peripherals must be powered and clocked before use; enable via a clock enable register (e.g., RCC_AHB1ENR on STM32).",
      "Pull-up/pull-down: Internal resistors that bias a pin to a known level when not driven.",
      "Baud rate: Speed of UART serial communication (bits per second)."
    ],
    "diagramType": "mmio_peripherals",
    "sections": [
      {
        "id": "sec-36-1",
        "title": "36.1 Introduction to Peripheral Control",
        "content": "In embedded systems, the CPU interacts with the outside world through peripherals: GPIO pins, serial ports, timers, ADCs, etc. These peripherals are controlled by reading and writing special registers located at fixed memory addresses. This mechanism—memory-mapped I/O (MMIO)—allows software to treat hardware registers as ordinary memory variables.\n\nBecause assembly language gives direct access to load/store instructions, it is an excellent tool for writing efficient and precise peripheral control code. In this chapter, we will explore how to use MMIO to configure and use common peripherals on an ARM Cortex-M microcontroller (specifically the STM32F4 series for concrete examples). The principles apply to other architectures (AVR, MSP430, RISC-V) with minor variations."
      },
      {
        "id": "sec-36-2",
        "title": "36.2 Memory-Mapped I/O Fundamentals",
        "content": ""
      },
      {
        "id": "sec-36-2-1",
        "title": "36.2.1 The Memory Map",
        "content": "Every microcontroller has a fixed memory map that assigns address ranges to different regions: flash (code), SRAM (data), and peripherals. On the STM32F407, for example:\n\n- 0x00000000–0x1FFFFFFF: Code (Flash, system memory, etc.)\n- 0x20000000–0x3FFFFFFF: SRAM (data)\n- 0x40000000–0x5FFFFFFF: Peripherals (GPIO, UART, SPI, timers, etc.)\n- 0xE0000000–0xFFFFFFFF: System control (NVIC, debug)\n\nPeripheral registers are placed within the peripheral region. For instance, the GPIO port D registers are located from 0x40020C00 to 0x40020FFF. Each register has a specific offset from the base address. The base addresses and offsets are defined in the microcontroller’s reference manual.\n\nClarification: These are architectural regions, not promises that all addresses are implemented. GPIOD occupies an address window, but only documented register offsets are valid. Consult the STM32F407 reference manual for actual SRAM/peripheral sizes."
      },
      {
        "id": "sec-36-2-2",
        "title": "36.2.2 Accessing Registers in Assembly",
        "content": "To read or write a peripheral register, we use load (LDR) and store (STR) instructions with an absolute address. For example, to read the value of the GPIO D output data register (GPIOD_ODR at address 0x40020C14):\n\nClarification: LDR Rn,=constant is a pseudo-instruction: the assembler may use an immediate instruction or a literal pool. Peripheral space is generally Device memory, not ordinary strongly-ordered RAM. Volatile retains compiler-visible accesses; barriers address ordering/completion and do not make RMW atomic.",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "36.2.2 Accessing Registers in Assembly — listing 1",
            "code": "LDR R0, =0x40020C14   ; load address into R0\nLDR R1, [R0]          ; read register value into R1",
            "explanation": "To write a value:"
          },
          {
            "language": "arm",
            "title": "36.2.2 Accessing Registers in Assembly — listing 2",
            "code": "LDR R0, =0x40020C14\nMOV R1, #0x1000       ; value to write (bit 12 high)\nSTR R1, [R0]          ; write to register",
            "explanation": "In ARM assembly, the = symbol indicates a literal constant; the assembler places the constant in a literal pool and emits a PC-relative load.\n\nImportant: Because peripheral registers can change at any time (e.g., input data register), the compiler must not cache their values. In C, we use volatile; in assembly, we simply perform the load/store each time. We must also ensure the CPU does not reorder or eliminate the access—on Cortex-M, normal loads/stores to strongly-ordered memory (default) are not reordered, but adding a memory barrier (DMB) may be necessary when ordering with other operations."
          }
        ]
      },
      {
        "id": "sec-36-3",
        "title": "36.3 Peripheral Register Access Patterns",
        "content": ""
      },
      {
        "id": "sec-36-3-1",
        "title": "36.3.1 Simple Write",
        "content": "Some registers are write-only (or write-1-to-clear). We write a full 32-bit value.\n\nClarification: Use the access width and write semantics specified for each register. Write-one-to-clear and write-zero-to-clear are different; do not copy an RMW recipe between them. Some read-only or reserved bits have constrained write values."
      },
      {
        "id": "sec-36-3-2",
        "title": "36.3.2 Read-Modify-Write (RMW)",
        "content": "Often we need to change a subset of bits while leaving others unchanged. The sequence is:\n\n1. Read the register.\n2. Modify the desired bits using bitwise operations (AND to clear, OR to set).\n3. Write the result back.\n\nExample: Set bit 12 of GPIO D ODR (turn on LED) without affecting other pins:",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "36.3.2 Read-Modify-Write (RMW) — listing 1",
            "code": "LDR R0, =0x40020C14   ; GPIOD_ODR\nLDR R1, [R0]          ; read current value\nORR R1, R1, #(1<<12)  ; set bit 12\nSTR R1, [R0]          ; write back",
            "explanation": "To clear bit 12:"
          },
          {
            "language": "arm",
            "title": "36.3.2 Read-Modify-Write (RMW) — listing 2",
            "code": "LDR R1, [R0]\nBIC R1, R1, #(1<<12)  ; clear bit 12\nSTR R1, [R0]",
            "explanation": "For setting a field of multiple bits (e.g., two bits for mode), we first clear the field, then OR the new value:"
          },
          {
            "language": "arm",
            "title": "Set mode of pin 12 to output (bits 24-25 = 01)",
            "code": "; Set mode of pin 12 to output (bits 24-25 = 01)\nLDR R0, =0x40020C00   ; GPIOD_MODER\nLDR R1, [R0]\nBIC R1, R1, #(3<<24)  ; clear bits 24-25\nORR R1, R1, #(1<<24)  ; set to 01 (binary)\nSTR R1, [R0]"
          }
        ]
      },
      {
        "id": "sec-36-3-3",
        "title": "36.3.3 Bit-Banding (Optional)",
        "content": "Cortex-M3/M4 provide a bit-banding feature that maps each bit of a peripheral or SRAM word to a separate address in a bit-band alias region. This allows atomic single-bit set/clear without RMW. However, it is optional and often not used for simplicity."
      },
      {
        "id": "sec-36-3-4",
        "title": "36.3.4 Atomicity and Interrupts",
        "content": "If an interrupt can occur between the read and write of an RMW sequence, the interrupt service routine might modify the same register, causing a lost update. To prevent this, you can:\n\n- Disable interrupts around the RMW (using CPSID i / CPSIE i).\n- Use bit-banding for single-bit operations.\n- Use exclusive load/store (LDREX/STREX) for multi-bit atomic updates (more advanced).\n\nFor simple polled applications, this may not be an issue, but it's important in real systems.\n\nClarification: Save/restore the prior PRIMASK rather than unconditionally executing CPSIE i afterward. Masking CPU interrupts does not stop DMA or hardware updates. Cortex-M exclusive operations are not a general solution for Device-memory MMIO; prefer peripheral atomic commands or documented synchronization.",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "Preserve interrupt mask around a GPIO configuration RMW",
            "code": ".syntax unified\n.cpu cortex-m4\n.thumb\nmrs r2,PRIMASK\ncpsid i\nldr r0,=0x40020c00\nldr r1,[r0]\nbic r1,r1,#(3<<24)\norr r1,r1,#(1<<24)\nstr r1,[r0]\nmsr PRIMASK,r2",
            "explanation": "R2 is caller-saved. The prior PRIMASK is restored even if interrupts were already disabled. This does not serialize NMI, DMA or unrelated bus masters."
          }
        ]
      },
      {
        "id": "sec-36-4",
        "title": "36.4 Bit Manipulation Techniques",
        "content": "Efficient bit manipulation is essential for peripheral control. Common techniques:\n\n- Set bits: ORR Rn, Rn, #mask\n- Clear bits: BIC Rn, Rn, #mask\n- Toggle bits: EOR Rn, Rn, #mask\n- Test bit: TST Rn, #mask (sets Z flag if all masked bits are zero)\n- Extract field: UBFX Rd, Rn, #lsb, #width (unsigned bitfield extract)\n- Insert field: BFI Rd, Rn, #lsb, #width (bitfield insert)\n\nIn ARM Thumb-2, immediate constants are limited but can encode many useful masks. If a mask is too complex, load it from a literal pool.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original source: Solution 36.1",
            "code": "LDR R0, =0x40020C00   ; GPIOD_MODER\nLDR R1, [R0]\n; PD15: bits 30-31 = 01 (output)\nBIC R1, R1, #(3<<30)\nORR R1, R1, #(1<<30)\n; PD14: bits 28-29 = 00 (input) - already cleared by default, but ensure\nBIC R1, R1, #(3<<28)\nSTR R1, [R0]",
            "explanation": "Original source Solution 36.1; the exercise version uses GNU Arm comment syntax."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 36.2",
            "code": "LDR R0, =0x40020C14   ; GPIOD_ODR\nLDR R1, [R0]\nEOR R1, R1, #( (1<<12) | (1<<13) | (1<<14) )  ; toggle bits\nSTR R1, [R0]",
            "explanation": "Original source Solution 36.2; the exercise version uses GNU Arm comment syntax."
          }
        ]
      },
      {
        "id": "sec-36-5",
        "title": "36.5 General Purpose I/O (GPIO) Control",
        "content": "GPIO pins are the simplest peripheral. Each pin can be configured as input, output, alternate function, or analog. Configuration is done via mode registers."
      },
      {
        "id": "sec-36-5-1",
        "title": "36.5.1 Enabling the GPIO Clock",
        "content": "Before using any GPIO port, its clock must be enabled in the Reset and Clock Control (RCC) peripheral. On STM32F4, the AHB1 peripheral clock enable register is RCC_AHB1ENR at address 0x40023830. Each bit enables a peripheral; GPIOD is bit 3.\n\nExample:",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "36.5.1 Enabling the GPIO Clock — listing 1",
            "code": "LDR R0, =0x40023830   ; RCC_AHB1ENR\nLDR R1, [R0]\nORR R1, R1, #(1<<3)   ; enable GPIOD clock\nSTR R1, [R0]"
          }
        ]
      },
      {
        "id": "sec-36-5-2",
        "title": "36.5.2 Configuring Pin Mode",
        "content": "The GPIO port mode register (GPIOx_MODER) uses two bits per pin to set the mode:\n\n- 00: Input\n- 01: General purpose output\n- 10: Alternate function\n- 11: Analog\n\nFor port D, MODER is at 0x40020C00. To set PD12 as output, we modify bits 24-25 as shown earlier."
      },
      {
        "id": "sec-36-5-3",
        "title": "36.5.3 Setting Output Type, Speed, and Pull-up/down (Optional)",
        "content": "- Output type register (OTYPER): push-pull (0) or open-drain (1).\n- Output speed register (OSPEEDR): low, medium, high, very high.\n- Pull-up/pull-down register (PUPDR): no pull, pull-up, pull-down.\n\nFor simple LED blinking, defaults are fine.\n\nClarification: Reset defaults vary by pin and device, and earlier firmware may have changed them. Explicit output type/speed/pull configuration makes a reusable example independent of that history."
      },
      {
        "id": "sec-36-5-4",
        "title": "36.5.4 Writing and Reading Pin States",
        "content": "- Output data register (ODR): each bit sets the pin high (1) or low (0). Can be read to see current state.\n- Bit set/reset register (BSRR): writing 1 to lower 16 bits sets corresponding pin; writing 1 to upper 16 bits resets. Atomic set/reset without RMW.\n\nExample to set PD12 high using BSRR:\n\nClarification: ODR reports the output latch; IDR samples the pin. These can differ with open-drain drive or external circuitry. BSRR can set/reset selected pins atomically, but toggling based on an old ODR read still needs exclusive ownership or synchronization.",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "36.5.4 Writing and Reading Pin States — listing 1",
            "code": "LDR R0, =0x40020C18   ; GPIOD_BSRR\nMOV R1, #(1<<12)      ; set bit 12 (lower half)\nSTR R1, [R0]",
            "explanation": "To reset, use upper half: MOV R1, #(1<<(12+16)).\n\nFor input, read the input data register (IDR)."
          }
        ]
      },
      {
        "id": "sec-36-6",
        "title": "36.6 UART Serial Communication",
        "content": "A UART (Universal Asynchronous Receiver/Transmitter) provides serial communication. We'll configure USART2 on STM32F4 as an example."
      },
      {
        "id": "sec-36-6-1",
        "title": "36.6.1 Enable Clocks",
        "content": "USART2 is connected to APB1 bus, and its clock is enabled via RCC_APB1ENR (address 0x40023840). USART2 is bit 17. Also need to enable GPIOA clock for the TX/RX pins (PA2, PA3) via RCC_AHB1ENR bit 0."
      },
      {
        "id": "sec-36-6-2",
        "title": "36.6.2 Configure GPIO Pins for Alternate Function",
        "content": "PA2 (TX) and PA3 (RX) must be set to alternate function mode (AF7 for USART2). This requires:\n\n- Set MODER for PA2/PA3 to 10 (alternate function).\n- Set alternate function register (AFR) to select AF7 for those pins."
      },
      {
        "id": "sec-36-6-3",
        "title": "36.6.3 Configure UART Parameters",
        "content": "Registers in USART2:\n- USART_BRR (Baud rate register): set baud rate divisor.\n- USART_CR1 (Control register 1): enable transmitter (TE), receiver (RE), and UART (UE).\n- USART_DR (Data register): write to send, read to receive.\n- USART_SR (Status register): TXE (transmit data register empty), RXNE (receive data register not empty).\n\nClarification: The completed example assumes PCLK1=16 MHz, oversampling by 16, 9600 baud and 8N1, giving BRR=0x683. The CPU clock and peripheral clock need not match. TXE means DR can accept data; TC means transmission completed."
      },
      {
        "id": "sec-36-6-4",
        "title": "36.6.4 Sending a Character",
        "content": "Poll the TXE flag, then write to DR:",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "36.6.4 Sending a Character — listing 1",
            "code": "wait_txe:\n    LDR R0, =USART2_SR\n    LDR R1, [R0]\n    TST R1, #(1<<7)   ; TXE flag (bit 7)\n    BEQ wait_txe\n    LDR R0, =USART2_DR\n    STR R2, [R0]      ; send character in R2"
          }
        ]
      },
      {
        "id": "sec-36-6-5",
        "title": "36.6.5 Receiving a Character",
        "content": "Poll the RXNE flag, then read DR."
      },
      {
        "id": "sec-36-7",
        "title": "36.7 Timers and PWM",
        "content": "Timers are used for delays, periodic interrupts, and PWM (Pulse Width Modulation). We'll briefly cover timer configuration for a simple delay.\n\nA timer like TIM2 counts up from 0 to a value in the auto-reload register (ARR). The prescaler (PSC) divides the input clock. We can poll the update flag or use interrupts.\n\nTo create a delay:\n\n1. Enable TIM2 clock (APB1, bit 0).\n2. Set prescaler and ARR.\n3. Enable counter (CEN bit in CR1).\n4. Wait for update flag (UIF in SR), then clear it.\n\nExample:\n\nClarification: PSC and ARR encode divisor/count minus one. PSC=15999 and ARR=1 gives two milliseconds at 16 MHz, not one. TIM2 on STM32F407 has a 32-bit ARR. The companion uses PSC=15 and ARR=milliseconds*1000−1, avoiding ARR=0, generates UG to load PSC, and clears initialization UIF before starting. PWM addition retained from the existing ebook: edge-aligned PWM uses the timer period and a CCR compare value; with normal active-high PWM mode 1, duty is approximately CCR/(ARR+1), subject to endpoint and preload semantics.",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "Configure TIM2 for 1 ms delay",
            "code": "; Configure TIM2 for 1 ms delay\nLDR R0, =TIM2_PSC\nMOV R1, #16000-1     ; assuming 16 MHz clock -> 1 kHz\nSTR R1, [R0]\nLDR R0, =TIM2_ARR\nMOV R1, #1           ; 1 ms\nSTR R1, [R0]\nLDR R0, =TIM2_CR1\nLDR R1, [R0]\nORR R1, R1, #1       ; CEN\nSTR R1, [R0]\n\nwait:\n    LDR R0, =TIM2_SR\n    LDR R1, [R0]\n    TST R1, #1        ; UIF\n    BEQ wait\n    ; Clear UIF by writing 0\n    BIC R1, R1, #1\n    STR R1, [R0]",
            "explanation": "This is a basic polling approach; interrupts are better for real-time."
          }
        ]
      },
      {
        "id": "sec-36-8",
        "title": "36.8 Interrupt Enable and Disable (Brief)",
        "content": "Peripherals can generate interrupts. To enable an interrupt, we must:\n\n1. Enable the interrupt in the peripheral’s control register (e.g., TXEIE in USART_CR1).\n2. Set the priority in the NVIC.\n3. Enable the interrupt in the NVIC (ISER register).\n4. Globally enable interrupts (clear PRIMASK via CPSIE i).\n\nWe'll cover interrupts in detail in Chapter 37.\n\nClarification: Configure/clear the peripheral source before unmasking it, and restore masks deliberately. Enabling TXEIE with no data to send can create an interrupt storm because TXE remains set. Chapter 37 handles receive interrupts and shared state."
      },
      {
        "id": "sec-36-9",
        "title": "36.9 Practical Example: Echo Program via UART",
        "content": "We'll write an assembly program that echoes back any character received on USART2. This combines GPIO, UART, and polling.\n\nClarification: The original places _estack at the bottom of a reserved block and omits a full startup/linker contract. The companion reuses the complete Chapter 35 startup/linker design, initializes USART2 explicitly and checks receive error flags. Hardware wiring must match PA2 TX / PA3 RX with compatible logic levels and common ground. Polling remains blocking; this is not an RTOS driver.",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "Original UART echo specimen — incomplete startup/link contract",
            "code": "; uart_echo.s\n.syntax unified\n.cpu cortex-m4\n.thumb\n\n.equ RCC_AHB1ENR, 0x40023830\n.equ RCC_APB1ENR, 0x40023840\n.equ GPIOA_BASE,  0x40020000\n.equ GPIOA_MODER, 0x40020000\n.equ GPIOA_AFRL,  0x40020020\n.equ USART2_BASE, 0x40004400\n.equ USART2_SR,   0x40004400\n.equ USART2_DR,   0x40004404\n.equ USART2_BRR,  0x40004408\n.equ USART2_CR1,  0x4000440C\n\n.section .isr_vector, \"a\"\n.word _estack\n.word Reset_Handler\n\n.section .text\n.thumb_func\n.global Reset_Handler\nReset_Handler:\n    ; Enable GPIOA clock (bit 0) and USART2 clock (bit 17)\n    LDR R0, =RCC_AHB1ENR\n    LDR R1, [R0]\n    ORR R1, R1, #1\n    STR R1, [R0]\n\n    LDR R0, =RCC_APB1ENR\n    LDR R1, [R0]\n    ORR R1, R1, #(1<<17)\n    STR R1, [R0]\n\n    ; Configure PA2 (TX) and PA3 (RX) as alternate function (AF7)\n    LDR R0, =GPIOA_MODER\n    LDR R1, [R0]\n    ; PA2: bits 4-5 = 10 (alternate function)\n    BIC R1, R1, #(3<<4)\n    ORR R1, R1, #(2<<4)\n    ; PA3: bits 6-7 = 10\n    BIC R1, R1, #(3<<6)\n    ORR R1, R1, #(2<<6)\n    STR R1, [R0]\n\n    ; Set alternate function AF7 for PA2/PA3\n    LDR R0, =GPIOA_AFRL\n    LDR R1, [R0]\n    ; PA2: AFRL bits 8-11 = 7\n    BIC R1, R1, #(0xF<<8)\n    ORR R1, R1, #(7<<8)\n    ; PA3: AFRL bits 12-15 = 7\n    BIC R1, R1, #(0xF<<12)\n    ORR R1, R1, #(7<<12)\n    STR R1, [R0]\n\n    ; Configure USART2: 9600 baud, enable TX and RX\n    ; Assuming 16 MHz clock, BRR = 16000000/9600 = 1667 = 0x683\n    LDR R0, =USART2_BRR\n    MOV R1, #0x683\n    STR R1, [R0]\n\n    LDR R0, =USART2_CR1\n    LDR R1, [R0]\n    ORR R1, R1, #(1<<3)  ; TE\n    ORR R1, R1, #(1<<2)  ; RE\n    ORR R1, R1, #(1<<13) ; UE\n    STR R1, [R0]\n\nmain_loop:\n    ; Wait for RXNE\n    LDR R0, =USART2_SR\nwait_rx:\n    LDR R1, [R0]\n    TST R1, #(1<<5)   ; RXNE\n    BEQ wait_rx\n\n    ; Read received character\n    LDR R0, =USART2_DR\n    LDR R2, [R0]      ; character in R2\n\n    ; Wait for TXE\n    LDR R0, =USART2_SR\nwait_tx:\n    LDR R1, [R0]\n    TST R1, #(1<<7)   ; TXE\n    BEQ wait_tx\n\n    ; Transmit same character\n    LDR R0, =USART2_DR\n    STR R2, [R0]\n\n    B main_loop\n\n.section .bss\n.align 3\n_estack: .space 0x400",
            "explanation": "This program polls the UART status flags to receive and transmit."
          },
          {
            "language": "arm",
            "title": "Complete peripheral routines: peripherals.s",
            "code": "/* peripherals.s -- STM32F407, 16 MHz PCLK1 and TIM2 input clock.\n   Exclusive peripheral ownership; USART2 PA2/PA3, 9600 baud, 8N1. */\n.syntax unified\n.cpu cortex-m4\n.thumb\n.text\n.global uart_init,uart_putc,uart_getc,send_string,delay_ms\n.thumb_func\nuart_init:\n    ldr r0,=0x40023830\n    ldr r1,[r0]\n    orr r1,r1,#1\n    str r1,[r0]\n    ldr r1,[r0]\n    ldr r0,=0x40023840\n    ldr r1,[r0]\n    orr r1,r1,#(1<<17)\n    str r1,[r0]\n    ldr r1,[r0]\n    ldr r0,=0x40020000       @ GPIOA_MODER\n    ldr r1,[r0]\n    bic r1,r1,#0xf0\n    orr r1,r1,#0xa0\n    str r1,[r0]\n    ldr r1,[r0,#4]         @ push-pull PA2/PA3\n    bic r1,r1,#0x0c\n    str r1,[r0,#4]\n    ldr r1,[r0,#8]         @ low-speed output configuration\n    bic r1,r1,#0xf0\n    str r1,[r0,#8]\n    ldr r1,[r0,#12]        @ RX pull-up, TX no pull\n    bic r1,r1,#0xf0\n    orr r1,r1,#0x40\n    str r1,[r0,#12]\n    ldr r1,[r0,#0x20]      @ AF7 on PA2 and PA3\n    bic r1,r1,#0xff00\n    orr r1,r1,#0x7700\n    str r1,[r0,#0x20]\n    ldr r0,=0x40004400\n    movs r1,#0\n    str r1,[r0,#12]        @ CR1: disable while configuring\n    str r1,[r0,#16]        @ CR2: one stop bit\n    str r1,[r0,#20]        @ CR3: no flow control/DMA\n    ldr r1,=0x683          @ nearest BRR for 16 MHz / 9600, OVER8=0\n    str r1,[r0,#8]\n    ldr r1,=0x200c         @ UE|TE|RE, 8-bit data, no parity\n    str r1,[r0,#12]\n    bx lr\n.thumb_func\nuart_putc:\n    uxtb r2,r0             @ preserve the character before loading MMIO address\n    ldr r1,=0x40004400\n1:\n    ldr r3,[r1]\n    tst r3,#(1<<7)\n    beq 1b\n    str r2,[r1,#4]\n    bx lr\n.thumb_func\nuart_getc:\n    ldr r1,=0x40004400\n1:\n    ldr r2,[r1]\n    tst r2,#0x2f           @ RXNE or PE/FE/NF/ORE\n    beq 1b\n    ldr r0,[r1,#4]         @ SR then DR clears receive-error sequence\n    tst r2,#0x0f\n    bne 1b                 @ discard a frame with reported receive errors\n    uxtb r0,r0\n    bx lr\n.thumb_func\nsend_string:\n    push {r4,lr}\n    mov r4,r0\n1:\n    ldrb r0,[r4],#1\n    cbz r0,2f\n    bl uart_putc\n    b 1b\n2:\n    pop {r4,pc}\n/* delay_ms(R0): 0..4294967 milliseconds, R0=0 success/-1 invalid.\n   TIM2 is 32-bit on STM32F407. Uses 1 MHz tick to avoid ARR=0. */\n.thumb_func\ndelay_ms:\n    cbz r0,3f\n    ldr r1,=4294967\n    cmp r0,r1\n    bhi 4f\n    movw r1,#1000\n    mul r2,r0,r1\n    subs r2,r2,#1          @ ARR=(milliseconds*1000)-1\n    ldr r0,=0x40023840\n    ldr r1,[r0]\n    orr r1,r1,#1\n    str r1,[r0]\n    ldr r1,[r0]\n    ldr r0,=0x40000000     @ TIM2 base\n    movs r1,#0\n    str r1,[r0]            @ CR1 stop\n    str r1,[r0,#4]         @ CR2 default\n    str r1,[r0,#8]         @ SMCR internal clock\n    str r1,[r0,#12]        @ DIER: polling only\n    movs r1,#15\n    str r1,[r0,#0x28]      @ PSC=15 => 16 MHz /16 =1 MHz\n    str r2,[r0,#0x2c]      @ ARR\n    movs r1,#1\n    str r1,[r0,#0x14]      @ EGR.UG loads PSC and resets count\n    movs r1,#0\n    str r1,[r0,#0x10]      @ clear initialization UIF before timing\n    movs r1,#9\n    str r1,[r0]            @ OPM|CEN, stop automatically on update\n1:\n    ldr r1,[r0,#0x10]\n    tst r1,#1\n    beq 1b\n    movs r1,#0\n    str r1,[r0,#0x10]\n3:\n    movs r0,#0\n    bx lr\n4:\n    movs r0,#0\n    mvns r0,r0\n    bx lr",
            "explanation": "Provides UART initialization, byte transmit/receive, string transmit and TIM2 delay. Functions use GNU Arm syntax and AAPCS register preservation. UART errors are discarded after the documented status/data-read sequence. Clock and physical I/O behavior require board testing."
          },
          {
            "language": "arm",
            "title": "Complete startup and echo main: uart_echo.s",
            "code": "/* blink.s: STM32F407VG Discovery, PD12 LED, Cortex-M4 Thumb. */\n.syntax unified\n.cpu cortex-m4\n.thumb\n.ifndef LED_PIN\n.equ LED_PIN,12\n.endif\n.equ RCC_AHB1ENR,0x40023830\n.equ GPIOD_MODER,0x40020c00\n.equ GPIOD_OTYPER,0x40020c04\n.equ GPIOD_OSPEEDR,0x40020c08\n.equ GPIOD_PUPDR,0x40020c0c\n.equ GPIOD_BSRR,0x40020c18\n.section .isr_vector,\"a\",%progbits\n.global vectors\nvectors:\n    .word _estack,Reset_Handler\n    .word Default_Handler,Default_Handler,Default_Handler\n    .word Default_Handler,Default_Handler\n    .word 0,0,0,0\n    .word Default_Handler,Default_Handler,0\n    .word Default_Handler,Default_Handler\n    .rept 82\n    .word Default_Handler\n    .endr\n.section .text.Reset_Handler,\"ax\",%progbits\n.global Reset_Handler\n.type Reset_Handler,%function\n.thumb_func\nReset_Handler:\n    ldr r0,=0xe000ed08      @ VTOR: use the linked vector-table address\n    ldr r1,=vectors\n    str r1,[r0]\n    dsb\n    isb\n    ldr r0,=_sdata\n    ldr r1,=_edata\n    ldr r2,=_sidata\n1:\n    cmp r0,r1\n    bhs 2f\n    ldr r3,[r2],#4\n    str r3,[r0],#4\n    b 1b\n2:\n    ldr r0,=_sbss\n    ldr r1,=_ebss\n    movs r2,#0\n3:\n    cmp r0,r1\n    bhs 4f\n    str r2,[r0],#4\n    b 3b\n4:\n    bl main\n    b .\n.size Reset_Handler,.-Reset_Handler\n\n.section .text,\"ax\",%progbits\n.thumb_func\nDefault_Handler:\n    b .\n.global main\n.thumb_func\nmain:\n    bl uart_init\n1:\n    bl uart_getc\n    bl uart_putc\n    b 1b",
            "explanation": "Use stm32f4.ld from Chapter 35. Vectors have valid default handlers, the initial stack is supplied by the linker, and data/BSS initialization precedes the polling loop."
          },
          {
            "language": "bash",
            "title": "Build the complete UART program",
            "code": "arm-none-eabi-as -mcpu=cortex-m4 -mthumb -g peripherals.s -o peripherals.o\narm-none-eabi-as -mcpu=cortex-m4 -mthumb -g uart_echo.s -o uart_echo.o\narm-none-eabi-ld -T stm32f4.ld uart_echo.o peripherals.o -o uart_echo.elf\narm-none-eabi-objdump -d uart_echo.elf",
            "explanation": "Configure the connected serial terminal for 9600 baud, 8 data bits, no parity, one stop bit and no flow control. Check clock, AF selection, TX/RX crossing and voltage levels if output is absent or garbled. These troubleshooting topics are retained from the newer ebook expansion."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 36.3",
            "code": "send_string:\n    ; R0 = pointer to string\n    push {r4, lr}\n    mov r4, r0\n.loop:\n    ldrb r2, [r4], #1      ; load byte, increment pointer\n    cmp r2, #0\n    beq .done\n    ; wait TXE\n    ldr r3, =USART2_SR\n.wait_tx:\n    ldr r1, [r3]\n    tst r1, #(1<<7)\n    beq .wait_tx\n    ; send\n    ldr r3, =USART2_DR\n    str r2, [r3]\n    b .loop\n.done:\n    pop {r4, pc}",
            "explanation": "Original source Solution 36.3; the complete peripheral routines supply missing constants and corrected behavior."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 36.4",
            "code": "delay_ms:\n    ; R0 = milliseconds\n    push {r4, r5, lr}\n    ; Assume TIM2 PSC already set to 16000-1, ARR set to 1\n    ; We'll use loop: for each ms, start timer, wait for UIF, clear.\n    mov r5, r0\n1:\n    cmp r5, #0\n    beq .done\n    ; Start timer (CEN = 1)\n    ldr r3, =TIM2_CR1\n    ldr r1, [r3]\n    orr r1, r1, #1\n    str r1, [r3]\n    ; Wait for UIF\n    ldr r3, =TIM2_SR\n.wait:\n    ldr r1, [r3]\n    tst r1, #1\n    beq .wait\n    ; Clear UIF (write 0)\n    bic r1, r1, #1\n    str r1, [r3]\n    ; Stop timer (CEN = 0)\n    ldr r3, =TIM2_CR1\n    ldr r1, [r3]\n    bic r1, r1, #1\n    str r1, [r3]\n    subs r5, r5, #1\n    bne 1b\n.done:\n    pop {r4, r5, pc}",
            "explanation": "Original source Solution 36.4; the complete peripheral routines supply missing constants and corrected behavior."
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-36-1",
        "title": "Exercise 36.1: GPIO Register Manipulation",
        "description": "Given GPIOD_MODER address 0x40020C00, write ARM assembly code to configure PD15 as output and PD14 as input. Show the RMW sequence.",
        "solution": ".syntax unified\n.cpu cortex-m4\n.thumb\n.text\nLDR R0, =0x40020C00   @ GPIOD_MODER\nLDR R1, [R0]\n@ PD15: bits 30-31 = 01 (output)\nBIC R1, R1, #(3<<30)\nORR R1, R1, #(1<<30)\n@ PD14: bits 28-29 = 00 (input) - already cleared by default, but ensure\nBIC R1, R1, #(3<<28)\nSTR R1, [R0]",
        "solutionLanguage": "arm",
        "solutionExplanation": " Initialization fragment: enable GPIOD first. If another context modifies the same register, use the documented synchronization protocol; this RMW sequence is not itself atomic."
      },
      {
        "id": "ex-36-2",
        "title": "Exercise 36.2: Toggle Multiple Pins",
        "description": "Write code to toggle PD12, PD13, PD14 simultaneously using the ODR register. Use a single RMW operation. What is the mask?",
        "solution": ".syntax unified\n.cpu cortex-m4\n.thumb\n.text\nLDR R0, =0x40020C14   @ GPIOD_ODR\nLDR R1, [R0]\nEOR R1, R1, #( (1<<12) | (1<<13) | (1<<14) )  @ toggle bits\nSTR R1, [R0]",
        "solutionLanguage": "arm",
        "solutionExplanation": "Mask = 0x7000. Initialization fragment: enable GPIOD first. If another context modifies the same register, use the documented synchronization protocol; this RMW sequence is not itself atomic."
      },
      {
        "id": "ex-36-3",
        "title": "Exercise 36.3: UART Transmit String",
        "description": "Write an assembly routine that transmits a null-terminated string via UART using the polling method. Assume R0 points to the string, and the UART is already initialized. Implement a loop that sends each character until null.",
        "solution": "/* peripherals.s -- STM32F407, 16 MHz PCLK1 and TIM2 input clock.\n   Exclusive peripheral ownership; USART2 PA2/PA3, 9600 baud, 8N1. */\n.syntax unified\n.cpu cortex-m4\n.thumb\n.text\n.global uart_init,uart_putc,uart_getc,send_string,delay_ms\n.thumb_func\nuart_init:\n    ldr r0,=0x40023830\n    ldr r1,[r0]\n    orr r1,r1,#1\n    str r1,[r0]\n    ldr r1,[r0]\n    ldr r0,=0x40023840\n    ldr r1,[r0]\n    orr r1,r1,#(1<<17)\n    str r1,[r0]\n    ldr r1,[r0]\n    ldr r0,=0x40020000       @ GPIOA_MODER\n    ldr r1,[r0]\n    bic r1,r1,#0xf0\n    orr r1,r1,#0xa0\n    str r1,[r0]\n    ldr r1,[r0,#4]         @ push-pull PA2/PA3\n    bic r1,r1,#0x0c\n    str r1,[r0,#4]\n    ldr r1,[r0,#8]         @ low-speed output configuration\n    bic r1,r1,#0xf0\n    str r1,[r0,#8]\n    ldr r1,[r0,#12]        @ RX pull-up, TX no pull\n    bic r1,r1,#0xf0\n    orr r1,r1,#0x40\n    str r1,[r0,#12]\n    ldr r1,[r0,#0x20]      @ AF7 on PA2 and PA3\n    bic r1,r1,#0xff00\n    orr r1,r1,#0x7700\n    str r1,[r0,#0x20]\n    ldr r0,=0x40004400\n    movs r1,#0\n    str r1,[r0,#12]        @ CR1: disable while configuring\n    str r1,[r0,#16]        @ CR2: one stop bit\n    str r1,[r0,#20]        @ CR3: no flow control/DMA\n    ldr r1,=0x683          @ nearest BRR for 16 MHz / 9600, OVER8=0\n    str r1,[r0,#8]\n    ldr r1,=0x200c         @ UE|TE|RE, 8-bit data, no parity\n    str r1,[r0,#12]\n    bx lr\n.thumb_func\nuart_putc:\n    uxtb r2,r0             @ preserve the character before loading MMIO address\n    ldr r1,=0x40004400\n1:\n    ldr r3,[r1]\n    tst r3,#(1<<7)\n    beq 1b\n    str r2,[r1,#4]\n    bx lr\n.thumb_func\nuart_getc:\n    ldr r1,=0x40004400\n1:\n    ldr r2,[r1]\n    tst r2,#0x2f           @ RXNE or PE/FE/NF/ORE\n    beq 1b\n    ldr r0,[r1,#4]         @ SR then DR clears receive-error sequence\n    tst r2,#0x0f\n    bne 1b                 @ discard a frame with reported receive errors\n    uxtb r0,r0\n    bx lr\n.thumb_func\nsend_string:\n    push {r4,lr}\n    mov r4,r0\n1:\n    ldrb r0,[r4],#1\n    cbz r0,2f\n    bl uart_putc\n    b 1b\n2:\n    pop {r4,pc}\n/* delay_ms(R0): 0..4294967 milliseconds, R0=0 success/-1 invalid.\n   TIM2 is 32-bit on STM32F407. Uses 1 MHz tick to avoid ARR=0. */\n.thumb_func\ndelay_ms:\n    cbz r0,3f\n    ldr r1,=4294967\n    cmp r0,r1\n    bhi 4f\n    movw r1,#1000\n    mul r2,r0,r1\n    subs r2,r2,#1          @ ARR=(milliseconds*1000)-1\n    ldr r0,=0x40023840\n    ldr r1,[r0]\n    orr r1,r1,#1\n    str r1,[r0]\n    ldr r1,[r0]\n    ldr r0,=0x40000000     @ TIM2 base\n    movs r1,#0\n    str r1,[r0]            @ CR1 stop\n    str r1,[r0,#4]         @ CR2 default\n    str r1,[r0,#8]         @ SMCR internal clock\n    str r1,[r0,#12]        @ DIER: polling only\n    movs r1,#15\n    str r1,[r0,#0x28]      @ PSC=15 => 16 MHz /16 =1 MHz\n    str r2,[r0,#0x2c]      @ ARR\n    movs r1,#1\n    str r1,[r0,#0x14]      @ EGR.UG loads PSC and resets count\n    movs r1,#0\n    str r1,[r0,#0x10]      @ clear initialization UIF before timing\n    movs r1,#9\n    str r1,[r0]            @ OPM|CEN, stop automatically on update\n1:\n    ldr r1,[r0,#0x10]\n    tst r1,#1\n    beq 1b\n    movs r1,#0\n    str r1,[r0,#0x10]\n3:\n    movs r0,#0\n    bx lr\n4:\n    movs r0,#0\n    mvns r0,r0\n    bx lr",
        "solutionLanguage": "arm",
        "solutionExplanation": "The complete send_string implementation saves R4/LR, keeps the pointer in R4 across uart_putc, and stops before transmitting the NUL. uart_putc preserves the byte while polling TXE. Assemble this file once and call send_string with R0 pointing to an accessible terminated string after uart_init."
      },
      {
        "id": "ex-36-4",
        "title": "Exercise 36.4: Timer Delay Function",
        "description": "Implement a function delay_ms that takes a delay in milliseconds in R0 and blocks for that duration using TIM2 polling. Assume timer clock is 16 MHz, prescaler 16000 (so timer counts at 1 kHz). Use ARR = delay for simple delay, but note maximum delay is limited by 16-bit ARR. Show code.",
        "solution": "/* peripherals.s -- STM32F407, 16 MHz PCLK1 and TIM2 input clock.\n   Exclusive peripheral ownership; USART2 PA2/PA3, 9600 baud, 8N1. */\n.syntax unified\n.cpu cortex-m4\n.thumb\n.text\n.global uart_init,uart_putc,uart_getc,send_string,delay_ms\n.thumb_func\nuart_init:\n    ldr r0,=0x40023830\n    ldr r1,[r0]\n    orr r1,r1,#1\n    str r1,[r0]\n    ldr r1,[r0]\n    ldr r0,=0x40023840\n    ldr r1,[r0]\n    orr r1,r1,#(1<<17)\n    str r1,[r0]\n    ldr r1,[r0]\n    ldr r0,=0x40020000       @ GPIOA_MODER\n    ldr r1,[r0]\n    bic r1,r1,#0xf0\n    orr r1,r1,#0xa0\n    str r1,[r0]\n    ldr r1,[r0,#4]         @ push-pull PA2/PA3\n    bic r1,r1,#0x0c\n    str r1,[r0,#4]\n    ldr r1,[r0,#8]         @ low-speed output configuration\n    bic r1,r1,#0xf0\n    str r1,[r0,#8]\n    ldr r1,[r0,#12]        @ RX pull-up, TX no pull\n    bic r1,r1,#0xf0\n    orr r1,r1,#0x40\n    str r1,[r0,#12]\n    ldr r1,[r0,#0x20]      @ AF7 on PA2 and PA3\n    bic r1,r1,#0xff00\n    orr r1,r1,#0x7700\n    str r1,[r0,#0x20]\n    ldr r0,=0x40004400\n    movs r1,#0\n    str r1,[r0,#12]        @ CR1: disable while configuring\n    str r1,[r0,#16]        @ CR2: one stop bit\n    str r1,[r0,#20]        @ CR3: no flow control/DMA\n    ldr r1,=0x683          @ nearest BRR for 16 MHz / 9600, OVER8=0\n    str r1,[r0,#8]\n    ldr r1,=0x200c         @ UE|TE|RE, 8-bit data, no parity\n    str r1,[r0,#12]\n    bx lr\n.thumb_func\nuart_putc:\n    uxtb r2,r0             @ preserve the character before loading MMIO address\n    ldr r1,=0x40004400\n1:\n    ldr r3,[r1]\n    tst r3,#(1<<7)\n    beq 1b\n    str r2,[r1,#4]\n    bx lr\n.thumb_func\nuart_getc:\n    ldr r1,=0x40004400\n1:\n    ldr r2,[r1]\n    tst r2,#0x2f           @ RXNE or PE/FE/NF/ORE\n    beq 1b\n    ldr r0,[r1,#4]         @ SR then DR clears receive-error sequence\n    tst r2,#0x0f\n    bne 1b                 @ discard a frame with reported receive errors\n    uxtb r0,r0\n    bx lr\n.thumb_func\nsend_string:\n    push {r4,lr}\n    mov r4,r0\n1:\n    ldrb r0,[r4],#1\n    cbz r0,2f\n    bl uart_putc\n    b 1b\n2:\n    pop {r4,pc}\n/* delay_ms(R0): 0..4294967 milliseconds, R0=0 success/-1 invalid.\n   TIM2 is 32-bit on STM32F407. Uses 1 MHz tick to avoid ARR=0. */\n.thumb_func\ndelay_ms:\n    cbz r0,3f\n    ldr r1,=4294967\n    cmp r0,r1\n    bhi 4f\n    movw r1,#1000\n    mul r2,r0,r1\n    subs r2,r2,#1          @ ARR=(milliseconds*1000)-1\n    ldr r0,=0x40023840\n    ldr r1,[r0]\n    orr r1,r1,#1\n    str r1,[r0]\n    ldr r1,[r0]\n    ldr r0,=0x40000000     @ TIM2 base\n    movs r1,#0\n    str r1,[r0]            @ CR1 stop\n    str r1,[r0,#4]         @ CR2 default\n    str r1,[r0,#8]         @ SMCR internal clock\n    str r1,[r0,#12]        @ DIER: polling only\n    movs r1,#15\n    str r1,[r0,#0x28]      @ PSC=15 => 16 MHz /16 =1 MHz\n    str r2,[r0,#0x2c]      @ ARR\n    movs r1,#1\n    str r1,[r0,#0x14]      @ EGR.UG loads PSC and resets count\n    movs r1,#0\n    str r1,[r0,#0x10]      @ clear initialization UIF before timing\n    movs r1,#9\n    str r1,[r0]            @ OPM|CEN, stop automatically on update\n1:\n    ldr r1,[r0,#0x10]\n    tst r1,#1\n    beq 1b\n    movs r1,#0\n    str r1,[r0,#0x10]\n3:\n    movs r0,#0\n    bx lr\n4:\n    movs r0,#0\n    mvns r0,r0\n    bx lr",
        "solutionLanguage": "arm",
        "solutionExplanation": "The complete delay_ms function owns TIM2, validates the 32-bit tick calculation, handles zero immediately, initializes PSC/ARR/UG/UIF and uses one-pulse mode. It returns zero or -1 for out-of-range milliseconds. This replaces the inaccurate PSC/ARR timing assumptions while preserving the requested blocking-delay function."
      },
      {
        "id": "ex-36-5",
        "title": "Exercise 36.5: Read-Modify-Write Race",
        "description": "Explain why an RMW sequence can be unsafe when interrupts are enabled. Give an example of a problematic scenario. How can you prevent it?",
        "solution": "An RMW sequence consists of read, modify, write. If an interrupt occurs between read and write and modifies the same register (e.g., sets a different bit), when the interrupted code resumes and writes its modified value, it will overwrite the interrupt's change. This is a lost update. To prevent, either disable interrupts around the RMW, use bit-banding for single-bit operations, or use exclusive load/store (LDREX/STREX).",
        "solutionExplanation": "Correction: restore the previous mask state, and do not rely on exclusive accesses for peripheral Device memory. A GPIO set/reset operation can use BSRR directly; a valid configuration RMW may use a short critical section if only maskable interrupts share it."
      }
    ],
    "practiceQuestions": [
      {
        "question": "What is memory-mapped I/O? How does it differ from port-mapped I/O?",
        "answer": "MMIO uses addresses in the processor memory map and ordinary loads/stores with device-specific semantics. Port-mapped I/O uses a separate I/O address space and special instructions such as x86 IN/OUT. Neither makes peripheral registers ordinary RAM."
      },
      {
        "question": "Explain the read-modify-write sequence. Why is it used?",
        "answer": "Read the current value, mask/insert the desired field, then write it back to preserve unrelated writable bits. It is suitable only when reads and writes have compatible semantics and concurrent updates are excluded; it is unsafe for many status or command registers."
      },
      {
        "question": "Why must peripheral clocks be enabled before accessing a peripheral? How do you enable them?",
        "answer": "Clock gating stops peripheral logic to save power. For STM32F407 GPIOD, set RCC_AHB1ENR bit 3 and perform the required enable/readback sequence before configuring registers. The enable location and readiness requirements differ by peripheral."
      },
      {
        "question": "On an STM32F4, how do you configure a GPIO pin as an output? List the steps and registers.",
        "answer": "Enable the GPIO port clock, select output mode 01 in the pin’s two-bit MODER field, configure type/speed/pulls and initial output level, then drive through ODR or BSRR. Use the board pin mapping and avoid changing unrelated fields."
      },
      {
        "question": "What is the purpose of the BSRR register in GPIO? How does it help atomic operations?",
        "answer": "BSRR provides per-pin set commands in bits 0–15 and reset commands in bits 16–31. A direct mask write changes selected output bits without reading ODR and losing another writer’s update. It does not provide an atomic toggle command."
      },
      {
        "question": "Describe how to send a byte over UART using polling. Which status flags are used?",
        "answer": "After enabling the clock, alternate-function pins and UART configuration, poll SR.TXE until the data register can accept a byte, then write DR. TXE is not transmission-complete; wait for TC when the final stop bit must have left the pin. RXNE indicates received data."
      },
      {
        "question": "What is a timer prescaler and auto-reload register? How do they determine the interrupt frequency?",
        "answer": "For a basic edge-aligned upcounter, tick frequency is fTIM/(PSC+1) and update frequency is fTIM/((PSC+1)*(ARR+1)). A prescaler value of 15999 divides by 16000. STM32 APB prescaling can double the timer clock relative to PCLK, so derive fTIM from the clock tree."
      },
      {
        "question": "Why is polling less efficient than interrupts for peripheral handling?",
        "answer": "A tight polling loop consumes cycles while waiting and can delay other work. Interrupts let the CPU work or sleep between events, but introduce entry overhead, concurrency and latency considerations. Polling can still suit simple bounded tasks."
      },
      {
        "question": "What is a bit field? How do you extract and insert a bit field in ARM assembly?",
        "answer": "A bit field occupies adjacent bits representing a value. UBFX Rd,Rn,#lsb,#width extracts an unsigned field; BFI Rd,Rn,#lsb,#width inserts low source bits into a destination register. For MMIO, an additional valid read/write protocol is still needed."
      },
      {
        "question": "How can you ensure atomic access to a peripheral register when interrupts are enabled? Name at least two methods.",
        "answer": "Use a peripheral-provided atomic set/reset register such as BSRR, or protect a valid RMW by saving PRIMASK, masking relevant interrupts and restoring the prior state. Bit-banding applies only where implemented and suitable. Do not assume LDREX/STREX works on Device-memory peripheral registers or excludes DMA."
      }
    ],
    "summary": [
      "Memory-mapped I/O allows CPU to control hardware by reading/writing specific addresses.",
      "Read-modify-write is the standard pattern for modifying register bits; use OR to set, AND/BIC to clear, XOR to toggle.",
      "Clock gating: peripherals must be enabled before use.",
      "GPIO configuration involves setting mode bits; output data can be set via ODR or BSRR.",
      "UART requires clock, pin alternate function, baud rate, and enabling TX/RX.",
      "Timers provide precise delays and periodic events.",
      "Polling flags is simple but wastes CPU; interrupts (next chapter) are more efficient.",
      "Always consider atomicity when using RMW in interrupt-prone environments."
    ]
  },
  {
    "id": 37,
    "slug": "chapter-37-interrupt-handling-real-time",
    "level": 7,
    "levelTitle": "Embedded Systems and Real-Time Assembly",
    "title": "Chapter 37: Interrupt Handling and Real-Time Constraints",
    "subtitle": "NVIC, Hardware Stacking, Priority Preemption, Tail-Chaining, and ISRs",
    "learningObjectives": [
      "Understand what interrupts are and how they enable responsive embedded systems.",
      "Learn the interrupt architecture of ARM Cortex-M: vector table, NVIC, priority levels.",
      "Write interrupt service routines (ISRs) in assembly, handling register stacking and proper return.",
      "Configure peripheral interrupts (e.g., UART receive, timer update) and enable them through the NVIC.",
      "Manage shared data between ISRs and main code safely (volatile, critical sections).",
      "Analyze real-time constraints: interrupt latency, priority inversion, and deadline miss.",
      "Implement a simple interrupt-driven UART echo and timer-based LED toggling.",
      "Use debug techniques for interrupt-driven code."
    ],
    "prerequisites": [
      "Solid understanding of memory-mapped I/O and peripheral control (Chapter 36).",
      "Knowledge of ARM Cortex-M architecture, registers, and instruction set (Chapter 35).",
      "Familiarity with assembly programming and bit manipulation.",
      "Basic understanding of real-time systems concepts."
    ],
    "keyConcepts": [
      "Interrupt: An asynchronous event that causes the CPU to suspend current execution and jump to a handler.",
      "Interrupt Service Routine (ISR): The function that runs in response to an interrupt.",
      "Vector table: A table of function pointers for each exception/interrupt number.",
      "NVIC (Nested Vectored Interrupt Controller): Hardware that manages interrupt priorities and enabling.",
      "Priority levels: Higher priority interrupts preempt lower ones; Cortex-M supports 0–255 (configurable).",
      "Exception entry/exit: Hardware automatically stacks registers (R0-R3, R12, LR, PC, xPSR) and unstacks on return.",
      "Tail-chaining: Back-to-back interrupts skip unnecessary state restore/save, reducing latency.",
      "Interrupt latency: Time from interrupt request to execution of the first ISR instruction.",
      "Critical section: Code region where interrupts are disabled to protect shared data.",
      "Real-time constraint: A deadline that must be met; violation may cause system failure."
    ],
    "diagramType": "interrupts_nvic",
    "sections": [
      {
        "id": "sec-37-1",
        "title": "37.1 Introduction to Interrupts",
        "content": "In embedded systems, polling peripherals (continuously checking status flags) wastes CPU cycles and makes the system unresponsive to other tasks. Interrupts provide a mechanism for hardware to notify the CPU when an event occurs (e.g., byte received, timer expired). The CPU suspends the current task, executes an Interrupt Service Routine (ISR), then returns to the interrupted code.\n\nInterrupts are fundamental to real-time systems because they allow the CPU to respond to events with minimal delay, rather than constantly checking. This chapter focuses on ARM Cortex-M interrupt handling, the most common embedded architecture."
      },
      {
        "id": "sec-37-1-1",
        "title": "37.1.1 Polling vs Interrupts",
        "content": "- Polling: CPU repeatedly checks a flag. Simple but wastes time; response latency depends on when the check occurs.\n- Interrupt: Hardware signals CPU; CPU jumps to handler immediately. Efficient; response latency is small and deterministic (interrupt latency).\n\nExample: UART receive. Polling would loop waiting for RXNE flag, blocking everything else. An interrupt-driven UART receives data in the background, allowing the main loop to do other work.\n\nClarification: Interrupts are not inherently immediate or deterministic: masking and higher-priority work delay service. A bounded polling schedule can meet deadlines. Choose using measured event rates, latency and power requirements, not a universal frequency cutoff."
      },
      {
        "id": "sec-37-2",
        "title": "37.2 ARM Cortex-M Interrupt Architecture",
        "content": ""
      },
      {
        "id": "sec-37-2-1",
        "title": "37.2.1 Vector Table",
        "content": "The vector table is an array of 32-bit addresses located at the beginning of memory (typically address 0x00000000, relocatable via VTOR). The first entries are system exceptions; the rest are peripheral interrupts. For example:\n\n- Entry 0: Initial stack pointer\n- Entry 1: Reset_Handler\n- Entry 2: NMI_Handler\n- Entry 3: HardFault_Handler\n- ...\n- Entry 16+n: IRQ handler for peripheral n (varies by chip)\n\nWhen an interrupt occurs, the CPU reads the corresponding entry, loads the address, and jumps to that handler.\n\nIn assembly, we define the vector table in a section (e.g., .isr_vector). Each entry is a .word with the handler address. For example, a UART2 interrupt might be entry 38 (depends on chip).\n\nClarification: On STM32F407, USART2 is IRQ38 and therefore vector entry 54 at offset 0xD8; TIM2 is IRQ28, entry44 at 0xB0. Entry zero is a stack value, not an exception handler."
      },
      {
        "id": "sec-37-2-2",
        "title": "37.2.2 Exception Entry and Exit",
        "content": "When an interrupt is accepted, the hardware automatically pushes these registers onto the current stack (MSP or PSP): R0, R1, R2, R3, R12, LR (return address), PC (return address), and xPSR. This is called stacking. The CPU then sets LR to a special value (EXC_RETURN) that indicates the return mode and stack used.\n\nThe ISR runs like a normal function. When it returns, the hardware detects the EXC_RETURN value in LR, unstacks the registers, and resumes the interrupted code.\n\nEXC_RETURN values:\n- 0xFFFFFFF9: Return to Handler mode, MSP\n- 0xFFFFFFFD: Return to Thread mode, MSP\n- 0xFFFFFFF1: Return to Handler mode, PSP\n- 0xFFFFFFF5: Return to Thread mode, PSP\n\nIn a simple bare-metal program, we typically use MSP and Thread mode, so EXC_RETURN is 0xFFFFFFF9 when returning to Thread mode (main). The hardware sets LR automatically; the ISR just needs to execute BX LR or POP {pc}.\n\nImportant: The ISR does not need to manually save/restore registers; hardware does it. However, it must preserve any registers it uses beyond R0-R3/R12 if those are expected to survive? Actually, because the interrupted code's registers are saved, the ISR can freely use R0-R3, R12, and LR without saving. Other registers (R4-R11) are not automatically saved, so the ISR must preserve them if it modifies them (by pushing/popping).\n\nClarification: The original EXC_RETURN list is incorrect. For basic Cortex-M4 frames: 0xFFFFFFF1 returns to Handler/MSP; 0xFFFFFFF9 to Thread/MSP; 0xFFFFFFFD to Thread/PSP. 0xFFFFFFF5 is not a valid basic return encoding. Handler LR must retain EXC_RETURN: save it before BL. POP {pc} is valid only when it retrieves the previously saved EXC_RETURN. R4–R11 require software preservation; an FP frame has additional rules."
      },
      {
        "id": "sec-37-2-3",
        "title": "37.2.3 NVIC",
        "content": "The Nested Vectored Interrupt Controller (NVIC) manages interrupts:\n\n- Enable/disable individual interrupts via ISER (Interrupt Set-Enable Register) and ICER (Clear-Enable).\n- Set priority via IPR (Interrupt Priority Register). Each priority is 8-bit; lower number = higher priority.\n- Pending interrupts via ISPR/ICPR.\n\nThe NVIC registers are memory-mapped in the System Control Space (SCS) starting at 0xE000E100. For example, to enable interrupt number 38 (USART2), set bit 38 in ISER0 (since ISER0 covers interrupts 0–31, ISER1 covers 32–63; actually ISER0 covers 0-31, ISER1 covers 32-63, etc. The bit position is the interrupt number modulo 32, in the appropriate register).\n\nEnabling an interrupt:\n- Set the interrupt priority in IPR.\n- Set the corresponding bit in ISER.\n\nGlobally enabling interrupts:\n- Clear PRIMASK via CPSIE i (or MOV R0, #0; MSR PRIMASK, R0). PRIMASK is a special register; setting it disables all interrupts except NMI/HardFault.\n\nExample: Enable USART2 interrupt (assuming IRQ number 38):\n\nClarification: IRQ38 uses ISER1 bit6, never bit38 of a 32-bit ISER0. Write-one command registers do not require read-modify-write. NVIC state and peripheral status are separate; clear the actual source using its specified protocol.",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "Enable USART2 interrupt in NVIC",
            "code": "; Enable USART2 interrupt in NVIC\nLDR R0, =0xE000E100   ; ISER0 base\nMOV R1, #(1<<6)       ; IRQ38 is bit 6 in ISER1? Actually 38 = 32 + 6, so ISER1 bit 6.\nLDR R0, =0xE000E104   ; ISER1 for IRQ32-63\nMOV R1, #(1<<6)\nSTR R1, [R0]"
          }
        ]
      },
      {
        "id": "sec-37-2-4",
        "title": "37.2.4 Priority Levels",
        "content": "Cortex-M supports up to 256 priority levels (0–255), but many implementations reduce this (e.g., 4 bits = 16 levels). Lower value = higher priority. If two interrupts have the same priority, the lower IRQ number wins.\n\nPriority affects preemption: a higher-priority interrupt can interrupt a lower-priority ISR. This nesting is handled by hardware. Priorities also affect tail-chaining: if an interrupt becomes pending while another is finishing, the hardware skips state restore and immediately enters the next ISR.\n\nClarification: STM32F407 implements four high priority bits. PRIGROUP divides them into preemption and subpriority fields. Equal preemption priorities do not preempt one another; full priority and exception number resolve pending arbitration. Reset priority is 0, not 128. BASEPRI=0 disables threshold masking; otherwise preserve its prior value when entering/exiting a priority-based critical section. Reference: https://arm-software.github.io/CMSIS_6/latest/Core/group__NVIC__gr.html"
      },
      {
        "id": "sec-37-3",
        "title": "37.3 Writing Interrupt Service Routines in Assembly",
        "content": "An ISR is just a function with a specific name that matches the vector table entry. For example, for USART2, the handler might be USART2_IRQHandler. We define it in assembly and place its address in the vector table.\n\nBasic ISR structure:\n\nClarification: A handler that calls helpers must preserve LR/EXC_RETURN and maintain 8-byte stack alignment at calls. Clearing peripheral flags is device-specific: USART SR/DR reads acknowledge RX/errors; TIM2 UIF is write-zero-to-clear. Do not indiscriminately clear unrelated flags.",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "37.3 Writing Interrupt Service Routines in Assembly — listing 1",
            "code": ".thumb_func\n.global USART2_IRQHandler\nUSART2_IRQHandler:\n    ; Check which interrupt source (if multiple)\n    ; Handle the interrupt (read/write peripheral registers)\n    ; Clear the interrupt flag in the peripheral\n    ; Return\n    BX LR",
            "explanation": "Because the hardware saves R0-R3, R12, LR, PC, xPSR, we can use those registers without saving. If we need R4-R11, we must push/pop them.\n\nReturn: We can use BX LR (return from exception). Alternatively, POP {pc}.\n\nClearing the interrupt flag: Most peripherals require the ISR to clear the interrupt flag, otherwise the ISR will be re-entered indefinitely. For UART receive, reading the data register (DR) clears RXNE. For timer update, writing 0 to the UIF bit clears it.\n\nExample: UART receive interrupt handler"
          },
          {
            "language": "arm",
            "title": "37.3 Writing Interrupt Service Routines in Assembly — listing 2",
            "code": ".thumb_func\n.global USART2_IRQHandler\nUSART2_IRQHandler:\n    ; Check if RXNE (receive not empty) is set\n    LDR R0, =USART2_SR\n    LDR R1, [R0]\n    TST R1, #(1<<5)      ; RXNE\n    BEQ .check_tx        ; if not, maybe check other sources\n\n    ; Read received byte\n    LDR R0, =USART2_DR\n    LDR R2, [R0]         ; byte in R2\n    ; Store it in a global buffer or process directly\n    ; For echo, we could immediately transmit\n    ; But we'll just store it for main loop to process\n\n    ; Possibly set a flag or add to ring buffer\n    ; ...\n\n.check_tx:\n    ; Check TXE if transmit interrupt enabled\n    ; ...\n\n    ; Return\n    BX LR",
            "explanation": "Important: The ISR must be fast. Long processing should be deferred to the main loop (e.g., using a flag or queue). This keeps interrupt latency low for other interrupts."
          }
        ]
      },
      {
        "id": "sec-37-4",
        "title": "37.4 Configuring Peripheral Interrupts",
        "content": "To use interrupts for a peripheral, we must:\n\n1. Enable the interrupt source in the peripheral's control register (e.g., set RXNEIE in USART_CR1 for receive interrupt).\n2. Enable the corresponding interrupt in the NVIC (ISER).\n3. Set the priority in the NVIC IPR (optional, default 0).\n4. Globally enable interrupts (clear PRIMASK).\n\nExample: Configure USART2 to generate an interrupt when a byte is received.",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "Enable RXNE interrupt in USART2 CR1",
            "code": "; Enable RXNE interrupt in USART2 CR1\nLDR R0, =USART2_CR1\nLDR R1, [R0]\nORR R1, R1, #(1<<5)   ; RXNEIE\nSTR R1, [R0]\n\n; Enable USART2 interrupt in NVIC (IRQ38)\nLDR R0, =0xE000E104   ; ISER1\nMOV R1, #(1<<6)       ; bit 6 for IRQ38\nSTR R1, [R0]\n\n; Globally enable interrupts\nCPSIE I",
            "explanation": "After this, whenever a byte is received, the CPU will jump to USART2_IRQHandler."
          }
        ]
      },
      {
        "id": "sec-37-5",
        "title": "37.5 Shared Data and Critical Sections",
        "content": "When an ISR and the main loop share data (e.g., a flag, buffer), access must be synchronized. Otherwise, the main loop might read a partially updated value."
      },
      {
        "id": "sec-37-5-1",
        "title": "37.5.1 Disabling Interrupts",
        "content": "The simplest method is to disable interrupts around the critical section in the main loop, then re-enable.\n\nClarification: Save PRIMASK with MRS, execute CPSID i, and restore it using MSR PRIMASK. An unconditional CPSIE i can incorrectly enable interrupts in an already-masked caller. NMI, HardFault and DMA are not excluded by this mask.",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "37.5.1 Disabling Interrupts — listing 1",
            "code": "CPSID I            ; disable interrupts\n; critical section: access shared data\nCPSIE I            ; enable interrupts",
            "explanation": "This ensures the main loop cannot be interrupted during the critical section. However, disabling interrupts increases interrupt latency, so keep critical sections short."
          }
        ]
      },
      {
        "id": "sec-37-5-2",
        "title": "37.5.2 Using Exclusive Access or Atomic Operations",
        "content": "For single-byte or single-word variables, access is naturally atomic (on Cortex-M, aligned 32-bit loads/stores are atomic). For larger structures, you need more care.\n\nClarification: A naturally aligned word load/store is indivisible, but increment, check-then-clear and multiword publication are not. Volatile is not a mutual-exclusion or memory-ordering protocol. LDREX/STREX retry loops apply to suitable RAM, not arbitrary Device MMIO."
      },
      {
        "id": "sec-37-5-3",
        "title": "37.5.3 Example: Simple Flag for New Data",
        "content": "In the ISR, set a flag when data is received:\n\nClarification: Masking only the clear is insufficient. Protect checking the flag, copying the byte and clearing the flag as one critical section; process the local copy after restoring the mask. A single-slot mailbox must also define what happens when another byte arrives while full.",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "37.5.3 Example: Simple Flag for New Data — listing 1",
            "code": "ISR:\n    ; read data\n    LDR R2, [DR]\n    ; store data in global variable\n    LDR R0, =rx_byte\n    STRB R2, [R0]\n    ; set flag\n    LDR R0, =rx_flag\n    MOV R1, #1\n    STR R1, [R0]\n    BX LR",
            "explanation": "In the main loop:"
          },
          {
            "language": "arm",
            "title": "37.5.3 Example: Simple Flag for New Data — listing 2",
            "code": "main_loop:\n    LDR R0, =rx_flag\n    LDR R1, [R0]\n    CMP R1, #0\n    BEQ main_loop\n    ; process rx_byte\n    ; clear flag (disable interrupts to avoid race)\n    CPSID I\n    MOV R1, #0\n    STR R1, [R0]\n    CPSIE I\n    ; process...\n    B main_loop",
            "explanation": "The flag is a simple shared variable; reading and writing are atomic, but the pattern of checking then clearing needs care to avoid missing a flag set between check and clear. Disabling interrupts during clear prevents this."
          },
          {
            "language": "arm",
            "title": "Atomic mailbox take in thread mode",
            "code": ".syntax unified\n.cpu cortex-m4\n.thumb\n.text\n.global mailbox_take\n.thumb_func\nmailbox_take:                @ R0=byte, R1=available; one ISR producer\n    mrs r3,PRIMASK\n    cpsid i\n    ldr r2,=rx_flag\n    ldr r1,[r2]\n    movs r0,#0\n    cmp r1,#0\n    beq 1f\n    ldr r0,=rx_byte\n    ldrb r0,[r0]\n    movs r12,#0\n    str r12,[r2]\n1:\n    msr PRIMASK,r3\n    bx lr\n.global mailbox_publish\n.thumb_func\nmailbox_publish:             @ ISR passes byte in R0; full => drop newest\n    ldr r2,=rx_flag\n    ldr r1,[r2]\n    cbnz r1,1f\n    ldr r1,=rx_byte\n    strb r0,[r1]\n    dmb\n    movs r1,#1\n    str r1,[r2]\n1:\n    bx lr\n.bss\n.balign 4\nrx_flag: .space 4\nrx_byte: .space 4",
            "explanation": "Call mailbox_publish from an ISR that preserves EXC_RETURN around BL. Process the local byte after mailbox_take returns. This is a separate single-slot alternative to the ring, with explicit drop-newest behavior."
          }
        ]
      },
      {
        "id": "sec-37-6",
        "title": "37.6 Real-Time Constraints",
        "content": "Real-time systems have deadlines: tasks must complete within a certain time. Interrupt latency is the time from an interrupt request to the start of the ISR. It includes:\n\n- Hardware synchronization (up to a few cycles)\n- Stacking (8 registers: 12 cycles on Cortex-M3/M4)\n- Vector fetch (deterministic)\n\nTypical interrupt latency for Cortex-M4 is 12–15 cycles, very good.\n\nFactors affecting real-time performance:\n- Long ISRs delay lower-priority interrupts.\n- Disabling interrupts for extended periods.\n- Frequent interrupts can overload the CPU, causing missed deadlines.\n- Priority inversion: a low-priority task holds a resource needed by a high-priority task, blocking it; can be mitigated with priority inheritance.\n\nTo meet deadlines:\n- Keep ISRs short.\n- Use priorities to ensure critical tasks preempt less important ones.\n- Avoid busy-waits in ISRs.\n- Design the system to handle worst-case interrupt load.\n\nClarification: Twelve-cycle entry and six-cycle tail-chaining are ideal core figures with suitable memory conditions. Vector fetch and stacking can wait; derive a worst-case response bound including masking, higher-priority load and bus/flash delays. Priority inheritance is an RTOS resource protocol, not a remedy for blocking inside an ISR. For debugging, count entries/drops, inspect NVIC pending/active state and peripheral enables, and measure a spare GPIO with a logic analyzer. CFSR/HFSR identify faults; trust BFAR/MMFAR only with their validity bits set. Fault LEDs need configured clocks/pins and cannot be assumed safe during every fault."
      },
      {
        "id": "sec-37-7",
        "title": "37.7 Practical Example: Interrupt-Driven UART Echo",
        "content": "We'll modify the UART echo from Chapter 36 to use interrupts. The main loop will be free to do other work (e.g., blink an LED) while bytes are received and echoed in the background.\n\nProgram structure:\n- Initialize UART with RXNE interrupt enabled.\n- In ISR: read byte, echo it back (transmit), clear flag.\n- Main loop: toggle an LED or just idle.\n\nAssembly code (simplified):\n\nClarification: The completed companion retains the existing ebook’s ring-buffer design and adds full detection, dropped/error counters and a consumer that drains without sleeping on queued work. The 128-byte storage holds 127 unread bytes because one slot distinguishes full from empty. It cannot guarantee no loss under unlimited load. Only the ISR writes head; only main writes tail. The original WFI-before-drain pattern could leave queued bytes waiting, and masking around TX polling delayed reception. The companion avoids both. It assumes reset clocks (PCLK1 and TIM2=16 MHz), PRIGROUP=0, USART2 PA2/PA3 at 9600 8N1 and PD12 exclusively owned by TIM2.",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "Original interrupt echo specimen — incomplete vectors and blocking ISR",
            "code": "; uart_echo_int.s\n.syntax unified\n.cpu cortex-m4\n.thumb\n\n.equ RCC_AHB1ENR, 0x40023830\n.equ RCC_APB1ENR, 0x40023840\n.equ GPIOA_BASE,  0x40020000\n.equ USART2_BASE, 0x40004400\n.equ USART2_SR,   0x40004400\n.equ USART2_DR,   0x40004404\n.equ USART2_BRR,  0x40004408\n.equ USART2_CR1,  0x4000440C\n.equ NVIC_ISER1,  0xE000E104\n.equ USART2_IRQ_NUM, 38\n\n.section .isr_vector, \"a\"\n.word _estack\n.word Reset_Handler\n; ... other vectors ...\n.word USART2_IRQHandler  ; at position 16+38? Need correct placement.\n\n.section .text\n.thumb_func\n.global Reset_Handler\nReset_Handler:\n    ; Enable clocks (GPIOA, USART2)\n    LDR R0, =RCC_AHB1ENR\n    LDR R1, [R0]\n    ORR R1, R1, #1\n    STR R1, [R0]\n    LDR R0, =RCC_APB1ENR\n    LDR R1, [R0]\n    ORR R1, R1, #(1<<17)\n    STR R1, [R0]\n\n    ; Configure PA2/PA3 alternate function (as before)\n    ; ...\n\n    ; Configure USART2: baud, enable TX/RX, enable RXNE interrupt\n    LDR R0, =USART2_CR1\n    LDR R1, [R0]\n    ORR R1, R1, #(1<<3)  ; TE\n    ORR R1, R1, #(1<<2)  ; RE\n    ORR R1, R1, #(1<<13) ; UE\n    ORR R1, R1, #(1<<5)  ; RXNEIE\n    STR R1, [R0]\n\n    ; Enable USART2 interrupt in NVIC\n    LDR R0, =NVIC_ISER1\n    MOV R1, #(1 << (USART2_IRQ_NUM - 32))  ; bit 6\n    STR R1, [R0]\n\n    ; Enable interrupts globally\n    CPSIE I\n\nmain_loop:\n    ; Do nothing, or toggle LED, etc.\n    B main_loop\n\n.thumb_func\n.global USART2_IRQHandler\nUSART2_IRQHandler:\n    ; Check RXNE\n    LDR R0, =USART2_SR\n    LDR R1, [R0]\n    TST R1, #(1<<5)\n    BEQ .exit\n\n    ; Read byte (clears RXNE)\n    LDR R0, =USART2_DR\n    LDR R2, [R0]\n\n    ; Echo: wait for TXE then send\n    ; Could also use TXE interrupt; we'll poll briefly.\n    LDR R0, =USART2_SR\n.wait_tx:\n    LDR R1, [R0]\n    TST R1, #(1<<7)\n    BEQ .wait_tx\n    LDR R0, =USART2_DR\n    STR R2, [R0]\n\n.exit:\n    BX LR\n\n.section .bss\n.align 3\n_estack: .space 0x400",
            "explanation": "This program handles reception in the background. The main loop could perform other tasks."
          },
          {
            "language": "arm",
            "title": "Complete interrupt program: interrupts.s",
            "code": "/* blink.s: STM32F407VG Discovery, PD12 LED, Cortex-M4 Thumb. */\n.syntax unified\n.cpu cortex-m4\n.thumb\n.ifndef LED_PIN\n.equ LED_PIN,12\n.endif\n.equ RCC_AHB1ENR,0x40023830\n.equ GPIOD_MODER,0x40020c00\n.equ GPIOD_OTYPER,0x40020c04\n.equ GPIOD_OSPEEDR,0x40020c08\n.equ GPIOD_PUPDR,0x40020c0c\n.equ GPIOD_BSRR,0x40020c18\n.section .isr_vector,\"a\",%progbits\n.global vectors\nvectors:\n    .word _estack,Reset_Handler\n    .word Default_Handler,Default_Handler,Default_Handler\n    .word Default_Handler,Default_Handler\n    .word 0,0,0,0\n    .word Default_Handler,Default_Handler,0\n    .word Default_Handler,Default_Handler\n    .rept 28\n    .word Default_Handler\n    .endr\n    .word TIM2_IRQHandler\n    .rept 9\n    .word Default_Handler\n    .endr\n    .word USART2_IRQHandler\n    .rept 43\n    .word Default_Handler\n    .endr\n.section .text.Reset_Handler,\"ax\",%progbits\n.global Reset_Handler\n.type Reset_Handler,%function\n.thumb_func\nReset_Handler:\n    ldr r0,=0xe000ed08      @ VTOR: use the linked vector-table address\n    ldr r1,=vectors\n    str r1,[r0]\n    dsb\n    isb\n    ldr r0,=_sdata\n    ldr r1,=_edata\n    ldr r2,=_sidata\n1:\n    cmp r0,r1\n    bhs 2f\n    ldr r3,[r2],#4\n    str r3,[r0],#4\n    b 1b\n2:\n    ldr r0,=_sbss\n    ldr r1,=_ebss\n    movs r2,#0\n3:\n    cmp r0,r1\n    bhs 4f\n    str r2,[r0],#4\n    b 3b\n4:\n    bl main\n    b .\n.size Reset_Handler,.-Reset_Handler\n\n.section .text,\"ax\",%progbits\n.thumb_func\nDefault_Handler:\n    b .\n.global main\n.thumb_func\nmain:\n    cpsid i\n    bl uart_init\n    @ GPIOD clock; PD12 push-pull output, initially low.\n    ldr r0,=0x40023830\n    ldr r1,[r0]\n    orr r1,r1,#8\n    str r1,[r0]\n    ldr r1,[r0]\n    ldr r0,=0x40020c00\n    ldr r1,[r0]\n    bic r1,r1,#(3<<24)\n    orr r1,r1,#(1<<24)\n    str r1,[r0]\n    ldr r1,[r0,#4]\n    bic r1,r1,#(1<<12)\n    str r1,[r0,#4]\n    ldr r1,[r0,#8]\n    bic r1,r1,#(3<<24)\n    str r1,[r0,#8]\n    ldr r1,[r0,#12]\n    bic r1,r1,#(3<<24)\n    str r1,[r0,#12]\n    mov r1,#(1<<28)\n    str r1,[r0,#24]\n    @ Exclusive TIM2 ownership, 16 MHz timer input, update every 1 ms.\n    ldr r0,=0x40023840\n    ldr r1,[r0]\n    orr r1,r1,#1\n    str r1,[r0]\n    ldr r1,[r0]\n    ldr r0,=0x40000000\n    movs r1,#0\n    str r1,[r0]\n    str r1,[r0,#4]\n    str r1,[r0,#8]\n    str r1,[r0,#12]\n    movs r1,#15\n    str r1,[r0,#40]\n    movw r1,#999\n    str r1,[r0,#44]\n    movs r1,#1\n    str r1,[r0,#20]       @ EGR.UG loads the prescaler\n    movs r1,#0\n    str r1,[r0,#16]       @ Clear initialization flags\n    movs r1,#1\n    str r1,[r0,#12]       @ DIER.UIE\n    str r1,[r0]           @ CR1.CEN\n    @ Reset PRIGROUP=0 assumed: four implemented preemption bits.\n    ldr r0,=0xe000e426\n    movs r1,#0x40\n    strb r1,[r0]          @ USART2 priority 4\n    ldr r0,=0xe000e41c\n    movs r1,#0x80\n    strb r1,[r0]          @ TIM2 priority 8\n    ldr r0,=0x40004400\n    ldr r1,[r0]           @ SR then DR clears stale receive/error state\n    ldr r1,[r0,#4]\n    ldr r1,[r0,#12]\n    orr r1,r1,#0x20\n    str r1,[r0,#12]       @ RXNEIE\n    ldr r0,=0xe000e280\n    mov r1,#(1<<28)\n    str r1,[r0]\n    movs r1,#64\n    str r1,[r0,#4]\n    ldr r0,=0xe000e100\n    mov r1,#(1<<28)\n    str r1,[r0]\n    movs r1,#64\n    str r1,[r0,#4]\n    cpsie i\n1:\n    bl ring_get\n    cmp r1,#0\n    beq 1b\n    bl uart_putc         @ Blocking TX only in thread mode; IRQs stay enabled\n    b 1b\n\n.global USART2_IRQHandler\n.thumb_func\nUSART2_IRQHandler:\n    push {r4-r6,lr}\n    ldr r0,=0x40004400\n    ldr r1,[r0]\n    tst r1,#0x2f\n    beq 4f\n    ldr r2,[r0,#4]       @ SR/DR sequence acknowledges RX and errors\n    tst r1,#0x0f\n    bne 3f\n    ldr r0,=rx_head\n    ldr r3,[r0]\n    adds r4,r3,#1\n    and r4,r4,#127\n    ldr r5,=rx_tail\n    ldr r5,[r5]\n    cmp r4,r5\n    beq 2f\n    dmb\n    ldr r6,=rx_buffer\n    strb r2,[r6,r3]\n    dmb\n    str r4,[r0]          @ Publish head only after data\n    b 4f\n2:\n    ldr r0,=rx_dropped   @ Full: drop newest, never overwrite unread byte\n    b 5f\n3:\n    ldr r0,=rx_errors\n5:\n    ldr r1,[r0]\n    adds r1,#1\n    str r1,[r0]\n4:\n    pop {r4-r6,pc}       @ Restores saved EXC_RETURN\n\n.global ring_get\n.thumb_func\nring_get:               @ R0=byte, R1=1; empty R1=0\n    ldr r2,=rx_tail\n    ldr r3,[r2]\n    ldr r0,=rx_head\n    ldr r0,[r0]\n    movs r1,#0\n    cmp r3,r0\n    beq 1f\n    dmb\n    ldr r0,=rx_buffer\n    ldrb r0,[r0,r3]\n    adds r3,#1\n    and r3,r3,#127\n    dmb\n    str r3,[r2]\n    movs r1,#1\n1:\n    bx lr\n\n.global TIM2_IRQHandler\n.thumb_func\nTIM2_IRQHandler:\n    ldr r0,=0x40000010\n    ldr r1,[r0]\n    tst r1,#1\n    beq 1f\n    movs r1,#0\n    str r1,[r0]          @ This driver owns all TIM2 flags\n    ldr r0,=led_state\n    ldr r1,[r0]\n    eor r1,r1,#1\n    str r1,[r0]\n    cmp r1,#0\n    ite ne\n    movne r1,#(1<<12)\n    moveq r1,#(1<<28)\n    ldr r0,=0x40020c18\n    str r1,[r0]          @ Only PD12 changed via BSRR\n1:\n    bx lr\n.ltorg\n.section .bss,\"aw\",%nobits\n.balign 4\nrx_head: .space 4\nrx_tail: .space 4\nrx_dropped: .space 4\nrx_errors: .space 4\nled_state: .space 4\nrx_buffer: .space 128",
            "explanation": "Link with peripherals.s from Chapter 36 and stm32f4.ld from Chapter 35. TIM2 toggles PD12 every millisecond (500 Hz full waveform), too fast for visible blinking; use a scope or divide the event rate for visible output. UART priority 0x40 can preempt timer priority 0x80. ISR work is bounded; transmit waits only in thread mode. Hardware timing still requires a board."
          },
          {
            "language": "bash",
            "title": "Build and inspect IRQ vectors",
            "code": "arm-none-eabi-as -mcpu=cortex-m4 -mthumb -g interrupts.s -o interrupts.o\narm-none-eabi-as -mcpu=cortex-m4 -mthumb -g peripherals.s -o peripherals.o\narm-none-eabi-ld -T stm32f4.ld interrupts.o peripherals.o -o interrupts.elf\narm-none-eabi-objdump -s -j .isr_vector interrupts.elf\narm-none-eabi-nm -n interrupts.elf",
            "explanation": "Check vector offsets 0xB0 and 0xD8 against Thumb handler addresses. Verify stack/RAM placement before board execution."
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-37-1",
        "title": "Exercise 37.1: Understand Exception Entry",
        "description": "List the registers automatically stacked by the hardware when an interrupt occurs on Cortex-M. Which registers are not stacked, and what must an ISR do if it wants to use them?",
        "solution": "Hardware stacks: R0, R1, R2, R3, R12, LR (return address), PC, xPSR. Not stacked: R4–R11. If an ISR uses R4–R11, it must save them on the stack (push/pop) because the interrupted code expects those to be preserved.\nHandler LR contains EXC_RETURN and must be saved before calls, even though the interrupted LR was hardware-stacked.",
        "solutionLanguage": "text"
      },
      {
        "id": "ex-37-2",
        "title": "Exercise 37.2: Timer Interrupt",
        "description": "Using TIM2, configure it to generate an update interrupt every 1 ms. Write an ISR that toggles an LED (PD12) each interrupt. Show the NVIC enable and timer configuration.",
        "solution": "Timer interrupt enable:\n- Enable TIM2 clock (APB1).\n- Configure PSC and ARR for 1 ms.\n- Enable update interrupt in TIM2 DIER (bit 0).\n- Enable TIM2 IRQ in NVIC (IRQ28 for TIM2).\n- Write TIM2_IRQHandler to toggle PD12 and clear UIF.\n- In NVIC, set priority and enable.\n\nComplete configuration and ISR are in interrupts.s above: PSC=15, ARR=999, DIER.UIE=1, NVIC ISER0 bit28, priority byte 0xE000E41C. The source checklist is implemented in main and TIM2_IRQHandler.",
        "solutionLanguage": "text"
      },
      {
        "id": "ex-37-3",
        "title": "Exercise 37.3: Shared Flag Race",
        "description": "Consider a main loop that checks a flag set by an ISR. Write code for both main loop and ISR, and identify a potential race condition. Show how to fix it using interrupt disable/enable.",
        "solution": "Race: Main loop reads flag, sees 0. Before it clears, ISR sets flag and stores data. Main loop then clears flag without processing data, data lost. Fix: disable interrupts before checking and clearing.\n\nMore precise race: the main loop sees a set flag, an ISR publishes a newer byte, then main clears the flag and loses that publication. The entire check/copy/clear sequence must be protected.",
        "solutionLanguage": "text"
      },
      {
        "id": "ex-37-4",
        "title": "Exercise 37.4: Priority Levels",
        "description": "Explain how to set a higher priority for a UART interrupt over a timer interrupt. Which NVIC register is used? What is the effect of lowering the numeric priority value?",
        "solution": "NVIC_IPR registers assign priority. Each byte holds priority for 4 interrupts (8-bit each, but only upper bits implemented). To give UART higher priority, write a lower value to the corresponding byte. Lower numeric = higher priority.\n\nCorrection: each BYTE holds ONE interrupt priority; each 32-bit word holds four priority bytes. USART2 byte=0xE000E426, TIM2 byte=0xE000E41C. With reset grouping on STM32F407, 0x40 preempts 0x80.",
        "solutionLanguage": "text"
      },
      {
        "id": "ex-37-5",
        "title": "Exercise 37.5: Tail-Chaining",
        "description": "What is tail-chaining in Cortex-M? How does it improve interrupt performance? Give an example scenario.",
        "solution": "Tail-chaining: If a higher-priority interrupt becomes pending while a lower-priority ISR is finishing (after it has restored state), the hardware skips the restore and immediately enters the next ISR. This saves cycles, reducing latency between back-to-back interrupts. Example: A timer interrupt and UART interrupt occur nearly simultaneously; the second is tail-chained after the first.\n\nCorrection: tail-chaining skips restoration BEFORE it happens. A pending eligible timer may run after a higher-priority UART when the return target is thread mode; it need not preempt the finishing handler.",
        "solutionLanguage": "text"
      }
    ],
    "practiceQuestions": [
      {
        "question": "What is an interrupt? How does it improve system performance compared to polling?",
        "answer": "An interrupt requests an exception handler when an event occurs, allowing useful work between events. It adds entry and synchronization overhead; polling may be appropriate for short bounded waits or high event rates."
      },
      {
        "question": "Describe the steps that occur when an interrupt is accepted on Cortex-M, from hardware request to ISR execution.",
        "answer": "The peripheral asserts a request; NVIC arbitration and masks decide eligibility. The core stacks R0–R3, R12, LR, PC and xPSR, fetches the vector, sets handler LR to EXC_RETURN and enters Handler mode. Additional alignment and floating-point state may be involved."
      },
      {
        "question": "What is the role of the NVIC? Name two registers used to enable and set priority.",
        "answer": "NVIC controls enable, pending, active and priority state. ISER enables external IRQs; IPR priority bytes assign urgency. USART2 IRQ38 uses ISER1 bit6 and priority byte at 0xE000E426."
      },
      {
        "question": "How do you enable a specific peripheral interrupt? List the required actions.",
        "answer": "Install the correct vector and initialize clocks, pins, buffers and the peripheral. Clear stale peripheral/NVIC status, set priority, enable the peripheral source and NVIC line, then deliberately unmask. Priority defaults to zero, the highest configurable urgency."
      },
      {
        "question": "What is interrupt latency? What factors contribute to it on Cortex-M?",
        "answer": "Latency runs from request to the first handler instruction. Masking, current instructions, higher-priority handlers, memory wait states, bus contention and stacking affect it. Twelve cycles is an ideal Cortex-M4 entry figure, not an application worst-case bound."
      },
      {
        "question": "Why must interrupt service routines be short? What are the consequences of long ISRs?",
        "answer": "Long ISRs delay lower-priority work and thread execution, consume stack when nested and may miss deadlines. A short handler acknowledges hardware and publishes bounded work to a queue."
      },
      {
        "question": "Explain a race condition between an ISR and the main loop. How can you prevent it?",
        "answer": "An ISR can publish data between the main loop checking a flag and clearing it. Protect check, copy and clear together, restoring the old mask. Alternatively use a correctly synchronized single-producer/single-consumer queue."
      },
      {
        "question": "What is priority inversion? How can it affect real-time performance?",
        "answer": "A high-priority task can wait for a resource held by a lower-priority task that is itself delayed by medium-priority work. Priority inheritance or a suitable ceiling protocol bounds this in an RTOS. An ISR must not spin waiting for a task it has preempted."
      },
      {
        "question": "What is tail-chaining? How does it improve interrupt handling?",
        "answer": "Tail-chaining reuses the stacked context when another eligible exception is pending at return, avoiding an unstack/restack pair. The next handler need not be higher-priority than the finishing handler when returning to thread mode."
      },
      {
        "question": "In the UART echo ISR example, why is it acceptable to poll TXE inside the ISR? When would this be a bad idea?",
        "answer": "The premise needs a limit: polling TXE inside an ISR is acceptable only with a proven short bound that fits all deadlines. A stalled peripheral or slow serial frame breaks that assumption. The completed example queues RX and transmits in thread mode."
      }
    ],
    "summary": [
      "Interrupts free the CPU from polling and enable real-time responsiveness.",
      "Cortex-M has a vector table, NVIC for enable/priority, and automatic register stacking.",
      "ISRs must be fast; defer heavy processing to main loop.",
      "Shared data between ISR and main loop requires careful synchronization.",
      "Real-time constraints demand low interrupt latency and deterministic behavior.",
      "Proper priority assignment and short ISRs are key to meeting deadlines."
    ]
  },
  {
    "id": 38,
    "slug": "chapter-38-low-power-bare-metal",
    "level": 7,
    "levelTitle": "Embedded Systems and Real-Time Assembly",
    "title": "Chapter 38: Low-Power and Bare-Metal Programming",
    "subtitle": "WFI/WFE Instructions, Sleep Modes, Duty Cycling, and SLEEPONEXIT",
    "learningObjectives": [
      "Understand the importance of low-power design in embedded systems.",
      "Master the low-power modes available on ARM Cortex-M microcontrollers: Sleep, Deep Sleep, and Standby.",
      "Use the WFI and WFE instructions to enter low-power states and wake on interrupts or events.",
      "Configure clock gating and prescalers to reduce dynamic power consumption.",
      "Disable unused peripherals and unused GPIO pins to minimize leakage.",
      "Apply bare-metal programming techniques to write energy-efficient assembly code.",
      "Design an interrupt-driven low-power application that wakes from sleep to perform tasks and returns to sleep.",
      "Understand the trade-offs between power consumption, wake-up latency, and performance."
    ],
    "prerequisites": [
      "Solid understanding of ARM Cortex-M architecture, registers, and instruction set (Chapter 35).",
      "Familiarity with memory-mapped I/O and peripheral control (Chapter 36).",
      "Knowledge of interrupts and the NVIC (Chapter 37).",
      "Basic understanding of digital electronics: clock signals, power consumption sources.",
      "Experience with assembly programming and bare-metal development."
    ],
    "keyConcepts": [
      "Low-power design: Techniques to minimize energy consumption while meeting functional requirements.",
      "Dynamic power: Power consumed during switching (proportional to frequency and voltage squared).",
      "Static power: Power consumed due to leakage currents (even when idle).",
      "Sleep modes: Hardware states that reduce power by stopping the CPU clock or disabling parts of the chip.",
      "WFI (Wait For Interrupt): Instruction that halts the CPU until an interrupt or reset; commonly used to enter sleep.",
      "WFE (Wait For Event): Similar, but wakes on events (including interrupts and SEV instruction).",
      "Clock gating: Disabling clock to unused peripherals to save power.",
      "Power scaling: Reducing supply voltage or clock frequency to lower power consumption.",
      "Wake-up sources: Interrupts, external pins, RTC alarm, etc., that bring the MCU out of sleep.",
      "Bare-metal programming: Writing software that runs directly on hardware without an OS, giving full control over power management.",
      "Startup code: Initialization routines that configure clocks and memory before main.",
      "Linker script: Defines memory layout for code and data."
    ],
    "diagramType": "low_power",
    "sections": [
      {
        "id": "sec-38-1",
        "title": "38.1 Why Low-Power Matters",
        "content": "Many embedded devices are battery-powered and must operate for months or years without replacing batteries. Examples include IoT sensors, wearables, remote monitoring devices, and medical implants. Even mains-powered devices benefit from low-power design to reduce heat and improve reliability.\n\nPower consumption in CMOS circuits has two main components:\n\n- Dynamic power: \\( P_{dynamic} \\propto C \\cdot V^2 \\cdot f \\), where \\( C \\) is capacitance, \\( V \\) is voltage, and \\( f \\) is switching frequency. Lowering voltage or frequency dramatically reduces dynamic power.\n- Static power: Leakage current that flows even when transistors are not switching. It increases with temperature and lower threshold voltages.\n\nLow-power techniques aim to reduce both by:\n- Slowing or stopping the clock when idle.\n- Disabling unused peripherals and clocks.\n- Using low-power sleep modes.\n- Reducing supply voltage where possible.\n\nOn microcontrollers, the CPU itself is often not the main power consumer; peripherals and clocks can dominate. Thus, intelligent clock management is critical.\n\nClarification: Power budgeting retained from the existing expansion: ideal battery hours = usable mAh / average mA. A hypothetical 220 mAh at 12 microamps gives about 18,333 hours (2.09 years), not five years; at 1 microamp the ideal 25-year figure ignores self-discharge and calendar aging. Include regulator quiescent current, LEDs, sensors, radio peaks, temperature and usable capacity. These are arithmetic examples, not battery-life guarantees."
      },
      {
        "id": "sec-38-2",
        "title": "38.2 Low-Power Modes on ARM Cortex-M",
        "content": "ARM Cortex-M processors provide several low-power modes, typically controlled by the System Control Register (SCR) and the WFI/WFE instructions. The two main modes are:\n\n- Sleep mode: CPU stops, but peripherals and clocks continue. Wake-up is fast.\n- Deep Sleep mode: More aggressive; typically disables high-speed clocks and may power down flash, SRAM, or other domains. Wake-up takes longer but saves more power.\n\nSome MCUs add further modes like Stop or Standby (e.g., STM32F4), which are vendor-specific extensions of Deep Sleep."
      },
      {
        "id": "sec-38-2-1",
        "title": "38.2.1 Entering Sleep Mode",
        "content": "The simplest way to enter sleep is to execute WFI (Wait For Interrupt). The CPU halts fetching instructions until an interrupt is pending and enabled. In assembly:\n\nClarification: WFI wake-up and exception service are separate. On Cortex-M4 a qualifying interrupt masked by PRIMASK can wake WFI while handler execution remains deferred. WFE consumes an already-set event register without sleeping; SEVONPEND signals a transition into pending, not an endlessly repeated event. Recheck the work condition after waking. Neither instruction itself disables floating-point context saving. Reference: https://arm-software.github.io/CMSIS_5/Core/html/group__intrinsic__CPU__gr.html",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "38.2.1 Entering Sleep Mode — listing 1",
            "code": "WFI",
            "explanation": "This is often placed in an idle loop:"
          },
          {
            "language": "arm",
            "title": "38.2.1 Entering Sleep Mode — listing 2",
            "code": "idle_loop:\n    WFI\n    B idle_loop",
            "explanation": "When an interrupt occurs, the CPU wakes, handles the interrupt, and then returns to the instruction after WFI (which branches back to WFI). If interrupts are disabled, WFI may still wake on events (depending on configuration).\n\nWFE (Wait For Event) is similar but can also wake on events like a peripheral setting an event flag or an SEV instruction from another core. It is useful for multiprocessor synchronization."
          }
        ]
      },
      {
        "id": "sec-38-2-2",
        "title": "38.2.2 Configuring Sleep Mode (SCR Register)",
        "content": "The System Control Register (SCR) at address 0xE000ED10 controls sleep behavior. Key bits:\n\n- SLEEPONEXIT (bit 1): If set, the CPU automatically enters sleep when returning from an interrupt to thread mode if no other interrupt is pending. This is useful for interrupt-driven systems: the main loop can be empty, and the CPU sleeps between interrupts.\n- SLEEPDEEP (bit 2): If set, WFI/WFE enters Deep Sleep mode. Otherwise, normal Sleep mode.\n- SEVONPEND (bit 4): If set, an interrupt pending wakes the CPU even if interrupts are disabled (for WFE).\n\nExample: Set SLEEPONEXIT so the CPU sleeps after each interrupt:\n\nClarification: Correct bit positions are SLEEPONEXIT=1 and SLEEPDEEP=2; the earlier ebook mode table swapped them. SLEEPONEXIT fits ISR-only work, not the thread-mode UART consumer in Chapter 37. Wake latency and current require device/board measurements, not generic microsecond or microamp guarantees.",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "38.2.2 Configuring Sleep Mode (SCR Register) — listing 1",
            "code": "LDR R0, =0xE000ED10   ; SCR\nLDR R1, [R0]\nORR R1, R1, #(1<<1)   ; SLEEPONEXIT\nSTR R1, [R0]",
            "explanation": "Then, after initialization, execute WFI once, and the CPU will sleep and only wake to handle interrupts."
          }
        ]
      },
      {
        "id": "sec-38-2-3",
        "title": "38.2.3 Deep Sleep Mode (Stop/Standby)",
        "content": "To enter Deep Sleep, set SLEEPDEEP bit in SCR before WFI. Additionally, the power management registers (vendor-specific) must be configured to select the desired low-power state. For STM32F4, the PWR_CR register controls voltage scaling and low-power mode selection.\n\nExample to enter Stop mode (a deep sleep mode) on STM32F4:\n\nClarification: On STM32F407 Stop resumes after WFI with HSI selected as system clock; software must restore a former PLL clock tree, not rely on Reset_Handler running. Standby wake follows a reset path and main SRAM is lost. Configure PWREN, wake source and flags before SLEEPDEEP, issue DSB, and clear SLEEPDEEP after Stop. PWR_CR.PDDS=0 selects Stop, LPDS selects regulator behavior. Source: https://www.st.com/resource/zh/reference_manual/DM00031020.pdf",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "Enable power clock and configure PWR",
            "code": "; Enable power clock and configure PWR\n; (simplified, actual registers depend on chip)\n\n; Set SLEEPDEEP in SCR\nLDR R0, =0xE000ED10\nLDR R1, [R0]\nORR R1, R1, #(1<<2)\nSTR R1, [R0]\n\n; Select Stop mode in PWR_CR (bits 0-1 = 01)\nLDR R0, =PWR_CR\nLDR R1, [R0]\nBIC R1, R1, #3\nORR R1, R1, #1\nSTR R1, [R0]\n\n; Execute WFI to enter Stop mode\nWFI",
            "explanation": "Upon wake-up (via interrupt or reset), the CPU resumes execution after WFI.\n\nNote: In deep sleep modes, many clocks stop, and some peripherals may be powered down. The wake-up source must be configured (e.g., an external interrupt on a GPIO, RTC alarm) and its clock must remain active."
          }
        ]
      },
      {
        "id": "sec-38-3",
        "title": "38.3 Clock Management and Power Reduction",
        "content": "Clocks drive the CPU and peripherals. Reducing clock frequency or disabling unused clocks significantly lowers dynamic power."
      },
      {
        "id": "sec-38-3-1",
        "title": "38.3.1 Prescaling the System Clock",
        "content": "Many MCUs allow the system clock to be divided. Lowering the clock frequency reduces power but also performance. Choose the minimum frequency that meets deadlines.\n\nOn STM32F4, the system clock is typically 168 MHz but can be divided using the prescaler in RCC_CFGR. For example, to divide by 2, set HPRE bits. The exact bits depend on the chip; refer to the reference manual.\n\nClarification: STM32F407 resets on 16 MHz HSI; 168 MHz is a configured operating point, not the reset clock. HPRE divides HCLK, affecting derived buses and timer rates. Respect voltage scale and flash wait-state limits when changing clocks."
      },
      {
        "id": "sec-38-3-2",
        "title": "38.3.2 Clock Gating Peripherals",
        "content": "Each peripheral clock can be independently enabled/disabled via the RCC registers (e.g., RCC_AHB1ENR, RCC_APB1ENR, RCC_APB2ENR). Disabling the clock to an unused peripheral stops its switching activity.\n\nExample: Disable GPIOB clock (if not used) by clearing bit 1 in RCC_AHB1ENR.\n\nClarification: The shown bit1 is GPIOB; GPIOD is bit3. ADC1–3 are on APB2 for STM32F407, not AHB2. Many peripheral clocks reset disabled. Check RCC low-power enable registers as well as run-mode enables; do not indiscriminately clear all clock registers.",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "38.3.2 Clock Gating Peripherals — listing 1",
            "code": "LDR R0, =0x40023830   ; RCC_AHB1ENR\nLDR R1, [R0]\nBIC R1, R1, #(1<<1)   ; clear GPIOD? Actually GPIOD is bit 3; adjust.\nSTR R1, [R0]",
            "explanation": "Ensure you don't disable a clock needed by your code or by wake-up logic."
          }
        ]
      },
      {
        "id": "sec-38-3-3",
        "title": "38.3.3 Voltage Scaling",
        "content": "Some MCUs support multiple voltage ranges (e.g., high-performance, low-power). Lowering voltage reduces power but limits maximum frequency. On STM32F4, the PWR_CR register has a VOS field to select voltage scale. Always check the datasheet for allowed frequency ranges.\n\nClarification: Voltage-scale options differ among STM32F4 parts; do not assume the three scales of another family apply to F407. Lower voltage only after lowering frequency as required, and raise voltage/flash latency before increasing frequency. Fixed percentage power savings are not portable."
      },
      {
        "id": "sec-38-4",
        "title": "38.4 GPIO and Peripheral Power Optimization",
        "content": "Even when not used, GPIO pins can consume power if left floating (inputs with no defined level). To minimize leakage:\n\n- Set unused pins as analog (mode 11) or as inputs with pull-up/pull-down.\n- Disable Schmitt trigger for analog pins.\n- Configure as output low if external circuit allows.\n\nFor peripherals, disable them in their control registers and gate their clocks.\n\nClarification: On the Discovery board PA13/PA14 are SWD pins: preserve them for debugging. Do not drive connected pins low without checking the schematic, or configure an oscillator/wake pin as an unused analog input. Turn off external loads and peripheral functions before gating clocks."
      },
      {
        "id": "sec-38-5",
        "title": "38.5 Low-Power Programming Techniques",
        "content": ""
      },
      {
        "id": "sec-38-5-1",
        "title": "38.5.1 Duty Cycling",
        "content": "Duty cycling involves waking up periodically, doing work quickly, then going back to sleep. The average power consumption is low if the active time is small relative to sleep time. For example, a sensor node might wake every 10 seconds, read a sensor, transmit data, and sleep.\n\nInterrupt-driven design is natural for duty cycling: use a timer to wake the CPU periodically.\n\nClarification: Measurement and optimization retained: use a calibrated shunt/current profiler with adequate bandwidth to integrate active pulses and sleep current over a complete cycle. Ammeter burden voltage and debugger/USB/LED current can distort results. Batching work and DMA may save wake-ups, but DMA and its buses must remain clocked in the chosen mode. Compare energy per completed task before choosing lookup tables, integer arithmetic or loop unrolling; fixed savings percentages are not justified without measurements."
      },
      {
        "id": "sec-38-5-2",
        "title": "38.5.2 Interrupt-Driven Idle Loop with SLEEPONEXIT",
        "content": "By setting SLEEPONEXIT, the CPU automatically sleeps after each interrupt. The main loop can be minimal:",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "38.5.2 Interrupt-Driven Idle Loop with SLEEPONEXIT — listing 1",
            "code": "main_loop:\n    WFI\n    B main_loop",
            "explanation": "Initialization enables interrupts, and after the first WFI, the CPU sleeps. Each interrupt wakes it, the ISR runs, and on return, it sleeps again without executing WFI again. This is energy-efficient and simple."
          }
        ]
      },
      {
        "id": "sec-38-5-3",
        "title": "38.5.3 Using Low-Power Timers",
        "content": "Some MCUs have low-power timers that run even in deep sleep (e.g., LPTIM on STM32). These can wake the CPU after a programmable delay, enabling very low average power.\n\nClarification: STM32F407 has no LPTIM peripheral. TIM2 and SysTick can wake ordinary Sleep with the needed clocks enabled, but do not run through F407 Stop. Use RTC alarm/wakeup or an eligible EXTI source for Stop. USART wake features from other STM32 families are not automatically available here; arbitrary EXTI lines are not universal Standby wake sources."
      },
      {
        "id": "sec-38-6",
        "title": "38.6 Bare-Metal Programming Considerations",
        "content": "Bare-metal programming gives you full control over hardware, which is essential for low-power design. Key aspects:\n\n- Startup code: Initializes stack pointer, copies data, clears BSS, and calls main. It also configures the system clock and power modes before entering main.\n- Linker script: Places code in flash and data in SRAM; ensures interrupt vector table is at the correct location.\n- No OS overhead: No context switching, no system calls, no background tasks; the application is entirely under your control.\n- Direct register access: You write to hardware registers to configure clocks, peripherals, and power modes."
      },
      {
        "id": "sec-38-6-1",
        "title": "38.6.1 Example Startup Code with Clock Configuration",
        "content": "A typical startup file for STM32F4 might:\n\n1. Set the vector table.\n2. Initialize the system clock (e.g., using PLL to 168 MHz or lower for power).\n3. Enable power interface clock (PWR).\n4. Configure voltage scaling.\n5. Enable clocks for used peripherals.\n6. Copy .data, zero .bss.\n7. Call main or enter an infinite loop.\n\nIn assembly, the clock configuration is done by writing to RCC registers. This can be complex; often a C library is used, but for pure assembly, it's doable."
      },
      {
        "id": "sec-38-7",
        "title": "38.7 Practical Example: Low-Power Blinking LED",
        "content": "We'll implement a program that blinks an LED every 500 ms using a timer interrupt and sleep mode. The MCU sleeps between interrupts, waking only to toggle the LED and then return to sleep.\n\nSteps:\n\n1. Configure GPIO PD12 as output for LED.\n2. Configure TIM2 to generate an update interrupt every 500 ms.\n3. Enable TIM2 interrupt in NVIC.\n4. Enable global interrupts.\n5. Set SLEEPONEXIT in SCR so CPU sleeps after each interrupt.\n6. Execute WFI and then an infinite loop.\n\nAssembly code (simplified):\n\nClarification: The original omits CR1.CEN, prescaler update generation and valid vector/stack layout. At 16 MHz, PSC=15999 and ARR=500 gives 501 ms after loading PSC; use ARR=499 for 500 ms. The completed program starts TIM2, clears initialization UIF and uses the full Chapter 35 startup/linker contract. A WFI can return for reasons besides the expected timer, so retain a WFI loop instead of a busy branch fallback.",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "Original low-power blink specimen — incomplete startup and timer setup",
            "code": "; low_power_blink.s\n.syntax unified\n.cpu cortex-m4\n.thumb\n\n.equ RCC_AHB1ENR,   0x40023830\n.equ RCC_APB1ENR,   0x40023840\n.equ GPIO_D_BASE,   0x40020C00\n.equ GPIOD_MODER,   0x40020C00\n.equ GPIOD_ODR,     0x40020C14\n.equ TIM2_BASE,     0x40000000\n.equ TIM2_PSC,      0x40000028\n.equ TIM2_ARR,      0x4000002C\n.equ TIM2_CR1,      0x40000000\n.equ TIM2_DIER,     0x4000000C\n.equ TIM2_SR,       0x40000010\n.equ NVIC_ISER0,    0xE000E100\n.equ SCR,           0xE000ED10\n.equ TIM2_IRQ_NUM,  28\n\n.section .isr_vector, \"a\"\n.word _estack\n.word Reset_Handler\n; ... (other vectors omitted)\n.word TIM2_IRQHandler   ; at appropriate position (16+28 = 44)\n\n.section .text\n.thumb_func\n.global Reset_Handler\nReset_Handler:\n    ; Enable GPIOD and TIM2 clocks\n    LDR R0, =RCC_AHB1ENR\n    LDR R1, [R0]\n    ORR R1, R1, #(1<<3)   ; GPIOD\n    STR R1, [R0]\n    LDR R0, =RCC_APB1ENR\n    LDR R1, [R0]\n    ORR R1, R1, #(1<<0)   ; TIM2\n    STR R1, [R0]\n\n    ; Configure PD12 as output\n    LDR R0, =GPIOD_MODER\n    LDR R1, [R0]\n    BIC R1, R1, #(3<<24)\n    ORR R1, R1, #(1<<24)\n    STR R1, [R0]\n\n    ; Configure TIM2: prescaler 16000, ARR 500 for 500 ms (assuming 16 MHz)\n    LDR R0, =TIM2_PSC\n    MOV R1, #16000-1\n    STR R1, [R0]\n    LDR R0, =TIM2_ARR\n    MOV R1, #500\n    STR R1, [R0]\n\n    ; Enable update interrupt in TIM2\n    LDR R0, =TIM2_DIER\n    LDR R1, [R0]\n    ORR R1, R1, #1        ; UIE\n    STR R1, [R0]\n\n    ; Enable TIM2 interrupt in NVIC\n    LDR R0, =NVIC_ISER0\n    MOV R1, #(1 << TIM2_IRQ_NUM)  ; IRQ28 is bit 28\n    STR R1, [R0]\n\n    ; Set SLEEPONEXIT in SCR\n    LDR R0, =SCR\n    LDR R1, [R0]\n    ORR R1, R1, #(1<<1)\n    STR R1, [R0]\n\n    ; Enable global interrupts\n    CPSIE I\n\n    ; Enter sleep and then loop\n    WFI\nmain_loop:\n    B main_loop\n\n.thumb_func\n.global TIM2_IRQHandler\nTIM2_IRQHandler:\n    ; Toggle PD12\n    LDR R0, =GPIOD_ODR\n    LDR R1, [R0]\n    EOR R1, R1, #(1<<12)\n    STR R1, [R0]\n\n    ; Clear update interrupt flag\n    LDR R0, =TIM2_SR\n    LDR R1, [R0]\n    BIC R1, R1, #1\n    STR R1, [R0]\n\n    BX LR\n\n.section .bss\n.align 3\n_estack: .space 0x400",
            "explanation": "In this code, after WFI, the CPU sleeps. When the timer interrupt fires, it wakes, toggles LED, clears flag, and because SLEEPONEXIT is set, it automatically re-enters sleep after returning from the ISR. The main loop is never reached; the B main_loop is just a safety."
          },
          {
            "language": "arm",
            "title": "Complete low-power blink: sleep_blink.s",
            "code": "/* blink.s: STM32F407VG Discovery, PD12 LED, Cortex-M4 Thumb. */\n.syntax unified\n.cpu cortex-m4\n.thumb\n.ifndef LED_PIN\n.equ LED_PIN,12\n.endif\n.equ RCC_AHB1ENR,0x40023830\n.equ GPIOD_MODER,0x40020c00\n.equ GPIOD_OTYPER,0x40020c04\n.equ GPIOD_OSPEEDR,0x40020c08\n.equ GPIOD_PUPDR,0x40020c0c\n.equ GPIOD_BSRR,0x40020c18\n.section .isr_vector,\"a\",%progbits\n.global vectors\nvectors:\n    .word _estack,Reset_Handler\n    .word Default_Handler,Default_Handler,Default_Handler\n    .word Default_Handler,Default_Handler\n    .word 0,0,0,0\n    .word Default_Handler,Default_Handler,0\n    .word Default_Handler,Default_Handler\n    .rept 28\n    .word Default_Handler\n    .endr\n    .word TIM2_IRQHandler\n    .rept 9\n    .word Default_Handler\n    .endr\n    .word Default_Handler\n    .rept 43\n    .word Default_Handler\n    .endr\n.section .text.Reset_Handler,\"ax\",%progbits\n.global Reset_Handler\n.type Reset_Handler,%function\n.thumb_func\nReset_Handler:\n    ldr r0,=0xe000ed08      @ VTOR: use the linked vector-table address\n    ldr r1,=vectors\n    str r1,[r0]\n    dsb\n    isb\n    ldr r0,=_sdata\n    ldr r1,=_edata\n    ldr r2,=_sidata\n1:\n    cmp r0,r1\n    bhs 2f\n    ldr r3,[r2],#4\n    str r3,[r0],#4\n    b 1b\n2:\n    ldr r0,=_sbss\n    ldr r1,=_ebss\n    movs r2,#0\n3:\n    cmp r0,r1\n    bhs 4f\n    str r2,[r0],#4\n    b 3b\n4:\n    bl main\n    b .\n.size Reset_Handler,.-Reset_Handler\n\n.section .text,\"ax\",%progbits\n.thumb_func\nDefault_Handler:\n    b .\n.global main\n.thumb_func\nmain:\n    cpsid i\n    @ GPIOD clock; PD12 push-pull output, initially low.\n    ldr r0,=0x40023830\n    ldr r1,[r0]\n    orr r1,r1,#8\n    str r1,[r0]\n    ldr r1,[r0]\n    ldr r0,=0x40020c00\n    ldr r1,[r0]\n    bic r1,r1,#(3<<24)\n    orr r1,r1,#(1<<24)\n    str r1,[r0]\n    ldr r1,[r0,#4]\n    bic r1,r1,#(1<<12)\n    str r1,[r0,#4]\n    ldr r1,[r0,#8]\n    bic r1,r1,#(3<<24)\n    str r1,[r0,#8]\n    ldr r1,[r0,#12]\n    bic r1,r1,#(3<<24)\n    str r1,[r0,#12]\n    mov r1,#(1<<28)\n    str r1,[r0,#24]\n    @ Exclusive TIM2 ownership, 16 MHz timer input, update every 500 ms.\n    ldr r0,=0x40023840\n    ldr r1,[r0]\n    orr r1,r1,#1\n    str r1,[r0]\n    ldr r1,[r0]\n    ldr r0,=0x40000000\n    movs r1,#0\n    str r1,[r0]\n    str r1,[r0,#4]\n    str r1,[r0,#8]\n    str r1,[r0,#12]\n    movw r1,#15999\n    str r1,[r0,#40]\n    movw r1,#499\n    str r1,[r0,#44]\n    movs r1,#1\n    str r1,[r0,#20]       @ EGR.UG loads the prescaler\n    movs r1,#0\n    str r1,[r0,#16]       @ Clear initialization flags\n    movs r1,#1\n    str r1,[r0,#12]       @ DIER.UIE\n    str r1,[r0]           @ CR1.CEN\n    ldr r0,=0xe000e41c\n    movs r1,#0x80\n    strb r1,[r0]\n    ldr r0,=0xe000e280\n    mov r1,#(1<<28)\n    str r1,[r0]\n    ldr r0,=0xe000e100\n    str r1,[r0]\n    ldr r0,=0xe000ed10\n    ldr r1,[r0]\n    bic r1,r1,#4         @ Normal Sleep, not Stop: TIM2 must keep running\n    orr r1,r1,#2         @ SLEEPONEXIT; all work handled by TIM2 ISR\n    str r1,[r0]\n    dsb\n    isb\n    cpsie i\n1:\n    dsb\n    wfi\n    b 1b\n\n.global TIM2_IRQHandler\n.thumb_func\nTIM2_IRQHandler:\n    ldr r0,=0x40000010\n    ldr r1,[r0]\n    tst r1,#1\n    beq 1f\n    movs r1,#0\n    str r1,[r0]          @ This driver owns all TIM2 flags\n    ldr r0,=led_state\n    ldr r1,[r0]\n    eor r1,r1,#1\n    str r1,[r0]\n    cmp r1,#0\n    ite ne\n    movne r1,#(1<<12)\n    moveq r1,#(1<<28)\n    ldr r0,=0x40020c18\n    str r1,[r0]          @ Only PD12 changed via BSRR\n1:\n    bx lr\n.ltorg\n.section .bss,\"aw\",%nobits\n.balign 4\nled_state: .space 4",
            "explanation": "STM32F407 reset clocks, ordinary Sleep, timer period 500 ms and one-second full LED cycle. Link using stm32f4.ld from Chapter 35. TIM2 owns PD12 and all its status flags. Board current and wake latency have not been measured."
          },
          {
            "language": "bash",
            "title": "Build the complete sleeping blinker",
            "code": "arm-none-eabi-as -mcpu=cortex-m4 -mthumb sleep_blink.s -o sleep_blink.o\narm-none-eabi-ld -T stm32f4.ld sleep_blink.o -o sleep_blink.elf\narm-none-eabi-objdump -d sleep_blink.elf",
            "explanation": "Inspect CEN, UG and SCR setup and vector44 before testing on the target."
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-38-1",
        "title": "Exercise 38.1: Enter Sleep Mode",
        "description": "Write a simple program that enters Sleep mode using WFI and wakes on an external interrupt (e.g., button press). Explain the role of the SCR and NVIC in this process.",
        "solution": "To enter Sleep mode, just execute WFI with global interrupts enabled. Configure the external interrupt by enabling the GPIO interrupt in the peripheral, enabling the corresponding IRQ in NVIC, and setting the priority. Before WFI, clear any pending interrupts. The CPU halts until the interrupt occurs, then wakes and executes the ISR. No special SCR bit needed for normal Sleep; SLEEPDEEP must be 0 (default).\n\nFor STM32F407 PA0 button input: enable GPIOA and SYSCFG clocks; set PA0 input/pull according to the schematic; map SYSCFG_EXTICR1 EXTI0 to port A, select rising edge in EXTI_RTSR, clear EXTI_PR bit0 with a write-one, unmask EXTI_IMR bit0, install EXTI0_IRQHandler at vector22, set priority and ISER0 bit6. In the handler acknowledge PR bit0. Clear SLEEPDEEP; DSB/WFI in a loop. Clear stale flags during initialization, never discard newly arrived work immediately before every sleep. Mechanical switches may need debounce.",
        "solutionLanguage": "text"
      },
      {
        "id": "ex-38-2",
        "title": "Exercise 38.2: Clock Gating",
        "description": "Given an STM32F4, write assembly code to disable the clock for GPIOA and USART2 if they are unused. Identify the registers and bits.",
        "solution": "LDR R0, =0x40023830   ; AHB1ENR\nLDR R1, [R0]\nBIC R1, R1, #1        ; clear GPIOA clock\nSTR R1, [R0]\n\nLDR R0, =0x40023840   ; APB1ENR\nLDR R1, [R0]\nBIC R1, R1, #(1<<17)  ; clear USART2 clock\nSTR R1, [R0]",
        "solutionLanguage": "arm",
        "solutionExplanation": "GPIOA is on AHB1, bit 0. USART2 is on APB1, bit 17. Clear those bits in RCC_AHB1ENR (0x40023830) and RCC_APB1ENR (0x40023840) respectively. First finish transfers (wait USART TC if needed), disable USART2 in CR1, and ensure PA13/PA14 debug and all other GPIOA users tolerate gating. This is a conditional fragment, not a safe universal board initialization."
      },
      {
        "id": "ex-38-3",
        "title": "Exercise 38.3: Duty Cycling Calculation",
        "description": "A sensor node wakes every 10 seconds, takes 5 ms to read a sensor and transmit data using 10 mA, then sleeps with 2 µA current. Calculate the average current consumption. Assume the active period includes wake-up overhead of 1 ms at 10 mA.",
        "solution": "Active current: 10 mA for (5 ms + 1 ms) = 6 ms per cycle. Sleep current: 2 µA for (10 s - 6 ms) ≈ 10 s. Average = (10 mA * 6 ms + 2 µA * 10000 ms) / 10000 ms = (0.06 mA·s + 0.02 µA·s) / 10 s? Let's compute: Active charge = 10 mA * 6 ms = 60 µC. Sleep charge = 2 µA * 9994 ms = 19.988 µC. Total charge per 10 s ≈ 79.988 µC. Average current = 79.988 µC / 10 s = 7.9988 µA ≈ 8 µA.\n\nThe wording says active time includes overhead: if the total active period is 5 ms, exact average is (10000 microamps*0.005 s + 2 microamps*9.995 s)/10 s = 6.999 microamps. If 5 ms work PLUS 1 ms overhead was intended, it is 7.9988 microamps. State which interpretation is used; the source solution uses the latter.",
        "solutionLanguage": "text"
      },
      {
        "id": "ex-38-4",
        "title": "Exercise 38.4: SLEEPONEXIT Optimization",
        "description": "Modify the low-power blink example to use SLEEPONEXIT. Explain why this saves power compared to a loop with WFI and branch.",
        "solution": "With WFI in a loop, after each interrupt the CPU executes the branch back to WFI, which takes a few cycles. With SLEEPONEXIT, the CPU automatically re-enters sleep on return from the interrupt, eliminating those extra instructions and reducing wake-up overhead, thus saving power.\n\nThe source example already sets SLEEPONEXIT. The complete companion supplies missing initialization; clear SCR bit1 to compare the ordinary DSB/WFI loop. Measure the difference, since peripheral and LED current can dominate.",
        "solutionLanguage": "text"
      },
      {
        "id": "ex-38-5",
        "title": "Exercise 38.5: Deep Sleep Wake-Up",
        "description": "Describe the steps to enter Stop mode on STM32F4 and wake up using an RTC alarm. What registers are involved? What happens to the system clock upon wake-up?",
        "solution": "To enter Stop mode:\n- Set SLEEPDEEP bit in SCR.\n- Configure PWR_CR to select Stop mode (bits 0-1 = 01) and enable power interface clock.\n- Configure the RTC alarm as wake-up source.\n- Execute WFI.\nUpon RTC alarm, the CPU wakes from Stop, resumes after WFI. The system clock may need to be reconfigured if it was switched to a low-power source (e.g., HSI) during Stop. Typically, the clock is restored by hardware or startup code.\n\nCorrection: F407 Stop selects HSI on wake; firmware explicitly re-enables/waits for oscillators and PLL and switches SYSCLK when ready. Enable PWR clock and backup-domain writes, configure an available LSE/LSI RTC source without destructively resetting an in-use backup domain, unlock RTC write protection, disable alarm and wait ALRAWF before setting it, clear ALRAF, enable ALRAIE/ALRAE and relock. Route EXTI17 rising edge and NVIC RTC_Alarm IRQ41, acknowledge both RTC and EXTI flags in the handler. Retain the RTC clock in Stop and use timeouts for oscillator readiness. Stop does not rerun startup.",
        "solutionLanguage": "text"
      }
    ],
    "practiceQuestions": [
      {
        "question": "What are the main sources of power consumption in a CMOS microcontroller? How can you reduce each?",
        "answer": "Dynamic switching power depends on activity, capacitance, voltage squared and frequency; leakage remains while idle and varies with voltage and temperature. Gate unused clocks, reduce unnecessary switching and use appropriate sleep/power domains; measure the whole board."
      },
      {
        "question": "Explain the difference between Sleep and Deep Sleep modes on Cortex-M. Which instructions are used to enter them?",
        "answer": "SCR.SLEEPDEEP=0 selects ordinary Sleep; setting it requests the MCU’s configured deep-sleep state. WFI or WFE enters the selected state. On STM32F407, Stop retains main SRAM and resumes; Standby normally loses main SRAM and restarts through reset."
      },
      {
        "question": "What is the purpose of the SLEEPONEXIT bit? How does it help in low-power designs?",
        "answer": "SLEEPONEXIT is SCR bit1 and sleeps when exception return would reach thread mode. It removes idle-loop instructions for ISR-only systems but prevents a thread-mode queue consumer from running until cleared."
      },
      {
        "question": "How does clock gating reduce power consumption? Provide an example.",
        "answer": "Gating a peripheral clock suppresses clock-driven switching. Clear GPIOB bit1 in RCC_AHB1ENR only after confirming it is unused. It does not remove every leakage or external-load current, and wake-up dependencies must remain powered."
      },
      {
        "question": "Why should unused GPIO pins be configured as analog or with pull-up/down? What problems can floating pins cause?",
        "answer": "Floating digital inputs can switch near thresholds and consume extra current. Analog mode disables the digital input path where documented; a suitable pull defines a level. Check external connections and preserve debugger, oscillator and wake pins."
      },
      {
        "question": "What is duty cycling? How does it affect average power consumption?",
        "answer": "Duty cycling alternates active work with sleep. Average current is (Iactive*tactive + Isleep*tsleep)/period, including startup, radio and regulator costs. The active duty fraction alone is not the percentage of total energy saved."
      },
      {
        "question": "Describe the WFI instruction. What happens when an interrupt is pending?",
        "answer": "WFI waits for an architecturally qualifying wake condition. A qualifying pending interrupt can make it return immediately; waking and servicing the handler are distinct when masked. Use DSB before sleep and recheck software work rather than assuming every wake implies useful work."
      },
      {
        "question": "What are the trade-offs between lowering the clock frequency and reducing voltage for power savings?",
        "answer": "Lower frequency reduces instantaneous switching power but lengthens execution and changes peripheral timing; total energy may rise if sleep is delayed. Voltage has a quadratic switching effect but must satisfy device frequency/flash/voltage limits and sequencing."
      },
      {
        "question": "How can an RTC alarm be used as a wake-up source in deep sleep? What are the advantages?",
        "answer": "Run RTC from a clock available in the selected low-power mode, configure and acknowledge its alarm, route EXTI17 and enable RTC_Alarm IRQ41 for STM32F407 Stop. RTC supports long idle periods while high-speed clocks stop. Restore the desired clock tree after wake."
      },
      {
        "question": "In bare-metal programming, what is the role of the startup code and linker script in low-power applications?",
        "answer": "Startup supplies vectors, stack and initialized data, and establishes a valid clock/power state. The linker places flash, SRAM, retained regions and stack. Stop resumes existing code; Standby reset requires a deliberate retained-state recovery design."
      }
    ],
    "summary": [
      "Low-power design is critical for battery-operated embedded devices.",
      "Dynamic power depends on voltage and frequency; static power is due to leakage.",
      "Sleep modes (WFI/WFE) halt the CPU, reducing power.",
      "SLEEPONEXIT simplifies interrupt-driven idle loops.",
      "Clock gating disables unused peripherals, saving power.",
      "GPIO pins should be configured to avoid floating inputs.",
      "Duty cycling dramatically reduces average power.",
      "Bare-metal programming gives complete control over power management.",
      "Combining sleep modes with interrupts yields responsive yet energy-efficient systems."
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
