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
    id: 7,
    slug: 'chapter-7-arithmetic-logical',
    level: 2,
    levelTitle: 'Core Assembly Programming',
    title: 'Chapter 7: Arithmetic and Logical Instructions',
    subtitle: 'High Precision Integer Math, Bit Manipulation, and Status Flags',
    learningObjectives: [
      'Master integer arithmetic instructions: add, sub, inc, dec, neg, mul, imul, div, idiv.',
      'Understand how arithmetic instructions affect CPU flags (CF, ZF, SF, OF).',
      'Explore logical instructions: and, or, xor, not, test.',
      'Learn shift and rotate instructions (shl, shr, sar, rol, ror).',
      'Write complete programs for factorial, power of two, and popcount.'
    ],
    prerequisites: ['Chapters 1–6'],
    keyConcepts: [
      'Arithmetic instructions set flags indicating zero, overflow, sign, and carry.',
      'Shifts multiply/divide by powers of 2; sar preserves sign bit.',
      'Popcount counts number of set bits.'
    ],
    diagramType: 'arithmetic_logical',
    sections: [
      {
        id: 'sec-7-1',
        title: '7.1 Bit Manipulation & Popcount',
        content: `Popcount algorithm in assembly using shifts and tests:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'popcount.asm',
            code: `section .text
    global _start
_start:
    mov rax, 0x0F0F0F0F0F0F0F0F   ; value to count bits in
    xor rbx, rbx                  ; bit counter
count_loop:
    test rax, rax
    jz done
    mov rdx, rax
    and rdx, 1                    ; isolate lowest bit
    add rbx, rdx                  ; add to count
    shr rax, 1                    ; shift right logical
    jmp count_loop
done:
    mov rdi, rbx                  ; exit code = 32
    mov rax, 60
    syscall`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-7-1',
        title: 'Exercise 7.1: Sum of Squares',
        description: 'Compute 1² + 2² + ... + 10² = 385. Exit with sum mod 256.',
        solution: `xor rax, rax\nmov rcx, 1\n.loop:\ncmp rcx, 10\njg .done\nmov rbx, rcx\nimul rbx, rbx\nadd rax, rbx\ninc rcx\njmp .loop\n.done:`,
        solutionLanguage: 'nasm'
      }
    ],
    practiceQuestions: [
      {
        question: 'Explain the difference between shr and sar.',
        answer: 'shr shifts bits right and inserts 0 at the MSB (unsigned division). sar shifts right while replicating the MSB sign bit (signed division preserving negative numbers).'
      }
    ],
    summary: ['Integer arithmetic is fast and hardware-mapped.', 'Bit manipulation is foundational for low-level systems.']
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
