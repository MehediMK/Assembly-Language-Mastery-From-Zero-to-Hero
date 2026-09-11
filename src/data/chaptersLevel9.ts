import { Chapter } from '../types';

export const CHAPTERS_LEVEL_9: Chapter[] = [
  {
    "id": 45,
    "slug": "chapter-45-arm-assembly-essentials",
    "level": 9,
    "levelTitle": "Cross-Platform and Alternative Architectures",
    "title": "Chapter 45: ARM Assembly Essentials",
    "subtitle": "64-Bit ARM (AArch64), Three-Operand Syntax, CSEL, and Linux System Calls",
    "learningObjectives": [
      "Understand ARM architecture fundamentals and its RISC design principles.",
      "Master the ARM64 (AArch64) register set: x0–x30, SP, and zero register XZR.",
      "Write three-operand instructions: add x0, x1, x2.",
      "Understand ARM64 load/store addressing modes (pre/post-index, register offset).",
      "Use CSEL (Conditional Select) for branchless conditional assignments.",
      "Invoke Linux ARM64 system calls using SVC #0 (syscall number in x8).",
      "Compare ARM64 with x86-64 architecture.",
      "Understand ARM64 calling convention (AAPCS64)."
    ],
    "prerequisites": [
      "Chapters 1–22"
    ],
    "keyConcepts": [
      "ARM: Advanced RISC Machine - dominant mobile/embedded architecture.",
      "RISC load/store architecture: Only load/store access memory.",
      "31 general-purpose registers (X0-X30) + SP + XZR.",
      "Fixed 32-bit instruction width (except Thumb mode).",
      "Conditional execution via predication (CSEL, CCMP).",
      "SVC #0: Supervisor Call (system call instruction).",
      "AAPCS64: ARM64 Procedure Call Standard.",
      "Little-endian by default (configurable)."
    ],
    "diagramType": "arm_assembly",
    "sections": [
      {
        "id": "sec-45-1",
        "title": "45.1 ARM64 Architecture Overview",
        "content": "ARM64 (AArch64) is the 64-bit execution state of ARM architecture."
      },
      {
        "id": "sec-45-1-1",
        "title": "45.1.1 Why ARM64?",
        "content": "• Dominant in mobile devices (smartphones, tablets)\n• Growing in servers (AWS Graviton, Apple M-series)\n• Power-efficient design\n• Strong performance per watt"
      },
      {
        "id": "sec-45-1-2",
        "title": "45.1.2 ARM64 Register Set",
        "content": "",
        "tableData": {
          "headers": [
            "Register",
            "Purpose",
            "Description"
          ],
          "rows": [
            [
              "X0-X7",
              "Arguments/Results",
              "Function arguments, return values"
            ],
            [
              "X8",
              "Indirect Result",
              "Structure return address"
            ],
            [
              "X9-X15",
              "Temporary",
              "Caller-saved"
            ],
            [
              "X16-X17",
              "Intra-procedure",
              "Linker scratch registers"
            ],
            [
              "X18",
              "Platform",
              "Reserved for OS"
            ],
            [
              "X19-X28",
              "Callee-saved",
              "Must be preserved"
            ],
            [
              "X29 (FP)",
              "Frame Pointer",
              "Stack frame management"
            ],
            [
              "X30 (LR)",
              "Link Register",
              "Return address"
            ],
            [
              "SP",
              "Stack Pointer",
              "Stack pointer (not general purpose)"
            ],
            [
              "XZR",
              "Zero Register",
              "Always reads as 0, writes discarded"
            ]
          ]
        }
      },
      {
        "id": "sec-45-1-3",
        "title": "45.1.3 Key Differences from x86-64",
        "content": "",
        "tableData": {
          "headers": [
            "Feature",
            "x86-64",
            "ARM64"
          ],
          "rows": [
            [
              "Register count",
              "16",
              "31"
            ],
            [
              "Instruction size",
              "Variable (1-15 bytes)",
              "Fixed 32-bit"
            ],
            [
              "Operand format",
              "2-operand",
              "3-operand"
            ],
            [
              "Zero register",
              "None (use XOR)",
              "XZR"
            ],
            [
              "Memory access",
              "Any instruction",
              "Load/Store only"
            ],
            [
              "Condition codes",
              "RFLAGS",
              "PSTATE (NZCV)"
            ]
          ]
        }
      },
      {
        "id": "sec-45-1-4",
        "title": "45.1.4 ARM64 Calling Convention (AAPCS64)",
        "content": "• X0-X7: Arguments/return values\n• X8: Indirect result (struct return)\n• X9-X15: Temporary (caller-saved)\n• X19-X28: Callee-saved\n• X29 (FP): Frame pointer\n• X30 (LR): Return address"
      },
      {
        "id": "sec-45-1-5",
        "title": "45.1.5 Instruction Categories",
        "content": "1. Data Processing: ADD, SUB, AND, ORR, EOR\n2. Load/Store: LDR, STR, LDP, STP\n3. Branch: B, BL, BR, BLR, RET\n4. System: SVC, MRS, MSR\n5. SIMD/FP: FMLA, FADD, LD1, ST1"
      },
      {
        "id": "sec-45-1-6",
        "title": "45.1.6 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "ARM64 Hello World",
            "code": ".section .data\nmsg:\n    .ascii \"Hello, World!\\n\"\n    len = . - msg\n\n.section .text\n.global _start\n\n_start:\n    // write(1, msg, len)\n    mov x0, #1          // fd = 1 (stdout)\n    adr x1, msg         // load PC-relative address\n    mov x2, #len        // length\n    mov x8, #64         // syscall number for write on ARM64\n    svc #0              // invoke kernel\n\n    // exit(0)\n    mov x0, #0          // status = 0\n    mov x8, #93         // syscall number for exit on ARM64\n    svc #0"
          }
        ]
      },
      {
        "id": "sec-45-2",
        "title": "45.2 ARM64 Instruction Set",
        "content": "ARM64 uses fixed-length 32-bit instructions with 3-operand format."
      },
      {
        "id": "sec-45-2-1",
        "title": "45.2.1 Data Processing Instructions",
        "content": "",
        "codeSnippets": [
          {
            "title": "Data Processing Instructions — example",
            "language": "arm",
            "code": "// Arithmetic\nadd x0, x1, x2        // x0 = x1 + x2\nsub x0, x1, x2        // x0 = x1 - x2\nadd x0, x1, #42       // x0 = x1 + 42 (immediate)\n\n// Logical\nand x0, x1, x2        // x0 = x1 & x2\norr x0, x1, x2        // x0 = x1 | x2\neor x0, x1, x2        // x0 = x1 ^ x2\n\n// Shift\nlsl x0, x1, #3        // x0 = x1 << 3\nlsr x0, x1, #3        // x0 = x1 >> 3 (logical)\nasr x0, x1, #3        // x0 = x1 >> 3 (arithmetic)\n\n// Multiply\nmul x0, x1, x2        // x0 = x1 * x2\nmadd x0, x1, x2, x3   // x0 = x1 * x2 + x3"
          }
        ]
      },
      {
        "id": "sec-45-2-2",
        "title": "45.2.2 Load/Store Instructions",
        "content": "",
        "codeSnippets": [
          {
            "title": "Load/Store Instructions — example",
            "language": "arm",
            "code": "// Basic load/store\nldr x0, [x1]          // Load 64-bit from [x1]\nldr w0, [x1]          // Load 32-bit from [x1]\nstr x0, [x1]          // Store 64-bit to [x1]\n\n// Immediate offset\nldr x0, [x1, #8]      // Load from [x1 + 8]\nstr x0, [x1, #8]      // Store to [x1 + 8]\n\n// Register offset\nldr x0, [x1, x2]      // Load from [x1 + x2]\nldr x0, [x1, x2, LSL #3]  // Load from [x1 + x2*8]\n\n// Pre-indexed (update address)\nldr x0, [x1, #8]!     // x1 = x1 + 8, then load\n\n// Post-indexed (update after)\nldr x0, [x1], #8      // Load, then x1 = x1 + 8\n\n// Pair load/store (efficient)\nldp x0, x1, [sp]      // Load x0 from [sp], x1 from [sp+8]\nstp x0, x1, [sp, #-16]!  // sp = sp-16, store x0, x1"
          }
        ]
      },
      {
        "id": "sec-45-2-3",
        "title": "45.2.3 Branch Instructions",
        "content": "",
        "codeSnippets": [
          {
            "title": "Branch Instructions — example",
            "language": "arm",
            "code": "// Unconditional\nb label               // Branch to label\nbl label              // Branch with link (call)\nbr x0                 // Branch to address in x0\nblr x0                // Branch with link to x0\n\n// Conditional\ncbz x0, label         // Branch if x0 == 0\ncbnz x0, label        // Branch if x0 != 0\nb.eq label            // Branch if equal (Z=1)\nb.ne label            // Branch if not equal (Z=0)\nb.lt label            // Branch if less than\nb.ge label            // Branch if greater or equal\n\n// Return\nret                   // Return (branch to x30/LR)"
          }
        ]
      },
      {
        "id": "sec-45-2-4",
        "title": "45.2.4 Conditional Select (CSEL)",
        "content": "Branchless conditional assignments:",
        "codeSnippets": [
          {
            "title": "Conditional Select (CSEL) — example",
            "language": "arm",
            "code": "// max(x0, x1) -> x0\ncmp x0, x1\ncsel x0, x0, x1, ge  // if x0 >= x1, x0 = x0; else x0 = x1\n\n// min(x0, x1) -> x0\ncmp x0, x1\ncsel x0, x0, x1, le  // if x0 <= x1, x0 = x0; else x0 = x1\n\n// abs(x0) -> x0\ncmp x0, #0\ncsel x0, x0, x0, ge  // if x0 >= 0, keep; else negate\ncneg x0, x0, lt      // Conditional negate"
          }
        ]
      },
      {
        "id": "sec-45-2-5",
        "title": "45.2.5 Bit Manipulation",
        "content": "",
        "codeSnippets": [
          {
            "title": "Bit Manipulation — example",
            "language": "arm",
            "code": "// Count leading zeros\nclz x0, x1           // x0 = number of leading zeros in x1\n\n// Bit field insert\nbfi x0, x1, #0, #8   // Insert bits [7:0] of x1 into x0\n\n// Reverse bits\nrbit x0, x1          // Reverse all bits in x1\nrev x0, x1           // Reverse bytes (endian swap)"
          }
        ]
      },
      {
        "id": "sec-45-2-6",
        "title": "45.2.6 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "ARM64 Instruction Examples",
            "code": ".section .text\n.global _start\n\n_start:\n    // Data processing\n    mov x0, #10\n    mov x1, #20\n    add x2, x0, x1     // x2 = 30\n    sub x3, x1, x0     // x3 = 10\n    mul x4, x0, x1     // x4 = 200\n    \n    // Logical operations\n    and x5, x0, x1     // Bitwise AND\n    orr x6, x0, x1     // Bitwise OR\n    eor x7, x0, x1     // Bitwise XOR\n    \n    // Shift operations\n    lsl x0, x0, #2     // Left shift by 2\n    lsr x1, x1, #1     // Right shift by 1\n    \n    // Conditional select\n    cmp x0, x1\n    csel x2, x0, x1, ge  // x2 = max(x0, x1)\n    \n    // Load/Store\n    adr x3, data       // Get address\n    ldr x4, [x3]       // Load value\n    add x4, x4, #1     // Increment\n    str x4, [x3]       // Store back\n    \n    // Branch\n    b compare\n    \ncompare:\n    cmp x0, x1\n    b.eq equal\n    b.gt greater\n    b.lt less\n    \nequal:\n    // x0 == x1\n    b done\n    \ngreater:\n    // x0 > x1\n    b done\n    \nless:\n    // x0 < x1\n    \ndone:\n    // Exit\n    mov x0, #0\n    mov x8, #93\n    svc #0\n\n.section .data\ndata:\n    .quad 42"
          }
        ]
      },
      {
        "id": "sec-45-3",
        "title": "45.3 ARM64 System Calls and Calling Convention",
        "content": "Linux ARM64 system calls use SVC #0 instruction."
      },
      {
        "id": "sec-45-3-1",
        "title": "45.3.1 System Call Convention",
        "content": "",
        "tableData": {
          "headers": [
            "Register",
            "Purpose"
          ],
          "rows": [
            [
              "X8",
              "System call number"
            ],
            [
              "X0-X5",
              "Arguments"
            ],
            [
              "X0",
              "Return value"
            ]
          ]
        }
      },
      {
        "id": "sec-45-3-2",
        "title": "45.3.2 Common System Calls",
        "content": "",
        "tableData": {
          "headers": [
            "Number",
            "Name",
            "Arguments"
          ],
          "rows": [
            [
              "64",
              "write",
              "X0=fd, X1=buf, X2=count"
            ],
            [
              "63",
              "read",
              "X0=fd, X1=buf, X2=count"
            ],
            [
              "93",
              "exit",
              "X0=status"
            ],
            [
              "56",
              "openat",
              "X0=dirfd, X1=pathname, X2=flags"
            ],
            [
              "57",
              "close",
              "X0=fd"
            ],
            [
              "220",
              "getpid",
              "None"
            ]
          ]
        }
      },
      {
        "id": "sec-45-3-3",
        "title": "45.3.3 Function Call Convention (AAPCS64)",
        "content": "",
        "codeSnippets": [
          {
            "title": "Function Call Convention (AAPCS64) — example",
            "language": "arm",
            "code": "// Caller-saved (temporary) registers\n// X0-X7: Arguments/return values\n// X9-X15: Temporary\n\n// Callee-saved registers\n// X19-X28: Must be preserved\n\n// Stack frame\n// X29 (FP): Frame pointer\n// X30 (LR): Return address"
          }
        ]
      },
      {
        "id": "sec-45-3-4",
        "title": "45.3.4 Function Prologue/Epilogue",
        "content": "",
        "codeSnippets": [
          {
            "title": "Function Prologue/Epilogue — example",
            "language": "arm",
            "code": "// Prologue\nfunc:\n    stp x29, x30, [sp, #-16]!  // Save FP and LR\n    mov x29, sp                 // Set frame pointer\n    stp x19, x20, [sp, #-16]!  // Save callee-saved regs\n\n// ... function body ...\n\n// Epilogue\n    ldp x19, x20, [sp], #16    // Restore callee-saved regs\n    ldp x29, x30, [sp], #16    // Restore FP and LR\n    ret                         // Return"
          }
        ]
      },
      {
        "id": "sec-45-3-5",
        "title": "45.3.5 Structure Passing",
        "content": "",
        "codeSnippets": [
          {
            "title": "Structure Passing — example",
            "language": "arm",
            "code": "// Small structures: passed in registers\n// Large structures: passed by pointer\n\n// Return small struct in X0-X1\nstruct ret_small() {\n    return {.a = 1, .b = 2};\n}\n// Result: X0=1, X1=2\n\n// Return large struct via X8 pointer\nstruct ret_large() {\n    static struct result;\n    result.a = 1;\n    result.b = 2;\n    return result;\n}\n// X8 = pointer to result"
          }
        ]
      },
      {
        "id": "sec-45-3-6",
        "title": "45.3.6 Stack Alignment",
        "content": "ARM64 requires 16-byte stack alignment:",
        "codeSnippets": [
          {
            "title": "Stack Alignment — example",
            "language": "arm",
            "code": "// Allocate stack frame (must be multiple of 16)\nsub sp, sp, #32     // 32 is multiple of 16\n// ... use stack ...\nadd sp, sp, #32     // Restore stack"
          }
        ]
      },
      {
        "id": "sec-45-3-7",
        "title": "45.3.7 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "ARM64 System Call Examples",
            "code": ".section .text\n.global _start\n\n_start:\n    // write(1, \"Hello\\n\", 6)\n    mov x0, #1              // fd = stdout\n    adr x1, msg             // buffer address\n    mov x2, #6              // count\n    mov x8, #64             // sys_write = 64\n    svc #0                  // syscall\n\n    // read(0, buf, 100)\n    mov x0, #0              // fd = stdin\n    adr x1, buf             // buffer address\n    mov x2, #100            // max count\n    mov x8, #63             // sys_read = 63\n    svc #0                  // syscall\n    // X0 = bytes read\n\n    // exit(0)\n    mov x0, #0              // status\n    mov x8, #93             // sys_exit = 93\n    svc #0\n\n.section .data\nmsg:\n    .ascii \"Hello, World!\\n\"\n\n.section .bss\nbuf:\n    .skip 100"
          }
        ]
      },
      {
        "id": "sec-45-4",
        "title": "45.4 ARM64 vs x86-64 Comparison",
        "content": "Key differences between ARM64 and x86-64 architectures."
      },
      {
        "id": "sec-45-4-1",
        "title": "45.4.1 Instruction Set Philosophy",
        "content": "",
        "tableData": {
          "headers": [
            "Aspect",
            "x86-64",
            "ARM64"
          ],
          "rows": [
            [
              "Design",
              "CISC (complex)",
              "RISC (simple)"
            ],
            [
              "Instruction size",
              "Variable (1-15 bytes)",
              "Fixed (4 bytes)"
            ],
            [
              "Instruction count",
              "1000+",
              "~200 base"
            ],
            [
              "Decoder complexity",
              "High",
              "Low"
            ],
            [
              "Power consumption",
              "Higher",
              "Lower"
            ]
          ]
        }
      },
      {
        "id": "sec-45-4-2",
        "title": "45.4.2 Register Usage",
        "content": "",
        "tableData": {
          "headers": [
            "Feature",
            "x86-64",
            "ARM64"
          ],
          "rows": [
            [
              "General registers",
              "16",
              "31"
            ],
            [
              "Zero register",
              "None",
              "XZR"
            ],
            [
              "Argument registers",
              "RDI, RSI, RDX, RCX, R8, R9",
              "X0-X7"
            ],
            [
              "Callee-saved",
              "RBX, RBP, R12-R15",
              "X19-X28"
            ],
            [
              "Return address",
              "Stack",
              "X30 (LR)"
            ]
          ]
        }
      },
      {
        "id": "sec-45-4-3",
        "title": "45.4.3 Memory Access",
        "content": "",
        "tableData": {
          "headers": [
            "Feature",
            "x86-64",
            "ARM64"
          ],
          "rows": [
            [
              "Addressing modes",
              "Many (base+idx*scale+disp)",
              "Few (base+offset)"
            ],
            [
              "Memory operands",
              "In any instruction",
              "Load/Store only"
            ],
            [
              "Alignment",
              "Not required",
              "Recommended"
            ],
            [
              "Atomic operations",
              "LOCK prefix",
              "LDXR/STXR"
            ]
          ]
        }
      },
      {
        "id": "sec-45-4-4",
        "title": "45.4.4 Control Flow",
        "content": "",
        "tableData": {
          "headers": [
            "Feature",
            "x86-64",
            "ARM64"
          ],
          "rows": [
            [
              "Condition codes",
              "RFLAGS (all instructions)",
              "PSTATE (compare only)"
            ],
            [
              "Conditional move",
              "CMOV",
              "CSEL"
            ],
            [
              "Indirect jump",
              "JMP [addr]",
              "BR x0"
            ],
            [
              "Function call",
              "CALL (pushes RIP)",
              "BL (stores in LR)"
            ],
            [
              "Return",
              "RET (pops RIP)",
              "RET (branches to LR)"
            ]
          ]
        }
      },
      {
        "id": "sec-45-4-5",
        "title": "45.4.5 System Calls",
        "content": "",
        "tableData": {
          "headers": [
            "Feature",
            "x86-64 (Linux)",
            "ARM64 (Linux)"
          ],
          "rows": [
            [
              "Instruction",
              "syscall",
              "svc #0"
            ],
            [
              "Number register",
              "RAX",
              "X8"
            ],
            [
              "Arguments",
              "RDI, RSI, RDX, R10, R8, R9",
              "X0-X5"
            ],
            [
              "Return",
              "RAX",
              "X0"
            ]
          ]
        }
      },
      {
        "id": "sec-45-4-6",
        "title": "45.4.6 Code Density Example",
        "content": "x86-64: add rax, [rbx+rcx*8+16] (4 bytes)\n\nadd x9, x1, x2, LSL #3    // x9 = x2 * 8",
        "codeSnippets": [
          {
            "title": "Code Density Example — example",
            "language": "arm",
            "code": "ARM64:\n\nldr x0, [x9, #16]          // Load from x9 + 16\n// 8 bytes total"
          }
        ]
      },
      {
        "id": "sec-45-4-7",
        "title": "45.4.7 When to Use Which?",
        "content": "",
        "tableData": {
          "headers": [
            "Use Case",
            "Recommended"
          ],
          "rows": [
            [
              "Desktop/Server",
              "x86-64 (compatibility)"
            ],
            [
              "Mobile/Embedded",
              "ARM64 (power efficiency)"
            ],
            [
              "Cloud servers",
              "ARM64 (power/cost)"
            ],
            [
              "Legacy support",
              "x86-64"
            ],
            [
              "Battery life critical",
              "ARM64"
            ]
          ]
        }
      },
      {
        "id": "sec-45-4-8",
        "title": "45.4.8 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "arm",
            "title": "ARM64 vs x86-64 Side-by-Side",
            "code": "// Function: int add(int a, int b) { return a + b; }\n\n// x86-64\nadd:\n    lea eax, [rdi+rsi]\n    ret\n\n// ARM64\nadd:\n    add w0, w0, w1\n    ret\n\n// strlen function\n\n// x86-64\nstrlen:\n    xor eax, eax\n.loop:\n    cmp byte [rdi+rax], 0\n    je .done\n    inc eax\n    jmp .loop\n.done:\n    ret\n\n// ARM64\nstrlen:\n    mov x2, x0\n.loop:\n    ldrb w1, [x2], #1\n    cbnz w1, .loop\n    sub x0, x2, x0\n    ret"
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-45-1",
        "title": "Exercise 45.1: ARM64 Array Sum",
        "description": "Sum an array of 10 words using indexed addressing LDR W1, [X0, X2, LSL #2].",
        "solution": "sum_array:\n    mov w3, #0\n    mov w4, #0\n.loop:\n    cmp w4, w2; b.ge .done\n    ldr w5, [x0, x4, lsl #2]\n    add w3, w3, w5\n    add w4, w4, #1\n    b .loop\n.done:\n    mov w0, w3\n    ret",
        "solutionLanguage": "arm"
      },
      {
        "id": "ex-45-2",
        "title": "Exercise 45.2: ARM64 Factorial",
        "description": "Write a recursive factorial function in ARM64 assembly.",
        "solution": "Use X0 for argument/return, save X30 (LR) on stack for recursion. Base case: n<=1 return 1. Recursive: save n, call factorial(n-1), multiply n*result."
      },
      {
        "id": "ex-45-3",
        "title": "Exercise 45.3: CSEL Implementation",
        "description": "Implement absolute value function using CSEL.",
        "solution": "cmp x0, #0; csel x0, x0, x0, ge; cneg x0, x0, lt (or use conditional negate). This avoids branch instructions."
      },
      {
        "id": "ex-45-4",
        "title": "Exercise 45.4: ARM64 String Copy",
        "description": "Write a strcpy function in ARM64 assembly.",
        "solution": "Loop: ldrb w2, [x1], #1; strb w2, [x0], #1; cbnz w2, loop. Uses post-indexed addressing for efficient pointer advancement."
      }
    ],
    "practiceQuestions": [
      {
        "question": "What is the role of the XZR register in ARM64?",
        "answer": "XZR (and 32-bit WZR) is a dedicated zero register that always evaluates to 0 when read, and discards all data written to it, eliminating the need to zero registers with xor. It simplifies many operations like moving immediates and comparing with zero."
      },
      {
        "question": "How does ARM64 conditional execution differ from x86-64?",
        "answer": "ARM64 uses PSTATE flags (NZCV) set by CMP instructions, then CSEL/conditional branches. x86-64 uses RFLAGS set by any instruction, with CMOV for conditional moves. ARM64 requires explicit comparison before conditional operation, while x86-64 can test during any instruction."
      },
      {
        "question": "Why is ARM64 more power-efficient than x86-64?",
        "answer": "ARM64 uses fixed-length instructions (simpler decoder), load/store architecture (fewer memory accesses), and cleaner RISC design (less silicon). x86-64 variable instructions require complex decoding, and memory operands in ALU instructions increase memory traffic."
      },
      {
        "question": "What is the ARM64 calling convention (AAPCS64)?",
        "answer": "AAPCS64 defines: X0-X7 for arguments/returns, X8 for indirect result, X9-X15 as caller-saved temporaries, X19-X28 as callee-saved, X29 as frame pointer, X30 as link register (return address). Stack must be 16-byte aligned."
      },
      {
        "question": "How do ARM64 system calls differ from x86-64?",
        "answer": "ARM64 uses SVC #0 instruction with syscall number in X8 and arguments in X0-X5. x86-64 uses syscall instruction with number in RAX and arguments in RDI, RSI, RDX, R10, R8, R9. Different syscall numbers on Linux (e.g., write: ARM64=64, x86-64=1)."
      },
      {
        "question": "What is CSEL and why is it useful?",
        "answer": "CSEL (Conditional Select) performs branchless conditional assignment: CSEL Xd, Xn, Xm, cond selects Xn if condition true, Xm if false. It avoids branch penalties in simple conditionals like max/min/abs functions, improving performance on pipelined processors."
      }
    ],
    "summary": [
      "ARM64 is the world's leading mobile and power-efficient server architecture.",
      "Three-operand format and CSEL eliminate branch penalties.",
      "Fixed 32-bit instructions simplify decoding and improve power efficiency.",
      "Load/store architecture reduces memory access complexity.",
      "AAPCS64 defines register usage and calling conventions.",
      "SVC #0 is the ARM64 system call instruction.",
      "ARM64 excels in power-constrained and mobile environments.",
      "Understanding ARM64 is essential for modern systems programming."
    ]
  },
  {
    "id": 46,
    "slug": "chapter-46-riscv-assembly",
    "level": 9,
    "levelTitle": "Cross-Platform and Alternative Architectures",
    "title": "Chapter 46: RISC-V Assembly",
    "subtitle": "The Open Modular Architecture (RV64I), Registers, Jumps, and ecall",
    "learningObjectives": [
      "Understand the open-source, modular RISC-V ISA philosophy.",
      "Master RV64 general-purpose registers: x0–x31 (zero, ra, sp, gp, tp, t0–t6, a0–a7, s0–s11).",
      "Execute load/store operations, branches without flags, and jumps (jal, jalr).",
      "Invoke Linux RISC-V system calls using ecall (syscall number in a7).",
      "Compare RISC-V with x86-64 and ARM64 architectures.",
      "Understand RISC-V calling convention.",
      "Learn RISC-V modular extensions (M, A, F, D, C).",
      "Study RISC-V privilege levels and virtual memory."
    ],
    "prerequisites": [
      "Chapters 1–22, 45"
    ],
    "keyConcepts": [
      "RISC-V: Open-source, royalty-free ISA from UC Berkeley.",
      "Modular design: Base integer ISA + extensions (M, A, F, D, C).",
      "x0 is hardwired to zero (no need for zeroing instructions).",
      "ecall: Environment Call (system call instruction).",
      "No condition codes: Branches compare registers directly.",
      "RV64I: 64-bit integer base instruction set.",
      "Compressed (C) extension: 16-bit instructions for code density.",
      "Privilege levels: User, Supervisor, Machine."
    ],
    "diagramType": "riscv_assembly",
    "sections": [
      {
        "id": "sec-46-1",
        "title": "46.1 RISC-V Architecture Overview",
        "content": "RISC-V is an open, modular ISA designed for education and industry."
      },
      {
        "id": "sec-46-1-1",
        "title": "46.1.1 Why RISC-V?",
        "content": "• Open-source: No licensing fees\n• Modular: Customize for specific applications\n• Clean design: Minimal legacy baggage\n• Growing ecosystem: Linux, GCC, LLVM support\n• Industry adoption: SiFive, Espressif, StarFive"
      },
      {
        "id": "sec-46-1-2",
        "title": "46.1.2 RISC-V Register Set (RV64I)",
        "content": "",
        "tableData": {
          "headers": [
            "Register",
            "ABI Name",
            "Purpose",
            "Description"
          ],
          "rows": [
            [
              "x0",
              "zero",
              "Hardwired zero",
              "Always 0"
            ],
            [
              "x1",
              "ra",
              "Return address",
              "Function return address"
            ],
            [
              "x2",
              "sp",
              "Stack pointer",
              "Stack pointer"
            ],
            [
              "x3",
              "gp",
              "Global pointer",
              "Global data pointer"
            ],
            [
              "x4",
              "tp",
              "Thread pointer",
              "Thread-local storage"
            ],
            [
              "x5-x7",
              "t0-t2",
              "Temporaries",
              "Caller-saved"
            ],
            [
              "x8",
              "s0/fp",
              "Saved/frame",
              "Callee-saved / Frame pointer"
            ],
            [
              "x9",
              "s1",
              "Saved",
              "Callee-saved"
            ],
            [
              "x10-x11",
              "a0-a1",
              "Arguments/Returns",
              "Function args, return values"
            ],
            [
              "x12-x17",
              "a2-a7",
              "Arguments",
              "Function arguments"
            ],
            [
              "x18-x27",
              "s2-s11",
              "Saved",
              "Callee-saved"
            ],
            [
              "x28-x31",
              "t3-t6",
              "Temporaries",
              "Caller-saved"
            ]
          ]
        }
      },
      {
        "id": "sec-46-1-3",
        "title": "46.1.3 Key Features",
        "content": "1. No condition codes: Branches compare registers directly\n2. Load/store architecture: Memory access only via LDR/STR\n3. Fixed-length instructions: 32-bit (base), 16-bit (C extension)\n4. Simple encoding: Easy to decode\n5. Modular extensions: M (multiply), A (atomic), F/D (float), C (compressed)"
      },
      {
        "id": "sec-46-1-4",
        "title": "46.1.4 RISC-V vs ARM64 vs x86-64",
        "content": "",
        "tableData": {
          "headers": [
            "Feature",
            "RISC-V",
            "ARM64",
            "x86-64"
          ],
          "rows": [
            [
              "License",
              "Open (free)",
              "Proprietary",
              "Proprietary"
            ],
            [
              "Modularity",
              "High",
              "Medium",
              "Low"
            ],
            [
              "Condition codes",
              "None",
              "PSTATE",
              "RFLAGS"
            ],
            [
              "Zero register",
              "x0",
              "XZR",
              "None"
            ],
            [
              "Instruction size",
              "32/16-bit",
              "32-bit",
              "1-15 bytes"
            ],
            [
              "Operand format",
              "3-operand",
              "3-operand",
              "2-operand"
            ]
          ]
        }
      },
      {
        "id": "sec-46-1-5",
        "title": "46.1.5 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "riscv",
            "title": "RISC-V Hello World",
            "code": ".section .data\nmsg:\n    .ascii \"Hello, World!\\n\"\n    len = . - msg\n\n.section .text\n.global _start\n\n_start:\n    # write(1, msg, len)\n    li a0, 1            # fd = 1 (stdout)\n    la a1, msg          # load address of msg\n    li a2, len          # length\n    li a7, 64           # syscall 64 = write\n    ecall               # invoke kernel\n\n    # exit(0)\n    li a0, 0            # status = 0\n    li a7, 93           # syscall 93 = exit\n    ecall"
          }
        ]
      },
      {
        "id": "sec-46-2",
        "title": "46.2 RISC-V Instruction Set",
        "content": "RISC-V uses simple, regular instruction formats."
      },
      {
        "id": "sec-46-2-1",
        "title": "46.2.1 Instruction Formats (RISC-V)",
        "content": "",
        "tableData": {
          "headers": [
            "Format",
            "Usage",
            "Layout"
          ],
          "rows": [
            [
              "R-type",
              "Register-register",
              "funct7[31:25] rs2[24:20] rs1[19:15] funct3[14:12] rd[11:7] opcode[6:0]"
            ],
            [
              "I-type",
              "Immediate",
              "imm[31:20] rs1[19:15] funct3[14:12] rd[11:7] opcode[6:0]"
            ],
            [
              "S-type",
              "Store",
              "imm[31:25] rs2[24:20] rs1[19:15] funct3[14:12] imm[11:7] opcode[6:0]"
            ],
            [
              "B-type",
              "Branch",
              "imm[31] imm[7] imm[30:25] rs2[24:20] rs1[19:15] funct3[14:12] imm[11:8] imm[30:25] opcode[6:0]"
            ],
            [
              "U-type",
              "Upper immediate",
              "imm[31:12] rd[11:7] opcode[6:0]"
            ],
            [
              "J-type",
              "Jump",
              "imm[31] imm[19:12] imm[20] imm[30:21] rd[11:7] opcode[6:0]"
            ]
          ]
        }
      },
      {
        "id": "sec-46-2-2",
        "title": "46.2.2 Arithmetic Instructions",
        "content": "",
        "codeSnippets": [
          {
            "title": "Arithmetic Instructions — example",
            "language": "riscv",
            "code": "# Integer register-register (R-type)\nadd  x1, x2, x3      # x1 = x2 + x3\nsub  x1, x2, x3      # x1 = x2 - x3\nand  x1, x2, x3      # x1 = x2 & x3\nor   x1, x2, x3      # x1 = x2 | x3\nxor  x1, x2, x3      # x1 = x2 ^ x3\nsll  x1, x2, x3      # x1 = x2 << x3\nsrl  x1, x2, x3      # x1 = x2 >> x3 (logical)\nsra  x1, x2, x3      # x1 = x2 >> x3 (arithmetic)\nslt  x1, x2, x3      # x1 = (x2 < x3) ? 1 : 0\n\n# Integer register-immmediate (I-type)\naddi x1, x2, 42      # x1 = x2 + 42\nandi x1, x2, 0xFF    # x1 = x2 & 0xFF\nori  x1, x2, 0x10    # x1 = x2 | 0x10\nxori x1, x2, 0xFF    # x1 = x2 ^ 0xFF\nslli x1, x2, 3       # x1 = x2 << 3\nsrli x1, x2, 3       # x1 = x2 >> 3 (logical)\nsrai x1, x2, 3       # x1 = x2 >> 3 (arithmetic)\nslti x1, x2, 42      # x1 = (x2 < 42) ? 1 : 0\n\n# Multiply/Divide (M extension)\nmul    x1, x2, x3    # x1 = x2 * x3 (low 64 bits)\nmulh   x1, x2, x3    # x1 = (x2 * x3) >> 64 (high)\ndiv    x1, x2, x3    # x1 = x2 / x3 (signed)\ndivu   x1, x2, x3    # x1 = x2 / x3 (unsigned)\nrem    x1, x2, x3    # x1 = x2 % x3 (signed)\nremu   x1, x2, x3    # x1 = x2 % x3 (unsigned)"
          }
        ]
      },
      {
        "id": "sec-46-2-3",
        "title": "46.2.3 Load/Store Instructions",
        "content": "",
        "codeSnippets": [
          {
            "title": "Load/Store Instructions — example",
            "language": "riscv",
            "code": "# Load (I-type)\nlb   x1, 0(x2)       # Load byte (sign-extended)\nlbu  x1, 0(x2)       # Load byte unsigned (zero-extended)\nlh   x1, 0(x2)       # Load halfword (16-bit)\nlhu  x1, 0(x2)       # Load halfword unsigned\nlw   x1, 0(x2)       # Load word (32-bit)\nld   x1, 0(x2)       # Load doubleword (64-bit)\n\n# Store (S-type)\nsb   x1, 0(x2)       # Store byte\nsh   x1, 0(x2)       # Store halfword\nsw   x1, 0(x2)       # Store word\nsd   x1, 0(x2)       # Store doubleword\n\n# Example: Load/Store with offset\nlw   x5, 8(x1)       # Load word from x1+8\nsw   x5, 12(x1)      # Store word to x1+12"
          }
        ]
      },
      {
        "id": "sec-46-2-4",
        "title": "46.2.4 Branch Instructions (B-type)",
        "content": "",
        "codeSnippets": [
          {
            "title": "Branch Instructions (B-type) — example",
            "language": "riscv",
            "code": "# No condition codes! Compare registers directly.\nbeq  x1, x2, label   # Branch if x1 == x2\nbne  x1, x2, label   # Branch if x1 != x2\nblt  x1, x2, label   # Branch if x1 < x2 (signed)\nbge  x1, x2, label   # Branch if x1 >= x2 (signed)\nbltu x1, x2, label   # Branch if x1 < x2 (unsigned)\nbgeu x1, x2, label   # Branch if x1 >= x2 (unsigned)\n\n# Pseudo-instructions\nbeqz x1, label       # Branch if x1 == 0 (beq x1, x0, label)\nbnez x1, label       # Branch if x1 != 0 (bne x1, x0, label)\nblez x1, label       # Branch if x1 <= 0\nbgez x1, label       # Branch if x1 >= 0\nbltz x1, label       # Branch if x1 < 0\nbgtz x1, label       # Branch if x1 > 0"
          }
        ]
      },
      {
        "id": "sec-46-2-5",
        "title": "46.2.5 Jump Instructions",
        "content": "",
        "codeSnippets": [
          {
            "title": "Jump Instructions — example",
            "language": "riscv",
            "code": "# Jump and Link (J-type)\njal  x1, label       # x1 = PC+4, jump to label (call)\n\n# Jump and Link Register (I-type)\njalr x1, x2, 0       # x1 = PC+4, jump to x2 + 0\n\n# Pseudo-instructions\nj    label            # jal x0, label (unconditional jump)\njr   x1              # jalr x0, x1, 0 (jump to register)\nret                  # jalr x0, x1, 0 (return = jump to ra)\n\n# Example: Function call\ncall func            # jal x1, func (link in x1)\nret                  # jalr x0, x1, 0 (return to caller)"
          }
        ]
      },
      {
        "id": "sec-46-2-6",
        "title": "46.2.6 Upper Immediate (U-type)",
        "content": "",
        "codeSnippets": [
          {
            "title": "Upper Immediate (U-type) — example",
            "language": "riscv",
            "code": "lui  x1, 0x12345     # x1 = 0x12345000 (load upper 20 bits)\nauipc x1, 0x12345    # x1 = PC + 0x12345000\n\n# Common pattern for 32-bit immediate:\nlui  x1, upper20     # Load upper 20 bits\naddi x1, x1, lower12 # Add lower 12 bits"
          }
        ]
      },
      {
        "id": "sec-46-2-7",
        "title": "46.2.7 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "riscv",
            "title": "RISC-V Instruction Examples",
            "code": ".section .text\n.global _start\n\n_start:\n    # Load immediate values\n    li a0, 10           # a0 = 10\n    li a1, 20           # a1 = 20\n    \n    # Arithmetic\n    add a2, a0, a1      # a2 = 30\n    sub a3, a1, a0      # a3 = 10\n    mul a4, a0, a1      # a4 = 200 (M extension)\n    div a5, a1, a0      # a5 = 2\n    \n    # Logical\n    and a6, a0, a1      # Bitwise AND\n    or  a7, a0, a1      # Bitwise OR\n    xor t0, a0, a1      # Bitwise XOR\n    \n    # Shifts\n    slli t1, a0, 3      # Left shift by 3\n    srli t2, a1, 1      # Right shift by 1\n    \n    # Load/Store\n    la   t3, data       # Get address\n    lw   t4, 0(t3)      # Load word\n    addi t4, t4, 1      # Increment\n    sw   t4, 0(t3)      # Store word\n    \n    # Branch\n    beq  a0, a1, equal\n    bne  a0, a1, not_equal\n    blt  a0, a1, less\n    \nequal:\n    # a0 == a1\n    j done\n    \nnot_equal:\n    # a0 != a1\n    \nless:\n    # a0 < a1\n    \ndone:\n    # Exit\n    li a0, 0\n    li a7, 93\n    ecall\n\n.section .data\ndata:\n    .word 42"
          }
        ]
      },
      {
        "id": "sec-46-3",
        "title": "46.3 RISC-V System Calls and Calling Convention",
        "content": "Linux RISC-V system calls use ecall instruction."
      },
      {
        "id": "sec-46-3-1",
        "title": "46.3.1 System Call Convention",
        "content": "",
        "tableData": {
          "headers": [
            "Register",
            "Purpose"
          ],
          "rows": [
            [
              "a7",
              "System call number"
            ],
            [
              "a0-a5",
              "Arguments"
            ],
            [
              "a0",
              "Return value"
            ]
          ]
        }
      },
      {
        "id": "sec-46-3-2",
        "title": "46.3.2 Common System Calls",
        "content": "",
        "tableData": {
          "headers": [
            "Number",
            "Name",
            "Arguments"
          ],
          "rows": [
            [
              "64",
              "write",
              "a0=fd, a1=buf, a2=count"
            ],
            [
              "63",
              "read",
              "a0=fd, a1=buf, a2=count"
            ],
            [
              "93",
              "exit",
              "a0=status"
            ],
            [
              "56",
              "openat",
              "a0=dirfd, a1=pathname, a2=flags"
            ],
            [
              "57",
              "close",
              "a0=fd"
            ]
          ]
        }
      },
      {
        "id": "sec-46-3-3",
        "title": "46.3.3 Function Call Convention (RISC-V)",
        "content": "",
        "codeSnippets": [
          {
            "title": "Function Call Convention (RISC-V) — example",
            "language": "riscv",
            "code": "# Caller-saved (temporary) registers\n# t0-t6 (x5-x7, x28-x31): Not preserved\n\n# Callee-saved registers\n# s0-s11 (x8-x9, x18-x27): Must be preserved\n\n# Arguments/returns\n# a0-a7 (x10-x17): Function arguments, return values\n\n# Special registers\n# ra (x1): Return address\n# sp (x2): Stack pointer\n# gp (x3): Global pointer\n# tp (x4): Thread pointer"
          }
        ]
      },
      {
        "id": "sec-46-3-4",
        "title": "46.3.4 Function Prologue/Epilogue",
        "content": "",
        "codeSnippets": [
          {
            "title": "Function Prologue/Epilogue — example",
            "language": "riscv",
            "code": "# Prologue\nfunc:\n    addi sp, sp, -32    # Allocate stack frame\n    sd   ra, 24(sp)     # Save return address\n    sd   s0, 16(sp)     # Save callee-saved register\n    sd   s1, 8(sp)      # Save callee-saved register\n    mv   s0, a0         # Save argument\n\n# ... function body ...\n\n# Epilogue\n    ld   s1, 8(sp)      # Restore callee-saved register\n    ld   s0, 16(sp)     # Restore callee-saved register\n    ld   ra, 24(sp)     # Restore return address\n    addi sp, sp, 32     # Deallocate stack frame\n    ret                 # Return (jump to ra)"
          }
        ]
      },
      {
        "id": "sec-46-3-5",
        "title": "46.3.5 Tail Call Optimization",
        "content": "",
        "codeSnippets": [
          {
            "title": "Tail Call Optimization — example",
            "language": "riscv",
            "code": "# Tail call: reuse caller's stack frame\ntail_call:\n    ld   t0, 0(s0)      # Load function pointer\n    ld   a0, 8(s0)      # Load argument\n    jr   t0             # Jump to function (no return)\n    # No stack frame setup needed"
          }
        ]
      },
      {
        "id": "sec-46-3-6",
        "title": "46.3.6 Structure Passing",
        "content": "",
        "codeSnippets": [
          {
            "title": "Structure Passing — example",
            "language": "riscv",
            "code": "# Small structures: passed in registers\n# Large structures: passed by pointer\n\n# Return small struct in a0-a1\nret_small:\n    li a0, 1\n    li a1, 2\n    ret\n\n# Return large struct via pointer in a0\nret_large:\n    la t0, result\n    li t1, 1\n    sd t1, 0(t0)\n    mv a0, t0\n    ret"
          }
        ]
      },
      {
        "id": "sec-46-3-7",
        "title": "46.3.7 Stack Alignment",
        "content": "RISC-V requires 16-byte stack alignment:\nriscv",
        "codeSnippets": [
          {
            "title": "Stack Alignment — example",
            "language": "riscv",
            "code": "# Allocate stack frame (must be multiple of 16)\naddi sp, sp, -32     # 32 is multiple of 16\n# ... use stack ...\naddi sp, sp, 32      # Restore stack"
          }
        ]
      },
      {
        "id": "sec-46-3-8",
        "title": "46.3.8 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "riscv",
            "title": "RISC-V System Call Examples",
            "code": ".section .text\n.global _start\n\n_start:\n    # write(1, \"Hello\\n\", 6)\n    li a0, 1              # fd = stdout\n    la a1, msg            # buffer address\n    li a2, 6              # count\n    li a7, 64             # sys_write = 64\n    ecall                 # syscall\n\n    # read(0, buf, 100)\n    li a0, 0              # fd = stdin\n    la a1, buf            # buffer address\n    li a2, 100            # max count\n    li a7, 63             # sys_read = 63\n    ecall                 # syscall\n    # a0 = bytes read\n\n    # exit(0)\n    li a0, 0              # status\n    li a7, 93             # sys_exit = 93\n    ecall\n\n.section .data\nmsg:\n    .ascii \"Hello, World!\\n\"\n\n.section .bss\nbuf:\n    .skip 100"
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-46-1",
        "title": "Exercise 46.1: Recursive Factorial in RISC-V",
        "description": "Implement factorial in RV64 assembly saving ra and s0 on the stack.",
        "solution": "factorial:\n    addi sp, sp, -16\n    sd ra, 8(sp)\n    sd s0, 0(sp)\n    mv s0, a0\n    li t0, 1\n    ble s0, t0, .base\n    addi a0, s0, -1\n    call factorial\n    mul a0, s0, a0\n    j .done\n.base: li a0, 1\n.done: ld s0, 0(sp); ld ra, 8(sp); addi sp, sp, 16; ret",
        "solutionLanguage": "riscv"
      },
      {
        "id": "ex-46-2",
        "title": "Exercise 46.2: RISC-V Array Sum",
        "description": "Sum an array of 10 words using RISC-V load instructions.",
        "solution": "Use a0 for array pointer, a1 for count. Loop: load word, add to sum, increment pointer, decrement count, branch if not zero."
      },
      {
        "id": "ex-46-3",
        "title": "Exercise 46.3: RISC-V String Length",
        "description": "Write a strlen function in RISC-V assembly.",
        "solution": "Loop: load byte, check if zero, increment count, increment pointer. Return count in a0."
      },
      {
        "id": "ex-46-4",
        "title": "Exercise 46.4: RISC-V Bubble Sort",
        "description": "Implement bubble sort for an integer array.",
        "solution": "Nested loops: outer loop iterates n-1 times, inner loop compares adjacent elements and swaps if needed. Use bge/blt for comparisons."
      }
    ],
    "practiceQuestions": [
      {
        "question": "How do conditional branches in RISC-V differ from x86 and ARM?",
        "answer": "RISC-V does not have a status flags register (like RFLAGS or PSTATE). Instead, branch instructions (beq, bne, blt, bge) directly compare two registers in a single instruction. This simplifies the hardware but requires explicit comparison instructions before branches."
      },
      {
        "question": "What is the purpose of the x0 register in RISC-V?",
        "answer": "x0 is hardwired to zero: reading always returns 0, writing discards the value. This eliminates many instructions: li rd, 0 becomes addi rd, x0, 0 (or pseudo li), mv rd, rs becomes addi rd, rs, 0, nop becomes addi x0, x0, 0, and unconditional jumps can use jal x0, offset."
      },
      {
        "question": "How does RISC-V modularity benefit embedded systems?",
        "answer": "RISC-V's modular ISA allows designers to include only needed extensions: base integer (I) for minimal cores, multiply (M) for arithmetic, atomic (A) for threading, float (F/D) for math, compressed (C) for code density. This reduces silicon area and power consumption for embedded applications."
      },
      {
        "question": "What is the RISC-V calling convention?",
        "answer": "RISC-V uses: a0-a7 for arguments/returns, t0-t6 as caller-saved temporaries, s0-s11 as callee-saved, ra for return address, sp for stack pointer. Functions must preserve s0-s11, sp, and gp. Arguments beyond 8 use the stack."
      },
      {
        "question": "How do RISC-V system calls work?",
        "answer": "RISC-V Linux system calls use the ecall instruction. The syscall number goes in a7, arguments in a0-a5, and the return value comes back in a0. ecall traps to the kernel, which executes the system call and returns to user space."
      },
      {
        "question": "What are RISC-V privilege levels?",
        "answer": "RISC-V defines three privilege levels: User (U) for applications, Supervisor (S) for OS kernels, and Machine (M) for firmware/hypervisors. Each level has its own registers and memory protection. This enables virtualization and security isolation."
      }
    ],
    "summary": [
      "RISC-V is an open, modern, clean RISC standard.",
      "Modular extensions tailor the ISA to microcontrollers, desktops, and supercomputers.",
      "x0 hardwired to zero simplifies many operations.",
      "No condition codes: branches compare registers directly.",
      "ecall is the RISC-V system call instruction.",
      "Modular design enables customization for specific applications.",
      "Growing ecosystem with Linux, GCC, LLVM support.",
      "RISC-V is gaining traction in industry and education."
    ]
  },
  {
    "id": 47,
    "slug": "chapter-47-mips-other-architectures",
    "level": 9,
    "levelTitle": "Cross-Platform and Alternative Architectures",
    "title": "Chapter 47: MIPS and Other Architectures",
    "subtitle": "Classic RISC, Delay Slots, SPARC Register Windows, PowerPC, and AVR",
    "learningObjectives": [
      "Understand the architecture of MIPS32: 32 registers ($zero, $v0–$v1, $a0–$a3, $t0–$t9, $s0–$s7, $sp, $ra).",
      "Manage MIPS branch delay slots effectively.",
      "Write a MIPS32 Hello World program with Linux syscalls ($v0 = 4004).",
      "Survey historical architectures: SPARC register windows, PowerPC condition fields, AVR 8-bit.",
      "Understand MIPS pipeline and branch delay slots.",
      "Compare MIPS with modern RISC architectures.",
      "Learn about embedded architectures (AVR, PIC, MSP430).",
      "Study SPARC register windows and VLIW architectures."
    ],
    "prerequisites": [
      "Chapters 1–22, 45, 46"
    ],
    "keyConcepts": [
      "MIPS: Microprocessor without Interlocked Pipelined Stages.",
      "Branch delay slot: Instruction after branch executes before jump takes effect.",
      "SPARC: Scalable Processor Architecture with register windows.",
      "PowerPC: Performance Optimization With Enhanced RISC Performance Computing.",
      "AVR: Advanced Virtual RISC (8-bit microcontrollers).",
      "VLIW: Very Long Instruction Word (EPIC, Itanium).",
      "Delay slots: Architectural trade-off for pipeline efficiency.",
      "Register windows: Reduce memory traffic for function calls."
    ],
    "diagramType": "mips_architecture",
    "sections": [
      {
        "id": "sec-47-1",
        "title": "47.1 MIPS Architecture Overview",
        "content": "MIPS pioneered many concepts in modern processor design."
      },
      {
        "id": "sec-47-1-1",
        "title": "47.1.1 Why MIPS Matters?",
        "content": "• Pioneered RISC concepts (delay slots, pipelining)\n• Dominated embedded systems (routers, game consoles)\n• Clean, elegant design\n• Educational standard for computer architecture"
      },
      {
        "id": "sec-47-1-2",
        "title": "47.1.2 MIPS32 Register Set",
        "content": "",
        "tableData": {
          "headers": [
            "Register",
            "Number",
            "Purpose",
            "Description"
          ],
          "rows": [
            [
              "$zero",
              "$0",
              "Hardwired zero",
              "Always 0"
            ],
            [
              "$at",
              "$1",
              "Assembler temp",
              "Reserved for assembler"
            ],
            [
              "$v0-$v1",
              "$2-$3",
              "Values",
              "Function returns"
            ],
            [
              "$a0-$a3",
              "$4-$7",
              "Arguments",
              "Function arguments"
            ],
            [
              "$t0-$t9",
              "$8-$15, $24-$25",
              "Temporaries",
              "Caller-saved"
            ],
            [
              "$s0-$s7",
              "$16-$23",
              "Saved",
              "Callee-saved"
            ],
            [
              "$gp",
              "$28",
              "Global pointer",
              "Global data"
            ],
            [
              "$sp",
              "$29",
              "Stack pointer",
              "Stack"
            ],
            [
              "$fp",
              "$30",
              "Frame pointer",
              "Stack frame"
            ],
            [
              "$ra",
              "$31",
              "Return address",
              "Function return"
            ]
          ]
        }
      },
      {
        "id": "sec-47-1-3",
        "title": "47.1.3 Key MIPS Features",
        "content": "1. Branch delay slot: Instruction after branch executes\n2. Load delay slot: Instruction after load cannot use result immediately\n3. No condition codes: Compare instructions set GPRs\n4. Fixed 32-bit instructions: Simple decoding\n5. Harvard architecture: Separate instruction/data caches"
      },
      {
        "id": "sec-47-1-4",
        "title": "47.1.4 MIPS Pipeline (Classic 5-stage)",
        "content": "1. IF: Instruction Fetch\n2. ID: Instruction Decode / Register Read\n3. EX: Execute / Address Calculation\n4. MEM: Memory Access\n5. WB: Write Back"
      },
      {
        "id": "sec-47-1-5",
        "title": "47.1.5 Branch Delay Slot Trade-off",
        "content": "",
        "codeSnippets": [
          {
            "title": "Branch Delay Slot Trade-off — example",
            "language": "mips",
            "code": "# Branch delay slot: instruction AFTER branch executes\nbeq $a0, $a1, target\nnop                  # Delay slot (often nop)\n\n# Or use useful instruction:\nbeq $a0, $a1, target\nadd $v0, $a0, $a1   # Delay slot (useful work)"
          }
        ]
      },
      {
        "id": "sec-47-1-6",
        "title": "47.1.6 Why Delay Slots Exist",
        "content": "In early pipelined processors, by the time the branch condition was evaluated, the next instruction had already been fetched. Instead of flushing the pipeline, MIPS architecturally executes the delay slot instruction."
      },
      {
        "id": "sec-47-1-7",
        "title": "47.1.7 MIPS System Calls (Linux O32)",
        "content": "",
        "tableData": {
          "headers": [
            "Number",
            "Name",
            "Arguments"
          ],
          "rows": [
            [
              "4004",
              "write",
              "$a0=fd, $a1=buf, $a2=len"
            ],
            [
              "4003",
              "read",
              "$a0=fd, $a1=buf, $a2=len"
            ],
            [
              "4001",
              "exit",
              "$a0=status"
            ],
            [
              "4005",
              "open",
              "$a0=pathname, $a1=flags"
            ]
          ]
        }
      },
      {
        "id": "sec-47-1-8",
        "title": "47.1.8 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "mips",
            "title": "MIPS32 Hello World",
            "code": ".section .data\nmsg:\n    .ascii \"Hello, World!\\n\"\n    len = . - msg\n\n.section .text\n.global _start\n\n_start:\n    li $v0, 4004        # syscall 4004 = write (MIPS O32)\n    li $a0, 1           # stdout\n    la $a1, msg\n    li $a2, len\n    syscall\n\n    li $v0, 4001        # syscall 4001 = exit\n    li $a0, 0\n    syscall"
          }
        ]
      },
      {
        "id": "sec-47-2",
        "title": "47.2 MIPS Instruction Set",
        "content": "MIPS uses fixed-length 32-bit instructions with 3-operand format."
      },
      {
        "id": "sec-47-2-1",
        "title": "47.2.1 Instruction Formats (MIPS)",
        "content": "",
        "tableData": {
          "headers": [
            "Format",
            "Usage",
            "Layout"
          ],
          "rows": [
            [
              "R-type",
              "Register",
              "op[31:26] rs[25:21] rt[20:16] rd[15:11] shamt[10:6] funct[5:0]"
            ],
            [
              "I-type",
              "Immediate",
              "op[31:26] rs[25:21] rt[20:16] imm[15:0]"
            ],
            [
              "J-type",
              "Jump",
              "op[31:26] addr[25:0]"
            ]
          ]
        }
      },
      {
        "id": "sec-47-2-2",
        "title": "47.2.2 Arithmetic Instructions",
        "content": "",
        "codeSnippets": [
          {
            "title": "Arithmetic Instructions — example",
            "language": "mips",
            "code": "# Register-register (R-type)\nadd  $t0, $t1, $t2    # $t0 = $t1 + $t2 (trap on overflow)\naddu $t0, $t1, $t2    # $t0 = $t1 + $t2 (no trap)\nsub  $t0, $t1, $t2    # $t0 = $t1 - $t2\nsubu $t0, $t1, $t2    # $t0 = $t1 - $t2 (no trap)\nand  $t0, $t1, $t2    # $t0 = $t1 & $t2\nor   $t0, $t1, $t2    # $t0 = $t1 | $t2\nxor  $t0, $t1, $t2    # $t0 = $t1 ^ $t2\nnor  $t0, $t1, $t2    # $t0 = ~($t1 | $t2)\nslt  $t0, $t1, $t2    # $t0 = ($t1 < $t2) ? 1 : 0\nsltu $t0, $t1, $t2    # $t0 = ($t1 < $t2) ? 1 : 0 (unsigned)\n\n# Shifts\nsll  $t0, $t1, 5      # $t0 = $t1 << 5\nsrl  $t0, $t1, 5      # $t0 = $t1 >> 5 (logical)\nsra  $t0, $t1, 5      # $t0 = $t1 >> 5 (arithmetic)\nsllv $t0, $t1, $t2    # $t0 = $t1 << $t2\nsrlv $t0, $t1, $t2    # $t0 = $t1 >> $t2\n\n# Multiply/Divide\nmult $t0, $t1          # HI:LO = $t0 * $t1 (signed)\nmultu $t0, $t1         # HI:LO = $t0 * $t1 (unsigned)\ndiv  $t0, $t1          # LO = $t0 / $t1, HI = $t0 % $t1\ndivu $t0, $t1          # LO = $t0 / $t1, HI = $t0 % $t1 (unsigned)\nmfhi $t0               # Move from HI\nmflo $t0               # Move from LO"
          }
        ]
      },
      {
        "id": "sec-47-2-3",
        "title": "47.2.3 Load/Store Instructions",
        "content": "",
        "codeSnippets": [
          {
            "title": "Load/Store Instructions — example",
            "language": "mips",
            "code": "# Load (I-type)\nlb   $t0, 0($t1)      # Load byte (sign-extended)\nlbu  $t0, 0($t1)      # Load byte unsigned\nlh   $t0, 0($t1)      # Load halfword (16-bit)\nlhu  $t0, 0($t1)      # Load halfword unsigned\nlw   $t0, 0($t1)      # Load word (32-bit)\nlwl  $t0, 0($t1)      # Load word left (unaligned)\nlwr  $t0, 0($t1)      # Load word right (unaligned)\n\n# Store (S-type)\nsb   $t0, 0($t1)      # Store byte\nsh   $t0, 0($t1)      # Store halfword\nsw   $t0, 0($t1)      # Store word\nswl  $t0, 0($t1)      # Store word left\nswr  $t0, 0($t1)      # Store word right\n\n# Example: Load/Store with offset\nlw   $t0, 8($sp)      # Load word from sp+8\nsw   $t0, 12($sp)     # Store word to sp+12"
          }
        ]
      },
      {
        "id": "sec-47-2-4",
        "title": "47.2.4 Branch Instructions (I-type)",
        "content": "",
        "codeSnippets": [
          {
            "title": "Branch Instructions (I-type) — example",
            "language": "mips",
            "code": "# Branch on condition\nbeq  $t0, $t1, label  # Branch if $t0 == $t1\nbne  $t0, $t1, label  # Branch if $t0 != $t1\nblez $t0, label       # Branch if $t0 <= 0\nbgtz $t0, label       # Branch if $t0 > 0\nbltz $t0, label       # Branch if $t0 < 0\nbgez $t0, label       # Branch if $t0 >= 0\n\n# Jump (J-type)\nj    label            # Jump to label\njal  label            # Jump and link (call)\njr   $ra              # Jump to register (return)\njalr $ra, $t0         # Jump and link register\n\n# Compare and branch (pseudo-instructions)\nbeqz $t0, label       # Branch if $t0 == 0\nbnez $t0, label       # Branch if $t0 != 0\nblt  $t0, $t1, label  # Branch if $t0 < $t1 (pseudo)\nbge  $t0, $t1, label  # Branch if $t0 >= $t1 (pseudo)"
          }
        ]
      },
      {
        "id": "sec-47-2-5",
        "title": "47.2.5 Delay Slot Handling",
        "content": "",
        "codeSnippets": [
          {
            "title": "Delay Slot Handling — example",
            "language": "mips",
            "code": "# Bad: Delay slot contains instruction that affects branch\nadd $t0, $t1, $t2\nbeq $t0, $zero, target\nsub $t0, $t1, $t2   # Delay slot modifies $t0!\n\n# Good: Delay slot contains useful instruction\nbeq $a0, $a1, target\nadd $v0, $a0, $a1   # Delay slot does useful work\n\n# Or use nop (assembler fills delay slot)\nbeq $a0, $a1, target\nnop                  # Safe but wastes cycle"
          }
        ]
      },
      {
        "id": "sec-47-2-6",
        "title": "47.2.6 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "mips",
            "title": "MIPS Instruction Examples",
            "code": ".section .text\n.global _start\n\n_start:\n    # Load immediate values\n    li $t0, 10           # $t0 = 10\n    li $t1, 20           # $t1 = 20\n    \n    # Arithmetic\n    add $t2, $t0, $t1    # $t2 = 30\n    sub $t3, $t1, $t0    # $t3 = 10\n    mult $t0, $t1        # HI:LO = 200\n    mflo $t4             # $t4 = 200\n    \n    # Logical\n    and $t5, $t0, $t1    # Bitwise AND\n    or  $t6, $t0, $t1    # Bitwise OR\n    xor $t7, $t0, $t1    # Bitwise XOR\n    \n    # Shifts\n    sll $t0, $t0, 3      # Left shift by 3\n    srl $t1, $t1, 1      # Right shift by 1\n    \n    # Load/Store\n    la  $t3, data        # Get address\n    lw  $t4, 0($t3)      # Load word\n    addi $t4, $t4, 1     # Increment\n    sw  $t4, 0($t3)      # Store word\n    \n    # Branch (with delay slot)\n    beq $t0, $t1, equal\n    nop                  # Delay slot\n    \n    bne $t0, $t1, not_equal\n    nop\n    \nequal:\n    # $t0 == $t1\n    j done\n    \nnot_equal:\n    # $t0 != $t1\n    \ndone:\n    # Exit\n    li $v0, 4001\n    li $a0, 0\n    syscall\n\n.section .data\ndata:\n    .word 42"
          }
        ]
      },
      {
        "id": "sec-47-3",
        "title": "47.3 Other Architectures",
        "content": "Survey of other important architectures."
      },
      {
        "id": "sec-47-3-1",
        "title": "47.3.1 SPARC (Scalable Processor Architecture)",
        "content": "• Register windows: Overlapping register sets for fast context switch\n• Used in: Sun/Oracle servers, embedded systems\n• Features: Delay slots, condition codes (ICC, XCC)\n\nsparc",
        "codeSnippets": [
          {
            "title": "SPARC (Scalable Processor Architecture) — example",
            "language": "mips",
            "code": "# SPARC register window example\nsave %sp, -96, %sp    # Create new register window\n...                    # Function body\nrestore               # Restore previous window"
          }
        ]
      },
      {
        "id": "sec-47-3-2",
        "title": "47.3.2 PowerPC",
        "content": "• Big-endian by default (configurable)\n• Condition register field (CR0-CR7)\n• Used in: Game consoles (Wii, Xbox 360), embedded\n• Features: Link register, count register\n\npowerpc",
        "codeSnippets": [
          {
            "title": "PowerPC — example",
            "language": "mips",
            "code": "# PowerPC example\nadd r3, r4, r5        # r3 = r4 + r5\nbctrl                 # Branch to count register (call)\nmflr r0               # Move from link register"
          }
        ]
      },
      {
        "id": "sec-47-3-3",
        "title": "47.3.3 AVR (8-bit Microcontrollers)",
        "content": "• Harvard architecture (separate program/data)\n• Used in: Arduino, embedded systems\n• Features: Limited registers (R0-R31), I/O ports\n\navr",
        "codeSnippets": [
          {
            "title": "AVR (8-bit Microcontrollers) — example",
            "language": "mips",
            "code": "; AVR assembly example\nldi r16, 42           ; Load immediate\nout PORTB, r16        ; Output to port\nin r17, PINB          ; Input from port"
          }
        ]
      },
      {
        "id": "sec-47-3-4",
        "title": "47.3.4 MSP430 (16-bit Ultra-Low-Power)",
        "content": "• RISC architecture for ultra-low power\n• Used in: TI LaunchPad, sensors\n• Features: 16 registers, simple instruction set\n\nmsp430",
        "codeSnippets": [
          {
            "title": "MSP430 (16-bit Ultra-Low-Power) — example",
            "language": "mips",
            "code": "; MSP430 assembly example\nmov.w #0x0200, SP     ; Initialize stack pointer\nmov.w #0x0001, &P1OUT ; Set output bit"
          }
        ]
      },
      {
        "id": "sec-47-3-5",
        "title": "47.3.5 VLIW/EPIC (Itanium)",
        "content": "• Very Long Instruction Word\n• Multiple operations per instruction\n• Used in: Intel Itanium (IA-64)\n• Features: Explicit parallelism, predication\n\nitanium",
        "codeSnippets": [
          {
            "title": "VLIW/EPIC (Itanium) — example",
            "language": "mips",
            "code": "; IA-64 (Itanium) example\n(p1) add r1 = r2, r3  ; Predicate p1 controls execution\n(p2) sub r4 = r5, r6"
          }
        ]
      },
      {
        "id": "sec-47-3-6",
        "title": "47.3.6 Comparison Table",
        "content": "",
        "tableData": {
          "headers": [
            "Architecture",
            "Bits",
            "Registers",
            "Endian",
            "Features"
          ],
          "rows": [
            [
              "x86-64",
              "64",
              "16",
              "Little",
              "CISC, variable length"
            ],
            [
              "ARM64",
              "64",
              "31",
              "Little",
              "RISC, fixed length"
            ],
            [
              "RISC-V",
              "64",
              "31",
              "Little",
              "Open, modular"
            ],
            [
              "MIPS",
              "32/64",
              "32",
              "Bi",
              "Delay slots"
            ],
            [
              "SPARC",
              "32/64",
              "128+",
              "Big",
              "Register windows"
            ],
            [
              "PowerPC",
              "32/64",
              "32",
              "Big",
              "Condition fields"
            ],
            [
              "AVR",
              "8",
              "32",
              "Little",
              "Harvard, embedded"
            ]
          ]
        }
      },
      {
        "id": "sec-47-3-7",
        "title": "47.3.7 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "mips",
            "title": "MIPS Delay Slot Example",
            "code": ".section .text\n.global _start\n\n_start:\n    # Load values\n    li $t0, 10\n    li $t1, 20\n    \n    # Branch with delay slot\n    beq $t0, $t1, equal\n    add $t2, $t0, $t1   # Delay slot: executes before branch!\n    \n    # Not equal path\n    li $v0, 4004\n    li $a0, 1\n    la $a1, msg_ne\n    li $a2, len_ne\n    syscall\n    j exit\n    \nequal:\n    li $v0, 4004\n    li $a0, 1\n    la $a1, msg_eq\n    li $a2, len_eq\n    syscall\n    \nexit:\n    li $v0, 4001\n    li $a0, 0\n    syscall\n\n.section .data\nmsg_eq:\n    .ascii \"Equal\\n\"\n    len_eq = . - msg_eq\nmsg_ne:\n    .ascii \"Not Equal\\n\"\n    len_ne = . - msg_ne"
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-47-1",
        "title": "Exercise 47.1: MIPS Delay Slot Protection",
        "description": "Demonstrate safe branch handling in MIPS by placing a nop in the branch delay slot.",
        "solution": "beq $a0, $a1, .target\nnop                  # delay slot executed before branch jump!\nmove $v0, $zero",
        "solutionLanguage": "mips"
      },
      {
        "id": "ex-47-2",
        "title": "Exercise 47.2: MIPS Recursive Factorial",
        "description": "Implement factorial in MIPS32 assembly.",
        "solution": "Use $ra for return address, $s0 for saved argument. Base case: n<=1 return 1. Recursive: save n, call factorial(n-1), multiply n*result. Save/restore $ra and $s0 on stack."
      },
      {
        "id": "ex-47-3",
        "title": "Exercise 47.3: SPARC Register Windows",
        "description": "Explain how SPARC register windows work for function calls.",
        "solution": "SPARC has overlapping register windows. save instruction shifts window (new locals/globals), restore shifts back. This avoids saving registers to memory for most function calls, speeding up context switches."
      },
      {
        "id": "ex-47-4",
        "title": "Exercise 47.4: Architecture Comparison",
        "description": "Compare MIPS delay slots with ARM64 conditional execution.",
        "solution": "MIPS delay slots execute instruction after branch (pipeline optimization). ARM64 CSEL/conditional instructions avoid branches entirely. Different approaches to the same problem: reducing branch penalties."
      }
    ],
    "practiceQuestions": [
      {
        "question": "What is the MIPS branch delay slot?",
        "answer": "In early pipelined architectures, the instruction following a branch had already been fetched by the time the branch condition was evaluated. Rather than flush the pipeline, MIPS architecturally executes the instruction in the delay slot before jumping. This saves a cycle but complicates programming."
      },
      {
        "question": "Why do MIPS delay slots exist?",
        "answer": "Delay slots exist to avoid pipeline flushes when branches are taken. In a 5-stage pipeline, by the time the branch condition is resolved (stage 3), the next instruction is already fetched (stage 1). Instead of discarding it, MIPS executes it, saving a cycle on taken branches."
      },
      {
        "question": "How do SPARC register windows improve performance?",
        "answer": "SPARC register windows provide overlapping register sets for function calls. When a function is called, a new window is created with fresh registers, avoiding memory saves. The called function gets new local registers while sharing argument registers with the caller. This reduces memory traffic for function calls."
      },
      {
        "question": "What is the difference between MIPS and RISC-V?",
        "answer": "Key differences: MIPS has delay slots (RISC-V does not), MIPS has dedicated HI/LO registers for multiply (RISC-V uses general registers), MIPS has 32 registers with $zero, RISC-V has 32 with x0. RISC-V is open-source and modular, MIPS is proprietary with fixed features."
      },
      {
        "question": "How do embedded architectures like AVR differ from desktop CPUs?",
        "answer": "Embedded architectures: (1) Smaller register set (AVR: 32 8-bit), (2) Limited memory (KB vs GB), (3) Lower clock speeds (MHz vs GHz), (4) Power efficiency critical, (5) Often Harvard architecture (separate program/data), (6) Simple instruction sets for small decoders."
      },
      {
        "question": "What is VLIW and why is it used?",
        "answer": "VLIW (Very Long Instruction Word) encodes multiple operations in a single large instruction word. The compiler statically schedules parallel operations.优点: Simple hardware (no dynamic scheduling), deterministic timing. 缺点: Code bloat, compiler complexity, poor for dynamic execution."
      }
    ],
    "summary": [
      "MIPS pioneered RISC concepts and influenced modern architectures.",
      "Branch delay slots are a pipeline trade-off for performance.",
      "SPARC register windows accelerate function calls.",
      "PowerPC uses condition register fields for efficient branching.",
      "AVR and MSP430 serve ultra-low-power embedded applications.",
      "Understanding historical architectures enriches systems engineering.",
      "Each architecture embodies different engineering trade-offs.",
      "Architecture choice depends on application requirements."
    ]
  },
  {
    "id": 48,
    "slug": "chapter-48-comparing-architectures-isa-tradeoffs",
    "level": 9,
    "levelTitle": "Cross-Platform and Alternative Architectures",
    "title": "Chapter 48: Comparing Architectures: ISA Design and Trade-offs",
    "subtitle": "Side-by-Side Comparison: x86-64 vs ARM64 vs RISC-V vs MIPS",
    "learningObjectives": [
      "Compare and contrast the 4 major ISAs across instruction encoding, registers, addressing, and control flow.",
      "Analyze code density, decoder complexity, and energy efficiency.",
      "Map equivalent operations across all 4 architectures.",
      "Make informed hardware and ISA architectural selections for technical projects.",
      "Understand historical evolution of processor architectures.",
      "Analyze performance vs power vs code density trade-offs.",
      "Evaluate architecture choice for specific applications.",
      "Study future trends in processor architecture design."
    ],
    "prerequisites": [
      "Chapters 1–47"
    ],
    "keyConcepts": [
      "CISC vs RISC: Variable vs fixed-length instructions.",
      "x86-64 maximizes code density with variable-length CISC instructions.",
      "ARM64 and RISC-V maximize power efficiency and decoder throughput with clean 32-bit RISC words.",
      "Register counts dictate memory traffic and instruction field encoding.",
      "Trade-offs: code density vs decoder complexity vs power vs performance.",
      "Architecture choice depends on application requirements.",
      "Legacy compatibility vs modern design trade-offs.",
      "Future trends: chiplets, domain-specific architectures."
    ],
    "diagramType": "isa_comparison",
    "sections": [
      {
        "id": "sec-48-1",
        "title": "48.1 The Grand Architectural Matrix",
        "content": "Comprehensive side-by-side comparison of the 4 major architectures:"
      },
      {
        "id": "sec-48-1-1",
        "title": "48.1.1 Instruction Set Philosophy",
        "content": "",
        "tableData": {
          "headers": [
            "Aspect",
            "x86-64",
            "ARM64",
            "RISC-V",
            "MIPS"
          ],
          "rows": [
            [
              "Design",
              "CISC",
              "RISC",
              "RISC",
              "RISC"
            ],
            [
              "Instruction size",
              "Variable (1-15 bytes)",
              "Fixed (4 bytes)",
              "Fixed (4 bytes)",
              "Fixed (4 bytes)"
            ],
            [
              "Instruction count",
              "1000+",
              "~200",
              "~50 base",
              "~100"
            ],
            [
              "Decoder complexity",
              "High",
              "Low",
              "Very Low",
              "Low"
            ],
            [
              "Code density",
              "Excellent",
              "Good",
              "Good",
              "Good"
            ],
            [
              "Power efficiency",
              "Lower",
              "High",
              "High",
              "High"
            ]
          ]
        }
      },
      {
        "id": "sec-48-1-2",
        "title": "48.1.2 Register Comparison",
        "content": "",
        "tableData": {
          "headers": [
            "Feature",
            "x86-64",
            "ARM64",
            "RISC-V",
            "MIPS"
          ],
          "rows": [
            [
              "General registers",
              "16",
              "31",
              "31",
              "32"
            ],
            [
              "Zero register",
              "None (XOR)",
              "XZR",
              "x0",
              "$zero"
            ],
            [
              "Argument registers",
              "RDI,RSI,RDX,RCX,R8,R9",
              "X0-X7",
              "a0-a7",
              "$a0-$a3"
            ],
            [
              "Callee-saved",
              "RBX,RBP,R12-R15",
              "X19-X28",
              "s0-s11",
              "$s0-$s7"
            ],
            [
              "Return address",
              "Stack (push/pop)",
              "X30 (LR)",
              "ra",
              "$ra"
            ],
            [
              "Condition codes",
              "RFLAGS",
              "PSTATE",
              "None",
              "None"
            ]
          ]
        }
      },
      {
        "id": "sec-48-1-3",
        "title": "48.1.3 Memory Access Patterns",
        "content": "",
        "tableData": {
          "headers": [
            "Feature",
            "x86-64",
            "ARM64",
            "RISC-V",
            "MIPS"
          ],
          "rows": [
            [
              "Addressing modes",
              "Many (base+idx*scale+disp)",
              "Few (base+offset)",
              "Very Few (base+offset)",
              "Few (base+offset)"
            ],
            [
              "Memory operands",
              "In any instruction",
              "Load/Store only",
              "Load/Store only",
              "Load/Store only"
            ],
            [
              "Alignment",
              "Not required",
              "Recommended",
              "Recommended",
              "Required"
            ],
            [
              "Atomic operations",
              "LOCK prefix",
              "LDXR/STXR",
              "LR/SC",
              "LL/SC"
            ]
          ]
        }
      },
      {
        "id": "sec-48-1-4",
        "title": "48.1.4 Control Flow",
        "content": "",
        "tableData": {
          "headers": [
            "Feature",
            "x86-64",
            "ARM64",
            "RISC-V",
            "MIPS"
          ],
          "rows": [
            [
              "Condition handling",
              "RFLAGS (all instructions)",
              "PSTATE (compare only)",
              "Direct compare branches",
              "Direct compare branches"
            ],
            [
              "Conditional move",
              "CMOV",
              "CSEL",
              "None (use branches)",
              "None (use branches)"
            ],
            [
              "Indirect jump",
              "JMP [addr]",
              "BR x0",
              "jr",
              "jr"
            ],
            [
              "Function call",
              "CALL (pushes RIP)",
              "BL (stores in LR)",
              "jal (stores in ra)",
              "jal (stores in $ra)"
            ],
            [
              "Return",
              "RET (pops RIP)",
              "RET (branches to LR)",
              "ret (jr ra)",
              "jr $ra"
            ],
            [
              "Delay slots",
              "No",
              "No",
              "No",
              "Yes (1 instruction)"
            ]
          ]
        }
      },
      {
        "id": "sec-48-1-5",
        "title": "48.1.5 System Calls",
        "content": "",
        "tableData": {
          "headers": [
            "Feature",
            "x86-64",
            "ARM64",
            "RISC-V",
            "MIPS"
          ],
          "rows": [
            [
              "Instruction",
              "syscall",
              "svc #0",
              "ecall",
              "syscall"
            ],
            [
              "Number register",
              "RAX",
              "X8",
              "a7",
              "$v0"
            ],
            [
              "Arguments",
              "RDI,RSI,RDX,R10,R8,R9",
              "X0-X5",
              "a0-a5",
              "$a0-$a3"
            ],
            [
              "Return",
              "RAX",
              "X0",
              "a0",
              "$v0"
            ],
            [
              "Linux numbers",
              "1,2,3...",
              "64,63,93...",
              "64,63,93...",
              "4004,4003,4001..."
            ]
          ]
        }
      },
      {
        "id": "sec-48-1-6",
        "title": "48.1.6 Power Efficiency Ranking (Best to Worst)",
        "content": "1. RISC-V: Minimalist design, open-source\n2. ARM64: Optimized for mobile, good performance/watt\n3. MIPS: Simple RISC, efficient\n4. x86-64: Complex decoder, higher power"
      },
      {
        "id": "sec-48-1-7",
        "title": "48.1.7 Code Density Ranking (Best to Worst)",
        "content": "1. x86-64: Variable-length instructions (1-15 bytes)\n2. ARM64: Fixed 4-byte instructions\n3. RISC-V: Fixed 4-byte (or 2-byte with C extension)\n4. MIPS: Fixed 4-byte instructions"
      },
      {
        "id": "sec-48-1-8",
        "title": "48.1.8 When to Use Each Architecture",
        "content": "",
        "tableData": {
          "headers": [
            "Use Case",
            "Recommended",
            "Reason"
          ],
          "rows": [
            [
              "Desktop/Server",
              "x86-64",
              "Compatibility, software ecosystem"
            ],
            [
              "Mobile/Embedded",
              "ARM64",
              "Power efficiency, ecosystem"
            ],
            [
              "IoT/Microcontrollers",
              "RISC-V",
              "Open, customizable, low power"
            ],
            [
              "Legacy embedded",
              "MIPS",
              "Simple, low cost"
            ],
            [
              "Cloud servers",
              "ARM64/RISC-V",
              "Power/cost efficiency"
            ],
            [
              "High-performance",
              "x86-64",
              "Maximum performance"
            ],
            [
              "Custom hardware",
              "RISC-V",
              "Open, extensible"
            ]
          ]
        }
      },
      {
        "id": "sec-48-2",
        "title": "48.2 Code Comparison Across Architectures",
        "content": "Same operations implemented in all 4 architectures."
      },
      {
        "id": "sec-48-2-1",
        "title": "48.2.1 Hello World Comparison",
        "content": "All architectures implement write(1, msg, len) and exit(0):"
      },
      {
        "id": "sec-48-2-2",
        "title": "48.2.2 x86-64:",
        "content": "",
        "codeSnippets": [
          {
            "title": "x86-64: — example",
            "language": "nasm",
            "code": "mov rax, 1      ; sys_write\nmov rdi, 1      ; fd\nmov rsi, msg    ; buf\nmov rdx, len    ; count\nsyscall\n\nmov rax, 60     ; sys_exit\nxor rdi, rdi    ; status\nsyscall"
          }
        ]
      },
      {
        "id": "sec-48-2-3",
        "title": "48.2.3 ARM64:",
        "content": "",
        "codeSnippets": [
          {
            "title": "ARM64: — example",
            "language": "arm",
            "code": "mov x0, #1      ; fd\nadr x1, msg     ; buf\nmov x2, #len    ; count\nmov x8, #64     ; sys_write\nsvc #0\n\nmov x0, #0      ; status\nmov x8, #93     ; sys_exit\nsvc #0"
          }
        ]
      },
      {
        "id": "sec-48-2-4",
        "title": "48.2.4 RISC-V:",
        "content": "",
        "codeSnippets": [
          {
            "title": "RISC-V: — example",
            "language": "riscv",
            "code": "li a0, 1        # fd\nla a1, msg      # buf\nli a2, len      # count\nli a7, 64       # sys_write\necall\n\nli a0, 0        # status\nli a7, 93       # sys_exit\necall"
          }
        ]
      },
      {
        "id": "sec-48-2-5",
        "title": "48.2.5 MIPS:",
        "content": "",
        "codeSnippets": [
          {
            "title": "MIPS: — example",
            "language": "mips",
            "code": "li $v0, 4004    # sys_write\nli $a0, 1       # fd\nla $a1, msg     # buf\nli $a2, len     # count\nsyscall\n\nli $v0, 4001    # sys_exit\nli $a0, 0       # status\nsyscall"
          }
        ]
      },
      {
        "id": "sec-48-2-6",
        "title": "48.2.6 Fibonacci Comparison",
        "content": "All architectures compute Fibonacci(10):"
      },
      {
        "id": "sec-48-2-7",
        "title": "48.2.7 x86-64:",
        "content": "",
        "codeSnippets": [
          {
            "title": "x86-64: — example",
            "language": "nasm",
            "code": "fib:\n    xor eax, eax\n    mov ecx, 10\n.loop:\n    add eax, 1\n    loop .loop\n    ret"
          }
        ]
      },
      {
        "id": "sec-48-2-8",
        "title": "48.2.8 ARM64:",
        "content": "",
        "codeSnippets": [
          {
            "title": "ARM64: — example",
            "language": "arm",
            "code": "fib:\n    mov w0, #0\n    mov w1, #1\n    mov w2, #10\n.loop:\n    add w0, w0, w1\n    subs w2, w2, #1\n    b.ne .loop\n    ret"
          }
        ]
      },
      {
        "id": "sec-48-2-9",
        "title": "48.2.9 RISC-V:",
        "content": "",
        "codeSnippets": [
          {
            "title": "RISC-V: — example",
            "language": "riscv",
            "code": "fib:\n    li a0, 0\n    li a1, 1\n    li a2, 10\n.loop:\n    add a0, a0, a1\n    addi a2, a2, -1\n    bnez a2, .loop\n    ret"
          }
        ]
      },
      {
        "id": "sec-48-2-10",
        "title": "48.2.10 MIPS:",
        "content": "",
        "codeSnippets": [
          {
            "title": "MIPS: — example",
            "language": "mips",
            "code": "fib:\n    li $v0, 0\n    li $v1, 1\n    li $t0, 10\nloop:\n    add $v0, $v0, $v1\n    addi $t0, $t0, -1\n    bnez $t0, loop\n    jr $ra"
          }
        ]
      },
      {
        "id": "sec-48-2-11",
        "title": "48.2.11 String Length Comparison",
        "content": "All architectures compute strlen:"
      },
      {
        "id": "sec-48-2-12",
        "title": "48.2.12 x86-64:",
        "content": "",
        "codeSnippets": [
          {
            "title": "x86-64: — example",
            "language": "nasm",
            "code": "strlen:\n    xor eax, eax\n.loop:\n    cmp byte [rdi+rax], 0\n    je .done\n    inc eax\n    jmp .loop\n.done:\n    ret"
          }
        ]
      },
      {
        "id": "sec-48-2-13",
        "title": "48.2.13 ARM64:",
        "content": "",
        "codeSnippets": [
          {
            "title": "ARM64: — example",
            "language": "arm",
            "code": "strlen:\n    mov x2, x0\n.loop:\n    ldrb w1, [x2], #1\n    cbnz w1, .loop\n    sub x0, x2, x0\n    ret"
          }
        ]
      },
      {
        "id": "sec-48-2-14",
        "title": "48.2.14 RISC-V:",
        "content": "",
        "codeSnippets": [
          {
            "title": "RISC-V: — example",
            "language": "riscv",
            "code": "strlen:\n    li a1, 0\n.loop:\n    lb a2, 0(a0)\n    addi a0, a0, 1\n    addi a1, a1, 1\n    bnez a2, .loop\n    addi a0, a1, -1\n    ret"
          }
        ]
      },
      {
        "id": "sec-48-2-15",
        "title": "48.2.15 MIPS:",
        "content": "",
        "codeSnippets": [
          {
            "title": "MIPS: — example",
            "language": "mips",
            "code": "strlen:\n    li $v0, 0\nloop:\n    lb $t0, 0($a0)\n    addi $a0, $a0, 1\n    addi $v0, $v0, 1\n    bnez $t0, loop\n    addi $v0, $v0, -1\n    jr $ra"
          }
        ]
      },
      {
        "id": "sec-48-3",
        "title": "48.3 Architecture Selection Guide",
        "content": "How to choose the right architecture for your project."
      },
      {
        "id": "sec-48-3-1",
        "title": "48.3.1 Decision Factors",
        "content": "1. Power budget: Battery-powered vs wall-powered\n2. Performance needs: Real-time vs throughput\n3. Code size: Flash memory constraints\n4. Software ecosystem: OS support, toolchains\n5. Cost: Licensing, development tools\n6. Legacy support: Existing codebase compatibility\n7. Team expertise: Developer knowledge\n8. Time-to-market: Available tools/libraries"
      },
      {
        "id": "sec-48-3-2",
        "title": "48.3.2 Application-Specific Recommendations",
        "content": ""
      },
      {
        "id": "sec-48-3-3",
        "title": "48.3.3 Mobile Devices:",
        "content": "• ARM64: Dominant, excellent power efficiency\n• RISC-V: Emerging, customizable for specific needs\n• Avoid x86-64 (power too high)"
      },
      {
        "id": "sec-48-3-4",
        "title": "48.3.4 Embedded/IoT:",
        "content": "• ARM Cortex-M: Excellent ecosystem, low power\n• RISC-V: Open, no licensing fees, customizable\n• AVR/8-bit: Very low cost, simple"
      },
      {
        "id": "sec-48-3-5",
        "title": "48.3.5 Desktop/Server:",
        "content": "• x86-64: Maximum compatibility, performance\n• ARM64: Growing (AWS Graviton, Apple M-series)\n• RISC-V: Future potential"
      },
      {
        "id": "sec-48-3-6",
        "title": "48.3.6 Cloud/Data Center:",
        "content": "• ARM64: Power/cost efficiency (Graviton)\n• x86-64: Legacy, maximum performance\n• RISC-V: Emerging for specific workloads"
      },
      {
        "id": "sec-48-3-7",
        "title": "48.3.7 High-Performance Computing:",
        "content": "• x86-64: Maximum single-thread performance\n• ARM64: Power efficiency for scale-out\n• GPU/TPU: Parallel workloads"
      },
      {
        "id": "sec-48-3-8",
        "title": "48.3.8 Custom Hardware:",
        "content": "• RISC-V: Open, extensible, no royalties\n• MIPS: Simple, low licensing cost\n• Avoid x86-64 (complex, expensive licensing)"
      },
      {
        "id": "sec-48-3-9",
        "title": "48.3.9 Migration Considerations",
        "content": "",
        "tableData": {
          "headers": [
            "From",
            "To",
            "Difficulty",
            "Reason"
          ],
          "rows": [
            [
              "x86-64",
              "ARM64",
              "Medium",
              "Different ISA, but mature toolchain"
            ],
            [
              "x86-64",
              "RISC-V",
              "Hard",
              "Less mature ecosystem"
            ],
            [
              "ARM64",
              "RISC-V",
              "Easy",
              "Similar RISC philosophy"
            ],
            [
              "MIPS",
              "RISC-V",
              "Easy",
              "Similar design principles"
            ],
            [
              "8-bit AVR",
              "ARM Cortex-M",
              "Medium",
              "32-bit vs 8-bit differences"
            ]
          ]
        }
      },
      {
        "id": "sec-48-3-10",
        "title": "48.3.10 Future Trends",
        "content": "1. Chiplets: Mix different architectures in one package\n2. Domain-specific: Custom accelerators (AI, crypto)\n3. Heterogeneous: Big.LITTLE style (ARM)\n4. Open-source: RISC-V adoption growing\n5. Security: Hardware security features (MTE, CHERI)\n6. Power efficiency: Always improving"
      },
      {
        "id": "sec-48-3-11",
        "title": "48.3.11 Key Takeaways",
        "content": "• No single architecture wins everywhere\n• Match architecture to application requirements\n• Consider total cost (licensing, development, maintenance)\n• Ecosystem maturity matters as much as technical merit\n• RISC-V is disrupting traditional proprietary architectures"
      }
    ],
    "exercises": [
      {
        "id": "ex-48-1",
        "title": "Exercise 48.1: Write a = b + c in all 4 architectures",
        "description": "Provide the single instruction expression in x86-64, ARM64, RISC-V, and MIPS.",
        "solution": "x86-64: add rax, rbx (if rax holds b)\nARM64: add x0, x1, x2\nRISC-V: add a0, a1, a2\nMIPS: addu $v0, $a0, $a1",
        "solutionLanguage": "nasm"
      },
      {
        "id": "ex-48-2",
        "title": "Exercise 48.2: Architecture Selection",
        "description": "You need to design a battery-powered IoT sensor. Which architecture do you choose and why?",
        "solution": "ARM Cortex-M4/M33 or RISC-V (e.g., SiFive FE310). Reasons: (1) Ultra-low power, (2) Small code size, (3) Adequate performance for sensors, (4) Mature toolchains, (5) Low cost. ARM has better ecosystem; RISC-V has no licensing fees."
      },
      {
        "id": "ex-48-3",
        "title": "Exercise 48.4: Code Density Analysis",
        "description": "Compare the code size of a simple loop across all 4 architectures.",
        "solution": "x86-64: ~15 bytes (variable length)\nARM64: ~16 bytes (4 instructions × 4 bytes)\nRISC-V: ~16 bytes (4 instructions × 4 bytes)\nMIPS: ~16 bytes (4 instructions × 4 bytes)\nx86-64 wins on code density due to variable-length instructions."
      }
    ],
    "practiceQuestions": [
      {
        "question": "Why does x86-64 have higher code density than RISC-V or ARM64?",
        "answer": "x86 instructions are variable-length (1 to 15 bytes) and allow memory operands directly in arithmetic instructions (like add rax, [rbx]), doing in 1 instruction what requires 2 or 3 instructions in RISC load/store architectures. This makes x86 code more compact, which matters for instruction cache efficiency."
      },
      {
        "question": "What are the trade-offs between CISC and RISC?",
        "answer": "CISC (x86): Higher code density, complex decoder, more power. RISC (ARM/RISC-V): Simpler decoder, lower power, more instructions needed. Modern x86 internally translates to micro-ops (RISC-like). RISC wins on power efficiency; CISC wins on code density and legacy support."
      },
      {
        "question": "How does register count affect architecture design?",
        "answer": "More registers reduce memory traffic (fewer spills/fills) but increase instruction encoding bits (more register specifiers). ARM64/RISC-V (31 regs) reduce memory access vs x86-64 (16 regs) but need more bits per instruction. Trade-off between code density and performance."
      },
      {
        "question": "Why is RISC-V gaining popularity?",
        "answer": "RISC-V benefits: (1) No licensing fees, (2) Open standard, (3) Modular/extensible, (4) Clean design without legacy baggage, (5) Growing ecosystem (Linux, GCC), (6) Industry adoption (SiFive, Espressif), (7) Customizable for domain-specific applications."
      },
      {
        "question": "How do you choose between ARM64 and RISC-V for a new project?",
        "answer": "Choose ARM64 for: mature ecosystem, proven in mobile/server, extensive toolchain/libraries. Choose RISC-V for: no licensing fees, customizable ISA, emerging ecosystem, long-term flexibility, custom accelerators. ARM64 is safer now; RISC-V may be better for custom/embedded long-term."
      },
      {
        "question": "What role does software ecosystem play in architecture choice?",
        "answer": "Software ecosystem is critical: (1) Compiler support (GCC, LLVM), (2) OS support (Linux, RTOS), (3) Libraries and frameworks, (4) Developer tools (debuggers, profilers), (5) Community support, (6) Available developers. A technically superior architecture can fail without ecosystem support."
      }
    ],
    "summary": [
      "Each ISA embodies deliberate engineering trade-offs.",
      "Universal concepts—registers, stacks, control flow—unify all computer architectures.",
      "x86-64 excels in code density and compatibility.",
      "ARM64 excels in power efficiency and mobile ecosystems.",
      "RISC-V excels in openness and customizability.",
      "Architecture choice depends on application requirements.",
      "Software ecosystem matters as much as hardware merit.",
      "Understanding trade-offs enables informed architectural decisions."
    ]
  },
  {
    "id": 49,
    "slug": "chapter-49-writing-portable-assembly-code",
    "level": 9,
    "levelTitle": "Cross-Platform and Alternative Architectures",
    "title": "Chapter 49: Writing Portable Assembly Code",
    "subtitle": "Unified Macros, Conditional Compilation (#ifdef), and System Call Abstraction",
    "learningObjectives": [
      "Abstract architecture-specific instruction and register differences.",
      "Use the C preprocessor (cpp) with uppercase .S files to conditionally target architectures.",
      "Construct a portable system call wrapper layer across x86-64, ARM64, and RISC-V.",
      "Implement a cross-platform portable strlen routine.",
      "Understand portable assembly design principles.",
      "Learn macro techniques for cross-platform code.",
      "Study build system integration for multi-architecture projects.",
      "Explore testing and validation strategies."
    ],
    "prerequisites": [
      "Chapters 1–48"
    ],
    "keyConcepts": [
      "Conditional compilation: #ifdef selects target-specific code at build time.",
      "Macros: Abstract register names and opcode mnemonics.",
      "System call abstractions: Bridge differences in syscall numbers and invocation.",
      "Build systems: Makefile, CMake for multi-architecture builds.",
      "Testing: Cross-compilation and emulation for validation.",
      "Portability vs performance: Trade-offs in abstraction layers.",
      "ABI compatibility: Ensure consistent calling conventions.",
      "Documentation: Essential for portable assembly projects."
    ],
    "diagramType": "portable_assembly",
    "sections": [
      {
        "id": "sec-49-1",
        "title": "49.1 Portable Assembly Design Principles",
        "content": "Writing assembly that works across multiple architectures requires careful abstraction."
      },
      {
        "id": "sec-49-1-1",
        "title": "49.1.1 Design Principles",
        "content": "1. Separate platform-specific code: Use #ifdef for different architectures\n2. Abstract register names: Define macros for common registers\n3. Create function wrappers: Consistent API across platforms\n4. Use portable data types: Fixed-width types (uint32_t, int64_t)\n5. Document assumptions: Architecture-specific behaviors\n6. Test thoroughly: Validate on all target platforms"
      },
      {
        "id": "sec-49-1-2",
        "title": "49.1.2 Why Portable Assembly?",
        "content": "• Single codebase for multiple architectures\n• Reduced maintenance burden\n• Easier testing and validation\n• Leverages architecture-specific optimizations\n• Enables cross-platform libraries"
      },
      {
        "id": "sec-49-1-3",
        "title": "49.1.3 Challenges",
        "content": "1. Different instruction sets: x86 CISC vs ARM/RISC-V MIPS\n2. Register naming: Different names across architectures\n3. Calling conventions: Different argument passing rules\n4. System calls: Different numbers and invocation methods\n5. Data types: Size differences (32-bit vs 64-bit)\n6. Endianness: Little vs big endian"
      },
      {
        "id": "sec-49-1-4",
        "title": "49.1.4 Solutions",
        "content": "1. Preprocessor macros: #ifdef for architecture detection\n2. Register abstraction: Define portable register names\n3. Function wrappers: Consistent API with arch-specific implementations\n4. System call layer: Abstract syscall differences\n5. Type definitions: Use stdint.h types\n6. Byte order macros: Check endianness at compile time"
      },
      {
        "id": "sec-49-1-5",
        "title": "49.1.5 Project Structure",
        "content": "project/\n├── include/\n│   ├── asm/\n│   │   ├── x86_64/\n│   │   │   └── asm.h\n│   │   ├── aarch64/\n│   │   │   └── asm.h\n│   │   └── riscv/\n│   │       └── asm.h\n│   └── portable.h\n├── src/\n│   ├── x86_64/\n│   │   └── syscall_x86_64.S\n│   ├── aarch64/\n│   │   └── syscall_aarch64.S\n│   ├── riscv/\n│   │   └── syscall_riscv.S\n│   └── portable/\n│       └── strlen.S\n└── Makefile"
      },
      {
        "id": "sec-49-2",
        "title": "49.2 Conditional Compilation and Macros",
        "content": "Using C preprocessor for architecture-specific code."
      },
      {
        "id": "sec-49-2-1",
        "title": "49.2.1 Architecture Detection Macros",
        "content": "GCC/Clang provide predefined macros:\nc",
        "codeSnippets": [
          {
            "title": "Architecture Detection Macros — example",
            "language": "c",
            "code": "#if defined(__x86_64__)\n    // x86-64 code\n#elif defined(__aarch64__)\n    // ARM64 code\n#elif defined(__riscv) && (__riscv_xlen == 64)\n    // RISC-V 64-bit code\n#elif defined(__mips__)\n    // MIPS code\n#else\n    #error \"Unsupported architecture\"\n#endif"
          }
        ]
      },
      {
        "id": "sec-49-2-2",
        "title": "49.2.2 Register Abstraction Macros",
        "content": "",
        "codeSnippets": [
          {
            "title": "Register Abstraction Macros — example",
            "language": "c",
            "code": "// x86-64\n#define REG_A  rax\n#define REG_B  rbx\n#define REG_C  rcx\n#define REG_D  rdx\n#define REG_DI rdi\n#define REG_SI rsi"
          },
          {
            "title": "Register Abstraction Macros — example",
            "language": "nasm",
            "code": "// ARM64\n#define REG_A  x0\n#define REG_B  x1\n#define REG_C  x2\n#define REG_D  x3\n#define REG_DI x0\n#define REG_SI x1\n\n// RISC-V\n#define REG_A  a0\n#define REG_B  a1\n#define REG_C  a2\n#define REG_D  a3\n#define REG_DI a0\n#define REG_SI a1"
          }
        ]
      },
      {
        "id": "sec-49-2-3",
        "title": "49.2.3 Instruction Abstraction Macros",
        "content": "",
        "codeSnippets": [
          {
            "title": "Instruction Abstraction Macros — example",
            "language": "c",
            "code": "// Return instruction\n#if defined(__x86_64__)\n    #define RET ret\n#elif defined(__aarch64__)\n    #define RET ret\n#elif defined(__riscv)\n    #define RET ret\n#endif\n\n// Load immediate\n#if defined(__x86_64__)\n    #define LI(reg, imm) mov reg, imm\n#elif defined(__aarch64__)\n    #define LI(reg, imm) mov reg, #imm\n#elif defined(__riscv)\n    #define LI(reg, imm) li reg, imm\n#endif\n\n// System call\n#if defined(__x86_64__)\n    #define SYSCALL syscall\n#elif defined(__aarch64__)\n    #define SYSCALL svc #0\n#elif defined(__riscv)\n    #define SYSCALL ecall\n#endif"
          }
        ]
      },
      {
        "id": "sec-49-2-4",
        "title": "49.2.4 Function Prologue/Epilogue Macros",
        "content": "",
        "codeSnippets": [
          {
            "title": "Function Prologue/Epilogue Macros — example",
            "language": "c",
            "code": "// Function prologue\n#if defined(__x86_64__)\n    #define FUNC_PROLOGUE         push rbp;         mov rbp, rsp\n#elif defined(__aarch64__)\n    #define FUNC_PROLOGUE         stp x29, x30, [sp, #-16]!;         mov x29, sp\n#elif defined(__riscv)\n    #define FUNC_PROLOGUE         addi sp, sp, -16;         sd ra, 8(sp);         sd s0, 0(sp)\n#endif\n\n// Function epilogue\n#if defined(__x86_64__)\n    #define FUNC_EPILOGUE         pop rbp;         ret\n#elif defined(__aarch64__)\n    #define FUNC_EPILOGUE         ldp x29, x30, [sp], #16;         ret\n#elif defined(__riscv)\n    #define FUNC_EPILOGUE         ld s0, 0(sp);         ld ra, 8(sp);         addi sp, sp, 16;         ret\n#endif"
          }
        ]
      },
      {
        "id": "sec-49-2-5",
        "title": "49.2.5 Data Section Macros",
        "content": "",
        "codeSnippets": [
          {
            "title": "Data Section Macros — example",
            "language": "c",
            "code": "// Data declaration\n#if defined(__x86_64__) || defined(__aarch64__) || defined(__riscv)\n    #define QUAD .quad\n    #define WORD .word\n    #define HALF .hword\n    #define BYTE .byte\n    #define ASCIZ .asciz\n    #define ALIGN .align\n#endif"
          },
          {
            "title": "Data Section Macros — example",
            "language": "nasm",
            "code": "// Section directives\n#define SECTION_DATA .section .data\n#define SECTION_TEXT .section .text\n#define SECTION_BSS  .section .bss"
          }
        ]
      },
      {
        "id": "sec-49-2-6",
        "title": "49.2.6 Code examples",
        "content": "",
        "codeSnippets": [
          {
            "language": "c",
            "title": "portable_macros.h",
            "code": "#ifndef PORTABLE_ASM_MACROS_H\n#define PORTABLE_ASM_MACROS_H\n\n// Architecture detection\n#if defined(__x86_64__)\n    #define ARCH_X86_64 1\n#elif defined(__aarch64__)\n    #define ARCH_AARCH64 1\n#elif defined(__riscv) && (__riscv_xlen == 64)\n    #define ARCH_RISCV64 1\n#else\n    #error \"Unsupported architecture\"\n#endif\n\n// Register abstractions\n#if defined(ARCH_X86_64)\n    #define REG_RET    rax\n    #define REG_ARG0   rdi\n    #define REG_ARG1   rsi\n    #define REG_ARG2   rdx\n    #define REG_SP     rsp\n    #define REG_FP     rbp\n#elif defined(ARCH_AARCH64)\n    #define REG_RET    x0\n    #define REG_ARG0   x0\n    #define REG_ARG1   x1\n    #define REG_ARG2   x2\n    #define REG_SP     sp\n    #define REG_FP     x29\n#elif defined(ARCH_RISCV64)\n    #define REG_RET    a0\n    #define REG_ARG0   a0\n    #define REG_ARG1   a1\n    #define REG_ARG2   a2\n    #define REG_SP     sp\n    #define REG_FP     s0\n#endif\n\n// Instruction abstractions\n#if defined(ARCH_X86_64)\n    #define INSTR_RET        ret\n    #define INSTR_NOP        nop\n    #define INSTR_SYSCALL    syscall\n    #define INSTR_MOVE(d, s) mov d, s\n#elif defined(ARCH_AARCH64)\n    #define INSTR_RET        ret\n    #define INSTR_NOP        nop\n    #define INSTR_SYSCALL    svc #0\n    #define INSTR_MOVE(d, s) mov d, s\n#elif defined(ARCH_RISCV64)\n    #define INSTR_RET        ret\n    #define INSTR_NOP        nop\n    #define INSTR_SYSCALL    ecall\n    #define INSTR_MOVE(d, s) mv d, s\n#endif\n\n#endif // PORTABLE_ASM_MACROS_H"
          }
        ]
      },
      {
        "id": "sec-49-3",
        "title": "49.3 Portable System Call Layer",
        "content": "Abstracting system call differences across architectures."
      },
      {
        "id": "sec-49-3-1",
        "title": "49.3.1 System Call Abstraction",
        "content": "",
        "codeSnippets": [
          {
            "title": "System Call Abstraction — example",
            "language": "c",
            "code": "// syscalls.h - Portable system call numbers\n#ifndef SYSCALLS_H\n#define SYSCALLS_H\n\n#if defined(__x86_64__)\n    #define SYS_WRITE  1\n    #define SYS_READ   0\n    #define SYS_EXIT   60\n    #define SYS_OPEN   2\n    #define SYS_CLOSE  3\n#elif defined(__aarch64__)\n    #define SYS_WRITE  64\n    #define SYS_READ   63\n    #define SYS_EXIT   93\n    #define SYS_OPEN   56\n    #define SYS_CLOSE  57\n#elif defined(__riscv)\n    #define SYS_WRITE  64\n    #define SYS_READ   63\n    #define SYS_EXIT   93\n    #define SYS_OPEN   56\n    #define SYS_CLOSE  57\n#endif\n\n// Portable syscall function\n#if defined(__x86_64__)\n    static inline long syscall_write(int fd, const void *buf, size_t count) {\n        long ret;\n        asm volatile (\n            \"syscall\"\n            : \"=a\" (ret)\n            : \"a\" (SYS_WRITE), \"D\" (fd), \"S\" (buf), \"d\" (count)\n            : \"rcx\", \"r11\", \"memory\"\n        );\n        return ret;\n    }\n#elif defined(__aarch64__)\n    static inline long syscall_write(int fd, const void *buf, size_t count) {\n        register long x0 asm(\"x0\") = fd;\n        register const void *x1 asm(\"x1\") = buf;\n        register long x2 asm(\"x2\") = count;\n        register long x8 asm(\"x8\") = SYS_WRITE;\n        asm volatile (\"svc #0\" : \"+r\" (x0) : \"r\" (x1), \"r\" (x2), \"r\" (x8) : \"memory\");\n        return x0;\n    }\n#elif defined(__riscv)\n    static inline long syscall_write(int fd, const void *buf, size_t count) {\n        register long a0 asm(\"a0\") = fd;\n        register const void *a1 asm(\"a1\") = buf;\n        register long a2 asm(\"a2\") = count;\n        register long a7 asm(\"a7\") = SYS_WRITE;\n        asm volatile (\"ecall\" : \"+r\" (a0) : \"r\" (a1), \"r\" (a2), \"r\" (a7) : \"memory\");\n        return a0;\n    }\n#endif"
          },
          {
            "title": "System Call Abstraction — example",
            "language": "nasm",
            "code": "#endif // SYSCALLS_H"
          }
        ]
      },
      {
        "id": "sec-49-3-2",
        "title": "49.3.2 Assembly System Call Wrapper",
        "content": "",
        "codeSnippets": [
          {
            "title": "Assembly System Call Wrapper — example",
            "language": "c",
            "code": "// syscall_wrapper.S - Portable syscall wrapper\n#include \"portable_macros.h\""
          }
        ]
      },
      {
        "id": "sec-49-3-3",
        "title": "49.3.3 Explanation",
        "content": ".section .text\n.global portable_write\n.global portable_exit",
        "codeSnippets": [
          {
            "title": "Explanation — example",
            "language": "nasm",
            "code": "portable_write:\n    FUNC_PROLOGUE\n    # Arguments already in correct registers for each arch\n    LI REG_RET, SYS_WRITE\n    SYSCALL\n    FUNC_EPILOGUE\n\nportable_exit:\n    FUNC_PROLOGUE\n    LI REG_RET, SYS_EXIT\n    SYSCALL\n    FUNC_EPILOGUE"
          }
        ]
      },
      {
        "id": "sec-49-3-4",
        "title": "49.3.4 Building Multi-Architecture",
        "content": "makefile",
        "codeSnippets": [
          {
            "title": "Building Multi-Architecture — example",
            "language": "nasm",
            "code": "# Makefile for cross-compilation\nCC_X86_64 = gcc\nCC_AARCH64 = aarch64-linux-gnu-gcc\nCC_RISCV = riscv64-linux-gnu-gcc"
          }
        ]
      },
      {
        "id": "sec-49-3-5",
        "title": "49.3.5 Explanation",
        "content": "CFLAGS = -O2 -Wall\n\nall: x86_64 aarch64 riscv",
        "codeSnippets": [
          {
            "title": "Explanation — example",
            "language": "nasm",
            "code": "x86_64:\n\t$(CC_X86_64) $(CFLAGS) -o program_x86_64 src/*.S\n\naarch64:\n\t$(CC_AARCH64) $(CFLAGS) -o program_aarch64 src/*.S\n\nriscv:\n\t$(CC_RISCV) $(CFLAGS) -o program_riscv src/*.S\n\nclean:\n\trm -f program_*"
          }
        ]
      },
      {
        "id": "sec-49-3-6",
        "title": "49.3.6 Testing with QEMU",
        "content": "",
        "codeSnippets": [
          {
            "title": "Testing with QEMU — example",
            "language": "bash",
            "code": "# Run ARM64 binary on x86-64 host\nqemu-aarch64 ./program_aarch64"
          },
          {
            "title": "Testing with QEMU — example",
            "language": "nasm",
            "code": "# Run RISC-V binary on x86-64 host\nqemu-riscv64 ./program_riscv\n\n# Or use Docker with multi-arch support\ndocker run --rm -v $(pwd):/work -w /work arm64v8/ubuntu ./program_aarch64"
          }
        ]
      },
      {
        "id": "sec-49-4",
        "title": "49.4 Complete Portable Assembly Example",
        "content": "A complete portable strlen implementation across x86-64, ARM64, and RISC-V."
      },
      {
        "id": "sec-49-4-1",
        "title": "49.4.1 Portable strlen Design",
        "content": "",
        "codeSnippets": [
          {
            "title": "Portable strlen Design — example",
            "language": "c",
            "code": "// strlen.h - Portable strlen declaration\n#ifndef STRLEN_H\n#define STRLEN_H\n\n#include <stddef.h>\n\nsize_t portable_strlen(const char *s);"
          },
          {
            "title": "Portable strlen Design — example",
            "language": "nasm",
            "code": "#endif // STRLEN_H"
          }
        ]
      },
      {
        "id": "sec-49-4-2",
        "title": "49.4.2 Architecture-Specific Implementations",
        "content": "",
        "codeSnippets": [
          {
            "title": "Architecture-Specific Implementations — example",
            "language": "nasm",
            "code": "// strlen_x86_64.S - x86-64 implementation\n.section .text\n.global portable_strlen\n\nportable_strlen:\n    xor eax, eax\n.loop:\n    cmp byte [rdi+rax], 0\n    je .done\n    inc eax\n    jmp .loop\n.done:\n    ret\n\n// strlen_aarch64.S - ARM64 implementation\n.section .text\n.global portable_strlen\n\nportable_strlen:\n    mov x2, x0\n.loop:\n    ldrb w1, [x2], #1\n    cbnz w1, .loop\n    sub x0, x2, x0\n    ret\n\n// strlen_riscv.S - RISC-V implementation\n.section .text\n.global portable_strlen\n\nportable_strlen:\n    li a1, 0\n.loop:\n    lb a2, 0(a0)\n    addi a0, a0, 1\n    addi a1, a1, 1\n    bnez a2, .loop\n    addi a0, a1, -1\n    ret"
          }
        ]
      },
      {
        "id": "sec-49-4-3",
        "title": "49.4.3 Build System",
        "content": "makefile",
        "codeSnippets": [
          {
            "title": "Build System — example",
            "language": "nasm",
            "code": "# Makefile\nCC_X86_64 = gcc\nCC_AARCH64 = aarch64-linux-gnu-gcc\nCC_RISCV = riscv64-linux-gnu-gcc"
          }
        ]
      },
      {
        "id": "sec-49-4-4",
        "title": "49.4.4 Explanation",
        "content": "CFLAGS = -O2 -Wall\n\nall: x86_64 aarch64 riscv\n\nx86_64: strlen_x86_64.S test.c\n\t$(CC_X86_64) $(CFLAGS) -o test_x86_64 strlen_x86_64.S test.c\n\naarch64: strlen_aarch64.S test.c\n\t$(CC_AARCH64) $(CFLAGS) -o test_aarch64 strlen_aarch64.S test.c\n\nriscv: strlen_riscv.S test.c\n\t$(CC_RISCV) $(CFLAGS) -o test_riscv strlen_riscv.S test.c\n\ntest: all\n\t./test_x86_64\n\tqemu-aarch64 ./test_aarch64\n\tqemu-riscv64 ./test_riscv\n\t@echo \"All tests passed!\"",
        "codeSnippets": [
          {
            "title": "Explanation — example",
            "language": "nasm",
            "code": "clean:\n\trm -f test_*"
          }
        ]
      },
      {
        "id": "sec-49-4-5",
        "title": "49.4.5 Test Program",
        "content": "printf(\"All tests passed!\\n\");",
        "codeSnippets": [
          {
            "title": "Test Program — example",
            "language": "c",
            "code": "// test.c - Test portable strlen\n#include <stdio.h>\n#include <string.h>\n#include \"strlen.h\"\n\nint main() {\n    const char *test_strings[] = {\n        \"Hello, World!\",\n        \"\",\n        \"Short\",\n        \"A longer string for testing\",\n        NULL\n    };\n\nfor (int i = 0; test_strings[i] != NULL; i++) {\n        size_t result = portable_strlen(test_strings[i]);\n        size_t expected = strlen(test_strings[i]);\n\nif (result != expected) {\n            printf(\"FAIL: strlen(\"%s\") = %zu, expected %zu\\n\",\n                   test_strings[i], result, expected);\n            return 1;\n        }\n        printf(\"PASS: strlen(\"%s\") = %zu\\n\", test_strings[i], result);\n    }"
          },
          {
            "title": "Test Program — example",
            "language": "nasm",
            "code": "    return 0;\n}"
          }
        ]
      },
      {
        "id": "sec-49-4-6",
        "title": "49.4.6 Running Tests",
        "content": "",
        "codeSnippets": [
          {
            "title": "Running Tests — example",
            "language": "bash",
            "code": "# Build and test\nmake test\n\n# Cross-compile and test with QEMU\nmake all\nqemu-aarch64 ./test_aarch64\nqemu-riscv64 ./test_riscv"
          }
        ]
      },
      {
        "id": "sec-49-4-7",
        "title": "49.4.7 Alternative: Unified Source File",
        "content": "",
        "codeSnippets": [
          {
            "title": "Alternative: Unified Source File — example",
            "language": "c",
            "code": "// strlen_portable.S - Single file with conditional compilation\n#include \"portable_macros.h\""
          }
        ]
      },
      {
        "id": "sec-49-4-8",
        "title": "49.4.8 Explanation",
        "content": ".section .text\n.global portable_strlen",
        "codeSnippets": [
          {
            "title": "Explanation — example",
            "language": "c",
            "code": "portable_strlen:\n#if defined(ARCH_X86_64)\n    xor eax, eax\n.loop:\n    cmp byte [rdi+rax], 0\n    je .done\n    inc eax\n    jmp .loop\n.done:\n    ret"
          },
          {
            "title": "Explanation — example",
            "language": "nasm",
            "code": "#elif defined(ARCH_AARCH64)\n    mov x2, x0\n.loop:\n    ldrb w1, [x2], #1\n    cbnz w1, .loop\n    sub x0, x2, x0\n    ret\n\n#elif defined(ARCH_RISCV64)\n    li a1, 0\n.loop:\n    lb a2, 0(a0)\n    addi a0, a0, 1\n    addi a1, a1, 1\n    bnez a2, .loop\n    addi a0, a1, -1\n    ret\n\n#else\n    #error \"Unsupported architecture\"\n#endif"
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-49-1",
        "title": "Exercise 49.1: Portable memset Macro",
        "description": "Define a macro that expands to rep stosb on x86-64 and a register loop on ARM64.",
        "solution": "#if defined(__x86_64__)\n#define PORTABLE_MEMSET(dst, val, count) \\\n    mov rdi, dst; mov al, val; mov rcx, count; cld; rep stosb\n#elif defined(__aarch64__)\n#define PORTABLE_MEMSET(dst, val, count) \\\n    bl memset_arm64_helper\n#endif",
        "solutionLanguage": "c"
      },
      {
        "id": "ex-49-2",
        "title": "Exercise 49.2: Portable strcmp",
        "description": "Write a portable strcmp function that works on x86-64, ARM64, and RISC-V.",
        "solution": "Use conditional compilation (#ifdef) to provide architecture-specific implementations. Each architecture loads bytes, compares, and branches. Use portable register names via macros."
      },
      {
        "id": "ex-49-3",
        "title": "Exercise 49.3: Build System",
        "description": "Create a Makefile that cross-compiles for x86-64, ARM64, and RISC-V.",
        "solution": "Define CC_X86_64, CC_AARCH64, CC_RISCV variables. Create separate targets for each architecture. Use QEMU to test non-native architectures."
      },
      {
        "id": "ex-49-4",
        "title": "Exercise 49-4: Portable memcpy",
        "description": "Implement a portable memcpy function across architectures.",
        "solution": "Use rep movsb (x86-64), ldp/stp loops (ARM64), or ld/sd loops (RISC-V). Handle alignment requirements for each architecture."
      }
    ],
    "practiceQuestions": [
      {
        "question": "What is the role of the C preprocessor in writing portable assembly with GNU tools?",
        "answer": "When assembly files are named with an uppercase .S extension, GCC automatically runs the C preprocessor (cpp) before assembling. This allows developers to use #include, #define, #ifdef, and architecture macros (__x86_64__, __aarch64__, __riscv) directly, enabling a single source file to target multiple architectures."
      },
      {
        "question": "How do you test portable assembly code?",
        "answer": "Testing strategies: (1) Cross-compile for each architecture, (2) Use QEMU for emulation on x86-64 host, (3) Docker multi-architecture containers, (4) CI/CD with multiple architectures, (5) Unit tests for each function, (6) Performance benchmarks across architectures."
      },
      {
        "question": "What are the trade-offs of portable assembly?",
        "answer": "Trade-offs: (1) Abstraction overhead vs performance, (2) Code complexity vs maintainability, (3) Testing burden vs reliability, (4) Build system complexity vs flexibility. Portable assembly adds layers but reduces duplication and maintenance."
      },
      {
        "question": "How do you handle endianness in portable assembly?",
        "answer": "Handle endianness by: (1) Using byte-swap instructions when needed, (2) Checking endianness at compile time (#if __BYTE_ORDER__), (3) Using endian-agnostic algorithms, (4) Providing separate implementations for little/big endian, (5) Using portable data types (uint32_t)."
      },
      {
        "question": "What is the best approach for portable system calls?",
        "answer": "Best approach: (1) Define syscall numbers in header files, (2) Create wrapper functions in C with inline assembly, (3) Use architecture-specific assembly files for optimized paths, (4) Test all paths on each architecture, (5) Document syscall differences."
      },
      {
        "question": "How do you optimize portable assembly for each architecture?",
        "answer": "Optimization techniques: (1) Use architecture-specific instructions (SIMD, crypto), (2) Exploit pipeline characteristics, (3) Optimize for cache behavior, (4) Use architecture-specific calling conventions, (5) Profile and benchmark on each target."
      }
    ],
    "summary": [
      "Portable assembly abstracts register and syscall divergence.",
      "Preprocessors enable a single codebase to support multiple hardware targets.",
      "Macros provide abstraction for registers and instructions.",
      "System call wrappers bridge architecture-specific differences.",
      "Build systems enable cross-compilation and testing.",
      "QEMU provides emulation for non-native architectures.",
      "Testing is essential for portable assembly reliability.",
      "The journey from zero to hero equips you with deep systems mastery across all major computing platforms."
    ]
  }
];
