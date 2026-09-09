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
      'Understand the architecture of microcontrollers (CPU, Flash, SRAM, Peripherals).',
      'Master ARM Cortex-M programmer model: R0-R12, SP (R13), LR (R14), PC (R15), xPSR.',
      'Construct a bare-metal vector table with initial stack pointer and Reset_Handler.',
      'Write a complete Thumb-2 assembly program to blink an LED on STM32F4.'
    ],
    prerequisites: ['Chapters 1–18'],
    keyConcepts: [
      'Microcontrollers integrate compute, memory, and peripheral buses on a single die.',
      'The vector table at 0x08000000 holds the initial SP and Reset Handler address.',
      'Cross-compilers (arm-none-eabi-as/ld) build binaries for ARM targets.'
    ],
    diagramType: 'embedded_mcu',
    sections: [
      {
        id: 'sec-35-1',
        title: '35.1 Bare-Metal STM32F4 LED Blink in Pure Assembly',
        content: `Complete bare-metal program toggling PD12 on STM32F4:`,
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
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-35-1',
        title: 'Exercise 35.1: Toggle Pin PD13',
        description: 'Modify the blink program to toggle pin 13 instead of pin 12.',
        solution: 'Change #(1 << 12) to #(1 << 13) in ODR, and modify MODER bits from (3 << 24)/(1 << 24) to (3 << 26)/(1 << 26).',
        solutionLanguage: 'arm'
      }
    ],
    practiceQuestions: [
      {
        question: 'What are the first two entries of the ARM Cortex-M vector table?',
        answer: 'Entry 0 (address 0x00000000) is the initial Main Stack Pointer (MSP) value. Entry 1 (address 0x00000004) is the address of the Reset_Handler.'
      }
    ],
    summary: ['Microcontrollers combine CPU, flash, and SRAM on-chip.', 'Bare-metal development starts at the vector table and initializes hardware directly.']
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
