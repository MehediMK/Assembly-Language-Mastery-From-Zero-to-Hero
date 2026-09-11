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
      'Understand ARM architecture fundamentals and its RISC design principles.',
      'Master the ARM64 (AArch64) register set: x0–x30, SP, and zero register XZR.',
      'Write three-operand instructions: add x0, x1, x2.',
      'Understand ARM64 load/store addressing modes (pre/post-index, register offset).',
      'Use CSEL (Conditional Select) for branchless conditional assignments.',
      'Invoke Linux ARM64 system calls using SVC #0 (syscall number in x8).',
      'Compare ARM64 with x86-64 architecture.',
      'Understand ARM64 calling convention (AAPCS64).'
    ],
    prerequisites: ['Chapters 1–22'],
    keyConcepts: [
      'ARM: Advanced RISC Machine - dominant mobile/embedded architecture.',
      'RISC load/store architecture: Only load/store access memory.',
      '31 general-purpose registers (X0-X30) + SP + XZR.',
      'Fixed 32-bit instruction width (except Thumb mode).',
      'Conditional execution via predication (CSEL, CCMP).',
      'SVC #0: Supervisor Call (system call instruction).',
      'AAPCS64: ARM64 Procedure Call Standard.',
      'Little-endian by default (configurable).'
    ],
    diagramType: 'arm_assembly',
    sections: [
      {
        id: 'sec-45-1',
        title: '45.1 ARM64 Architecture Overview',
        content: `ARM64 (AArch64) is the 64-bit execution state of ARM architecture.

### Why ARM64?
• Dominant in mobile devices (smartphones, tablets)
• Growing in servers (AWS Graviton, Apple M-series)
• Power-efficient design
• Strong performance per watt

### ARM64 Register Set
| Register | Purpose | Description |
|----------|---------|-------------|
| X0-X7 | Arguments/Results | Function arguments, return values |
| X8 | Indirect Result | Structure return address |
| X9-X15 | Temporary | Caller-saved |
| X16-X17 | Intra-procedure | Linker scratch registers |
| X18 | Platform | Reserved for OS |
| X19-X28 | Callee-saved | Must be preserved |
| X29 (FP) | Frame Pointer | Stack frame management |
| X30 (LR) | Link Register | Return address |
| SP | Stack Pointer | Stack pointer (not general purpose) |
| XZR | Zero Register | Always reads as 0, writes discarded |

### Key Differences from x86-64
| Feature | x86-64 | ARM64 |
|---------|--------|-------|
| Register count | 16 | 31 |
| Instruction size | Variable (1-15 bytes) | Fixed 32-bit |
| Operand format | 2-operand | 3-operand |
| Zero register | None (use XOR) | XZR |
| Memory access | Any instruction | Load/Store only |
| Condition codes | RFLAGS | PSTATE (NZCV) |

### ARM64 Calling Convention (AAPCS64)
• X0-X7: Arguments/return values
• X8: Indirect result (struct return)
• X9-X15: Temporary (caller-saved)
• X19-X28: Callee-saved
• X29 (FP): Frame pointer
• X30 (LR): Return address

### Instruction Categories
1. **Data Processing**: ADD, SUB, AND, ORR, EOR
2. **Load/Store**: LDR, STR, LDP, STP
3. **Branch**: B, BL, BR, BLR, RET
4. **System**: SVC, MRS, MSR
5. **SIMD/FP**: FMLA, FADD, LD1, ST1`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'ARM64 Hello World',
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
          }
        ]
      },
      {
        id: 'sec-45-2',
        title: '45.2 ARM64 Instruction Set',
        content: `ARM64 uses fixed-length 32-bit instructions with 3-operand format.

### Data Processing Instructions

// Arithmetic
add x0, x1, x2        // x0 = x1 + x2
sub x0, x1, x2        // x0 = x1 - x2
add x0, x1, #42       // x0 = x1 + 42 (immediate)

// Logical
and x0, x1, x2        // x0 = x1 & x2
orr x0, x1, x2        // x0 = x1 | x2
eor x0, x1, x2        // x0 = x1 ^ x2

// Shift
lsl x0, x1, #3        // x0 = x1 << 3
lsr x0, x1, #3        // x0 = x1 >> 3 (logical)
asr x0, x1, #3        // x0 = x1 >> 3 (arithmetic)

// Multiply
mul x0, x1, x2        // x0 = x1 * x2
madd x0, x1, x2, x3   // x0 = x1 * x2 + x3


### Load/Store Instructions

// Basic load/store
ldr x0, [x1]          // Load 64-bit from [x1]
ldr w0, [x1]          // Load 32-bit from [x1]
str x0, [x1]          // Store 64-bit to [x1]

// Immediate offset
ldr x0, [x1, #8]      // Load from [x1 + 8]
str x0, [x1, #8]      // Store to [x1 + 8]

// Register offset
ldr x0, [x1, x2]      // Load from [x1 + x2]
ldr x0, [x1, x2, LSL #3]  // Load from [x1 + x2*8]

// Pre-indexed (update address)
ldr x0, [x1, #8]!     // x1 = x1 + 8, then load

// Post-indexed (update after)
ldr x0, [x1], #8      // Load, then x1 = x1 + 8

// Pair load/store (efficient)
ldp x0, x1, [sp]      // Load x0 from [sp], x1 from [sp+8]
stp x0, x1, [sp, #-16]!  // sp = sp-16, store x0, x1


### Branch Instructions

// Unconditional
b label               // Branch to label
bl label              // Branch with link (call)
br x0                 // Branch to address in x0
blr x0                // Branch with link to x0

// Conditional
cbz x0, label         // Branch if x0 == 0
cbnz x0, label        // Branch if x0 != 0
b.eq label            // Branch if equal (Z=1)
b.ne label            // Branch if not equal (Z=0)
b.lt label            // Branch if less than
b.ge label            // Branch if greater or equal

// Return
ret                   // Return (branch to x30/LR)


### Conditional Select (CSEL)
Branchless conditional assignments:

// max(x0, x1) -> x0
cmp x0, x1
csel x0, x0, x1, ge  // if x0 >= x1, x0 = x0; else x0 = x1

// min(x0, x1) -> x0
cmp x0, x1
csel x0, x0, x1, le  // if x0 <= x1, x0 = x0; else x0 = x1

// abs(x0) -> x0
cmp x0, #0
csel x0, x0, x0, ge  // if x0 >= 0, keep; else negate
cneg x0, x0, lt      // Conditional negate


### Bit Manipulation

// Count leading zeros
clz x0, x1           // x0 = number of leading zeros in x1

// Bit field insert
bfi x0, x1, #0, #8   // Insert bits [7:0] of x1 into x0

// Reverse bits
rbit x0, x1          // Reverse all bits in x1
rev x0, x1           // Reverse bytes (endian swap)
`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'ARM64 Instruction Examples',
            code: `.section .text
.global _start

_start:
    // Data processing
    mov x0, #10
    mov x1, #20
    add x2, x0, x1     // x2 = 30
    sub x3, x1, x0     // x3 = 10
    mul x4, x0, x1     // x4 = 200
    
    // Logical operations
    and x5, x0, x1     // Bitwise AND
    orr x6, x0, x1     // Bitwise OR
    eor x7, x0, x1     // Bitwise XOR
    
    // Shift operations
    lsl x0, x0, #2     // Left shift by 2
    lsr x1, x1, #1     // Right shift by 1
    
    // Conditional select
    cmp x0, x1
    csel x2, x0, x1, ge  // x2 = max(x0, x1)
    
    // Load/Store
    adr x3, data       // Get address
    ldr x4, [x3]       // Load value
    add x4, x4, #1     // Increment
    str x4, [x3]       // Store back
    
    // Branch
    b compare
    
compare:
    cmp x0, x1
    b.eq equal
    b.gt greater
    b.lt less
    
equal:
    // x0 == x1
    b done
    
greater:
    // x0 > x1
    b done
    
less:
    // x0 < x1
    
done:
    // Exit
    mov x0, #0
    mov x8, #93
    svc #0

.section .data
data:
    .quad 42`
          }
        ]
      },
      {
        id: 'sec-45-3',
        title: '45.3 ARM64 System Calls and Calling Convention',
        content: `Linux ARM64 system calls use SVC #0 instruction.

### System Call Convention
| Register | Purpose |
|----------|---------|
| X8 | System call number |
| X0-X5 | Arguments |
| X0 | Return value |

### Common System Calls
| Number | Name | Arguments |
|--------|------|-----------|
| 64 | write | X0=fd, X1=buf, X2=count |
| 63 | read | X0=fd, X1=buf, X2=count |
| 93 | exit | X0=status |
| 56 | openat | X0=dirfd, X1=pathname, X2=flags |
| 57 | close | X0=fd |
| 220 | getpid | None |

### Function Call Convention (AAPCS64)

// Caller-saved (temporary) registers
// X0-X7: Arguments/return values
// X9-X15: Temporary

// Callee-saved registers
// X19-X28: Must be preserved

// Stack frame
// X29 (FP): Frame pointer
// X30 (LR): Return address


### Function Prologue/Epilogue

// Prologue
func:
    stp x29, x30, [sp, #-16]!  // Save FP and LR
    mov x29, sp                 // Set frame pointer
    stp x19, x20, [sp, #-16]!  // Save callee-saved regs
    
    // ... function body ...
    
    // Epilogue
    ldp x19, x20, [sp], #16    // Restore callee-saved regs
    ldp x29, x30, [sp], #16    // Restore FP and LR
    ret                         // Return


### Structure Passing

// Small structures: passed in registers
// Large structures: passed by pointer

// Return small struct in X0-X1
struct ret_small() {
    return {.a = 1, .b = 2};
}
// Result: X0=1, X1=2

// Return large struct via X8 pointer
struct ret_large() {
    static struct result;
    result.a = 1;
    result.b = 2;
    return result;
}
// X8 = pointer to result


### Stack Alignment
ARM64 requires 16-byte stack alignment:

// Allocate stack frame (must be multiple of 16)
sub sp, sp, #32     // 32 is multiple of 16
// ... use stack ...
add sp, sp, #32     // Restore stack
`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'ARM64 System Call Examples',
            code: `.section .text
.global _start

_start:
    // write(1, "Hello\\n", 6)
    mov x0, #1              // fd = stdout
    adr x1, msg             // buffer address
    mov x2, #6              // count
    mov x8, #64             // sys_write = 64
    svc #0                  // syscall

    // read(0, buf, 100)
    mov x0, #0              // fd = stdin
    adr x1, buf             // buffer address
    mov x2, #100            // max count
    mov x8, #63             // sys_read = 63
    svc #0                  // syscall
    // X0 = bytes read

    // exit(0)
    mov x0, #0              // status
    mov x8, #93             // sys_exit = 93
    svc #0

.section .data
msg:
    .ascii "Hello, World!\\n"

.section .bss
buf:
    .skip 100`
          }
        ]
      },
      {
        id: 'sec-45-4',
        title: '45.4 ARM64 vs x86-64 Comparison',
        content: `Key differences between ARM64 and x86-64 architectures.

### Instruction Set Philosophy
| Aspect | x86-64 | ARM64 |
|--------|--------|-------|
| Design | CISC (complex) | RISC (simple) |
| Instruction size | Variable (1-15 bytes) | Fixed (4 bytes) |
| Instruction count | 1000+ | ~200 base |
| Decoder complexity | High | Low |
| Power consumption | Higher | Lower |

### Register Usage
| Feature | x86-64 | ARM64 |
|---------|--------|-------|
| General registers | 16 | 31 |
| Zero register | None | XZR |
| Argument registers | RDI, RSI, RDX, RCX, R8, R9 | X0-X7 |
| Callee-saved | RBX, RBP, R12-R15 | X19-X28 |
| Return address | Stack | X30 (LR) |

### Memory Access
| Feature | x86-64 | ARM64 |
|---------|--------|-------|
| Addressing modes | Many (base+idx*scale+disp) | Few (base+offset) |
| Memory operands | In any instruction | Load/Store only |
| Alignment | Not required | Recommended |
| Atomic operations | LOCK prefix | LDXR/STXR |

### Control Flow
| Feature | x86-64 | ARM64 |
|---------|--------|-------|
| Condition codes | RFLAGS (all instructions) | PSTATE (compare only) |
| Conditional move | CMOV | CSEL |
| Indirect jump | JMP [addr] | BR x0 |
| Function call | CALL (pushes RIP) | BL (stores in LR) |
| Return | RET (pops RIP) | RET (branches to LR) |

### System Calls
| Feature | x86-64 (Linux) | ARM64 (Linux) |
|---------|----------------|---------------|
| Instruction | syscall | svc #0 |
| Number register | RAX | X8 |
| Arguments | RDI, RSI, RDX, R10, R8, R9 | X0-X5 |
| Return | RAX | X0 |

### Code Density Example
x86-64: add rax, [rbx+rcx*8+16] (4 bytes)
ARM64:

add x9, x1, x2, LSL #3    // x9 = x2 * 8
ldr x0, [x9, #16]          // Load from x9 + 16
// 8 bytes total


### When to Use Which?
| Use Case | Recommended |
|----------|-------------|
| Desktop/Server | x86-64 (compatibility) |
| Mobile/Embedded | ARM64 (power efficiency) |
| Cloud servers | ARM64 (power/cost) |
| Legacy support | x86-64 |
| Battery life critical | ARM64 |`,
        codeSnippets: [
          {
            language: 'arm',
            title: 'ARM64 vs x86-64 Side-by-Side',
            code: `// Function: int add(int a, int b) { return a + b; }

// x86-64
add:
    lea eax, [rdi+rsi]
    ret

// ARM64
add:
    add w0, w0, w1
    ret

// strlen function

// x86-64
strlen:
    xor eax, eax
.loop:
    cmp byte [rdi+rax], 0
    je .done
    inc eax
    jmp .loop
.done:
    ret

// ARM64
strlen:
    mov x2, x0
.loop:
    ldrb w1, [x2], #1
    cbnz w1, .loop
    sub x0, x2, x0
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
      },
      {
        id: 'ex-45-2',
        title: 'Exercise 45.2: ARM64 Factorial',
        description: 'Write a recursive factorial function in ARM64 assembly.',
        solution: 'Use X0 for argument/return, save X30 (LR) on stack for recursion. Base case: n<=1 return 1. Recursive: save n, call factorial(n-1), multiply n*result.'
      },
      {
        id: 'ex-45-3',
        title: 'Exercise 45.3: CSEL Implementation',
        description: 'Implement absolute value function using CSEL.',
        solution: 'cmp x0, #0; csel x0, x0, x0, ge; cneg x0, x0, lt (or use conditional negate). This avoids branch instructions.'
      },
      {
        id: 'ex-45-4',
        title: 'Exercise 45.4: ARM64 String Copy',
        description: 'Write a strcpy function in ARM64 assembly.',
        solution: 'Loop: ldrb w2, [x1], #1; strb w2, [x0], #1; cbnz w2, loop. Uses post-indexed addressing for efficient pointer advancement.'
      }
    ],
    practiceQuestions: [
      {
        question: 'What is the role of the XZR register in ARM64?',
        answer: 'XZR (and 32-bit WZR) is a dedicated zero register that always evaluates to 0 when read, and discards all data written to it, eliminating the need to zero registers with xor. It simplifies many operations like moving immediates and comparing with zero.'
      },
      {
        question: 'How does ARM64 conditional execution differ from x86-64?',
        answer: 'ARM64 uses PSTATE flags (NZCV) set by CMP instructions, then CSEL/conditional branches. x86-64 uses RFLAGS set by any instruction, with CMOV for conditional moves. ARM64 requires explicit comparison before conditional operation, while x86-64 can test during any instruction.'
      },
      {
        question: 'Why is ARM64 more power-efficient than x86-64?',
        answer: 'ARM64 uses fixed-length instructions (simpler decoder), load/store architecture (fewer memory accesses), and cleaner RISC design (less silicon). x86-64 variable instructions require complex decoding, and memory operands in ALU instructions increase memory traffic.'
      },
      {
        question: 'What is the ARM64 calling convention (AAPCS64)?',
        answer: 'AAPCS64 defines: X0-X7 for arguments/returns, X8 for indirect result, X9-X15 as caller-saved temporaries, X19-X28 as callee-saved, X29 as frame pointer, X30 as link register (return address). Stack must be 16-byte aligned.'
      },
      {
        question: 'How do ARM64 system calls differ from x86-64?',
        answer: 'ARM64 uses SVC #0 instruction with syscall number in X8 and arguments in X0-X5. x86-64 uses syscall instruction with number in RAX and arguments in RDI, RSI, RDX, R10, R8, R9. Different syscall numbers on Linux (e.g., write: ARM64=64, x86-64=1).'
      },
      {
        question: 'What is CSEL and why is it useful?',
        answer: 'CSEL (Conditional Select) performs branchless conditional assignment: CSEL Xd, Xn, Xm, cond selects Xn if condition true, Xm if false. It avoids branch penalties in simple conditionals like max/min/abs functions, improving performance on pipelined processors.'
      }
    ],
    summary: [
      'ARM64 is the world\'s leading mobile and power-efficient server architecture.',
      'Three-operand format and CSEL eliminate branch penalties.',
      'Fixed 32-bit instructions simplify decoding and improve power efficiency.',
      'Load/store architecture reduces memory access complexity.',
      'AAPCS64 defines register usage and calling conventions.',
      'SVC #0 is the ARM64 system call instruction.',
      'ARM64 excels in power-constrained and mobile environments.',
      'Understanding ARM64 is essential for modern systems programming.'
    ]
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
      'Invoke Linux RISC-V system calls using ecall (syscall number in a7).',
      'Compare RISC-V with x86-64 and ARM64 architectures.',
      'Understand RISC-V calling convention.',
      'Learn RISC-V modular extensions (M, A, F, D, C).',
      'Study RISC-V privilege levels and virtual memory.'
    ],
    prerequisites: ['Chapters 1–22, 45'],
    keyConcepts: [
      'RISC-V: Open-source, royalty-free ISA from UC Berkeley.',
      'Modular design: Base integer ISA + extensions (M, A, F, D, C).',
      'x0 is hardwired to zero (no need for zeroing instructions).',
      'ecall: Environment Call (system call instruction).',
      'No condition codes: Branches compare registers directly.',
      'RV64I: 64-bit integer base instruction set.',
      'Compressed (C) extension: 16-bit instructions for code density.',
      'Privilege levels: User, Supervisor, Machine.'
    ],
    diagramType: 'riscv_assembly',
    sections: [
      {
        id: 'sec-46-1',
        title: '46.1 RISC-V Architecture Overview',
        content: `RISC-V is an open, modular ISA designed for education and industry.

### Why RISC-V?
• Open-source: No licensing fees
• Modular: Customize for specific applications
• Clean design: Minimal legacy baggage
• Growing ecosystem: Linux, GCC, LLVM support
• Industry adoption: SiFive, Espressif, StarFive

### RISC-V Register Set (RV64I)
| Register | ABI Name | Purpose | Description |
|----------|----------|---------|-------------|
| x0 | zero | Hardwired zero | Always 0 |
| x1 | ra | Return address | Function return address |
| x2 | sp | Stack pointer | Stack pointer |
| x3 | gp | Global pointer | Global data pointer |
| x4 | tp | Thread pointer | Thread-local storage |
| x5-x7 | t0-t2 | Temporaries | Caller-saved |
| x8 | s0/fp | Saved/frame | Callee-saved / Frame pointer |
| x9 | s1 | Saved | Callee-saved |
| x10-x11 | a0-a1 | Arguments/Returns | Function args, return values |
| x12-x17 | a2-a7 | Arguments | Function arguments |
| x18-x27 | s2-s11 | Saved | Callee-saved |
| x28-x31 | t3-t6 | Temporaries | Caller-saved |

### Key Features
1. **No condition codes**: Branches compare registers directly
2. **Load/store architecture**: Memory access only via LDR/STR
3. **Fixed-length instructions**: 32-bit (base), 16-bit (C extension)
4. **Simple encoding**: Easy to decode
5. **Modular extensions**: M (multiply), A (atomic), F/D (float), C (compressed)

### RISC-V vs ARM64 vs x86-64
| Feature | RISC-V | ARM64 | x86-64 |
|---------|--------|-------|--------|
| License | Open (free) | Proprietary | Proprietary |
| Modularity | High | Medium | Low |
| Condition codes | None | PSTATE | RFLAGS |
| Zero register | x0 | XZR | None |
| Instruction size | 32/16-bit | 32-bit | 1-15 bytes |
| Operand format | 3-operand | 3-operand | 2-operand |`,
        codeSnippets: [
          {
            language: 'riscv',
            title: 'RISC-V Hello World',
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
      },
      {
        id: 'sec-46-2',
        title: '46.2 RISC-V Instruction Set',
        content: `RISC-V uses simple, regular instruction formats.

### Instruction Formats (RISC-V)
| Format | Usage | Layout |
|--------|-------|--------|
| R-type | Register-register | funct7[31:25] rs2[24:20] rs1[19:15] funct3[14:12] rd[11:7] opcode[6:0] |
| I-type | Immediate | imm[31:20] rs1[19:15] funct3[14:12] rd[11:7] opcode[6:0] |
| S-type | Store | imm[31:25] rs2[24:20] rs1[19:15] funct3[14:12] imm[11:7] opcode[6:0] |
| B-type | Branch | imm[31] imm[7] imm[30:25] rs2[24:20] rs1[19:15] funct3[14:12] imm[11:8] imm[30:25] opcode[6:0] |
| U-type | Upper immediate | imm[31:12] rd[11:7] opcode[6:0] |
| J-type | Jump | imm[31] imm[19:12] imm[20] imm[30:21] rd[11:7] opcode[6:0] |

### Arithmetic Instructions
riscv
# Integer register-register (R-type)
add  x1, x2, x3      # x1 = x2 + x3
sub  x1, x2, x3      # x1 = x2 - x3
and  x1, x2, x3      # x1 = x2 & x3
or   x1, x2, x3      # x1 = x2 | x3
xor  x1, x2, x3      # x1 = x2 ^ x3
sll  x1, x2, x3      # x1 = x2 << x3
srl  x1, x2, x3      # x1 = x2 >> x3 (logical)
sra  x1, x2, x3      # x1 = x2 >> x3 (arithmetic)
slt  x1, x2, x3      # x1 = (x2 < x3) ? 1 : 0

# Integer register-immmediate (I-type)
addi x1, x2, 42      # x1 = x2 + 42
andi x1, x2, 0xFF    # x1 = x2 & 0xFF
ori  x1, x2, 0x10    # x1 = x2 | 0x10
xori x1, x2, 0xFF    # x1 = x2 ^ 0xFF
slli x1, x2, 3       # x1 = x2 << 3
srli x1, x2, 3       # x1 = x2 >> 3 (logical)
srai x1, x2, 3       # x1 = x2 >> 3 (arithmetic)
slti x1, x2, 42      # x1 = (x2 < 42) ? 1 : 0

# Multiply/Divide (M extension)
mul    x1, x2, x3    # x1 = x2 * x3 (low 64 bits)
mulh   x1, x2, x3    # x1 = (x2 * x3) >> 64 (high)
div    x1, x2, x3    # x1 = x2 / x3 (signed)
divu   x1, x2, x3    # x1 = x2 / x3 (unsigned)
rem    x1, x2, x3    # x1 = x2 % x3 (signed)
remu   x1, x2, x3    # x1 = x2 % x3 (unsigned)


### Load/Store Instructions
riscv
# Load (I-type)
lb   x1, 0(x2)       # Load byte (sign-extended)
lbu  x1, 0(x2)       # Load byte unsigned (zero-extended)
lh   x1, 0(x2)       # Load halfword (16-bit)
lhu  x1, 0(x2)       # Load halfword unsigned
lw   x1, 0(x2)       # Load word (32-bit)
ld   x1, 0(x2)       # Load doubleword (64-bit)

# Store (S-type)
sb   x1, 0(x2)       # Store byte
sh   x1, 0(x2)       # Store halfword
sw   x1, 0(x2)       # Store word
sd   x1, 0(x2)       # Store doubleword

# Example: Load/Store with offset
lw   x5, 8(x1)       # Load word from x1+8
sw   x5, 12(x1)      # Store word to x1+12


### Branch Instructions (B-type)
riscv
# No condition codes! Compare registers directly.
beq  x1, x2, label   # Branch if x1 == x2
bne  x1, x2, label   # Branch if x1 != x2
blt  x1, x2, label   # Branch if x1 < x2 (signed)
bge  x1, x2, label   # Branch if x1 >= x2 (signed)
bltu x1, x2, label   # Branch if x1 < x2 (unsigned)
bgeu x1, x2, label   # Branch if x1 >= x2 (unsigned)

# Pseudo-instructions
beqz x1, label       # Branch if x1 == 0 (beq x1, x0, label)
bnez x1, label       # Branch if x1 != 0 (bne x1, x0, label)
blez x1, label       # Branch if x1 <= 0
bgez x1, label       # Branch if x1 >= 0
bltz x1, label       # Branch if x1 < 0
bgtz x1, label       # Branch if x1 > 0


### Jump Instructions
riscv
# Jump and Link (J-type)
jal  x1, label       # x1 = PC+4, jump to label (call)

# Jump and Link Register (I-type)
jalr x1, x2, 0       # x1 = PC+4, jump to x2 + 0

# Pseudo-instructions
j    label            # jal x0, label (unconditional jump)
jr   x1              # jalr x0, x1, 0 (jump to register)
ret                  # jalr x0, x1, 0 (return = jump to ra)

# Example: Function call
call func            # jal x1, func (link in x1)
ret                  # jalr x0, x1, 0 (return to caller)


### Upper Immediate (U-type)
riscv
lui  x1, 0x12345     # x1 = 0x12345000 (load upper 20 bits)
auipc x1, 0x12345    # x1 = PC + 0x12345000

# Common pattern for 32-bit immediate:
lui  x1, upper20     # Load upper 20 bits
addi x1, x1, lower12 # Add lower 12 bits
`,
        codeSnippets: [
          {
            language: 'riscv',
            title: 'RISC-V Instruction Examples',
            code: `.section .text
.global _start

_start:
    # Load immediate values
    li a0, 10           # a0 = 10
    li a1, 20           # a1 = 20
    
    # Arithmetic
    add a2, a0, a1      # a2 = 30
    sub a3, a1, a0      # a3 = 10
    mul a4, a0, a1      # a4 = 200 (M extension)
    div a5, a1, a0      # a5 = 2
    
    # Logical
    and a6, a0, a1      # Bitwise AND
    or  a7, a0, a1      # Bitwise OR
    xor t0, a0, a1      # Bitwise XOR
    
    # Shifts
    slli t1, a0, 3      # Left shift by 3
    srli t2, a1, 1      # Right shift by 1
    
    # Load/Store
    la   t3, data       # Get address
    lw   t4, 0(t3)      # Load word
    addi t4, t4, 1      # Increment
    sw   t4, 0(t3)      # Store word
    
    # Branch
    beq  a0, a1, equal
    bne  a0, a1, not_equal
    blt  a0, a1, less
    
equal:
    # a0 == a1
    j done
    
not_equal:
    # a0 != a1
    
less:
    # a0 < a1
    
done:
    # Exit
    li a0, 0
    li a7, 93
    ecall

.section .data
data:
    .word 42`
          }
        ]
      },
      {
        id: 'sec-46-3',
        title: '46.3 RISC-V System Calls and Calling Convention',
        content: `Linux RISC-V system calls use ecall instruction.

### System Call Convention
| Register | Purpose |
|----------|---------|
| a7 | System call number |
| a0-a5 | Arguments |
| a0 | Return value |

### Common System Calls
| Number | Name | Arguments |
|--------|------|-----------|
| 64 | write | a0=fd, a1=buf, a2=count |
| 63 | read | a0=fd, a1=buf, a2=count |
| 93 | exit | a0=status |
| 56 | openat | a0=dirfd, a1=pathname, a2=flags |
| 57 | close | a0=fd |

### Function Call Convention (RISC-V)
riscv
# Caller-saved (temporary) registers
# t0-t6 (x5-x7, x28-x31): Not preserved

# Callee-saved registers
# s0-s11 (x8-x9, x18-x27): Must be preserved

# Arguments/returns
# a0-a7 (x10-x17): Function arguments, return values

# Special registers
# ra (x1): Return address
# sp (x2): Stack pointer
# gp (x3): Global pointer
# tp (x4): Thread pointer


### Function Prologue/Epilogue
riscv
# Prologue
func:
    addi sp, sp, -32    # Allocate stack frame
    sd   ra, 24(sp)     # Save return address
    sd   s0, 16(sp)     # Save callee-saved register
    sd   s1, 8(sp)      # Save callee-saved register
    mv   s0, a0         # Save argument
    
    # ... function body ...
    
    # Epilogue
    ld   s1, 8(sp)      # Restore callee-saved register
    ld   s0, 16(sp)     # Restore callee-saved register
    ld   ra, 24(sp)     # Restore return address
    addi sp, sp, 32     # Deallocate stack frame
    ret                 # Return (jump to ra)


### Tail Call Optimization
riscv
# Tail call: reuse caller's stack frame
tail_call:
    ld   t0, 0(s0)      # Load function pointer
    ld   a0, 8(s0)      # Load argument
    jr   t0             # Jump to function (no return)
    # No stack frame setup needed


### Structure Passing
riscv
# Small structures: passed in registers
# Large structures: passed by pointer

# Return small struct in a0-a1
ret_small:
    li a0, 1
    li a1, 2
    ret

# Return large struct via pointer in a0
ret_large:
    la t0, result
    li t1, 1
    sd t1, 0(t0)
    mv a0, t0
    ret


### Stack Alignment
RISC-V requires 16-byte stack alignment:
riscv
# Allocate stack frame (must be multiple of 16)
addi sp, sp, -32     # 32 is multiple of 16
# ... use stack ...
addi sp, sp, 32      # Restore stack
`,
        codeSnippets: [
          {
            language: 'riscv',
            title: 'RISC-V System Call Examples',
            code: `.section .text
.global _start

_start:
    # write(1, "Hello\\n", 6)
    li a0, 1              # fd = stdout
    la a1, msg            # buffer address
    li a2, 6              # count
    li a7, 64             # sys_write = 64
    ecall                 # syscall

    # read(0, buf, 100)
    li a0, 0              # fd = stdin
    la a1, buf            # buffer address
    li a2, 100            # max count
    li a7, 63             # sys_read = 63
    ecall                 # syscall
    # a0 = bytes read

    # exit(0)
    li a0, 0              # status
    li a7, 93             # sys_exit = 93
    ecall

.section .data
msg:
    .ascii "Hello, World!\\n"

.section .bss
buf:
    .skip 100`
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
      },
      {
        id: 'ex-46-2',
        title: 'Exercise 46.2: RISC-V Array Sum',
        description: 'Sum an array of 10 words using RISC-V load instructions.',
        solution: 'Use a0 for array pointer, a1 for count. Loop: load word, add to sum, increment pointer, decrement count, branch if not zero.'
      },
      {
        id: 'ex-46-3',
        title: 'Exercise 46.3: RISC-V String Length',
        description: 'Write a strlen function in RISC-V assembly.',
        solution: 'Loop: load byte, check if zero, increment count, increment pointer. Return count in a0.'
      },
      {
        id: 'ex-46-4',
        title: 'Exercise 46.4: RISC-V Bubble Sort',
        description: 'Implement bubble sort for an integer array.',
        solution: 'Nested loops: outer loop iterates n-1 times, inner loop compares adjacent elements and swaps if needed. Use bge/blt for comparisons.'
      }
    ],
    practiceQuestions: [
      {
        question: 'How do conditional branches in RISC-V differ from x86 and ARM?',
        answer: 'RISC-V does not have a status flags register (like RFLAGS or PSTATE). Instead, branch instructions (beq, bne, blt, bge) directly compare two registers in a single instruction. This simplifies the hardware but requires explicit comparison instructions before branches.'
      },
      {
        question: 'What is the purpose of the x0 register in RISC-V?',
        answer: 'x0 is hardwired to zero: reading always returns 0, writing discards the value. This eliminates many instructions: li rd, 0 becomes addi rd, x0, 0 (or pseudo li), mv rd, rs becomes addi rd, rs, 0, nop becomes addi x0, x0, 0, and unconditional jumps can use jal x0, offset.'
      },
      {
        question: 'How does RISC-V modularity benefit embedded systems?',
        answer: 'RISC-V\'s modular ISA allows designers to include only needed extensions: base integer (I) for minimal cores, multiply (M) for arithmetic, atomic (A) for threading, float (F/D) for math, compressed (C) for code density. This reduces silicon area and power consumption for embedded applications.'
      },
      {
        question: 'What is the RISC-V calling convention?',
        answer: 'RISC-V uses: a0-a7 for arguments/returns, t0-t6 as caller-saved temporaries, s0-s11 as callee-saved, ra for return address, sp for stack pointer. Functions must preserve s0-s11, sp, and gp. Arguments beyond 8 use the stack.'
      },
      {
        question: 'How do RISC-V system calls work?',
        answer: 'RISC-V Linux system calls use the ecall instruction. The syscall number goes in a7, arguments in a0-a5, and the return value comes back in a0. ecall traps to the kernel, which executes the system call and returns to user space.'
      },
      {
        question: 'What are RISC-V privilege levels?',
        answer: 'RISC-V defines three privilege levels: User (U) for applications, Supervisor (S) for OS kernels, and Machine (M) for firmware/hypervisors. Each level has its own registers and memory protection. This enables virtualization and security isolation.'
      }
    ],
    summary: [
      'RISC-V is an open, modern, clean RISC standard.',
      'Modular extensions tailor the ISA to microcontrollers, desktops, and supercomputers.',
      'x0 hardwired to zero simplifies many operations.',
      'No condition codes: branches compare registers directly.',
      'ecall is the RISC-V system call instruction.',
      'Modular design enables customization for specific applications.',
      'Growing ecosystem with Linux, GCC, LLVM support.',
      'RISC-V is gaining traction in industry and education.'
    ]
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
      'Survey historical architectures: SPARC register windows, PowerPC condition fields, AVR 8-bit.',
      'Understand MIPS pipeline and branch delay slots.',
      'Compare MIPS with modern RISC architectures.',
      'Learn about embedded architectures (AVR, PIC, MSP430).',
      'Study SPARC register windows and VLIW architectures.'
    ],
    prerequisites: ['Chapters 1–22, 45, 46'],
    keyConcepts: [
      'MIPS: Microprocessor without Interlocked Pipelined Stages.',
      'Branch delay slot: Instruction after branch executes before jump takes effect.',
      'SPARC: Scalable Processor Architecture with register windows.',
      'PowerPC: Performance Optimization With Enhanced RISC Performance Computing.',
      'AVR: Advanced Virtual RISC (8-bit microcontrollers).',
      'VLIW: Very Long Instruction Word (EPIC, Itanium).',
      'Delay slots: Architectural trade-off for pipeline efficiency.',
      'Register windows: Reduce memory traffic for function calls.'
    ],
    diagramType: 'mips_architecture',
    sections: [
      {
        id: 'sec-47-1',
        title: '47.1 MIPS Architecture Overview',
        content: `MIPS pioneered many concepts in modern processor design.

### Why MIPS Matters?
• Pioneered RISC concepts (delay slots, pipelining)
• Dominated embedded systems (routers, game consoles)
• Clean, elegant design
• Educational standard for computer architecture

### MIPS32 Register Set
| Register | Number | Purpose | Description |
|----------|--------|---------|-------------|
| $zero | $0 | Hardwired zero | Always 0 |
| $at | $1 | Assembler temp | Reserved for assembler |
| $v0-$v1 | $2-$3 | Values | Function returns |
| $a0-$a3 | $4-$7 | Arguments | Function arguments |
| $t0-$t9 | $8-$15, $24-$25 | Temporaries | Caller-saved |
| $s0-$s7 | $16-$23 | Saved | Callee-saved |
| $gp | $28 | Global pointer | Global data |
| $sp | $29 | Stack pointer | Stack |
| $fp | $30 | Frame pointer | Stack frame |
| $ra | $31 | Return address | Function return |

### Key MIPS Features
1. **Branch delay slot**: Instruction after branch executes
2. **Load delay slot**: Instruction after load cannot use result immediately
3. **No condition codes**: Compare instructions set GPRs
4. **Fixed 32-bit instructions**: Simple decoding
5. **Harvard architecture**: Separate instruction/data caches

### MIPS Pipeline (Classic 5-stage)
1. **IF**: Instruction Fetch
2. **ID**: Instruction Decode / Register Read
3. **EX**: Execute / Address Calculation
4. **MEM**: Memory Access
5. **WB**: Write Back

### Branch Delay Slot Trade-off
mips
# Branch delay slot: instruction AFTER branch executes
beq $a0, $a1, target
nop                  # Delay slot (often nop)

# Or use useful instruction:
beq $a0, $a1, target
add $v0, $a0, $a1   # Delay slot (useful work)


### Why Delay Slots Exist
In early pipelined processors, by the time the branch condition was evaluated, the next instruction had already been fetched. Instead of flushing the pipeline, MIPS architecturally executes the delay slot instruction.

### MIPS System Calls (Linux O32)
| Number | Name | Arguments |
|--------|------|-----------|
| 4004 | write | $a0=fd, $a1=buf, $a2=len |
| 4003 | read | $a0=fd, $a1=buf, $a2=len |
| 4001 | exit | $a0=status |
| 4005 | open | $a0=pathname, $a1=flags |`,
        codeSnippets: [
          {
            language: 'mips',
            title: 'MIPS32 Hello World',
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
      },
      {
        id: 'sec-47-2',
        title: '47.2 MIPS Instruction Set',
        content: `MIPS uses fixed-length 32-bit instructions with 3-operand format.

### Instruction Formats (MIPS)
| Format | Usage | Layout |
|--------|-------|--------|
| R-type | Register | op[31:26] rs[25:21] rt[20:16] rd[15:11] shamt[10:6] funct[5:0] |
| I-type | Immediate | op[31:26] rs[25:21] rt[20:16] imm[15:0] |
| J-type | Jump | op[31:26] addr[25:0] |

### Arithmetic Instructions
mips
# Register-register (R-type)
add  $t0, $t1, $t2    # $t0 = $t1 + $t2 (trap on overflow)
addu $t0, $t1, $t2    # $t0 = $t1 + $t2 (no trap)
sub  $t0, $t1, $t2    # $t0 = $t1 - $t2
subu $t0, $t1, $t2    # $t0 = $t1 - $t2 (no trap)
and  $t0, $t1, $t2    # $t0 = $t1 & $t2
or   $t0, $t1, $t2    # $t0 = $t1 | $t2
xor  $t0, $t1, $t2    # $t0 = $t1 ^ $t2
nor  $t0, $t1, $t2    # $t0 = ~($t1 | $t2)
slt  $t0, $t1, $t2    # $t0 = ($t1 < $t2) ? 1 : 0
sltu $t0, $t1, $t2    # $t0 = ($t1 < $t2) ? 1 : 0 (unsigned)

# Shifts
sll  $t0, $t1, 5      # $t0 = $t1 << 5
srl  $t0, $t1, 5      # $t0 = $t1 >> 5 (logical)
sra  $t0, $t1, 5      # $t0 = $t1 >> 5 (arithmetic)
sllv $t0, $t1, $t2    # $t0 = $t1 << $t2
srlv $t0, $t1, $t2    # $t0 = $t1 >> $t2

# Multiply/Divide
mult $t0, $t1          # HI:LO = $t0 * $t1 (signed)
multu $t0, $t1         # HI:LO = $t0 * $t1 (unsigned)
div  $t0, $t1          # LO = $t0 / $t1, HI = $t0 % $t1
divu $t0, $t1          # LO = $t0 / $t1, HI = $t0 % $t1 (unsigned)
mfhi $t0               # Move from HI
mflo $t0               # Move from LO


### Load/Store Instructions
mips
# Load (I-type)
lb   $t0, 0($t1)      # Load byte (sign-extended)
lbu  $t0, 0($t1)      # Load byte unsigned
lh   $t0, 0($t1)      # Load halfword (16-bit)
lhu  $t0, 0($t1)      # Load halfword unsigned
lw   $t0, 0($t1)      # Load word (32-bit)
lwl  $t0, 0($t1)      # Load word left (unaligned)
lwr  $t0, 0($t1)      # Load word right (unaligned)

# Store (S-type)
sb   $t0, 0($t1)      # Store byte
sh   $t0, 0($t1)      # Store halfword
sw   $t0, 0($t1)      # Store word
swl  $t0, 0($t1)      # Store word left
swr  $t0, 0($t1)      # Store word right

# Example: Load/Store with offset
lw   $t0, 8($sp)      # Load word from sp+8
sw   $t0, 12($sp)     # Store word to sp+12


### Branch Instructions (I-type)
mips
# Branch on condition
beq  $t0, $t1, label  # Branch if $t0 == $t1
bne  $t0, $t1, label  # Branch if $t0 != $t1
blez $t0, label       # Branch if $t0 <= 0
bgtz $t0, label       # Branch if $t0 > 0
bltz $t0, label       # Branch if $t0 < 0
bgez $t0, label       # Branch if $t0 >= 0

# Jump (J-type)
j    label            # Jump to label
jal  label            # Jump and link (call)
jr   $ra              # Jump to register (return)
jalr $ra, $t0         # Jump and link register

# Compare and branch (pseudo-instructions)
beqz $t0, label       # Branch if $t0 == 0
bnez $t0, label       # Branch if $t0 != 0
blt  $t0, $t1, label  # Branch if $t0 < $t1 (pseudo)
bge  $t0, $t1, label  # Branch if $t0 >= $t1 (pseudo)


### Delay Slot Handling
mips
# Bad: Delay slot contains instruction that affects branch
add $t0, $t1, $t2
beq $t0, $zero, target
sub $t0, $t1, $t2   # Delay slot modifies $t0!

# Good: Delay slot contains useful instruction
beq $a0, $a1, target
add $v0, $a0, $a1   # Delay slot does useful work

# Or use nop (assembler fills delay slot)
beq $a0, $a1, target
nop                  # Safe but wastes cycle
`,
        codeSnippets: [
          {
            language: 'mips',
            title: 'MIPS Instruction Examples',
            code: `.section .text
.global _start

_start:
    # Load immediate values
    li $t0, 10           # $t0 = 10
    li $t1, 20           # $t1 = 20
    
    # Arithmetic
    add $t2, $t0, $t1    # $t2 = 30
    sub $t3, $t1, $t0    # $t3 = 10
    mult $t0, $t1        # HI:LO = 200
    mflo $t4             # $t4 = 200
    
    # Logical
    and $t5, $t0, $t1    # Bitwise AND
    or  $t6, $t0, $t1    # Bitwise OR
    xor $t7, $t0, $t1    # Bitwise XOR
    
    # Shifts
    sll $t0, $t0, 3      # Left shift by 3
    srl $t1, $t1, 1      # Right shift by 1
    
    # Load/Store
    la  $t3, data        # Get address
    lw  $t4, 0($t3)      # Load word
    addi $t4, $t4, 1     # Increment
    sw  $t4, 0($t3)      # Store word
    
    # Branch (with delay slot)
    beq $t0, $t1, equal
    nop                  # Delay slot
    
    bne $t0, $t1, not_equal
    nop
    
equal:
    # $t0 == $t1
    j done
    
not_equal:
    # $t0 != $t1
    
done:
    # Exit
    li $v0, 4001
    li $a0, 0
    syscall

.section .data
data:
    .word 42`
          }
        ]
      },
      {
        id: 'sec-47-3',
        title: '47.3 Other Architectures',
        content: `Survey of other important architectures.

### SPARC (Scalable Processor Architecture)
• Register windows: Overlapping register sets for fast context switch
• Used in: Sun/Oracle servers, embedded systems
• Features: Delay slots, condition codes (ICC, XCC)

sparc
# SPARC register window example
save %sp, -96, %sp    # Create new register window
...                    # Function body
restore               # Restore previous window


### PowerPC
• Big-endian by default (configurable)
• Condition register field (CR0-CR7)
• Used in: Game consoles (Wii, Xbox 360), embedded
• Features: Link register, count register

powerpc
# PowerPC example
add r3, r4, r5        # r3 = r4 + r5
bctrl                 # Branch to count register (call)
mflr r0               # Move from link register


### AVR (8-bit Microcontrollers)
• Harvard architecture (separate program/data)
• Used in: Arduino, embedded systems
• Features: Limited registers (R0-R31), I/O ports

avr
; AVR assembly example
ldi r16, 42           ; Load immediate
out PORTB, r16        ; Output to port
in r17, PINB          ; Input from port


### MSP430 (16-bit Ultra-Low-Power)
• RISC architecture for ultra-low power
• Used in: TI LaunchPad, sensors
• Features: 16 registers, simple instruction set

msp430
; MSP430 assembly example
mov.w #0x0200, SP     ; Initialize stack pointer
mov.w #0x0001, &P1OUT ; Set output bit


### VLIW/EPIC (Itanium)
• Very Long Instruction Word
• Multiple operations per instruction
• Used in: Intel Itanium (IA-64)
• Features: Explicit parallelism, predication

itanium
; IA-64 (Itanium) example
(p1) add r1 = r2, r3  ; Predicate p1 controls execution
(p2) sub r4 = r5, r6


### Comparison Table
| Architecture | Bits | Registers | Endian | Features |
|-------------|------|-----------|--------|----------|
| x86-64 | 64 | 16 | Little | CISC, variable length |
| ARM64 | 64 | 31 | Little | RISC, fixed length |
| RISC-V | 64 | 31 | Little | Open, modular |
| MIPS | 32/64 | 32 | Bi | Delay slots |
| SPARC | 32/64 | 128+ | Big | Register windows |
| PowerPC | 32/64 | 32 | Big | Condition fields |
| AVR | 8 | 32 | Little | Harvard, embedded |`,
        codeSnippets: [
          {
            language: 'mips',
            title: 'MIPS Delay Slot Example',
            code: `.section .text
.global _start

_start:
    # Load values
    li $t0, 10
    li $t1, 20
    
    # Branch with delay slot
    beq $t0, $t1, equal
    add $t2, $t0, $t1   # Delay slot: executes before branch!
    
    # Not equal path
    li $v0, 4004
    li $a0, 1
    la $a1, msg_ne
    li $a2, len_ne
    syscall
    j exit
    
equal:
    li $v0, 4004
    li $a0, 1
    la $a1, msg_eq
    li $a2, len_eq
    syscall
    
exit:
    li $v0, 4001
    li $a0, 0
    syscall

.section .data
msg_eq:
    .ascii "Equal\\n"
    len_eq = . - msg_eq
msg_ne:
    .ascii "Not Equal\\n"
    len_ne = . - msg_ne`
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
      },
      {
        id: 'ex-47-2',
        title: 'Exercise 47.2: MIPS Recursive Factorial',
        description: 'Implement factorial in MIPS32 assembly.',
        solution: 'Use $ra for return address, $s0 for saved argument. Base case: n<=1 return 1. Recursive: save n, call factorial(n-1), multiply n*result. Save/restore $ra and $s0 on stack.'
      },
      {
        id: 'ex-47-3',
        title: 'Exercise 47.3: SPARC Register Windows',
        description: 'Explain how SPARC register windows work for function calls.',
        solution: 'SPARC has overlapping register windows. save instruction shifts window (new locals/globals), restore shifts back. This avoids saving registers to memory for most function calls, speeding up context switches.'
      },
      {
        id: 'ex-47-4',
        title: 'Exercise 47.4: Architecture Comparison',
        description: 'Compare MIPS delay slots with ARM64 conditional execution.',
        solution: 'MIPS delay slots execute instruction after branch (pipeline optimization). ARM64 CSEL/conditional instructions avoid branches entirely. Different approaches to the same problem: reducing branch penalties.'
      }
    ],
    practiceQuestions: [
      {
        question: 'What is the MIPS branch delay slot?',
        answer: 'In early pipelined architectures, the instruction following a branch had already been fetched by the time the branch condition was evaluated. Rather than flush the pipeline, MIPS architecturally executes the instruction in the delay slot before jumping. This saves a cycle but complicates programming.'
      },
      {
        question: 'Why do MIPS delay slots exist?',
        answer: 'Delay slots exist to avoid pipeline flushes when branches are taken. In a 5-stage pipeline, by the time the branch condition is resolved (stage 3), the next instruction is already fetched (stage 1). Instead of discarding it, MIPS executes it, saving a cycle on taken branches.'
      },
      {
        question: 'How do SPARC register windows improve performance?',
        answer: 'SPARC register windows provide overlapping register sets for function calls. When a function is called, a new window is created with fresh registers, avoiding memory saves. The called function gets new local registers while sharing argument registers with the caller. This reduces memory traffic for function calls.'
      },
      {
        question: 'What is the difference between MIPS and RISC-V?',
        answer: 'Key differences: MIPS has delay slots (RISC-V does not), MIPS has dedicated HI/LO registers for multiply (RISC-V uses general registers), MIPS has 32 registers with $zero, RISC-V has 32 with x0. RISC-V is open-source and modular, MIPS is proprietary with fixed features.'
      },
      {
        question: 'How do embedded architectures like AVR differ from desktop CPUs?',
        answer: 'Embedded architectures: (1) Smaller register set (AVR: 32 8-bit), (2) Limited memory (KB vs GB), (3) Lower clock speeds (MHz vs GHz), (4) Power efficiency critical, (5) Often Harvard architecture (separate program/data), (6) Simple instruction sets for small decoders.'
      },
      {
        question: 'What is VLIW and why is it used?',
        answer: 'VLIW (Very Long Instruction Word) encodes multiple operations in a single large instruction word. The compiler statically schedules parallel operations.优点: Simple hardware (no dynamic scheduling), deterministic timing. 缺点: Code bloat, compiler complexity, poor for dynamic execution.'
      }
    ],
    summary: [
      'MIPS pioneered RISC concepts and influenced modern architectures.',
      'Branch delay slots are a pipeline trade-off for performance.',
      'SPARC register windows accelerate function calls.',
      'PowerPC uses condition register fields for efficient branching.',
      'AVR and MSP430 serve ultra-low-power embedded applications.',
      'Understanding historical architectures enriches systems engineering.',
      'Each architecture embodies different engineering trade-offs.',
      'Architecture choice depends on application requirements.'
    ]
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
      'Make informed hardware and ISA architectural selections for technical projects.',
      'Understand historical evolution of processor architectures.',
      'Analyze performance vs power vs code density trade-offs.',
      'Evaluate architecture choice for specific applications.',
      'Study future trends in processor architecture design.'
    ],
    prerequisites: ['Chapters 1–47'],
    keyConcepts: [
      'CISC vs RISC: Variable vs fixed-length instructions.',
      'x86-64 maximizes code density with variable-length CISC instructions.',
      'ARM64 and RISC-V maximize power efficiency and decoder throughput with clean 32-bit RISC words.',
      'Register counts dictate memory traffic and instruction field encoding.',
      'Trade-offs: code density vs decoder complexity vs power vs performance.',
      'Architecture choice depends on application requirements.',
      'Legacy compatibility vs modern design trade-offs.',
      'Future trends: chiplets, domain-specific architectures.'
    ],
    diagramType: 'isa_comparison',
    sections: [
      {
        id: 'sec-48-1',
        title: '48.1 The Grand Architectural Matrix',
        content: `Comprehensive side-by-side comparison of the 4 major architectures:

### Instruction Set Philosophy
| Aspect | x86-64 | ARM64 | RISC-V | MIPS |
|--------|--------|-------|--------|------|
| Design | CISC | RISC | RISC | RISC |
| Instruction size | Variable (1-15 bytes) | Fixed (4 bytes) | Fixed (4 bytes) | Fixed (4 bytes) |
| Instruction count | 1000+ | ~200 | ~50 base | ~100 |
| Decoder complexity | High | Low | Very Low | Low |
| Code density | Excellent | Good | Good | Good |
| Power efficiency | Lower | High | High | High |

### Register Comparison
| Feature | x86-64 | ARM64 | RISC-V | MIPS |
|---------|--------|-------|--------|------|
| General registers | 16 | 31 | 31 | 32 |
| Zero register | None (XOR) | XZR | x0 | $zero |
| Argument registers | RDI,RSI,RDX,RCX,R8,R9 | X0-X7 | a0-a7 | $a0-$a3 |
| Callee-saved | RBX,RBP,R12-R15 | X19-X28 | s0-s11 | $s0-$s7 |
| Return address | Stack (push/pop) | X30 (LR) | ra | $ra |
| Condition codes | RFLAGS | PSTATE | None | None |

### Memory Access Patterns
| Feature | x86-64 | ARM64 | RISC-V | MIPS |
|---------|--------|-------|--------|------|
| Addressing modes | Many (base+idx*scale+disp) | Few (base+offset) | Very Few (base+offset) | Few (base+offset) |
| Memory operands | In any instruction | Load/Store only | Load/Store only | Load/Store only |
| Alignment | Not required | Recommended | Recommended | Required |
| Atomic operations | LOCK prefix | LDXR/STXR | LR/SC | LL/SC |

### Control Flow
| Feature | x86-64 | ARM64 | RISC-V | MIPS |
|---------|--------|-------|--------|------|
| Condition handling | RFLAGS (all instructions) | PSTATE (compare only) | Direct compare branches | Direct compare branches |
| Conditional move | CMOV | CSEL | None (use branches) | None (use branches) |
| Indirect jump | JMP [addr] | BR x0 | jr | jr |
| Function call | CALL (pushes RIP) | BL (stores in LR) | jal (stores in ra) | jal (stores in $ra) |
| Return | RET (pops RIP) | RET (branches to LR) | ret (jr ra) | jr $ra |
| Delay slots | No | No | No | Yes (1 instruction) |

### System Calls
| Feature | x86-64 | ARM64 | RISC-V | MIPS |
|---------|--------|-------|--------|------|
| Instruction | syscall | svc #0 | ecall | syscall |
| Number register | RAX | X8 | a7 | $v0 |
| Arguments | RDI,RSI,RDX,R10,R8,R9 | X0-X5 | a0-a5 | $a0-$a3 |
| Return | RAX | X0 | a0 | $v0 |
| Linux numbers | 1,2,3... | 64,63,93... | 64,63,93... | 4004,4003,4001... |

### Power Efficiency Ranking (Best to Worst)
1. **RISC-V**: Minimalist design, open-source
2. **ARM64**: Optimized for mobile, good performance/watt
3. **MIPS**: Simple RISC, efficient
4. **x86-64**: Complex decoder, higher power

### Code Density Ranking (Best to Worst)
1. **x86-64**: Variable-length instructions (1-15 bytes)
2. **ARM64**: Fixed 4-byte instructions
3. **RISC-V**: Fixed 4-byte (or 2-byte with C extension)
4. **MIPS**: Fixed 4-byte instructions

### When to Use Each Architecture
| Use Case | Recommended | Reason |
|----------|-------------|--------|
| Desktop/Server | x86-64 | Compatibility, software ecosystem |
| Mobile/Embedded | ARM64 | Power efficiency, ecosystem |
| IoT/Microcontrollers | RISC-V | Open, customizable, low power |
| Legacy embedded | MIPS | Simple, low cost |
| Cloud servers | ARM64/RISC-V | Power/cost efficiency |
| High-performance | x86-64 | Maximum performance |
| Custom hardware | RISC-V | Open, extensible |`,
        codeSnippets: []
      },
      {
        id: 'sec-48-2',
        title: '48.2 Code Comparison Across Architectures',
        content: `Same operations implemented in all 4 architectures.

### Hello World Comparison
All architectures implement write(1, msg, len) and exit(0):

**x86-64:**
asm
mov rax, 1      ; sys_write
mov rdi, 1      ; fd
mov rsi, msg    ; buf
mov rdx, len    ; count
syscall

mov rax, 60     ; sys_exit
xor rdi, rdi    ; status
syscall


**ARM64:**

mov x0, #1      ; fd
adr x1, msg     ; buf
mov x2, #len    ; count
mov x8, #64     ; sys_write
svc #0

mov x0, #0      ; status
mov x8, #93     ; sys_exit
svc #0


**RISC-V:**
riscv
li a0, 1        # fd
la a1, msg      # buf
li a2, len      # count
li a7, 64       # sys_write
ecall

li a0, 0        # status
li a7, 93       # sys_exit
ecall


**MIPS:**
mips
li $v0, 4004    # sys_write
li $a0, 1       # fd
la $a1, msg     # buf
li $a2, len     # count
syscall

li $v0, 4001    # sys_exit
li $a0, 0       # status
syscall


### Fibonacci Comparison
All architectures compute Fibonacci(10):

**x86-64:**
asm
fib:
    xor eax, eax
    mov ecx, 10
.loop:
    add eax, 1
    loop .loop
    ret


**ARM64:**

fib:
    mov w0, #0
    mov w1, #1
    mov w2, #10
.loop:
    add w0, w0, w1
    subs w2, w2, #1
    b.ne .loop
    ret


**RISC-V:**
riscv
fib:
    li a0, 0
    li a1, 1
    li a2, 10
.loop:
    add a0, a0, a1
    addi a2, a2, -1
    bnez a2, .loop
    ret


**MIPS:**
mips
fib:
    li $v0, 0
    li $v1, 1
    li $t0, 10
loop:
    add $v0, $v0, $v1
    addi $t0, $t0, -1
    bnez $t0, loop
    jr $ra


### String Length Comparison
All architectures compute strlen:

**x86-64:**
asm
strlen:
    xor eax, eax
.loop:
    cmp byte [rdi+rax], 0
    je .done
    inc eax
    jmp .loop
.done:
    ret


**ARM64:**

strlen:
    mov x2, x0
.loop:
    ldrb w1, [x2], #1
    cbnz w1, .loop
    sub x0, x2, x0
    ret


**RISC-V:**
riscv
strlen:
    li a1, 0
.loop:
    lb a2, 0(a0)
    addi a0, a0, 1
    addi a1, a1, 1
    bnez a2, .loop
    addi a0, a1, -1
    ret


**MIPS:**
mips
strlen:
    li $v0, 0
loop:
    lb $t0, 0($a0)
    addi $a0, $a0, 1
    addi $v0, $v0, 1
    bnez $t0, loop
    addi $v0, $v0, -1
    jr $ra
`,
        codeSnippets: []
      },
      {
        id: 'sec-48-3',
        title: '48.3 Architecture Selection Guide',
        content: `How to choose the right architecture for your project.

### Decision Factors
1. **Power budget**: Battery-powered vs wall-powered
2. **Performance needs**: Real-time vs throughput
3. **Code size**: Flash memory constraints
4. **Software ecosystem**: OS support, toolchains
5. **Cost**: Licensing, development tools
6. **Legacy support**: Existing codebase compatibility
7. **Team expertise**: Developer knowledge
8. **Time-to-market**: Available tools/libraries

### Application-Specific Recommendations

**Mobile Devices:**
• **ARM64**: Dominant, excellent power efficiency
• **RISC-V**: Emerging, customizable for specific needs
• Avoid x86-64 (power too high)

**Embedded/IoT:**
• **ARM Cortex-M**: Excellent ecosystem, low power
• **RISC-V**: Open, no licensing fees, customizable
• **AVR/8-bit**: Very low cost, simple

**Desktop/Server:**
• **x86-64**: Maximum compatibility, performance
• **ARM64**: Growing (AWS Graviton, Apple M-series)
• **RISC-V**: Future potential

**Cloud/Data Center:**
• **ARM64**: Power/cost efficiency (Graviton)
• **x86-64**: Legacy, maximum performance
• **RISC-V**: Emerging for specific workloads

**High-Performance Computing:**
• **x86-64**: Maximum single-thread performance
• **ARM64**: Power efficiency for scale-out
• **GPU/TPU**: Parallel workloads

**Custom Hardware:**
• **RISC-V**: Open, extensible, no royalties
• **MIPS**: Simple, low licensing cost
• Avoid x86-64 (complex, expensive licensing)

### Migration Considerations
| From | To | Difficulty | Reason |
|------|----|------------|--------|
| x86-64 | ARM64 | Medium | Different ISA, but mature toolchain |
| x86-64 | RISC-V | Hard | Less mature ecosystem |
| ARM64 | RISC-V | Easy | Similar RISC philosophy |
| MIPS | RISC-V | Easy | Similar design principles |
| 8-bit AVR | ARM Cortex-M | Medium | 32-bit vs 8-bit differences |

### Future Trends
1. **Chiplets**: Mix different architectures in one package
2. **Domain-specific**: Custom accelerators (AI, crypto)
3. **Heterogeneous**: Big.LITTLE style (ARM)
4. **Open-source**: RISC-V adoption growing
5. **Security**: Hardware security features (MTE, CHERI)
6. **Power efficiency**: Always improving

### Key Takeaways
• No single architecture wins everywhere
• Match architecture to application requirements
• Consider total cost (licensing, development, maintenance)
• Ecosystem maturity matters as much as technical merit
• RISC-V is disrupting traditional proprietary architectures`,
        codeSnippets: []
      }
    ],
    exercises: [
      {
        id: 'ex-48-1',
        title: 'Exercise 48.1: Write a = b + c in all 4 architectures',
        description: 'Provide the single instruction expression in x86-64, ARM64, RISC-V, and MIPS.',
        solution: 'x86-64: add rax, rbx (if rax holds b)\nARM64: add x0, x1, x2\nRISC-V: add a0, a1, a2\nMIPS: addu $v0, $a0, $a1',
        solutionLanguage: 'nasm'
      },
      {
        id: 'ex-48-2',
        title: 'Exercise 48.2: Architecture Selection',
        description: 'You need to design a battery-powered IoT sensor. Which architecture do you choose and why?',
        solution: 'ARM Cortex-M4/M33 or RISC-V (e.g., SiFive FE310). Reasons: (1) Ultra-low power, (2) Small code size, (3) Adequate performance for sensors, (4) Mature toolchains, (5) Low cost. ARM has better ecosystem; RISC-V has no licensing fees.'
      },
      {
        id: 'ex-48-3',
        title: 'Exercise 48.4: Code Density Analysis',
        description: 'Compare the code size of a simple loop across all 4 architectures.',
        solution: 'x86-64: ~15 bytes (variable length)\nARM64: ~16 bytes (4 instructions × 4 bytes)\nRISC-V: ~16 bytes (4 instructions × 4 bytes)\nMIPS: ~16 bytes (4 instructions × 4 bytes)\nx86-64 wins on code density due to variable-length instructions.'
      }
    ],
    practiceQuestions: [
      {
        question: 'Why does x86-64 have higher code density than RISC-V or ARM64?',
        answer: 'x86 instructions are variable-length (1 to 15 bytes) and allow memory operands directly in arithmetic instructions (like add rax, [rbx]), doing in 1 instruction what requires 2 or 3 instructions in RISC load/store architectures. This makes x86 code more compact, which matters for instruction cache efficiency.'
      },
      {
        question: 'What are the trade-offs between CISC and RISC?',
        answer: 'CISC (x86): Higher code density, complex decoder, more power. RISC (ARM/RISC-V): Simpler decoder, lower power, more instructions needed. Modern x86 internally translates to micro-ops (RISC-like). RISC wins on power efficiency; CISC wins on code density and legacy support.'
      },
      {
        question: 'How does register count affect architecture design?',
        answer: 'More registers reduce memory traffic (fewer spills/fills) but increase instruction encoding bits (more register specifiers). ARM64/RISC-V (31 regs) reduce memory access vs x86-64 (16 regs) but need more bits per instruction. Trade-off between code density and performance.'
      },
      {
        question: 'Why is RISC-V gaining popularity?',
        answer: 'RISC-V benefits: (1) No licensing fees, (2) Open standard, (3) Modular/extensible, (4) Clean design without legacy baggage, (5) Growing ecosystem (Linux, GCC), (6) Industry adoption (SiFive, Espressif), (7) Customizable for domain-specific applications.'
      },
      {
        question: 'How do you choose between ARM64 and RISC-V for a new project?',
        answer: 'Choose ARM64 for: mature ecosystem, proven in mobile/server, extensive toolchain/libraries. Choose RISC-V for: no licensing fees, customizable ISA, emerging ecosystem, long-term flexibility, custom accelerators. ARM64 is safer now; RISC-V may be better for custom/embedded long-term.'
      },
      {
        question: 'What role does software ecosystem play in architecture choice?',
        answer: 'Software ecosystem is critical: (1) Compiler support (GCC, LLVM), (2) OS support (Linux, RTOS), (3) Libraries and frameworks, (4) Developer tools (debuggers, profilers), (5) Community support, (6) Available developers. A technically superior architecture can fail without ecosystem support.'
      }
    ],
    summary: [
      'Each ISA embodies deliberate engineering trade-offs.',
      'Universal concepts—registers, stacks, control flow—unify all computer architectures.',
      'x86-64 excels in code density and compatibility.',
      'ARM64 excels in power efficiency and mobile ecosystems.',
      'RISC-V excels in openness and customizability.',
      'Architecture choice depends on application requirements.',
      'Software ecosystem matters as much as hardware merit.',
      'Understanding trade-offs enables informed architectural decisions.'
    ]
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
      'Implement a cross-platform portable strlen routine.',
      'Understand portable assembly design principles.',
      'Learn macro techniques for cross-platform code.',
      'Study build system integration for multi-architecture projects.',
      'Explore testing and validation strategies.'
    ],
    prerequisites: ['Chapters 1–48'],
    keyConcepts: [
      'Conditional compilation: #ifdef selects target-specific code at build time.',
      'Macros: Abstract register names and opcode mnemonics.',
      'System call abstractions: Bridge differences in syscall numbers and invocation.',
      'Build systems: Makefile, CMake for multi-architecture builds.',
      'Testing: Cross-compilation and emulation for validation.',
      'Portability vs performance: Trade-offs in abstraction layers.',
      'ABI compatibility: Ensure consistent calling conventions.',
      'Documentation: Essential for portable assembly projects.'
    ],
    diagramType: 'portable_assembly',
    sections: [
      {
        id: 'sec-49-1',
        title: '49.1 Portable Assembly Design Principles',
        content: `Writing assembly that works across multiple architectures requires careful abstraction.

### Design Principles
1. **Separate platform-specific code**: Use #ifdef for different architectures
2. **Abstract register names**: Define macros for common registers
3. **Create function wrappers**: Consistent API across platforms
4. **Use portable data types**: Fixed-width types (uint32_t, int64_t)
5. **Document assumptions**: Architecture-specific behaviors
6. **Test thoroughly**: Validate on all target platforms

### Why Portable Assembly?
• Single codebase for multiple architectures
• Reduced maintenance burden
• Easier testing and validation
• Leverages architecture-specific optimizations
• Enables cross-platform libraries

### Challenges
1. **Different instruction sets**: x86 CISC vs ARM/RISC-V MIPS
2. **Register naming**: Different names across architectures
3. **Calling conventions**: Different argument passing rules
4. **System calls**: Different numbers and invocation methods
5. **Data types**: Size differences (32-bit vs 64-bit)
6. **Endianness**: Little vs big endian

### Solutions
1. **Preprocessor macros**: #ifdef for architecture detection
2. **Register abstraction**: Define portable register names
3. **Function wrappers**: Consistent API with arch-specific implementations
4. **System call layer**: Abstract syscall differences
5. **Type definitions**: Use stdint.h types
6. **Byte order macros**: Check endianness at compile time

### Project Structure

project/
├── include/
│   ├── asm/
│   │   ├── x86_64/
│   │   │   └── asm.h
│   │   ├── aarch64/
│   │   │   └── asm.h
│   │   └── riscv/
│   │       └── asm.h
│   └── portable.h
├── src/
│   ├── x86_64/
│   │   └── syscall_x86_64.S
│   ├── aarch64/
│   │   └── syscall_aarch64.S
│   ├── riscv/
│   │   └── syscall_riscv.S
│   └── portable/
│       └── strlen.S
└── Makefile
`,
        codeSnippets: []
      },
      {
        id: 'sec-49-2',
        title: '49.2 Conditional Compilation and Macros',
        content: `Using C preprocessor for architecture-specific code.

### Architecture Detection Macros
GCC/Clang provide predefined macros:
c
#if defined(__x86_64__)
    // x86-64 code
#elif defined(__aarch64__)
    // ARM64 code
#elif defined(__riscv) && (__riscv_xlen == 64)
    // RISC-V 64-bit code
#elif defined(__mips__)
    // MIPS code
#else
    #error "Unsupported architecture"
#endif


### Register Abstraction Macros
c
// x86-64
#define REG_A  rax
#define REG_B  rbx
#define REG_C  rcx
#define REG_D  rdx
#define REG_DI rdi
#define REG_SI rsi

// ARM64
#define REG_A  x0
#define REG_B  x1
#define REG_C  x2
#define REG_D  x3
#define REG_DI x0
#define REG_SI x1

// RISC-V
#define REG_A  a0
#define REG_B  a1
#define REG_C  a2
#define REG_D  a3
#define REG_DI a0
#define REG_SI a1


### Instruction Abstraction Macros
c
// Return instruction
#if defined(__x86_64__)
    #define RET ret
#elif defined(__aarch64__)
    #define RET ret
#elif defined(__riscv)
    #define RET ret
#endif

// Load immediate
#if defined(__x86_64__)
    #define LI(reg, imm) mov reg, imm
#elif defined(__aarch64__)
    #define LI(reg, imm) mov reg, #imm
#elif defined(__riscv)
    #define LI(reg, imm) li reg, imm
#endif

// System call
#if defined(__x86_64__)
    #define SYSCALL syscall
#elif defined(__aarch64__)
    #define SYSCALL svc #0
#elif defined(__riscv)
    #define SYSCALL ecall
#endif


### Function Prologue/Epilogue Macros
c
// Function prologue
#if defined(__x86_64__)
    #define FUNC_PROLOGUE \
        push rbp; \
        mov rbp, rsp
#elif defined(__aarch64__)
    #define FUNC_PROLOGUE \
        stp x29, x30, [sp, #-16]!; \
        mov x29, sp
#elif defined(__riscv)
    #define FUNC_PROLOGUE \
        addi sp, sp, -16; \
        sd ra, 8(sp); \
        sd s0, 0(sp)
#endif

// Function epilogue
#if defined(__x86_64__)
    #define FUNC_EPILOGUE \
        pop rbp; \
        ret
#elif defined(__aarch64__)
    #define FUNC_EPILOGUE \
        ldp x29, x30, [sp], #16; \
        ret
#elif defined(__riscv)
    #define FUNC_EPILOGUE \
        ld s0, 0(sp); \
        ld ra, 8(sp); \
        addi sp, sp, 16; \
        ret
#endif


### Data Section Macros
c
// Data declaration
#if defined(__x86_64__) || defined(__aarch64__) || defined(__riscv)
    #define QUAD .quad
    #define WORD .word
    #define HALF .hword
    #define BYTE .byte
    #define ASCIZ .asciz
    #define ALIGN .align
#endif

// Section directives
#define SECTION_DATA .section .data
#define SECTION_TEXT .section .text
#define SECTION_BSS  .section .bss
`,
        codeSnippets: [
          {
            language: 'c',
            title: 'portable_macros.h',
            code: `#ifndef PORTABLE_ASM_MACROS_H
#define PORTABLE_ASM_MACROS_H

// Architecture detection
#if defined(__x86_64__)
    #define ARCH_X86_64 1
#elif defined(__aarch64__)
    #define ARCH_AARCH64 1
#elif defined(__riscv) && (__riscv_xlen == 64)
    #define ARCH_RISCV64 1
#else
    #error "Unsupported architecture"
#endif

// Register abstractions
#if defined(ARCH_X86_64)
    #define REG_RET    rax
    #define REG_ARG0   rdi
    #define REG_ARG1   rsi
    #define REG_ARG2   rdx
    #define REG_SP     rsp
    #define REG_FP     rbp
#elif defined(ARCH_AARCH64)
    #define REG_RET    x0
    #define REG_ARG0   x0
    #define REG_ARG1   x1
    #define REG_ARG2   x2
    #define REG_SP     sp
    #define REG_FP     x29
#elif defined(ARCH_RISCV64)
    #define REG_RET    a0
    #define REG_ARG0   a0
    #define REG_ARG1   a1
    #define REG_ARG2   a2
    #define REG_SP     sp
    #define REG_FP     s0
#endif

// Instruction abstractions
#if defined(ARCH_X86_64)
    #define INSTR_RET        ret
    #define INSTR_NOP        nop
    #define INSTR_SYSCALL    syscall
    #define INSTR_MOVE(d, s) mov d, s
#elif defined(ARCH_AARCH64)
    #define INSTR_RET        ret
    #define INSTR_NOP        nop
    #define INSTR_SYSCALL    svc #0
    #define INSTR_MOVE(d, s) mov d, s
#elif defined(ARCH_RISCV64)
    #define INSTR_RET        ret
    #define INSTR_NOP        nop
    #define INSTR_SYSCALL    ecall
    #define INSTR_MOVE(d, s) mv d, s
#endif

#endif // PORTABLE_ASM_MACROS_H`
          }
        ]
      },
      {
        id: 'sec-49-3',
        title: '49.3 Portable System Call Layer',
        content: `Abstracting system call differences across architectures.

### System Call Abstraction
c
// syscalls.h - Portable system call numbers
#ifndef SYSCALLS_H
#define SYSCALLS_H

#if defined(__x86_64__)
    #define SYS_WRITE  1
    #define SYS_READ   0
    #define SYS_EXIT   60
    #define SYS_OPEN   2
    #define SYS_CLOSE  3
#elif defined(__aarch64__)
    #define SYS_WRITE  64
    #define SYS_READ   63
    #define SYS_EXIT   93
    #define SYS_OPEN   56
    #define SYS_CLOSE  57
#elif defined(__riscv)
    #define SYS_WRITE  64
    #define SYS_READ   63
    #define SYS_EXIT   93
    #define SYS_OPEN   56
    #define SYS_CLOSE  57
#endif

// Portable syscall function
#if defined(__x86_64__)
    static inline long syscall_write(int fd, const void *buf, size_t count) {
        long ret;
        asm volatile (
            "syscall"
            : "=a" (ret)
            : "a" (SYS_WRITE), "D" (fd), "S" (buf), "d" (count)
            : "rcx", "r11", "memory"
        );
        return ret;
    }
#elif defined(__aarch64__)
    static inline long syscall_write(int fd, const void *buf, size_t count) {
        register long x0 asm("x0") = fd;
        register const void *x1 asm("x1") = buf;
        register long x2 asm("x2") = count;
        register long x8 asm("x8") = SYS_WRITE;
        asm volatile ("svc #0" : "+r" (x0) : "r" (x1), "r" (x2), "r" (x8) : "memory");
        return x0;
    }
#elif defined(__riscv)
    static inline long syscall_write(int fd, const void *buf, size_t count) {
        register long a0 asm("a0") = fd;
        register const void *a1 asm("a1") = buf;
        register long a2 asm("a2") = count;
        register long a7 asm("a7") = SYS_WRITE;
        asm volatile ("ecall" : "+r" (a0) : "r" (a1), "r" (a2), "r" (a7) : "memory");
        return a0;
    }
#endif

#endif // SYSCALLS_H


### Assembly System Call Wrapper
asm
// syscall_wrapper.S - Portable syscall wrapper
#include "portable_macros.h"

.section .text
.global portable_write
.global portable_exit

portable_write:
    FUNC_PROLOGUE
    # Arguments already in correct registers for each arch
    LI REG_RET, SYS_WRITE
    SYSCALL
    FUNC_EPILOGUE

portable_exit:
    FUNC_PROLOGUE
    LI REG_RET, SYS_EXIT
    SYSCALL
    FUNC_EPILOGUE


### Building Multi-Architecture
makefile
# Makefile for cross-compilation
CC_X86_64 = gcc
CC_AARCH64 = aarch64-linux-gnu-gcc
CC_RISCV = riscv64-linux-gnu-gcc

CFLAGS = -O2 -Wall

all: x86_64 aarch64 riscv

x86_64:
	$(CC_X86_64) $(CFLAGS) -o program_x86_64 src/*.S

aarch64:
	$(CC_AARCH64) $(CFLAGS) -o program_aarch64 src/*.S

riscv:
	$(CC_RISCV) $(CFLAGS) -o program_riscv src/*.S

clean:
	rm -f program_*


### Testing with QEMU
bash
# Run ARM64 binary on x86-64 host
qemu-aarch64 ./program_aarch64

# Run RISC-V binary on x86-64 host
qemu-riscv64 ./program_riscv

# Or use Docker with multi-arch support
docker run --rm -v $(pwd):/work -w /work arm64v8/ubuntu ./program_aarch64
`,
        codeSnippets: []
      },
      {
        id: 'sec-49-4',
        title: '49.4 Complete Portable Assembly Example',
        content: `A complete portable strlen implementation across x86-64, ARM64, and RISC-V.

### Portable strlen Design
c
// strlen.h - Portable strlen declaration
#ifndef STRLEN_H
#define STRLEN_H

#include <stddef.h>

size_t portable_strlen(const char *s);

#endif // STRLEN_H


### Architecture-Specific Implementations
asm
// strlen_x86_64.S - x86-64 implementation
.section .text
.global portable_strlen

portable_strlen:
    xor eax, eax
.loop:
    cmp byte [rdi+rax], 0
    je .done
    inc eax
    jmp .loop
.done:
    ret


asm
// strlen_aarch64.S - ARM64 implementation
.section .text
.global portable_strlen

portable_strlen:
    mov x2, x0
.loop:
    ldrb w1, [x2], #1
    cbnz w1, .loop
    sub x0, x2, x0
    ret


asm
// strlen_riscv.S - RISC-V implementation
.section .text
.global portable_strlen

portable_strlen:
    li a1, 0
.loop:
    lb a2, 0(a0)
    addi a0, a0, 1
    addi a1, a1, 1
    bnez a2, .loop
    addi a0, a1, -1
    ret


### Build System
makefile
# Makefile
CC_X86_64 = gcc
CC_AARCH64 = aarch64-linux-gnu-gcc
CC_RISCV = riscv64-linux-gnu-gcc

CFLAGS = -O2 -Wall

all: x86_64 aarch64 riscv

x86_64: strlen_x86_64.S test.c
	$(CC_X86_64) $(CFLAGS) -o test_x86_64 strlen_x86_64.S test.c

aarch64: strlen_aarch64.S test.c
	$(CC_AARCH64) $(CFLAGS) -o test_aarch64 strlen_aarch64.S test.c

riscv: strlen_riscv.S test.c
	$(CC_RISCV) $(CFLAGS) -o test_riscv strlen_riscv.S test.c

test: all
	./test_x86_64
	qemu-aarch64 ./test_aarch64
	qemu-riscv64 ./test_riscv
	@echo "All tests passed!"

clean:
	rm -f test_*


### Test Program
c
// test.c - Test portable strlen
#include <stdio.h>
#include <string.h>
#include "strlen.h"

int main() {
    const char *test_strings[] = {
        "Hello, World!",
        "",
        "Short",
        "A longer string for testing",
        NULL
    };
    
    for (int i = 0; test_strings[i] != NULL; i++) {
        size_t result = portable_strlen(test_strings[i]);
        size_t expected = strlen(test_strings[i]);
        
        if (result != expected) {
            printf("FAIL: strlen(\"%s\") = %zu, expected %zu\\n",
                   test_strings[i], result, expected);
            return 1;
        }
        printf("PASS: strlen(\"%s\") = %zu\\n", test_strings[i], result);
    }
    
    printf("All tests passed!\\n");
    return 0;
}


### Running Tests
bash
# Build and test
make test

# Cross-compile and test with QEMU
make all
qemu-aarch64 ./test_aarch64
qemu-riscv64 ./test_riscv


### Alternative: Unified Source File
asm
// strlen_portable.S - Single file with conditional compilation
#include "portable_macros.h"

.section .text
.global portable_strlen

portable_strlen:
#if defined(ARCH_X86_64)
    xor eax, eax
.loop:
    cmp byte [rdi+rax], 0
    je .done
    inc eax
    jmp .loop
.done:
    ret

#elif defined(ARCH_AARCH64)
    mov x2, x0
.loop:
    ldrb w1, [x2], #1
    cbnz w1, .loop
    sub x0, x2, x0
    ret

#elif defined(ARCH_RISCV64)
    li a1, 0
.loop:
    lb a2, 0(a0)
    addi a0, a0, 1
    addi a1, a1, 1
    bnez a2, .loop
    addi a0, a1, -1
    ret

#else
    #error "Unsupported architecture"
#endif
`,
        codeSnippets: []
      }
    ],
    exercises: [
      {
        id: 'ex-49-1',
        title: 'Exercise 49.1: Portable memset Macro',
        description: 'Define a macro that expands to rep stosb on x86-64 and a register loop on ARM64.',
        solution: `#if defined(__x86_64__)\n#define PORTABLE_MEMSET(dst, val, count) \\\n    mov rdi, dst; mov al, val; mov rcx, count; cld; rep stosb\n#elif defined(__aarch64__)\n#define PORTABLE_MEMSET(dst, val, count) \\\n    bl memset_arm64_helper\n#endif`,
        solutionLanguage: 'c'
      },
      {
        id: 'ex-49-2',
        title: 'Exercise 49.2: Portable strcmp',
        description: 'Write a portable strcmp function that works on x86-64, ARM64, and RISC-V.',
        solution: 'Use conditional compilation (#ifdef) to provide architecture-specific implementations. Each architecture loads bytes, compares, and branches. Use portable register names via macros.'
      },
      {
        id: 'ex-49-3',
        title: 'Exercise 49.3: Build System',
        description: 'Create a Makefile that cross-compiles for x86-64, ARM64, and RISC-V.',
        solution: 'Define CC_X86_64, CC_AARCH64, CC_RISCV variables. Create separate targets for each architecture. Use QEMU to test non-native architectures.'
      },
      {
        id: 'ex-49-4',
        title: 'Exercise 49-4: Portable memcpy',
        description: 'Implement a portable memcpy function across architectures.',
        solution: 'Use rep movsb (x86-64), ldp/stp loops (ARM64), or ld/sd loops (RISC-V). Handle alignment requirements for each architecture.'
      }
    ],
    practiceQuestions: [
      {
        question: 'What is the role of the C preprocessor in writing portable assembly with GNU tools?',
        answer: 'When assembly files are named with an uppercase .S extension, GCC automatically runs the C preprocessor (cpp) before assembling. This allows developers to use #include, #define, #ifdef, and architecture macros (__x86_64__, __aarch64__, __riscv) directly, enabling a single source file to target multiple architectures.'
      },
      {
        question: 'How do you test portable assembly code?',
        answer: 'Testing strategies: (1) Cross-compile for each architecture, (2) Use QEMU for emulation on x86-64 host, (3) Docker multi-architecture containers, (4) CI/CD with multiple architectures, (5) Unit tests for each function, (6) Performance benchmarks across architectures.'
      },
      {
        question: 'What are the trade-offs of portable assembly?',
        answer: 'Trade-offs: (1) Abstraction overhead vs performance, (2) Code complexity vs maintainability, (3) Testing burden vs reliability, (4) Build system complexity vs flexibility. Portable assembly adds layers but reduces duplication and maintenance.'
      },
      {
        question: 'How do you handle endianness in portable assembly?',
        answer: 'Handle endianness by: (1) Using byte-swap instructions when needed, (2) Checking endianness at compile time (#if __BYTE_ORDER__), (3) Using endian-agnostic algorithms, (4) Providing separate implementations for little/big endian, (5) Using portable data types (uint32_t).'
      },
      {
        question: 'What is the best approach for portable system calls?',
        answer: 'Best approach: (1) Define syscall numbers in header files, (2) Create wrapper functions in C with inline assembly, (3) Use architecture-specific assembly files for optimized paths, (4) Test all paths on each architecture, (5) Document syscall differences.'
      },
      {
        question: 'How do you optimize portable assembly for each architecture?',
        answer: 'Optimization techniques: (1) Use architecture-specific instructions (SIMD, crypto), (2) Exploit pipeline characteristics, (3) Optimize for cache behavior, (4) Use architecture-specific calling conventions, (5) Profile and benchmark on each target.'
      }
    ],
    summary: [
      'Portable assembly abstracts register and syscall divergence.',
      'Preprocessors enable a single codebase to support multiple hardware targets.',
      'Macros provide abstraction for registers and instructions.',
      'System call wrappers bridge architecture-specific differences.',
      'Build systems enable cross-compilation and testing.',
      'QEMU provides emulation for non-native architectures.',
      'Testing is essential for portable assembly reliability.',
      'The journey from zero to hero equips you with deep systems mastery across all major computing platforms.'
    ]
  }
];
