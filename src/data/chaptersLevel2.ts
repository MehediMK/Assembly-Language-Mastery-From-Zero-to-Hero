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
            "title": "9.2.2 Example: String Length (using scasb) — listing 1",
            "code": "section .data\n    str db 'Hello, World!', 0\nsection .text\nglobal _start\n_start:\n    lea rdi, [str]       ; pointer to string\n    xor al, al           ; search for null (0)\n    mov rcx, -1          ; maximum count (effectively unlimited)\n    cld                  ; forward direction\n    repne scasb          ; scan for byte 0; rdi ends one past null\n    ; rdi points to byte after null\n    ; compute length = rdi - str - 1\n    lea rax, [rdi - 1]   ; address of null\n    sub rax, str         ; length = null_addr - start\n    ; rax = 13\n    mov rdi, rax\n    mov rax, 60\n    syscall"
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
        "solution": "section .data\n    str db 'Assembly is fun', 0\nsection .text\nglobal _start\n_start:\n    lea rdi, [str]\n    xor al, al\n    mov rcx, -1\n    cld\n    repne scasb\n    ; rdi points one past null\n    dec rdi\n    sub rdi, str         ; length\n    mov rax, rdi\n    mov rdi, rax\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": ""
      },
      {
        "id": "ex-9-3",
        "title": "Exercise 9.3: String Reverse",
        "description": "Reverse a string in place (swap characters from both ends). Use a loop with pointers. Print the reversed string using syscalls (if you can, or exit with first character as code). For practice, just reverse and exit with the first character (which should be the original last character).",
        "solution": "section .data\n    str db 'Hello, World!', 0\nsection .text\nglobal _start\n_start:\n    ; find end of string\n    lea rdi, [str]\n    xor al, al\n    mov rcx, -1\n    cld\n    repne scasb\n    dec rdi              ; rdi points to null terminator\n    ; now rdi = address of null; we want last character before null: rdi-1\n    dec rdi\n    lea rsi, [str]       ; rsi points to first char\nreverse_loop:\n    cmp rsi, rdi\n    jge done\n    mov al, [rsi]\n    mov bl, [rdi]\n    mov [rsi], bl\n    mov [rdi], al\n    inc rsi\n    dec rdi\n    jmp reverse_loop\ndone:\n    ; exit with first character now (originally '!')\n    movzx rdi, byte [str]\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": ""
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
    id: 10,
    slug: 'chapter-10-procedures-calling-conventions',
    level: 2,
    levelTitle: 'Core Assembly Programming',
    title: 'Chapter 10: Procedures, Calling Conventions, and the Stack Frame',
    subtitle: 'System V AMD64 ABI, 16-Byte Stack Alignment, and C Function Interoperability',
    learningObjectives: [
      'Master the call and ret instructions and return address mechanics.',
      'Understand the System V AMD64 ABI calling convention on Linux.',
      'Pass arguments via registers (rdi, rsi, rdx, rcx, r8, r9) and the stack.',
      'Set up stack frames with frame pointer rbp or frame pointer omission.',
      'Enforce strict 16-byte stack alignment before call.'
    ],
    prerequisites: ['Chapters 1–9'],
    keyConcepts: [
      'First 6 integer/pointer arguments are passed in rdi, rsi, rdx, rcx, r8, r9.',
      'Return value is delivered in rax.',
      'Stack must be 16-byte aligned before call instruction.',
      'Callee-saved registers: rbx, rbp, r12, r13, r14, r15.'
    ],
    diagramType: 'procedures_stack',
    sections: [
      {
        id: 'sec-10-1',
        title: '10.1 System V AMD64 ABI Calling Convention',
        content: `Linux x86-64 uses the System V AMD64 ABI:
• Arguments 1-6: rdi, rsi, rdx, rcx, r8, r9
• Arguments 7+: Pushed onto stack in reverse order
• Return value: rax (and rdx if 128-bit struct)
• Caller-saved: rax, rcx, rdx, rsi, rdi, r8-r11 (scratch registers)
• Callee-saved: rbx, rbp, r12-r15 (must be preserved across call)
• Stack alignment: rsp must be aligned to 16 bytes immediately before call.`
      },
      {
        id: 'sec-10-2',
        title: '10.2 Seven Arguments Example with Stack Frame',
        content: `Passing 7 arguments where 7th argument is passed on the stack:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'sum_seven.asm',
            code: `; sum_seven: first 6 in rdi..r9, 7th argument on stack at [rsp+8]
sum_seven:
    add rdi, rsi
    add rdi, rdx
    add rdi, rcx
    add rdi, r8
    add rdi, r9
    mov rax, [rsp+8]    ; load 7th argument
    add rax, rdi
    ret

_start:
    mov rdi, 1
    mov rsi, 2
    mov rdx, 3
    mov rcx, 4
    mov r8, 5
    mov r9, 6
    push 7              ; 7th arg
    call sum_seven      ; sum = 28
    add rsp, 8          ; clean up stack
    mov rdi, rax
    mov rax, 60
    syscall`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-10-1',
        title: 'Exercise 10.1: Max of Three Integers',
        description: 'Write a procedure max_of_three that takes rdi, rsi, rdx and returns maximum in rax.',
        solution: `max_of_three:\n    mov rax, rdi\n    cmp rsi, rax\n    cmovg rax, rsi\n    cmp rdx, rax\n    cmovg rax, rdx\n    ret`,
        solutionLanguage: 'nasm'
      }
    ],
    practiceQuestions: [
      {
        question: 'What happens to the stack when call and ret execute?',
        answer: 'call pushes the 8-byte return address (next instruction RIP) onto the stack and jumps to the target. ret pops the 8-byte return address from the stack into RIP and resumes caller execution.'
      }
    ],
    summary: ['System V ABI standardizes register arguments.', 'Preserve callee-saved registers and maintain 16-byte stack alignment.']
  },
  {
    id: 11,
    slug: 'chapter-11-recursion-local-variables',
    level: 2,
    levelTitle: 'Core Assembly Programming',
    title: 'Chapter 11: Recursion and Local Variables',
    subtitle: 'Activation Records, Stack Unwinding, Tail Recursion, and Binary Search',
    learningObjectives: [
      'Implement recursive procedures using activation records.',
      'Preserve caller state and local variables across recursive invocations.',
      'Optimize tail recursion into iterative loops.',
      'Manage stack depth and mitigate stack overflow risks.',
      'Implement recursive Binary Search in x86-64 assembly.'
    ],
    prerequisites: ['Chapters 1–10'],
    keyConcepts: [
      'Each recursive invocation creates its own independent stack frame.',
      'Base cases terminate recursion before stack overflow occurs.',
      'Tail recursion occurs when the recursive call is the final statement, convertible to jmp.'
    ],
    diagramType: 'recursion_locals',
    sections: [
      {
        id: 'sec-11-1',
        title: '11.1 Recursive Binary Search Implementation',
        content: `Recursive binary search on a sorted 64-bit array:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'binary_search.asm',
            code: `; binary_search: rdi=arr, rsi=low, rdx=high, rcx=target
binary_search:
    push rbp
    mov rbp, rsp
    sub rsp, 48
    cmp rsi, rdx
    jg .not_found

    ; mid = (low + high) / 2
    mov rax, rsi
    add rax, rdx
    shr rax, 1
    mov [rbp-8], rax   ; save mid

    mov r8, rax
    shl r8, 3          ; mid * 8
    mov r9, [rdi + r8] ; arr[mid]
    cmp r9, rcx
    je .found
    jl .go_right

    ; search left: high = mid - 1
    mov rdx, [rbp-8]
    dec rdx
    call binary_search
    jmp .done

.go_right:
    mov rsi, [rbp-8]
    inc rsi
    call binary_search
    jmp .done

.found:
    mov rax, [rbp-8]
    jmp .done

.not_found:
    mov rax, -1
.done:
    leave
    ret`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-11-1',
        title: 'Exercise 11.1: Tail Recursive Factorial',
        description: 'Implement factorial using an accumulator register and jmp without growing stack frames.',
        solution: `fact_tail:\n    test rdi, rdi\n    jz .done\n    imul rsi, rdi\n    dec rdi\n    jmp fact_tail\n.done:\n    mov rax, rsi\n    ret`,
        solutionLanguage: 'nasm'
      }
    ],
    practiceQuestions: [
      {
        question: 'What is tail call optimization (TCO)?',
        answer: 'TCO recognizes when a function call is the last instruction executed before returning. Instead of allocating a new stack frame with call, it reuses the existing stack frame and transfers control via jmp, avoiding stack growth.'
      }
    ],
    summary: ['Recursion allocates a fresh stack frame per call.', 'Tail recursion can be converted into zero-overhead iterative loops.']
  }
];
