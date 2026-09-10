import { Chapter } from '../types';

export const CHAPTERS_LEVEL_3: Chapter[] = [
  {
    "id": 12,
    "slug": "chapter-12-advanced-addressing-pointers",
    "level": 3,
    "levelTitle": "Intermediate Assembly",
    "title": "Chapter 12: Advanced Addressing Modes and Pointers",
    "subtitle": "Pointer to Pointer, Dispatch Tables, Complex Arithmetic with LEA",
    "learningObjectives": [
      "Master the full range of x86-64 addressing modes, including base+index*scale+displacement and RIP-relative addressing.",
      "Understand how to use lea for efficient pointer arithmetic and address computation without modifying flags.",
      "Work with pointers in assembly: pointer variables, dereferencing, and pointer arithmetic.",
      "Manipulate arrays of pointers and pointers to arrays, structures, and other data.",
      "Use function pointers to implement callbacks and indirect calls.",
      "Explore aligned vs unaligned memory access and its performance implications.",
      "Apply advanced addressing to solve complex data structure problems."
    ],
    "prerequisites": [
      "Solid understanding of basic addressing modes and data movement (Chapter 6).",
      "Familiarity with arithmetic, logical instructions, and control flow (Chapters 7–8).",
      "Knowledge of arrays, strings, and memory operations (Chapter 9).",
      "Understanding of procedures and stack frames (Chapter 10–11)."
    ],
    "keyConcepts": [
      "Effective address can combine a base register, index register with scale (1,2,4,8), and displacement.",
      "lea computes an address without accessing memory; it can also perform arithmetic.",
      "Pointers are just integers that hold memory addresses; they are manipulated like any other data.",
      "Pointer arithmetic scales by the size of the pointed-to type.",
      "Function pointers are addresses of code; call them indirectly via call rax etc.",
      "RIP-relative addressing is default for labels in 64-bit mode, enabling position-independent code.",
      "Alignment affects performance; unaligned access is allowed but slower.",
      "Correction to source defaults: select default rel or use explicit rel in NASM; dq does not automatically align data. Unaligned MOV is not necessarily slower. See the detailed clarifications in 12.5 and 12.6."
    ],
    "diagramType": "advanced_pointers",
    "sections": [
      {
        "id": "sec-12-1",
        "title": "12.1 Review of Addressing Modes",
        "content": "Before diving into advanced topics, let's briefly summarize the addressing modes available in x86-64:\n\n\n\nThe scale factor can be 1, 2, 4, or 8, corresponding to byte, word, dword, and qword element sizes. This makes indexed addressing ideal for arrays.\n\nClarification: An ordinary scalar address uses at most one base and one scaled index. RSP cannot serve as the index; RIP-relative addressing cannot include an index register. A scale describes a byte multiplier, not a type checked by the CPU. Most such displacements are signed 32-bit values. Bounds and pointer validity remain the programmer’s responsibility.",
        "tableData": {
          "headers": [
            "Mode",
            "Syntax",
            "Effective Address"
          ],
          "rows": [
            [
              "Immediate",
              "imm",
              "Constant value (not a memory address)"
            ],
            [
              "Register",
              "reg",
              "Register content"
            ],
            [
              "Direct (absolute)",
              "[imm]",
              "Constant address (rare in 64-bit)"
            ],
            [
              "Register indirect",
              "[reg]",
              "Value in register"
            ],
            [
              "Base + displacement",
              "[reg + disp]",
              "reg + disp"
            ],
            [
              "Indexed",
              "[base + index*scale]",
              "base + index*scale"
            ],
            [
              "Base + index*scale + disp",
              "[base + index*scale + disp]",
              "base + index*scale + disp"
            ],
            [
              "RIP-relative",
              "[rel label]",
              "RIP + disp"
            ]
          ]
        }
      },
      {
        "id": "sec-12-1-1",
        "title": "12.1.1 Examples of Complex Addressing",
        "content": "\n\nClarification: The source expression [rbx + rcx*4 + rdx*4] cannot be encoded: it contains a base plus two independently scaled indices. Combine the row and column into one index first. Define C as the column count, and check i and j before loading.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original source: complex addressing (invalid final LEA)",
            "code": "; Access arr[i] where arr is qword array\nmov rax, [rbx + rcx*8]          ; rbx = base, rcx = index\n\n; Access matrix[i][j] where matrix is dword array, columns = C\nmov rdx, rcx                    ; i\nimul rdx, C                     ; i * C\nadd rdx, r8                     ; + j\nmov eax, [rbx + rdx*4]          ; element = *(base + (i*C+j)*4)\n\n; Or using LEA to compute address first\nlea rsi, [rbx + rcx*4 + rdx*4]  ; if you have separate indices? Actually need product.",
            "explanation": "The most general form can include all components:"
          },
          {
            "language": "nasm",
            "title": "12.1.1 Examples of Complex Addressing — listing 2",
            "code": "mov rax, [rbx + rcx*8 + 16]     ; base + index*scale + displacement",
            "explanation": "This is extremely powerful and can express many high-level pointer constructs directly."
          },
          {
            "language": "nasm",
            "title": "Correct matrix element address",
            "code": "; RBX = base, RCX = row i, R8 = column j; C is a defined constant.\nmov rdx, rcx\nimul rdx, C\nadd rdx, r8\nlea rsi, [rbx + rdx*4]\nmov eax, [rsi]",
            "explanation": "For a contiguous row-major dword matrix, the byte offset is (i*C+j)*4. EAX receives the 32-bit value; use movsxd rax, dword [rsi] if a signed 64-bit result is needed."
          }
        ]
      },
      {
        "id": "sec-12-2",
        "title": "12.2 Advanced lea Techniques",
        "content": "lea (Load Effective Address) computes the address of a memory operand and stores it in a register without accessing memory. Because it uses the addressing hardware, it can perform arithmetic operations in a single instruction, often faster than a sequence of add, shl, etc.\n\nClarification: LEA leaves arithmetic flags unchanged and does not dereference its operand. Latency and execution resources depend on the CPU and addressing form; LEA is not universally one-cycle or faster than IMUL. Measure the intended workload."
      },
      {
        "id": "sec-12-2-1",
        "title": "12.2.1 Multiplication by Constants",
        "content": "lea can multiply a register by 2, 4, 8, or 5, 9, etc., by using the scale factor and base+index.\n\n- Multiply by 2: lea rax, [rbx*2]\n- Multiply by 3: lea rax, [rbx + rbx*2]\n- Multiply by 4: lea rax, [rbx*4]\n- Multiply by 5: lea rax, [rbx + rbx*4]\n- Multiply by 8: lea rax, [rbx*8]\n- Multiply by 9: lea rax, [rbx + rbx*8]\n- Multiply by 10: lea rax, [rbx + rbx*4] then add rax, rax (or lea rax, [rbx + rbx*4] gives 5, then lea rax, [rax + rax] gives 10)\n\nThese are often faster than imul for small constants because they avoid the multiplier unit.\n\nExample:\n\nClarification: The original two-LEA example computes 9*RBX, not 7*RBX. The runnable version below uses 8*x-x. SUB changes flags, so the whole sequence does not preserve flags even though LEA does. The two-LEA doubling alternative for 10*x does preserve flags.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Compute rax = 7 * rbx",
            "code": "; Compute rax = 7 * rbx\nlea rax, [rbx + rbx*2]  ; 3*rbx\nlea rax, [rax + rax*2]  ; 3*3 = 9? Actually 3 + 3*2 = 9? Not 7.\n; Better: 7 = 8 - 1, so use lea rax, [rbx*8] ; 8*rbx, then sub rax, rbx ; 7*rbx",
            "explanation": "But often you can compose."
          },
          {
            "language": "nasm",
            "title": "Runnable multiply by seven",
            "code": "section .text\nglobal _start\n_start:\n    mov rbx, 6\n    lea rax, [rbx*8]\n    sub rax, rbx\n    mov rdi, rax\n    mov eax, 60\n    syscall",
            "explanation": "Expected exit status: 42. RBX remains 6; RAX contains the low 64 bits of 7*RBX before the exit syscall setup."
          }
        ]
      },
      {
        "id": "sec-12-2-2",
        "title": "12.2.2 Addition with Constants",
        "content": "lea can add a constant and a register (or multiple registers) without affecting flags.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "12.2.2 Addition with Constants — listing 1",
            "code": "lea rsi, [rdi + 8]        ; rsi = rdi + 8 (pointer increment)\nlea rcx, [rbx + rdx + 16] ; rcx = rbx + rdx + 16"
          }
        ]
      },
      {
        "id": "sec-12-2-3",
        "title": "12.2.3 Non-Destructive Arithmetic",
        "content": "Since lea does not modify flags, it is useful when you need to preserve flags for a subsequent conditional jump.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "12.2.3 Non-Destructive Arithmetic — listing 1",
            "code": "add rax, rbx      ; sets flags\nlea rcx, [rdx + 8] ; flags unchanged"
          }
        ]
      },
      {
        "id": "sec-12-3",
        "title": "12.3 Pointers in Assembly",
        "content": "A pointer is a variable (or register) that holds a memory address. In assembly, pointers are just numbers; there's no type safety. Understanding pointer manipulation is crucial for working with data structures.\n\nClarification: An integer becomes usable as a pointer only if it identifies accessible memory of sufficient size and with suitable permissions. Pointer arithmetic does not allocate storage or check bounds.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original source: Solution 12.2 (RBX not preserved)",
            "code": "section .data\n    a dq 111\n    b dq 222\nsection .text\nglobal _start\n\nswap_ptrs:\n    mov rax, [rdi]      ; tmp = *ptr1\n    mov rbx, [rsi]      ; tmp2 = *ptr2\n    mov [rdi], rbx      ; *ptr1 = *ptr2\n    mov [rsi], rax      ; *ptr2 = tmp\n    ret\n\n_start:\n    lea rdi, [a]\n    lea rsi, [b]\n    call swap_ptrs\n    ; a=222, b=111\n    mov rdi, [a]        ; exit with new a (222)\n    mov rax, 60\n    syscall",
            "explanation": "The source swap overwrites callee-saved RBX. The exercise solution uses RDX as its temporary instead."
          }
        ]
      },
      {
        "id": "sec-12-3-1",
        "title": "12.3.1 Pointer Variables in Memory",
        "content": "You can store addresses in memory using dq (8-byte). To load a pointer and then dereference it:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "12.3.1 Pointer Variables in Memory — listing 1",
            "code": "section .data\n    ptr dq 0          ; a pointer variable\n    value dq 42\n\nsection .text\nglobal _start\n_start:\n    ; store address of value in ptr\n    lea rax, [value]\n    mov [ptr], rax\n\n    ; load ptr and dereference\n    mov rbx, [ptr]    ; rbx = address of value\n    mov rcx, [rbx]    ; rcx = 42 (load from address)"
          },
          {
            "language": "nasm",
            "title": "Complete runnable pointer variable example",
            "code": "section .data\n    ptr dq 0          ; a pointer variable\n    value dq 42\n\nsection .text\nglobal _start\n_start:\n    ; store address of value in ptr\n    lea rax, [value]\n    mov [ptr], rax\n\n    ; load ptr and dereference\n    mov rbx, [ptr]    ; rbx = address of value\n    mov rcx, [rbx]    ; rcx = 42 (load from address)\n    mov rdi, rcx\n    mov eax, 60\n    syscall",
            "explanation": "The source is a fragment without termination. This version exits with 42."
          }
        ]
      },
      {
        "id": "sec-12-3-2",
        "title": "12.3.2 Pointer Arithmetic",
        "content": "Pointer arithmetic scales by the size of the pointed-to type. In assembly, you manually scale.\n\nExample: Iterate over an array using a pointer:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "12.3.2 Pointer Arithmetic — listing 1",
            "code": "section .data\n    arr dq 10, 20, 30, 40, 50\n    len equ 5\nsection .text\nglobal _start\n_start:\n    lea rsi, [arr]    ; pointer to first element\n    xor rcx, rcx\nloop:\n    cmp rcx, len\n    je done\n    mov rax, [rsi]    ; load element\n    add rsi, 8        ; advance pointer by 8 bytes (size of qword)\n    inc rcx\n    jmp loop\ndone:\n    ; ..."
          },
          {
            "language": "nasm",
            "title": "Complete runnable pointer iteration",
            "code": "section .data\n    arr dq 10, 20, 30, 40, 50\n    len equ 5\nsection .text\nglobal _start\n_start:\n    lea rsi, [arr]    ; pointer to first element\n    xor rcx, rcx\nloop:\n    cmp rcx, len\n    je done\n    mov rax, [rsi]    ; load element\n    add rsi, 8        ; advance pointer by 8 bytes (size of qword)\n    inc rcx\n    jmp loop\ndone:\n    ; ...\n    mov rdi, rax\n    mov eax, 60\n    syscall",
            "explanation": "The source fragment ends after visiting each element. This version exits with the last element, 50. For a general routine, validate the length and avoid reading RAX as a result when the input is empty."
          }
        ]
      },
      {
        "id": "sec-12-3-3",
        "title": "12.3.3 Pointer to Pointer",
        "content": "A pointer can point to another pointer. This is used in multi-dimensional arrays, linked lists, and trees.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "12.3.3 Pointer to Pointer — listing 1",
            "code": "section .data\n    value dq 99\n    p_ptr dq 0       ; will hold address of a pointer\n    ptr dq 0         ; will hold address of value\n\nsection .text\nglobal _start\n_start:\n    lea rax, [value]\n    mov [ptr], rax   ; ptr = &value\n    lea rax, [ptr]\n    mov [p_ptr], rax ; p_ptr = &ptr\n\n    ; dereference twice\n    mov rbx, [p_ptr]  ; rbx = &ptr\n    mov rcx, [rbx]    ; rcx = ptr = &value\n    mov rdx, [rcx]    ; rdx = value = 99"
          },
          {
            "language": "nasm",
            "title": "Complete runnable pointer-to-pointer example",
            "code": "section .data\n    value dq 99\n    p_ptr dq 0       ; will hold address of a pointer\n    ptr dq 0         ; will hold address of value\n\nsection .text\nglobal _start\n_start:\n    lea rax, [value]\n    mov [ptr], rax   ; ptr = &value\n    lea rax, [ptr]\n    mov [p_ptr], rax ; p_ptr = &ptr\n\n    ; dereference twice\n    mov rbx, [p_ptr]  ; rbx = &ptr\n    mov rcx, [rbx]    ; rcx = ptr = &value\n    mov rdx, [rcx]    ; rdx = value = 99\n    mov rdi, rdx\n    mov eax, 60\n    syscall",
            "explanation": "The source is a fragment without termination. This version exits with 99."
          }
        ]
      },
      {
        "id": "sec-12-3-4",
        "title": "12.3.4 Function Pointers",
        "content": "A function pointer stores the address of a procedure. You can call it indirectly.\n\nClarification: Indirect calls follow the same calling convention, stack alignment, argument, and register-preservation rules as direct calls. Initialize the pointer to a valid code address before calling it.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "12.3.4 Function Pointers — listing 1",
            "code": "section .data\n    func_ptr dq 0\n\nsection .text\n    global _start\n\nadd_numbers:\n    mov rax, rdi\n    add rax, rsi\n    ret\n\n_start:\n    lea rax, [add_numbers]\n    mov [func_ptr], rax\n\n    mov rdi, 5\n    mov rsi, 10\n    call [func_ptr]    ; indirect call via memory\n    ; rax = 15\n    mov rdi, rax\n    mov rax, 60\n    syscall",
            "explanation": "This is the basis for callbacks and virtual method dispatch."
          }
        ]
      },
      {
        "id": "sec-12-4",
        "title": "12.4 Arrays of Pointers and Pointers to Arrays",
        "content": ""
      },
      {
        "id": "sec-12-4-1",
        "title": "12.4.1 Array of Pointers",
        "content": "An array where each element is an address (pointer). Common in string arrays, hash tables, etc.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "12.4.1 Array of Pointers — listing 1",
            "code": "section .data\n    str1 db 'Hello',0\n    str2 db 'World',0\n    str3 db 'Assembly',0\n    ; Array of pointers to strings\n    str_array dq str1, str2, str3\n    count equ 3\nsection .text\nglobal _start\n_start:\n    xor rcx, rcx\nloop:\n    cmp rcx, count\n    je done\n    mov rax, [str_array + rcx*8]  ; load pointer to string\n    ; rax points to string; you could print or process\n    inc rcx\n    jmp loop\ndone:\n    ; exit\n    mov rax, 60\n    xor rdi, rdi\n    syscall"
          }
        ]
      },
      {
        "id": "sec-12-4-2",
        "title": "12.4.2 Pointer to Array",
        "content": "A pointer to the first element of an array is essentially the array's base address. You can use it to pass arrays to functions.\n\nClarification: In C, a pointer to an array and a pointer to its first element can have the same numeric address but different types and arithmetic: advancing a pointer to a whole N-qword array adds N*8 bytes. This sum_array routine takes a pointer to individual qword elements and a count; it returns zero for count zero.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Function sum_array takes pointer to qword array in rdi, length in rsi",
            "code": "; Function sum_array takes pointer to qword array in rdi, length in rsi\nsum_array:\n    xor rax, rax\n.loop:\n    test rsi, rsi\n    jz .done\n    add rax, [rdi]\n    add rdi, 8\n    dec rsi\n    jmp .loop\n.done:\n    ret"
          }
        ]
      },
      {
        "id": "sec-12-4-3",
        "title": "12.4.3 2D Array as Array of Pointers",
        "content": "In some high-level languages, a 2D array can be an array of pointers to row arrays. In assembly, you can implement this explicitly.\n\nClarification: A row-pointer table requires one load to obtain the row address and another to obtain the element. It differs from a contiguous matrix, whose row address is computed from the base and stride. If rows have different lengths, validate against each row’s length.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "12.4.3 2D Array as Array of Pointers — listing 1",
            "code": "section .data\n    row0 dq 1,2,3\n    row1 dq 4,5,6\n    row2 dq 7,8,9\n    ; matrix as array of row pointers\n    matrix dq row0, row1, row2\n    rows equ 3\n    cols equ 3\nsection .text\nglobal _start\n_start:\n    ; sum all elements\n    xor r10, r10        ; total sum\n    xor rcx, rcx        ; i\nouter_loop:\n    cmp rcx, rows\n    je done\n    mov rax, [matrix + rcx*8]  ; pointer to row\n    xor rdx, rdx        ; j\ninner_loop:\n    cmp rdx, cols\n    je inner_done\n    add r10, [rax + rdx*8]     ; add element\n    inc rdx\n    jmp inner_loop\ninner_done:\n    inc rcx\n    jmp outer_loop\ndone:\n    ; r10 = 45\n    mov rdi, r10\n    mov rax, 60\n    syscall",
            "explanation": "This illustrates pointer traversal and double indexing."
          }
        ]
      },
      {
        "id": "sec-12-5",
        "title": "12.5 RIP-Relative Addressing in Depth",
        "content": "In 64-bit mode, direct memory addressing with a 32-bit displacement is often RIP-relative by default. This means the effective address is computed as RIP + displacement, where the displacement is the signed difference between the target label and the next instruction's address. This enables position-independent code (PIC) because the address is relative to the current instruction pointer.\n\nClarification: NASM does not make every label reference RIP-relative automatically. Use explicit [rel label] or default rel for eligible registerless memory operands. The local NASM 2.16.01 default is absolute; specifying the mode avoids relying on defaults. Reference: https://www.nasm.us/doc/nasm08.html#section-8.2.1"
      },
      {
        "id": "sec-12-5-1",
        "title": "12.5.1 NASM Defaults",
        "content": "When you write mov eax, [myvar], NASM assembles it as mov eax, [rel myvar] (RIP-relative) unless overridden. This is good for code that can be loaded at any address (shared libraries, PIE executables).\n\nTo force absolute addressing (rare), use mov eax, [abs myvar] or use a register like mov rax, myvar (which loads the 64-bit absolute address as immediate, but that is an immediate, not memory dereference).\n\nClarification: NASM does not make every label reference RIP-relative automatically. Use explicit [rel label] or default rel for eligible registerless memory operands. The local NASM 2.16.01 default is absolute; specifying the mode avoids relying on defaults. Reference: https://www.nasm.us/doc/nasm08.html#section-8.2.1 default rel does not turn mov rax, label into LEA, and does not make dq label store a relative pointer. A table of absolute pointers can require loader relocations in PIE."
      },
      {
        "id": "sec-12-5-2",
        "title": "12.5.2 Using LEA for Address",
        "content": "To get the address of a variable into a register, use lea rax, [rel myvar] or just lea rax, [myvar] (NASM default). This is the preferred way to obtain a pointer to data.\n\nClarification: For indexed access to local data in PIE, first use lea rbx, [rel table], then mov rax, [rbx+rcx*8]. RIP plus an index is not encodable in a single scalar memory operand. RIP-relative displacement has a signed 32-bit reach; external/preemptible symbols may require GOT/PLT conventions beyond this local-data example."
      },
      {
        "id": "sec-12-5-3",
        "title": "12.5.3 Example: Accessing Data in PIE",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original source: PIE fragment (REL not specified)",
            "code": "section .data\n    msg db 'Hello',0\nsection .text\nglobal _start\n_start:\n    lea rsi, [msg]      ; RIP-relative load address\n    ; now rsi points to msg, can be used in syscall"
          },
          {
            "language": "nasm",
            "title": "Complete runnable RIP-relative PIE example",
            "code": "default rel\nsection .rodata\n    msg db 'Hello', 10\n    msg_len equ $ - msg\nsection .text\nglobal _start\n_start:\n    lea rsi, [rel msg]\n    mov edx, msg_len\n    mov edi, 1\n    mov eax, 1\n    syscall\n    xor edi, edi\n    mov eax, 60\n    syscall\nsection .note.GNU-stack noalloc noexec nowrite progbits",
            "explanation": "Save as pie.asm; assemble with nasm -f elf64 pie.asm -o pie.o; link with gcc -nostdlib -pie -Wl,-e,_start pie.o -o pie; run ./pie. Expected output: Hello followed by a newline. This local-data example has no absolute pointer table."
          }
        ]
      },
      {
        "id": "sec-12-6",
        "title": "12.6 Alignment and Unaligned Access",
        "content": "The x86-64 architecture allows unaligned memory access (unlike some RISC architectures). However, unaligned access can be slower because the CPU may need to perform multiple bus cycles. For performance-critical code, ensure data is naturally aligned.\n\nClarification: Ordinary scalar MOV generally permits unaligned accessible memory. A load crossing a cache-line or page boundary may cost more; an unaligned load is not always slower. Every byte must be mapped, and some instructions or alignment-check settings impose stricter requirements. This is separate from the stack alignment required at calls."
      },
      {
        "id": "sec-12-6-1",
        "title": "12.6.1 Natural Alignment",
        "content": "- Byte: any address\n- Word (2 bytes): address divisible by 2\n- Dword (4 bytes): address divisible by 4\n- Qword (8 bytes): address divisible by 8\n\nSSE instructions often require 16-byte alignment (or use aligned moves for performance).\n\nThe assembler aligns data automatically based on the largest member's alignment when you use align directive or when defining multi-byte data. For example, dq aligns to 8.\n\nClarification: NASM dq emits eight-byte values but does not automatically insert alignment padding. Use align 8 explicitly for initialized qwords; use alignb for reserved storage. Aligned vector instructions such as MOVDQA require the specified alignment; MOVDQU allows unaligned operands. Instruction-specific requirements differ.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Explicit data and BSS alignment",
            "code": "section .data\n    tag db 1\n    align 8, db 0\n    value dq 42\nsection .bss\n    prefix resb 1\n    alignb 16\n    buffer resb 100",
            "explanation": "Padding aligns value to eight bytes and buffer to sixteen bytes. The directives request alignment; defining a multi-byte value alone does not."
          }
        ]
      },
      {
        "id": "sec-12-6-2",
        "title": "12.6.2 Accessing Unaligned Data",
        "content": "You can load unaligned data with normal mov instructions, but it may be slower. For SSE, you must use movdqu for unaligned loads instead of movdqa.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original source: Solution 12.5 (read exceeds array)",
            "code": "section .data\n    bytes db 0x11,0x22,0x33,0x44,0x55,0x66,0x77,0x88\nsection .text\nglobal _start\n_start:\n    ; load qword from unaligned address (offset 1)\n    lea rbx, [bytes]\n    mov rax, [rbx + 1]   ; unaligned load\n    ; works, but may be slower\n    mov rdi, rax         ; exit with low byte (0x22)\n    mov rax, 60\n    syscall",
            "explanation": "Eight bytes starting at offset 1 require nine declared bytes. The original eight-byte array leaves the last byte outside the object, even if the adjacent memory happens to be mapped."
          }
        ]
      },
      {
        "id": "sec-12-6-3",
        "title": "12.6.3 Example: Aligning a Buffer",
        "content": "\n\nClarification: Prefer alignb 16 in .bss to reserve padding without emitting initialized bytes. The original align 16 conveys the desired boundary, but may generate warnings when padding is required in a NOBITS section.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "12.6.3 Example: Aligning a Buffer — listing 1",
            "code": "section .bss\n    align 16\n    buffer resb 100",
            "explanation": "This ensures buffer starts at a 16-byte boundary."
          }
        ]
      },
      {
        "id": "sec-12-7",
        "title": "12.7 Practical Examples",
        "content": ""
      },
      {
        "id": "sec-12-7-1",
        "title": "12.7.1 Linked List Traversal",
        "content": "A simple singly linked list where each node contains a value and a pointer to the next node.\n\nClarification: The list must be finite, null-terminated, and contain readable nodes with a qword value at offset 0 and next pointer at offset 8. A cycle makes this traversal loop forever. RBX is used freely by _start; a reusable function that modifies RBX must preserve it.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "12.7.1 Linked List Traversal — listing 1",
            "code": "section .data\n    ; Nodes\n    n1 dq 10, n2\n    n2 dq 20, n3\n    n3 dq 30, 0      ; null pointer ends list\nsection .text\nglobal _start\n_start:\n    lea rsi, [n1]     ; head pointer\n    xor rbx, rbx      ; sum\ntraverse:\n    test rsi, rsi\n    jz  done\n    mov rax, [rsi]    ; value\n    add rbx, rax\n    mov rsi, [rsi+8]  ; next pointer\n    jmp traverse\ndone:\n    ; rbx = 60\n    mov rdi, rbx\n    mov rax, 60\n    syscall"
          }
        ]
      },
      {
        "id": "sec-12-7-2",
        "title": "12.7.2 Binary Tree Inorder Traversal (Conceptual)",
        "content": "A binary tree node: value dq, left dq, right dq. Traversal can be done recursively or iteratively. Here we show a recursive approach using stack frames (as in Chapter 11).\n\nClarification: The visit step is conceptual and performs no output. If it calls a visitor that clobbers RDI, reload the node pointer from [rbp-8] before reading the right child. The shown frame aligns recursive calls. Assume a finite acyclic tree with valid nodes.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "inorder: rdi = node pointer",
            "code": "; inorder: rdi = node pointer\ninorder:\n    test rdi, rdi\n    jz  .done\n    push rbp\n    mov rbp, rsp\n    sub rsp, 16\n    mov [rbp-8], rdi      ; save node pointer\n\n    ; left subtree\n    mov rdi, [rdi+8]      ; left pointer\n    call inorder\n\n    ; visit node\n    mov rdi, [rbp-8]      ; restore node\n    ; do something with [rdi] value\n\n    ; right subtree\n    mov rdi, [rdi+16]     ; right pointer\n    call inorder\n\n    leave\n    ret\n.done:\n    ret"
          }
        ]
      },
      {
        "id": "sec-12-7-3",
        "title": "12.7.3 Function Pointer Table (Dispatch Table)",
        "content": "We can implement a simple calculator using a table of function pointers.\n\nClarification: Check an unsigned operation index against the table length before loading a function pointer. DIV here is unsigned and needs a nonzero divisor; the fixed example below exits 1 for invalid input. The original multiplication choice is valid and returns 50.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "12.7.3 Function Pointer Table (Dispatch Table) — listing 1",
            "code": "section .data\n    ; table of function pointers for operations\n    ops dq add_op, sub_op, mul_op, div_op\n\nsection .text\n    global _start\n\nadd_op:\n    mov rax, rdi\n    add rax, rsi\n    ret\nsub_op:\n    mov rax, rdi\n    sub rax, rsi\n    ret\nmul_op:\n    mov rax, rdi\n    imul rax, rsi\n    ret\ndiv_op:\n    mov rax, rdi\n    xor rdx, rdx\n    div rsi   ; caution: need zero check\n    ret\n\n_start:\n    mov rdi, 10\n    mov rsi, 5\n    mov rcx, 2          ; operation index (2 = mul)\n    lea rax, [ops]\n    mov rbx, [rax + rcx*8]  ; load function pointer\n    call rbx            ; call mul_op (10*5=50)\n    ; rax = 50\n    mov rdi, rax\n    mov rax, 60\n    syscall"
          },
          {
            "language": "nasm",
            "title": "Checked dispatch table",
            "code": "section .data\n    ; table of function pointers for operations\n    ops dq add_op, sub_op, mul_op, div_op\n\nsection .text\n    global _start\n\nadd_op:\n    mov rax, rdi\n    add rax, rsi\n    ret\nsub_op:\n    mov rax, rdi\n    sub rax, rsi\n    ret\nmul_op:\n    mov rax, rdi\n    imul rax, rsi\n    ret\ndiv_op:\n    mov rax, rdi\n    xor rdx, rdx\n    test rsi, rsi\n    jz invalid_input\n    div rsi\n    ret\n\n_start:\n    mov rdi, 10\n    mov rsi, 5\n    mov rcx, 2          ; operation index (2 = mul)\n    cmp rcx, 4\n    jae invalid_input\n    lea rax, [rel ops]\n    mov rbx, [rax + rcx*8]  ; load function pointer\n    call rbx            ; call mul_op (10*5=50)\n    ; rax = 50\n    mov rdi, rax\n    mov rax, 60\n    syscall\ninvalid_input:\n    mov edi, 1\n    mov eax, 60\n    syscall",
            "explanation": "Operation 0 adds, 1 subtracts, 2 multiplies, 3 divides unsigned inputs. The standalone program terminates with status 1 on an out-of-range index or zero divisor; a library API should instead document an error return."
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-12-1",
        "title": "Exercise 12.1: Complex Addressing",
        "description": "Given an array of qwords starting at label data, compute the address of element i where i is in rcx, and load that element into rax. Use lea for address calculation. Test with i=3.",
        "solution": "section .data\n    data dq 10,20,30,40,50\nsection .text\nglobal _start\n_start:\n    mov rcx, 3          ; index i\n    lea rbx, [data]     ; base address\n    lea rax, [rbx + rcx*8] ; address of data[3]\n    mov rax, [rax]      ; load data[3] = 40\n    mov rdi, rax\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "\n\nExpected exit status: 40 for index 3. The first LEA obtains the base, the second computes data+3*8, and MOV dereferences it. Validate 0 <= i < 5 before using an arbitrary index."
      },
      {
        "id": "ex-12-2",
        "title": "Exercise 12.2: Pointer Swap",
        "description": "Write a function swap_ptrs that takes two pointers to qwords (in rdi and rsi) and swaps the values they point to. Use temporary register. Verify by swapping two variables.",
        "solution": "section .data\n    a dq 111\n    b dq 222\nsection .text\nglobal _start\n\nswap_ptrs:\n    mov rax, [rdi]      ; tmp = *ptr1\n    mov rdx, [rsi]      ; tmp2 = *ptr2\n    mov [rdi], rdx      ; *ptr1 = *ptr2\n    mov [rsi], rax      ; *ptr2 = tmp\n    ret\n\n_start:\n    lea rdi, [a]\n    lea rsi, [b]\n    call swap_ptrs\n    ; a=222, b=111\n    mov rdi, [a]        ; exit with new a (222)\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "\n\nCorrected temporary register: RDX replaces RBX so the routine preserves all callee-saved registers. Expected values after the call: a=222, b=111; exit status 222. Both pointers must refer to writable qwords; passing the same pointer twice leaves its value unchanged."
      },
      {
        "id": "ex-12-3",
        "title": "Exercise 12.3: Array of Strings",
        "description": "Define an array of three strings. Write a program that iterates through the array and computes the total length of all strings. Exit with total length. Use pointers to strings.",
        "solution": "section .data\n    s1 db 'Hello',0\n    s2 db 'World',0\n    s3 db 'Assembly',0\n    array dq s1, s2, s3\n    count equ 3\nsection .text\nglobal _start\n_start:\n    xor rbx, rbx        ; total length\n    xor rcx, rcx\nloop:\n    cmp rcx, count\n    je done\n    mov rsi, [array + rcx*8]  ; pointer to string\n    ; compute length of this string\n    call strlen        ; length in rax\n    add rbx, rax\n    inc rcx\n    jmp loop\ndone:\n    mov rdi, rbx\n    mov rax, 60\n    syscall\n\nstrlen:\n    xor rax, rax\n.loop:\n    cmp byte [rsi + rax], 0\n    je .done\n    inc rax\n    jmp .loop\n.done:\n    ret",
        "solutionLanguage": "nasm",
        "solutionExplanation": "\n\nExpected exit status: 18 (5+5+8). This private strlen takes its pointer in RSI and leaves RCX unchanged, so the source loop works. A general ABI call may clobber RCX; preserve the index or use a callee-saved register before substituting another function. The strings must have accessible null terminators."
      },
      {
        "id": "ex-12-4",
        "title": "Exercise 12.4: Function Pointer",
        "description": "Create an array of function pointers to three procedures that return 1, 2, or 3. Use an index to call one and exit with its result.",
        "solution": "section .data\n    funcs dq f1, f2, f3\nsection .text\nglobal _start\n\nf1:\n    mov rax, 1\n    ret\nf2:\n    mov rax, 2\n    ret\nf3:\n    mov rax, 3\n    ret\n\n_start:\n    mov rcx, 1          ; call f2\n    lea rbx, [funcs]\n    mov rax, [rbx + rcx*8]\n    call rax\n    ; rax = 2\n    mov rdi, rax\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "\n\nExpected exit status: 2 for index 1. Valid indices are 0, 1, and 2. Check the unsigned index before the load when it comes from input; indirect calls still require aligned stacks."
      },
      {
        "id": "ex-12-5",
        "title": "Exercise 12.5: Unaligned Access",
        "description": "Define a byte array and attempt to load a qword from an odd address. In C, this would be UB, but in assembly it's allowed. Show that it works but note performance. (You can just write code that loads from an unaligned address and exits with low byte.)",
        "solution": "section .data\n    align 8, db 0\n    bytes db 0x11,0x22,0x33,0x44,0x55,0x66,0x77,0x88,0x99\nsection .text\nglobal _start\n_start:\n    ; load qword from unaligned address (offset 1)\n    lea rbx, [bytes]\n    mov rax, [rbx + 1]   ; unaligned load\n    ; works, but may be slower\n    mov rdi, rax         ; exit with low byte (0x22)\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "\n\nCorrected storage: the array starts on an eight-byte boundary and contains nine bytes, so offset 1 is definitely unaligned and all eight loaded bytes lie inside the object. RAX receives 0x9988776655443322 in little-endian order; the exit status is 0x22 (34). This is a correctness example, not a performance benchmark. In C, dereferencing a misaligned uint64_t pointer is invalid; memcpy into a properly aligned uint64_t is a valid alternative."
      }
    ],
    "practiceQuestions": [
      {
        "question": "What is the most general addressing mode in x86-64? Write its syntax.",
        "answer": "The ordinary scalar form is [base + index*scale + displacement], with scale 1, 2, 4, or 8. It has at most two register terms and one scaled index; RSP cannot be the index. RIP-relative addressing is a separate form without a register index."
      },
      {
        "question": "How does lea differ from mov when used with a memory operand? Give an example where lea is preferable.",
        "answer": "lea rax, [rbx+rcx*8] computes the element address without reading memory or changing arithmetic flags. mov rax, [rbx+rcx*8] loads a qword from that address. Use LEA to pass an element pointer to another function."
      },
      {
        "question": "How do you multiply a register by 7 using only lea and one sub? Show the instructions.",
        "answer": "lea rax, [rbx*8]\nsub rax, rbx\nThis gives 7*RBX in RAX modulo 2^64. RBX is unchanged. LEA preserves flags but SUB changes them."
      },
      {
        "question": "What is a pointer in assembly? How do you dereference a pointer stored in rax?",
        "answer": "A pointer holds an address. mov rdx, [rax] loads the qword at that address; lea rdx, [rax] merely copies the address calculation. The pointed-to storage must be accessible for the full operand width."
      },
      {
        "question": "Explain how an array of pointers works. Provide an example of accessing the third string in an array of string pointers.",
        "answer": "Each table entry is an eight-byte address. To fetch the third string pointer: lea rdx, [rel str_array]; mov rsi, [rdx+2*8]. To read its first byte, use movzx eax, byte [rsi]. A contiguous character array has a different layout."
      },
      {
        "question": "What is a function pointer? How do you call a function using a pointer stored in memory?",
        "answer": "A function pointer holds a code address. call qword [rel func_ptr] reads it from memory and calls that address. Alternatively load it into RAX and use call rax. Initialize the pointer and follow the target calling convention."
      },
      {
        "question": "Why is RIP-relative addressing used in 64-bit mode? What problem does it solve?",
        "answer": "RIP-relative addressing keeps the displacement between nearby code and data valid when both relocate together. Use [rel label] or explicitly select default rel in NASM. This does not eliminate every relocation, especially for stored absolute pointers or external symbols."
      },
      {
        "question": "What is natural alignment? Why does unaligned access affect performance?",
        "answer": "Natural alignment places a value at an address divisible by its required alignment, such as eight for a qword. Splitting accesses across cache lines or pages can add cost, but ordinary unaligned MOV is not always slower. Instructions with explicit alignment requirements can fault on misaligned operands."
      },
      {
        "question": "Write a snippet to compute the address of matrix[i][j] where matrix is a 2D array of dwords with C columns, using lea.",
        "answer": "; RBX = contiguous matrix base, RCX = i, R8 = j; C = constant columns\nmov rdx, rcx\nimul rdx, C\nadd rdx, r8\nlea rax, [rbx+rdx*4]\n; RAX is the address; mov eax, [rax] would load the dword.\nCheck indices first. A row-pointer matrix instead requires loading the row pointer."
      },
      {
        "question": "How can you implement a switch statement using a jump table of function pointers? Describe the approach.",
        "answer": "Normalize the case value if needed, compare the unsigned index with the table length, and branch to a default case when outside range. Load the selected function pointer and CALL it for a returning handler. A JMP table transfers control without pushing a return address, so targets must be designed for that control flow. For PIE, obtain the table base with RIP-relative LEA and account for relocations of stored pointers."
      }
    ],
    "summary": [
      "The most general addressing mode is [base + index*scale + displacement], allowing direct expression of array and structure access.",
      "lea is a powerful tool for address arithmetic and multiplication by constants without affecting flags.",
      "Pointers are just integers; assembly gives you full control over dereferencing and pointer arithmetic.",
      "Arrays of pointers and pointers to arrays are common in complex data structures.",
      "Function pointers enable indirect calls and dispatch tables.",
      "RIP-relative addressing is the default for labels in 64-bit mode, supporting position-independent code.",
      "Alignment is important for performance; unaligned access is allowed but slower.",
      "In the next chapter, we'll explore structures and memory manipulation, applying these addressing techniques to user-defined data types.",
      "Source clarifications: NASM requires explicit relative-addressing intent; use alignment directives when needed, check all accessed bytes, and preserve callee-saved registers in reusable procedures."
    ]
  },
  {
    "id": 13,
    "slug": "chapter-13-structures-memory-manipulation",
    "level": 3,
    "levelTitle": "Intermediate Assembly",
    "title": "Chapter 13: Structures and Memory Manipulation",
    "subtitle": "Struct Layout, C ABI Padding, Linked Lists, and Block Memory Functions",
    "learningObjectives": [
      "Understand how structures (records) are represented in memory as contiguous blocks of fields.",
      "Define structures in NASM using the struc macro or manual offset calculation.",
      "Access and modify structure members using base+offset addressing.",
      "Work with arrays of structures and nested structures.",
      "Understand memory alignment and padding rules for structures.",
      "Implement common memory manipulation routines: copy, fill, and compare blocks using both string instructions and custom loops.",
      "Apply structures to solve real-world problems, such as managing records and linked data structures."
    ],
    "prerequisites": [
      "Solid understanding of addressing modes and pointer arithmetic (Chapter 12).",
      "Familiarity with arrays, strings, and memory operations (Chapter 9).",
      "Knowledge of procedures and calling conventions (Chapter 10).",
      "Basic arithmetic and logical instructions (Chapter 7)."
    ],
    "keyConcepts": [
      "A structure is a user-defined composite data type that groups related variables of possibly different types under one name.",
      "Structure members are laid out sequentially in memory; each member’s offset is determined by its size and alignment requirements.",
      "NASM provides the struc/endstruc macros to define structure templates and compute member offsets.",
      "Accessing a member uses the structure’s base address plus the member’s offset (e.g., [rbx + member_offset]).",
      "Alignment inserts padding bytes to ensure each member starts at its natural boundary; the structure size is rounded up to the alignment of its largest member.",
      "Memory manipulation routines like memset, memcpy, and memcmp can be implemented using rep stosb, rep movsb, rep cmpsb, or custom loops."
    ],
    "diagramType": "structures_memory",
    "sections": [
      {
        "id": "sec-13-1",
        "title": "13.1 Introduction to Structures",
        "content": "In high-level languages, a structure (or record) groups multiple fields into a single unit. In assembly, there is no built-in structure type, but we can simulate it by reserving a block of memory and accessing fields using their offsets from the base address. This approach gives full control over memory layout and is essential for interacting with operating system data structures, file formats, and complex algorithms."
      },
      {
        "id": "sec-13-1-1",
        "title": "13.1.1 Why Structures Matter",
        "content": "- Represent complex data (e.g., points, rectangles, linked list nodes, process control blocks).\n- Interface with C structs (same memory layout).\n- Improve code readability and maintainability by using symbolic names instead of raw offsets."
      },
      {
        "id": "sec-13-1-2",
        "title": "13.1.2 Example: A Simple Point Structure",
        "content": "In C:",
        "codeSnippets": [
          {
            "language": "c",
            "title": "13.1.2 Example: A Simple Point Structure — listing 1",
            "code": "struct Point {\n    int x;\n    int y;\n};",
            "explanation": "Memory layout (assuming 4-byte int):"
          },
          {
            "language": "text",
            "title": "13.1.2 Example: A Simple Point Structure — listing 2",
            "code": "Offset 0: x (4 bytes)\nOffset 4: y (4 bytes)\nTotal size: 8 bytes",
            "explanation": "In assembly, we can define offsets manually:"
          },
          {
            "language": "nasm",
            "title": "Offsets for Point",
            "code": "; Offsets for Point\nPOINT_X equ 0\nPOINT_Y equ 4\nPOINT_SIZE equ 8",
            "explanation": "Then allocate a Point instance in .bss or on the stack, and access fields using [base + POINT_X]."
          }
        ]
      },
      {
        "id": "sec-13-2",
        "title": "13.2 Defining Structures in NASM",
        "content": "NASM provides a convenient macro facility: struc and endstruc. This defines a structure template and automatically assigns offsets to members. The syntax is:\n\nClarification: For struc Point with the normal zero origin, Point.x=0, Point.y=4 and Point_size=8. The size symbol has the suffix _size. Use [instance_base + Point.x]; neither %$Point_size nor adding the type name is required. STRUC defines constants, not storage or automatic C-style padding.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "13.2 Defining Structures in NASM — listing 1",
            "code": "struc Point\n    .x: resd 1      ; reserve 4 bytes\n    .y: resd 1\nendstruc",
            "explanation": "This creates constants Point.x and Point.y with values 0 and 4, respectively, and Point_size (note: the actual size is Point_size with an underscore prefix, or you can use %$Point_size if using %define? Actually, NASM's struc creates a symbol Point_size for the size. To be precise, if the structure name is Point, then Point_size is the size.) The member names have a leading dot when used inside the structure definition, but when accessing, you use Point + Point.x? Wait: Point.x is a constant equal to the offset. To use it, you typically do [rbx + Point.x]. However, if you want a more readable syntax, you can define a structure instance as a label, but in pure assembly you often manage addresses manually."
          }
        ]
      },
      {
        "id": "sec-13-2-1",
        "title": "13.2.1 Example with struc",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "13.2.1 Example with struc — listing 1",
            "code": "struc Student\n    .name: resb 20      ; 20 bytes for name\n    .age:  resd 1       ; 4 bytes\n    .gpa:  resd 1       ; 4 bytes (float, but here as integer for simplicity)\nendstruc",
            "explanation": "Now Student.name equals 0, Student.age equals 20, Student.gpa equals 24, and Student_size is 28.\n\nNote: The struc macro does not allocate memory; it only defines offsets. You must allocate instances separately using resb Student_size or on the stack."
          }
        ]
      },
      {
        "id": "sec-13-2-2",
        "title": "13.2.2 Manual Offset Definition",
        "content": "If you prefer, you can define offsets with equ:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "13.2.2 Manual Offset Definition — listing 1",
            "code": "STUDENT_NAME equ 0\nSTUDENT_AGE  equ 20\nSTUDENT_GPA  equ 24\nSTUDENT_SIZE equ 28",
            "explanation": "This gives you complete control."
          }
        ]
      },
      {
        "id": "sec-13-3",
        "title": "13.3 Accessing Structure Members",
        "content": "Given the base address of a structure instance in a register (say rbx), you access members using base+offset addressing:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "13.3 Accessing Structure Members — listing 1",
            "code": "mov eax, [rbx + Student.age]   ; load age\nmov dword [rbx + Student.gpa], 95 ; set gpa",
            "explanation": "When the structure is on the stack, the base is rbp plus an offset to the structure."
          }
        ]
      },
      {
        "id": "sec-13-3-1",
        "title": "13.3.1 Example: Point Operations",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "13.3.1 Example: Point Operations — listing 1",
            "code": "section .data\n    ; Point instance initialized in .data\n    p:  dd 10      ; x\n        dd 20      ; y\n\nsection .text\nglobal _start\n_start:\n    ; Load point coordinates\n    lea rbx, [p]\n    mov eax, [rbx]              ; x\n    mov ecx, [rbx + 4]          ; y (using manual offset 4)\n\n    ; Add x and y, store result back in x\n    add eax, ecx\n    mov [rbx], eax              ; x = 30\n\n    ; Exit with x\n    mov rdi, rax\n    mov rax, 60\n    syscall"
          }
        ]
      },
      {
        "id": "sec-13-3-2",
        "title": "13.3.2 Using struc for Readability",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "13.3.2 Using struc for Readability — listing 1",
            "code": "struc Point\n    .x: resd 1\n    .y: resd 1\nendstruc\n\nsection .bss\n    p resb Point_size\n\nsection .text\nglobal _start\n_start:\n    lea rbx, [p]\n    mov dword [rbx + Point.x], 10\n    mov dword [rbx + Point.y], 20\n    mov eax, [rbx + Point.x]\n    add eax, [rbx + Point.y]\n    mov [rbx + Point.x], eax\n    ; exit with x\n    mov rdi, rax\n    mov rax, 60\n    syscall"
          }
        ]
      },
      {
        "id": "sec-13-4",
        "title": "13.4 Arrays of Structures",
        "content": "Arrays of structures are contiguous blocks where each element is a structure. To access element i, compute the address: base + i * struct_size.\n\nClarification: Structure strides such as Student_size=28 are not legal x86 index scales. Multiply the index by the size explicitly, or advance a pointer by the size. Ensure each initialized record occupies exactly that many bytes."
      },
      {
        "id": "sec-13-4-1",
        "title": "13.4.1 Example: Array of Students",
        "content": "Define a structure and an array of 3 students.\n\nClarification: The source introduces three students but actually defines two. Its hand-counted name fields exceed 20 bytes, and its indexed loop adds an age to the address in EAX instead of loading the age. The corrected example fixes both layout and arithmetic. The pointer-loop alternative is valid only with correctly sized records; a 32-bit accumulator can overflow for large datasets.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "13.4.1 Example: Array of Students — listing 1",
            "code": "struc Student\n    .name: resb 20\n    .age:  resd 1\n    .gpa:  resd 1\nendstruc\n\nsection .data\n    ; Pre-initialized array of 2 students\n    students:\n        db 'Alice', 0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0   ; name padded to 20\n        dd 20\n        dd 90\n        db 'Bob', 0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0\n        dd 22\n        dd 85\n    count equ 2\n\nsection .text\nglobal _start\n_start:\n    ; Sum ages of all students\n    xor rbx, rbx              ; accumulator\n    xor rcx, rcx              ; index\n    lea rsi, [students]       ; base address\nloop:\n    cmp rcx, count\n    je done\n    ; compute address of age field: base + rcx*Student_size + Student.age\n    mov rax, rcx\n    imul rax, Student_size\n    add rax, rsi\n    add eax, [rax + Student.age]   ; add age\n    add rbx, rax\n    inc rcx\n    jmp loop\ndone:\n    ; rbx = 42\n    mov rdi, rbx\n    mov rax, 60\n    syscall",
            "explanation": "Note: The above uses a convoluted way; better to keep base pointer and advance by struct size each iteration:"
          },
          {
            "language": "nasm",
            "title": "13.4.1 Example: Array of Students — listing 2",
            "code": "    lea rsi, [students]\n    mov rcx, count\n    xor rbx, rbx\nloop:\n    test rcx, rcx\n    jz done\n    add ebx, [rsi + Student.age]   ; add age\n    add rsi, Student_size          ; advance to next student\n    dec rcx\n    jmp loop\ndone:"
          },
          {
            "language": "nasm",
            "title": "Corrected indexed student age sum",
            "code": "struc Student\n    .name: resb 20\n    .age: resd 1\n    .gpa: resd 1\nendstruc\nsection .data\n    align 4, db 0\nstudents:\ns1: istruc Student\n    at Student.name, db 'Alice', 0\n    at Student.age, dd 20\n    at Student.gpa, dd 90\n    iend\ns2: istruc Student\n    at Student.name, db 'Bob', 0\n    at Student.age, dd 22\n    at Student.gpa, dd 85\n    iend\ncount equ 2\nsection .text\nglobal _start\n_start:\n    lea rsi, [rel students]\n    xor ecx, ecx\n    xor ebx, ebx\n.loop:\n    cmp rcx, count\n    jae .done\n    imul rdx, rcx, Student_size\n    mov eax, [rsi + rdx + Student.age]\n    add rbx, rax\n    inc rcx\n    jmp .loop\n.done:\n    mov rdi, rbx\n    mov eax, 60\n    syscall",
            "explanation": "ISTRUC/AT/IEND pad each name to the declared age offset and complete each 28-byte record. Expected exit status: 42. GPA is an integer score here, not an IEEE floating-point value."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 13.2",
            "code": "struc Student\n    .name: resb 20\n    .age:  resd 1\n    .gpa:  resd 1\nendstruc\n\nsection .data\n    s1: db 'Alice', 0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0\n        dd 20\n        dd 90\n    s2: db 'Bob', 0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0\n        dd 22\n        dd 85\n    s3: db 'Carol', 0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0\n        dd 19\n        dd 95\n    count equ 3\n\nsection .text\nglobal _start\n_start:\n    lea rsi, [s1]          ; pointer to first student\n    xor rbx, rbx           ; sum of gpas\n    mov rcx, count\nloop:\n    test rcx, rcx\n    jz done\n    add ebx, [rsi + Student.gpa]\n    add rsi, Student_size\n    dec rcx\n    jmp loop\ndone:\n    ; sum = 90+85+95 = 270, avg = 90\n    mov eax, ebx\n    xor edx, edx\n    mov ecx, count\n    div ecx                ; quotient in eax = 90\n    mov rdi, rax\n    mov rax, 60\n    syscall",
            "explanation": "Original name padding does not match Student_size. Use the corrected exercise solution with exact field offsets."
          }
        ]
      },
      {
        "id": "sec-13-5",
        "title": "13.5 Nested Structures and Pointers to Structures",
        "content": "Structures can contain other structures or pointers to structures."
      },
      {
        "id": "sec-13-5-1",
        "title": "13.5.1 Nested Structure",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "13.5.1 Nested Structure — listing 1",
            "code": "struc Point\n    .x: resd 1\n    .y: resd 1\nendstruc\n\nstruc Rectangle\n    .top_left:  resb Point_size\n    .bottom_right: resb Point_size\nendstruc\n\nsection .bss\n    rect resb Rectangle_size\nsection .text\nglobal _start\n_start:\n    lea rbx, [rect]\n    ; Set top_left.x = 1, top_left.y = 2\n    mov dword [rbx + Rectangle.top_left + Point.x], 1\n    mov dword [rbx + Rectangle.top_left + Point.y], 2\n    ; Set bottom_right.x = 3, bottom_right.y = 4\n    mov dword [rbx + Rectangle.bottom_right + Point.x], 3\n    mov dword [rbx + Rectangle.bottom_right + Point.y], 4\n    ; Compute sum of all coordinates\n    mov eax, [rbx + Rectangle.top_left + Point.x]\n    add eax, [rbx + Rectangle.top_left + Point.y]\n    add eax, [rbx + Rectangle.bottom_right + Point.x]\n    add eax, [rbx + Rectangle.bottom_right + Point.y]\n    ; eax = 10\n    mov rdi, rax\n    mov rax, 60\n    syscall"
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 13.4",
            "code": "struc Point\n    .x: resd 1\n    .y: resd 1\nendstruc\n\nstruc Line\n    .p1: resb Point_size\n    .p2: resb Point_size\nendstruc\n\nsection .bss\n    line resb Line_size\n\nsection .text\nglobal _start\n_start:\n    lea rbx, [line]\n    ; p1 = (3, 4), p2 = (6, 8)\n    mov dword [rbx + Line.p1 + Point.x], 3\n    mov dword [rbx + Line.p1 + Point.y], 4\n    mov dword [rbx + Line.p2 + Point.x], 6\n    mov dword [rbx + Line.p2 + Point.y], 8\n\n    ; dx = 6-3=3, dy = 8-4=4\n    mov eax, [rbx + Line.p2 + Point.x]\n    sub eax, [rbx + Line.p1 + Point.x]\n    mov ecx, [rbx + Line.p2 + Point.y]\n    sub ecx, [rbx + Line.p1 + Point.y]\n    ; dx^2 + dy^2 = 9 + 16 = 25\n    imul eax, eax\n    imul ecx, ecx\n    add eax, ecx\n    ; eax = 25\n    mov rdi, rax\n    mov rax, 60\n    syscall",
            "explanation": "The source computes the result inline although the exercise asks for a procedure. The corrected solution calls a reusable procedure with the Line pointer in RDI."
          }
        ]
      },
      {
        "id": "sec-13-5-2",
        "title": "13.5.2 Pointer to Structure",
        "content": "A structure can contain a pointer to another structure (or itself, for linked lists). Accessing through a pointer requires an extra level of indirection.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "13.5.2 Pointer to Structure — listing 1",
            "code": "struc Node\n    .value: resq 1\n    .next:  resq 1\nendstruc\n\nsection .data\n    ; Create three nodes manually\n    n1: dq 10, n2\n    n2: dq 20, n3\n    n3: dq 30, 0    ; null pointer\n\nsection .text\nglobal _start\n_start:\n    lea rsi, [n1]           ; head pointer\n    xor rbx, rbx            ; sum\ntraverse:\n    test rsi, rsi\n    jz done\n    add rbx, [rsi + Node.value]   ; add value\n    mov rsi, [rsi + Node.next]    ; move to next node\n    jmp traverse\ndone:\n    ; rbx = 60\n    mov rdi, rbx\n    mov rax, 60\n    syscall",
            "explanation": "This combines structures with linked list traversal."
          }
        ]
      },
      {
        "id": "sec-13-6",
        "title": "13.6 Memory Alignment and Padding in Structures",
        "content": "Alignment ensures that each member is placed at an address that is a multiple of its size (or natural alignment). Padding bytes are inserted between members to satisfy alignment. The total size of the structure is a multiple of the alignment of its largest member.\n\nClarification: These layouts target the usual Linux x86-64 System V ABI without packing attributes. Alignment is a type/ABI requirement, not universally equal to size. Explicitly align each instance as well as padding the field offsets; array stride must include tail padding. Packed layouts and other ABIs can differ."
      },
      {
        "id": "sec-13-6-1",
        "title": "13.6.1 Alignment Rules",
        "content": "- byte (1 byte): any address.\n- word (2 bytes): even address (multiple of 2).\n- dword (4 bytes): multiple of 4.\n- qword (8 bytes): multiple of 8.\n\nNASM’s struc macro does not automatically align members; you must manually insert padding using resb to align subsequent members. This is different from C compilers which add padding automatically. Therefore, you must be aware of alignment to match C struct layouts."
      },
      {
        "id": "sec-13-6-2",
        "title": "13.6.2 Example: C-Style Struct with Padding",
        "content": "Consider this C struct on x86-64:",
        "codeSnippets": [
          {
            "language": "c",
            "title": "13.6.2 Example: C-Style Struct with Padding — listing 1",
            "code": "struct {\n    char c;      // 1 byte\n    int i;       // 4 bytes, needs 4-byte alignment -> 3 bytes padding after c\n    short s;     // 2 bytes -> needs 2-byte alignment, but after i we are at offset 8, aligned, so no extra before s? Actually after i, offset 8, s at 8, then total size 10, but needs alignment to 4 (largest member is int), so size padded to 12.\n};",
            "explanation": "Memory layout:"
          },
          {
            "language": "text",
            "title": "13.6.2 Example: C-Style Struct with Padding — listing 2",
            "code": "offset 0: c (1 byte)\noffset 1-3: padding (3 bytes)\noffset 4-7: i (4 bytes)\noffset 8-9: s (2 bytes)\noffset 10-11: padding (2 bytes)\ntotal size: 12",
            "explanation": "In NASM, to mimic this:"
          },
          {
            "language": "nasm",
            "title": "13.6.2 Example: C-Style Struct with Padding — listing 3",
            "code": "struc Mixed\n    .c: resb 1\n    .pad1: resb 3       ; alignment for int\n    .i: resd 1\n    .s: resw 1\n    .pad2: resb 2       ; pad to multiple of 4\nendstruc"
          }
        ]
      },
      {
        "id": "sec-13-6-3",
        "title": "13.6.3 Using align Inside struc",
        "content": "You can use the align directive within a struc block to automatically insert padding to the next boundary. However, align inside a struc may not work as expected because it aligns relative to the start of the section, not the start of the structure. To be safe, use manual padding with resb when defining structures that must match C ABI.\n\nClarification: Use alignb inside a normal zero-origin STRUC: it reserves padding and aligns member offsets relative to the structure base. Plain align normally emits bytes and is unsuitable for this reservation context. Manual padding also works. Align the actual instances separately.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Mixed structure using ALIGNB",
            "code": "struc MixedAligned\n    .c: resb 1\n    alignb 4\n    .i: resd 1\n    .s: resw 1\n    alignb 4\nendstruc\n; .c=0, .i=4, .s=8, MixedAligned_size=12\nsection .bss\n    alignb 4\n    mixed_instance resb MixedAligned_size",
            "explanation": "Matches the shown char/int/short layout on Linux x86-64. Check offsetof, sizeof, and _Alignof in a small C program when interoperating with C."
          }
        ]
      },
      {
        "id": "sec-13-6-4",
        "title": "13.6.4 Determining Offsets",
        "content": "Use a small program or the assembler’s %assign to compute offsets if needed. You can also use NASM’s struc and then print the constants with %warning during assembly to verify."
      },
      {
        "id": "sec-13-7",
        "title": "13.7 Memory Manipulation: Copying, Filling, Comparing",
        "content": "Memory block operations are common when working with structures. The string instructions with repeat prefixes are ideal for these tasks.\n\nClarification: The original fill and copy fragments do the memory operation but do not implement the C return contract: memset and memcpy return the original destination pointer. The corrected routines below do so. All accessed bytes must be valid, and memcpy requires non-overlap. Bigger element sizes are not automatically faster; benchmark the target workload."
      },
      {
        "id": "sec-13-7-1",
        "title": "13.7.1 memset (Fill Memory)",
        "content": "Fill a block of memory with a byte value.\n\nUsing rep stosb:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "memset: rdi = dest, rsi = byte value (low 8 bits), rdx = count",
            "code": "; memset: rdi = dest, rsi = byte value (low 8 bits), rdx = count\nmemset:\n    mov al, sil          ; byte value\n    mov rcx, rdx\n    cld\n    rep stosb\n    ret",
            "explanation": "For larger fills, you can use stosq with a pre-filled 8-byte pattern for speed, but byte fill is often sufficient."
          },
          {
            "language": "nasm",
            "title": "Corrected memset with destination return",
            "code": "; RDI=destination, RSI=byte value, RDX=count. RAX=original destination.\nmemset:\n    mov r8, rdi\n    mov eax, esi\n    mov rcx, rdx\n    cld\n    rep stosb\n    mov rax, r8\n    ret",
            "explanation": "Fills count bytes with the low eight bits of RSI and returns the original destination. Count zero performs no memory access."
          }
        ]
      },
      {
        "id": "sec-13-7-2",
        "title": "13.7.2 memcpy (Copy Memory)",
        "content": "Copy a block from source to destination. Must handle overlap? For simplicity, assume non-overlapping. For overlapping, use memmove which checks direction and uses backward copy if needed.\n\nUsing rep movsb:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "memcpy: rdi = dest, rsi = src, rdx = count",
            "code": "; memcpy: rdi = dest, rsi = src, rdx = count\nmemcpy:\n    mov rcx, rdx\n    cld\n    rep movsb\n    ret",
            "explanation": "For performance, you may copy in larger chunks (e.g., movsq) when both pointers are aligned and count is multiple of 8."
          },
          {
            "language": "nasm",
            "title": "Corrected memcpy with destination return",
            "code": "; RDI=destination, RSI=source, RDX=count. Non-overlapping buffers.\n; RAX=original destination; callee-saved registers preserved.\nmemcpy:\n    mov rax, rdi\n    mov rcx, rdx\n    cld\n    rep movsb\n    ret",
            "explanation": "Copies exactly count bytes, clears DF, and returns the original destination. Use memmove when ranges overlap."
          },
          {
            "language": "nasm",
            "title": "Overlap-safe memmove",
            "code": "; RDI=destination, RSI=source, RDX=count; RAX=original destination.\nmemmove:\n    mov rax, rdi\n    cld\n    test rdx, rdx\n    jz .done\n    cmp rdi, rsi\n    jbe .forward\n    mov r8, rdi\n    sub r8, rsi\n    cmp r8, rdx\n    jae .forward\n    lea rdi, [rdi+rdx-1]\n    lea rsi, [rsi+rdx-1]\n    mov rcx, rdx\n    std\n    rep movsb\n    cld\n    ret\n.forward:\n    mov rcx, rdx\n    rep movsb\n.done:\n    ret",
            "explanation": "Copies backward only when destination begins inside the source range at a higher address; otherwise copies forward. Count zero does not dereference pointers. DF is clear on every return."
          }
        ]
      },
      {
        "id": "sec-13-7-3",
        "title": "13.7.3 memcmp (Compare Memory)",
        "content": "Compare two blocks; return 0 if equal, negative if first differing byte in block1 < block2, positive if >.\n\nUsing repe cmpsb:\n\nClarification: With count zero, REPE performs no comparison and leaves the old flags unchanged; the source may then read before either buffer. The source also modifies callee-saved RBX through BL. The corrected version handles zero first and uses caller-saved ECX. CMPSB subtracts [RDI] from [RSI]; equality is symmetric, then the explicit comparison below establishes block1 versus block2 order. EAX=-1 is a signed 32-bit return; use MOVSXD if a signed 64-bit value is needed.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "memcmp: rdi = block1, rsi = block2, rdx = count",
            "code": "; memcmp: rdi = block1, rsi = block2, rdx = count\n; Returns: 0 if equal, -1 if block1 < block2, 1 if block1 > block2\nmemcmp:\n    mov rcx, rdx\n    cld\n    repe cmpsb\n    je .equal\n    ; find difference in last compared byte\n    ; After repe, rdi and rsi point to byte after mismatch, rcx may be not zero\n    ; Compare the last byte\n    mov al, [rdi-1]\n    mov bl, [rsi-1]\n    cmp al, bl\n    jb .less\n    mov eax, 1\n    ret\n.less:\n    mov eax, -1\n    ret\n.equal:\n    xor eax, eax\n    ret"
          },
          {
            "language": "nasm",
            "title": "Corrected memcmp for empty and nonempty blocks",
            "code": "; RDI=block1, RSI=block2, RDX=count.\n; Returns signed int in EAX: -1, 0, or 1. Callee-saved registers preserved.\nmemcmp:\n    cld\n    test rdx, rdx\n    jz .equal\n    mov rcx, rdx\n    repe cmpsb\n    je .equal\n    movzx eax, byte [rdi-1]\n    movzx ecx, byte [rsi-1]\n    cmp eax, ecx\n    jb .less\n    mov eax, 1\n    ret\n.less:\n    mov eax, -1\n    ret\n.equal:\n    xor eax, eax\n    ret",
            "explanation": "Unsigned byte comparison returns a signed int. It handles equal blocks and mismatches at any position without touching RBX."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 13.3",
            "code": "section .bss\n    buf1 resb 100\n    buf2 resb 100\n\nsection .text\nglobal _start\n\n; memcmp function from 13.7.3\nmemcmp:\n    ; rdi, rsi, rdx\n    mov rcx, rdx\n    cld\n    repe cmpsb\n    je .equal\n    mov al, [rdi-1]\n    mov bl, [rsi-1]\n    cmp al, bl\n    jb .less\n    mov eax, 1\n    ret\n.less:\n    mov eax, -1\n    ret\n.equal:\n    xor eax, eax\n    ret\n\n_start:\n    ; fill buf1 with 0xAA\n    lea rdi, [buf1]\n    mov al, 0xAA\n    mov rcx, 100\n    cld\n    rep stosb\n\n    ; copy buf1 to buf2\n    lea rsi, [buf1]\n    lea rdi, [buf2]\n    mov rcx, 100\n    cld\n    rep movsb\n\n    ; compare\n    lea rdi, [buf1]\n    lea rsi, [buf2]\n    mov rdx, 100\n    call memcmp\n    ; if equal, eax=0, else nonzero\n    test eax, eax\n    jz .equal_buf\n    mov rdi, 1\n    jmp .exit\n.equal_buf:\n    mov rdi, 0\n.exit:\n    mov rax, 60\n    syscall",
            "explanation": "Original comparison routine lacks a zero-count guard and modifies RBX. The corrected exercise replaces that routine."
          }
        ]
      },
      {
        "id": "sec-13-7-4",
        "title": "13.7.4 Custom Loops for Memory Operations",
        "content": "Sometimes you need more control (e.g., to avoid string instruction overhead for small counts). You can use a simple loop:\n\nClarification: This forward byte loop has memcpy-like non-overlap requirements and does not return the original destination. A bytewise comparison of structures can include padding, so equal field values do not imply identical bytes. Copying a structure containing pointers makes a shallow copy, not a copy of the pointed-to objects.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "custom copy: rdi dest, rsi src, rdx count",
            "code": "; custom copy: rdi dest, rsi src, rdx count\ncopy_loop:\n    test rdx, rdx\n    jz .done\n    mov al, [rsi]\n    mov [rdi], al\n    inc rsi\n    inc rdi\n    dec rdx\n    jmp copy_loop\n.done:\n    ret"
          }
        ]
      },
      {
        "id": "sec-13-8",
        "title": "13.8 Practical Examples",
        "content": ""
      },
      {
        "id": "sec-13-8-1",
        "title": "13.8.1 Student Record Management",
        "content": "We'll create a small program that defines a structure for a student, initializes two students, and computes the average age.\n\nClarification: Hand-counted name padding in the source shifts the fields. ISTRUC places the age and GPA at their exact offsets. The corrected example averages ages 20 and 22 to 21; integer division truncates.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "13.8.1 Student Record Management — listing 1",
            "code": "struc Student\n    .name: resb 20\n    .age:  resd 1\n    .gpa:  resd 1\nendstruc\n\nsection .data\n    s1:\n        db 'Alice', 0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0   ; 20 bytes name\n        dd 20\n        dd 90\n    s2:\n        db 'Bob', 0, 0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0\n        dd 22\n        dd 85\n\nsection .text\nglobal _start\n_start:\n    ; Compute average age\n    lea rsi, [s1]\n    lea rdi, [s2]\n    mov eax, [rsi + Student.age]\n    add eax, [rdi + Student.age]\n    shr eax, 1          ; divide by 2\n    ; eax = 21\n    mov rdi, rax\n    mov rax, 60\n    syscall"
          },
          {
            "language": "nasm",
            "title": "Corrected student average age",
            "code": "struc Student\n    .name: resb 20\n    .age: resd 1\n    .gpa: resd 1\nendstruc\nsection .data\n    align 4, db 0\nstudents:\ns1: istruc Student\n    at Student.name, db 'Alice', 0\n    at Student.age, dd 20\n    at Student.gpa, dd 90\n    iend\ns2: istruc Student\n    at Student.name, db 'Bob', 0\n    at Student.age, dd 22\n    at Student.gpa, dd 85\n    iend\ncount equ 2\nsection .text\nglobal _start\n_start:\n    lea rsi, [rel s1]\n    lea rdi, [rel s2]\n    mov eax, [rsi + Student.age]\n    mov ecx, [rdi + Student.age]\n    add rax, rcx\n    shr rax, 1\n    mov rdi, rax\n    mov eax, 60\n    syscall",
            "explanation": "Expected exit status: 21. The 64-bit addition avoids overflowing a 32-bit sum of two unsigned ages."
          }
        ]
      },
      {
        "id": "sec-13-8-2",
        "title": "13.8.2 Linked List with Structures (Deleting a Node)",
        "content": "We'll traverse a linked list of nodes (as shown earlier) and delete (skip) a node with a specific value. This demonstrates pointer manipulation and structure access.\n\nClarification: This example unlinks the specific non-head node n2 by address; it is not a general search by value and cannot delete the head. A general routine must update the head pointer when deleting the first node. Unlinking static storage does not free memory. Use finite, acyclic lists and valid nodes.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "13.8.2 Linked List with Structures (Deleting a Node) — listing 1",
            "code": "struc Node\n    .value: resq 1\n    .next:  resq 1\nendstruc\n\nsection .data\n    ; Build list: 10 -> 20 -> 30 -> 0\n    n1: dq 10, n2\n    n2: dq 20, n3\n    n3: dq 30, 0\n    ; We'll delete node with value 20 (n2) by updating n1.next to n3\n\nsection .text\nglobal _start\n_start:\n    ; Find n2 and update n1.next\n    lea rsi, [n1]             ; current node\n    lea rbx, [n2]             ; target node to delete\n\n    ; Traverse until we find the node whose next == target\nfind_loop:\n    test rsi, rsi\n    jz done\n    mov rax, [rsi + Node.next]\n    cmp rax, rbx\n    je found\n    mov rsi, rax             ; move to next\n    jmp find_loop\nfound:\n    ; Update this node's next to skip target\n    mov rax, [rbx + Node.next] ; n3\n    mov [rsi + Node.next], rax ; n1.next = n3\n\ndone:\n    ; Traverse and sum values\n    lea rsi, [n1]\n    xor rcx, rcx\nsum_loop:\n    test rsi, rsi\n    jz print_sum\n    add rcx, [rsi + Node.value]\n    mov rsi, [rsi + Node.next]\n    jmp sum_loop\nprint_sum:\n    ; rcx = 10+30 = 40\n    mov rdi, rcx\n    mov rax, 60\n    syscall"
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 13.5",
            "code": "struc Node\n    .value: resq 1\n    .next:  resq 1\nendstruc\n\nsection .data\n    n1: dq 10, n2\n    n2: dq 20, n3\n    n3: dq 30, 0\n\nsection .text\nglobal _start\n_start:\n    lea rsi, [n1]      ; head\n    xor rax, rax       ; prev = NULL\nreverse_loop:\n    test rsi, rsi\n    jz done\n    mov rbx, [rsi + Node.next]   ; save next\n    mov [rsi + Node.next], rax   ; current->next = prev\n    mov rax, rsi                 ; prev = current\n    mov rsi, rbx                 ; current = saved next\n    jmp reverse_loop\ndone:\n    ; rax = new head (n3)\n    ; sum values from new head\n    mov rsi, rax\n    xor rcx, rcx\nsum_loop:\n    test rsi, rsi\n    jz exit\n    add rcx, [rsi + Node.value]\n    mov rsi, [rsi + Node.next]\n    jmp sum_loop\nexit:\n    ; rcx = 30+20+10 = 60\n    mov rdi, rcx\n    mov rax, 60\n    syscall",
            "explanation": "The source exits with the sum 60, but the exercise requests the new head value. A sum alone cannot verify list order. The corrected solution checks each link and exits with 30."
          }
        ]
      },
      {
        "id": "sec-13-8-3",
        "title": "13.8.3 Memory Copy of Structure",
        "content": "Copy one structure to another using rep movsb.\n\nClarification: The source is a fragment and depends on the earlier Student definition. The complete version below allocates both records and exits with the copied age. BSS starts zeroed, so all bytes of this example are initialized before copying.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "13.8.3 Memory Copy of Structure — listing 1",
            "code": "section .bss\n    src resb Student_size\n    dst resb Student_size\nsection .text\n    ; initialize src\n    lea rdi, [src]\n    mov dword [rdi + Student.age], 25\n    ; copy\n    lea rsi, [src]\n    lea rdi, [dst]\n    mov rcx, Student_size\n    cld\n    rep movsb"
          },
          {
            "language": "nasm",
            "title": "Complete runnable structure copy",
            "code": "struc Student\n    .name: resb 20\n    .age: resd 1\n    .gpa: resd 1\nendstruc\nsection .bss\n    alignb 4\n    src resb Student_size\n    dst resb Student_size\nsection .text\nglobal _start\n_start:\n    lea rdi, [rel src]\n    mov dword [rdi+Student.age], 25\n    lea rsi, [rel src]\n    lea rdi, [rel dst]\n    mov rcx, Student_size\n    cld\n    rep movsb\n    mov edi, [rel dst+Student.age]\n    mov eax, 60\n    syscall",
            "explanation": "Expected exit status: 25. Copies all 28 bytes including the zero-initialized name and GPA."
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-13-1",
        "title": "Exercise 13.1: Define and Use a Rectangle Structure",
        "description": "Define a Rectangle structure with two Point members (top-left and bottom-right). Write a program that computes the area (width * height) where width = bottom_right.x - top_left.x, height = bottom_right.y - top_left.y. Assume positive coordinates. Exit with area.",
        "solution": "struc Point\n    .x: resd 1\n    .y: resd 1\nendstruc\n\nstruc Rectangle\n    .top_left: resb Point_size\n    .bottom_right: resb Point_size\nendstruc\n\nsection .bss\n    rect resb Rectangle_size\n\nsection .text\nglobal _start\n_start:\n    lea rbx, [rect]\n    ; set top_left = (10, 20)\n    mov dword [rbx + Rectangle.top_left + Point.x], 10\n    mov dword [rbx + Rectangle.top_left + Point.y], 20\n    ; set bottom_right = (30, 40)\n    mov dword [rbx + Rectangle.bottom_right + Point.x], 30\n    mov dword [rbx + Rectangle.bottom_right + Point.y], 40\n\n    ; width = 30-10 = 20, height = 40-20 = 20, area = 400\n    mov eax, [rbx + Rectangle.bottom_right + Point.x]\n    sub eax, [rbx + Rectangle.top_left + Point.x]   ; width\n    mov ecx, [rbx + Rectangle.bottom_right + Point.y]\n    sub ecx, [rbx + Rectangle.top_left + Point.y]   ; height\n    imul eax, ecx        ; area = 400\n\n    mov rdi, rax\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "\n\nArea is 400, so the shell exit status is 400 modulo 256 = 144. Positive coordinates alone do not guarantee positive width and height: require bottom_right.x >= top_left.x and bottom_right.y >= top_left.y. This example uses 32-bit arithmetic; avoid overflow or widen the calculation."
      },
      {
        "id": "ex-13-2",
        "title": "Exercise 13.2: Array of Structures – Average GPA",
        "description": "Create an array of 3 students (name, age, gpa) using a struc. Compute the average GPA (as integer sum / 3) and exit with it.",
        "solution": "struc Student\n    .name: resb 20\n    .age:  resd 1\n    .gpa:  resd 1\nendstruc\n\nsection .data\n    align 4, db 0\nstudents:\ns1: istruc Student\n    at Student.name, db 'Alice', 0\n    at Student.age, dd 20\n    at Student.gpa, dd 90\n    iend\ns2: istruc Student\n    at Student.name, db 'Bob', 0\n    at Student.age, dd 22\n    at Student.gpa, dd 85\n    iend\ns3: istruc Student\n    at Student.name, db 'Carol', 0\n    at Student.age, dd 19\n    at Student.gpa, dd 95\n    iend\ncount equ 3\n\nsection .text\nglobal _start\n_start:\n    lea rsi, [s1]          ; pointer to first student\n    xor rbx, rbx           ; sum of gpas\n    mov rcx, count\nloop:\n    test rcx, rcx\n    jz done\n    add ebx, [rsi + Student.gpa]\n    add rsi, Student_size\n    dec rcx\n    jmp loop\ndone:\n    ; sum = 90+85+95 = 270, avg = 90\n    mov eax, ebx\n    xor edx, edx\n    mov ecx, count\n    div ecx                ; quotient in eax = 90\n    mov rdi, rax\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "\n\nCorrected record initialization yields GPA sum 270 and integer average 90; expected exit status 90. Each record is exactly 28 bytes. These GPA values are integer scores, and the unsigned 32-bit sum is sufficient for the supplied inputs."
      },
      {
        "id": "ex-13-3",
        "title": "Exercise 13.3: Memset and Memcpy",
        "description": "Write a program that fills a 100-byte buffer with 0xAA, then copies it to another 100-byte buffer. Verify by comparing the two buffers using memcmp and exit with 0 if equal, 1 if not.",
        "solution": "section .bss\n    buf1 resb 100\n    buf2 resb 100\n\nsection .text\nglobal _start\n\n; memcmp function from 13.7.3\n; RDI=block1, RSI=block2, RDX=count.\n; Returns signed int in EAX: -1, 0, or 1. Callee-saved registers preserved.\nmemcmp:\n    cld\n    test rdx, rdx\n    jz .equal\n    mov rcx, rdx\n    repe cmpsb\n    je .equal\n    movzx eax, byte [rdi-1]\n    movzx ecx, byte [rsi-1]\n    cmp eax, ecx\n    jb .less\n    mov eax, 1\n    ret\n.less:\n    mov eax, -1\n    ret\n.equal:\n    xor eax, eax\n    ret\n\n_start:\n    ; fill buf1 with 0xAA\n    lea rdi, [buf1]\n    mov al, 0xAA\n    mov rcx, 100\n    cld\n    rep stosb\n\n    ; copy buf1 to buf2\n    lea rsi, [buf1]\n    lea rdi, [buf2]\n    mov rcx, 100\n    cld\n    rep movsb\n\n    ; compare\n    lea rdi, [buf1]\n    lea rsi, [buf2]\n    mov rdx, 100\n    call memcmp\n    ; if equal, eax=0, else nonzero\n    test eax, eax\n    jz .equal_buf\n    mov rdi, 1\n    jmp .exit\n.equal_buf:\n    mov rdi, 0\n.exit:\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "\n\nExpected exit status 0. The corrected comparison handles empty ranges and preserves callee-saved registers. Both buffers must contain all 100 bytes of 0xAA; equality alone could otherwise pass if both were incorrectly initialized."
      },
      {
        "id": "ex-13-4",
        "title": "Exercise 13.4: Nested Structures",
        "description": "Define a Line structure containing two Point structures. Write a procedure that computes the length (Euclidean distance) given a pointer to a Line. For simplicity, compute squared length and exit with that. Use integer coordinates.",
        "solution": "struc Point\n    .x: resd 1\n    .y: resd 1\nendstruc\n\nstruc Line\n    .p1: resb Point_size\n    .p2: resb Point_size\nendstruc\n\nsection .bss\n    line resb Line_size\n\nsection .text\nglobal _start\n_start:\n    lea rbx, [line]\n    ; p1 = (3, 4), p2 = (6, 8)\n    mov dword [rbx + Line.p1 + Point.x], 3\n    mov dword [rbx + Line.p1 + Point.y], 4\n    mov dword [rbx + Line.p2 + Point.x], 6\n    mov dword [rbx + Line.p2 + Point.y], 8\n\n    mov rdi, rbx\n    call line_length_squared\n    mov rdi, rax\n    mov rax, 60\n    syscall\n\n; RDI=Line pointer with signed 32-bit coordinates; RAX=squared length.\n; Require dx*dx+dy*dy to fit unsigned 64 bits.\nline_length_squared:\n    movsxd rax, dword [rdi+Line.p2+Point.x]\n    movsxd rcx, dword [rdi+Line.p1+Point.x]\n    sub rax, rcx\n    movsxd rdx, dword [rdi+Line.p2+Point.y]\n    movsxd rcx, dword [rdi+Line.p1+Point.y]\n    sub rdx, rcx\n    imul rax, rax\n    imul rdx, rdx\n    add rax, rdx\n    ret",
        "solutionLanguage": "nasm",
        "solutionExplanation": "\n\nExpected squared length 25 for points (3,4) and (6,8), exit status 25. The procedure sign-extends coordinates before subtracting, handles negative coordinates, and returns a 64-bit value. Extreme endpoint differences can overflow the final sum; no overflow detection is provided."
      },
      {
        "id": "ex-13-5",
        "title": "Exercise 13.5: Linked List Reversal",
        "description": "Given a singly linked list of nodes (value, next), reverse the list in place and sum the values to verify. Implement the reversal algorithm (iterative). Exit with the new head value.",
        "solution": "struc Node\n    .value: resq 1\n    .next:  resq 1\nendstruc\n\nsection .data\n    n1: dq 10, n2\n    n2: dq 20, n3\n    n3: dq 30, 0\n\nsection .text\nglobal _start\n_start:\n    lea rsi, [n1]      ; head\n    xor rax, rax       ; prev = NULL\nreverse_loop:\n    test rsi, rsi\n    jz done\n    mov rbx, [rsi + Node.next]   ; save next\n    mov [rsi + Node.next], rax   ; current->next = prev\n    mov rax, rsi                 ; prev = current\n    mov rsi, rbx                 ; current = saved next\n    jmp reverse_loop\ndone:\n    mov r8, rax       ; preserve new head\n    ; rax = new head (n3)\n    ; sum values from new head\n    mov rsi, rax\n    xor rcx, rcx\nsum_loop:\n    test rsi, rsi\n    jz exit\n    add rcx, [rsi + Node.value]\n    mov rsi, [rsi + Node.next]\n    jmp sum_loop\nexit:\n    ; rcx = 30+20+10 = 60\n    cmp rcx, 60\n    jne failure\n    lea rdx, [rel n3]\n    cmp r8, rdx\n    jne failure\n    lea rdx, [rel n2]\n    cmp [r8+Node.next], rdx\n    jne failure\n    lea rdx, [rel n1]\n    cmp [rel n2+Node.next], rdx\n    jne failure\n    cmp qword [rel n1+Node.next], 0\n    jne failure\n    mov rdi, [r8+Node.value]\n    mov rax, 60\n    syscall\nfailure:\n    mov edi, 1\n    mov eax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "\n\nExpected list is n3 -> n2 -> n1 -> NULL, sum 60, exit status 30 for the new head. The corrected program checks the links as well as the sum. It assumes the supplied nonempty, acyclic list; a reusable version should explicitly handle an empty head."
      }
    ],
    "practiceQuestions": [
      {
        "question": "How do you define a structure in NASM? Explain the struc macro.",
        "answer": "Use struc Point; .x: resd 1; .y: resd 1; endstruc on separate lines. It defines Point.x=0, Point.y=4, Point_size=8; it does not allocate an instance. Allocate resb Point_size or initialize with istruc/at/iend. Field alignment is explicit."
      },
      {
        "question": "Given a structure with members a (byte) and b (dword), what offsets would you expect if no padding is manually added? How does C ABI differ?",
        "answer": "Without padding, NASM places a at offset 0 and b at offset 1, for size 5. Under normal Linux x86-64 C layout, b is at offset 4, size is 8 and alignment is 4. Packing attributes can change the C layout."
      },
      {
        "question": "How do you access the field age of a structure instance pointed to by rbx?",
        "answer": "mov eax, [rbx + Student.age] reads the dword age. mov dword [rbx + Student.age], 22 writes it. Student.age is an offset; RBX must hold a valid instance address."
      },
      {
        "question": "How do you compute the address of the i-th element in an array of structures?",
        "answer": "imul rax, rcx, Student_size\nlea rax, [rbx+rax]\nHere RBX is the base and RCX is the zero-based index. Validate the index. Alternatively advance a pointer by Student_size after each record."
      },
      {
        "question": "What are the alignment rules for a structure containing a char, a short, and a long on x86-64? Show the layout with padding.",
        "answer": "Under Linux x86-64 System V LP64: char at 0, padding at 1, short at 2–3, padding at 4–7, long at 8–15. Size and stride are 16, alignment 8. Windows x64 uses a 4-byte long and has a different layout; x86-64 alone does not determine the C data model."
      },
      {
        "question": "How would you copy an entire structure from one memory location to another? Show two methods.",
        "answer": "For non-overlapping instances: lea rsi, [rel src]; lea rdi, [rel dst]; mov ecx, Student_size; cld; rep movsb. Alternatively use a byte loop that loads from source, stores to destination, advances both pointers and decrements a count. Both copy padding and pointer values; this is a shallow copy."
      },
      {
        "question": "What is the difference between memcpy and memmove? How would you implement memmove to handle overlap?",
        "answer": "memcpy requires non-overlapping ranges. memmove preserves the original source bytes with overlap: copy backward when destination starts above source but inside its range, otherwise forward. Check zero count before forming end pointers and clear DF after backward copying. The routine in 13.7.2 returns the original destination."
      },
      {
        "question": "In a linked list using structures, how do you access the next node’s value given a pointer to a node in rax?",
        "answer": "Test RAX for NULL before reading the current node. Load mov rdx, [rax+Node.next], then test RDX for NULL before mov rcx, [rdx+Node.value]. Each non-null pointer must identify a valid node."
      },
      {
        "question": "Why is it important to match C struct layout when interfacing assembly with C code?",
        "answer": "C and assembly must agree on member offsets, operand widths, alignment, total size and array stride; otherwise they read or overwrite different fields. Confirm with offsetof, sizeof and _Alignof for the target compiler and ABI. Padding bytes are not semantic field values."
      },
      {
        "question": "Write a snippet to set the next pointer of a node to NULL using structure offsets.",
        "answer": "mov qword [rax + Node.next], 0\nRAX must point to a writable Node. Specifying qword writes the complete eight-byte null pointer."
      }
    ],
    "summary": [
      "Structures are simulated using memory blocks and offsets; NASM’s struc macro defines offsets.",
      "Access members using base+offset addressing.",
      "Arrays of structures require multiplying the index by the structure size.",
      "Nested structures and pointers to structures allow complex data models.",
      "Alignment is crucial to match C ABI; use manual padding inside struc.",
      "Memory block operations can be implemented with rep movsb, rep stosb, rep cmpsb, or custom loops.",
      "Structures enable writing modular and maintainable assembly code for complex data.",
      "In the next chapter, we’ll explore floating-point and SIMD instructions, expanding beyond integer arithmetic.",
      "Clarifications: use explicit padding or ALIGNB for the chosen ABI, initialize records to the exact declared stride, guard empty comparisons, preserve callee-saved registers, and verify pointer links rather than relying only on sums."
    ]
  },
  {
    id: 14,
    slug: 'chapter-14-floating-point-simd',
    level: 3,
    levelTitle: 'Intermediate Assembly',
    title: 'Chapter 14: Floating-Point and SIMD Instructions',
    subtitle: 'IEEE 754 Representation, SSE XMM Registers, and Vector Math',
    learningObjectives: [
      'Understand IEEE 754 single and double-precision floating-point formats.',
      'Use SSE scalar instructions: movss, movsd, addss, addsd, sqrtss, sqrtsd.',
      'Process 4 floats or 2 doubles simultaneously with packed SIMD (addps, mulps).',
      'Perform horizontal vector sums and float array operations.',
      'Convert between integer and floating-point with cvtsi2ss and cvtss2si.'
    ],
    prerequisites: ['Chapters 1–13'],
    keyConcepts: [
      'SSE provides 16 128-bit XMM registers (xmm0–xmm15).',
      'Packed instructions operate on all lanes in parallel.',
      'movaps requires 16-byte memory alignment; movups allows unaligned memory access.'
    ],
    diagramType: 'simd_floating',
    sections: [
      {
        id: 'sec-14-1',
        title: '14.1 Vector Dot Product with Horizontal Sum',
        content: `Calculating dot product of two 4-float vectors in parallel using SSE:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'dot_product.asm',
            code: `section .data
    align 16
    vec1 dd 1.0, 2.0, 3.0, 4.0
    vec2 dd 5.0, 6.0, 7.0, 8.0

section .text
    global _start
_start:
    movaps xmm0, [vec1]
    movaps xmm1, [vec2]
    mulps xmm0, xmm1      ; [1*5, 2*6, 3*7, 4*8] = [5, 12, 21, 32]

    ; Horizontal sum using shufps
    movaps xmm1, xmm0
    shufps xmm1, xmm1, 0x4E   ; swap high and low 64-bit halves
    addps xmm0, xmm1
    movaps xmm1, xmm0
    shufps xmm1, xmm1, 0xB1   ; swap adjacent 32-bit words
    addps xmm0, xmm1          ; all 4 lanes now contain sum (70.0)

    cvtss2si eax, xmm0        ; convert to integer = 70
    mov rdi, rax
    mov rax, 60
    syscall`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-14-1',
        title: 'Exercise 14.1: Euclidean Distance in 2D',
        description: 'Compute sqrt((x2-x1)^2 + (y2-y1)^2) using scalar doubles (movsd, subsd, mulsd, addsd, sqrtsd).',
        solution: `movsd xmm0, [x2]\nsubsd xmm0, [x1]\nmulsd xmm0, xmm0\nmovsd xmm1, [y2]\nsubsd xmm1, [y1]\nmulsd xmm1, xmm1\naddsd xmm0, xmm1\nsqrtsd xmm0, xmm0`,
        solutionLanguage: 'nasm'
      }
    ],
    practiceQuestions: [
      {
        question: 'What is the difference between movaps and movups?',
        answer: 'movaps requires memory to be strictly aligned to a 16-byte boundary (crashes with a General Protection Fault if unaligned). movups handles unaligned memory at a minor performance cost.'
      }
    ],
    summary: ['SIMD provides massive speedups for graphics and scientific computation.', 'IEEE 754 floats use sign, exponent, and mantissa.']
  },
  {
    id: 15,
    slug: 'chapter-15-macros-modular-programming',
    level: 3,
    levelTitle: 'Intermediate Assembly',
    title: 'Chapter 15: Macros and Modular Programming',
    subtitle: 'Preprocessor Directives, Multi-Line Macros, Local Labels, and Include Headers',
    learningObjectives: [
      'Use single-line (%define) and multi-line (%macro/%endmacro) macros.',
      'Avoid duplicate label collisions using macro local labels (%%label).',
      'Implement conditional assembly (%ifdef, %ifndef, %if).',
      'Organize projects into reusable modules with .inc header files.'
    ],
    prerequisites: ['Chapters 1–14'],
    keyConcepts: [
      'Macros expand at assembly time, eliminating runtime function call overhead.',
      '%%label creates unique symbol names per expansion.',
      'Header files (.inc) share constants and extern prototypes across files.'
    ],
    diagramType: 'macros_modular',
    sections: [
      {
        id: 'sec-15-1',
        title: '15.1 Multi-Line Macro with Local Labels',
        content: `Creating a reusable loop macro that avoids symbol collision:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'macro_example.asm',
            code: `%macro sum_to_n 1   ; %1 = register containing n
    xor rax, rax
%%loop:
    add rax, %1
    dec %1
    jnz %%loop
%endmacro

section .text
    global _start
_start:
    mov rcx, 10
    sum_to_n rcx        ; expands with unique %%loop label, rax = 55
    mov rdi, rax
    mov rax, 60
    syscall`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-15-1',
        title: 'Exercise 15.1: Write a String Syscall Macro',
        description: 'Define write_string str, len macro that sets rax=1, rdi=1, rsi=str, rdx=len, and executes syscall.',
        solution: `%macro write_string 2\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, %1\n    mov rdx, %2\n    syscall\n%endmacro`,
        solutionLanguage: 'nasm'
      }
    ],
    practiceQuestions: [
      {
        question: 'When should you use a macro versus a procedure?',
        answer: 'Use macros for small, repetitive instruction patterns or where avoiding call/ret overhead is critical. Use procedures when the routine is large or reused frequently to minimize executable binary size.'
      }
    ],
    summary: ['Macros provide code reuse without runtime call overhead.', 'Conditional assembly enables build configurations and debug toggles.']
  },
  {
    id: 16,
    slug: 'chapter-16-system-calls-os-interaction',
    level: 3,
    levelTitle: 'Intermediate Assembly',
    title: 'Chapter 16: System Calls and Interaction with the OS',
    subtitle: 'File I/O, Heap Management (brk, mmap), and Error Codes (errno)',
    learningObjectives: [
      'Understand the Linux x86-64 syscall convention: rax, rdi, rsi, rdx, r10, r8, r9.',
      'Perform file I/O: open, read, write, close, lseek.',
      'Inspect error returns (negative rax represents -errno).',
      'Allocate memory with brk and anonymous mmap.'
    ],
    prerequisites: ['Chapters 1–15'],
    keyConcepts: [
      'syscall switches the CPU to Ring 0 kernel mode and clobbers rcx and r11.',
      'The 4th argument uses r10 instead of rcx.',
      'Return values in range [-4095, -1] indicate negative errno.'
    ],
    diagramType: 'syscalls_os',
    sections: [
      {
        id: 'sec-16-1',
        title: '16.1 Complete File Copy with Direct Syscalls',
        content: `Copying input.txt to output.txt using raw Linux system calls:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'file_copy.asm',
            code: `section .data
    in_file  db 'input.txt', 0
    out_file db 'output.txt', 0
    buf times 4096 db 0

section .text
    global _start
_start:
    ; open input (O_RDONLY = 0)
    mov rax, 2
    lea rdi, [in_file]
    xor rsi, rsi
    syscall
    mov r12, rax          ; in_fd

    ; open output (O_WRONLY|O_CREAT|O_TRUNC = 0x241, mode = 0644o)
    mov rax, 2
    lea rdi, [out_file]
    mov rsi, 577
    mov rdx, 0644o
    syscall
    mov r13, rax          ; out_fd

.copy_loop:
    mov rax, 0            ; sys_read
    mov rdi, r12
    lea rsi, [buf]
    mov rdx, 4096
    syscall
    test rax, rax
    jle .done

    mov rdx, rax          ; byte count
    mov rax, 1            ; sys_write
    mov rdi, r13
    lea rsi, [buf]
    syscall
    jmp .copy_loop

.done:
    ; close fds
    mov rax, 3; mov rdi, r12; syscall
    mov rax, 3; mov rdi, r13; syscall
    mov rax, 60; xor rdi, rdi; syscall`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-16-1',
        title: 'Exercise 16.1: Query Current Process ID',
        description: 'Invoke getpid (syscall 39) and return PID as exit status.',
        solution: `mov rax, 39\nsyscall\nmov rdi, rax\nmov rax, 60\nsyscall`,
        solutionLanguage: 'nasm'
      }
    ],
    practiceQuestions: [
      {
        question: 'Why does the 4th argument in Linux x86-64 syscalls use r10 instead of rcx?',
        answer: 'Because the CPU syscall hardware instruction automatically uses rcx to store the return instruction pointer (RIP) during the user-to-kernel transition, clobbering rcx.'
      }
    ],
    summary: ['System calls provide controlled access to OS services.', 'Check for negative rax return values to detect error codes.']
  },
  {
    id: 17,
    slug: 'chapter-17-debugging-gdb-tools',
    level: 3,
    levelTitle: 'Intermediate Assembly',
    title: 'Chapter 17: Debugging with GDB and Other Tools',
    subtitle: 'Breakpoints, Stepping, Memory Inspection, TUI Mode, and Tracing Tools',
    learningObjectives: [
      'Assemble with -g for source-level debugging symbols.',
      'Use GDB to inspect registers, memory (x/nfu), and stack frames.',
      'Set breakpoints, watchpoints, and step single instructions (stepi, nexti).',
      'Use GDB TUI mode for split-screen visual debugging.',
      'Trace execution with objdump, strace, ltrace, and valgrind.'
    ],
    prerequisites: ['Chapters 1–16'],
    keyConcepts: [
      'x/nfu examines memory with custom unit sizes and formats.',
      'stepi executes one machine instruction, entering function calls; nexti steps over.',
      'strace displays all operating system syscall interactions.'
    ],
    diagramType: 'gdb_debugging',
    sections: [
      {
        id: 'sec-17-1',
        title: '17.1 Essential GDB Commands & Memory Inspection',
        content: `GDB commands for low-level assembly debugging:
• break *0x400080: Break at exact memory address
• stepi / nexti: Step one machine instruction
• info registers (i r): Show all general purpose registers
• x/8bx $rsp: Print 8 bytes in hexadecimal from the top of the stack
• x/4gx $rsp: Print 4 64-bit quadwords from the top of the stack
• x/i $rip: Disassemble instruction at current instruction pointer
• layout asm: Enter GDB Text User Interface (TUI) assembly screen`
      }
    ],
    exercises: [
      {
        id: 'ex-17-1',
        title: 'Exercise 17.1: Debugging a Buggy String Length',
        description: 'Assemble buggy program with -g and step through with GDB to identify why length is truncated.',
        solution: 'gdb ./buggy -> break _start -> run -> stepi -> examine $rdx and $rsi with x/s $rsi.',
        solutionLanguage: 'gdb'
      }
    ],
    practiceQuestions: [
      {
        question: 'What is the difference between stepi and nexti in GDB?',
        answer: 'stepi executes a single machine instruction, following execution into any function called by call. nexti executes the entire call as a single step and pauses at the instruction following return.'
      }
    ],
    summary: ['GDB provides total visibility into CPU registers and memory.', 'strace intercepts and prints system call parameters at runtime.']
  }
];
