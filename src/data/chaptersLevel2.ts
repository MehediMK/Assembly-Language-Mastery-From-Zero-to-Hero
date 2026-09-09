import { Chapter } from '../types';

export const CHAPTERS_LEVEL_2: Chapter[] = [
  {
    "id": 6,
    "slug": "chapter-6-data-movement-addressing",
    "level": 2,
    "levelTitle": "Core Assembly Programming",
    "title": "Chapter 6: Data Movement and Addressing Modes",
    "subtitle": "Sign Extension, Scale Index Displacement, and Conditional Moves",
    "learningObjectives": [
      "Master the mov instruction and its variations (movzx, movsx, movsxd).",
      "Understand and use all x86-64 addressing modes: immediate, register, direct, indirect, base+displacement, indexed, and RIP-relative.",
      "Learn how to compute effective addresses using lea.",
      "Explore stack operations (push, pop) and their effects on rsp.",
      "Use conditional move instructions (cmovcc) to avoid branches.",
      "Understand data alignment and its impact on performance.",
      "Apply these concepts to write efficient and correct assembly code."
    ],
    "prerequisites": [
      "Familiarity with basic assembly instructions and program structure (Chapters 1–5).",
      "Understanding of registers, memory, and the stack (Chapter 3).",
      "Knowledge of binary, hexadecimal, and data sizes (Chapter 2)."
    ],
    "keyConcepts": [
      "Addressing modes determine how the CPU calculates the memory address for an operand.",
      "The mov instruction copies data between registers and memory, with sign- or zero-extension options for different sizes.",
      "lea computes an effective address without accessing memory; it can also perform simple arithmetic.",
      "push and pop manipulate the stack and update rsp.",
      "cmovcc conditionally moves data based on flags, often replacing short branches.",
      "Proper alignment of multi-byte data can improve performance."
    ],
    "diagramType": "addressing_modes",
    "sections": [
      {
        "id": "sec-6-1",
        "title": "6.1 Review of Data Movement Instructions",
        "content": "Before diving into addressing modes, let's briefly review the fundamental data movement instructions and their operand restrictions."
      },
      {
        "id": "sec-6-1-1",
        "title": "6.1.1 mov – The Basic Move",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "6.1.1 mov – The Basic Move — listing 1",
            "code": "mov destination, source",
            "explanation": "Copies a value from source to destination. Both operands must be of the same size, or the source can be an immediate value that fits in the destination. Valid combinations:\n\n- mov reg, reg\n- mov reg, imm\n- mov reg, mem\n- mov mem, reg\n- mov mem, imm (requires size specifier)\n\nInvalid: mov mem, mem, mov imm, reg (destination cannot be immediate), moving into rip.\n\nExamples:"
          },
          {
            "language": "nasm",
            "title": "6.1.1 mov – The Basic Move — listing 2",
            "code": "mov rax, rbx              ; reg to reg\nmov rax, 0x1234           ; imm to reg\nmov rax, [rbx]            ; mem to reg\nmov [rbx], rax            ; reg to mem\nmov qword [rbx], 0x1234   ; imm to mem"
          }
        ]
      },
      {
        "id": "sec-6-1-2",
        "title": "6.1.2 lea – Load Effective Address",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "6.1.2 lea – Load Effective Address — listing 1",
            "code": "lea destination_register, memory_operand",
            "explanation": "lea computes the address of the memory operand and stores that address in the destination register. It does not read from memory; it is purely an address calculation. This is invaluable for pointer arithmetic and for loading addresses of variables.\n\nExamples:"
          },
          {
            "language": "nasm",
            "title": "6.1.2 lea – Load Effective Address — listing 2",
            "code": "lea rax, [rbx + 8]        ; rax = rbx + 8\nlea rsi, [rel msg]        ; rsi = address of msg (RIP-relative)\nlea rdx, [array + rcx*4]  ; rdx = &array[rcx]",
            "explanation": "lea can also perform arithmetic not related to memory, e.g., lea rax, [rbx + rcx*2 + 5] which computes rbx + rcx*2 + 5 without modifying flags (unlike add and shl)."
          }
        ]
      },
      {
        "id": "sec-6-1-3",
        "title": "6.1.3 xchg – Exchange",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "6.1.3 xchg – Exchange — listing 1",
            "code": "xchg operand1, operand2",
            "explanation": "Swaps the contents of two operands. Can be register-register or register-memory. xchg with memory is atomic with respect to other bus operations, so it’s often used in synchronization primitives.\n\nExamples:"
          },
          {
            "language": "nasm",
            "title": "6.1.3 xchg – Exchange — listing 2",
            "code": "xchg rax, rbx\nxchg [rsp], rax"
          }
        ]
      },
      {
        "id": "sec-6-1-4",
        "title": "6.1.4 Stack Operations: push and pop",
        "content": "- push src: decrements rsp by 8 (or operand size) and stores src at [rsp].\n- pop dest: loads from [rsp] into dest and increments rsp by 8 (or operand size).\n\nIn 64-bit mode, the default operand size is 64 bits for push/pop when no size is specified. You can push/pop 16-bit or 32-bit values, but that changes rsp by 2 or 4 bytes, potentially breaking alignment.\n\nExamples:\n\nClarification: Ordinary push/pop in 64-bit mode support 64-bit and 16-bit operands, not 32-bit operands. An encoded 32-bit immediate for push is sign-extended and still occupies eight stack bytes.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "6.1.4 Stack Operations: push and pop — listing 1",
            "code": "push rax\npush qword [rbx]\npop rbx\npop qword [rcx]",
            "explanation": "Note: push and pop are often used to save and restore registers across function calls or to pass arguments on the stack (for functions with more than six arguments)."
          }
        ]
      },
      {
        "id": "sec-6-2",
        "title": "6.2 Addressing Modes in Detail",
        "content": "An addressing mode specifies how to compute the effective address (EA) of a memory operand. The x86-64 architecture supports a rich set, combining base registers, index registers, scale factors, and displacements."
      },
      {
        "id": "sec-6-2-1",
        "title": "6.2.1 Immediate Addressing",
        "content": "The operand is a constant embedded in the instruction. Not a memory address, but used to load constants.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "6.2.1 Immediate Addressing — listing 1",
            "code": "mov eax, 42        ; immediate 42\nadd rax, 0xFF      ; immediate 0xFF"
          }
        ]
      },
      {
        "id": "sec-6-2-2",
        "title": "6.2.2 Register Addressing",
        "content": "The operand is a register; no memory access.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "6.2.2 Register Addressing — listing 1",
            "code": "mov rax, rbx\nadd rcx, rdx"
          }
        ]
      },
      {
        "id": "sec-6-2-3",
        "title": "6.2.3 Direct (Displacement-Only) Addressing",
        "content": "The effective address is a constant (absolute address). In 64-bit mode, absolute 64-bit addresses are rarely used; instead, RIP-relative addressing is preferred. NASM allows mov rax, [0x123456789] but it assembles to an absolute address, which may cause relocation issues in position-independent code.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "6.2.3 Direct (Displacement-Only) Addressing — listing 1",
            "code": "mov rax, [0x600000]      ; load from absolute address 0x600000",
            "explanation": "Better: use RIP-relative by default for labels."
          }
        ]
      },
      {
        "id": "sec-6-2-4",
        "title": "6.2.4 Register Indirect Addressing",
        "content": "The effective address is the value in a register.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "6.2.4 Register Indirect Addressing — listing 1",
            "code": "mov rax, [rbx]      ; address = rbx\nmov [rcx], rax      ; store at address rcx"
          }
        ]
      },
      {
        "id": "sec-6-2-5",
        "title": "6.2.5 Base + Displacement Addressing",
        "content": "The effective address is a base register plus a constant signed displacement.\n\nClarification: For the normal 64-bit addressing forms shown here, displacements are encoded as signed 8-bit or signed 32-bit values; 16-bit displacement forms belong to other addressing modes.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "6.2.5 Base + Displacement Addressing — listing 1",
            "code": "mov rax, [rbx + 8]     ; address = rbx + 8\nmov rax, [rbp - 16]    ; typical for stack locals\nmov [rsp + 24], rdi    ; store at rsp+24",
            "explanation": "Displacement can be 8, 16, or 32 bits, sign-extended."
          }
        ]
      },
      {
        "id": "sec-6-2-6",
        "title": "6.2.6 Indexed Addressing (Base + Index*Scale)",
        "content": "The effective address is base register + index register * scale factor (1, 2, 4, or 8).\n\nClarification: The scale factor sets the array stride, not the load width. mov rax, [rbx + rcx*4] loads eight bytes at a four-byte stride. Use mov eax, [rbx + rcx*4] to load one dword.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "6.2.6 Indexed Addressing (Base + Index*Scale) — listing 1",
            "code": "mov rax, [rbx + rcx*4]     ; address = rbx + rcx*4 (e.g., dword array)\nmov rax, [rsi + rdx*8]     ; address = rsi + rdx*8 (qword array)"
          }
        ]
      },
      {
        "id": "sec-6-2-7",
        "title": "6.2.7 Base + Index*Scale + Displacement",
        "content": "The most general form: base + index * scale + displacement.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "6.2.7 Base + Index*Scale + Displacement — listing 1",
            "code": "mov rax, [rbx + rcx*4 + 16]    ; address = rbx + rcx*4 + 16\nmov rdx, [rsp + rsi*2 + 8]     ; address = rsp + rsi*2 + 8"
          }
        ]
      },
      {
        "id": "sec-6-2-8",
        "title": "6.2.8 RIP-Relative Addressing",
        "content": "In 64-bit mode, the default for labels in NASM is RIP-relative. The effective address is RIP + displacement, where the displacement is the difference between the label’s address and the next instruction’s address.\n\nClarification: NASM does not implicitly select RIP-relative addressing for every label reference. Use [rel myvar] explicitly or put DEFAULT REL in the source. Without that setting, a bare [myvar] normally uses absolute addressing. Reference: NASM manual, section 8.2.1 (REL, ABS).",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "6.2.8 RIP-Relative Addressing — listing 1",
            "code": "mov rax, [rel myvar]    ; equivalent to: mov rax, [myvar]\nlea rsi, [rel msg]      ; load address of msg",
            "explanation": "This is essential for position-independent code (PIC) and shared libraries.\n\nImportant: RIP-relative addressing is only available for memory operands; you cannot use RIP as a general-purpose register."
          }
        ]
      },
      {
        "id": "sec-6-3",
        "title": "6.3 Size Specification and Alignment",
        "content": "When moving data to/from memory, the assembler needs to know the size of the operation. Often, the size is inferred from the register operand, but when using an immediate or ambiguous case, a size specifier is required.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "6.3 Size Specification and Alignment — listing 1",
            "code": "mov byte [rbx], 1\nmov word [rbx], 1\nmov dword [rbx], 1\nmov qword [rbx], 1"
          }
        ]
      },
      {
        "id": "sec-6-3-1",
        "title": "6.3.1 Alignment",
        "content": "Multi-byte data (word, dword, qword) should be aligned to natural boundaries (address divisible by size) for best performance. The x86 architecture allows unaligned access, but it may be slower (or cause faults in some instructions like SSE aligned moves). The stack is kept 16-byte aligned per ABI.\n\nWhen defining data in .data, NASM aligns automatically to the largest member’s natural alignment. You can use align directive to enforce alignment.\n\nClarification: NASM data declarations do not automatically insert padding before each item based on its size. Use align explicitly before data requiring alignment; section alignment alone does not align every label.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "6.3.1 Alignment — listing 1",
            "code": "section .data\n    align 8\n    myqword dq 0\n    align 4\n    mydword dd 0"
          }
        ]
      },
      {
        "id": "sec-6-4",
        "title": "6.4 Specialized Move Instructions",
        "content": "x86-64 provides several variants of mov to handle size conversion and conditional moves."
      },
      {
        "id": "sec-6-4-1",
        "title": "6.4.1 movzx – Move with Zero-Extend",
        "content": "Copies a smaller source (8 or 16 bits) into a larger destination (16, 32, or 64 bits), filling the upper bits with zeros.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "6.4.1 movzx – Move with Zero-Extend — listing 1",
            "code": "movzx eax, al        ; eax = zero-extended al\nmovzx rax, word [rbx] ; rax = zero-extended 16-bit value from memory\nmovzx rbx, byte [rsi] ; rbx = zero-extended 8-bit value"
          }
        ]
      },
      {
        "id": "sec-6-4-2",
        "title": "6.4.2 movsx – Move with Sign-Extend",
        "content": "Copies a smaller signed source into a larger destination, filling upper bits with the sign bit.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "6.4.2 movsx – Move with Sign-Extend — listing 1",
            "code": "movsx eax, al        ; eax = sign-extended al\nmovsx rax, word [rbx] ; rax = sign-extended 16-bit\nmovsx rbx, byte [rsi] ; rbx = sign-extended 8-bit"
          }
        ]
      },
      {
        "id": "sec-6-4-3",
        "title": "6.4.3 movsxd – Move with Sign-Extend Dword to Qword",
        "content": "Sign-extends a 32-bit source into a 64-bit destination. In NASM, movsxd is used, though sometimes movsx with a 32-bit source and 64-bit destination is also accepted.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "6.4.3 movsxd – Move with Sign-Extend Dword to Qword — listing 1",
            "code": "movsxd rax, dword [rbx]  ; rax = sign-extended 32-bit value\nmovsxd rdi, eax          ; rdi = sign-extended eax"
          }
        ]
      },
      {
        "id": "sec-6-4-4",
        "title": "6.4.4 cmovcc – Conditional Move",
        "content": "Conditional move instructions copy data from source to destination only if the condition is true, based on the current flags. They avoid branching, which can improve performance by reducing pipeline stalls.\n\nSyntax:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "6.4.4 cmovcc – Conditional Move — listing 1",
            "code": "cmovcc destination, source",
            "explanation": "where cc is a condition code (e.g., e, ne, g, l, a, b, etc.). The destination must be a register; the source can be a register or memory.\n\nExamples:"
          },
          {
            "language": "nasm",
            "title": "6.4.4 cmovcc – Conditional Move — listing 2",
            "code": "cmp rax, rbx\ncmovg rax, rbx      ; if rax > rbx (signed), then rax = rbx\ncmovne rcx, rdx     ; if not equal, rcx = rdx",
            "explanation": "Common conditional moves:\n- cmove (ZF=1)\n- cmovne (ZF=0)\n- cmovg (signed >)\n- cmovge (signed >=)\n- cmovl (signed <)\n- cmovle (signed <=)\n- cmova (unsigned >)\n- cmovae (unsigned >=)\n- cmovb (unsigned <)\n- cmovbe (unsigned <=)\n\ncmovcc is useful for computing expressions like max(a,b) without branching."
          }
        ]
      },
      {
        "id": "sec-6-4-5",
        "title": "6.4.5 bswap – Byte Swap",
        "content": "Reverses the byte order of a register (e.g., converts between little-endian and big-endian).",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "6.4.5 bswap – Byte Swap — listing 1",
            "code": "bswap eax    ; reverse bytes in eax\nbswap rax    ; reverse bytes in rax"
          }
        ]
      },
      {
        "id": "sec-6-4-6",
        "title": "6.4.6 movbe – Move and Byte Swap",
        "content": "Loads a value from memory and byte-swaps it (or vice versa). Requires CPU support (e.g., Intel Atom, some modern CPUs). Not universally available, so use with caution."
      },
      {
        "id": "sec-6-5",
        "title": "6.5 Using lea for Arithmetic",
        "content": "lea is not just for address computation; it can perform non-destructive arithmetic using the addressing hardware, often in a single instruction that would otherwise require multiple add/shl.\n\nExamples:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "6.5 Using lea for Arithmetic — listing 1",
            "code": "lea rax, [rbx + rcx*2]      ; rax = rbx + rcx*2\nlea rdx, [rax + rax*4]      ; rdx = rax * 5\nlea rsi, [rsi + 8]          ; rsi += 8 (without modifying flags)",
            "explanation": "lea does not affect flags, which can be an advantage in some algorithms."
          }
        ]
      },
      {
        "id": "sec-6-6",
        "title": "6.6 Stack Data Movement Patterns",
        "content": "Beyond simple push/pop, we often need to access stack locations using rsp or rbp with displacements."
      },
      {
        "id": "sec-6-6-1",
        "title": "6.6.1 Saving and Restoring Registers",
        "content": "In a function, callee-saved registers must be preserved. The typical pattern:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "6.6.1 Saving and Restoring Registers — listing 1",
            "code": "push rbx\npush r12\n; ... use rbx, r12\npop r12\npop rbx\nret"
          }
        ]
      },
      {
        "id": "sec-6-6-2",
        "title": "6.6.2 Accessing Function Arguments on Stack",
        "content": "When a function has more than six arguments, the extra ones are passed on the stack. The caller pushes them before the call. Inside the callee, they can be accessed at positive offsets from rbp (if frame pointer used) or from rsp (if no frame pointer).\n\nWith frame pointer:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "6.6.2 Accessing Function Arguments on Stack — listing 1",
            "code": "push rbp\nmov rbp, rsp\n; [rbp+16] = 7th argument (after return address and saved rbp)",
            "explanation": "Without frame pointer (after prologue sub rsp, N), arguments are at [rsp + N + 8] etc., because the return address is at [rsp] before allocating locals."
          }
        ]
      },
      {
        "id": "sec-6-6-3",
        "title": "6.6.3 Allocating Local Variables on the Stack",
        "content": "Use sub rsp, size to allocate space; use [rsp+offset] or [rbp-offset] to access.\n\nExample:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "6.6.3 Allocating Local Variables on the Stack — listing 1",
            "code": "sub rsp, 32          ; allocate 32 bytes\nmov [rsp], rax       ; local1\nmov [rsp+8], rbx     ; local2\n; ...\nadd rsp, 32          ; deallocate"
          }
        ]
      },
      {
        "id": "sec-6-7",
        "title": "6.7 Common Pitfalls and Best Practices",
        "content": "- Memory-to-memory moves: Not allowed. Use a register as intermediate.\n- Forgetting size specifiers when destination is memory and source is immediate. Use mov byte [addr], 5.\n- Using wrong extension (movzx vs movsx) for signed/unsigned values.\n- Misaligning stack: Always keep rsp 16-byte aligned before call; use sub rsp, 16*n + 8 in prologue if needed.\n- Using lea with RIP-relative incorrectly: lea rax, [var] in NASM defaults to RIP-relative, which is usually desired.\n- Overusing xchg with memory due to implicit lock prefix; use mov sequences for non-atomic swaps.\n- Relying on undefined flags after mov or lea; these instructions do not modify flags.\n- Using absolute addresses in PIC: Prefer RIP-relative addressing for data.\n\nClarification: mov and lea preserve flags; they do not make flags undefined. A subsequent conditional instruction sees the existing flags. For RIP-relative label references, use rel or DEFAULT REL explicitly. Stack adjustments must account for the return address and any saved registers."
      }
    ],
    "exercises": [
      {
        "id": "ex-6-1",
        "title": "Exercise 6.1: Array Sum with Indexed Addressing",
        "description": "Write a program that sums an array of 10 dwords stored in memory. Use indexed addressing with scale factor ([base + index*4]). Exit with the sum.",
        "solution": "section .data\n    array dd 1,2,3,4,5,6,7,8,9,10\n    len equ 10\nsection .text\nglobal _start\n_start:\n    xor eax, eax          ; sum\n    xor rcx, rcx          ; index\nloop_start:\n    cmp rcx, len\n    je done\n    add eax, [array + rcx*4]  ; indexed addressing\n    inc rcx\n    jmp loop_start\ndone:\n    mov rdi, rax          ; exit code = sum (55)\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": ""
      },
      {
        "id": "ex-6-2",
        "title": "Exercise 6.2: Sign vs Zero Extension",
        "description": "Given a byte in memory = 0x80 (which is -128 signed, 128 unsigned). Load it into eax using movzx and movsx separately. What are the results? Write a program that demonstrates both and exits with the sign-extended value (which will be negative, but exit code is low 8 bits).",
        "solution": "section .data\n    val db 0x80\nsection .text\nglobal _start\n_start:\n    movzx eax, byte [val] ; eax = 0x00000080 (128)\n    movsx eax, byte [val] ; eax = 0xFFFFFF80 (-128)\n    ; exit with sign-extended value low byte = 0x80 = 128\n    mov rdi, rax          ; rdi = 0xFFFFFF80, low 8 bits = 0x80 = 128\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": ""
      },
      {
        "id": "ex-6-3",
        "title": "Exercise 6.3: Conditional Move",
        "description": "Write a program that computes max(rax, rbx) without using jumps. Use cmp and cmovg. Exit with the maximum.",
        "solution": "section .text\nglobal _start\n_start:\n    mov rax, 15\n    mov rbx, 25\n    cmp rax, rbx\n    cmovl rax, rbx    ; if rax < rbx (signed), rax = rbx\n    ; rax = 25\n    mov rdi, rax\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "The source solution uses cmovl with RAX as the destination. To use cmovg as requested, use cmp rax, rbx; cmovg rbx, rax; mov rax, rbx. Both choose the signed maximum."
      },
      {
        "id": "ex-6-4",
        "title": "Exercise 6.4: Stack Arguments",
        "description": "Write a function add_six that takes six integer arguments in registers (rdi, rsi, rdx, rcx, r8, r9) and returns their sum. Call it from _start and exit with the sum.",
        "solution": "section .text\nglobal _start\n\nadd_six:\n    add rdi, rsi\n    add rdi, rdx\n    add rdi, rcx\n    add rdi, r8\n    add rdi, r9\n    mov rax, rdi      ; return sum\n    ret\n\n_start:\n    mov rdi, 1\n    mov rsi, 2\n    mov rdx, 3\n    mov rcx, 4\n    mov r8, 5\n    mov r9, 6\n    call add_six\n    ; rax = 21\n    mov rdi, rax\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "Despite the exercise title, these six integer arguments are passed in registers. Section 6.6.2 explains where a seventh integer argument would be passed on the stack."
      },
      {
        "id": "ex-6-5",
        "title": "Exercise 6.5: `lea` Arithmetic",
        "description": "Use lea to compute 5 * rbx + 7 and store in rax, without using mul or imul. Then exit with the low byte of rax.",
        "solution": "section .text\nglobal _start\n_start:\n    mov rbx, 10        ; example value\n    lea rax, [rbx + rbx*4] ; rax = rbx + 4*rbx = 5*rbx\n    add rax, 7         ; rax = 5*rbx + 7\n    ; exit with low byte: 5*10+7=57\n    mov rdi, rax\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "The source solution uses lea followed by add. A single-instruction alternative is lea rax, [rbx + rbx*4 + 7], which computes the same result while preserving flags."
      }
    ],
    "practiceQuestions": [
      {
        "question": "What is the difference between mov rax, [rbx] and lea rax, [rbx]?",
        "answer": "mov rax, [rbx] dereferences the memory address stored in rbx and loads the 8-byte value at that location into rax. lea rax, [rbx] loads the address itself into rax without touching memory."
      },
      {
        "question": "How do you move a byte from memory to a 64-bit register with zero-extension? With sign-extension?",
        "answer": "Use movzx rax, byte [address] for zero-extension and movsx rax, byte [address] for sign-extension. Replace address with the label or address register for the byte."
      },
      {
        "question": "Explain the indexed addressing mode [rbx + rcx*4 + 8]. How is it used for array access?",
        "answer": "The effective address is RBX + RCX × 4 + 8. RBX supplies the base, RCX selects an element, four is the element stride, and eight is a fixed byte offset. Use EAX as destination when loading one dword."
      },
      {
        "question": "What is RIP-relative addressing? Why is it important in 64-bit mode?",
        "answer": "RIP-relative addressing uses the address of the next instruction plus a signed displacement. It supports position-independent references within range. Use [rel label] explicitly or DEFAULT REL for suitable registerless memory operands."
      },
      {
        "question": "When would you use cmovcc instead of a conditional jump? What are the trade-offs?",
        "answer": "Use cmovcc to select a value without a control-flow branch, especially when branch outcomes are hard to predict. It still depends on flags and input values, so it is not automatically faster than a predictable branch."
      },
      {
        "question": "How does push affect rsp? What about pop? What is the default operand size in 64-bit mode?",
        "answer": "For ordinary 64-bit push/pop operands, push subtracts 8 from RSP and stores the value; pop loads the value and adds 8. The normal operand size is 64 bits. A 16-bit operand is possible, but ordinary 32-bit push/pop operands are not supported in 64-bit mode."
      },
      {
        "question": "Why is memory-to-memory mov not allowed? How would you copy a value from one memory location to another?",
        "answer": "The ordinary mov instruction has no general memory-to-memory operand encoding. Copy through a register: mov rax, [source]; mov [destination], rax. This copies eight bytes and overwrites RAX."
      },
      {
        "question": "What is the purpose of bswap? Give an example use case.",
        "answer": "bswap reverses the byte order within a 32-bit or 64-bit register. For example, bswap eax turns 0x12345678 into 0x78563412, useful when converting byte order."
      },
      {
        "question": "Describe the difference between movsx and movzx. Which one would you use for a signed char?",
        "answer": "movsx fills the added bits with the source sign bit; movzx fills them with zeros. Use movsx when widening a signed char so negative values remain negative."
      },
      {
        "question": "How can lea be used to multiply a register by a constant without using imul? Provide an example for multiplying by 9.",
        "answer": "Combine a base and a scaled index in an effective-address expression. lea rax, [rbx + rbx*8] computes 9 × RBX without multiplication instructions or memory access and preserves flags."
      }
    ],
    "summary": [
      "Addressing modes include immediate, register, direct, indirect, base+displacement, indexed, and RIP-relative.",
      "mov variants handle sign/zero extension: movzx, movsx, movsxd.",
      "lea computes addresses and performs arithmetic without affecting flags.",
      "cmovcc conditionally moves data, avoiding branches.",
      "Stack operations are fundamental for function calls and local storage.",
      "Proper alignment and size specification are crucial for correctness and performance.",
      "In the next chapter, we’ll dive into arithmetic and logical instructions in detail, building on the foundation of data movement."
    ]
  },
  {
    "id": 7,
    "slug": "chapter-7-arithmetic-logical",
    "level": 2,
    "levelTitle": "Core Assembly Programming",
    "title": "Chapter 7: Arithmetic and Logical Instructions",
    "subtitle": "High Precision Integer Math, Bit Manipulation, and Status Flags",
    "learningObjectives": [
      "Master integer arithmetic instructions: add, sub, inc, dec, neg, imul, idiv, and their unsigned variants.",
      "Understand how arithmetic instructions affect CPU flags (CF, ZF, SF, OF).",
      "Explore logical instructions: and, or, xor, not, test.",
      "Learn shift and rotate instructions and their use in multiplication, division, and bit manipulation.",
      "Apply arithmetic and logical instructions to solve practical problems.",
      "Understand the difference between signed and unsigned operations.",
      "Write complete programs that perform calculations and output results (or exit with codes)."
    ],
    "prerequisites": [
      "Solid understanding of data movement and addressing modes (Chapter 6).",
      "Familiarity with binary, hexadecimal, two’s complement, and data sizes (Chapter 2).",
      "Basic knowledge of program structure and the build process (Chapters 1–5)."
    ],
    "keyConcepts": [
      "Arithmetic instructions operate on integers and set flags to indicate overflow, zero, sign, and carry.",
      "Multiplication and division have special forms requiring rax/rdx registers.",
      "Logical instructions manipulate bits and are used for masking, setting, clearing, and testing.",
      "Shift instructions provide fast multiplication/division by powers of two; arithmetic shifts preserve sign.",
      "Rotate instructions move bits circularly.",
      "Signed vs unsigned operations require different conditional jumps and sometimes different instructions (e.g., idiv vs div, imul vs mul)."
    ],
    "diagramType": "arithmetic_logical",
    "sections": [
      {
        "id": "sec-7-1",
        "title": "7.1 Addition and Subtraction",
        "content": ""
      },
      {
        "id": "sec-7-1-1",
        "title": "7.1.1 add and sub",
        "content": "Syntax:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "7.1.1 add and sub — listing 1",
            "code": "add destination, source   ; destination = destination + source\nsub destination, source   ; destination = destination - source",
            "explanation": "The destination can be a register or memory; the source can be a register, memory, or immediate. Both operands cannot be memory simultaneously.\n\nExamples:"
          },
          {
            "language": "nasm",
            "title": "7.1.1 add and sub — listing 2",
            "code": "add rax, rbx          ; rax = rax + rbx\nsub rax, 10           ; rax = rax - 10\nadd qword [rsp], 5    ; memory = memory + 5\nsub rcx, [rdx]        ; rcx = rcx - memory[rdx]",
            "explanation": "These instructions modify all status flags:\n- ZF set if result is zero.\n- SF set if result is negative (MSB = 1).\n- CF set if unsigned overflow (carry out of MSB) or borrow.\n- OF set if signed overflow (result too large for signed interpretation)."
          }
        ]
      },
      {
        "id": "sec-7-1-2",
        "title": "7.1.2 inc and dec",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "7.1.2 inc and dec — listing 1",
            "code": "inc destination   ; destination = destination + 1\ndec destination   ; destination = destination - 1",
            "explanation": "These are shorter than add dest, 1 and do not affect the Carry Flag (CF), but they do affect ZF, SF, OF. This is important when CF must be preserved across a counter update."
          }
        ]
      },
      {
        "id": "sec-7-1-3",
        "title": "7.1.3 neg – Negate",
        "content": "\n\nClarification: neg and not followed by add 1 produce the same integer result, but their final flags can differ. For example, neg of zero clears CF; not of zero followed by add 1 sets CF.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "7.1.3 neg – Negate — listing 1",
            "code": "neg destination   ; destination = 0 - destination (two's complement)",
            "explanation": "This is equivalent to not destination followed by add destination, 1. It affects flags like sub.\n\nExample:"
          },
          {
            "language": "nasm",
            "title": "7.1.3 neg – Negate — listing 2",
            "code": "mov rax, 5\nneg rax        ; rax = -5"
          }
        ]
      },
      {
        "id": "sec-7-2",
        "title": "7.2 Multiplication",
        "content": "x86-64 provides several forms of multiplication. The unsigned version is mul; the signed version is imul. The one-operand form uses rax implicitly, while two- and three-operand forms are more flexible."
      },
      {
        "id": "sec-7-2-1",
        "title": "7.2.1 Unsigned Multiplication: mul",
        "content": "One-operand form:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "7.2.1 Unsigned Multiplication: mul — listing 1",
            "code": "mul source",
            "explanation": "- If source is 8-bit: ax = al * source (result in ax).\n- If source is 16-bit: dx:ax = ax * source.\n- If source is 32-bit: edx:eax = eax * source.\n- If source is 64-bit: rdx:rax = rax * source.\n\nThe high part of the result (e.g., rdx) is non-zero if overflow occurs (unsigned overflow). The flags CF and OF are set if the high part is non-zero.\n\nExample:"
          },
          {
            "language": "nasm",
            "title": "7.2.1 Unsigned Multiplication: mul — listing 2",
            "code": "mov rax, 100\nmov rbx, 200\nmul rbx          ; rdx:rax = 100 * 200 = 20000 (rdx=0, rax=20000)"
          }
        ]
      },
      {
        "id": "sec-7-2-2",
        "title": "7.2.2 Signed Multiplication: imul",
        "content": "imul has three forms:\n\nOne-operand form (signed): Same as mul, but for signed values. rdx:rax = rax * source (sign-extended). Flags are set similarly.\n\nTwo-operand form:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "7.2.2 Signed Multiplication: imul — listing 1",
            "code": "imul dest, source   ; dest = dest * source",
            "explanation": "Both operands must be the same size (register or memory for source, register for dest). The result is truncated to the size of dest. Flags are set if the truncated result does not fit (i.e., overflow).\n\nThree-operand form:"
          },
          {
            "language": "nasm",
            "title": "7.2.2 Signed Multiplication: imul — listing 2",
            "code": "imul dest, source1, immediate   ; dest = source1 * immediate",
            "explanation": "source1 can be register or memory; dest must be a register; immediate is a constant. This is the most common form.\n\nExamples:"
          },
          {
            "language": "nasm",
            "title": "7.2.2 Signed Multiplication: imul — listing 3",
            "code": "imul rax, rbx        ; rax = rax * rbx (signed)\nimul rax, rcx, 10    ; rax = rcx * 10\nimul rbx, qword [rsp] ; rbx = rbx * memory",
            "explanation": "Note: mul only has one-operand form; for unsigned multiplication with a constant, use imul (the two/three-operand forms are signed, but for non-negative values the result is the same). For unsigned multiplication with two registers, use mul or combine with imul if values are known non-negative."
          }
        ]
      },
      {
        "id": "sec-7-2-3",
        "title": "7.2.3 Detecting Overflow in Multiplication",
        "content": "- For one-operand mul/imul, check CF/OF after the instruction (set if high part is non-zero).\n- For two/three-operand imul, CF/OF are set if the result is truncated (i.e., the true product does not fit in the destination).\n\nClarification: For unsigned mul, a nonzero upper half sets CF and OF. For signed imul, overflow means the full product cannot be represented by sign-extending the lower half. A negative product can have an all-ones upper half with CF and OF clear. Reference: Intel Software Developer’s Manual, Volume 2A, IMUL."
      },
      {
        "id": "sec-7-3",
        "title": "7.3 Division",
        "content": "Division is more involved. The dividend is twice the size of the divisor. For 64-bit division:\n- Dividend in rdx:rax (128 bits).\n- Divisor specified as operand.\n- Quotient in rax, remainder in rdx."
      },
      {
        "id": "sec-7-3-1",
        "title": "7.3.1 Unsigned Division: div",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "7.3.1 Unsigned Division: div — listing 1",
            "code": "div source",
            "explanation": "- If source is 8-bit: ax / source → quotient in al, remainder in ah.\n- 16-bit: dx:ax / source → quotient in ax, remainder in dx.\n- 32-bit: edx:eax / source → quotient in eax, remainder in edx.\n- 64-bit: rdx:rax / source → quotient in rax, remainder in rdx.\n\nBefore unsigned 64-bit division, you must zero-extend rax into rdx (typically xor rdx, rdx or mov rdx, 0).\n\nExample:"
          },
          {
            "language": "nasm",
            "title": "Divide 100 by 7 (unsigned)",
            "code": "; Divide 100 by 7 (unsigned)\nmov rax, 100\nxor rdx, rdx        ; clear high 64 bits\nmov rbx, 7\ndiv rbx             ; rax = 14 (quotient), rdx = 2 (remainder)"
          }
        ]
      },
      {
        "id": "sec-7-3-2",
        "title": "7.3.2 Signed Division: idiv",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "7.3.2 Signed Division: idiv — listing 1",
            "code": "idiv source",
            "explanation": "Same as div, but for signed values. Before signed division, you must sign-extend rax into rdx using cqo (convert quadword to octaword) or cdq for 32-bit.\n\nExample:"
          },
          {
            "language": "nasm",
            "title": "Divide -100 by 7 (signed)",
            "code": "; Divide -100 by 7 (signed)\nmov rax, -100\ncqo                 ; sign-extend rax into rdx:rax\nmov rbx, 7\nidiv rbx            ; rax = -14 (quotient), rdx = -2 (remainder)",
            "explanation": "Important: If the quotient does not fit in the destination register (e.g., dividing by zero, or overflow like -2^63 / -1), a division error exception occurs."
          }
        ]
      },
      {
        "id": "sec-7-3-3",
        "title": "7.3.3 Checking for Division Overflow",
        "content": "- Divisor zero → division by zero exception.\n- For signed: rax = -2^63 and divisor -1 → overflow.\n- For unsigned: if rdx >= divisor, quotient will not fit in 64 bits.\n\nAlways ensure divisor is non-zero and the quotient fits."
      },
      {
        "id": "sec-7-4",
        "title": "7.4 Logical Instructions",
        "content": "Logical instructions perform bitwise operations. They are crucial for masking, setting/clearing bits, and testing values."
      },
      {
        "id": "sec-7-4-1",
        "title": "7.4.1 and, or, xor, not",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "7.4.1 and, or, xor, not — listing 1",
            "code": "and dest, src    ; dest = dest & src\nor  dest, src    ; dest = dest | src\nxor dest, src    ; dest = dest ^ src\nnot dest         ; dest = ~dest (one’s complement)",
            "explanation": "and, or, xor affect flags: ZF, SF, PF (parity), CF cleared, OF cleared. not does not affect flags.\n\nCommon idioms:\n- Zero a register: xor rax, rax (faster and shorter than mov rax, 0).\n- Clear certain bits (mask): and rax, 0xFF keeps low byte.\n- Set certain bits: or rax, 0x80 sets bit 7.\n- Toggle bits: xor rax, 0x01 toggles bit 0.\n- Invert all bits: not rax."
          }
        ]
      },
      {
        "id": "sec-7-4-2",
        "title": "7.4.2 test – Bitwise Test",
        "content": "\n\nClarification: test reg, reg does have two explicit operands: both name the same register. It avoids an immediate operand and preserves the register value. Its performance relative to cmp reg, 0 depends on the processor and surrounding instructions.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "7.4.2 test – Bitwise Test — listing 1",
            "code": "test dest, src   ; performs dest & src, sets flags, discards result",
            "explanation": "test is used to check if bits are set without modifying the destination. It sets ZF if the result is zero (i.e., no overlapping bits), SF if MSB of result is set, etc.\n\nExamples:"
          },
          {
            "language": "nasm",
            "title": "7.4.2 test – Bitwise Test — listing 2",
            "code": "test rax, rax      ; ZF set if rax == 0\njz   is_zero\ntest al, 1         ; check if bit 0 set (odd)\njnz  is_odd\ntest rax, 0xFF     ; check if any of low 8 bits set\njz   low_bits_clear",
            "explanation": "test is preferred over cmp reg, 0 because it is faster and does not require a second operand."
          }
        ]
      },
      {
        "id": "sec-7-5",
        "title": "7.5 Shift and Rotate Instructions",
        "content": "Shifts and rotates move bits left or right. They are used for fast multiplication/division by powers of two, bit extraction, and encoding/decoding."
      },
      {
        "id": "sec-7-5-1",
        "title": "7.5.1 Shift Instructions",
        "content": "- shl dest, count : Shift left logical. Fills with zeros on right. Equivalent to multiplying by 2^count (unsigned or signed positive).\n- shr dest, count : Shift right logical. Fills with zeros on left. Equivalent to unsigned division by 2^count.\n- sar dest, count : Shift right arithmetic. Fills with sign bit on left. Equivalent to signed division by 2^count (rounds toward negative infinity for negative numbers).\n\ncount can be an immediate or the cl register (for variable shifts). In 64-bit mode, shift count is masked to 6 bits (0–63). For 32-bit operands, masked to 5 bits.\n\nFlags:\n- CF contains the last bit shifted out.\n- ZF, SF, OF set based on result (OF only defined for shift count 1).\n- If count is 0, flags are unaffected.\n\nExamples:\n\nClarification: The shift-count mask depends on operand width: 64-bit operands use six count bits; 8-, 16-, and 32-bit operands use five. These are the ordinary scalar shift instructions shown here.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "7.5.1 Shift Instructions — listing 1",
            "code": "shl rax, 1        ; rax *= 2\nshr rax, 4        ; unsigned rax /= 16\nsar rax, 1        ; signed rax /= 2 (rounds down)\nmov cl, 3\nshl rax, cl       ; shift by 3 bits"
          }
        ]
      },
      {
        "id": "sec-7-5-2",
        "title": "7.5.2 Rotate Instructions",
        "content": "- rol dest, count : Rotate left. Bits shifted out on left re-enter on right.\n- ror dest, count : Rotate right. Bits shifted out on right re-enter on left.\n- rcl dest, count : Rotate left through carry.\n- rcr dest, count : Rotate right through carry.\n\nRotates are used in cryptography, hash functions, and bit permutations.\n\nExamples:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "7.5.2 Rotate Instructions — listing 1",
            "code": "rol rax, 8        ; rotate left 8 bits\nror rbx, 4        ; rotate right 4 bits"
          }
        ]
      },
      {
        "id": "sec-7-5-3",
        "title": "7.5.3 Shift vs Rotate Example",
        "content": "Consider al = 0b10110011:\n\n- shl al, 1 → al = 0b01100110, CF=1.\n- shr al, 1 → al = 0b01011001, CF=1.\n- sar al, 1 → al = 0b11011001 (sign bit was 1), CF=1.\n- rol al, 1 → al = 0b01100111, CF=1.\n- ror al, 1 → al = 0b11011001, CF=1.\n\nClarification: Each example starts again from AL = 0b10110011; the listed shifts and rotates are independent, not a sequence."
      },
      {
        "id": "sec-7-6",
        "title": "7.6 Signed vs Unsigned Operations",
        "content": "The CPU does not inherently know whether a value is signed or unsigned; the programmer must use the correct instructions and conditional jumps."
      },
      {
        "id": "sec-7-6-1",
        "title": "7.6.1 Arithmetic",
        "content": "- Addition and subtraction are the same for signed and unsigned (two’s complement). Flags allow detecting overflow:\n  - CF indicates unsigned overflow.\n  - OF indicates signed overflow.\n- Multiplication: imul for signed, mul for unsigned (one-operand form). Two/three-operand imul works for both if values are non-negative, but for signed semantics use imul.\n- Division: idiv for signed, div for unsigned.\n\nClarification: The low half of a product is the same for signed and unsigned interpretations of the same operand bits. Two- and three-operand imul can therefore compute the low-half unsigned result too; its CF/OF flags still indicate signed overflow, not unsigned overflow."
      },
      {
        "id": "sec-7-6-2",
        "title": "7.6.2 Comparison and Jumps",
        "content": "After cmp or sub, use:\n- Signed jumps: jg, jge, jl, jle.\n- Unsigned jumps: ja, jae, jb, jbe.\n\nUsing the wrong jump is a common bug. For example:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "7.6.2 Comparison and Jumps — listing 1",
            "code": "cmp rax, rbx      ; compare as signed or unsigned? Depends on interpretation.\njl  less_signed   ; signed less\njb  less_unsigned ; unsigned less"
          }
        ]
      },
      {
        "id": "sec-7-6-3",
        "title": "7.6.3 Example: Finding Maximum",
        "content": "Unsigned maximum:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "7.6.3 Example: Finding Maximum — listing 1",
            "code": "cmp rax, rbx\ncmovb rax, rbx    ; if rax < rbx (unsigned), rax = rbx",
            "explanation": "Signed maximum:"
          },
          {
            "language": "nasm",
            "title": "7.6.3 Example: Finding Maximum — listing 2",
            "code": "cmp rax, rbx\ncmovl rax, rbx    ; if rax < rbx (signed), rax = rbx"
          }
        ]
      },
      {
        "id": "sec-7-7",
        "title": "7.7 Practical Examples",
        "content": ""
      },
      {
        "id": "sec-7-7-1",
        "title": "7.7.1 Program: Compute Factorial (Iterative)",
        "content": "Compute factorial of 5 (120) and exit with code (low byte = 120).",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "7.7.1 Program: Compute Factorial (Iterative) — listing 1",
            "code": "section .text\n    global _start\n\n_start:\n    mov rax, 1          ; result\n    mov rcx, 1          ; counter\nloop_start:\n    cmp rcx, 5\n    jg  done\n    imul rax, rcx       ; rax *= rcx\n    inc rcx\n    jmp loop_start\ndone:\n    mov rdi, rax        ; exit code = 120\n    mov rax, 60\n    syscall"
          }
        ]
      },
      {
        "id": "sec-7-7-2",
        "title": "7.7.2 Program: Check if Power of Two",
        "content": "A number is a power of two if it has exactly one bit set. Use test with rax-1.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "7.7.2 Program: Check if Power of Two — listing 1",
            "code": "section .text\n    global _start\n\n_start:\n    mov rax, 16         ; test number\n    test rax, rax\n    jz  not_power       ; zero is not power of two\n    lea rbx, [rax - 1]  ; rbx = rax - 1\n    test rax, rbx\n    jnz not_power       ; if (rax & (rax-1)) != 0, not power of two\n    ; is power of two\n    mov rdi, 1          ; exit code 1\n    jmp exit\nnot_power:\n    mov rdi, 0          ; exit code 0\nexit:\n    mov rax, 60\n    syscall"
          }
        ]
      },
      {
        "id": "sec-7-7-3",
        "title": "7.7.3 Program: Count Set Bits (Popcount)",
        "content": "Count the number of 1 bits in a 64-bit value using shifts and tests.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "7.7.3 Program: Count Set Bits (Popcount) — listing 1",
            "code": "section .text\n    global _start\n\n_start:\n    mov rax, 0x0F0F0F0F0F0F0F0F   ; value to count bits in\n    xor rbx, rbx          ; counter\ncount_loop:\n    test rax, rax\n    jz  done\n    mov rdx, rax\n    and rdx, 1            ; isolate lowest bit\n    add rbx, rdx          ; add to count\n    shr rax, 1            ; shift right logical\n    jmp count_loop\ndone:\n    mov rdi, rbx          ; exit code = number of bits (32 for 0x0F0F...)\n    mov rax, 60\n    syscall"
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-7-1",
        "title": "Exercise 7.1: Sum of Squares",
        "description": "Compute the sum of squares from 1 to 10 (1² + 2² + ... + 10² = 385). Use imul to compute squares. Exit with the sum (low byte = 129? Actually 385 mod 256 = 129). Confirm with echo $?.",
        "solution": "section .text\nglobal _start\n_start:\n    xor rax, rax        ; sum\n    mov rcx, 1          ; counter\nloop_start:\n    cmp rcx, 10\n    jg done\n    mov rbx, rcx\n    imul rbx, rbx       ; rbx = rcx^2\n    add rax, rbx\n    inc rcx\n    jmp loop_start\ndone:\n    mov rdi, rax        ; 385 -> low byte = 129\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": ""
      },
      {
        "id": "ex-7-2",
        "title": "Exercise 7.2: GCD Using Euclidean Algorithm",
        "description": "Implement the Euclidean algorithm to compute the greatest common divisor of two numbers (e.g., 48 and 18 → GCD = 6). Use division or repeated subtraction. Exit with GCD.",
        "solution": "section .text\nglobal _start\n_start:\n    mov rax, 48\n    mov rbx, 18\ngcd_loop:\n    cmp rbx, 0\n    je done\n    xor rdx, rdx        ; clear for div\n    div rbx             ; rax = quotient, rdx = remainder\n    mov rax, rbx        ; new a = b\n    mov rbx, rdx        ; new b = remainder\n    jmp gcd_loop\ndone:\n    mov rdi, rax        ; gcd = 6\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": ""
      },
      {
        "id": "ex-7-3",
        "title": "Exercise 7.3: Bit Reversal",
        "description": "Write a program that reverses the bits of a byte (e.g., 10110010 → 01001101). Use shifts and rotates. Exit with the reversed byte.",
        "solution": "section .text\nglobal _start\n_start:\n    mov al, 0b10110010   ; value to reverse\n    xor bl, bl           ; result\n    mov cl, 8            ; loop count\nreverse_loop:\n    shr al, 1            ; shift out LSB into CF\n    rcl bl, 1            ; rotate carry into result (from left? Actually rcl rotates left through carry: bl = bl<<1 + CF)\n    dec cl\n    jnz reverse_loop\n    ; bl = reversed bits: 0b01001101 = 0x4D = 77\n    movzx rdi, bl\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": ""
      },
      {
        "id": "ex-7-4",
        "title": "Exercise 7.4: Signed Division with Negative Numbers",
        "description": "Compute (−27) / 5 using idiv. What are quotient and remainder? According to C semantics, quotient = -5, remainder = -2. Verify. Exit with remainder (as low byte).",
        "solution": "section .text\nglobal _start\n_start:\n    mov rax, -27\n    mov rbx, 5\n    cqo                 ; sign-extend rax into rdx:rax\n    idiv rbx            ; quotient -5 (rax), remainder -2 (rdx)\n    ; exit with remainder: rdx = -2, low byte = 0xFE = 254\n    mov rdi, rdx\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": ""
      },
      {
        "id": "ex-7-5",
        "title": "Exercise 7.5: Logical Masking",
        "description": "Given a 64-bit value in rax, clear bits 3–5, set bits 7 and 8, toggle bit 0. Start with rax = 0xFFFFFFFFFFFFFFFF. Show the final result (should be 0xFFFFFFFFFFFFFEFE? Let's compute: clear bits 3-5 means mask off bits 3,4,5. Set bits 7 and 8. Toggle bit 0. Starting all ones: clear bits 3-5 gives ...1111111111111111111111111111111111111111111111111111111110001111? Actually all ones: bit 3,4,5 are ones, clearing them yields zeros. Set bits 7,8 (they are already ones, stay ones). Toggle bit 0: it's one, becomes zero. Final: bits 3-5 zero, bit 0 zero, others one. Represent in hex: 0xFFFFFFFFFFFFFFC7? Wait, bits 0,3,4,5 clear = 111...1110001111? We'll compute in solution.)",
        "solution": "section .text\nglobal _start\n_start:\n    mov rax, 0xFFFFFFFFFFFFFFFF\n    ; clear bits 3-5: mask off bits 3,4,5 => AND with ~(0b00111000)\n    and rax, ~0b00111000   ; ~0x38 = 0xFFFFFFFFFFFFFFC7\n    ; set bits 7 and 8: OR with 0b110000000 = 0x180\n    or  rax, 0x180\n    ; toggle bit 0: XOR with 1\n    xor rax, 1\n    ; Final: \n    ; Start all ones.\n    ; Clear bits 3,4,5 -> bits become 0 at positions 3,4,5.\n    ; Set bits 7,8 -> already 1, stay 1.\n    ; Toggle bit 0 -> becomes 0.\n    ; Result: all ones except bits 0,3,4,5 zero.\n    ; Hex: 0xFFFFFFFFFFFFFFC7? Wait, bit 0 is zero, bits 3-5 zero, so value = 0xFFFFFFFFFFFFFFC7? Let's compute:\n    ; All ones: 0xFFFFFFFFFFFFFFFF\n    ; Clear bits 3,4,5: mask = ~0x38 = 0xFFFFFFFFFFFFFFC7, so after AND: 0xFFFFFFFFFFFFFFC7.\n    ; OR with 0x180: bits 7,8 set, but they are already 1 (since C7 has bit7=1, bit8=1). So stays 0xFFFFFFFFFFFFFFC7.\n    ; XOR with 1: toggles bit0 from 1 to 0, so final = 0xFFFFFFFFFFFFFFC6.\n    ; Exit code low byte = 0xC6 = 198\n    mov rdi, rax\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "Resolved result: 0xFFFFFFFFFFFFFFC6. Clearing bits 3–5 gives 0xFFFFFFFFFFFFFFC7; bits 7 and 8 are already set; toggling bit 0 gives C6 in the low byte. The expected exit code is 198. The tentative values in the source exercise are intermediate guesses, not the final answer."
      }
    ],
    "practiceQuestions": [
      {
        "question": "What is the difference between mul and imul? When would you use each?",
        "answer": "mul performs unsigned multiplication and uses the accumulator implicitly, producing a double-width result. imul performs signed multiplication and also has two- and three-operand forms. Use the form appropriate to the signedness, required result width, and overflow check."
      },
      {
        "question": "How do you prepare for signed 64-bit division? Explain cqo.",
        "answer": "Put the signed 64-bit dividend in RAX and execute cqo to sign-extend it into RDX:RAX, then idiv with a nonzero divisor. The quotient is in RAX and remainder in RDX. Also guard against a quotient that cannot fit, such as the most negative signed value divided by −1."
      },
      {
        "question": "What is the effect of xor rax, rax? Why is it preferred over mov rax, 0?",
        "answer": "xor rax, rax clears RAX because a value XORed with itself is zero. It is a compact zeroing idiom, but it changes flags. Use mov when preserving the existing flags matters."
      },
      {
        "question": "Describe the difference between shr and sar. Provide an example where sar is necessary.",
        "answer": "shr shifts bits right and inserts 0 at the MSB (unsigned division). sar shifts right while replicating the MSB sign bit (signed division preserving negative numbers). For example, shifting −3 right by one with sar gives −2 by repeating the sign bit. shr instead treats the bits as unsigned. sar rounds negative values down; idiv truncates toward zero."
      },
      {
        "question": "How can you test if a number is even using logical instructions?",
        "answer": "Use test rax, 1 followed by jz is_even. An even integer has bit zero clear, so the AND test produces zero and sets ZF without modifying RAX."
      },
      {
        "question": "What does the test instruction do? Give an example of checking if a specific bit is set.",
        "answer": "test computes a bitwise AND for flag updates and discards the result. For example, test rax, 8 followed by jnz bit3_set checks bit 3 without changing RAX."
      },
      {
        "question": "Explain the flags set by add when overflow occurs (signed and unsigned).",
        "answer": "CF indicates an unsigned carry out of the operand width, while OF indicates that the signed sum does not fit. ZF indicates a zero result and SF copies the result’s most significant bit. CF and OF can differ for the same operation."
      },
      {
        "question": "How would you compute rax % 8 (remainder) using logical instructions instead of division?",
        "answer": "For unsigned RAX, and rax, 7 keeps the low three bits and gives the remainder modulo 8. This also works for nonnegative signed values, but not for the signed division remainder of a negative number, which can be negative."
      },
      {
        "question": "What is the purpose of rcl and rcr? How do they use the carry flag?",
        "answer": "rcl and rcr rotate bits through CF, treating the carry flag as an additional bit. rcl shifts the old CF into the low bit and moves the old high bit into CF; rcr does the reverse. The bit-reversal solution uses shr to produce a carry bit and rcl to insert it into the result."
      },
      {
        "question": "Write a short snippet to multiply rax by 10 without using imul or mul.",
        "answer": "lea rax, [rax + rax*4] computes 5 × RAX; shl rax, 1 doubles it to 10 × the original value. The result wraps at the register width, and shl changes flags."
      }
    ],
    "summary": [
      "Arithmetic instructions include add, sub, inc, dec, neg, mul, imul, div, idiv.",
      "Multiplication and division use implicit registers (rax, rdx) for wide results.",
      "Signed division requires sign-extension (cqo), unsigned division requires zero-extension (xor rdx, rdx).",
      "Logical instructions (and, or, xor, not, test) manipulate bits; test is used for bit testing without modifying operands.",
      "Shift instructions (shl, shr, sar) provide fast multiplication/division by powers of two; arithmetic shifts preserve sign.",
      "Rotate instructions (rol, ror) move bits circularly.",
      "Distinguish signed vs unsigned operations and use appropriate conditional jumps.",
      "In the next chapter, we’ll explore control flow in depth: comparisons, branches, and loops."
    ]
  },
  {
    "id": 8,
    "slug": "chapter-8-control-flow-branches-loops",
    "level": 2,
    "levelTitle": "Core Assembly Programming",
    "title": "Chapter 8: Control Flow: Comparisons, Branches, and Loops",
    "subtitle": "Translating While, For, If-Else, and Nested Loops into Assembly",
    "learningObjectives": [
      "Understand how comparison instructions (cmp, test) affect CPU flags.",
      "Master unconditional jumps (jmp) and conditional jumps (jcc) for branching.",
      "Distinguish between signed and unsigned conditional jumps and know when to use each.",
      "Implement common control flow structures: if‑else, while, do‑while, and for loops in assembly.",
      "Use loops to iterate over arrays, perform repeated calculations, and implement algorithms.",
      "Write complete assembly programs that utilize branching and looping to solve problems."
    ],
    "prerequisites": [
      "Solid understanding of arithmetic and logical instructions (Chapter 7).",
      "Familiarity with data movement and addressing modes (Chapter 6).",
      "Knowledge of flags and how they are set by instructions (Chapters 5 and 7).",
      "Ability to assemble and link NASM programs (Chapter 4)."
    ],
    "keyConcepts": [
      "cmp performs subtraction without storing the result, only setting flags.",
      "Conditional jumps (je, jne, jg, jl, etc.) branch based on flag states.",
      "Signed and unsigned comparisons require different jump mnemonics.",
      "Loops are constructed using a combination of initialization, condition check, body, and update.",
      "The loop instruction is a historical shortcut but is often slower and less flexible than cmp/jcc.",
      "Branch prediction and pipeline effects make conditional moves (cmovcc) sometimes preferable (covered in Chapter 6 and revisited later)."
    ],
    "diagramType": "control_flow",
    "sections": [
      {
        "id": "sec-8-1",
        "title": "8.1 Comparison and Flags",
        "content": "To make decisions, the CPU provides a cmp instruction that compares two values by subtracting them and discarding the result, but updating the flags accordingly. The flags then drive conditional jumps."
      },
      {
        "id": "sec-8-1-1",
        "title": "8.1.1 cmp Instruction",
        "content": "Syntax:\n\nClarification: cmp does not allow both operands to be memory. If no register determines the size of a memory operand, give an explicit size such as cmp qword [rsp], 0.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "8.1.1 cmp Instruction — listing 1",
            "code": "cmp operand1, operand2   ; computes operand1 - operand2, sets flags, discards result",
            "explanation": "operand1 can be a register or memory; operand2 can be a register, memory, or immediate. Both operands must be of the same size.\n\nExamples:"
          },
          {
            "language": "nasm",
            "title": "8.1.1 cmp Instruction — listing 2",
            "code": "cmp rax, 10              ; rax - 10\ncmp rbx, rcx             ; rbx - rcx\ncmp qword [rsp], 0       ; memory - 0"
          }
        ]
      },
      {
        "id": "sec-8-1-2",
        "title": "8.1.2 Flags Used for Comparison",
        "content": "After cmp, the most relevant flags are:\n\n- ZF (Zero Flag): Set if the two operands are equal (result = 0).\n- SF (Sign Flag): Set if the result is negative (MSB = 1). For signed comparisons, SF reflects the sign of the result.\n- CF (Carry Flag): For unsigned subtraction, CF is set if a borrow occurs (i.e., operand1 < operand2 unsigned).\n- OF (Overflow Flag): Set if signed overflow occurs (result too large for signed interpretation). For signed comparisons, OF combined with SF indicates the true sign of the mathematical result when overflow happens.\n\nThe CPU doesn't know whether the operands are signed or unsigned; the programmer must choose the correct conditional jump based on the flags."
      },
      {
        "id": "sec-8-1-3",
        "title": "8.1.3 test Instruction",
        "content": "test performs a bitwise AND and sets flags, but discards the result. It is often used to check if a register is zero or if specific bits are set.\n\nClarification: test reg, reg avoids an immediate operand, but it is not universally faster than cmp reg, 0. Performance depends on the CPU and surrounding code.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "8.1.3 test Instruction — listing 1",
            "code": "test rax, rax       ; ZF=1 if rax == 0\ntest al, 1          ; ZF=1 if bit 0 is 0 (even)\ntest rbx, 0xFF      ; ZF=1 if low 8 bits are all zero",
            "explanation": "test is preferred over cmp reg, 0 for zero-testing because it is smaller and faster (no immediate needed)."
          }
        ]
      },
      {
        "id": "sec-8-2",
        "title": "8.2 Unconditional Jumps",
        "content": "The jmp instruction transfers control to a target address. It can be:\n\n- Direct: target is a label (assembler computes relative offset or absolute address).",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "8.2 Unconditional Jumps — listing 1",
            "code": "jmp label",
            "explanation": "- Indirect: target address is in a register or memory."
          },
          {
            "language": "nasm",
            "title": "8.2 Unconditional Jumps — listing 2",
            "code": "jmp rax             ; jump to address in rax\njmp qword [rsp]     ; jump to address stored on stack",
            "explanation": "In 64-bit mode, direct jumps are RIP-relative by default (position-independent). jmp does not affect flags.\n\nExample:"
          },
          {
            "language": "nasm",
            "title": "8.2 Unconditional Jumps — listing 3",
            "code": "    jmp start\n    ; ... skipped code ...\nstart:\n    mov rax, 1"
          }
        ]
      },
      {
        "id": "sec-8-2-1",
        "title": "8.2.1 Short and Near Jumps",
        "content": "- Short jump: 8-bit displacement (±128 bytes from next instruction). Used for local branches.\n- Near jump: 32-bit displacement (±2 GB). Default for labels in 64-bit mode.\n\nThe assembler automatically selects short or near based on distance, unless you force with jmp short label or jmp near label.\n\nClarification: The exact short displacement range is −128 through +127 bytes from the next instruction. The signed 32-bit near displacement range is −2^31 through 2^31−1. Encoding choice depends on the distance and assembler settings."
      },
      {
        "id": "sec-8-3",
        "title": "8.3 Conditional Jumps",
        "content": "Conditional jumps transfer control only if a specific condition is true, based on the current flags. They are the building blocks of if‑else and loops."
      },
      {
        "id": "sec-8-3-1",
        "title": "8.3.1 Signed vs Unsigned Conditional Jumps",
        "content": "Other useful jumps:\n- js (sign set, SF=1), jns (sign not set, SF=0)\n- jc (carry set, CF=1), jnc (carry not set, CF=0)\n- jo (overflow set, OF=1), jno (overflow not set, OF=0)\n- jcxz, jecxz, jrcxz (jump if cx/ecx/rcx is zero) – rarely used.",
        "tableData": {
          "headers": [
            "Signed Condition",
            "Unsigned Condition",
            "Description",
            "Flags Checked"
          ],
          "rows": [
            [
              "je / jz",
              "je / jz",
              "Equal / zero",
              "ZF = 1"
            ],
            [
              "jne / jnz",
              "jne / jnz",
              "Not equal / not zero",
              "ZF = 0"
            ],
            [
              "jg / jnle",
              "ja / jnbe",
              "Greater (signed) / above (unsigned)",
              "ZF=0 and SF=OF (signed); CF=0 and ZF=0 (unsigned)"
            ],
            [
              "jge / jnl",
              "jae / jnb",
              "Greater or equal / above or equal",
              "SF=OF (signed); CF=0 (unsigned)"
            ],
            [
              "jl / jnge",
              "jb / jnae",
              "Less (signed) / below (unsigned)",
              "SF≠OF (signed); CF=1 (unsigned)"
            ],
            [
              "jle / jng",
              "jbe / jna",
              "Less or equal / below or equal",
              "ZF=1 or SF≠OF (signed); CF=1 or ZF=1 (unsigned)"
            ]
          ]
        }
      },
      {
        "id": "sec-8-3-2",
        "title": "8.3.2 Examples of Conditional Jumps",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "8.3.2 Examples of Conditional Jumps — listing 1",
            "code": "    cmp rax, rbx\n    je  equal_label          ; if rax == rbx\n    jl  less_label           ; if rax < rbx (signed)\n    jb  below_label          ; if rax < rbx (unsigned)\n    jg  greater_label        ; if rax > rbx (signed)\n    jle less_or_equal_label  ; if rax <= rbx (signed)"
          }
        ]
      },
      {
        "id": "sec-8-3-3",
        "title": "8.3.3 Signed vs Unsigned Illustration",
        "content": "Consider rax = 0xFFFFFFFFFFFFFFFF (-1 signed, 2^64-1 unsigned) and rbx = 1. After cmp rax, rbx:\n- Signed interpretation: -1 < 1 → jl will be taken.\n- Unsigned interpretation: 18446744073709551615 > 1 → ja will be taken.\n\nUsing the wrong jump leads to logic bugs."
      },
      {
        "id": "sec-8-4",
        "title": "8.4 Implementing If-Else and Conditional Execution",
        "content": ""
      },
      {
        "id": "sec-8-4-1",
        "title": "8.4.1 Basic If-Else Pattern",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "8.4.1 Basic If-Else Pattern — listing 1",
            "code": "    cmp rax, 10\n    jg  greater_than_10\n    ; else: rax <= 10\n    ; ... code for else ...\n    jmp end_if\ngreater_than_10:\n    ; ... code for if ...\nend_if:\n    ; continue",
            "explanation": "If the condition is false, we fall through to the else branch; if true, we jump to the if branch."
          }
        ]
      },
      {
        "id": "sec-8-4-2",
        "title": "8.4.2 If Without Else",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "8.4.2 If Without Else — listing 1",
            "code": "    test rax, rax\n    jz  zero_case\n    ; rax != 0, do something\nzero_case:\n    ; continue"
          }
        ]
      },
      {
        "id": "sec-8-4-3",
        "title": "8.4.3 Nested If-Else",
        "content": "Nested conditions can be built by cascading jumps.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "8.4.3 Nested If-Else — listing 1",
            "code": "    cmp eax, 0\n    jg  positive\n    jl  negative\n    ; zero case\n    jmp end_all\npositive:\n    ; eax > 0\n    jmp end_all\nnegative:\n    ; eax < 0\nend_all:"
          }
        ]
      },
      {
        "id": "sec-8-4-4",
        "title": "8.4.4 Using cmovcc to Avoid Branches",
        "content": "As seen in Chapter 6, cmovcc can replace simple if-else assignments:\n\nClarification: This particular cmp/cmovg pair selects the signed minimum in RAX, because it replaces RAX only when RAX is greater than RBX.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "8.4.4 Using cmovcc to Avoid Branches — listing 1",
            "code": "    cmp rax, rbx\n    cmovg rax, rbx    ; if rax > rbx (signed), rax = rbx",
            "explanation": "This avoids branch mispredictions but may be less readable."
          }
        ]
      },
      {
        "id": "sec-8-5",
        "title": "8.5 Loops",
        "content": "Loops repeat a block of code while a condition is true. The standard pattern is:\n\n1. Initialize counter or condition variable.\n2. Check condition; if false, exit loop.\n3. Execute loop body.\n4. Update counter or condition.\n5. Jump back to step 2."
      },
      {
        "id": "sec-8-5-1",
        "title": "8.5.1 While Loop",
        "content": "A while loop checks the condition before the body.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "8.5.1 While Loop — listing 1",
            "code": "    ; while (rax < 10) { ... }\nwhile_start:\n    cmp rax, 10\n    jge while_end          ; if rax >= 10, exit\n    ; body\n    inc rax\n    jmp while_start\nwhile_end:"
          }
        ]
      },
      {
        "id": "sec-8-5-2",
        "title": "8.5.2 Do-While Loop",
        "content": "A do-while loop executes the body at least once, then checks the condition.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "8.5.2 Do-While Loop — listing 1",
            "code": "    ; do { ... } while (rax < 10);\ndo_start:\n    ; body\n    inc rax\n    cmp rax, 10\n    jl  do_start           ; continue if rax < 10"
          }
        ]
      },
      {
        "id": "sec-8-5-3",
        "title": "8.5.3 For Loop",
        "content": "A for loop is syntactic sugar for a while loop: initialization, condition, increment.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "8.5.3 For Loop — listing 1",
            "code": "    ; for (rcx = 0; rcx < 10; rcx++) { ... }\n    xor rcx, rcx\nfor_cond:\n    cmp rcx, 10\n    jge for_end\n    ; body\n    inc rcx\n    jmp for_cond\nfor_end:"
          }
        ]
      },
      {
        "id": "sec-8-5-4",
        "title": "8.5.4 Loop Using loop Instruction",
        "content": "The loop instruction decrements rcx (or ecx/cx) and jumps to a label if rcx != 0. It is a compact way to implement a counting loop, but it is slower on modern CPUs because it uses the rcx register and does not allow complex conditions.\n\nClarification: Do not enter a loop-based count-down with an initial count of zero unless wraparound is intended: loop decrements first. The counter selected by the address size is normally RCX in 64-bit mode. Linux syscall overwrites RCX and R11, so a printing loop must preserve its counter elsewhere.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "8.5.4 Loop Using loop Instruction — listing 1",
            "code": "    mov rcx, 10\nloop_start:\n    ; body\n    loop loop_start       ; decrement rcx, jump if not zero",
            "explanation": "Caution: loop only checks rcx; if you modify rcx inside the loop, the count changes. It also does not affect flags, so it’s hard to combine with other conditions. Most modern code uses dec rcx + jnz instead, which is often faster."
          }
        ]
      },
      {
        "id": "sec-8-6",
        "title": "8.6 Nested Loops and Complex Control Flow",
        "content": "Nested loops are common for algorithms like matrix operations or multiplication tables."
      },
      {
        "id": "sec-8-6-1",
        "title": "8.6.1 Example: Multiplication Table (1–5)",
        "content": "We'll compute and store the products of 1×1 to 5×5 in an array, then exit with the sum of all products. (In later chapters we'll print them.)",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "8.6.1 Example: Multiplication Table (1–5) — listing 1",
            "code": "section .bss\n    table resq 25        ; 5x5 qwords\nsection .text\nglobal _start\n\n_start:\n    xor rcx, rcx          ; i = 0\nouter_loop:\n    cmp rcx, 5\n    jge outer_done\n    xor rdx, rdx          ; j = 0\ninner_loop:\n    cmp rdx, 5\n    jge inner_done\n    ; compute (i+1)*(j+1)\n    mov rax, rcx\n    inc rax               ; i+1\n    mov rbx, rdx\n    inc rbx               ; j+1\n    imul rax, rbx         ; product\n    ; store at table[i*5 + j]\n    mov r8, rcx\n    imul r8, 5\n    add r8, rdx\n    mov [table + r8*8], rax   ; qword array\n    inc rdx\n    jmp inner_loop\ninner_done:\n    inc rcx\n    jmp outer_loop\nouter_done:\n    ; sum all products\n    xor rax, rax\n    xor rcx, rcx\nsum_loop:\n    cmp rcx, 25\n    jge done\n    add rax, [table + rcx*8]\n    inc rcx\n    jmp sum_loop\ndone:\n    ; exit with sum low byte = 225? Actually sum = 225, low byte = 225.\n    mov rdi, rax\n    mov rax, 60\n    syscall"
          }
        ]
      },
      {
        "id": "sec-8-7",
        "title": "8.7 Practical Examples",
        "content": ""
      },
      {
        "id": "sec-8-7-1",
        "title": "8.7.1 Sum of Array Elements",
        "content": "Sum all elements of a 10-element array using a loop.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "8.7.1 Sum of Array Elements — listing 1",
            "code": "section .data\n    arr dq 1,2,3,4,5,6,7,8,9,10\n    len equ 10\nsection .text\nglobal _start\n_start:\n    xor rax, rax          ; sum = 0\n    xor rcx, rcx          ; index = 0\nsum_loop:\n    cmp rcx, len\n    je  done\n    add rax, [arr + rcx*8]\n    inc rcx\n    jmp sum_loop\ndone:\n    mov rdi, rax          ; exit code = 55\n    mov rax, 60\n    syscall"
          }
        ]
      },
      {
        "id": "sec-8-7-2",
        "title": "8.7.2 Find Maximum in Array",
        "content": "Find the maximum unsigned value in an array.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "8.7.2 Find Maximum in Array — listing 1",
            "code": "section .data\n    arr dq 15, 8, 23, 42, 4, 16, 30, 1, 99, 7\n    len equ 10\nsection .text\nglobal _start\n_start:\n    mov rbx, [arr]        ; max = first element\n    mov rcx, 1            ; index = 1\nmax_loop:\n    cmp rcx, len\n    je  done\n    mov rax, [arr + rcx*8]\n    cmp rax, rbx\n    jbe skip              ; unsigned comparison\n    mov rbx, rax          ; update max\nskip:\n    inc rcx\n    jmp max_loop\ndone:\n    mov rdi, rbx          ; exit code = 99\n    mov rax, 60\n    syscall"
          }
        ]
      },
      {
        "id": "sec-8-7-3",
        "title": "8.7.3 Print Digits 0–9",
        "content": "We'll print each digit using syscall, converting number to ASCII by adding '0'. We'll output one digit per line.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original source: Print Digits 0–9 (RCX counter bug)",
            "code": "section .data\n    newline db 0xA\nsection .bss\n    digit resb 1\nsection .text\nglobal _start\n_start:\n    mov rcx, 0            ; digit = 0\nprint_loop:\n    cmp rcx, 10\n    je  done\n    ; convert to ASCII and store\n    mov rax, rcx\n    add rax, '0'\n    mov [digit], al\n    ; write digit\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, digit\n    mov rdx, 1\n    syscall\n    ; write newline\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, newline\n    mov rdx, 1\n    syscall\n    inc rcx\n    jmp print_loop\ndone:\n    mov rax, 60\n    xor rdi, rdi\n    syscall",
            "explanation": "Source listing retained for comparison. Do not use this version as a working loop: syscall overwrites RCX, so the counter is lost. Use the corrected listing below."
          },
          {
            "language": "nasm",
            "title": "Corrected runnable example: Print Digits 0–9",
            "code": "section .data\n    newline db 0xA\nsection .bss\n    digit resb 1\nsection .text\nglobal _start\n_start:\n    mov r12, 0            ; digit = 0\nprint_loop:\n    cmp r12, 10\n    je  done\n    ; convert to ASCII and store\n    mov rax, r12\n    add rax, '0'\n    mov [digit], al\n    ; write digit\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, digit\n    mov rdx, 1\n    syscall\n    ; write newline\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, newline\n    mov rdx, 1\n    syscall\n    inc r12\n    jmp print_loop\ndone:\n    mov rax, 60\n    xor rdi, rdi\n    syscall",
            "explanation": "R12 holds the digit counter across the write syscalls. Expected output: one digit per line, from 0 through 9, followed by exit status 0."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 8.1 (counter and two-digit bugs)",
            "code": "section .data\n    newline db 0xA\nsection .bss\n    digit resb 1\nsection .text\nglobal _start\n_start:\n    mov rcx, 10\ncountdown:\n    ; print digit\n    mov rax, rcx\n    add rax, '0'\n    mov [digit], al\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, digit\n    mov rdx, 1\n    syscall\n    ; newline\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, newline\n    mov rdx, 1\n    syscall\n    dec rcx\n    jnz countdown       ; continue while rcx != 0\n    ; exit\n    mov rax, 60\n    xor rdi, rdi\n    syscall",
            "explanation": "This source solution also loses RCX across syscall, and adding ASCII zero to 10 produces a colon. The corrected countdown is provided under Exercise 8.1."
          }
        ]
      },
      {
        "id": "sec-8-7-4",
        "title": "8.7.4 Factorial with Loop",
        "content": "Compute 10! (3,628,800) and exit with low 32 bits as exit code (mod 256). We'll use a loop from 1 to 10.\n\nClarification: The shell reports the low eight bits of the exit status, not a full 32-bit result. Here 10! = 3,628,800 = 0x375F00, so the observed exit code is 0.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "8.7.4 Factorial with Loop — listing 1",
            "code": "section .text\nglobal _start\n_start:\n    mov rax, 1            ; result\n    mov rcx, 1            ; counter\nfact_loop:\n    cmp rcx, 10\n    jg  done\n    imul rax, rcx         ; result *= counter\n    inc rcx\n    jmp fact_loop\ndone:\n    mov rdi, rax          ; exit code low byte = 0 (since 3,628,800 mod 256 = 0? Actually 3,628,800 = 0x375F00, low byte = 0)\n    mov rax, 60\n    syscall"
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-8-1",
        "title": "Exercise 8.1: Countdown",
        "description": "Write a program that loops from 10 down to 1, printing each number (as single digit) on a separate line. Use dec and jnz or cmp/jge.",
        "solution": "section .data\n    ten db '10', 10\nsection .bss\n    line resb 2\nsection .text\nglobal _start\n_start:\n    mov r12, 10\ncountdown:\n    cmp r12, 10\n    jne single_digit\n    lea rsi, [rel ten]\n    mov rdx, 3\n    jmp print_number\nsingle_digit:\n    mov rax, r12\n    add al, '0'\n    mov [rel line], al\n    mov byte [rel line+1], 10\n    lea rsi, [rel line]\n    mov rdx, 2\nprint_number:\n    mov rax, 1\n    mov rdi, 1\n    syscall                 ; RCX/R11 are clobbered; R12 keeps the counter\n    dec r12\n    jnz countdown\n    mov rax, 60\n    xor rdi, rdi\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "Corrected runnable solution: the counter stays in R12 across syscalls. The number 10 is printed as two characters; numbers 9 through 1 use the existing one-digit conversion. Expected output is 10 down to 1, one number per line, with exit status 0. The original source listing is retained in section 8.7.3 for comparison."
      },
      {
        "id": "ex-8-2",
        "title": "Exercise 8.2: Even Numbers Sum",
        "description": "Sum all even numbers from 2 to 20 (inclusive) using a loop. Exit with the sum (low byte = 110). Use a loop that increments by 2.",
        "solution": "section .text\nglobal _start\n_start:\n    xor rax, rax        ; sum\n    mov rcx, 2          ; start at 2\neven_loop:\n    cmp rcx, 20\n    jg  done\n    add rax, rcx\n    add rcx, 2\n    jmp even_loop\ndone:\n    mov rdi, rax        ; 110\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": ""
      },
      {
        "id": "ex-8-3",
        "title": "Exercise 8.3: Array Search",
        "description": "Given an array of 10 qwords, find the index of the first element equal to a target value (say 42). Exit with the index (or -1 if not found, which as exit code is 255). Use a loop and conditional jumps.",
        "solution": "section .data\n    arr dq 10,20,30,42,50,60,70,80,90,100\n    len equ 10\n    target equ 42\nsection .text\nglobal _start\n_start:\n    xor rcx, rcx        ; index\nsearch_loop:\n    cmp rcx, len\n    je  not_found\n    mov rax, [arr + rcx*8]\n    cmp rax, target\n    je  found\n    inc rcx\n    jmp search_loop\nfound:\n    mov rdi, rcx        ; index = 3\n    jmp exit\nnot_found:\n    mov rdi, -1         ; exit code 255\nexit:\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": ""
      },
      {
        "id": "ex-8-4",
        "title": "Exercise 8.4: FizzBuzz (Simplified)",
        "description": "Loop from 1 to 15. If number divisible by 3, exit with code 3; if divisible by 5, exit with code 5; if divisible by both, exit with code 15; else continue. Since only one number triggers each, the first matching condition from 1 upward will determine exit code. (Optional: print numbers, but for now exit with code when condition met.)",
        "solution": "section .text\nglobal _start\n_start:\n    mov rcx, 1\nfizzbuzz_loop:\n    cmp rcx, 15\n    jg  done\n    ; check divisible by 3 and 5 first (both)\n    mov rax, rcx\n    xor rdx, rdx\n    mov rbx, 15\n    div rbx\n    test rdx, rdx\n    jz  both\n    ; check divisible by 3\n    mov rax, rcx\n    xor rdx, rdx\n    mov rbx, 3\n    div rbx\n    test rdx, rdx\n    jz  div3\n    ; check divisible by 5\n    mov rax, rcx\n    xor rdx, rdx\n    mov rbx, 5\n    div rbx\n    test rdx, rdx\n    jz  div5\n    inc rcx\n    jmp fizzbuzz_loop\nboth:\n    mov rdi, 15\n    jmp exit\ndiv3:\n    mov rdi, 3\n    jmp exit\ndiv5:\n    mov rdi, 5\n    jmp exit\ndone:\n    mov rdi, 0      ; no condition met before 15? Actually at 1,2... none, but 3 is div3, so will exit early.\nexit:\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "The first number that matches is 3 (divisible by 3), so exit code will be 3. The program exits on the first match rather than printing a full FizzBuzz sequence. Starting at 1 reaches 3 first; starting at 5 selects code 5, and starting at 15 selects code 15."
      },
      {
        "id": "ex-8-5",
        "title": "Exercise 8.5: Nested Loops – Sum of Matrix",
        "description": "Define a 3x3 matrix of qwords in .data (e.g., values 1–9). Compute the sum of all elements using nested loops. Exit with the sum (45, low byte = 45).",
        "solution": "section .data\n    ; 3x3 matrix\n    matrix dq 1,2,3,4,5,6,7,8,9\n    rows equ 3\n    cols equ 3\nsection .text\nglobal _start\n_start:\n    xor rax, rax        ; sum = 0\n    xor rcx, rcx        ; i = 0\nouter_loop:\n    cmp rcx, rows\n    jge outer_done\n    xor rdx, rdx        ; j = 0\ninner_loop:\n    cmp rdx, cols\n    jge inner_done\n    ; compute index = i*cols + j\n    mov r8, rcx\n    imul r8, cols\n    add r8, rdx\n    add rax, [matrix + r8*8]\n    inc rdx\n    jmp inner_loop\ninner_done:\n    inc rcx\n    jmp outer_loop\nouter_done:\n    mov rdi, rax        ; sum = 45\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": ""
      }
    ],
    "practiceQuestions": [
      {
        "question": "How does cmp differ from sub? When would you use cmp?",
        "answer": "cmp updates flags as if it subtracted the source from the destination, but discards the result. sub also stores the result. Use cmp to decide which branch to take while preserving the operands."
      },
      {
        "question": "What flags are set by cmp when the two operands are equal? When one is less than the other (unsigned)?",
        "answer": "Equal operands produce ZF=1, CF=0, SF=0 and OF=0. If the first operand is less than the second as an unsigned value, subtraction needs a borrow and sets CF=1; jb tests that condition."
      },
      {
        "question": "Explain the difference between jg and ja. Provide an example where using the wrong one causes a bug.",
        "answer": "jg is for signed comparisons (checks ZF=0 and SF=OF). ja is for unsigned comparisons (checks CF=0 and ZF=0). Using jg on unsigned data causes critical logic errors. For RAX = −1 and RBX = 1, jg is not taken, while ja is taken because the same RAX bits represent the largest unsigned 64-bit value."
      },
      {
        "question": "How do you implement a while loop in assembly? Provide a generic template.",
        "answer": "Initialize the loop state before a condition label. At the label, compare the state and jump to the end if the condition is false; otherwise execute the body, update the state, and jump back. Example: mov rax, 0; condition: cmp rax, 10; jge finished; inc rax; jmp condition; finished:"
      },
      {
        "question": "What is the purpose of the loop instruction? Why might you avoid it in modern code?",
        "answer": "loop decrements its counter and branches if the result is nonzero, preserving flags. A dec/jnz or cmp/jcc loop is often easier to adapt and can be faster, depending on the processor. Protect the counter from modification inside the loop."
      },
      {
        "question": "Write assembly code to test if rax is between 10 and 20 (inclusive), using only jumps (no cmov).",
        "answer": "For a signed value: cmp rax, 10; jl outside; cmp rax, 20; jg outside; jmp inside. Define inside and outside as branch labels. Use jb and ja instead for an unsigned value."
      },
      {
        "question": "How would you implement a switch statement in assembly? Briefly describe the approach (using a jump table).",
        "answer": "Normalize the selector to a zero-based index, check that it is within the table bounds, and branch to the default case otherwise. Load the selected case address or relative offset from a jump table and jump indirectly to the case handler."
      },
      {
        "question": "What is the difference between jz and je? Are they interchangeable?",
        "answer": "jz and je are aliases for the same condition, ZF=1. They are interchangeable; je reads naturally after a comparison and jz after a zero test."
      },
      {
        "question": "In a for loop, where should the loop counter be initialized, checked, and updated?",
        "answer": "Initialize once before entering the loop. Check the bound at the condition label before the body. Update the counter after the body, then jump back to the condition label."
      },
      {
        "question": "How can you avoid branch misprediction penalties in performance-critical code? Mention cmovcc and branchless techniques.",
        "answer": "For simple value selection, cmovcc or suitable arithmetic/bitwise selection can avoid an unpredictable branch. Keep predictable branches when they work well; branchless code can add dependencies or extra work. Measure the relevant workload before choosing."
      }
    ],
    "summary": [
      "cmp and test set flags that control conditional jumps.",
      "Signed and unsigned comparisons require different jcc mnemonics (jg/jl vs ja/jb).",
      "Unconditional jmp transfers control to a label or address.",
      "If‑else is implemented by testing a condition and branching to the appropriate code block.",
      "Loops are constructed with an initialization, condition check, body, and update.",
      "Common loop patterns: while, do‑while, for.",
      "The loop instruction is a compact counting loop but is often replaced by dec/jnz for performance.",
      "Nested loops allow processing multi-dimensional data.",
      "In the next chapter, we’ll explore arrays, strings, and memory operations in depth, applying loops and addressing modes to manipulate data structures."
    ]
  },
  {
    "id": 9,
    "slug": "chapter-9-arrays-strings-memory",
    "level": 2,
    "levelTitle": "Core Assembly Programming",
    "title": "Chapter 9: Arrays, Strings, and Memory Operations",
    "subtitle": "String Primaries: movsb, stosb, lodsb, cmpsb, scasb & ASCII Conversions",
    "learningObjectives": [
      "Understand how arrays are stored in memory and how to access elements using addressing modes.",
      "Master 1D and 2D array traversal with loops and indexing.",
      "Learn the x86 string instructions (movs, stos, lods, cmps, scas) and their repeat prefixes.",
      "Use rep movsb, rep stosb, and rep cmpsb for efficient memory block operations.",
      "Understand the role of the direction flag (DF) and the rsi/rdi registers in string operations.",
      "Write programs that manipulate arrays and strings, including copying, filling, comparing, and converting between numbers and strings.",
      "Gain practical experience with memory layout and pointer arithmetic."
    ],
    "prerequisites": [
      "Solid understanding of control flow, loops, and jumps (Chapter 8).",
      "Familiarity with data movement, addressing modes, and the stack (Chapter 6).",
      "Knowledge of arithmetic and logical instructions (Chapter 7).",
      "Basic understanding of ASCII representation (Chapter 2)."
    ],
    "keyConcepts": [
      "Arrays are contiguous blocks of memory; elements are accessed via base address + index * element size.",
      "2D arrays are stored in row-major order: row * columns + column.",
      "String instructions operate on memory using implicit registers rsi (source) and rdi (destination).",
      "The direction flag (DF) controls whether string operations increment or decrement pointers.",
      "Repeat prefixes (rep, repe, repne) allow compact loop implementations for string operations.",
      "Memory block operations are highly optimized on modern CPUs, but may have overhead for small counts."
    ],
    "diagramType": "strings_arrays",
    "sections": [
      {
        "id": "sec-9-1",
        "title": "9.1 Arrays in Assembly",
        "content": "An array is a sequence of elements of the same type stored contiguously in memory. In assembly, we define arrays in the .data or .bss sections and access elements using addressing modes like [base + index*scale]."
      },
      {
        "id": "sec-9-1-1",
        "title": "9.1.1 Defining Arrays",
        "content": "In NASM:\n- db – define bytes (8-bit)\n- dw – define words (16-bit)\n- dd – define doublewords (32-bit)\n- dq – define quadwords (64-bit)\n\nExamples:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "9.1.1 Defining Arrays — listing 1",
            "code": "section .data\n    byte_array db 1, 2, 3, 4, 5           ; 5 bytes\n    word_array dw 100, 200, 300           ; 3 words (2 bytes each)\n    dword_array dd 1000, 2000, 3000, 4000 ; 4 dwords\n    qword_array dq 100000, 200000         ; 2 qwords",
            "explanation": "For uninitialized arrays (or large buffers), use .bss:"
          },
          {
            "language": "nasm",
            "title": "9.1.1 Defining Arrays — listing 2",
            "code": "section .bss\n    buffer resb 100       ; reserve 100 bytes\n    int_array resd 20     ; reserve 20 dwords (80 bytes)\n    qarray resq 10        ; reserve 10 qwords"
          }
        ]
      },
      {
        "id": "sec-9-1-2",
        "title": "9.1.2 Accessing Array Elements",
        "content": "To access the i-th element, compute the address as:\n- Base address (label) + i * element size\n\nUsing indexed addressing:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "sum an array of 10 dwords",
            "code": "; sum an array of 10 dwords\nsection .data\n    arr dd 1,2,3,4,5,6,7,8,9,10\n    len equ 10\nsection .text\nglobal _start\n_start:\n    xor eax, eax        ; sum\n    xor rcx, rcx        ; index\nloop:\n    cmp rcx, len\n    je done\n    add eax, [arr + rcx*4]   ; load dword at arr + index*4\n    inc rcx\n    jmp loop\ndone:\n    ; eax = 55\n    mov rdi, rax\n    mov rax, 60\n    syscall",
            "explanation": "For an array of qwords, scale factor is 8. For words, 2. For bytes, scale factor can be omitted (or use 1)."
          }
        ]
      },
      {
        "id": "sec-9-1-3",
        "title": "9.1.3 Iterating with Pointers",
        "content": "Instead of using an index, you can keep a pointer in a register and advance it by the element size. This often produces more efficient code because it avoids the index calculation.\n\nClarification: This loop assumes len is positive. For a potentially empty array, check the count before reading the first element. Pointer iteration is not automatically faster than indexed addressing; measure the workload.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "9.1.3 Iterating with Pointers — listing 1",
            "code": "section .data\n    arr dq 1,2,3,4,5\n    len equ 5\nsection .text\nglobal _start\n_start:\n    lea rsi, [arr]       ; rsi points to first element\n    mov rcx, len\n    xor rax, rax\nloop:\n    add rax, [rsi]       ; add *rsi\n    add rsi, 8           ; advance pointer by 8 bytes\n    dec rcx\n    jnz loop\n    ; rax = 15\n    mov rdi, rax\n    mov rax, 60\n    syscall"
          }
        ]
      },
      {
        "id": "sec-9-1-4",
        "title": "9.1.4 Reversing an Array",
        "content": "We can reverse an array in place using two pointers (front and back) and swapping elements.\n\nClarification: The sum remains unchanged by reversal, so it does not prove that the array order changed. Verify the resulting elements as well. Use unsigned pointer comparisons for general address ordering.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "9.1.4 Reversing an Array — listing 1",
            "code": "section .data\n    arr dq 1,2,3,4,5,6,7,8,9,10\n    len equ 10\nsection .text\nglobal _start\n_start:\n    lea rsi, [arr]               ; left pointer\n    lea rdi, [arr + (len-1)*8]   ; right pointer (last element)\nreverse_loop:\n    cmp rsi, rdi\n    jge done                     ; if left >= right, done\n    mov rax, [rsi]\n    mov rbx, [rdi]\n    mov [rsi], rbx               ; swap\n    mov [rdi], rax\n    add rsi, 8\n    sub rdi, 8\n    jmp reverse_loop\ndone:\n    ; exit (sum for verification)\n    xor rax, rax\n    lea rsi, [arr]\n    mov rcx, len\nsum_loop:\n    add rax, [rsi]\n    add rsi, 8\n    dec rcx\n    jnz sum_loop\n    ; sum = 55\n    mov rdi, rax\n    mov rax, 60\n    syscall"
          }
        ]
      },
      {
        "id": "sec-9-1-5",
        "title": "9.1.5 Two-Dimensional Arrays",
        "content": "A 2D array (matrix) is stored in memory as a linear sequence, usually row-major order: element [i][j] is at offset (i * columns + j) * element_size.\n\nExample: 3x3 matrix of dwords:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "9.1.5 Two-Dimensional Arrays — listing 1",
            "code": "section .data\n    matrix dd 1,2,3\n           dd 4,5,6\n           dd 7,8,9\n    rows equ 3\n    cols equ 3",
            "explanation": "To access matrix[i][j]:"
          },
          {
            "language": "nasm",
            "title": "compute address = base + (i * cols + j) * 4",
            "code": "; compute address = base + (i * cols + j) * 4\nmov rax, i          ; i\nimul rax, cols      ; i * cols\nadd rax, j          ; i * cols + j\nmov ebx, [matrix + rax*4]",
            "explanation": "Or using lea for address calculation:"
          },
          {
            "language": "nasm",
            "title": "9.1.5 Two-Dimensional Arrays — listing 3",
            "code": "mov rax, i\nimul rax, cols\nadd rax, j\nlea rsi, [matrix + rax*4]\nmov ebx, [rsi]",
            "explanation": "Example: Sum of all elements in a 3x3 matrix:"
          },
          {
            "language": "nasm",
            "title": "9.1.5 Two-Dimensional Arrays — listing 4",
            "code": "section .data\n    matrix dd 1,2,3,4,5,6,7,8,9\n    rows equ 3\n    cols equ 3\nsection .text\nglobal _start\n_start:\n    xor eax, eax        ; sum\n    xor rcx, rcx        ; i\nouter_loop:\n    cmp rcx, rows\n    jge outer_done\n    xor rdx, rdx        ; j\ninner_loop:\n    cmp rdx, cols\n    jge inner_done\n    ; index = i*cols + j\n    mov r8, rcx\n    imul r8, cols\n    add r8, rdx\n    add eax, [matrix + r8*4]\n    inc rdx\n    jmp inner_loop\ninner_done:\n    inc rcx\n    jmp outer_loop\nouter_done:\n    ; eax = 45\n    mov rdi, rax\n    mov rax, 60\n    syscall"
          }
        ]
      },
      {
        "id": "sec-9-2",
        "title": "9.2 String Instructions",
        "content": "x86 provides a set of instructions specifically designed for string (or array) processing. They operate on memory using implicit registers:\n- rsi – source index (pointer to source)\n- rdi – destination index (pointer to destination)\n- rcx – counter (for repeat prefixes)\n- al / ax / eax / rax – data for stos and lods, or comparison value for scas\n\nThe direction flag (DF) in RFLAGS determines whether pointers are incremented (DF=0, forward) or decremented (DF=1, backward) after each operation.\n- cld clears DF (forward)\n- std sets DF (backward)"
      },
      {
        "id": "sec-9-2-1",
        "title": "9.2.1 The String Instructions",
        "content": "These instructions are typically used with the repeat prefixes:\n\n- rep – repeat while rcx != 0 (used with movs, stos, lods)\n- repe / repz – repeat while rcx != 0 and ZF=1 (used with cmps, scas)\n- repne / repnz – repeat while rcx != 0 and ZF=0 (used with cmps, scas for finding non-matching or specific value)",
        "tableData": {
          "headers": [
            "Instruction",
            "Operation",
            "Description"
          ],
          "rows": [
            [
              "movsb",
              "[rdi] = [rsi]; rsi += 1; rdi += 1 (if DF=0)",
              "Move byte from source to dest"
            ],
            [
              "movsw",
              "move word (2 bytes)",
              ""
            ],
            [
              "movsd",
              "move dword (4 bytes)",
              ""
            ],
            [
              "movsq",
              "move qword (8 bytes)",
              ""
            ],
            [
              "stosb",
              "[rdi] = al; rdi += 1",
              "Store byte from al to dest"
            ],
            [
              "stosw",
              "store word from ax",
              ""
            ],
            [
              "stosd",
              "store dword from eax",
              ""
            ],
            [
              "stosq",
              "store qword from rax",
              ""
            ],
            [
              "lodsb",
              "al = [rsi]; rsi += 1",
              "Load byte from source to al"
            ],
            [
              "lodsw",
              "load word to ax",
              ""
            ],
            [
              "lodsd",
              "load dword to eax",
              ""
            ],
            [
              "lodsq",
              "load qword to rax",
              ""
            ],
            [
              "cmpsb",
              "compare [rsi] and [rdi], set flags, then increment/decrement both",
              "Compare byte"
            ],
            [
              "cmpsw",
              "compare words",
              ""
            ],
            [
              "cmpsd",
              "compare dwords",
              ""
            ],
            [
              "cmpsq",
              "compare qwords",
              ""
            ],
            [
              "scasb",
              "compare al with [rdi], set flags, then inc/dec rdi",
              "Scan for byte"
            ],
            [
              "scasw",
              "scan word",
              ""
            ],
            [
              "scasd",
              "scan dword",
              ""
            ],
            [
              "scasq",
              "scan qword",
              ""
            ]
          ]
        }
      },
      {
        "id": "sec-9-2-2",
        "title": "9.2.2 Example: String Length (using scasb)",
        "content": "Compute the length of a null-terminated string by scanning for the null byte.\n\nClarification: This example assumes an accessible null-terminated string. RCX=−1 is not a memory bound; without a terminator, the scan can read beyond valid memory.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original source: String Length (STR label needs a colon)",
            "code": "section .data\n    str db 'Hello, World!', 0\nsection .text\nglobal _start\n_start:\n    lea rdi, [str]       ; pointer to string\n    xor al, al           ; search for null (0)\n    mov rcx, -1          ; maximum count (effectively unlimited)\n    cld                  ; forward direction\n    repne scasb          ; scan for byte 0; rdi ends one past null\n    ; rdi points to byte after null\n    ; compute length = rdi - str - 1\n    lea rax, [rdi - 1]   ; address of null\n    sub rax, str         ; length = null_addr - start\n    ; rax = 13\n    mov rdi, rax\n    mov rax, 60\n    syscall",
            "explanation": "STR is also an instruction mnemonic. Use str: to make the data label unambiguous to NASM. The corrected listing below preserves the algorithm."
          },
          {
            "language": "nasm",
            "title": "Corrected runnable String Length",
            "code": "section .data\n    str: db 'Hello, World!', 0\nsection .text\nglobal _start\n_start:\n    lea rdi, [str]       ; pointer to string\n    xor al, al           ; search for null (0)\n    mov rcx, -1          ; maximum count (effectively unlimited)\n    cld                  ; forward direction\n    repne scasb          ; scan for byte 0; rdi ends one past null\n    ; rdi points to byte after null\n    ; compute length = rdi - str - 1\n    lea rax, [rdi - 1]   ; address of null\n    sub rax, str         ; length = null_addr - start\n    ; rax = 13\n    mov rdi, rax\n    mov rax, 60\n    syscall",
            "explanation": "The explicit label colon resolves the NASM ambiguity. Expected exit status is 13."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 9.2 (STR label needs a colon)",
            "code": "section .data\n    str db 'Assembly is fun', 0\nsection .text\nglobal _start\n_start:\n    lea rdi, [str]\n    xor al, al\n    mov rcx, -1\n    cld\n    repne scasb\n    ; rdi points one past null\n    dec rdi\n    sub rdi, str         ; length\n    mov rax, rdi\n    mov rdi, rax\n    mov rax, 60\n    syscall",
            "explanation": "Retained source listing. The runnable solution in Exercise 9.2 uses str: to disambiguate the data label."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 9.3 (STR label needs a colon)",
            "code": "section .data\n    str db 'Hello, World!', 0\nsection .text\nglobal _start\n_start:\n    ; find end of string\n    lea rdi, [str]\n    xor al, al\n    mov rcx, -1\n    cld\n    repne scasb\n    dec rdi              ; rdi points to null terminator\n    ; now rdi = address of null; we want last character before null: rdi-1\n    dec rdi\n    lea rsi, [str]       ; rsi points to first char\nreverse_loop:\n    cmp rsi, rdi\n    jge done\n    mov al, [rsi]\n    mov bl, [rdi]\n    mov [rsi], bl\n    mov [rdi], al\n    inc rsi\n    dec rdi\n    jmp reverse_loop\ndone:\n    ; exit with first character now (originally '!')\n    movzx rdi, byte [str]\n    mov rax, 60\n    syscall",
            "explanation": "Retained source listing. The runnable solution in Exercise 9.3 uses str: to disambiguate the data label."
          }
        ]
      },
      {
        "id": "sec-9-2-3",
        "title": "9.2.3 Example: String Copy (using rep movsb)",
        "content": "Copy a string (including null terminator) from source to destination.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original source: String Copy (consumed RCX length bug)",
            "code": "section .data\n    src db 'Copy this string', 0\nsection .bss\n    dest resb 100\nsection .text\nglobal _start\n_start:\n    ; find length\n    lea rsi, [src]\n    lea rdi, [dest]\n    ; compute length using scasb or manually\n    lea rdi, [src]\n    xor al, al\n    mov rcx, -1\n    cld\n    repne scasb\n    ; length = rdi - src (since rdi points one past null)\n    mov rcx, rdi\n    sub rcx, src          ; includes null terminator? Actually rdi points after null, so rcx = length+1\n    ; set up for copy\n    lea rsi, [src]\n    lea rdi, [dest]\n    cld\n    rep movsb             ; copy bytes including null\n    ; verify by exiting with length\n    mov rax, rcx\n    dec rax               ; actual string length\n    mov rdi, rax\n    mov rax, 60\n    syscall",
            "explanation": "The copy consumes RCX and leaves it zero. This source listing therefore exits with 255 after decrementing zero, rather than the string length. Use the corrected version below."
          },
          {
            "language": "nasm",
            "title": "Corrected runnable String Copy",
            "code": "section .data\n    src db 'Copy this string', 0\nsection .bss\n    dest resb 100\nsection .text\nglobal _start\n_start:\n    ; find length\n    lea rsi, [src]\n    lea rdi, [dest]\n    ; compute length using scasb or manually\n    lea rdi, [src]\n    xor al, al\n    mov rcx, -1\n    cld\n    repne scasb\n    ; length = rdi - src (since rdi points one past null)\n    mov rcx, rdi\n    sub rcx, src          ; includes null terminator? Actually rdi points after null, so rcx = length+1\n    ; set up for copy\n    lea rsi, [src]\n    lea rdi, [dest]\n    cld\n    mov r8, rcx          ; save byte count before REP consumes RCX\n    rep movsb             ; copy bytes including null\n    ; verify by exiting with length\n    mov rax, r8\n    dec rax               ; actual string length\n    mov rdi, rax\n    mov rax, 60\n    syscall",
            "explanation": "Saves length including the terminator before the copy. Expected exit code: 16 for Copy this string; the copied destination includes its null terminator."
          }
        ]
      },
      {
        "id": "sec-9-2-4",
        "title": "9.2.4 Example: Memory Fill (using rep stosb)",
        "content": "Fill a buffer with a specific byte.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "9.2.4 Example: Memory Fill (using rep stosb) — listing 1",
            "code": "section .bss\n    buffer resb 100\nsection .text\nglobal _start\n_start:\n    lea rdi, [buffer]\n    mov al, 0x41          ; fill with 'A'\n    mov rcx, 100\n    cld\n    rep stosb             ; fill 100 bytes with 0x41\n    ; exit with 0\n    mov rax, 60\n    xor rdi, rdi\n    syscall"
          }
        ]
      },
      {
        "id": "sec-9-2-5",
        "title": "9.2.5 Example: String Compare (using rep cmpsb)",
        "content": "Compare two strings to see if they are equal.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "9.2.5 Example: String Compare (using rep cmpsb) — listing 1",
            "code": "section .data\n    str1 db 'hello', 0\n    str2 db 'hello', 0\n    msg_equal db 'Equal', 0xA\n    len_equal equ $ - msg_equal\n    msg_not_equal db 'Not equal', 0xA\n    len_not_equal equ $ - msg_not_equal\nsection .text\nglobal _start\n_start:\n    lea rsi, [str1]\n    lea rdi, [str2]\n    mov rcx, 6            ; compare 6 bytes (including null)\n    cld\n    repe cmpsb            ; repeat while equal and rcx != 0\n    jne not_equal         ; if ZF=0 at end, strings differ\n    ; equal\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, msg_equal\n    mov rdx, len_equal\n    syscall\n    jmp exit\nnot_equal:\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, msg_not_equal\n    mov rdx, len_not_equal\n    syscall\nexit:\n    mov rax, 60\n    xor rdi, rdi\n    syscall"
          }
        ]
      },
      {
        "id": "sec-9-3",
        "title": "9.3 Memory Block Operations",
        "content": "The rep movs, rep stos, and rep cmps are used for efficient block operations. They are optimized on modern CPUs and can move large blocks quickly."
      },
      {
        "id": "sec-9-3-1",
        "title": "9.3.1 Copying a Block of Memory",
        "content": "To copy n bytes from source to destination:\n\nClarification: The shown forward copy assumes non-overlapping buffers, or an overlap where forward traversal is safe. For general overlap use a memmove-style direction choice. RCX counts elements: bytes for movsb, qwords for movsq.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "9.3.1 Copying a Block of Memory — listing 1",
            "code": "lea rsi, [source]\nlea rdi, [destination]\nmov rcx, n\ncld\nrep movsb",
            "explanation": "For large blocks, using larger element sizes (e.g., movsq for 8-byte chunks) can be faster:"
          },
          {
            "language": "nasm",
            "title": "copy n qwords",
            "code": "; copy n qwords\nmov rcx, n_qwords\nrep movsq",
            "explanation": "If the block size is not a multiple of the chunk size, you must handle the remainder separately."
          }
        ]
      },
      {
        "id": "sec-9-3-2",
        "title": "9.3.2 Filling Memory",
        "content": "To fill n bytes with a value:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "9.3.2 Filling Memory — listing 1",
            "code": "lea rdi, [buffer]\nmov al, value\nmov rcx, n\ncld\nrep stosb",
            "explanation": "Or use larger chunks: mov rax, 0x0101010101010101 and rep stosq."
          }
        ]
      },
      {
        "id": "sec-9-3-3",
        "title": "9.3.3 Comparing Memory Blocks",
        "content": "To compare two blocks of n bytes:\n\nClarification: After a forward cmpsb mismatch, RSI and RDI point one byte past the compared bytes; inspect RSI−1 and RDI−1 for the mismatch. If the initial count is zero, no comparison runs and flags retain their old values, so handle empty blocks separately.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "9.3.3 Comparing Memory Blocks — listing 1",
            "code": "lea rsi, [block1]\nlea rdi, [block2]\nmov rcx, n\ncld\nrepe cmpsb\n; after, ZF=1 if equal; if ZF=0, rsi/rdi point to first mismatch"
          }
        ]
      },
      {
        "id": "sec-9-3-4",
        "title": "9.3.4 Performance Considerations",
        "content": "- rep movsb is fast, but rep movsq (or rep movsd) can be faster for large, aligned blocks because it moves more data per instruction.\n- The CPU may use optimized microcode for rep movs and rep stos, making them very efficient.\n- For small fixed-size copies, explicit mov instructions may be faster because they avoid setup overhead.\n- Always ensure the direction flag is correctly set (cld for forward, std for backward)."
      },
      {
        "id": "sec-9-4",
        "title": "9.4 Converting Between Numbers and Strings",
        "content": "A common memory operation is converting integer values to ASCII strings (for output) and parsing ASCII strings to integers (for input). This involves looping over digits and using arithmetic."
      },
      {
        "id": "sec-9-4-1",
        "title": "9.4.1 Integer to ASCII (Decimal String)",
        "content": "To convert an unsigned 64-bit integer to a decimal string, repeatedly divide by 10 and store remainders (digits) in reverse order.\n\nClarification: Both original conversion routines are retained below for comparison. The first restores RCX before moving it to RAX, losing the digit count. The second starts at RSP and decrements below the allocated temporary area, and it overwrites RBX without preserving it. Use the corrected routine below with a destination of at least 21 bytes.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original source: uint_to_str version 1 (see clarification)",
            "code": "; Convert unsigned integer in rax to string at buffer (rdi)\n; Returns length in rax\nuint_to_str:\n    push rbx\n    push rcx\n    push rdx\n    push rdi            ; save buffer pointer\n\n    mov rbx, 10         ; divisor\n    xor rcx, rcx        ; digit count\n    ; handle 0 specially\n    test rax, rax\n    jnz .not_zero\n    mov byte [rdi], '0'\n    inc rdi\n    inc rcx\n    jmp .done\n.not_zero:\n.reverse_loop:\n    xor rdx, rdx\n    div rbx             ; rax = quotient, rdx = remainder\n    add dl, '0'         ; convert to ASCII\n    push rdx            ; push digit (but careful: only low byte needed)\n    inc rcx\n    test rax, rax\n    jnz .reverse_loop\n    ; pop digits in correct order and store\n    ; we need to pop into memory; we can pop into a register then store byte\n    ; but easier: store from a temporary stack area? Let's use a local buffer.\n    ; For simplicity, we'll use the stack itself to reverse by storing digits in memory.\n    ; Actually the push rdx pushes 8 bytes with digit in low byte. We'll pop into a reg and store.\n    ; But we must preserve rdi and rcx. Let's use a separate loop with rbx as counter.\n    mov rbx, rcx        ; save count\n.store_loop:\n    pop rax             ; get digit\n    mov [rdi], al       ; store digit\n    inc rdi\n    dec rbx\n    jnz .store_loop\n    ; rcx already has length\n.done:\n    pop rdi             ; restore buffer pointer (not needed if caller expects length)\n    pop rdx\n    pop rcx\n    pop rbx\n    mov rax, rcx        ; return length\n    ret",
            "explanation": "However, this implementation uses the stack to reverse digits, which is inefficient and may cause alignment issues. A better approach is to write digits backwards into a temporary buffer and then copy them forwards, or use a recursive algorithm. For simplicity in this chapter, we can store digits in a local array on the stack and then copy. We'll present a cleaner version using a local buffer.\n\nImproved uint_to_str:"
          },
          {
            "language": "nasm",
            "title": "Original source: uint_to_str version 2 (see clarification)",
            "code": "; Converts unsigned integer in rax to string at [rdi], null-terminated.\n; Returns length in rax.\nuint_to_str:\n    sub rsp, 32         ; local buffer for up to 20 digits\n    mov rbx, rsp        ; pointer to end of buffer (we'll write backwards)\n\n    mov rcx, 10         ; divisor\n    xor rdx, rdx\n    mov r9, rdi         ; save destination\n\n    ; handle zero\n    test rax, rax\n    jnz .convert\n    mov byte [rdi], '0'\n    mov byte [rdi+1], 0\n    add rsp, 32\n    mov rax, 1\n    ret\n\n.convert:\n    ; write digits backwards\n    mov rsi, rbx        ; rsi points to one past last digit\n.digit_loop:\n    xor rdx, rdx\n    div rcx             ; rax = quotient, rdx = remainder\n    add dl, '0'\n    dec rbx\n    mov [rbx], dl       ; store digit\n    test rax, rax\n    jnz .digit_loop\n\n    ; now rbx points to first digit, rsi points to one past last digit\n    ; copy digits to destination\n    mov rcx, rsi\n    sub rcx, rbx        ; number of digits\n    mov r8, rcx         ; save length\n    ; copy\n    mov rsi, rbx\n    mov rdi, r9\n.copy_loop:\n    mov al, [rsi]\n    mov [rdi], al\n    inc rsi\n    inc rdi\n    dec rcx\n    jnz .copy_loop\n    mov byte [rdi], 0   ; null terminate\n    mov rax, r8         ; return length\n    add rsp, 32\n    ret",
            "explanation": "This version uses a local stack buffer (32 bytes) and writes digits backwards, then copies them forward."
          },
          {
            "language": "nasm",
            "title": "Corrected uint_to_str: unsigned 64-bit conversion",
            "code": "; Input: RAX = unsigned 64-bit value; RDI = writable buffer of at least 21 bytes.\n; Output: RAX = length, buffer is null-terminated.\n; Clobbers: RCX, RDX, RSI, RDI, R8, R9 and arithmetic flags. DF is cleared.\n; Preserves RBX, RBP, R12-R15 and restores RSP.\nuint_to_str:\n    sub rsp, 32\n    lea r8, [rsp+32]      ; end of the allocated temporary buffer\n    mov r9, r8\n    mov rcx, 10\n.digit_loop:\n    xor rdx, rdx\n    div rcx\n    add dl, '0'\n    dec r9\n    mov [r9], dl\n    test rax, rax\n    jnz .digit_loop       ; zero still produces one digit\n    mov rax, r8\n    sub rax, r9           ; save returned length independently of RCX\n    mov rcx, rax\n    mov rsi, r9\n    cld\n    rep movsb\n    mov byte [rdi], 0\n    add rsp, 32\n    ret",
            "explanation": "Handles zero through 18446744073709551615, writes a null terminator, returns the length independently of the REP counter, and writes digits inside its allocated stack buffer. Callee-saved registers are preserved."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 9.5 caller (function omitted)",
            "code": "section .data\n    num dq 12345\n    buffer times 32 db 0\n    newline db 0xA\nsection .text\nglobal _start\n\n; include uint_to_str function here (copy from chapter)\n; ...\n_start:\n    mov rax, [num]\n    lea rdi, [buffer]\n    call uint_to_str    ; length in rax\n    ; write string\n    mov rdx, rax        ; length\n    mov rax, 1\n    mov rdi, 1\n    lea rsi, [buffer]\n    syscall\n    ; newline\n    mov rax, 1\n    mov rdi, 1\n    lea rsi, [newline]\n    mov rdx, 1\n    syscall\n    ; exit\n    mov rax, 60\n    xor rdi, rdi\n    syscall",
            "explanation": "The source leaves uint_to_str as a placeholder. Exercise 9.5 now includes the corrected routine, so its solution assembles as a complete program."
          }
        ]
      },
      {
        "id": "sec-9-4-2",
        "title": "9.4.2 ASCII to Integer",
        "content": "To parse an ASCII decimal string into an integer:\n\nClarification: This unsigned parser stops at the first non-digit, does not accept a leading sign or whitespace, and does not detect overflow. Arithmetic wraps modulo 2^64; validate or extend it before using it as a general input parser.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Parses string at [rsi] (null-terminated) into unsigned integer in rax.",
            "code": "; Parses string at [rsi] (null-terminated) into unsigned integer in rax.\n; Stops at first non-digit.\natoi:\n    xor rax, rax        ; result\n    xor rcx, rcx        ; temp\n.loop:\n    movzx rcx, byte [rsi] ; load char\n    test rcx, rcx\n    jz .done            ; end of string\n    cmp rcx, '0'\n    jb .done            ; not a digit\n    cmp rcx, '9'\n    ja .done\n    sub rcx, '0'        ; convert to value\n    imul rax, rax, 10   ; rax *= 10\n    add rax, rcx        ; rax += digit\n    inc rsi\n    jmp .loop\n.done:\n    ret"
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-9-1",
        "title": "Exercise 9.1: Array Statistics",
        "description": "Define an array of 10 qwords. Compute the sum, minimum, and maximum. Exit with the sum (mod 256). Then modify to store min and max in variables.",
        "solution": "section .data\n    arr dq 15, -2, 30, 8, 25, 100, -50, 7, 99, 42\n    len equ 10\nsection .bss\n    min resq 1\n    max resq 1\nsection .text\nglobal _start\n_start:\n    lea rsi, [arr]\n    mov rcx, len\n    xor rax, rax          ; sum\n    mov rbx, [rsi]        ; min = first\n    mov rdx, [rsi]        ; max = first\nloop:\n    add rax, [rsi]\n    cmp [rsi], rbx        ; compare with min (signed? unsigned? Use signed)\n    jge not_less\n    mov rbx, [rsi]        ; update min\nnot_less:\n    cmp [rsi], rdx\n    jle not_greater\n    mov rdx, [rsi]        ; update max\nnot_greater:\n    add rsi, 8\n    dec rcx\n    jnz loop\n    ; store min and max\n    mov [min], rbx\n    mov [max], rdx\n    ; exit with sum (mod 256) = ?\n    mov rdi, rax\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "For the supplied signed array, sum = 274, minimum = −50, maximum = 100. The program stores min/max and exits with 274 mod 256 = 18."
      },
      {
        "id": "ex-9-2",
        "title": "Exercise 9.2: String Length with `scasb`",
        "description": "Write a program that computes the length of a null-terminated string using repne scasb. Print the length as a single digit (if < 10) or exit with length as code. For simplicity, exit with the length as exit code.",
        "solution": "section .data\n    str: db 'Assembly is fun', 0\nsection .text\nglobal _start\n_start:\n    lea rdi, [str]\n    xor al, al\n    mov rcx, -1\n    cld\n    repne scasb\n    ; rdi points one past null\n    dec rdi\n    sub rdi, str         ; length\n    mov rax, rdi\n    mov rdi, rax\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "Adds a colon to str: because STR is an instruction mnemonic; the rest of the source algorithm is preserved."
      },
      {
        "id": "ex-9-3",
        "title": "Exercise 9.3: String Reverse",
        "description": "Reverse a string in place (swap characters from both ends). Use a loop with pointers. Print the reversed string using syscalls (if you can, or exit with first character as code). For practice, just reverse and exit with the first character (which should be the original last character).",
        "solution": "section .data\n    str: db 'Hello, World!', 0\nsection .text\nglobal _start\n_start:\n    ; find end of string\n    lea rdi, [str]\n    xor al, al\n    mov rcx, -1\n    cld\n    repne scasb\n    dec rdi              ; rdi points to null terminator\n    ; now rdi = address of null; we want last character before null: rdi-1\n    dec rdi\n    lea rsi, [str]       ; rsi points to first char\nreverse_loop:\n    cmp rsi, rdi\n    jge done\n    mov al, [rsi]\n    mov bl, [rdi]\n    mov [rsi], bl\n    mov [rdi], al\n    inc rsi\n    dec rdi\n    jmp reverse_loop\ndone:\n    ; exit with first character now (originally '!')\n    movzx rdi, byte [str]\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "Adds a colon to str: because STR is an instruction mnemonic; the rest of the source algorithm is preserved."
      },
      {
        "id": "ex-9-4",
        "title": "Exercise 9.4: Memory Copy",
        "description": "Copy a 100-byte block from source to destination using rep movsb. Verify by comparing the first few bytes or exit with the first byte of destination.",
        "solution": "section .data\n    src db 'A'          ; we'll define a larger block in .bss or use times\nsection .bss\n    dest resb 100\n    src_block resb 100\nsection .text\nglobal _start\n_start:\n    ; fill src_block with some pattern\n    lea rdi, [src_block]\n    mov al, 0x42         ; 'B'\n    mov rcx, 100\n    cld\n    rep stosb\n\n    ; copy src_block to dest\n    lea rsi, [src_block]\n    lea rdi, [dest]\n    mov rcx, 100\n    cld\n    rep movsb\n\n    ; exit with first byte of dest\n    movzx rdi, byte [dest]\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": ""
      },
      {
        "id": "ex-9-5",
        "title": "Exercise 9.5: Number to String Conversion",
        "description": "Convert the number 12345 to a string using the uint_to_str function provided. Print the string using write syscall. Also implement the function if you haven't used the provided one.",
        "solution": "section .data\n    num dq 12345\n    buffer times 32 db 0\n    newline db 0xA\nsection .text\nglobal _start\n\n; Input: RAX = unsigned 64-bit value; RDI = writable buffer of at least 21 bytes.\n; Output: RAX = length, buffer is null-terminated.\n; Clobbers: RCX, RDX, RSI, RDI, R8, R9 and arithmetic flags. DF is cleared.\n; Preserves RBX, RBP, R12-R15 and restores RSP.\nuint_to_str:\n    sub rsp, 32\n    lea r8, [rsp+32]      ; end of the allocated temporary buffer\n    mov r9, r8\n    mov rcx, 10\n.digit_loop:\n    xor rdx, rdx\n    div rcx\n    add dl, '0'\n    dec r9\n    mov [r9], dl\n    test rax, rax\n    jnz .digit_loop       ; zero still produces one digit\n    mov rax, r8\n    sub rax, r9           ; save returned length independently of RCX\n    mov rcx, rax\n    mov rsi, r9\n    cld\n    rep movsb\n    mov byte [rdi], 0\n    add rsp, 32\n    ret\n_start:\n    mov rax, [num]\n    lea rdi, [buffer]\n    call uint_to_str    ; length in rax\n    ; write string\n    mov rdx, rax        ; length\n    mov rax, 1\n    mov rdi, 1\n    lea rsi, [buffer]\n    syscall\n    ; newline\n    mov rax, 1\n    mov rdi, 1\n    lea rsi, [newline]\n    mov rdx, 1\n    syscall\n    ; exit\n    mov rax, 60\n    xor rdi, rdi\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "Use the uint_to_str function provided in section 9.4.1. Write a program that calls it and prints the string. Complete solution: the corrected function is included above. Expected output is 12345 followed by a newline, with exit status 0."
      }
    ],
    "practiceQuestions": [
      {
        "question": "How do you access the element at index i of an array of dwords? Show the addressing mode.",
        "answer": "Use a four-byte scale: mov eax, [rbx + rcx*4], where RBX holds the array base and RCX holds index i. Validate the index against the array length before accessing memory."
      },
      {
        "question": "What is the role of rsi and rdi in string instructions? How does the direction flag affect them?",
        "answer": "movs and cmps use RSI as the source pointer and RDI as the destination or second comparison pointer. lods uses RSI; stos and scas use RDI. DF=0 advances the pointers; DF=1 moves them backward by the element width."
      },
      {
        "question": "Explain the difference between rep movsb and rep movsq. When would you prefer one over the other?",
        "answer": "rep movsb copies RCX bytes; rep movsq copies RCX qwords, eight bytes each. Account for remainder bytes with qword copies. Which is faster depends on the CPU, alignment, and length; benchmark the intended workload."
      },
      {
        "question": "How does repne scasb work? What is it commonly used for?",
        "answer": "repne scasb compares AL against bytes at RDI, adjusting RDI and decrementing RCX until it finds equality or exhausts the count. With AL=0 and DF clear, it can find a string terminator within an accessible buffer."
      },
      {
        "question": "What is row-major order? How would you compute the address of matrix[i][j] in a 2D array of qwords?",
        "answer": "Row-major storage places each complete row before the next. For qwords, the address is base + (i × columns + j) × 8."
      },
      {
        "question": "Write a short assembly snippet to fill a 64-byte buffer with the value 0xAA using rep stosb.",
        "answer": "lea rdi, [rel buffer]; mov al, 0xAA; mov rcx, 64; cld; rep stosb. The destination must contain at least 64 writable bytes."
      },
      {
        "question": "How do you convert an ASCII digit character to its numeric value? How to convert a numeric value to ASCII?",
        "answer": "After checking that a character is between ASCII zero and nine, subtract ASCII zero to obtain its digit value. Add ASCII zero to a numeric digit from 0 to 9 to obtain its character."
      },
      {
        "question": "Why is the direction flag important? What instructions set or clear it?",
        "answer": "cld clears the Direction Flag (DF=0), ensuring rsi and rdi increment forward through memory. If DF=1, pointers would decrement backward, causing data corruption. std sets DF for backward traversal. Set up pointers for the selected direction and restore DF to clear before returning to code that expects forward operations."
      },
      {
        "question": "What is the difference between repe and repne? Give an example of each.",
        "answer": "repe continues after equal comparisons while the count remains nonzero; repne continues after unequal comparisons. Use repe cmpsb to compare blocks and repne scasb to search for a terminator."
      },
      {
        "question": "In the string length example using repne scasb, why is rcx set to -1? What is the maximum length it can handle?",
        "answer": "Writing −1 to RCX sets the unsigned counter to 2^64−1. That is a theoretical limit of 2^64−1 byte comparisons, allowing at most 2^64−2 non-null bytes if a terminator is included. Actual scans are limited by accessible memory and address-space constraints; pass a known buffer bound when a terminator is not guaranteed."
      }
    ],
    "summary": [
      "Arrays are contiguous memory; access via [base + index*scale] or pointer arithmetic.",
      "2D arrays use row-major layout: offset = (row * columns + column) * element size.",
      "String instructions (movs, stos, lods, cmps, scas) operate with rsi/rdi and rcx.",
      "The direction flag (cld/std) controls pointer direction.",
      "Repeat prefixes (rep, repe, repne) enable compact loops.",
      "rep movsb/stosb/cmpsb are efficient for block operations.",
      "Number conversion requires digit extraction (division by 10) and ASCII addition/subtraction.",
      "Using string instructions can simplify code but may not always be the fastest for small data.",
      "In the next chapter, we’ll dive into procedures, calling conventions, and stack frames—essential for writing modular and reusable assembly code."
    ]
  },
  {
    "id": 10,
    "slug": "chapter-10-procedures-calling-conventions",
    "level": 2,
    "levelTitle": "Core Assembly Programming",
    "title": "Chapter 10: Procedures, Calling Conventions, and the Stack Frame",
    "subtitle": "System V AMD64 ABI, 16-Byte Stack Alignment, and C Function Interoperability",
    "learningObjectives": [
      "Understand the concept of procedures (functions, subroutines) and how they are implemented in assembly.",
      "Master the call and ret instructions and how they manage the return address on the stack.",
      "Comprehend calling conventions, particularly the System V AMD64 ABI used on Linux.",
      "Learn how to pass arguments to procedures using registers and the stack.",
      "Understand the role of the stack frame and how to use a frame pointer (rbp) to access arguments and local variables.",
      "Write procedures with proper prologues and epilogues.",
      "Handle functions with more than six arguments and understand stack alignment requirements.",
      "Apply these concepts to create modular, reusable assembly code."
    ],
    "prerequisites": [
      "Solid understanding of the stack, registers, and addressing modes (Chapters 3 and 6).",
      "Familiarity with control flow, loops, and jumps (Chapter 8).",
      "Basic knowledge of arrays and memory operations (Chapter 9).",
      "Ability to write and assemble simple programs (Chapters 1–5)."
    ],
    "keyConcepts": [
      "Procedure: A named block of code that can be called and returns control to the caller.",
      "call pushes the return address onto the stack and jumps to the procedure; ret pops the return address and jumps back.",
      "Calling convention: A set of rules for how arguments are passed, values returned, and registers preserved.",
      "System V AMD64 ABI: The standard calling convention on 64-bit Linux. First six integer arguments go in rdi, rsi, rdx, rcx, r8, r9; additional arguments are passed on the stack. Return value in rax. Stack must be 16-byte aligned before a call.",
      "Stack frame: A region on the stack reserved for a function call, containing return address, saved registers, arguments, and local variables.",
      "Frame pointer (rbp): Often used to provide stable access to arguments and locals throughout the function.",
      "Prologue and epilogue set up and tear down the stack frame."
    ],
    "diagramType": "procedures_stack",
    "sections": [
      {
        "id": "sec-10-1",
        "title": "10.1 Introduction to Procedures",
        "content": "A procedure (also called a function or subroutine) is a self-contained block of code that performs a specific task. Procedures allow code reuse, modularity, and better organization. In assembly, a procedure is simply a label followed by code that ends with a ret instruction.\n\nWhy use procedures?\n- Avoid code duplication.\n- Simplify complex programs by breaking them into smaller, manageable parts.\n- Enable recursion and modular design.\n- Facilitate debugging and testing.\n\nIn high-level languages, functions are a fundamental construct. In assembly, procedures require explicit management of the stack, arguments, and return values."
      },
      {
        "id": "sec-10-1-1",
        "title": "10.1.1 The call and ret Instructions",
        "content": "The call instruction transfers control to a procedure and saves the return address (the address of the next instruction after call) on the stack. The ret instruction pops the return address from the stack and jumps to it, resuming execution in the caller.\n\nSyntax:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "10.1.1 The call and ret Instructions — listing 1",
            "code": "call procedure_label      ; direct call\ncall rax                  ; indirect call (address in register)\ncall qword [rsp]          ; indirect call (address in memory)\n\nret                       ; return to caller\nret imm16                 ; return and pop imm16 bytes from stack (used for some calling conventions)"
          }
        ]
      },
      {
        "id": "sec-10-1-2",
        "title": "10.1.2 How call Works",
        "content": "1. Push the 64-bit value of RIP (the address of the next instruction) onto the stack. This decrements RSP by 8 and stores the return address.\n2. Load RIP with the target address (procedure label or address in register/memory).\n3. Execution continues at the procedure."
      },
      {
        "id": "sec-10-1-3",
        "title": "10.1.3 How ret Works",
        "content": "1. Pop the top 8 bytes from the stack into RIP. This increments RSP by 8.\n2. Execution resumes at the instruction following the original call.\n\nImportant: The stack must be properly balanced. If a procedure leaves extra values on the stack, ret will pop the wrong value as the return address, causing a crash."
      },
      {
        "id": "sec-10-2",
        "title": "10.2 Basic Procedure Structure",
        "content": "A procedure typically has three parts:\n\n1. Prologue: Save the caller’s base pointer (if using a frame pointer), set up the frame pointer, and allocate space for local variables.\n2. Body: The actual code of the procedure, accessing arguments and locals as needed.\n3. Epilogue: Restore the stack pointer and base pointer, and return."
      },
      {
        "id": "sec-10-2-1",
        "title": "10.2.1 Example: A Simple Procedure",
        "content": "Let’s write a procedure that adds two integers and returns the sum.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "add_two.asm",
            "code": "; add_two.asm\nsection .text\n    global _start\n\n; Procedure: add\n; Inputs: rdi = first integer, rsi = second integer\n; Output: rax = sum\nadd:\n    mov rax, rdi\n    add rax, rsi\n    ret\n\n_start:\n    mov rdi, 5\n    mov rsi, 10\n    call add           ; rax = 15\n\n    ; Exit with sum as exit code (low byte)\n    mov rdi, rax\n    mov rax, 60        ; sys_exit\n    syscall",
            "explanation": "Explanation:\n- add does not use any local variables, so no prologue/epilogue beyond ret is needed.\n- Arguments are passed in rdi and rsi according to the System V AMD64 ABI.\n- The result is returned in rax.\n- The caller sets up arguments, calls the procedure, and then uses the result."
          }
        ]
      },
      {
        "id": "sec-10-2-2",
        "title": "10.2.2 Saving and Restoring Registers",
        "content": "If a procedure modifies callee-saved registers (rbx, rbp, r12–r15), it must preserve their original values. Typically, they are pushed on the stack in the prologue and popped in the epilogue.\n\nClarification: The source note reverses the usual push-count rule. At ABI function entry RSP is 8 modulo 16; one 8-byte push aligns it, while two pushes leave it 8 modulo 16. Include all local allocations and saved registers when calculating alignment before nested calls. A leaf procedure need not adjust RSP just to return.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "10.2.2 Saving and Restoring Registers — listing 1",
            "code": "my_proc:\n    push rbx            ; save rbx\n    push r12            ; save r12\n    ; ... use rbx and r12 ...\n    pop r12\n    pop rbx\n    ret",
            "explanation": "Note: rsp must be kept aligned. If you push an odd number of registers, adjust rsp accordingly (e.g., by subtracting an extra 8 bytes) before any call inside the procedure."
          }
        ]
      },
      {
        "id": "sec-10-3",
        "title": "10.3 Calling Conventions",
        "content": "A calling convention defines:\n- How arguments are passed (registers and/or stack).\n- How return values are delivered.\n- Which registers the caller must save (caller-saved) and which the callee must preserve (callee-saved).\n- Stack alignment and cleanup responsibilities."
      },
      {
        "id": "sec-10-3-1",
        "title": "10.3.1 System V AMD64 ABI (Linux)",
        "content": "For 64-bit Linux, the calling convention is the System V AMD64 ABI.\n\nArgument passing:\n- First six integer/pointer arguments are passed in registers, in order: rdi, rsi, rdx, rcx, r8, r9.\n- Additional arguments are passed on the stack, pushed in reverse order (so the 7th argument is at the lowest address of the stack arguments).\n- Floating-point arguments use xmm0–xmm7 (covered in Chapter 14).\n\nReturn value:\n- Integer/pointer return value in rax (and rdx if 128-bit).\n- Floating-point return in xmm0.\n\nStack alignment:\n- The stack pointer (rsp) must be 16-byte aligned before a call instruction is executed.\n- At function entry, rsp is 8 mod 16 (because the return address was pushed). Therefore, to maintain alignment for any subsequent calls, the callee often subtracts a multiple of 16 plus 8 from rsp in its prologue (if it uses a frame pointer) or ensures that after prologue, rsp is aligned properly.\n\nRegisters:\n- Caller-saved: rax, rcx, rdx, rsi, rdi, r8–r11. The caller must save these if it needs them after the call.\n- Callee-saved: rbx, rbp, r12–r15. The callee must preserve these (save and restore if modified).\n\nStack cleanup: The caller is responsible for removing stack arguments (if any) after the call. The callee does not clean up stack arguments unless the convention specifies otherwise (e.g., stdcall on Windows).\n\nClarification: For the scalar examples here, entry RSP is 8 modulo 16. After push rbp, allocate a multiple of 16 for aligned nested calls, not a multiple of 16 plus 8. Linux ELF process entry at _start has RSP aligned to 16; _start was not entered through call. The register rules above describe common scalar types; aggregates and vector types have additional ABI rules. stdcall is a historical 32-bit convention, not the Windows x64 convention."
      },
      {
        "id": "sec-10-3-2",
        "title": "10.3.2 Example: Passing Six Arguments",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "10.3.2 Example: Passing Six Arguments — listing 1",
            "code": "section .text\n    global _start\n\n; sum_six: add six integers\n; Inputs: rdi, rsi, rdx, rcx, r8, r9\n; Output: rax = sum\nsum_six:\n    add rdi, rsi\n    add rdi, rdx\n    add rdi, rcx\n    add rdi, r8\n    add rdi, r9\n    mov rax, rdi\n    ret\n\n_start:\n    mov rdi, 1\n    mov rsi, 2\n    mov rdx, 3\n    mov rcx, 4\n    mov r8, 5\n    mov r9, 6\n    call sum_six       ; rax = 21\n    mov rdi, rax\n    mov rax, 60\n    syscall"
          }
        ]
      },
      {
        "id": "sec-10-3-3",
        "title": "10.3.3 Passing More Than Six Arguments",
        "content": "The 7th and subsequent arguments are placed on the stack. The caller pushes them in reverse order before the call, and the caller also cleans up the stack after the call (by adding to rsp).\n\nExample: Pass seven arguments (1..7) and sum them.\n\nClarification: The original caller violates call-site alignment. Reserve padding before pushing the seventh argument; remove both the padding and argument afterward. The corrected program below exits with 28.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original source: seven arguments (misaligned call)",
            "code": "section .text\n    global _start\n\n; sum_seven: rdi..r9 = first six, 7th argument on stack\n; Stack layout at entry:\n;   [rsp]      = return address\n;   [rsp+8]    = 7th argument (because caller pushed it before call)\nsum_seven:\n    add rdi, rsi\n    add rdi, rdx\n    add rdi, rcx\n    add rdi, r8\n    add rdi, r9\n    mov rax, [rsp+8]    ; load 7th argument\n    add rdi, rax\n    mov rax, rdi\n    ret\n\n_start:\n    ; Prepare arguments\n    mov rdi, 1\n    mov rsi, 2\n    mov rdx, 3\n    mov rcx, 4\n    mov r8, 5\n    mov r9, 6\n    push 7              ; push 7th argument (value 7, as 64-bit)\n    call sum_seven      ; sum = 28\n    add rsp, 8          ; clean up stack (remove pushed argument)\n    mov rdi, rax\n    mov rax, 60\n    syscall",
            "explanation": "Note: The stack must be 16-byte aligned before the call. In the above, before push 7, rsp is aligned (maybe), pushing 7 makes it misaligned by 8, but the call will push return address, making it aligned again? Actually, the ABI requires alignment before the call itself. The caller must ensure that rsp is 16-byte aligned at the point of the call instruction. If we push an argument, we must account for that. In typical code, the caller may use sub rsp, 8 before pushing or ensure that after pushing arguments, rsp is 16-byte aligned. In this simple example, we ignore alignment for brevity, but in real code you must manage it carefully. We'll discuss later."
          },
          {
            "language": "nasm",
            "title": "Corrected runnable seven-argument call",
            "code": "section .text\n    global _start\n\n; sum_seven: rdi..r9 = first six, 7th argument on stack\n; Stack layout at entry:\n;   [rsp]      = return address\n;   [rsp+8]    = 7th argument (because caller pushed it before call)\nsum_seven:\n    add rdi, rsi\n    add rdi, rdx\n    add rdi, rcx\n    add rdi, r8\n    add rdi, r9\n    mov rax, [rsp+8]    ; load 7th argument\n    add rdi, rax\n    mov rax, rdi\n    ret\n\n_start:\n    ; Prepare arguments\n    mov rdi, 1\n    mov rsi, 2\n    mov rdx, 3\n    mov rcx, 4\n    mov r8, 5\n    mov r9, 6\n    sub rsp, 8          ; padding before stack arguments\n    push 7              ; push 7th argument (value 7, as 64-bit)\n    call sum_seven      ; sum = 28\n    add rsp, 16          ; clean up stack (remove pushed argument)\n    mov rdi, rax\n    mov rax, 60\n    syscall",
            "explanation": "At callee entry the seventh argument remains at [rsp+8]. The caller removes 16 bytes after return."
          }
        ]
      },
      {
        "id": "sec-10-3-4",
        "title": "10.3.4 Stack Alignment Details",
        "content": "The System V ABI requires that the stack pointer be aligned to 16 bytes immediately before the call instruction. This means that when the callee begins, rsp is 8 mod 16 (because the return address was pushed). To maintain alignment for any nested calls, the callee's prologue often does:\n\n- push rbp (makes rsp 0 mod 16 if it was 8 mod 16 before the push)\n- mov rbp, rsp\n- sub rsp, N where N is a multiple of 16 (or multiple of 16 + 8 to account for local variables? Actually, after push rbp, rsp is aligned to 16. Then subtracting a multiple of 16 keeps alignment for calls inside the function.)\n\nIf the function does not use a frame pointer, it might do:\n- sub rsp, 8 to realign, then sub rsp, N for locals.\n\nExample with frame pointer:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "10.3.4 Stack Alignment Details — listing 1",
            "code": "my_func:\n    push rbp          ; rsp becomes 0 mod 16 (if it was 8 mod 16 before)\n    mov rbp, rsp      ; rbp now points to saved rbp; rsp aligned\n    sub rsp, 16       ; allocate 16 bytes for locals; rsp still 16-aligned\n    ; ... calls inside are now aligned\n    mov rsp, rbp      ; deallocate\n    pop rbp\n    ret",
            "explanation": "If the function needs an odd number of pushes or wants to allocate an odd amount, it should adjust to keep alignment."
          }
        ]
      },
      {
        "id": "sec-10-4",
        "title": "10.4 Stack Frame and Frame Pointer",
        "content": "A stack frame is the collection of all data pushed onto the stack for a single function invocation: return address, saved registers, arguments (beyond the first six), and local variables. Using a frame pointer (rbp) provides a fixed reference point for accessing these items, even if the stack pointer changes during the function (e.g., due to pushes/pops for temporary storage)."
      },
      {
        "id": "sec-10-4-1",
        "title": "10.4.1 Standard Prologue and Epilogue (with Frame Pointer)",
        "content": "Prologue:\n\nClarification: mov rsp, rbp discards stack storage but does not restore registers saved there. Reload or pop any modified callee-saved registers before discarding their slots. The simple epilogue shown is sufficient only when no other registers need restoration.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "10.4.1 Standard Prologue and Epilogue (with Frame Pointer) — listing 1",
            "code": "push rbp          ; save caller's base pointer\nmov rbp, rsp      ; set current base pointer\nsub rsp, N        ; allocate N bytes for local variables",
            "explanation": "After this, the stack layout (from high to low address) is:"
          },
          {
            "language": "text",
            "title": "10.4.1 Standard Prologue and Epilogue (with Frame Pointer) — listing 2",
            "code": "[Higher addresses]\n...\nReturn Address            (at rbp+8)\nSaved RBP                 (at rbp, also rsp after push rbp)\nLocal variables           (below rbp, accessed as [rbp - offset])\nSaved registers (if any)  (below locals, if pushed)\n...\n[Lower addresses, rsp points to lowest allocated address]",
            "explanation": "Epilogue:"
          },
          {
            "language": "nasm",
            "title": "10.4.1 Standard Prologue and Epilogue (with Frame Pointer) — listing 3",
            "code": "mov rsp, rbp      ; deallocate locals and any other pushes (restore rsp to rbp)\npop rbp           ; restore caller's base pointer\nret",
            "explanation": "The leave instruction is equivalent to mov rsp, rbp followed by pop rbp, and is often used as a single-instruction epilogue."
          }
        ]
      },
      {
        "id": "sec-10-4-2",
        "title": "10.4.2 Accessing Arguments and Locals with rbp",
        "content": "- Arguments passed on the stack (7th and beyond) are at positive offsets from rbp: [rbp+16], [rbp+24], etc. (The first stack argument is at rbp+16 because: rbp points to saved rbp, rbp+8 is return address, rbp+16 is the first stack argument.)\n- Local variables are at negative offsets: [rbp-8], [rbp-16], etc.\n\nExample: Function that uses local variables and a stack argument.\n\nClarification: The abbreviated caller does not specify its incoming alignment. From an aligned call site, reserve 8 padding bytes before push 7 and clean up 16 bytes afterward.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "sum_with_locals: sum first six args (registers) and a 7th stack arg, using locals.",
            "code": "; sum_with_locals: sum first six args (registers) and a 7th stack arg, using locals.\n; Inputs: rdi..r9, 7th argument on stack at [rbp+16] after prologue.\nsum_with_locals:\n    push rbp\n    mov rbp, rsp\n    sub rsp, 16          ; allocate 16 bytes for two qword locals\n\n    ; Save callee-saved registers if needed (not used here)\n    ; Store sum of first six in local1 at [rbp-8]\n    mov rax, rdi\n    add rax, rsi\n    add rax, rdx\n    add rax, rcx\n    add rax, r8\n    add rax, r9\n    mov [rbp-8], rax      ; local1 = sum of first six\n\n    ; Load 7th argument from [rbp+16]\n    mov rax, [rbp+16]\n    add rax, [rbp-8]      ; total sum\n    ; store in local2\n    mov [rbp-16], rax\n\n    ; Return sum in rax\n    mov rax, [rbp-16]\n\n    mov rsp, rbp\n    pop rbp\n    ret",
            "explanation": "In the caller:"
          },
          {
            "language": "nasm",
            "title": "10.4.2 Accessing Arguments and Locals with rbp — listing 2",
            "code": "    ; set rdi..r9, then push 7\n    push 7\n    call sum_with_locals\n    add rsp, 8"
          },
          {
            "language": "nasm",
            "title": "Aligned caller with seven arguments",
            "code": "; Assume RSP is 16-byte aligned here.\n    mov edi, 1\n    mov esi, 2\n    mov edx, 3\n    mov ecx, 4\n    mov r8d, 5\n    mov r9d, 6\n    sub rsp, 8\n    push 7\n    call sum_with_locals\n    add rsp, 16",
            "explanation": "Returns 28 in RAX. Padding is above the argument, so [rbp+16] remains correct."
          }
        ]
      },
      {
        "id": "sec-10-4-3",
        "title": "10.4.3 Using rsp Instead of rbp (Frame Pointer Omission)",
        "content": "In optimized code, the frame pointer may be omitted to free up rbp for general use. The compiler then uses rsp as the base for all local and argument accesses, adjusting offsets as needed. This is more complex but can improve performance.\n\nExample (simple, no pushes/pops after prologue):\n\nClarification: After sub rsp, 24 the return address is [rsp+24], and argument 7 is [rsp+32]. The earlier question in the source comment is superseded by those offsets. If RBP is used as a general register, preserve it because it is still callee-saved.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "10.4.3 Using rsp Instead of rbp (Frame Pointer Omission) — listing 1",
            "code": "my_func:\n    sub rsp, 24          ; allocate 24 bytes for locals\n    ; access locals at [rsp], [rsp+8], [rsp+16]\n    ; arguments from stack: after prologue, return address at [rsp+24+8]? \n    ; Actually, at entry: [rsp] = return address.\n    ; After sub rsp,24, return address is at [rsp+24], 7th arg at [rsp+32], etc.\n    ; ...\n    add rsp, 24\n    ret",
            "explanation": "This requires careful bookkeeping if the function pushes/pops or calls other functions."
          }
        ]
      },
      {
        "id": "sec-10-5",
        "title": "10.5 Calling C Functions from Assembly and Vice Versa",
        "content": "We can integrate assembly with C by following the same ABI. A C function compiled with gcc expects arguments in registers and returns in rax. An assembly function can be called from C if it is declared global and uses the correct calling convention.\n\nExample: Assembly function called from C.\n\nfunc.asm:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "10.5 Calling C Functions from Assembly and Vice Versa — listing 1",
            "code": "section .text\n    global add_numbers\n\n; int add_numbers(int a, int b)\nadd_numbers:\n    mov eax, edi      ; 32-bit arguments in edi, esi\n    add eax, esi\n    ret",
            "explanation": "main.c:"
          },
          {
            "language": "c",
            "title": "10.5 Calling C Functions from Assembly and Vice Versa — listing 2",
            "code": "#include <stdio.h>\nextern int add_numbers(int a, int b);\nint main() {\n    int result = add_numbers(5, 7);\n    printf(\"Result: %d\\n\", result);\n    return 0;\n}",
            "explanation": "Build:"
          },
          {
            "language": "bash",
            "title": "10.5 Calling C Functions from Assembly and Vice Versa — listing 3",
            "code": "nasm -f elf64 func.asm -o func.o\ngcc -c main.c -o main.o\ngcc main.o func.o -o program\n./program",
            "explanation": "Calling a C function from assembly: declare extern printf (or other libc functions) and link with gcc. But note that calling variadic functions like printf requires special handling of vector registers (al must be set to the number of vector registers used). We'll cover that in later chapters."
          }
        ]
      },
      {
        "id": "sec-10-6",
        "title": "10.6 Recursion and the Stack Frame",
        "content": "Recursion is a natural application of procedures; each recursive call creates a new stack frame, preserving the previous call’s state. We'll explore recursion in depth in Chapter 11, but a simple factorial example illustrates the concept.\n\nFactorial (recursive):\n\nClarification: With an aligned caller, factorial enters at RSP modulo 16 = 8; push rdi makes it zero before recursion. pop rdi restores the entry stack position. Use nonnegative n; 0! and 1! are 1. The 64-bit result overflows above 20!, and large inputs can exhaust the stack.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "factorial: n in rdi, returns n! in rax",
            "code": "; factorial: n in rdi, returns n! in rax\nfactorial:\n    cmp rdi, 1\n    jg  .recurse\n    mov rax, 1          ; base case\n    ret\n.recurse:\n    push rdi            ; save n\n    dec rdi\n    call factorial      ; rax = (n-1)!\n    pop rdi             ; restore n\n    imul rax, rdi       ; rax = n * (n-1)!\n    ret",
            "explanation": "Note: This uses push rdi and pop rdi, which modifies rsp. Because rsp must be 16-byte aligned before any call, and we push one register (8 bytes), the alignment is preserved if it was aligned before the call. In a recursive function, after the prologue, we need to ensure alignment. This example works if the caller ensures alignment, but it's a bit tricky. We'll refine in Chapter 11."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 10.5 (broken draft)",
            "code": "section .text\nglobal _start\n\nfib:\n    cmp rdi, 0\n    je  .zero\n    cmp rdi, 1\n    je  .one\n    ; fib(n) = fib(n-1) + fib(n-2)\n    push rdi\n    dec rdi\n    call fib            ; rax = fib(n-1)\n    push rax            ; save fib(n-1)\n    pop rdi             ; restore n? Oops, need original n for n-2\n    ; We'll do properly:\n    ; Actually, we need to preserve n and the result of fib(n-1).\n    ; Let's redo carefully.\n    ; We'll use a cleaner approach with frame pointer and locals.\n    push rbp\n    mov rbp, rsp\n    sub rsp, 16\n    ; Save n in local\n    mov [rbp-8], rdi\n    ; Compute fib(n-1)\n    dec rdi\n    call fib\n    mov [rbp-16], rax   ; save fib(n-1)\n    ; Compute fib(n-2) using original n\n    mov rdi, [rbp-8]\n    sub rdi, 2\n    call fib\n    ; rax = fib(n-2)\n    add rax, [rbp-16]   ; add fib(n-1)\n    mov rsp, rbp\n    pop rbp\n    ret\n.zero:\n    xor rax, rax\n    ret\n.one:\n    mov rax, 1\n    ret\n\n_start:\n    mov rdi, 10\n    call fib            ; rax = 55\n    mov rdi, rax\n    mov rax, 60\n    syscall",
            "explanation": "Do not run this draft: the preliminary recursion overwrites n, leaves a push unbalanced, and can recurse with negative arguments. Use the complete corrected exercise solution."
          }
        ]
      },
      {
        "id": "sec-10-7",
        "title": "10.7 Practical Example: A Complete Program with Procedures",
        "content": "Let's write a program that defines a procedure to compute the sum of an array of integers, and another to print a number as a string. We'll combine them.\n\nWe'll use the uint_to_str function from Chapter 9 to print the sum.\n\nClarification: The original conversion routine overwrites callee-saved RBX and writes below its allocated stack area. The corrected complete program uses the repaired Chapter 9 converter, keeps temporary digits inside its allocation, and prints 150 followed by a newline. Its converter takes RAX by a documented internal convention, not the normal first System V argument register.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original source: sum_array_print.asm (converter defects)",
            "code": "; sum_array_print.asm\nsection .data\n    array dq 10, 20, 30, 40, 50\n    len equ 5\n    newline db 0xA\nsection .bss\n    buffer resb 32\n\nsection .text\n    global _start\n\n; sum_array: sum qword array\n; Inputs: rdi = pointer to array, rsi = number of elements\n; Output: rax = sum\nsum_array:\n    xor rax, rax\n    mov rcx, rsi\n.loop:\n    test rcx, rcx\n    jz .done\n    add rax, [rdi]\n    add rdi, 8\n    dec rcx\n    jmp .loop\n.done:\n    ret\n\n; uint_to_str: convert unsigned integer in rax to string at rdi, returns length in rax\nuint_to_str:\n    ; ... (implementation as in Chapter 9)\n    ; We'll include a simplified version here\n    sub rsp, 40\n    mov rbx, rsp\n    mov rcx, 10\n    xor rdx, rdx\n    mov r9, rdi\n    test rax, rax\n    jnz .convert\n    mov byte [rdi], '0'\n    mov byte [rdi+1], 0\n    add rsp, 40\n    mov rax, 1\n    ret\n.convert:\n    mov rsi, rbx\n.digit_loop:\n    xor rdx, rdx\n    div rcx\n    add dl, '0'\n    dec rbx\n    mov [rbx], dl\n    test rax, rax\n    jnz .digit_loop\n    mov rcx, rsi\n    sub rcx, rbx\n    mov r8, rcx\n    mov rsi, rbx\n    mov rdi, r9\n.copy_loop:\n    mov al, [rsi]\n    mov [rdi], al\n    inc rsi\n    inc rdi\n    dec rcx\n    jnz .copy_loop\n    mov byte [rdi], 0\n    mov rax, r8\n    add rsp, 40\n    ret\n\n_start:\n    lea rdi, [array]\n    mov rsi, len\n    call sum_array      ; rax = 150\n\n    lea rdi, [buffer]\n    call uint_to_str    ; convert sum to string, length in rax\n\n    ; print string\n    mov rdx, rax\n    mov rax, 1\n    mov rdi, 1\n    lea rsi, [buffer]\n    syscall\n\n    ; print newline\n    mov rax, 1\n    mov rdi, 1\n    lea rsi, [newline]\n    mov rdx, 1\n    syscall\n\n    ; exit\n    mov rax, 60\n    xor rdi, rdi\n    syscall",
            "explanation": "This program demonstrates calling multiple procedures and passing arguments/return values."
          },
          {
            "language": "nasm",
            "title": "Corrected runnable sum_array_print.asm",
            "code": "; sum_array_print.asm\nsection .data\n    array dq 10, 20, 30, 40, 50\n    len equ 5\n    newline db 0xA\nsection .bss\n    buffer resb 32\n\nsection .text\n    global _start\n\n; sum_array: sum qword array\n; Inputs: rdi = pointer to array, rsi = number of elements\n; Output: rax = sum\nsum_array:\n    xor rax, rax\n    mov rcx, rsi\n.loop:\n    test rcx, rcx\n    jz .done\n    add rax, [rdi]\n    add rdi, 8\n    dec rcx\n    jmp .loop\n.done:\n    ret\n\n; Input: RAX = unsigned 64-bit value; RDI = writable buffer of at least 21 bytes.\n; Output: RAX = length, buffer is null-terminated.\n; Clobbers: RCX, RDX, RSI, RDI, R8, R9 and arithmetic flags. DF is cleared.\n; Preserves RBX, RBP, R12-R15 and restores RSP.\nuint_to_str:\n    sub rsp, 32\n    lea r8, [rsp+32]      ; end of the allocated temporary buffer\n    mov r9, r8\n    mov rcx, 10\n.digit_loop:\n    xor rdx, rdx\n    div rcx\n    add dl, '0'\n    dec r9\n    mov [r9], dl\n    test rax, rax\n    jnz .digit_loop       ; zero still produces one digit\n    mov rax, r8\n    sub rax, r9           ; save returned length independently of RCX\n    mov rcx, rax\n    mov rsi, r9\n    cld\n    rep movsb\n    mov byte [rdi], 0\n    add rsp, 32\n    ret\n\n_start:\n    lea rdi, [array]\n    mov rsi, len\n    call sum_array      ; rax = 150\n\n    lea rdi, [buffer]\n    call uint_to_str    ; convert sum to string, length in rax\n\n    ; print string\n    mov rdx, rax\n    mov rax, 1\n    mov rdi, 1\n    lea rsi, [buffer]\n    syscall\n\n    ; print newline\n    mov rax, 1\n    mov rdi, 1\n    lea rsi, [newline]\n    mov rdx, 1\n    syscall\n\n    ; exit\n    mov rax, 60\n    xor rdi, rdi\n    syscall",
            "explanation": "Expected output: 150 followed by a newline. The converter also supports zero and the maximum unsigned 64-bit value; provide at least 21 writable destination bytes."
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-10-1",
        "title": "Exercise 10.1: Simple Procedure",
        "description": "Write a procedure square that takes an integer in rdi and returns its square in rax. Call it and exit with the result.",
        "solution": "section .text\nglobal _start\n\nsquare:\n    mov rax, rdi\n    imul rax, rdi\n    ret\n\n_start:\n    mov rdi, 9\n    call square       ; rax = 81\n    mov rdi, rax\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "\n\nExpected exit code: 81. imul keeps the low 64 bits; choose inputs whose square fits when overflow is not intended."
      },
      {
        "id": "ex-10-2",
        "title": "Exercise 10.2: Max of Three",
        "description": "Write a procedure max_of_three that takes three integers in rdi, rsi, rdx and returns the maximum in rax. Use conditional moves or jumps. Test with different values.",
        "solution": "section .text\nglobal _start\n\nmax_of_three:\n    mov rax, rdi\n    cmp rsi, rax\n    cmovg rax, rsi\n    cmp rdx, rax\n    cmovg rax, rdx\n    ret\n\n_start:\n    mov rdi, 10\n    mov rsi, 25\n    mov rdx, 15\n    call max_of_three ; rax = 25\n    mov rdi, rax\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "\n\nExpected exit code: 25. cmovg uses signed comparison; test negative values and ties as well."
      },
      {
        "id": "ex-10-3",
        "title": "Exercise 10.3: Procedure with Local Variables",
        "description": "Write a procedure that computes the sum of two integers using local variables on the stack (store the arguments in locals, then add). Use frame pointer. Return sum in rax. Call and exit.",
        "solution": "section .text\nglobal _start\n\nsum_locals:\n    push rbp\n    mov rbp, rsp\n    sub rsp, 16          ; two locals\n    mov [rbp-8], rdi     ; local1 = first arg\n    mov [rbp-16], rsi    ; local2 = second arg\n    mov rax, [rbp-8]\n    add rax, [rbp-16]\n    mov rsp, rbp\n    pop rbp\n    ret\n\n_start:\n    mov rdi, 12\n    mov rsi, 34\n    call sum_locals    ; rax = 46\n    mov rdi, rax\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "\n\nExpected exit code: 46. Two 8-byte locals fit in the 16-byte allocation; the epilogue restores RBP and RSP."
      },
      {
        "id": "ex-10-4",
        "title": "Exercise 10.4: Passing Stack Arguments",
        "description": "Write a procedure sum_eight that takes eight integer arguments: first six in registers, and the last two on the stack. Return the sum. In _start, push the 8th and 7th arguments appropriately, call, clean up stack, exit with sum.",
        "solution": "section .text\nglobal _start\n\nsum_eight:\n    ; first six in rdi..r9, 7th at [rsp+8], 8th at [rsp+16]\n    add rdi, rsi\n    add rdi, rdx\n    add rdi, rcx\n    add rdi, r8\n    add rdi, r9\n    mov rax, [rsp+8]\n    add rdi, rax\n    mov rax, [rsp+16]\n    add rdi, rax\n    mov rax, rdi\n    ret\n\n_start:\n    mov rdi, 1\n    mov rsi, 2\n    mov rdx, 3\n    mov rcx, 4\n    mov r8, 5\n    mov r9, 6\n    push 8              ; 8th argument\n    push 7              ; 7th argument\n    call sum_eight      ; sum = 36\n    add rsp, 16         ; clean up two pushes\n    mov rdi, rax\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "Note: We pushed 8 then 7, so 7 is at lower address, matching [rsp+8] after call (because return address is at [rsp]). Alignment might be off, but for this example it doesn't matter.\n\nExpected exit code: 36. At Linux _start, RSP is 16-byte aligned. Two pushes preserve call-site alignment, so the original note suggesting misalignment does not apply here. The caller removes exactly 16 bytes."
      },
      {
        "id": "ex-10-5",
        "title": "Exercise 10.5: Recursive Fibonacci",
        "description": "Implement a recursive Fibonacci function. fib(n) for n in rdi, returns fib(n) in rax. Use recursion. (Base cases: n=0 -> 0, n=1 -> 1). Call with n=10 and exit with result (should be 55, low byte).",
        "solution": "section .text\nglobal _start\n\nfib:\n    cmp rdi, 0\n    je  .zero\n    cmp rdi, 1\n    je  .one\n    push rbp\n    mov rbp, rsp\n    sub rsp, 16\n    ; Save n in local\n    mov [rbp-8], rdi\n    ; Compute fib(n-1)\n    dec rdi\n    call fib\n    mov [rbp-16], rax   ; save fib(n-1)\n    ; Compute fib(n-2) using original n\n    mov rdi, [rbp-8]\n    sub rdi, 2\n    call fib\n    ; rax = fib(n-2)\n    add rax, [rbp-16]   ; add fib(n-1)\n    mov rsp, rbp\n    pop rbp\n    ret\n.zero:\n    xor rax, rax\n    ret\n.one:\n    mov rax, 1\n    ret\n\n_start:\n    mov rdi, 10\n    call fib            ; rax = 55\n    mov rdi, rax\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "This solution uses a proper frame pointer to store the original n and the intermediate result. Correction: removed the abandoned preliminary call/push/pop sequence. The frame now saves the actual n and fib(n-1), restores RBP/RSP, and aligns both recursive calls. For nonnegative n only; n=10 returns 55. This naive algorithm takes exponential time; use small inputs. Unsigned 64-bit Fibonacci overflows above n=93."
      }
    ],
    "practiceQuestions": [
      {
        "question": "What happens to the stack when call is executed? What about ret?",
        "answer": "call decrements RSP by 8, stores the next instruction address, and transfers control. ret reads that address and advances RSP by 8. Balance every allocation and saved value before returning."
      },
      {
        "question": "According to the System V AMD64 ABI, which registers are used for the first six integer arguments? Where are additional arguments passed?",
        "answer": "Integer/pointer arguments 1–6 use RDI, RSI, RDX, RCX, R8, R9. Further qword arguments use the stack: at entry, argument 7 is [rsp+8] and argument 8 is [rsp+16]. Other types follow ABI classification rules."
      },
      {
        "question": "What is the purpose of a frame pointer? How do you set it up?",
        "answer": "RBP provides a stable reference while RSP changes. Use push rbp; mov rbp, rsp; sub rsp, 16 for two qword locals. Restore with leave; ret. RBP itself is callee-saved."
      },
      {
        "question": "Why must the stack be 16-byte aligned before a call? How do you ensure alignment in a function?",
        "answer": "The ABI lets callees rely on aligned stack storage. For these scalar examples, RSP must be 0 modulo 16 immediately before call and is 8 modulo 16 at callee entry. push rbp aligns it; allocating a multiple of 16 preserves alignment. Count all additional pushes and allocations."
      },
      {
        "question": "Explain the difference between caller-saved and callee-saved registers. List them.",
        "answer": "Caller-saved registers may be overwritten: RAX, RCX, RDX, RSI, RDI, R8–R11. Save live values before calling. Callee-saved RBX, RBP, R12–R15 must be restored by any callee that modifies them; RSP must also be restored."
      },
      {
        "question": "How do you pass a 7th argument to a function? Show the stack layout after the call.",
        "answer": "From aligned RSP: sub rsp, 8; push 7; call foo; add rsp, 16. At foo entry: [rsp] return address, [rsp+8] argument 7, [rsp+16] padding. Allocate padding before placing arguments so it does not change the argument offsets."
      },
      {
        "question": "What does leave do? How is it different from mov rsp, rbp; pop rbp?",
        "answer": "With a standard 64-bit frame, leave performs mov rsp, rbp followed by pop rbp. It does not return; follow it with ret. Restore any other saved registers before discarding their slots."
      },
      {
        "question": "How does recursion work in assembly? Why is the stack frame important?",
        "answer": "Each call saves a return address, and each invocation needs its own saved arguments and intermediate results. Locals preserve values across recursive calls that overwrite caller-saved registers. A reachable base case and balanced, aligned frames are essential."
      },
      {
        "question": "Can a procedure modify rax freely? What about rbx? Explain.",
        "answer": "RAX is caller-saved and normally holds the integer return value, so a procedure may overwrite it. RBX is callee-saved: preserve and restore its incoming value if used."
      },
      {
        "question": "Write a short snippet to call a function foo with three arguments: 10, 20, 30, and then exit. Assume foo is defined elsewhere.",
        "answer": "For a Linux ELF _start with its initial aligned stack:\nextern foo\nsection .text\nglobal _start\n_start:\n    mov edi, 10\n    mov esi, 20\n    mov edx, 30\n    call foo\n    mov rdi, rax\n    mov eax, 60\n    syscall\nLink with an object defining foo. This exits with the low byte of its result."
      }
    ],
    "summary": [
      "Procedures are called with call and return with ret.",
      "The call instruction pushes the return address; ret pops it.",
      "The System V AMD64 ABI specifies argument passing (registers rdi, rsi, rdx, rcx, r8, r9 for first six) and return value in rax.",
      "Additional arguments are passed on the stack; caller cleans up.",
      "The stack must be 16-byte aligned before call.",
      "A stack frame provides stable access to arguments and locals via rbp.",
      "Prologue: push rbp; mov rbp, rsp; sub rsp, N. Epilogue: mov rsp, rbp; pop rbp; ret (or leave; ret).",
      "Callee-saved registers must be preserved.",
      "Procedures enable modularity, recursion, and integration with high-level languages.",
      "In the next chapter, we’ll explore recursion and local variables in more depth, including optimization and stack management."
    ]
  },
  {
    "id": 11,
    "slug": "chapter-11-recursion-local-variables",
    "level": 2,
    "levelTitle": "Core Assembly Programming",
    "title": "Chapter 11: Recursion and Local Variables",
    "subtitle": "Activation Records, Stack Unwinding, Tail Recursion, and Binary Search",
    "learningObjectives": [
      "Understand how recursion is implemented in assembly using the stack.",
      "Master the use of stack frames to manage local variables and preserve state across recursive calls.",
      "Write recursive procedures for classic problems (factorial, Fibonacci, etc.).",
      "Distinguish between recursion and iteration, and understand performance implications.",
      "Learn about tail recursion and how it can be optimized.",
      "Handle recursion depth and stack overflow risks.",
      "Apply recursion to solve problems that are naturally recursive (e.g., tree traversal, divide-and-conquer)."
    ],
    "prerequisites": [
      "Solid understanding of procedures, calling conventions, and stack frames (Chapter 10).",
      "Familiarity with the stack, registers, and addressing modes (Chapters 3 and 6).",
      "Knowledge of control flow and loops (Chapter 8).",
      "Basic arithmetic and logical instructions (Chapter 7)."
    ],
    "keyConcepts": [
      "Recursion: A procedure calls itself, either directly or indirectly.",
      "Each recursive call creates a new stack frame containing its own return address, saved registers, arguments, and local variables.",
      "Local variables are allocated on the stack and accessed via the frame pointer (rbp) or stack pointer (rsp).",
      "Base case terminates recursion; without it, stack overflow occurs.",
      "Tail recursion is a special case where the recursive call is the last operation; it can be optimized into iteration by some compilers, but manual assembly can implement it iteratively.",
      "Stack depth is limited by available stack memory; deep recursion may cause segmentation fault."
    ],
    "diagramType": "recursion_locals",
    "sections": [
      {
        "id": "sec-11-1",
        "title": "11.1 Review of Stack Frames and Local Variables",
        "content": "In Chapter 10, we introduced the stack frame as a mechanism to store return addresses, arguments, saved registers, and local variables. A typical function prologue with a frame pointer looks like:\n\nClarification: The prologue is a template: replace N with the required allocation. After push rbp, a multiple of 16 preserves alignment before nested calls. Restore any other modified callee-saved registers before discarding their stack slots. Frames do not automatically save arguments or scratch registers: the procedure must save every value needed after a call.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "11.1 Review of Stack Frames and Local Variables — listing 1",
            "code": "push rbp          ; save caller's base pointer\nmov rbp, rsp      ; set new frame pointer\nsub rsp, N        ; allocate N bytes for local variables",
            "explanation": "The epilogue:"
          },
          {
            "language": "nasm",
            "title": "11.1 Review of Stack Frames and Local Variables — listing 2",
            "code": "mov rsp, rbp      ; deallocate locals\npop rbp           ; restore caller's base pointer\nret",
            "explanation": "Local variables are accessed at negative offsets from rbp (e.g., [rbp-8], [rbp-16]). Arguments passed on the stack (beyond the first six) are at positive offsets (e.g., [rbp+16]).\n\nWhy use a frame pointer?\n- Provides a stable reference to locals and arguments even if the stack pointer changes (e.g., due to pushes/pops for temporary storage).\n- Simplifies debugging and code generation.\n- Slight performance cost (extra register usage and instructions), but clarity is valuable."
          },
          {
            "language": "nasm",
            "title": "Build and run the exercise solutions",
            "code": "; Save one complete solution as exercise.asm.\n; nasm -f elf64 exercise.asm -o exercise.o\n; ld exercise.o -o exercise\n; ./exercise\n; echo $?",
            "explanation": "The complete solutions target Linux x86-64 with NASM. Standalone procedure fragments elsewhere in the chapter require a caller and section declarations."
          }
        ]
      },
      {
        "id": "sec-11-2",
        "title": "11.2 Recursion Fundamentals",
        "content": "Recursion is a programming technique where a procedure calls itself to solve a problem by breaking it down into smaller subproblems. Each recursive call gets its own stack frame, preserving the caller’s state (return address, registers, locals). When the base case is reached, the recursion unwinds and results are combined."
      },
      {
        "id": "sec-11-2-1",
        "title": "11.2.1 How Recursion Uses the Stack",
        "content": "Consider a simple recursive function that counts down and then returns:\n\nClarification: Use nonnegative n. Negative input moves away from zero and exhausts the stack. With an aligned caller, entry RSP is 8 modulo 16 and push rdi aligns the recursive call. The pop balances the saved value during unwinding.",
        "codeSnippets": [
          {
            "language": "c",
            "title": "11.2.1 How Recursion Uses the Stack — listing 1",
            "code": "void countdown(int n) {\n    if (n == 0) return;\n    countdown(n - 1);\n}",
            "explanation": "In assembly:"
          },
          {
            "language": "nasm",
            "title": "11.2.1 How Recursion Uses the Stack — listing 2",
            "code": "countdown:\n    cmp rdi, 0\n    je  .done\n    push rdi            ; save current n\n    dec rdi\n    call countdown      ; recursive call with n-1\n    pop rdi             ; restore n (not strictly needed but for illustration)\n.done:\n    ret",
            "explanation": "Each call pushes a new return address and any saved registers. The stack grows downward, and each frame contains the state of one invocation. When the base case is hit, the unwinding pops frames and restores state."
          }
        ]
      },
      {
        "id": "sec-11-2-2",
        "title": "11.2.2 Base Case and Stack Overflow",
        "content": "A recursive function must have a base case that stops recursion. Without it, infinite recursion consumes the entire stack, causing a stack overflow (segmentation fault). The stack has a limited size (typically 8 MB on Linux for the main thread), so recursion depth is bounded.\n\nTo avoid overflow:\n- Ensure the base case is reachable and correct.\n- For large recursion depths, consider iterative solutions or explicit stack management.\n\nClarification: A base case must be reachable for the accepted input domain. Stack size depends on process limits and thread configuration; 8 MiB is an illustrative common setting, not a guarantee."
      },
      {
        "id": "sec-11-3",
        "title": "11.3 Classic Recursive Examples",
        "content": ""
      },
      {
        "id": "sec-11-3-1",
        "title": "11.3.1 Factorial",
        "content": "The factorial of a non-negative integer n is n! = n * (n-1)! with 0! = 1 and 1! = 1.\n\nRecursive implementation:\n\nClarification: Accept nonnegative n; the signed base-case comparison also returns 1 for negative inputs, which does not define their factorial. Results fit in 64 bits through 20!; later products wrap. After push rbp, sub rsp,16 keeps nested calls aligned. A frameless version can use one push rdi to align a recursive call, as in Chapter 10.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "factorial: n in rdi, returns n! in rax",
            "code": "; factorial: n in rdi, returns n! in rax\nfactorial:\n    push rbp\n    mov rbp, rsp\n\n    cmp rdi, 1\n    jg  .recurse\n    ; base case: n <= 1\n    mov rax, 1\n    jmp .done\n\n.recurse:\n    ; save n (actually we need n for multiplication after call)\n    ; We'll use a local variable to store n\n    sub rsp, 16        ; allocate one qword local (with alignment)\n    mov [rbp-8], rdi   ; save n\n\n    dec rdi\n    call factorial     ; rax = (n-1)!\n\n    mov rdi, [rbp-8]   ; restore n\n    imul rax, rdi      ; rax = n * (n-1)!\n\n    ; no need to explicitly deallocate if using leave\n.done:\n    leave              ; mov rsp, rbp; pop rbp\n    ret",
            "explanation": "Explanation:\n- Prologue saves rbp and sets it; sub rsp,16 for one local (but aligns to 16? Actually after push rbp, rsp is 16-aligned, subtract 16 keeps aligned). The local [rbp-8] stores n because we need it after the recursive call.\n- Base case: rdi <= 1 returns 1.\n- Recursive case: store n, call factorial(n-1), then multiply result by n.\n- Epilogue leave restores rsp and rbp.\n\nNote: We could also use push rdi to save n, but that would make stack alignment tricky if we need to call recursively. The frame pointer approach is cleaner.\n\nCalling from _start:"
          },
          {
            "language": "nasm",
            "title": "11.3.1 Factorial — listing 2",
            "code": "_start:\n    mov rdi, 5\n    call factorial     ; rax = 120\n    mov rdi, rax\n    mov rax, 60\n    syscall"
          }
        ]
      },
      {
        "id": "sec-11-3-2",
        "title": "11.3.2 Fibonacci",
        "content": "Fibonacci numbers: F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2). A naive recursive implementation is elegant but highly inefficient (exponential time).\n\nClarification: The input must be nonnegative. Two qword locals need 16 bytes; the source reserves 32 bytes, which is valid but larger than necessary. Runtime is exponential but maximum simultaneous recursion depth is O(n), not exponential. Results fit unsigned 64 bits through F(93), though naive recursion is impractical well before then.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "fib: n in rdi, returns F(n) in rax",
            "code": "; fib: n in rdi, returns F(n) in rax\nfib:\n    push rbp\n    mov rbp, rsp\n\n    cmp rdi, 1\n    jg  .recurse\n    ; base case: n <= 1, return n\n    mov rax, rdi\n    jmp .done\n\n.recurse:\n    sub rsp, 32        ; allocate two qword locals (aligned)\n    mov [rbp-8], rdi   ; save n\n\n    ; compute F(n-1)\n    dec rdi\n    call fib\n    mov [rbp-16], rax  ; save F(n-1)\n\n    ; compute F(n-2) using original n\n    mov rdi, [rbp-8]\n    sub rdi, 2\n    call fib           ; rax = F(n-2)\n\n    add rax, [rbp-16]  ; F(n-2) + F(n-1)\n\n.done:\n    leave\n    ret",
            "explanation": "Performance note: This naive recursion recomputes many values; iterative solution is much faster. For n=40, it takes a long time. We'll discuss tail recursion and optimization later."
          }
        ]
      },
      {
        "id": "sec-11-3-3",
        "title": "11.3.3 Sum of First N Natural Numbers",
        "content": "sum(n) = n + sum(n-1), base case n=0 returns 0.\n\nClarification: Use nonnegative n and a bounded recursion depth. Negative inputs never reach zero by decrementing. Arithmetic keeps the low 64 bits; stack exhaustion can occur long before numeric overflow.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "11.3.3 Sum of First N Natural Numbers — listing 1",
            "code": "sum_n:\n    push rbp\n    mov rbp, rsp\n    cmp rdi, 0\n    je  .zero\n    sub rsp, 16\n    mov [rbp-8], rdi   ; save n\n    dec rdi\n    call sum_n         ; rax = sum(n-1)\n    mov rdi, [rbp-8]\n    add rax, rdi       ; n + sum(n-1)\n    leave\n    ret\n.zero:\n    xor rax, rax\n    leave\n    ret"
          }
        ]
      },
      {
        "id": "sec-11-4",
        "title": "11.4 Local Variables in Recursive Procedures",
        "content": "Each recursive call has its own set of local variables because they are stored in that call's stack frame. This isolation is crucial for correctness. The frame pointer (rbp) is essential to access the correct instance of a local variable during recursion.\n\nClarification: RBP is convenient, not essential. Recursion can use RSP-relative locals or saved registers if offsets, preservation, and call alignment are managed correctly.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original source: digit sum (RBX preservation defect)",
            "code": "sum_digits:\n    push rbp\n    mov rbp, rsp\n    cmp rdi, 0\n    je  .zero\n    sub rsp, 16\n    mov [rbp-8], rdi   ; save n\n    mov rax, rdi\n    xor rdx, rdx\n    mov rbx, 10\n    div rbx            ; rax = quotient, rdx = remainder (digit)\n    mov [rbp-16], rdx  ; save digit\n    mov rdi, rax\n    call sum_digits    ; rax = sum of remaining digits\n    add rax, [rbp-16]  ; add current digit\n    leave\n    ret\n.zero:\n    xor rax, rax\n    leave\n    ret",
            "explanation": "The original uses RBX without saving it. The corrected solution uses caller-saved RCX as the divisor and stores the remainder in a local before recursion."
          },
          {
            "language": "nasm",
            "title": "Original source: string reversal draft 1",
            "code": "; reverse_str: rdi points to string\nreverse_str:\n    push rbp\n    mov rbp, rsp\n    ; find end pointer\n    mov rsi, rdi\n.find_end:\n    cmp byte [rsi], 0\n    je  .found_end\n    inc rsi\n    jmp .find_end\n.found_end:\n    dec rsi          ; rsi points to last character before null\n\n    ; if rdi >= rsi, done\n    cmp rdi, rsi\n    jge .done\n\n    ; swap [rdi] and [rsi]\n    mov al, [rdi]\n    mov bl, [rsi]\n    mov [rdi], bl\n    mov [rsi], al\n\n    ; recurse on substring: rdi+1, length-2\n    inc rdi\n    dec rsi\n    ; temporarily adjust string: we can pass new pointers without modifying original? \n    ; Actually, we can call reverse_str with rdi pointing to next character, and then restore? \n    ; Simpler: use a local to save original rdi and rsi, then manipulate.\n    ; We'll use stack locals for clarity.\n    sub rsp, 32\n    mov [rbp-8], rdi   ; new start\n    mov [rbp-16], rsi  ; new end\n    ; set null terminator at new end+1 to limit substring? Not needed if we use pointers.\n    ; Instead, we can recursively call with rdi and rsi as start/end, not null-terminated string.\n    ; That would require a different signature. For simplicity, we can convert to a helper that takes start and end pointers.\n    ; We'll leave this as an exercise for the reader to adapt.\n    ; Below is pseudocode; full implementation would require a helper.\n    call reverse_str_sub\n    leave\n    ret\n.done:\n    leave\n    ret",
            "explanation": "Reference only: the first draft calls an undefined helper; the alternative clobbers RBX through BL and misaligns its helper call. Exercise 11.4 supplies a complete corrected recursive version."
          },
          {
            "language": "nasm",
            "title": "Original source: string reversal draft 2",
            "code": "reverse_str:\n    ; find end\n    mov rsi, rdi\n.loop_end:\n    cmp byte [rsi], 0\n    je .end\n    inc rsi\n    jmp .loop_end\n.end:\n    dec rsi\n    call reverse_range  ; rdi start, rsi end\n    ret\n\nreverse_range:\n    cmp rdi, rsi\n    jge .done\n    mov al, [rdi]\n    mov bl, [rsi]\n    mov [rdi], bl\n    mov [rsi], al\n    inc rdi\n    dec rsi\n    jmp reverse_range   ; tail recursion\n.done:\n    ret",
            "explanation": "Reference only: the first draft calls an undefined helper; the alternative clobbers RBX through BL and misaligns its helper call. Exercise 11.4 supplies a complete corrected recursive version."
          }
        ]
      },
      {
        "id": "sec-11-4-1",
        "title": "11.4.1 Example: Tower of Hanoi (Conceptual)",
        "content": "Tower of Hanoi is a classic recursion problem. We'll outline a procedure that prints moves (printing not fully implemented here, but structure shows recursion with local variables).\n\nClarification: This is conceptual code, not a move-printing program. Its base case requires n >= 1; n=0 is not handled. Before implementing the middle move, reload the saved source and target because the first recursive call may overwrite RSI and RDX. A completed version should treat n=0 as no work and implement the move action in both branches.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "hanoi: n in rdi, source in rsi, target in rdx, auxiliary in rcx",
            "code": "; hanoi: n in rdi, source in rsi, target in rdx, auxiliary in rcx\n; We'll just demonstrate structure; actual printing would be added later.\nhanoi:\n    push rbp\n    mov rbp, rsp\n    sub rsp, 32        ; locals for saving arguments\n\n    cmp rdi, 1\n    je  .base\n\n    ; save arguments in locals because recursive calls modify registers\n    mov [rbp-8], rdi    ; n\n    mov [rbp-16], rsi   ; source\n    mov [rbp-24], rdx   ; target\n    mov [rbp-32], rcx   ; auxiliary\n\n    ; move n-1 disks from source to auxiliary using target as auxiliary\n    mov rdi, [rbp-8]\n    dec rdi\n    mov rsi, [rbp-16]\n    mov rdx, [rbp-32]   ; target becomes auxiliary\n    mov rcx, [rbp-24]   ; auxiliary becomes target\n    call hanoi\n\n    ; move disk from source to target (print or do action)\n    ; ...\n\n    ; move n-1 disks from auxiliary to target using source as auxiliary\n    mov rdi, [rbp-8]\n    dec rdi\n    mov rsi, [rbp-32]\n    mov rdx, [rbp-24]\n    mov rcx, [rbp-16]\n    call hanoi\n\n    leave\n    ret\n.base:\n    ; move single disk from source to target\n    ; ...\n    leave\n    ret",
            "explanation": "The above saves all arguments in local variables because they are needed after recursive calls. This illustrates the importance of stack frames for recursion."
          }
        ]
      },
      {
        "id": "sec-11-5",
        "title": "11.5 Tail Recursion and Optimization",
        "content": "Tail recursion is a special form where the recursive call is the last operation performed before returning; no computation is done after the call. Tail-recursive functions can be optimized into iterative loops by a compiler, avoiding stack growth. In assembly, we can implement tail recursion iteratively by using a jump instead of a call and adjusting arguments.\n\nClarification: A jump reuses the caller return address only after the current frame and callee-saved registers are restored, or when no frame was allocated. Jump to a loop label after one-time setup to avoid repeatedly allocating locals. Tail recursion written with call still grows the stack unless transformed.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Corrected tail-recursive string reversal",
            "code": "; RDI points to a writable, null-terminated byte string (not a null pointer).\nreverse_str:\n    mov rsi, rdi\n.find_end:\n    cmp byte [rsi], 0\n    je .end\n    inc rsi\n    jmp .find_end\n.end:\n    cmp rsi, rdi\n    je .done                 ; empty string: do not decrement past the start\n    dec rsi\n    jmp reverse_range        ; reuse caller return address\n.done:\n    ret\n\n; RDI = first byte, RSI = last byte; pointers within one buffer.\nreverse_range:\n    cmp rdi, rsi\n    jae .done\n    mov al, [rdi]\n    mov dl, [rsi]\n    mov [rdi], dl\n    mov [rsi], al\n    inc rdi\n    dec rsi\n    jmp reverse_range        ; constant stack depth\n.done:\n    ret",
            "explanation": "Alternative to Exercise 11.4: the same swaps use a jump, preserve callee-saved registers, handle empty strings, and use constant stack space."
          }
        ]
      },
      {
        "id": "sec-11-5-1",
        "title": "11.5.1 Example: Factorial Tail-Recursive",
        "content": "Standard factorial is not tail-recursive because multiplication happens after the recursive call. We can rewrite using an accumulator:\n\nClarification: Both assembly versions require nonnegative n. Initialize RSI to 1 for fact_tail. Tail-call conversion removes stack growth, not arithmetic overflow; 20! is the largest factorial fitting in 64 bits. The C example uses int and can overflow much earlier.",
        "codeSnippets": [
          {
            "language": "c",
            "title": "11.5.1 Example: Factorial Tail-Recursive — listing 1",
            "code": "int fact_helper(int n, int acc) {\n    if (n == 0) return acc;\n    return fact_helper(n-1, n*acc);\n}\nint factorial(int n) { return fact_helper(n, 1); }",
            "explanation": "In assembly, we can implement this without recursion (using a loop) by updating n and acc and jumping back:"
          },
          {
            "language": "nasm",
            "title": "11.5.1 Example: Factorial Tail-Recursive — listing 2",
            "code": "factorial_iterative:\n    ; n in rdi, returns n! in rax\n    mov rax, 1          ; acc = 1\n.loop:\n    test rdi, rdi\n    jz  .done\n    imul rax, rdi       ; acc *= n\n    dec rdi             ; n--\n    jmp .loop\n.done:\n    ret",
            "explanation": "This is essentially what a tail-call optimization would produce. In assembly, we can also implement tail recursion directly using jmp if we structure the code accordingly. For example:"
          },
          {
            "language": "nasm",
            "title": "tail-recursive factorial: n in rdi, acc in rsi (initial call acc=1)",
            "code": "; tail-recursive factorial: n in rdi, acc in rsi (initial call acc=1)\nfact_tail:\n    test rdi, rdi\n    jz  .done\n    imul rsi, rdi       ; acc *= n\n    dec rdi             ; n--\n    jmp fact_tail       ; tail call: just jump, no call/ret\n.done:\n    mov rax, rsi\n    ret",
            "explanation": "This avoids pushing return addresses, so stack depth remains constant."
          }
        ]
      },
      {
        "id": "sec-11-5-2",
        "title": "11.5.2 When to Use Recursion vs Iteration",
        "content": "- Recursion is natural for problems that are self-similar (e.g., tree traversal, divide-and-conquer, backtracking).\n- Iteration is generally faster and uses less memory; prefer it when the problem can be easily expressed iteratively.\n- In assembly, recursion is straightforward but requires careful stack management. For deep recursion, ensure stack limits are adequate."
      },
      {
        "id": "sec-11-6",
        "title": "11.6 Recursion Depth and Stack Overflow",
        "content": "The stack size for the main thread in Linux is typically 8 MB. Each recursive call consumes at least 8 bytes for the return address, plus any local variables and saved registers. For a function with 16 bytes of locals and a saved rbp, each frame is ~32 bytes. With 8 MB, you can have roughly 262,000 frames, but in practice, other stack usage reduces this. Deep recursion can easily exhaust the stack.\n\nTo increase stack size for a program, you can use ulimit -s (bash) or set the stack size in the linker (e.g., -Wl,--stack,SIZE for some linkers). For embedded systems, stack is even more limited.\n\nBest practices:\n- Use recursion only when depth is bounded and small.\n- Prefer iterative solutions for potentially deep recursion.\n- If using recursion, minimize the size of each frame (avoid large local arrays on the stack).\n\nClarification: Treat the 262,000-frame figure as a rough budget example, not a safe recursion limit. In Bash, ulimit -s displays the stack limit in KiB; ulimit -Ss and ulimit -Hs inspect soft and hard limits. Raising a soft limit is bounded by the hard limit and does not fix unbounded recursion. GNU ld --stack is for PE targets, not the normal Linux ELF stack-limit mechanism. References: https://www.gnu.org/software/bash/manual/html_node/Bash-Builtins.html and https://sourceware.org/binutils/docs/ld/Options.html."
      },
      {
        "id": "sec-11-7",
        "title": "11.7 Practical Example: Recursive Binary Search",
        "content": "Binary search is naturally recursive, dividing the search interval in half each time. We'll implement it for an array of sorted qwords.\n\nClarification: The routine compares signed qword values in ascending order. Supply valid nonnegative indices into the array; an empty range can use low=0, high=-1. It updates one bound from saved mid, not both bounds from saved locals. No caller state is needed after the recursive call, so a loop can replace recursion. The improved version computes low + (high-low)/2 to avoid overflowing low+high. Duplicates may return any matching index.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "binary_search: search for target in sorted array",
            "code": "; binary_search: search for target in sorted array\n; Inputs: rdi = pointer to array, rsi = low index, rdx = high index, rcx = target\n; Returns: index in rax, or -1 if not found\nbinary_search:\n    push rbp\n    mov rbp, rsp\n    sub rsp, 48        ; locals for saving regs and mid\n\n    cmp rsi, rdx\n    jg  .not_found     ; low > high\n\n    ; compute mid = (low + high) / 2\n    mov rax, rsi\n    add rax, rdx\n    shr rax, 1         ; mid\n    mov [rbp-8], rax   ; save mid\n\n    ; compare array[mid] with target\n    mov r8, rax\n    shl r8, 3          ; mid * 8 (offset)\n    mov r9, [rdi + r8] ; array[mid]\n\n    cmp r9, rcx\n    je  .found         ; equal\n    jl  .go_right      ; array[mid] < target\n\n    ; search left half: high = mid - 1\n    mov rdx, [rbp-8]\n    dec rdx\n    call binary_search\n    jmp .done\n\n.go_right:\n    ; search right half: low = mid + 1\n    mov rsi, [rbp-8]\n    inc rsi\n    call binary_search\n    jmp .done\n\n.found:\n    mov rax, [rbp-8]   ; return mid\n    jmp .done\n\n.not_found:\n    mov rax, -1\n\n.done:\n    leave\n    ret",
            "explanation": "Note: This example saves mid in a local because recursive calls modify registers. It also recomputes low/high from locals before calls. Proper alignment is maintained with sub rsp,48 (multiple of 16 after push rbp). The array is assumed sorted ascending."
          },
          {
            "language": "nasm",
            "title": "Runnable binary search with safer midpoint",
            "code": "section .text\nglobal _start\n\n; binary_search: search for target in sorted array\n; Inputs: rdi = pointer to array, rsi = low index, rdx = high index, rcx = target\n; Returns: index in rax, or -1 if not found\nbinary_search:\n    push rbp\n    mov rbp, rsp\n    sub rsp, 48        ; locals for saving regs and mid\n\n    cmp rsi, rdx\n    jg  .not_found     ; low > high\n\n    ; compute mid = low + (high - low) / 2\n    mov rax, rdx\n    sub rax, rsi\n    shr rax, 1\n    add rax, rsi         ; mid\n    mov [rbp-8], rax   ; save mid\n\n    ; compare array[mid] with target\n    mov r8, rax\n    shl r8, 3          ; mid * 8 (offset)\n    mov r9, [rdi + r8] ; array[mid]\n\n    cmp r9, rcx\n    je  .found         ; equal\n    jl  .go_right      ; array[mid] < target\n\n    ; search left half: high = mid - 1\n    mov rdx, [rbp-8]\n    dec rdx\n    call binary_search\n    jmp .done\n\n.go_right:\n    ; search right half: low = mid + 1\n    mov rsi, [rbp-8]\n    inc rsi\n    call binary_search\n    jmp .done\n\n.found:\n    mov rax, [rbp-8]   ; return mid\n    jmp .done\n\n.not_found:\n    mov rax, -1\n\n.done:\n    leave\n    ret\n\n_start:\n    lea rdi, [rel array]\n    xor esi, esi\n    mov edx, 4\n    mov ecx, 30\n    call binary_search\n    mov rdi, rax\n    mov eax, 60\n    syscall\n\nsection .data\narray dq 10, 20, 30, 40, 50\n",
            "explanation": "Searches for 30 and exits with index 2. A missing target returns -1 in RAX (exit status 255)."
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-11-1",
        "title": "Exercise 11.1: Recursive Power",
        "description": "Write a recursive function power(base, exp) that computes base^exp for non-negative integers. Base case: exp=0 returns 1; exp=1 returns base. Return result in rax. Test with 2^10 = 1024.",
        "solution": "section .text\nglobal _start\n\npower:\n    push rbp\n    mov rbp, rsp\n    cmp rsi, 0\n    je  .zero\n    cmp rsi, 1\n    je  .one\n    ; save base and exp\n    sub rsp, 32\n    mov [rbp-8], rdi   ; base\n    mov [rbp-16], rsi  ; exp\n    dec rsi\n    call power         ; rax = base^(exp-1)\n    mov rdi, [rbp-8]\n    imul rax, rdi      ; multiply by base\n    leave\n    ret\n.zero:\n    mov rax, 1\n    leave\n    ret\n.one:\n    mov rax, rdi\n    leave\n    ret\n\n_start:\n    mov edi, 2\n    mov esi, 10\n    call power\n    cmp rax, 1024\n    sete al\n    movzx eax, al\n    xor eax, 1\n    mov rdi, rax\n    mov eax, 60\n    syscall\n",
        "solutionLanguage": "nasm",
        "solutionExplanation": "\n\nComplete runnable test: 2^10 is checked against the full RAX value 1024; exit 0 means it matched, exit 1 means failure. Exiting directly with 1024 would also yield 0 because exit status keeps only eight bits. Exponent 0 returns 1, including the routine convention 0^0=1. Use bounded nonnegative exponents and avoid overflow."
      },
      {
        "id": "ex-11-2",
        "title": "Exercise 11.2: Recursive GCD",
        "description": "Implement the Euclidean algorithm recursively: gcd(a,b) = gcd(b, a mod b) with gcd(a,0)=a. Return GCD in rax.",
        "solution": "section .text\nglobal _start\n\ngcd_rec:\n    push rbp\n    mov rbp, rsp\n    cmp rsi, 0\n    je  .done\n    sub rsp, 16\n    mov [rbp-8], rdi   ; save a\n    ; compute a mod b\n    mov rax, rdi\n    xor rdx, rdx\n    div rsi            ; remainder in rdx\n    mov rdi, rsi       ; new a = b\n    mov rsi, rdx       ; new b = remainder\n    call gcd_rec\n    ; rax already has result\n    leave\n    ret\n.done:\n    mov rax, rdi       ; gcd = a\n    leave\n    ret\n\n_start:\n    mov edi, 48\n    mov esi, 18\n    call gcd_rec\n    mov rdi, rax\n    mov eax, 60\n    syscall\n",
        "solutionLanguage": "nasm",
        "solutionExplanation": "\n\nComplete runnable example: gcd(48,18)=6, exit status 6. DIV implements unsigned Euclidean remainder, and b=0 is checked before division. gcd(a,0)=a; this routine returns 0 for gcd(0,0) by convention. The saved a is unnecessary but retained from the source."
      },
      {
        "id": "ex-11-3",
        "title": "Exercise 11.3: Sum of Digits",
        "description": "Write a recursive function that computes the sum of decimal digits of a positive integer. For example, sum_digits(123) = 6. Use division by 10 and recursion.",
        "solution": "section .text\nglobal _start\n\nsum_digits:\n    push rbp\n    mov rbp, rsp\n    cmp rdi, 0\n    je  .zero\n    sub rsp, 16\n    mov [rbp-8], rdi   ; save n\n    mov rax, rdi\n    xor rdx, rdx\n    mov ecx, 10\n    div rcx            ; rax = quotient, rdx = remainder (digit)\n    mov [rbp-16], rdx  ; save digit\n    mov rdi, rax\n    call sum_digits    ; rax = sum of remaining digits\n    add rax, [rbp-16]  ; add current digit\n    leave\n    ret\n.zero:\n    xor rax, rax\n    leave\n    ret\n\n_start:\n    mov edi, 123\n    call sum_digits\n    mov rdi, rax\n    mov eax, 60\n    syscall\n",
        "solutionLanguage": "nasm",
        "solutionExplanation": "\n\nComplete corrected example: sum_digits(123)=6, exit status 6. RCX replaces callee-saved RBX as the divisor. The digit is saved before recursion overwrites RDX. Zero returns zero; input is unsigned and even UINT64_MAX needs at most 20 digit steps."
      },
      {
        "id": "ex-11-4",
        "title": "Exercise 11.4: Reverse a String Recursively",
        "description": "Write a recursive procedure that reverses a null-terminated string in place. The function takes pointer to string in rdi. It should swap first and last characters, then recursively reverse the substring between them. Use a helper to find the end.",
        "solution": "section .text\nglobal _start\n\n; RDI points to a writable, null-terminated byte string (not a null pointer).\nreverse_str:\n    mov rsi, rdi\n.find_end:\n    cmp byte [rsi], 0\n    je .end\n    inc rsi\n    jmp .find_end\n.end:\n    cmp rsi, rdi\n    je .done                 ; empty string: do not decrement past the start\n    dec rsi\n    jmp reverse_range        ; reuse caller return address\n.done:\n    ret\n\n; RDI = first byte, RSI = last byte; pointers within one buffer.\nreverse_range:\n    cmp rdi, rsi\n    jae .done\n    mov al, [rdi]\n    mov dl, [rsi]\n    mov [rdi], dl\n    mov [rsi], al\n    inc rdi\n    dec rsi\n    sub rsp, 8               ; align before the recursive call\n    call reverse_range\n    add rsp, 8\n.done:\n    ret\n\n_start:\n    lea rdi, [rel message]\n    call reverse_str\n    mov eax, 1\n    mov edi, 1\n    lea rsi, [rel message]\n    mov edx, 5\n    syscall\n    xor eax, eax\n    mov rdi, rax\n    mov eax, 60\n    syscall\n\nsection .data\nmessage db \"hello\", 0\n",
        "solutionLanguage": "nasm",
        "solutionExplanation": "We'll need a helper to find end, then swap and recurse. For simplicity, assume no null string.\n\n\n\nActually, a clean recursive reverse can be done by passing start and end pointers explicitly. We'll provide an alternative solution using a helper:\n\n\n\nThis tail-recursive version avoids deep recursion and is essentially a loop.\n\nComplete corrected example prints olleh and exits 0. The helper uses unsigned pointer comparisons, caller-saved byte registers, and aligned recursive calls. Empty, one-byte, odd-length and even-length strings are supported; the null terminator stays in place. This is byte reversal, not Unicode character reversal. A valid writable terminated buffer is required. Recursion takes O(length) stack space; the tail variant in 11.5 uses constant stack space."
      },
      {
        "id": "ex-11-5",
        "title": "Exercise 11.5: Tail Recursive Sum",
        "description": "Implement a tail-recursive version of sum from 1 to n using an accumulator. The function should not use call recursively; instead, use a jump. Show that stack depth stays constant.",
        "solution": "section .text\nglobal _start\n\n; sum_tail: sum from 1 to n, using accumulator rsi (initial 0)\nsum_tail:\n    test rdi, rdi\n    jz  .done\n    add rsi, rdi\n    dec rdi\n    jmp sum_tail      ; tail call\n.done:\n    mov rax, rsi\n    ret\n\n_start:\n    mov edi, 10\n    xor esi, esi\n    call sum_tail\n    mov rdi, rax\n    mov eax, 60\n    syscall\n",
        "solutionLanguage": "nasm",
        "solutionExplanation": "Call with rsi=0 initially.\n\nComplete runnable example: sum_tail(10,0)=55, exit status 55. Each jump keeps RSP unchanged and creates no additional return address. Use nonnegative n and initialize the accumulator. Large n still takes linear time and the arithmetic can overflow."
      }
    ],
    "practiceQuestions": [
      {
        "question": "Explain how the stack is used in a recursive function call. What is stored in each stack frame?",
        "answer": "call saves an 8-byte return address. The procedure explicitly saves any registers, arguments, and intermediate results it will need after recursion, and allocates its own locals. Returning restores that invocation and resumes its caller; values are not saved automatically."
      },
      {
        "question": "What is a base case in recursion? Why is it essential?",
        "answer": "A base case returns without another recursive call. Every accepted input must progress toward it. A base case that exists but cannot be reached still allows stack exhaustion."
      },
      {
        "question": "How does a frame pointer help in recursive functions? Would you always use one?",
        "answer": "RBP gives fixed offsets for each invocation even if RSP changes. It is optional: careful RSP-relative addressing or saved registers also work. Preserve RBP when using it because it is callee-saved."
      },
      {
        "question": "What is tail recursion? How can it be optimized in assembly?",
        "answer": "Tail recursion leaves no pending computation after the recursive result. Update arguments and jump to a loop body, restoring any frame and saved registers first if necessary. No new return address is pushed, so stack use stays constant."
      },
      {
        "question": "Compare recursion and iteration in terms of stack usage and performance.",
        "answer": "Ordinary recursion typically uses O(depth) stack and call/return overhead. A simple loop often uses constant stack. Branching traversal may still require an explicit stack in an iterative version; algorithmic work is not automatically reduced by removing calls."
      },
      {
        "question": "Write a recursive assembly function to compute the product of two positive integers using repeated addition.",
        "answer": "; product: RDI=a, RSI=b, nonnegative integers; RAX=a*b (low 64 bits)\nproduct:\n    test rsi, rsi\n    jz .zero\n    push rdi\n    dec rsi\n    call product\n    pop rdi\n    add rax, rdi\n    ret\n.zero:\n    xor eax, eax\n    ret\nTest with a=6, b=7: RAX=42. One push aligns the recursive call and preserves a. Limit b to avoid deep recursion; arithmetic overflow is not detected."
      },
      {
        "question": "What happens if a recursive function lacks a base case? How can you detect this?",
        "answer": "If calls do not terminate, stack usage can grow until the program faults. Inspect repeated frames in a debugger, track how arguments change toward the base case, and test boundary inputs with a timeout. An optimized tail jump can loop forever without overflowing the stack."
      },
      {
        "question": "How many bytes does each recursive call need for a simple function with no locals and no saved registers? Justify your answer.",
        "answer": "The call instruction itself adds 8 bytes for its return address. For repeated ABI-compliant nested calls with no other saves or locals, the callee generally needs an additional 8 bytes of alignment padding before calling again, making 16 bytes per active level in that implementation."
      },
      {
        "question": "In the Fibonacci recursive implementation, why is the time complexity exponential? How could you improve it?",
        "answer": "Naive Fibonacci repeatedly solves the same subproblems along two branches, producing exponential work. Memoization computes each value once; bottom-up iteration takes O(n) time and O(1) auxiliary space. Maximum live recursive depth remains O(n)."
      },
      {
        "question": "Can a recursive function be converted to an iterative one always? What are the challenges?",
        "answer": "Recursive control flow can be simulated with an explicit stack that stores arguments, locals, and where execution resumes. Tail recursion often becomes a simple loop. Branching recursion requires retaining pending work and intermediate results; conversion does not guarantee constant space or faster execution."
      }
    ],
    "summary": [
      "Recursion is implemented via the stack: each call creates a new frame with its own return address, saved registers, and locals.",
      "A frame pointer (rbp) provides stable access to locals and arguments during recursion.",
      "Always define a base case to terminate recursion; otherwise stack overflow occurs.",
      "Local variables in recursive functions are isolated per invocation.",
      "Tail recursion can be optimized into iteration by using a jump and updating parameters, avoiding stack growth.",
      "Recursion depth is limited by stack size; use iterative solutions for deep recursion.",
      "Recursion is well-suited for problems like factorial, Fibonacci, tree traversal, and divide-and-conquer algorithms.",
      "In the next chapter, we'll explore advanced addressing modes and pointers, building on these fundamentals to manipulate data structures more flexibly."
    ]
  }
];
