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
```arm
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
```

### Load/Store Instructions
```arm
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
```

### Branch Instructions
```arm
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
```

### Conditional Select (CSEL)
Branchless conditional assignments:
```arm
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
```

### Bit Manipulation
```arm
// Count leading zeros
clz x0, x1           // x0 = number of leading zeros in x1

// Bit field insert
bfi x0, x1, #0, #8   // Insert bits [7:0] of x1 into x0

// Reverse bits
rbit x0, x1          // Reverse all bits in x1
rev x0, x1           // Reverse bytes (endian swap)
````,
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
```arm
// Caller-saved (temporary) registers
// X0-X7: Arguments/return values
// X9-X15: Temporary

// Callee-saved registers
// X19-X28: Must be preserved

// Stack frame
// X29 (FP): Frame pointer
// X30 (LR): Return address
```

### Function Prologue/Epilogue
```arm
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
```

### Structure Passing
```arm
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
```

### Stack Alignment
ARM64 requires 16-byte stack alignment:
```arm
// Allocate stack frame (must be multiple of 16)
sub sp, sp, #32     // 32 is multiple of 16
// ... use stack ...
add sp, sp, #32     // Restore stack
````,
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
x86-64: `add rax, [rbx+rcx*8+16]` (4 bytes)
ARM64:
```arm
add x9, x1, x2, LSL #3    // x9 = x2 * 8
ldr x0, [x9, #16]          // Load from x9 + 16
// 8 bytes total
```

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
```riscv
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
```

### Load/Store Instructions
```riscv
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
```

### Branch Instructions (B-type)
```riscv
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
```

### Jump Instructions
```riscv
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
```

### Upper Immediate (U-type)
```riscv
lui  x1, 0x12345     # x1 = 0x12345000 (load upper 20 bits)
auipc x1, 0x12345    # x1 = PC + 0x12345000

# Common pattern for 32-bit immediate:
lui  x1, upper20     # Load upper 20 bits
addi x1, x1, lower12 # Add lower 12 bits
````,
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
```riscv
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
```

### Function Prologue/Epilogue
```riscv
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
```

### Tail Call Optimization
```riscv
# Tail call: reuse caller's stack frame
tail_call:
    ld   t0, 0(s0)      # Load function pointer
    ld   a0, 8(s0)      # Load argument
    jr   t0             # Jump to function (no return)
    # No stack frame setup needed
```

### Structure Passing
```riscv
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
```

### Stack Alignment
RISC-V requires 16-byte stack alignment:
```riscv
# Allocate stack frame (must be multiple of 16)
addi sp, sp, -32     # 32 is multiple of 16
# ... use stack ...
addi sp, sp, 32      # Restore stack
````,
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
