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
    id: 8,
    slug: 'chapter-8-control-flow-branches-loops',
    level: 2,
    levelTitle: 'Core Assembly Programming',
    title: 'Chapter 8: Control Flow: Comparisons, Branches, and Loops',
    subtitle: 'Translating While, For, If-Else, and Nested Loops into Assembly',
    learningObjectives: [
      'Master cmp, test, unconditional and conditional jumps.',
      'Differentiate signed (jg, jl) vs unsigned (ja, jb) branching.',
      'Construct if-else, while, do-while, and for loops.',
      'Implement multi-dimensional nested loops for matrices.'
    ],
    prerequisites: ['Chapters 1–7'],
    keyConcepts: [
      'cmp subtracts operands to update status flags.',
      'Signed comparisons check SF and OF; unsigned comparisons check CF and ZF.',
      'Jump tables replace large switch-case chains.'
    ],
    diagramType: 'control_flow',
    sections: [
      {
        id: 'sec-8-1',
        title: '8.1 Multi-Dimensional Nested Loops (Matrix Multiplication)',
        content: `Accessing a 3x3 matrix row-major in assembly:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'Matrix 3x3 Summation',
            code: `section .data
    matrix dq 1,2,3,4,5,6,7,8,9
    rows equ 3
    cols equ 3
section .text
    global _start
_start:
    xor rax, rax          ; sum = 0
    xor rcx, rcx          ; i = 0
outer_loop:
    cmp rcx, rows
    jge outer_done
    xor rdx, rdx          ; j = 0
inner_loop:
    cmp rdx, cols
    jge inner_done
    mov r8, rcx
    imul r8, cols
    add r8, rdx           ; index = i*cols + j
    add rax, [matrix + r8*8]
    inc rdx
    jmp inner_loop
inner_done:
    inc rcx
    jmp outer_loop
outer_done:
    mov rdi, rax          ; 45
    mov rax, 60
    syscall`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-8-1',
        title: 'Exercise 8.1: Array Search',
        description: 'Find target value in an array and exit with index or -1 (255).',
        solution: `xor rcx, rcx\n.loop:\ncmp rcx, len\nje .not_found\ncmp [arr + rcx*8], target\nje .found\ninc rcx\njmp .loop`,
        solutionLanguage: 'nasm'
      }
    ],
    practiceQuestions: [
      {
        question: 'Explain the difference between jg and ja.',
        answer: 'jg is for signed comparisons (checks ZF=0 and SF=OF). ja is for unsigned comparisons (checks CF=0 and ZF=0). Using jg on unsigned data causes critical logic errors.'
      }
    ],
    summary: ['Branching relies on CPU flags.', 'Loop structures require clear initialization, condition check, and increment steps.']
  },
  {
    id: 9,
    slug: 'chapter-9-arrays-strings-memory',
    level: 2,
    levelTitle: 'Core Assembly Programming',
    title: 'Chapter 9: Arrays, Strings, and Memory Operations',
    subtitle: 'String Primaries: movsb, stosb, lodsb, cmpsb, scasb & ASCII Conversions',
    learningObjectives: [
      'Master x86 string primitives with rep, repe, and repne prefixes.',
      'Understand Direction Flag (DF), cld (forward), and std (backward).',
      'Implement fast strlen, strcpy, memset, and memcmp.',
      'Convert between numeric integers and ASCII strings (itoa & atoi).'
    ],
    prerequisites: ['Chapters 1–8'],
    keyConcepts: [
      'rsi points to source memory, rdi points to destination memory.',
      'repne scasb finds character/null byte in linear string buffers.',
      'Number conversion requires repetitive division by 10 and remainder push.'
    ],
    diagramType: 'strings_arrays',
    sections: [
      {
        id: 'sec-9-1',
        title: '9.1 String Primaries & String Length with scasb',
        content: `x86 string instructions use rsi (source), rdi (destination), and rcx (count):
• movsb / movsq: Move byte/qword from [rsi] to [rdi]
• stosb / stosq: Store al/rax to [rdi]
• scasb: Compare al with byte at [rdi]
• cmpsb: Compare byte at [rsi] with [rdi]

Direction flag controls step direction: cld sets forward (+), std sets backward (-).`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'uint_to_str.asm (Integer to Decimal ASCII)',
            code: `; Converts unsigned integer in rax to string at [rdi], null-terminated
uint_to_str:
    sub rsp, 32         ; stack buffer
    mov rbx, rsp
    mov rcx, 10
    mov r9, rdi
    test rax, rax
    jnz .convert
    mov byte [rdi], '0'
    mov byte [rdi+1], 0
    add rsp, 32
    mov rax, 1
    ret
.convert:
    mov rsi, rbx
.digit_loop:
    xor rdx, rdx
    div rcx             ; rax = quotient, rdx = remainder
    add dl, '0'
    dec rbx
    mov [rbx], dl
    test rax, rax
    jnz .digit_loop
    mov rcx, rsi
    sub rcx, rbx        ; length
    mov r8, rcx
    mov rsi, rbx
    mov rdi, r9
.copy_loop:
    mov al, [rsi]
    mov [rdi], al
    inc rsi
    inc rdi
    dec rcx
    jnz .copy_loop
    mov byte [rdi], 0
    mov rax, r8
    add rsp, 32
    ret`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-9-1',
        title: 'Exercise 9.1: In-Place String Reversal',
        description: 'Reverse a null-terminated string in place using two pointers (rsi and rdi).',
        solution: `lea rsi, [str]\nlea rdi, [str + len - 1]\n.rev:\ncmp rsi, rdi\njge .done\nmov al, [rsi]\nmov bl, [rdi]\nmov [rsi], bl\nmov [rdi], al\ninc rsi\ndec rdi\njmp .rev\n.done:`,
        solutionLanguage: 'nasm'
      }
    ],
    practiceQuestions: [
      {
        question: 'Why must you execute cld before rep movsb?',
        answer: 'cld clears the Direction Flag (DF=0), ensuring rsi and rdi increment forward through memory. If DF=1, pointers would decrement backward, causing data corruption.'
      }
    ],
    summary: ['String instructions offer hardware-accelerated memory block operations.', 'ASCII conversions bridge machine words and human text.']
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
