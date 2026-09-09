import { Chapter } from '../types';

export const CHAPTERS_LEVEL_9: Chapter[] = [
  {
    id: 45,
    slug: 'chapter-45-arm-assembly-essentials',
    level: 9,
    levelTitle: 'Cross-Platform and Alternative Architectures',
    title: 'Chapter 45: ARM Assembly Essentials',
    subtitle: '64-Bit ARM (AArch64), Three-Operand Syntax, CSEL, and Linux System Calls',
    learningObjectives: [
      'Master the ARM64 (AArch64) register set: x0–x30, SP, and zero register XZR.',
      'Write three-operand instructions: add x0, x1, x2.',
      'Understand ARM64 load/store addressing modes (pre/post-index, register offset).',
      'Use CSEL (Conditional Select) for branchless conditional assignments.',
      'Invoke Linux ARM64 system calls using SVC #0 (syscall number in x8).'
    ],
    prerequisites: ['Chapters 1–22'],
    keyConcepts: [
      'ARM is a RISC load/store architecture with 31 general registers.',
      'Instructions are fixed 32-bit words.',
      'SVC #0 enters the Linux kernel with syscall number in x8.'
    ],
    diagramType: 'arm_assembly',
    sections: [
      {
        id: 'sec-45-1',
        title: '45.1 Linux ARM64 Hello World & Conditional Select',
        content: `Complete runnable ARM64 Linux program and branchless CSEL usage:`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'hello_arm64.s',
            code: `.section .data
msg:
    .ascii "Hello, World!\\n"
    len = . - msg

.section .text
.global _start

_start:
    // write(1, msg, len)
    mov x0, #1          // fd = 1 (stdout)
    adr x1, msg         // load PC-relative address
    mov x2, #len        // length
    mov x8, #64         // syscall number for write on ARM64
    svc #0              // invoke kernel

    // exit(0)
    mov x0, #0          // status = 0
    mov x8, #93         // syscall number for exit on ARM64
    svc #0`
          },
          {
            language: 'arm',
            title: 'arm64_csel.s (Branchless Maximum)',
            code: `// max: x0 = a, x1 = b, returns max in x0
max:
    cmp w0, w1
    csel w0, w0, w1, ge   // if w0 >= w1, w0 = w0; else w0 = w1
    ret`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-45-1',
        title: 'Exercise 45.1: ARM64 Array Sum',
        description: 'Sum an array of 10 words using indexed addressing LDR W1, [X0, X2, LSL #2].',
        solution: `sum_array:\n    mov w3, #0\n    mov w4, #0\n.loop:\n    cmp w4, w2; b.ge .done\n    ldr w5, [x0, x4, lsl #2]\n    add w3, w3, w5\n    add w4, w4, #1\n    b .loop\n.done:\n    mov w0, w3\n    ret`,
        solutionLanguage: 'arm'
      }
    ],
    practiceQuestions: [
      {
        question: 'What is the role of the XZR register in ARM64?',
        answer: 'XZR (and 32-bit WZR) is a dedicated zero register that always evaluates to 0 when read, and discards all data written to it, eliminating the need to zero registers with xor.'
      }
    ],
    summary: ['ARM64 is the world\'s leading mobile and power-efficient server architecture.', 'Three-operand format and CSEL eliminate branch penalties.']
  },
  {
    id: 46,
    slug: 'chapter-46-riscv-assembly',
    level: 9,
    levelTitle: 'Cross-Platform and Alternative Architectures',
    title: 'Chapter 46: RISC-V Assembly',
    subtitle: 'The Open Modular Architecture (RV64I), Registers, Jumps, and ecall',
    learningObjectives: [
      'Understand the open-source, modular RISC-V ISA philosophy.',
      'Master RV64 general-purpose registers: x0–x31 (zero, ra, sp, gp, tp, t0–t6, a0–a7, s0–s11).',
      'Execute load/store operations, branches without flags, and jumps (jal, jalr).',
      'Invoke Linux RISC-V system calls using ecall (syscall number in a7).'
    ],
    prerequisites: ['Chapters 1–22, 45'],
    keyConcepts: [
      'RISC-V is royalty-free and extensible (RV64IMAFDC).',
      'x0 is hardwired to zero.',
      'ecall is the system call trap instruction, using a7 for syscall ID.'
    ],
    diagramType: 'riscv_assembly',
    sections: [
      {
        id: 'sec-46-1',
        title: '46.1 Linux RISC-V 64 Hello World Program',
        content: `Complete runnable RISC-V 64-bit assembly program:`,
        codeSnippets: [
          {
            language: 'riscv',
            title: 'hello_riscv64.s',
            code: `.section .data
msg:
    .ascii "Hello, World!\\n"
    len = . - msg

.section .text
.global _start

_start:
    # write(1, msg, len)
    li a0, 1            # fd = 1 (stdout)
    la a1, msg          # load address of msg
    li a2, len          # length
    li a7, 64           # syscall 64 = write
    ecall               # invoke kernel

    # exit(0)
    li a0, 0            # status = 0
    li a7, 93           # syscall 93 = exit
    ecall`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-46-1',
        title: 'Exercise 46.1: Recursive Factorial in RISC-V',
        description: 'Implement factorial in RV64 assembly saving ra and s0 on the stack.',
        solution: `factorial:\n    addi sp, sp, -16\n    sd ra, 8(sp)\n    sd s0, 0(sp)\n    mv s0, a0\n    li t0, 1\n    ble s0, t0, .base\n    addi a0, s0, -1\n    call factorial\n    mul a0, s0, a0\n    j .done\n.base: li a0, 1\n.done: ld s0, 0(sp); ld ra, 8(sp); addi sp, sp, 16; ret`,
        solutionLanguage: 'riscv'
      }
    ],
    practiceQuestions: [
      {
        question: 'How do conditional branches in RISC-V differ from x86 and ARM?',
        answer: 'RISC-V does not have a status flags register (like RFLAGS or PSTATE). Instead, branch instructions (beq, bne, blt, bge) directly compare two registers in a single instruction.'
      }
    ],
    summary: ['RISC-V is an open, modern, clean RISC standard.', 'Modular extensions tailor the ISA to microcontrollers, desktops, and supercomputers.']
  },
  {
    id: 47,
    slug: 'chapter-47-mips-other-architectures',
    level: 9,
    levelTitle: 'Cross-Platform and Alternative Architectures',
    title: 'Chapter 47: MIPS and Other Architectures',
    subtitle: 'Classic RISC, Delay Slots, SPARC Register Windows, PowerPC, and AVR',
    learningObjectives: [
      'Understand the architecture of MIPS32: 32 registers ($zero, $v0–$v1, $a0–$a3, $t0–$t9, $s0–$s7, $sp, $ra).',
      'Manage MIPS branch delay slots effectively.',
      'Write a MIPS32 Hello World program with Linux syscalls ($v0 = 4004).',
      'Survey historical architectures: SPARC register windows, PowerPC condition fields, AVR 8-bit.'
    ],
    prerequisites: ['Chapters 1–22, 45, 46'],
    keyConcepts: [
      'In MIPS, the instruction in the delay slot immediately following a branch executes before the branch takes effect.',
      'SPARC utilizes overlapping register windows to accelerate function calls.',
      'MIPS system calls place the syscall number in $v0 (offset by 4000 on Linux O32).'
    ],
    diagramType: 'mips_architecture',
    sections: [
      {
        id: 'sec-47-1',
        title: '47.1 MIPS32 Linux Hello World with Delay Slots',
        content: `Complete runnable MIPS assembly program:`,
        codeSnippets: [
          {
            language: 'mips',
            title: 'hello_mips.s',
            code: `.section .data
msg:
    .ascii "Hello, World!\\n"
    len = . - msg

.section .text
.global _start

_start:
    li $v0, 4004        # syscall 4004 = write (MIPS O32)
    li $a0, 1           # stdout
    la $a1, msg
    li $a2, len
    syscall

    li $v0, 4001        # syscall 4001 = exit
    li $a0, 0
    syscall`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-47-1',
        title: 'Exercise 47.1: MIPS Delay Slot Protection',
        description: 'Demonstrate safe branch handling in MIPS by placing a nop in the branch delay slot.',
        solution: `beq $a0, $a1, .target\nnop                  # delay slot executed before branch jump!\nmove $v0, $zero`,
        solutionLanguage: 'mips'
      }
    ],
    practiceQuestions: [
      {
        question: 'What is the MIPS branch delay slot?',
        answer: 'In early pipelined architectures, the instruction following a branch had already been fetched by the time the branch condition was evaluated. Rather than flush the pipeline, MIPS architecturally executes the instruction in the delay slot before jumping.'
      }
    ],
    summary: ['MIPS shaped the foundation of modern RISC processor design.', 'Understanding historical trade-offs enriches low-level systems engineering.']
  },
  {
    id: 48,
    slug: 'chapter-48-comparing-architectures-isa-tradeoffs',
    level: 9,
    levelTitle: 'Cross-Platform and Alternative Architectures',
    title: 'Chapter 48: Comparing Architectures: ISA Design and Trade-offs',
    subtitle: 'Side-by-Side Comparison: x86-64 vs ARM64 vs RISC-V vs MIPS',
    learningObjectives: [
      'Compare and contrast the 4 major ISAs across instruction encoding, registers, addressing, and control flow.',
      'Analyze code density, decoder complexity, and energy efficiency.',
      'Map equivalent operations across all 4 architectures.',
      'Make informed hardware and ISA architectural selections for technical projects.'
    ],
    prerequisites: ['Chapters 1–47'],
    keyConcepts: [
      'x86-64 maximizes code density with variable-length CISC instructions.',
      'ARM64 and RISC-V maximize power efficiency and decoder throughput with clean 32-bit RISC words.',
      'Register counts dictate memory traffic and instruction field encoding.'
    ],
    diagramType: 'isa_comparison',
    sections: [
      {
        id: 'sec-48-1',
        title: '48.1 The Grand Architectural Matrix',
        content: `Comprehensive side-by-side comparison of the 4 major architectures:`,
        tableData: {
          headers: ['Feature', 'x86-64', 'ARM64 (AArch64)', 'RISC-V (RV64)', 'MIPS32'],
          rows: [
            ['Type', 'CISC (Variable 1-15 bytes)', 'RISC (Fixed 32-bit)', 'RISC (Fixed 32-bit / 16-bit C)', 'RISC (Fixed 32-bit)'],
            ['General Registers', '16 (RAX..R15)', '31 (X0..X30) + XZR', '31 (X1..X31) + X0', '31 ($1..$31) + $zero'],
            ['Zero Register', 'None (use xor)', 'XZR', 'x0 (zero)', '$zero ($0)'],
            ['Operand Format', '2-operand (dest = src)', '3-operand (dest, src1, src2)', '3-operand (dest, src1, src2)', '3-operand (dest, src1, src2)'],
            ['Addressing Modes', 'Rich (base+idx*scale+disp)', 'Base + offset / pre/post index', 'Base + 12-bit offset only', 'Base + 16-bit offset only'],
            ['Condition Handling', 'Flags in RFLAGS + cmov', 'Flags in PSTATE + CSEL', 'Direct register compare branches', 'Direct register compare branches'],
            ['Syscall Trigger', 'syscall', 'svc #0', 'ecall', 'syscall'],
            ['Syscall Register', 'rax', 'x8', 'a7', '$v0 (4000+)'],
            ['Delay Slot', 'No', 'No', 'No', 'Yes (1 instruction)'],
            ['Endianness', 'Little-endian', 'Little-endian default', 'Little-endian default', 'Bi-endian']
          ]
        }
      }
    ],
    exercises: [
      {
        id: 'ex-48-1',
        title: 'Exercise 48.1: Write a = b + c in all 4 architectures',
        description: 'Provide the single instruction expression in x86-64, ARM64, RISC-V, and MIPS.',
        solution: 'x86-64: add rax, rbx (if rax holds b)\nARM64: add x0, x1, x2\nRISC-V: add a0, a1, a2\nMIPS: addu $v0, $a0, $a1',
        solutionLanguage: 'nasm'
      }
    ],
    practiceQuestions: [
      {
        question: 'Why does x86-64 have higher code density than RISC-V or ARM64?',
        answer: 'x86 instructions are variable-length (1 to 15 bytes) and allow memory operands directly in arithmetic instructions (like add rax, [rbx]), doing in 1 instruction what requires 2 or 3 instructions in RISC load/store architectures.'
      }
    ],
    summary: ['Each ISA embodies deliberate engineering trade-offs.', 'Universal concepts—registers, stacks, control flow—unify all computer architectures.']
  },
  {
    id: 49,
    slug: 'chapter-49-writing-portable-assembly-code',
    level: 9,
    levelTitle: 'Cross-Platform and Alternative Architectures',
    title: 'Chapter 49: Writing Portable Assembly Code',
    subtitle: 'Unified Macros, Conditional Compilation (#ifdef), and System Call Abstraction',
    learningObjectives: [
      'Abstract architecture-specific instruction and register differences.',
      'Use the C preprocessor (cpp) with uppercase .S files to conditionally target architectures.',
      'Construct a portable system call wrapper layer across x86-64, ARM64, and RISC-V.',
      'Implement a cross-platform portable strlen routine.'
    ],
    prerequisites: ['Chapters 1–48'],
    keyConcepts: [
      'Conditional compilation (#ifdef __x86_64__) selects target-specific code at build time.',
      'Macros abstract register names (REG_A) and opcode mnemonics.',
      'System call abstractions bridge differences in syscall numbers and invocation instructions.'
    ],
    diagramType: 'portable_assembly',
    sections: [
      {
        id: 'sec-49-1',
        title: '49.1 Portable "Hello, World!" for x86-64, ARM64, and RISC-V',
        content: `A single portable assembly file that compiles and runs on x86-64, ARM64, and RISC-V:`,
        codeSnippets: [
          {
            language: 'c',
            title: 'portable_defs.h',
            code: `#if defined(__x86_64__)
#define SYS_WRITE(fd, buf, len) \\
    mov rax, 1; mov rdi, fd; mov rsi, buf; mov rdx, len; syscall
#define SYS_EXIT(code) \\
    mov rax, 60; mov rdi, code; syscall

#elif defined(__aarch64__)
#define SYS_WRITE(fd, buf, len) \\
    mov x0, fd; mov x1, buf; mov x2, len; mov x8, 64; svc #0
#define SYS_EXIT(code) \\
    mov x0, code; mov x8, 93; svc #0

#elif defined(__riscv)
#define SYS_WRITE(fd, buf, len) \\
    li a0, fd; la a1, buf; li a2, len; li a7, 64; ecall
#define SYS_EXIT(code) \\
    li a0, code; li a7, 93; ecall
#endif`
          },
          {
            language: 'arm',
            title: 'hello_portable.S',
            code: `#include "portable_defs.h"

.section .data
msg:
    .ascii "Hello, Cross-Platform World!\\n"
    len = . - msg

.section .text
.global _start

_start:
    SYS_WRITE(1, msg, len)
    SYS_EXIT(0)`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-49-1',
        title: 'Exercise 49.1: Portable memset Macro',
        description: 'Define a macro that expands to rep stosb on x86-64 and a register loop on ARM64.',
        solution: `#if defined(__x86_64__)\n#define PORTABLE_MEMSET(dst, val, count) \\\n    mov rdi, dst; mov al, val; mov rcx, count; cld; rep stosb\n#elif defined(__aarch64__)\n#define PORTABLE_MEMSET(dst, val, count) \\\n    bl memset_arm64_helper\n#endif`,
        solutionLanguage: 'c'
      }
    ],
    practiceQuestions: [
      {
        question: 'What is the role of the C preprocessor in writing portable assembly with GNU tools?',
        answer: 'When assembly files are named with an uppercase .S extension, GCC automatically runs the C preprocessor (cpp) before assembling. This allows developers to use #include, #define, #ifdef, and architecture macros (__x86_64__, __aarch64__, __riscv) directly.'
      }
    ],
    summary: [
      'Portable assembly abstracts register and syscall divergence.',
      'Preprocessors enable a single codebase to support multiple hardware targets.',
      'The journey from zero to hero equips you with deep systems mastery across all major computing platforms.'
    ]
  }
];
