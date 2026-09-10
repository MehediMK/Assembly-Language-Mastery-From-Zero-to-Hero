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
    "id": 14,
    "slug": "chapter-14-floating-point-simd",
    "level": 3,
    "levelTitle": "Intermediate Assembly",
    "title": "Chapter 14: Floating-Point and SIMD Instructions",
    "subtitle": "IEEE 754 Representation, SSE XMM Registers, and Vector Math",
    "learningObjectives": [
      "Understand how floating-point numbers are represented and stored in x86-64.",
      "Learn the SSE (Streaming SIMD Extensions) register set and data types.",
      "Master scalar floating-point instructions for single-precision (float) and double-precision (double).",
      "Explore packed SIMD instructions to operate on multiple data elements simultaneously.",
      "Understand alignment requirements and performance implications for SIMD.",
      "Write programs that use SSE to perform arithmetic, comparisons, and vector operations.",
      "Apply SIMD to accelerate array and matrix computations."
    ],
    "prerequisites": [
      "Solid understanding of integer instructions, registers, and memory addressing (Chapters 2–7).",
      "Familiarity with procedures, calling conventions, and the stack (Chapter 10).",
      "Basic knowledge of arrays and memory operations (Chapter 9).",
      "Some familiarity with the IEEE 754 floating-point standard (conceptual)."
    ],
    "keyConcepts": [
      "SSE is a set of SIMD instructions that operate on 128-bit registers (xmm0–xmm15).",
      "Scalar instructions operate on the low 32 or 64 bits of an xmm register; packed instructions operate on all elements simultaneously.",
      "Floating-point data sizes: single-precision (4 bytes, float) and double-precision (8 bytes, double).",
      "Data movement: movss, movsd (scalar), movaps, movups (packed aligned/unaligned), movdqa, movdqu (integer packed).",
      "Arithmetic: addss, addps, addsd, addpd, etc.",
      "Conversions between integer and floating-point: cvtsi2ss, cvtss2si, etc.",
      "Alignment: packed loads/stores can be aligned (movaps, movdqa) or unaligned (movups, movdqu). Unaligned is slower.",
      "The System V AMD64 ABI passes floating-point arguments in xmm0–xmm7 and returns in xmm0.",
      "Clarifications: CVT-to-integer follows MXCSR rounding; CVTT truncates. Some named instructions require SSE4.1. Unaligned-capable moves are not inherently slower; full-width access and alignment must both be valid."
    ],
    "diagramType": "simd_floating",
    "sections": [
      {
        "id": "sec-14-1",
        "title": "14.1 Introduction to Floating-Point and SIMD",
        "content": "Modern CPUs have dedicated hardware for floating-point arithmetic and vector processing. In x86-64, the legacy x87 FPU has been superseded by the SSE (Streaming SIMD Extensions) family, which provides a clean set of registers and instructions for both scalar and packed (SIMD) floating-point operations.\n\nWhy SIMD?\n- Single Instruction, Multiple Data: One instruction can perform the same operation on multiple data elements, accelerating loops and vector math.\n- Used extensively in graphics, scientific computing, digital signal processing, and machine learning.\n\nIn this chapter, we focus on SSE and SSE2, which are guaranteed on x86-64. AVX (Advanced Vector Extensions) provides wider registers (256/512 bits) but is beyond our scope.\n\nClarification: The runnable examples use SSE/SSE2, available in the normal x86-64 environment. BLENDPS/BLENDPD and ROUNDSS mentioned later require SSE4.1 and must not be assumed from SSE2 support. AVX adds 256-bit YMM operations; 512-bit ZMM operations belong to AVX-512 and require additional CPU/OS support. x87 still exists, including ABI uses for extended-precision long double."
      },
      {
        "id": "sec-14-2",
        "title": "14.2 Floating-Point Representation",
        "content": "Floating-point numbers in x86 follow the IEEE 754 standard. The two most common formats are:\n\n- Single precision (float): 32 bits total = 1 sign bit + 8 exponent bits + 23 fraction bits.\n- Double precision (double): 64 bits total = 1 sign bit + 11 exponent bits + 52 fraction bits.\n\nThe value is computed as: (-1)^sign × 1.fraction × 2^(exponent - bias).\n\nIn assembly, we can define floating-point constants using dd (for single) or dq (for double) and let the assembler convert decimal notation to IEEE 754 format.\n\nExamples:\n\nClarification: The displayed formula applies to normal finite values, with exponent bias 127 for binary32 and 1023 for binary64. Exponent zero encodes signed zero or subnormals, which use a leading 0 and exponent 1-bias. An all-ones exponent encodes infinity when the fraction is zero and NaN otherwise. Normal significand precision is 24 or 53 bits including the implicit leading bit. Many decimal values, including 1.8, are approximations in binary. NASM dd 1 encodes integer bits, whereas dd 1.0 encodes a float.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "14.2 Floating-Point Representation — listing 1",
            "code": "section .data\n    pi  dd 3.14159          ; single precision\n    e   dq 2.718281828      ; double precision"
          }
        ]
      },
      {
        "id": "sec-14-3",
        "title": "14.3 SSE Registers and Data Types",
        "content": "SSE introduces eight (or sixteen in 64-bit mode) 128-bit registers named xmm0 through xmm15. Each register can hold:\n\n- 4 single-precision floats (4 × 32 bits)\n- 2 double-precision doubles (2 × 64 bits)\n- 16 bytes (for integer SIMD)\n- 8 words, 4 dwords, etc.\n\nThe low 32 or 64 bits are used for scalar operations; the full 128 bits for packed operations.\n\nDiagram of an XMM register with packed single-precision floats:\n\nClarification: Lane 0 is bits 31:0, lane 1 bits 63:32, lane 2 bits 95:64, lane 3 bits 127:96. Upper-bit behavior depends on the instruction form. Legacy scalar arithmetic preserves upper XMM bits; legacy MOVSS/MOVSD from memory zero the unused high XMM bits, while register-to-register forms preserve them. VEX forms have different rules.",
        "codeSnippets": [
          {
            "language": "text",
            "title": "14.3 SSE Registers and Data Types — listing 1",
            "code": "[  127  ][  96  ][  95  ][  64  ][  63  ][  32  ][  31  ][  0  ]\n|  float3 |  float2 |  float1 |  float0 |",
            "explanation": "For scalar double, only the low 64 bits are used; the upper bits are left unchanged unless explicitly zeroed."
          }
        ]
      },
      {
        "id": "sec-14-4",
        "title": "14.4 Scalar Floating-Point Instructions",
        "content": "Scalar instructions operate on the low element of an xmm register (32-bit for single, 64-bit for double). They are similar to integer instructions but use ss (scalar single) or sd (scalar double) suffixes."
      },
      {
        "id": "sec-14-4-1",
        "title": "14.4.1 Data Movement",
        "content": "- movss xmm1, xmm2/m32 – copy 32-bit float from source to low 32 bits of dest.\n- movsd xmm1, xmm2/m64 – copy 64-bit double.\n\nTo load from memory or store to memory:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "14.4.1 Data Movement — listing 1",
            "code": "movss xmm0, [pi]      ; load single float\nmovsd xmm1, [e]       ; load double\nmovss [result], xmm0  ; store single"
          }
        ]
      },
      {
        "id": "sec-14-4-2",
        "title": "14.4.2 Arithmetic Instructions",
        "content": "Common scalar arithmetic instructions (source can be register or memory):\n\n\n\nThese instructions do not affect the integer flags; they update the MXCSR register for floating-point exceptions.\n\nExample: Compute hypotenuse (sqrt(a² + b²)) using scalar doubles:\n\nClarification: Arithmetic leaves integer RFLAGS unchanged but can set MXCSR exception-status bits. MXCSR also controls rounding and exception masks; unmasked exceptions can trap. Floating-point addition is not associative, so a SIMD reduction can differ from a scalar left-to-right sum. Straight squaring can overflow or underflow for extreme values even when the final distance is representable.",
        "tableData": {
          "headers": [
            "Instruction",
            "Operation"
          ],
          "rows": [
            [
              "addss",
              "dest = dest + src (single)"
            ],
            [
              "addsd",
              "dest = dest + src (double)"
            ],
            [
              "subss",
              "subtraction"
            ],
            [
              "subsd",
              "subtraction"
            ],
            [
              "mulss",
              "multiplication"
            ],
            [
              "mulsd",
              "multiplication"
            ],
            [
              "divss",
              "division"
            ],
            [
              "divsd",
              "division"
            ],
            [
              "sqrtss",
              "square root (single)"
            ],
            [
              "sqrtsd",
              "square root (double)"
            ],
            [
              "minss",
              "minimum"
            ],
            [
              "maxss",
              "maximum"
            ]
          ]
        },
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "14.4.2 Arithmetic Instructions — listing 1",
            "code": "section .data\n    a dq 3.0\n    b dq 4.0\nsection .text\nglobal _start\n_start:\n    movsd xmm0, [a]      ; xmm0 = a\n    mulsd xmm0, xmm0     ; a²\n    movsd xmm1, [b]\n    mulsd xmm1, xmm1     ; b²\n    addsd xmm0, xmm1     ; a² + b²\n    sqrtsd xmm0, xmm0    ; sqrt\n    ; result = 5.0 in xmm0\n    ; Convert to integer for exit\n    cvtsd2si eax, xmm0   ; eax = 5\n    mov rdi, rax\n    mov rax, 60\n    syscall"
          }
        ]
      },
      {
        "id": "sec-14-4-3",
        "title": "14.4.3 Conversions",
        "content": "To move between integer registers and xmm registers, use conversion instructions:\n\n- cvtsi2ss xmm, reg/mem – convert signed integer to single float.\n- cvtsi2sd xmm, reg/mem – convert signed integer to double.\n- cvtss2si reg, xmm/m32 – convert single float to signed integer (truncate).\n- cvtsd2si reg, xmm/m64 – convert double to signed integer.\n- cvtss2sd xmm1, xmm2/m32 – convert single to double.\n- cvtsd2ss xmm1, xmm2/m64 – convert double to single.\n\nExample: Convert integer 10 to double, add 0.5, convert back to integer (round to nearest?).\n\nClarification: CVTSS2SI/CVTSD2SI obey MXCSR rounding control; they do not always truncate. Default round-to-nearest, ties-to-even maps 10.5 to 10 and 11.5 to 12. CVTTSS2SI/CVTTSD2SI always truncate toward zero. NaN or a value outside the signed destination range raises invalid; when masked the result is the integer-indefinite bit pattern. Choose 32- or 64-bit destination size deliberately. ROUNDSS requires SSE4.1. Reference: https://www.intel.com/content/dam/www/public/us/en/documents/manuals/64-ia-32-architectures-software-developer-vol-2a-manual.pdf",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "14.4.3 Conversions — listing 1",
            "code": "mov eax, 10\ncvtsi2sd xmm0, eax     ; xmm0 = 10.0\nmovsd xmm1, [point_five] ; 0.5\naddsd xmm0, xmm1       ; 10.5\ncvtsd2si eax, xmm0     ; eax = 10 (truncation)",
            "explanation": "Note: cvt*2si truncates toward zero; for rounding use cvtss2si with a rounding mode in MXCSR, or roundss if available."
          },
          {
            "language": "nasm",
            "title": "Runnable rounding versus truncation",
            "code": "section .data\n    value dq 11.5\n    nearest dd 0x1f80\nsection .bss\n    saved_mxcsr resd 1\nsection .text\nglobal _start\n_start:\n    stmxcsr [saved_mxcsr]\n    ldmxcsr [nearest]      ; nearest-even, exceptions masked\n    movsd xmm0, [value]\n    cvtsd2si eax, xmm0     ; 12\n    cvttsd2si ecx, xmm0    ; 11\n    ldmxcsr [saved_mxcsr]\n    cmp eax, 12\n    jne .failed\n    cmp ecx, 11\n    jne .failed\n    xor edi, edi\n    jmp .exit\n.failed:\n    mov edi, 1\n.exit:\n    mov eax, 60\n    syscall",
            "explanation": "Exits 0 when both results match. MXCSR is restored after the demonstration; library functions must preserve its control bits."
          }
        ]
      },
      {
        "id": "sec-14-5",
        "title": "14.5 Packed SIMD Instructions",
        "content": "Packed instructions operate on all elements in an xmm register simultaneously. They use ps (packed single) or pd (packed double) suffixes."
      },
      {
        "id": "sec-14-5-1",
        "title": "14.5.1 Data Movement",
        "content": "- movaps xmm1, xmm2/m128 – move aligned packed single-precision (4 floats).\n- movups xmm1, xmm2/m128 – move unaligned packed single.\n- movapd / movupd – for packed double.\n- movdqa / movdqu – for packed integer (128 bits).\n\nAlignment: movaps and movdqa require 16-byte aligned memory addresses; movups and movdqu work on unaligned but may be slower. Use align 16 in .data/.bss to align data.\n\nClarification: The alignment requirement applies to the memory operand, not a register-to-register move. A 128-bit load still accesses all 16 bytes even if only one lane is later used. MOVUPS/MOVUPD allow unaligned addresses but cannot read beyond accessible storage. Use alignb 16 for padding reserved BSS storage."
      },
      {
        "id": "sec-14-5-2",
        "title": "14.5.2 Packed Arithmetic",
        "content": "Example: Vector addition of four floats",
        "tableData": {
          "headers": [
            "Instruction",
            "Operation"
          ],
          "rows": [
            [
              "addps / addpd",
              "packed addition"
            ],
            [
              "subps / subpd",
              "packed subtraction"
            ],
            [
              "mulps / mulpd",
              "packed multiplication"
            ],
            [
              "divps / divpd",
              "packed division"
            ],
            [
              "sqrtps / sqrtpd",
              "packed square root"
            ],
            [
              "minps / maxps",
              "packed minimum / maximum"
            ]
          ]
        },
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "14.5.2 Packed Arithmetic — listing 1",
            "code": "section .data\n    align 16\n    vec1 dd 1.0, 2.0, 3.0, 4.0\n    vec2 dd 5.0, 6.0, 7.0, 8.0\n    result dd 0.0, 0.0, 0.0, 0.0\nsection .text\nglobal _start\n_start:\n    movaps xmm0, [vec1]   ; load 4 floats\n    movaps xmm1, [vec2]\n    addps xmm0, xmm1      ; xmm0 = vec1 + vec2\n    movaps [result], xmm0 ; store\n\n    ; Convert first element to integer for exit (6.0 -> 6)\n    movss xmm0, [result]\n    cvtss2si eax, xmm0\n    mov rdi, rax\n    mov rax, 60\n    syscall"
          }
        ]
      },
      {
        "id": "sec-14-5-3",
        "title": "14.5.3 Shuffles and Blends (Introduction)",
        "content": "SSE provides instructions to rearrange elements within registers:\n- shufps – shuffle packed single-precision floats.\n- shufpd – shuffle packed double.\n- unpcklps / unpckhps – interleave low/high elements.\n- blendps / blendpd – blend elements from two registers based on mask.\n\nThese are powerful but advanced; we'll touch on shufps for a simple example.\n\nExample: Replicate a single float across all four slots using shufps\n\nClarification: SHUFPS is SSE and SHUFPD is SSE2; BLENDPS/BLENDPD are SSE4.1. With legacy movss xmm0,[value], high XMM bits are zero before the shuffle, rather than unknown. Immediate zero selects lane 0 for every output lane when both operands are the same register.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "14.5.3 Shuffles and Blends (Introduction) — listing 1",
            "code": "movss xmm0, [value]   ; xmm0 = [v, ?, ?, ?]\nshufps xmm0, xmm0, 0  ; duplicate v into all 4 slots"
          }
        ]
      },
      {
        "id": "sec-14-6",
        "title": "14.6 Comparisons and Masking",
        "content": "SSE comparison instructions set all bits of an element to 1 (true) or 0 (false) based on the comparison. They do not affect integer flags.\n\n\n\nThe result is a mask that can be used with bitwise operations or to select values.\n\nExample: Select elements greater than a threshold using cmpps and andps\n\nClarification: CMPxxPS/PD produces all-one or all-zero bit masks, not floating-point 1.0 values. Ordered less-than is false for NaN; some predicates can raise invalid on NaNs, normally masked by MXCSR. CMPNEQ includes unordered cases. UCOMISS/UCOMISD are a different comparison family that does set integer flags; check parity for unordered before treating equality as numeric equality. MOVMSKPS extracts one sign bit per lane, with lane 0 mapped to bit 0.",
        "tableData": {
          "headers": [
            "Instruction",
            "Operation"
          ],
          "rows": [
            [
              "cmpeqss / cmpeqsd",
              "scalar equal"
            ],
            [
              "cmpltss / cmpltsd",
              "scalar less-than"
            ],
            [
              "cmpless / cmplesd",
              "scalar less-or-equal"
            ],
            [
              "cmpneqss etc.",
              "scalar not equal"
            ],
            [
              "cmpeqps / cmpeqpd",
              "packed equal"
            ],
            [
              "cmpltps / cmpltpd",
              "packed less-than"
            ]
          ]
        },
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Keep only elements > 2.0 in a vector",
            "code": "; Keep only elements > 2.0 in a vector\nmovaps xmm0, [vec]\nmovaps xmm1, [threshold]   ; threshold vector\ncmpltps xmm1, xmm0         ; xmm1 = mask (true where threshold < vec)\nandps xmm0, xmm1           ; zero out elements not meeting condition"
          }
        ]
      },
      {
        "id": "sec-14-7",
        "title": "14.7 Practical Examples",
        "content": ""
      },
      {
        "id": "sec-14-7-1",
        "title": "14.7.1 Dot Product of Two Vectors (Single Precision)",
        "content": "Compute dot product of two 4-element vectors: sum of element-wise products.\n\nClarification: The first shuffle selects lanes [2,3,0,1] in low-to-high order; the second selects [1,0,3,2]. The pairwise additions leave 70 in all four lanes for this input. Reduction order can change the rounding of non-exact sums.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "14.7.1 Dot Product of Two Vectors (Single Precision) — listing 1",
            "code": "section .data\n    align 16\n    vec1 dd 1.0, 2.0, 3.0, 4.0\n    vec2 dd 5.0, 6.0, 7.0, 8.0\nsection .text\nglobal _start\n_start:\n    movaps xmm0, [vec1]\n    movaps xmm1, [vec2]\n    mulps xmm0, xmm1      ; element-wise multiply\n\n    ; Horizontal sum of xmm0\n    ; Method: shuffle and add\n    movaps xmm1, xmm0\n    shufps xmm1, xmm1, 0x4E   ; swap high and low halves (bits: 01 00 11 10)\n    addps xmm0, xmm1\n    movaps xmm1, xmm0\n    shufps xmm1, xmm1, 0xB1   ; swap within halves (bits: 10 11 00 01)\n    addps xmm0, xmm1\n    ; Now all four elements contain the sum (1*5 + 2*6 + 3*7 + 4*8 = 70.0)\n    ; Extract to integer\n    cvtss2si eax, xmm0   ; eax = 70\n    mov rdi, rax\n    mov rax, 60\n    syscall"
          }
        ]
      },
      {
        "id": "sec-14-7-2",
        "title": "14.7.2 Array Multiplication by Scalar",
        "content": "Multiply an array of floats by a scalar.\n\nClarification: The original loop assumes a positive length divisible by four and aligned full vectors. A zero chunk count still enters the loop, and remainder elements are ignored. The general routine below checks the count, processes only complete vectors, and finishes with scalar loads/stores. Source and destination must cover count floats and be disjoint or exactly identical.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "14.7.2 Array Multiplication by Scalar — listing 1",
            "code": "section .data\n    align 16\n    array dd 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0\n    len equ 8\n    scalar dd 2.0\nsection .bss\n    align 16\n    result resd 8\n\nsection .text\nglobal _start\n_start:\n    ; Broadcast scalar to all four slots\n    movss xmm2, [scalar]\n    shufps xmm2, xmm2, 0\n\n    ; Process in chunks of 4\n    lea rsi, [array]\n    lea rdi, [result]\n    mov rcx, len / 4\n.loop:\n    movaps xmm0, [rsi]      ; load 4 floats\n    mulps xmm0, xmm2        ; multiply by scalar\n    movaps [rdi], xmm0      ; store\n    add rsi, 16\n    add rdi, 16\n    dec rcx\n    jnz .loop\n\n    ; Exit with first element (2.0 -> 2)\n    movss xmm0, [result]\n    cvtss2si eax, xmm0\n    mov rdi, rax\n    mov rax, 60\n    syscall"
          },
          {
            "language": "nasm",
            "title": "General float scaling with scalar tail",
            "code": "; RDI=destination, RSI=source, RDX=float count, XMM0.low=scalar.\n; Supports unaligned arrays, zero length, tails, and exact in-place use.\nscale_floats:\n    shufps xmm0, xmm0, 0\n    mov rcx, rdx\n    shr rcx, 2\n    jz .tail\n.vector:\n    movups xmm1, [rsi]\n    mulps xmm1, xmm0\n    movups [rdi], xmm1\n    add rsi, 16\n    add rdi, 16\n    dec rcx\n    jnz .vector\n.tail:\n    and edx, 3\n    jz .done\n.scalar:\n    movss xmm1, [rsi]\n    mulss xmm1, xmm0\n    movss [rdi], xmm1\n    add rsi, 4\n    add rdi, 4\n    dec edx\n    jnz .scalar\n.done:\n    ret",
            "explanation": "Uses only SSE instructions and caller-saved registers. Count zero performs no memory access. Partial overlap is not supported. For a function call, align RSP beforehand as in Chapter 10."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 14.3",
            "code": "section .data\n    align 16\n    array dq 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0\n    len equ 8\n    scalar dq 2.5\nsection .bss\n    align 16\n    result resq 8\nsection .text\nglobal _start\n_start:\n    ; Process in pairs using packed doubles (2 per iteration)\n    movapd xmm2, [scalar] ; actually scalar needs to be broadcast to both slots\n    ; scalar dq 2.5, need to duplicate to high half\n    movapd xmm2, [scalar] ; if scalar is just one double, high half is undefined; better define scalar as dq 2.5, 2.5\n    ; We'll redefine scalar as two doubles in .data for simplicity\n    ; (Alternatively use shufpd)\n    ; For solution, assume scalar2 dq 2.5, 2.5\n    movapd xmm2, [scalar2]\n\n    lea rsi, [array]\n    lea rdi, [result]\n    mov rcx, len / 2\n.loop:\n    movapd xmm0, [rsi]   ; load 2 doubles\n    mulpd xmm0, xmm2     ; multiply\n    movapd [rdi], xmm0\n    add rsi, 16\n    add rdi, 16\n    dec rcx\n    jnz .loop\n\n    ; Exit with first result (2.5 -> truncates to 2)\n    movsd xmm0, [result]\n    cvtsd2si eax, xmm0\n    mov rdi, rax\n    mov rax, 60\n    syscall\n\nsection .data\n    scalar2 dq 2.5, 2.5",
            "explanation": "Original retained for comparison; use the corrected interactive exercise solution. The double-scalar loads read beyond one scalar, and scalar2 is not 16-byte aligned."
          }
        ]
      },
      {
        "id": "sec-14-7-3",
        "title": "14.7.3 Distance Between Two Points (Scalar Double)",
        "content": "Compute Euclidean distance: sqrt((x2-x1)^2 + (y2-y1)^2).",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "14.7.3 Distance Between Two Points (Scalar Double) — listing 1",
            "code": "section .data\n    p1x dq 1.0\n    p1y dq 2.0\n    p2x dq 4.0\n    p2y dq 6.0\nsection .text\nglobal _start\n_start:\n    movsd xmm0, [p2x]\n    subsd xmm0, [p1x]      ; dx\n    mulsd xmm0, xmm0\n    movsd xmm1, [p2y]\n    subsd xmm1, [p1y]      ; dy\n    mulsd xmm1, xmm1\n    addsd xmm0, xmm1\n    sqrtsd xmm0, xmm0\n    cvtsd2si eax, xmm0     ; sqrt(9+16)=5\n    mov rdi, rax\n    mov rax, 60\n    syscall"
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 14.5",
            "code": "section .data\n    align 16\n    celsius dd 0.0, 10.0, 20.0, 30.0\n    factor dd 1.8, 1.8, 1.8, 1.8   ; 9/5 = 1.8\n    addend dd 32.0, 32.0, 32.0, 32.0\nsection .bss\n    align 16\n    fahrenheit resd 4\nsection .text\nglobal _start\n_start:\n    movaps xmm0, [celsius]\n    movaps xmm1, [factor]\n    mulps xmm0, xmm1      ; C * 1.8\n    movaps xmm2, [addend]\n    addps xmm0, xmm2      ; + 32\n    movaps [fahrenheit], xmm0\n\n    ; First value: 0*1.8+32 = 32\n    movss xmm0, [fahrenheit]\n    cvtss2si eax, xmm0\n    mov rdi, rax\n    mov rax, 60\n    syscall",
            "explanation": "Original retained for comparison; use the corrected interactive exercise solution. CVTSS2SI rounds according to MXCSR; the exercise explicitly requests truncation."
          }
        ]
      },
      {
        "id": "sec-14-8",
        "title": "14.8 Alignment and Performance",
        "content": "SIMD instructions benefit greatly from aligned data. When data is 16-byte aligned, movaps/movdqa are faster than unaligned counterparts. The stack should also be 16-byte aligned (already required by ABI).\n\nTo align data in .data/.bss, use the align directive:\n\nClarification: Aligned moves are not universally faster than unaligned-capable moves on modern CPUs; cache-line/page splits and the particular CPU matter. Misaligned MOVAPS/MOVAPD can fault, so alignment is first a correctness requirement. RSP is 16-byte aligned before CALL and 8 modulo 16 at callee entry: allocate or push appropriately before using an aligned stack slot. If adjusting an allocated pointer, reserve sufficient extra space and retain the original pointer for deallocation. Use scalar tails rather than reading a full vector beyond an array.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "14.8 Alignment and Performance — listing 1",
            "code": "section .data\n    align 16\n    my_vector dd 1.0, 2.0, 3.0, 4.0",
            "explanation": "In .bss, similarly:"
          },
          {
            "language": "nasm",
            "title": "14.8 Alignment and Performance — listing 2",
            "code": "section .bss\n    align 16\n    buffer resb 64",
            "explanation": "For dynamically allocated memory, use posix_memalign or allocate extra and adjust pointer manually.\n\nPerformance tips:\n- Process data in chunks of 4 (single) or 2 (double) to fill the XMM register.\n- Use aligned loads/stores whenever possible.\n- Minimize data dependencies and use multiple XMM registers to hide latency.\n- Compilers auto-vectorize loops, but hand-coded assembly can sometimes do better."
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-14-1",
        "title": "Exercise 14.1: Sum of Squares (Scalar)",
        "description": "Write a program that computes the sum of squares of two doubles (e.g., 3.0 and 4.0) using scalar SSE instructions. Exit with the integer result (25).",
        "solution": "section .data\n    a dq 3.0\n    b dq 4.0\nsection .text\nglobal _start\n_start:\n    movsd xmm0, [a]\n    mulsd xmm0, xmm0      ; a²\n    movsd xmm1, [b]\n    mulsd xmm1, xmm1      ; b²\n    addsd xmm0, xmm1      ; 9+16=25\n    cvtsd2si eax, xmm0    ; eax = 25\n    mov rdi, rax\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "\n\nExpected exit status: 25. Both squares and their sum are exact for these inputs. Converting other fractional results with CVTSD2SI follows MXCSR; use CVTTSD2SI if truncation is required."
      },
      {
        "id": "ex-14-2",
        "title": "Exercise 14.2: Vector Addition and Horizontal Sum",
        "description": "Given two arrays of 4 floats each, compute their element-wise sum, then compute the sum of all elements in the result vector. Exit with integer result.",
        "solution": "section .data\n    align 16\n    vec1 dd 1.0, 2.0, 3.0, 4.0\n    vec2 dd 5.0, 6.0, 7.0, 8.0\nsection .bss\n    align 16\n    result resd 4\nsection .text\nglobal _start\n_start:\n    movaps xmm0, [vec1]\n    movaps xmm1, [vec2]\n    addps xmm0, xmm1      ; xmm0 = [6,8,10,12]\n    movaps [result], xmm0\n\n    ; Horizontal sum\n    movaps xmm1, xmm0\n    shufps xmm1, xmm1, 0x4E\n    addps xmm0, xmm1\n    movaps xmm1, xmm0\n    shufps xmm1, xmm1, 0xB1\n    addps xmm0, xmm1\n    ; all elements = 36\n    cvtss2si eax, xmm0    ; eax = 36\n    mov rdi, rax\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "\n\nExpected stored lanes: 6, 8, 10, 12. The horizontal sum is 36, giving exit status 36. The source reserves a full aligned 16-byte result; verify all lanes as well as the sum."
      },
      {
        "id": "ex-14-3",
        "title": "Exercise 14.3: Scalar Multiplication of Array",
        "description": "Multiply an array of 8 doubles by a scalar double (2.5). Use a loop with scalar SSE instructions (or packed if you prefer). Exit with the first element as integer (truncated).",
        "solution": "section .data\n    align 16\n    array dq 1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0\n    len equ 8\n    scalar dq 2.5\nsection .bss\n    align 16\n    result resq 8\nsection .text\nglobal _start\n_start:\n    ; Load exactly one double, then broadcast safely.\n    movsd xmm2, [scalar]\n    unpcklpd xmm2, xmm2\n\n    lea rsi, [array]\n    lea rdi, [result]\n    mov rcx, len / 2\n.loop:\n    movapd xmm0, [rsi]   ; load 2 doubles\n    mulpd xmm0, xmm2     ; multiply\n    movapd [rdi], xmm0\n    add rsi, 16\n    add rdi, 16\n    dec rcx\n    jnz .loop\n\n    ; Exit with first result (2.5 -> truncates to 2)\n    movsd xmm0, [result]\n    cvttsd2si eax, xmm0\n    mov rdi, rax\n    mov rax, 60\n    syscall\n",
        "solutionLanguage": "nasm",
        "solutionExplanation": "\n\nCorrected broadcast reads only the scalar double and duplicates it with UNPCKLPD. Expected results: 2.5, 5, 7.5, 10, 12.5, 15, 17.5, 20. CVTTSD2SI produces exit status 2 regardless of MXCSR rounding mode. This fixed example assumes exactly eight doubles; check zero count and process an odd tail when generalizing."
      },
      {
        "id": "ex-14-4",
        "title": "Exercise 14.4: Comparison Mask",
        "description": "Given an array of 4 floats and a threshold, count how many elements are greater than the threshold. Use packed comparison and bitwise operations to count bits. Exit with count.",
        "solution": "section .data\n    align 16\n    vec dd 1.0, 5.0, 3.0, 7.0\n    threshold dd 2.0, 2.0, 2.0, 2.0\nsection .text\nglobal _start\n_start:\n    movaps xmm0, [vec]\n    movaps xmm1, [threshold]\n    cmpltps xmm1, xmm0    ; mask: true where threshold < vec (i.e., vec > threshold)\n    ; Count set bits in each 32-bit element (number of elements > threshold)\n    ; Use movmskps to get top bits of each element into integer\n    movmskps eax, xmm1    ; eax bits 0..3 correspond to elements 0..3\n    ; Count set bits\n    xor ecx, ecx\ncount_bits:\n    test eax, eax\n    jz done\n    shr eax, 1\n    adc ecx, 0            ; add carry flag (set if bit was 1)\n    jmp count_bits\ndone:\n    ; ecx = number of elements > 2.0 = 3 (5,3,7)\n    mov rdi, rcx\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "\n\nExpected mask is binary 1110, since lanes 1, 2, and 3 exceed 2.0; exit status 3. MOVMSKPS extracts four bits, and the shift/ADC loop counts them without requiring POPCNT. Values equal to the threshold do not count."
      },
      {
        "id": "ex-14-5",
        "title": "Exercise 14.5: Convert Temperature",
        "description": "Convert an array of Celsius temperatures (floats) to Fahrenheit using formula F = C * 9/5 + 32. Use packed SSE instructions. Process 4 values at a time. Exit with the first Fahrenheit value (truncated to integer).",
        "solution": "section .data\n    align 16\n    celsius dd 0.0, 10.0, 20.0, 30.0\n    factor dd 1.8, 1.8, 1.8, 1.8   ; 9/5 = 1.8\n    addend dd 32.0, 32.0, 32.0, 32.0\nsection .bss\n    align 16\n    fahrenheit resd 4\nsection .text\nglobal _start\n_start:\n    movaps xmm0, [celsius]\n    movaps xmm1, [factor]\n    mulps xmm0, xmm1      ; C * 1.8\n    movaps xmm2, [addend]\n    addps xmm0, xmm2      ; + 32\n    movaps [fahrenheit], xmm0\n\n    ; First value: 0*1.8+32 = 32\n    movss xmm0, [fahrenheit]\n    cvttss2si eax, xmm0\n    mov rdi, rax\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "\n\nExpected Fahrenheit lanes for the supplied values: 32, 50, 68, 86; exit status 32. The corrected CVTTSS2SI explicitly truncates. Binary32 factor 1.8 is approximate, so other inputs can have rounding error. This example covers exactly four values; use a loop and scalar remainder for arbitrary lengths."
      }
    ],
    "practiceQuestions": [
      {
        "question": "What are the SSE registers, and how many are there in x86-64?",
        "answer": "XMM0 through XMM15 are sixteen 128-bit registers in 64-bit mode. They can hold four floats, two doubles, or packed integers; the same bits have no permanent type. Instructions determine how lanes are interpreted."
      },
      {
        "question": "Explain the difference between movss and movaps. When would you use each?",
        "answer": "MOVSS transfers one 32-bit float; MOVAPS transfers 128 bits, or four floats, and requires a 16-byte-aligned memory operand. Use MOVSS for one element, MOVAPS for aligned full vectors, and MOVUPS for unaligned full vectors. All loaded bytes must be accessible."
      },
      {
        "question": "How do you convert an integer to a double-precision float? Provide the instruction.",
        "answer": "cvtsi2sd xmm0, eax converts a signed 32-bit integer; cvtsi2sd xmm0, rax converts a signed 64-bit integer. movq xmm0, rax only copies bits and does not numerically convert. Large integers may round because a double has 53 bits of significand precision."
      },
      {
        "question": "What is the difference between addps and addpd? How many elements do they operate on?",
        "answer": "ADDPS adds four corresponding binary32 lanes in an XMM register. ADDPD adds two corresponding binary64 lanes. Neither performs a horizontal sum or changes integer flags."
      },
      {
        "question": "Why is alignment important for SIMD? What is the penalty for unaligned access?",
        "answer": "Aligned memory instructions require the specified boundary and can fault otherwise. Unaligned-capable moves need not be slower when data stays within a cache line; splits and CPU implementation affect cost. There is no single universal cycle penalty. Use ALIGN for initialized data and ALIGNB for BSS."
      },
      {
        "question": "Describe how you would compute the dot product of two 4-element vectors using SSE.",
        "answer": "Load both vectors with MOVAPS if aligned, multiply lanes with MULPS, then shuffle/add halves using SHUFPS immediate 0x4E and shuffle/add neighbors with 0xB1. For [1,2,3,4] and [5,6,7,8], the result is 70.0. Floating-point reduction order can affect rounding."
      },
      {
        "question": "How do you broadcast a single float to all four slots of an XMM register? Show the instructions.",
        "answer": "movss xmm0, [rel value]\nshufps xmm0, xmm0, 0\nThe low float is selected for all four output lanes. For one double use movsd followed by unpcklpd xmm0, xmm0."
      },
      {
        "question": "What is the purpose of shufps? Provide an example.",
        "answer": "SHUFPS selects lanes using four two-bit selectors in its immediate. shufps xmm0, xmm0, 0x4E changes [a,b,c,d] into [c,d,a,b] in low-to-high lane order. With distinct operands, the low two output lanes come from the old destination and the high two from the source."
      },
      {
        "question": "How are floating-point comparison results stored? How can you use them to mask data?",
        "answer": "Packed comparisons store all-one bits for true lanes and zeros for false lanes. ANDPS with a data vector keeps true lanes and turns false lanes into positive zero. MOVMSKPS extracts the sign bits as a four-bit integer mask. Handle NaNs according to the chosen predicate; scalar UCOMIS comparisons instead set integer flags."
      },
      {
        "question": "How do you pass floating-point arguments to a function according to the System V AMD64 ABI?",
        "answer": "Under System V AMD64, ordinary scalar float/double arguments use the low lanes of XMM0–XMM7, independently of the integer argument-register sequence; scalar float/double returns use XMM0. Further arguments and aggregate types follow ABI classification rules. XMM registers are caller-saved. Before a variadic call, AL describes vector-register usage (0–8); float arguments are promoted to double. Keep the call-site stack aligned."
      }
    ],
    "summary": [
      "SSE provides 128-bit xmm registers for scalar and packed floating-point operations.",
      "Scalar instructions (addss, addsd) operate on the low element; packed (addps, addpd) process all elements at once.",
      "Data movement must respect alignment: use movaps for aligned data, movups for unaligned.",
      "Conversions between integer and floating-point are done with cvt* instructions.",
      "SIMD enables significant speedups for vectorizable code.",
      "Understanding data layout and alignment is critical for performance.",
      "The System V ABI passes floating-point arguments in xmm0–xmm7.",
      "In the next chapter, we’ll explore macros and modular programming, which will help you write more maintainable and reusable assembly code.",
      "Use explicit truncation where requested, broadcast scalars without overreading, guard empty loops, process scalar tails, and distinguish required instruction support from optional extensions."
    ]
  },
  {
    "id": 15,
    "slug": "chapter-15-macros-modular-programming",
    "level": 3,
    "levelTitle": "Intermediate Assembly",
    "title": "Chapter 15: Macros and Modular Programming",
    "subtitle": "Preprocessor Directives, Multi-Line Macros, Local Labels, and Include Headers",
    "learningObjectives": [
      "Understand the purpose and benefits of macros in assembly language.",
      "Master single-line macros with %define and multi-line macros with %macro/%endmacro.",
      "Use macro parameters, default values, and local labels to avoid conflicts.",
      "Implement conditional assembly with %if, %ifdef, %ifndef, and related directives.",
      "Organize assembly projects into multiple source files and use include files for shared constants and macros.",
      "Link multiple object files into a single executable using ld or gcc.",
      "Apply modular programming principles to create maintainable and reusable assembly code."
    ],
    "prerequisites": [
      "Solid understanding of procedures, calling conventions, and the stack (Chapter 10).",
      "Familiarity with data movement, arithmetic, and control flow (Chapters 5–8).",
      "Knowledge of the build process, assembler, and linker (Chapter 4).",
      "Basic experience with arrays, structures, and memory operations (Chapters 9, 13)."
    ],
    "keyConcepts": [
      "Macros are preprocessor directives that perform text substitution before assembly. They can reduce code duplication and improve readability.",
      "Single-line macros (%define) are simple text replacements, similar to C #define.",
      "Multi-line macros (%macro/%endmacro) allow parameterized blocks of code with local labels.",
      "Conditional assembly (%if, %ifdef, %ifndef, %elif, %else, %endif) includes or excludes code based on symbols or expressions.",
      "Include files (%include) enable sharing constants, macros, and declarations across multiple source files.",
      "Modular programming involves splitting code into separate object files, each with a specific responsibility, and linking them together. Symbols are exported with global and imported with extern.",
      "Header files in assembly often contain constant definitions, structure definitions, and function declarations."
    ],
    "diagramType": "macros_modular",
    "sections": [
      {
        "id": "sec-15-1",
        "title": "15.1 Introduction to Macros",
        "content": "Macros are a powerful tool in assembly programming. They allow you to define a piece of code that can be reused multiple times with different parameters. Unlike procedures (which are called at runtime), macros are expanded at assembly time: the assembler replaces each macro invocation with the macro body, substituting parameters. This eliminates call overhead but can increase code size if used excessively.\n\nWhen to use macros:\n- To generate repetitive instruction sequences (e.g., saving/restoring multiple registers).\n- To define custom “instructions” that improve readability.\n- To conditionally include code based on build options.\n- To avoid magic numbers and centralize constants.\n\nWhen to use procedures instead:\n- When the code is large and reused many times (to save memory).\n- When recursion or runtime indirection is needed.\n- When code size is a concern.\n\nNASM provides two main macro mechanisms:\n- Single-line macros: %define, %assign, %undef\n- Multi-line macros: %macro / %endmacro\n\nThere are also conditional assembly directives (%if, %ifdef, etc.) and include directives (%include).\n\nClarification: Macro expansion happens during preprocessing; the generated instructions still execute at runtime. Macros do not automatically preserve registers, flags, or stack alignment. Inspect expansion with nasm -E program.asm and document inputs, outputs, clobbers, and allowed operand forms."
      },
      {
        "id": "sec-15-2",
        "title": "15.2 Single-Line Macros (%define)",
        "content": "%define creates a text substitution. Whenever the macro name appears, NASM replaces it with the macro's value before assembling.\n\nSyntax:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "15.2 Single-Line Macros (%define) — listing 1",
            "code": "%define name value",
            "explanation": "Examples:"
          },
          {
            "language": "nasm",
            "title": "15.2 Single-Line Macros (%define) — listing 2",
            "code": "%define NULL 0\n%define SYS_EXIT 60\n%define STDOUT 1\n\nsection .text\nglobal _start\n_start:\n    mov rax, SYS_EXIT\n    mov rdi, NULL\n    syscall",
            "explanation": "This replaces SYS_EXIT with 60 and NULL with 0 before assembly."
          }
        ]
      },
      {
        "id": "sec-15-2-1",
        "title": "15.2.1 Parameterized Single-Line Macros",
        "content": "%define can also take parameters, similar to functions in the preprocessor:\n\nClarification: The macro expands to SHL and therefore changes arithmetic flags and modifies its operand. Parameters are text, not typed function arguments; only operand forms accepted by the resulting instructions are valid.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "15.2.1 Parameterized Single-Line Macros — listing 1",
            "code": "%define mul_by_2(x)  shl x, 1\n\nsection .text\nglobal _start\n_start:\n    mov rax, 5\n    mul_by_2(rax)     ; expands to: shl rax, 1\n    ; rax = 10\n    mov rdi, rax\n    mov rax, 60\n    syscall",
            "explanation": "Parameters are substituted textually. Note that because it's simple text substitution, you must be careful with spaces and operator precedence. In this example, shl rax, 1 is fine."
          }
        ]
      },
      {
        "id": "sec-15-2-2",
        "title": "15.2.2 %assign and %undef",
        "content": "- %assign is like %define but evaluates the value as an arithmetic expression and stores it as a number.\n- %undef removes a macro definition.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "15.2.2 %assign and %undef — listing 1",
            "code": "%assign counter 10\n%assign counter counter+5   ; counter = 15\n%undef counter",
            "explanation": "%assign is useful for compile-time calculations."
          }
        ]
      },
      {
        "id": "sec-15-3",
        "title": "15.3 Multi-Line Macros (%macro / %endmacro)",
        "content": "Multi-line macros allow you to define a block of code that can span several lines and take parameters.\n\nSyntax:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "15.3 Multi-Line Macros (%macro / %endmacro) — listing 1",
            "code": "%macro name num_params\n    ; macro body\n%endmacro",
            "explanation": "Where num_params is the number of parameters (0 or more). Inside the macro body, parameters are referenced as %1, %2, etc., with %0 giving the number of arguments."
          }
        ]
      },
      {
        "id": "sec-15-3-1",
        "title": "15.3.1 Basic Example: Prologue/Epilogue",
        "content": "Define a macro to set up and tear down a stack frame:\n\nClarification: The prologue aligns RSP after a normal ABI call. Allocate locals in suitable multiples of 16 and account for any additional pushes before nested calls. The epilogue restores RBP but does not restore other saved registers automatically.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "15.3.1 Basic Example: Prologue/Epilogue — listing 1",
            "code": "%macro prologue 0\n    push rbp\n    mov rbp, rsp\n%endmacro\n\n%macro epilogue 0\n    mov rsp, rbp\n    pop rbp\n    ret\n%endmacro\n\n; Usage\nmy_func:\n    prologue\n    ; function body\n    epilogue"
          }
        ]
      },
      {
        "id": "sec-15-3-2",
        "title": "15.3.2 Macro with Parameters",
        "content": "Define a macro to save multiple registers:\n\nClarification: The first macro declaration accepts two to four arguments, but its body unconditionally uses four: absent operands produce invalid PUSH instructions. Guard optional operands or iterate over the actual argument count. Restore pushed registers in reverse order and count all pushes when aligning a call.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original source: optional arguments used unconditionally",
            "code": "%macro push_regs 2-4\n    push %1\n    push %2\n    push %3\n    push %4\n%endmacro",
            "explanation": "But this expects exactly 4 parameters; we can specify a range (minimum to maximum). For example, %macro push_regs 1-4 allows 1 to 4 arguments. Inside the macro, %0 contains the number of arguments actually passed. To handle variable arguments, you can use %rep loops within the macro.\n\nBetter: Use a macro to push a variable number of registers using %rep and %rotate or %rep with %0.\n\nExample: pushing any number of registers:"
          },
          {
            "language": "nasm",
            "title": "15.3.2 Macro with Parameters — listing 2",
            "code": "%macro push_regs 1-*\n    %rep %0\n        push %1\n        %rotate 1\n    %endrep\n%endmacro",
            "explanation": "This works but is advanced. For simplicity, we'll stick with fixed-arity macros."
          },
          {
            "language": "nasm",
            "title": "Corrected two-to-four register macro",
            "code": "%macro push_regs_checked 2-4\n    push %1\n    push %2\n    %if %0 >= 3\n        push %3\n    %endif\n    %if %0 >= 4\n        push %4\n    %endif\n%endmacro",
            "explanation": "Accepts two, three, or four 64-bit registers. The caller must pop the same registers in reverse order; do not use RSP as an ordinary save-list operand."
          },
          {
            "language": "nasm",
            "title": "Default macro parameter example",
            "code": "%macro add_amount 1-2 1\n    add %1, %2\n%endmacro\nsection .text\nglobal _start\n_start:\n    mov rax, 5\n    add_amount rax       ; default increment = 1\n    add_amount rax, 4    ; explicit increment\n    mov rdi, rax\n    mov eax, 60\n    syscall",
            "explanation": "One required operand and one optional operand defaulting to 1. Expected exit status: 10. ADD changes flags; the operands must form a valid ADD instruction."
          }
        ]
      },
      {
        "id": "sec-15-3-3",
        "title": "15.3.3 Local Labels in Macros",
        "content": "If a macro contains labels (e.g., for loops), using the same macro multiple times would cause duplicate label errors. NASM provides local labels within macros: labels starting with %% are local to the macro expansion. Each invocation gets a unique prefix.\n\nExample:\n\nClarification: The original countdown enters its loop even for count zero, then wraps to a huge unsigned count. Check for zero before the body. %% labels prevent duplicate definitions but do not fix termination or preserve registers.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "15.3.3 Local Labels in Macros — listing 1",
            "code": "%macro print_loop 1   ; %1 = count\n    mov rcx, %1\n%%loop:\n    ; do something\n    dec rcx\n    jnz %%loop\n%endmacro",
            "explanation": "Each expansion of print_loop will generate a unique label for %%loop, avoiding conflicts."
          },
          {
            "language": "nasm",
            "title": "Zero-safe macro-local loop",
            "code": "%macro count_steps 1\n    mov rcx, %1\n    test rcx, rcx\n    jz %%done\n%%loop:\n    inc rax\n    dec rcx\n    jnz %%loop\n%%done:\n%endmacro",
            "explanation": "Accepts a nonnegative count, increments RAX once per step, and clobbers RCX and flags. Multiple invocations have distinct loop and done labels."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 15.2 (zero-count and alias issues)",
            "code": "%macro sum_to_n 1   ; %1 = register containing n\n    xor rax, rax      ; sum\n%%loop:\n    add rax, %1\n    dec %1\n    jnz %%loop\n%endmacro\n\nsection .text\nglobal _start\n_start:\n    mov rcx, 10\n    sum_to_n rcx       ; rax = 55\n    mov rdi, rax\n    mov rax, 60\n    syscall",
            "explanation": "Original retained. Count zero underflows, and passing RAX aliases the output. The corrected macro copies the input before clearing RAX and uses an independent counter."
          }
        ]
      },
      {
        "id": "sec-15-4",
        "title": "15.4 Conditional Assembly",
        "content": "NASM supports conditional assembly directives that allow you to include or exclude code based on certain conditions. This is useful for debug builds, platform-specific code, or feature toggles."
      },
      {
        "id": "sec-15-4-1",
        "title": "15.4.1 %if and %ifdef",
        "content": "- %ifdef symbol – true if symbol is defined (via %define or -D command line).\n- %ifndef symbol – true if symbol is not defined.\n- %if expression – true if expression evaluates to non-zero.\n\nThese can be combined with %elif, %else, and %endif.\n\nExample: Debug output\n\nClarification: %ifdef checks existence, not numeric truth: -DDEBUG=0 still enables its block. For a numeric switch, define a default then use %if DEBUG. The source defines DEBUG inside the file, so its debug block is always included unless that line is removed. Exercise 15.3 leaves the choice to the command line.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "15.4.1 %if and %ifdef — listing 1",
            "code": "%define DEBUG 1\n\nsection .text\nglobal _start\n_start:\n    ; ... code ...\n%ifdef DEBUG\n    ; print debug message\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, debug_msg\n    mov rdx, debug_len\n    syscall\n%endif\n    ; rest of program\n    mov rax, 60\n    xor rdi, rdi\n    syscall\n\nsection .data\n%ifdef DEBUG\n    debug_msg db 'Debug: here', 0xA\n    debug_len equ $ - debug_msg\n%endif"
          }
        ]
      },
      {
        "id": "sec-15-4-2",
        "title": "15.4.2 Passing Symbols via Command Line",
        "content": "You can define symbols at assembly time using the -D option:",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "15.4.2 Passing Symbols via Command Line — listing 1",
            "code": "nasm -f elf64 -DDEBUG program.asm -o program.o",
            "explanation": "This defines DEBUG before assembly."
          }
        ]
      },
      {
        "id": "sec-15-4-3",
        "title": "15.4.3 %if with Expressions",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "15.4.3 %if with Expressions — listing 1",
            "code": "%assign VERSION 2\n\n%if VERSION >= 2\n    ; new code\n%else\n    ; old code\n%endif"
          }
        ]
      },
      {
        "id": "sec-15-5",
        "title": "15.5 Include Files",
        "content": "Large projects benefit from organizing code into multiple files. NASM's %include directive allows you to insert the contents of another file at the point of inclusion. This is commonly used for:\n- Shared constants (%define, equ)\n- Structure definitions\n- Macro definitions\n- Function declarations (extern)\n\nExample: defs.inc\n\nClarification: Use include guards around shared structure/macro definitions to prevent duplicate definitions when a header is included more than once. Include paths are build inputs: run from the project directory or pass -I/path/to/includes/ explicitly. An include is text insertion, not a separately linked module.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "defs.inc",
            "code": "%define NULL 0\n%define SYS_EXIT 60\n%define SYS_WRITE 1\n%define STDOUT 1\n\nstruc Point\n    .x: resd 1\n    .y: resd 1\nendstruc\n\n%macro push_regs 2\n    push %1\n    push %2\n%endmacro",
            "explanation": "Usage in main file:"
          },
          {
            "language": "nasm",
            "title": "main.asm",
            "code": "%include \"defs.inc\"\n\nsection .text\nglobal _start\n_start:\n    push_regs rax, rbx   ; use macro\n    ; ...\n    mov rax, SYS_EXIT\n    mov rdi, NULL\n    syscall",
            "explanation": "When assembling, NASM looks for the included file in the current directory or specified include paths (-I option)."
          },
          {
            "language": "nasm",
            "title": "Guarded shared definitions",
            "code": "%ifndef PROJECT_DEFS_INC\n%define PROJECT_DEFS_INC 1\n%define SYS_EXIT 60\nstruc SharedPoint\n    .x: resd 1\n    .y: resd 1\nendstruc\n%endif",
            "explanation": "Save as guarded_defs.inc. Including this file twice still defines SharedPoint exactly once."
          },
          {
            "language": "nasm",
            "title": "Original source: Exercise 15.4 — utils.inc",
            "code": "%define STDOUT 1\n%define SYS_WRITE 1\n\n%macro write_string 2\n    mov rax, SYS_WRITE\n    mov rdi, STDOUT\n    mov rsi, %1\n    mov rdx, %2\n    syscall\n%endmacro",
            "explanation": "Save each named file separately. Build commands run in the directory containing those files."
          },
          {
            "language": "nasm",
            "title": "Original source: Exercise 15.4 — main.asm",
            "code": "%include \"utils.inc\"\n\nsection .data\n    msg db 'Hello, include!', 0xA\n    len equ $ - msg\n\nsection .text\nglobal _start\n_start:\n    write_string msg, len\n    mov rax, 60\n    xor rdi, rdi\n    syscall",
            "explanation": "Save each named file separately. Build commands run in the directory containing those files."
          }
        ]
      },
      {
        "id": "sec-15-6",
        "title": "15.6 Modular Programming with Multiple Object Files",
        "content": "To manage complexity, split code into separate .asm files, each containing related functions. Assemble them separately into object files, then link together."
      },
      {
        "id": "sec-15-6-1",
        "title": "15.6.1 Sharing Symbols: global and extern",
        "content": "- global label makes a symbol visible to other object files.\n- extern label declares that a symbol is defined in another object file.\n\nExample:\n- math.asm defines add_numbers and subtract_numbers.\n- main.asm uses them.\n\nmath.asm\n\nClarification: Assemble each source separately, then link the objects together. GLOBAL exports a definition; EXTERN declares a definition supplied elsewhere. Use consistent calling conventions and unique exported names. Undefined-symbol and duplicate-definition errors arise at link time; headers alone do not supply procedure code.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "math.asm",
            "code": "section .text\nglobal add_numbers\nadd_numbers:\n    mov rax, rdi\n    add rax, rsi\n    ret\n\nglobal subtract_numbers\nsubtract_numbers:\n    mov rax, rdi\n    sub rax, rsi\n    ret",
            "explanation": "main.asm"
          },
          {
            "language": "nasm",
            "title": "main.asm",
            "code": "section .text\nglobal _start\nextern add_numbers, subtract_numbers\n\n_start:\n    mov rdi, 10\n    mov rsi, 5\n    call add_numbers       ; rax = 15\n    ; use result\n    mov rdi, rax\n    mov rax, 60\n    syscall",
            "explanation": "Build:"
          },
          {
            "language": "bash",
            "title": "Build commands",
            "code": "nasm -f elf64 math.asm -o math.o\nnasm -f elf64 main.asm -o main.o\nld main.o math.o -o program"
          },
          {
            "language": "nasm",
            "title": "Original source: Exercise 15.5 — string.inc",
            "code": "extern string_length",
            "explanation": "Save each named file separately. Build commands run in the directory containing those files."
          },
          {
            "language": "nasm",
            "title": "Original source: Exercise 15.5 — string.asm",
            "code": "section .text\nglobal string_length\n\n; rdi = pointer to null-terminated string\n; returns length in rax\nstring_length:\n    xor rax, rax\n.loop:\n    cmp byte [rdi + rax], 0\n    je .done\n    inc rax\n    jmp .loop\n.done:\n    ret",
            "explanation": "Save each named file separately. Build commands run in the directory containing those files."
          },
          {
            "language": "nasm",
            "title": "Original source: Exercise 15.5 — main.asm",
            "code": "%include \"string.inc\"\n\nsection .data\n    str db 'Hello, World!', 0\n\nsection .text\nglobal _start\n_start:\n    lea rdi, [str]\n    call string_length   ; rax = 13\n    mov rdi, rax\n    mov rax, 60\n    syscall",
            "explanation": "Save each named file separately. Build commands run in the directory containing those files."
          },
          {
            "language": "bash",
            "title": "Original source: Exercise 15.5 — Build commands",
            "code": "nasm -f elf64 string.asm -o string.o\nnasm -f elf64 main.asm -o main.o\nld main.o string.o -o test\n./test\necho $?   # 13",
            "explanation": "Save each named file separately. Build commands run in the directory containing those files."
          }
        ]
      },
      {
        "id": "sec-15-6-2",
        "title": "15.6.2 Organizing Code with a Shared Header",
        "content": "Create a header file (functions.inc) containing extern declarations and constants.\n\nfunctions.inc\n\nClarification: This header example declares functions but its main does not actually call them; the earlier two-file example demonstrates the call. Keep declarations in consumers and definitions in their owning source files.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "functions.inc",
            "code": "extern add_numbers, subtract_numbers\n%define SYS_EXIT 60",
            "explanation": "Then include it in main.asm:"
          },
          {
            "language": "nasm",
            "title": "main.asm",
            "code": "%include \"functions.inc\"\nsection .text\nglobal _start\n_start:\n    ; use add_numbers\n    mov rax, SYS_EXIT\n    xor rdi, rdi\n    syscall"
          }
        ]
      },
      {
        "id": "sec-15-6-3",
        "title": "15.6.3 Linking with C Runtime",
        "content": "If you want to use C library functions (like printf), declare them extern and link with gcc. But note the ABI requirements for variadic functions: al must hold the number of vector registers used.\n\nExample using printf:\n\nClarification: GCC supplies C runtime startup and calls main; do not also define _start in this example. Its non-PIE link matches the absolute fmt address. The prologue and 16-byte local allocation keep the printf call aligned, and AL=0 is correct for this integer-only variadic call. %d consumes an int; use ESI for clarity. A .note.GNU-stack section can mark an assembly object as not requiring an executable stack.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "15.6.3 Linking with C Runtime — listing 1",
            "code": "section .data\n    fmt db 'Result: %d', 0xA, 0\nsection .text\nglobal main\nextern printf\n\nmain:\n    push rbp\n    mov rbp, rsp\n    sub rsp, 16\n    mov rdi, fmt\n    mov rsi, 42\n    xor eax, eax         ; no vector registers\n    call printf\n    xor eax, eax\n    leave\n    ret",
            "explanation": "Build: nasm -f elf64 print.asm -o print.o && gcc print.o -o print -no-pie"
          }
        ]
      },
      {
        "id": "sec-15-7",
        "title": "15.7 Practical Example: Modular Calculator",
        "content": "We'll build a small modular project with separate files for arithmetic operations, I/O, and main logic. We'll use macros for common operations and an include file for constants.\n\nFile: constants.inc\n\nClarification: The supplied project has math and main modules plus headers; it exits with 30 and does not yet implement a separate I/O module or interactive calculator. To use subtract or multiply, change the call in main and rebuild that object. Changing a shared header requires reassembling every source that includes it.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "constants.inc",
            "code": "%define SYS_WRITE 1\n%define SYS_EXIT 60\n%define STDOUT 1\n%define NULL 0",
            "explanation": "File: math.asm"
          },
          {
            "language": "nasm",
            "title": "math.asm",
            "code": "section .text\nglobal add\nadd:\n    mov rax, rdi\n    add rax, rsi\n    ret\n\nglobal subtract\nsubtract:\n    mov rax, rdi\n    sub rax, rsi\n    ret\n\nglobal multiply\nmultiply:\n    mov rax, rdi\n    imul rax, rsi\n    ret",
            "explanation": "File: main.asm"
          },
          {
            "language": "nasm",
            "title": "main.asm",
            "code": "%include \"constants.inc\"\n%include \"math.inc\"   ; contains extern declarations\n\nsection .text\nglobal _start\n\n_start:\n    mov rdi, 20\n    mov rsi, 10\n    call add            ; rax = 30\n    ; exit with result\n    mov rdi, rax\n    mov rax, SYS_EXIT\n    syscall",
            "explanation": "File: math.inc"
          },
          {
            "language": "nasm",
            "title": "math.inc",
            "code": "extern add, subtract, multiply",
            "explanation": "Build:"
          },
          {
            "language": "bash",
            "title": "Build commands",
            "code": "nasm -f elf64 main.asm -o main.o\nnasm -f elf64 math.asm -o math.o\nld main.o math.o -o calculator\n./calculator\necho $?   # 30",
            "explanation": "This modular structure makes it easy to extend (add division, etc.) without modifying the main file."
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-15-1",
        "title": "Exercise 15.1: Simple Macros",
        "description": "Define a macro print_rax that prints the value of rax as a decimal string using write syscall. For simplicity, assume rax is a single digit (0–9). Use the macro in a program.",
        "solution": "%macro print_rax 0\n    ; rax contains digit 0-9\n    push rax            ; save\n    add al, '0'\n    mov [digit], al\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, digit\n    mov rdx, 1\n    syscall\n    pop rax\n%endmacro\n\nsection .bss\n    digit resb 1\n\nsection .text\nglobal _start\n_start:\n    mov rax, 5\n    print_rax\n    ; newline\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, newline\n    mov rdx, 1\n    syscall\n    mov rax, 60\n    xor rdi, rdi\n    syscall\n\nsection .data\n    newline db 0xA",
        "solutionLanguage": "nasm",
        "solutionExplanation": "\n\nExpected output: 5 followed by a newline, exit status 0. print_rax preserves RAX via PUSH/POP, but changes RDI, RSI, RDX, RCX, R11 and arithmetic flags. It requires a digit 0–9 and the writable digit label. The syscall can fail or write fewer bytes; this introductory macro does not report that error. The shared byte buffer is not suitable for concurrent calls."
      },
      {
        "id": "ex-15-2",
        "title": "Exercise 15.2: Multi-line Macro with Local Labels",
        "description": "Write a macro sum_to_n that computes the sum from 1 to n (passed as a register) and stores result in rax. Use a local label for the loop. Invoke it with rcx = 10.",
        "solution": "%macro sum_to_n 1   ; %1 = register containing n\n    mov r10, %1      ; snapshot input before clearing output\n    xor rax, rax\n    test r10, r10\n    jz %%done\n%%loop:\n    add rax, r10\n    dec r10\n    jnz %%loop\n%%done:\n%endmacro\n\nsection .text\nglobal _start\n_start:\n    mov rcx, 10\n    sum_to_n rcx       ; rax = 55\n    mov rdi, rax\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "\n\nExpected exit status: 55. The corrected macro accepts nonnegative counts in a 64-bit general register, including RAX, and copies the input to R10 before clearing the sum. It handles zero and repeated invocations, clobbers RAX/R10/flags, and otherwise leaves the input register unchanged. Avoid RSP as an input because it is not a useful count. Very large counts take linear time and sums can overflow."
      },
      {
        "id": "ex-15-3",
        "title": "Exercise 15.3: Conditional Assembly",
        "description": "Create a program that uses %ifdef DEBUG to print \"Debug mode\" before exiting. Assemble with and without -DDEBUG to see the difference.",
        "solution": "section .data\n    msg db 'Debug mode', 0xA\n    len equ $ - msg\nsection .text\nglobal _start\n_start:\n%ifdef DEBUG\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, msg\n    mov rdx, len\n    syscall\n%endif\n    mov rax, 60\n    xor rdi, rdi\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "Assemble normally: nasm -f elf64 test.asm -o test.o && ld test.o -o test && ./test (no output).\nAssemble with debug: nasm -f elf64 -DDEBUG test.asm -o test.o && ld test.o -o test && ./test (prints \"Debug mode\").\n\nWithout DEBUG: no output, exit 0. With -DDEBUG: Debug mode followed by a newline, exit 0. With -DDEBUG=0 the output still appears because the test is %ifdef. The message remains in .data even when its printing code is excluded."
      },
      {
        "id": "ex-15-4",
        "title": "Exercise 15.4: Include File",
        "description": "Create a file utils.inc containing:\n- Constant STDOUT = 1\n- Constant SYS_WRITE = 1\n- Macro write_string str, len that performs a write syscall.\nUse this include file in a program to print \"Hello, include!\".",
        "solution": "; File: utils.inc\n%ifndef EX15_UTILS_INC\n%define EX15_UTILS_INC 1\n%define STDOUT 1\n%define SYS_WRITE 1\n\n%macro write_string 2\n    mov rax, SYS_WRITE\n    mov rdi, STDOUT\n    mov rsi, %1\n    mov rdx, %2\n    syscall\n%endmacro\n%endif\n\n; File: main.asm\n%include \"utils.inc\"\n\nsection .data\n    msg db 'Hello, include!', 0xA\n    len equ $ - msg\n\nsection .text\nglobal _start\n_start:\n    write_string msg, len\n    mov rax, 60\n    xor rdi, rdi\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "utils.inc\n\n\nmain.asm\n\nSave each File block to its named file; do not assemble the combined display as one source.\nnasm -f elf64 main.asm -o main.o\nld main.o -o include_demo\n./include_demo\n\nExpected output: Hello, include! followed by a newline. Header guards allow repeated inclusion. The macro takes a label/immediate address and a length in this example and clobbers RAX, RDI, RSI, RDX, RCX and R11. Arbitrary register arguments can alias registers overwritten by earlier MOVs; document supported forms before generalizing. These absolute addresses target the shown ld non-PIE build."
      },
      {
        "id": "ex-15-5",
        "title": "Exercise 15.5: Modular Project",
        "description": "Create two source files: string.asm (defines string_length function) and main.asm (uses it). Use a header file string.inc with extern string_length. Build and test. The function should return length of a null-terminated string in rax.",
        "solution": "; File: string.inc\n%ifndef EX15_STRING_INC\n%define EX15_STRING_INC 1\nextern string_length\n%endif\n\n; File: string.asm\nsection .text\nglobal string_length\n\n; rdi = pointer to null-terminated string\n; returns length in rax\nstring_length:\n    xor rax, rax\n.loop:\n    cmp byte [rdi + rax], 0\n    je .done\n    inc rax\n    jmp .loop\n.done:\n    ret\n\n; File: main.asm\n%include \"string.inc\"\n\nsection .data\n    str: db 'Hello, World!', 0\n\nsection .text\nglobal _start\n_start:\n    lea rdi, [str]\n    call string_length   ; rax = 13\n    mov rdi, rax\n    mov rax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "string.inc\n\n\nstring.asm\n\n\nmain.asm\n\n\nBuild:\n\nSave each File block to its named file; do not assemble the combined display as one source.\nnasm -f elf64 string.asm -o string.o\nnasm -f elf64 main.asm -o main.o\nld main.o string.o -o test\n./test\necho $?   # 13\n\nExpected exit status: 13. The corrected main uses str: with a colon so NASM recognizes the label rather than the STR mnemonic. string_length returns 0 for an empty string and assumes a valid accessible null terminator. It uses only caller-saved RAX and preserves RDI; no bounds checking is performed."
      }
    ],
    "practiceQuestions": [
      {
        "question": "What is the difference between a macro and a procedure? When would you use each?",
        "answer": "A macro expands source text during assembly and creates instructions at each use. A procedure has one code body called at runtime. Use short macros for repetitive instruction patterns or build-time choices; procedures suit larger reusable work and runtime dispatch. Macros can expand to procedure calls too."
      },
      {
        "question": "How do you define a multi-line macro in NASM? How are parameters referenced?",
        "answer": "%macro name 2 begins a two-argument macro and %endmacro ends it. Reference operands as %1 and %2; %0 reports the argument count. Example: %macro add_pair 2 followed by add %1, %2 and %endmacro on separate lines. Argument forms must be valid for the generated instructions."
      },
      {
        "question": "Why are local labels important in macros? How do you create them?",
        "answer": "Ordinary labels would be defined multiple times when a macro is expanded repeatedly. Use %%loop or %%done inside a multiline macro; NASM generates distinct names for each invocation. This is separate from ordinary dot-prefixed local labels scoped to a surrounding label."
      },
      {
        "question": "Explain the purpose of %ifdef and how you can pass a symbol at assembly time.",
        "answer": "%ifdef DEBUG includes its block when DEBUG exists. Assemble with nasm -f elf64 -DDEBUG main.asm -o main.o. -DDEBUG=0 still defines it; use %if DEBUG for numeric on/off behavior after defining a default value."
      },
      {
        "question": "How do you share constants and function declarations across multiple assembly files?",
        "answer": "Place shared constants, structure definitions, macros and EXTERN declarations in guarded .inc files and use %include \"functions.inc\". Compile implementations separately and link their object files; inclusion does not link a function definition."
      },
      {
        "question": "What is the difference between global and extern? When would you use them?",
        "answer": "GLOBAL exports a symbol defined in the current module. EXTERN declares a symbol that another object or library supplies. Use global string_length in string.asm and extern string_length in its caller; link both objects."
      },
      {
        "question": "Describe the steps to build a project consisting of three .asm files. What commands would you use?",
        "answer": "nasm -f elf64 main.asm -o main.o\nnasm -f elf64 math.asm -o math.o\nnasm -f elf64 io.asm -o io.o\nld main.o math.o io.o -o program\n./program\nFor a program defining main and using libc, link through GCC with suitable PIE/addressing options instead."
      },
      {
        "question": "Can macros be recursive? If so, what are the risks?",
        "answer": "Macro expansion is not runtime recursion. NASM prevents ordinary recursive macro expansion; do not assume a self-invoking %macro behaves like a function. Use bounded %rep and %rotate for repetition. Large expansions can consume assembly resources and inflate machine code. Consult the installed NASM manual for advanced preprocessor facilities."
      },
      {
        "question": "How does %include work? What is the search path for included files?",
        "answer": "%include inserts the file text at that point during preprocessing. NASM searches the working directory and configured -I include paths; do not assume the source file directory is automatically searched. Use an explicit path or -Iinclude/ from a known working directory and include guards for repeatable builds."
      },
      {
        "question": "Write a simple macro that swaps two registers using xchg and has a local label. Show its usage.",
        "answer": "%macro swap_regs 2\n%%swap:\n    xchg %1, %2\n%endmacro\n\nmov rax, 10\nmov rbx, 20\nswap_regs rax, rbx\n; RAX=20, RBX=10.\nswap_regs rax, rbx\n; RAX=10, RBX=20; each %%swap label is distinct.\nUse same-width general registers. The label demonstrates scope but is not needed for a single XCHG; XCHG does not change flags."
      }
    ],
    "summary": [
      "Macros are assembly-time text substitutions that reduce code duplication and improve readability.",
      "%define creates single-line macros; %macro/%endmacro define multi-line macros with parameters.",
      "Local labels (%%label) prevent duplicate label errors in expanded macros.",
      "Conditional assembly (%ifdef, %if, etc.) includes/excludes code based on build-time symbols.",
      "Include files (%include) share constants, macros, and declarations across source files.",
      "Modular programming separates code into multiple object files, linked together. Use global to export symbols and extern to import them.",
      "Header files (.inc) often contain extern declarations and shared constants.",
      "Building modular projects uses multiple nasm commands and a final ld link.",
      "In the next chapter, we'll explore system calls and interaction with the operating system in depth, building on the modular foundations."
    ]
  },
  {
    "id": 16,
    "slug": "chapter-16-system-calls-os-interaction",
    "level": 3,
    "levelTitle": "Intermediate Assembly",
    "title": "Chapter 16: System Calls and Interaction with the OS",
    "subtitle": "File I/O, Heap Management (brk, mmap), and Error Codes (errno)",
    "learningObjectives": [
      "Understand what system calls are and why they are essential for user programs.",
      "Learn the Linux x86-64 system call convention: how to pass arguments and invoke the kernel.",
      "Use common system calls for I/O, file operations, process control, and memory management.",
      "Differentiate between direct system calls and C library wrappers.",
      "Handle errors from system calls and understand the role of errno.",
      "Write assembly programs that read input, write output, open and manipulate files, and interact with the operating system.",
      "Explore advanced system calls such as mmap, brk, and getpid."
    ],
    "prerequisites": [
      "Solid understanding of assembly instructions, registers, and calling conventions (Chapters 3, 10).",
      "Familiarity with procedures and modular programming (Chapters 10, 15).",
      "Basic knowledge of the Linux command line and file system.",
      "Ability to assemble and link programs (Chapter 4)."
    ],
    "keyConcepts": [
      "System call: A controlled entry point from user space into the kernel to request a service.",
      "On x86-64 Linux, system calls are invoked with the syscall instruction.",
      "The system call number is placed in rax; arguments go in rdi, rsi, rdx, r10, r8, r9.",
      "Return value is in rax; on error, rax contains a negative error code (or -errno).",
      "The kernel preserves all registers except rax, rcx, and r11.",
      "Common system calls: read, write, open, close, exit, brk, mmap, lseek, getpid.",
      "Direct system calls bypass the C library, giving full control but requiring manual error handling.",
      "System calls are slow; minimize their use for performance-critical code."
    ],
    "diagramType": "syscalls_os",
    "sections": [
      {
        "id": "sec-16-1",
        "title": "16.1 Introduction to System Calls",
        "content": "A system call is a mechanism that allows a user-space program to request services from the operating system kernel—such as reading from a file, writing to the console, allocating memory, or creating a process. Because user programs run in a restricted mode (ring 3 on x86), they cannot directly access hardware or kernel data structures. System calls provide a controlled interface."
      },
      {
        "id": "sec-16-1-1",
        "title": "16.1.1 How a System Call Works",
        "content": "1. The program places the system call number in rax and arguments in specific registers.\n2. The program executes the syscall instruction.\n3. The CPU switches to kernel mode and jumps to the kernel's system call handler.\n4. The kernel performs the requested operation, then returns to user mode.\n5. The result is placed in rax (or an error indicator).\n\nThe syscall instruction is the modern (64-bit) way to enter the kernel. It saves the return address in rcx and the flags in r11, then jumps to the kernel entry point. The kernel restores those when returning via sysret."
      },
      {
        "id": "sec-16-1-2",
        "title": "16.1.2 System Call vs C Library Function",
        "content": "In C, functions like printf, fopen, read are library wrappers around system calls. They often add buffering, formatting, and error handling. In assembly, we can call the system calls directly using the syscall instruction, bypassing the C library. This gives complete control and reduces overhead but requires us to handle errors manually.\n\nExample: write system call directly:\n\nClarification: printf is a libc formatting function, not a one-to-one syscall wrapper. It may buffer output and issue writes later. Raw syscalls do not set libc errno.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "16.1.2 System Call vs C Library Function — listing 1",
            "code": "mov rax, 1          ; syscall number for write\nmov rdi, 1          ; file descriptor (stdout)\nmov rsi, msg        ; pointer to data\nmov rdx, len        ; length\nsyscall",
            "explanation": "Equivalent C: write(1, msg, len);"
          }
        ]
      },
      {
        "id": "sec-16-2",
        "title": "16.2 Linux x86-64 System Call Convention",
        "content": "The System V AMD64 ABI defines how system calls are made on Linux:\n\n- System call number: rax\n- Arguments: rdi, rsi, rdx, r10, r8, r9 (for up to 6 arguments). The 4th argument uses r10 instead of rcx because syscall clobbers rcx.\n- Return value: rax (negative value indicates error, with absolute value being errno).\n- Clobbered registers: rcx and r11 are destroyed; all other registers are preserved by the kernel.\n\nThis is slightly different from the function calling convention, where the 4th argument is rcx. Pay close attention when writing system call code.\n\nClarification: These are Linux x86-64 syscall rules, distinct from the System V function ABI. SYSCALL overwrites RCX and R11; RAX holds the result. Preserve live values elsewhere. Raw error returns normally occupy -4095 through -1; brk is an important exception."
      },
      {
        "id": "sec-16-2-1",
        "title": "16.2.1 Table of Common System Call Numbers",
        "content": "A full list is in /usr/include/asm/unistd_64.h. Here are some common ones:",
        "tableData": {
          "headers": [
            "System Call",
            "Number (rax)",
            "Arguments"
          ],
          "rows": [
            [
              "read",
              "0",
              "rdi=fd, rsi=buf, rdx=count"
            ],
            [
              "write",
              "1",
              "rdi=fd, rsi=buf, rdx=count"
            ],
            [
              "open",
              "2",
              "rdi=path, rsi=flags, rdx=mode"
            ],
            [
              "close",
              "3",
              "rdi=fd"
            ],
            [
              "lseek",
              "8",
              "rdi=fd, rsi=offset, rdx=whence"
            ],
            [
              "mmap",
              "9",
              "rdi=addr, rsi=length, rdx=prot, r10=flags, r8=fd, r9=offset"
            ],
            [
              "brk",
              "12",
              "rdi=addr"
            ],
            [
              "exit",
              "60",
              "rdi=status"
            ],
            [
              "getpid",
              "39",
              "none"
            ],
            [
              "socket",
              "41",
              "rdi=domain, rsi=type, rdx=protocol"
            ],
            [
              "connect",
              "42",
              "rdi=fd, rsi=addr, rdx=addrlen"
            ],
            [
              "accept",
              "43",
              "rdi=fd, rsi=addr, rdx=addrlen"
            ],
            [
              "sendto",
              "44",
              "rdi=fd, rsi=buf, rdx=len, r10=flags, r8=dest_addr, r9=addrlen"
            ],
            [
              "recvfrom",
              "45",
              "rdi=fd, rsi=buf, rdx=len, r10=flags, r8=src_addr, r9=addrlen"
            ]
          ]
        }
      },
      {
        "id": "sec-16-2-2",
        "title": "16.2.2 Error Handling",
        "content": "If a system call fails, rax contains a negative value, the negation of the errno value (e.g., -2 for ENOENT). Success returns a non-negative value (often 0 or a positive result). We can check for errors by testing the sign of rax or comparing to -4095 (since error codes are in range -1 to -4095).\n\nExample: check for error after open:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "16.2.2 Error Handling — listing 1",
            "code": "    mov rax, 2          ; sys_open\n    lea rdi, [filename]\n    xor rsi, rsi        ; O_RDONLY = 0\n    syscall\n    test rax, rax\n    js  .error          ; if negative, error\n    ; success, rax = fd\n.error:\n    ; handle error"
          }
        ]
      },
      {
        "id": "sec-16-3",
        "title": "16.3 File I/O Using System Calls",
        "content": "We'll now explore common file operations: opening, reading, writing, and closing files."
      },
      {
        "id": "sec-16-3-1",
        "title": "16.3.1 Opening a File: open",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "16.3.1 Opening a File: open — listing 1",
            "code": "mov rax, 2              ; sys_open\nlea rdi, [filename]     ; path\nmov rsi, flags          ; access mode and flags (O_RDONLY=0, O_WRONLY=1, O_RDWR=2, etc.)\nmov rdx, mode           ; permissions (used when creating a file)\nsyscall",
            "explanation": "On success, rax = file descriptor (non-negative integer). On error, negative.\n\nFlags are defined in <fcntl.h>. Common flags:\n- O_RDONLY (0), O_WRONLY (1), O_RDWR (2)\n- O_CREAT (64), O_TRUNC (512), O_APPEND (1024)\n\nExample: open a file for reading"
          },
          {
            "language": "nasm",
            "title": "16.3.1 Opening a File: open — listing 2",
            "code": "section .data\n    filename db 'input.txt', 0\nsection .text\nglobal _start\n_start:\n    mov rax, 2          ; open\n    lea rdi, [filename]\n    xor rsi, rsi        ; O_RDONLY\n    syscall\n    test rax, rax\n    js  error\n    mov rdi, rax        ; fd\n    ; now read or process"
          }
        ]
      },
      {
        "id": "sec-16-3-2",
        "title": "16.3.2 Reading from a File: read",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "16.3.2 Reading from a File: read — listing 1",
            "code": "mov rax, 0              ; sys_read\nmov rdi, fd             ; file descriptor\nmov rsi, buffer         ; buffer\nmov rdx, count          ; max bytes to read\nsyscall",
            "explanation": "Returns number of bytes read in rax (0 indicates EOF). On error, negative."
          }
        ]
      },
      {
        "id": "sec-16-3-3",
        "title": "16.3.3 Writing to a File: write",
        "content": "\n\nClarification: A successful write can be short. Advance the pointer and retry the remaining bytes; handle EINTR before retrying. A zero-byte write with bytes remaining must not cause an endless loop.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "16.3.3 Writing to a File: write — listing 1",
            "code": "mov rax, 1              ; sys_write\nmov rdi, fd\nmov rsi, buffer\nmov rdx, count\nsyscall",
            "explanation": "Returns number of bytes written."
          },
          {
            "language": "nasm",
            "title": "Write all bytes with short-write and EINTR handling",
            "code": "; RDI=fd, RSI=buffer, RDX=count; RAX=0 success or negative error.\nwrite_all:\n    test rdx, rdx\n    jz .done\n.retry:\n    mov eax, 1\n    syscall\n    cmp rax, -4\n    je .retry\n    test rax, rax\n    js .return\n    jz .stalled\n    add rsi, rax\n    sub rdx, rax\n    jnz .retry\n.done:\n    xor eax, eax\n.return:\n    ret\n.stalled:\n    mov rax, -5\n    ret",
            "explanation": "This blocking-descriptor helper advances the buffer after each successful partial write. Other errors are returned to the caller; nonblocking descriptors require a readiness strategy."
          }
        ]
      },
      {
        "id": "sec-16-3-4",
        "title": "16.3.4 Closing a File: close",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "16.3.4 Closing a File: close — listing 1",
            "code": "mov rax, 3              ; sys_close\nmov rdi, fd\nsyscall",
            "explanation": "Returns 0 on success."
          }
        ]
      },
      {
        "id": "sec-16-3-5",
        "title": "16.3.5 Complete File Copy Example",
        "content": "Copy a file named input.txt to output.txt.\n\nClarification: The original copy assumes every write completes the entire chunk and ignores close errors. The corrected exercise uses a write-all loop and checks close results. Input and output must refer to different files: opening an alias of the input with O_TRUNC would destroy its contents.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "16.3.5 Complete File Copy Example — listing 1",
            "code": "section .data\n    in_filename db 'input.txt', 0\n    out_filename db 'output.txt', 0\n    buf times 4096 db 0\n    o_rdonly equ 0\n    o_wronly equ 1\n    o_creat equ 64\n    o_trunc equ 512\n\nsection .bss\n    fd_in resq 1\n    fd_out resq 1\n\nsection .text\nglobal _start\n\n_start:\n    ; open input file\n    mov rax, 2\n    lea rdi, [in_filename]\n    mov rsi, o_rdonly\n    syscall\n    test rax, rax\n    js  .error\n    mov [fd_in], rax\n\n    ; open output file (create/truncate)\n    mov rax, 2\n    lea rdi, [out_filename]\n    mov rsi, o_wronly | o_creat | o_trunc\n    mov rdx, 0644o      ; permissions (octal)\n    syscall\n    test rax, rax\n    js  .error\n    mov [fd_out], rax\n\n.copy_loop:\n    ; read chunk\n    mov rax, 0          ; read\n    mov rdi, [fd_in]\n    lea rsi, [buf]\n    mov rdx, 4096\n    syscall\n    test rax, rax\n    js  .error\n    jz  .copy_done      ; EOF\n\n    ; write chunk\n    mov rdx, rax        ; number of bytes read\n    mov rax, 1          ; write\n    mov rdi, [fd_out]\n    lea rsi, [buf]\n    syscall\n    test rax, rax\n    js  .error\n    jmp .copy_loop\n\n.copy_done:\n    ; close files\n    mov rax, 3\n    mov rdi, [fd_in]\n    syscall\n    mov rax, 3\n    mov rdi, [fd_out]\n    syscall\n    ; exit success\n    mov rax, 60\n    xor rdi, rdi\n    syscall\n\n.error:\n    ; exit with error code 1\n    mov rax, 60\n    mov rdi, 1\n    syscall",
            "explanation": "Note: This example assumes files exist and permissions are correct; error handling is minimal."
          }
        ]
      },
      {
        "id": "sec-16-4",
        "title": "16.4 Process and Memory System Calls",
        "content": ""
      },
      {
        "id": "sec-16-4-1",
        "title": "16.4.1 exit",
        "content": "Terminates the process with a status code.\n\nClarification: Raw syscall 60 exits the calling thread. For whole-process termination in a multithreaded program, Linux exit_group is syscall 231. These examples are single-threaded. The shell observes only the low eight bits of the status.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "16.4.1 exit — listing 1",
            "code": "mov rax, 60     ; sys_exit\nmov rdi, status ; exit code (0-255)\nsyscall",
            "explanation": "No return."
          }
        ]
      },
      {
        "id": "sec-16-4-2",
        "title": "16.4.2 getpid",
        "content": "Returns the process ID.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "16.4.2 getpid — listing 1",
            "code": "mov rax, 39     ; sys_getpid\nsyscall\n; rax = pid"
          }
        ]
      },
      {
        "id": "sec-16-4-3",
        "title": "16.4.3 brk – Allocate Memory",
        "content": "brk sets the end of the data segment (heap). The argument is the new program break address; returns the new break on success, or the current break if rdi=0.\n\nClarification: Raw brk returns the current break on failure; compare its return with the requested address before writing. Check addition overflow. Do not mix direct break manipulation with libc allocators managing the same heap.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Get current break",
            "code": "; Get current break\nmov rax, 12\nxor rdi, rdi\nsyscall\n; rax = current break\n\n; Allocate 4096 bytes by incrementing break\nmov rdi, rax\nadd rdi, 4096\nmov rax, 12\nsyscall\n; rax = new break (or old break on failure)"
          }
        ]
      },
      {
        "id": "sec-16-4-4",
        "title": "16.4.4 mmap – Memory Mapping",
        "content": "mmap maps files or devices into memory, or allocates anonymous memory. It's more flexible than brk.\n\nArguments:\n- rdi = address hint (0 for any)\n- rsi = length\n- rdx = protection (PROT_READ=1, PROT_WRITE=2, PROT_EXEC=4)\n- r10 = flags (MAP_PRIVATE=2, MAP_ANONYMOUS=32, etc.)\n- r8 = file descriptor (-1 for anonymous)\n- r9 = offset\n\nExample: allocate 4096 bytes of anonymous memory:\n\nClarification: Check RAX with cmp rax,-4095 followed by jae error before dereferencing. Release successful mappings with munmap (11) when no longer needed. Flags and syscall numbers here are specific to Linux x86-64.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "16.4.4 mmap – Memory Mapping — listing 1",
            "code": "mov rax, 9          ; mmap\nxor rdi, rdi        ; addr = NULL\nmov rsi, 4096       ; length\nmov rdx, 3          ; PROT_READ | PROT_WRITE\nmov r10, 0x22       ; MAP_PRIVATE | MAP_ANONYMOUS\nmov r8, -1          ; fd = -1\nxor r9, r9          ; offset = 0\nsyscall\n; rax = pointer to memory or -errno"
          }
        ]
      },
      {
        "id": "sec-16-5",
        "title": "16.5 Standard Input and Output",
        "content": "We've been using write to stdout (fd 1) and read from stdin (fd 0). These are system calls too. Here's a program that reads a line from stdin and echoes it back.\n\nClarification: A read returns bytes, not necessarily a complete line, and does not append a null terminator. The original echoes only one chunk and does not check its write result.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "16.5 Standard Input and Output — listing 1",
            "code": "section .bss\n    buffer resb 256\nsection .text\nglobal _start\n_start:\n    ; read from stdin\n    mov rax, 0          ; read\n    mov rdi, 0          ; stdin\n    lea rsi, [buffer]\n    mov rdx, 256\n    syscall\n    test rax, rax\n    js  error\n    mov rcx, rax        ; number of bytes read\n\n    ; write to stdout\n    mov rdx, rcx\n    mov rax, 1          ; write\n    mov rdi, 1          ; stdout\n    lea rsi, [buffer]\n    syscall\n\n    ; exit\n    mov rax, 60\n    xor rdi, rdi\n    syscall\nerror:\n    mov rax, 60\n    mov rdi, 1\n    syscall"
          }
        ]
      },
      {
        "id": "sec-16-6",
        "title": "16.6 Advanced: Using stat, lseek, and dup",
        "content": ""
      },
      {
        "id": "sec-16-6-1",
        "title": "16.6.1 lseek – Reposition File Offset",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "16.6.1 lseek – Reposition File Offset — listing 1",
            "code": "mov rax, 8          ; lseek\nmov rdi, fd\nmov rsi, offset\nmov rdx, whence     ; SEEK_SET=0, SEEK_CUR=1, SEEK_END=2\nsyscall",
            "explanation": "Returns new offset."
          }
        ]
      },
      {
        "id": "sec-16-6-2",
        "title": "16.6.2 dup / dup2 – Duplicate File Descriptor",
        "content": "Useful for redirecting stdin/stdout.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "dup2(oldfd, newfd)",
            "code": "; dup2(oldfd, newfd)\nmov rax, 33         ; dup2\nmov rdi, oldfd\nmov rsi, newfd\nsyscall"
          }
        ]
      },
      {
        "id": "sec-16-6-3",
        "title": "16.6.3 stat – Get File Status",
        "content": "stat fills a structure with file metadata (size, permissions, etc.). It requires a pointer to a stat structure.\n\nClarification: The simplified structure stops at st_size but is too small for a real stat syscall. Reserve the entire target kernel ABI structure (144 bytes for the conventional Linux x86-64 stat layout, st_size at offset 48), and verify layout against the target headers. Passing only the prefix lets the kernel overwrite following memory.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "sys_stat",
            "code": "; sys_stat\nmov rax, 4          ; stat\nlea rdi, [filename]\nlea rsi, [statbuf]\nsyscall",
            "explanation": "The stat structure layout is defined in <asm/stat.h>; we can define it manually or use struc.\n\nExample definition (simplified):"
          },
          {
            "language": "nasm",
            "title": "16.6.3 stat – Get File Status — listing 2",
            "code": "struc stat\n    .st_dev: resq 1\n    .st_ino: resq 1\n    .st_nlink: resq 1\n    .st_mode: resd 1\n    .st_uid: resd 1\n    .st_gid: resd 1\n    .pad0: resd 1\n    .st_rdev: resq 1\n    .st_size: resq 1\n    ; ... many more fields, but for size we can stop here, though need full size.\nendstruc",
            "explanation": "But the exact layout varies; it's better to use C's struct stat if interop is needed."
          }
        ]
      },
      {
        "id": "sec-16-7",
        "title": "16.7 Error Handling and errno",
        "content": "In C, when a system call fails, the library sets errno to a positive error code and returns -1. In assembly, the kernel returns the negative error code directly. To handle errors, check if rax is in the range [-4095, -1]. If so, the absolute value is the errno equivalent.\n\nCommon error codes:\n- EACCES (13): Permission denied\n- ENOENT (2): No such file or directory\n- EBADF (9): Bad file descriptor\n- ENOMEM (12): Out of memory\n- EINVAL (22): Invalid argument\n\nExample: check for file open error and print an error message\n\nClarification: The source error-handling fragment falls through to open_error on success unless actual success code branches away. Use a distinct success path. A sign test works for open/read/write/lseek here, but the raw error-range test is more general; brk needs its own success check.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "16.7 Error Handling and errno — listing 1",
            "code": "    mov rax, 2\n    lea rdi, [filename]\n    xor rsi, rsi\n    syscall\n    cmp rax, 0\n    jl  open_error\n    ; success\nopen_error:\n    neg rax          ; get positive errno\n    ; print error number (simplified)\n    ; ..."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 16.1",
            "code": "section .bss\n    buffer resb 101       ; one extra for newline? Actually 100 bytes max.\nsection .data\n    prompt db 'You entered: '\n    prompt_len equ $ - prompt\nsection .text\nglobal _start\n_start:\n    ; read up to 100 bytes from stdin\n    mov rax, 0\n    mov rdi, 0\n    lea rsi, [buffer]\n    mov rdx, 100\n    syscall\n    test rax, rax\n    js  error\n    mov rcx, rax          ; bytes read\n\n    ; print prompt\n    mov rax, 1\n    mov rdi, 1\n    lea rsi, [prompt]\n    mov rdx, prompt_len\n    syscall\n\n    ; print input\n    mov rdx, rcx\n    mov rax, 1\n    mov rdi, 1\n    lea rsi, [buffer]\n    syscall\n\n    ; exit\n    mov rax, 60\n    xor rdi, rdi\n    syscall\nerror:\n    mov rax, 60\n    mov rdi, 1\n    syscall",
            "explanation": "Original source retained for comparison; use the completed corrected exercise solution."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 16.2",
            "code": "section .data\n    filename db 'input.txt', 0\nsection .text\nglobal _start\n_start:\n    ; open file read-only\n    mov rax, 2\n    lea rdi, [filename]\n    xor rsi, rsi\n    syscall\n    test rax, rax\n    js  error\n    mov rbx, rax          ; fd\n\n    ; lseek to end, offset 0, SEEK_END=2\n    mov rax, 8\n    mov rdi, rbx\n    xor rsi, rsi\n    mov rdx, 2            ; SEEK_END\n    syscall\n    test rax, rax\n    js  error\n    ; rax = size\n    mov rdi, rax\n    ; close file\n    mov rax, 3\n    mov rdi, rbx\n    syscall\n    ; exit with size\n    mov rax, 60\n    mov rdi, rdi\n    syscall\nerror:\n    mov rax, 60\n    mov rdi, 1\n    syscall",
            "explanation": "Original source retained for comparison; use the completed corrected exercise solution."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 16.3",
            "code": "; After first open:\n    test rax, rax\n    js  .open_input_error\n; After second open:\n    test rax, rax\n    js  .open_output_error\n...\n.open_input_error:\n    mov rdi, 2\n    jmp .exit\n.open_output_error:\n    mov rdi, 3\n    jmp .exit\n.exit:\n    mov rax, 60\n    syscall",
            "explanation": "Original source retained for comparison; use the completed corrected exercise solution."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 16.4",
            "code": "section .bss\n    pid_str resb 16\nsection .text\nglobal _start\n\n_start:\n    mov rax, 39         ; getpid\n    syscall\n    ; rax = pid\n    lea rdi, [pid_str]\n    call uint_to_str\n    ; write string\n    mov rdx, rax\n    mov rax, 1\n    mov rdi, 1\n    lea rsi, [pid_str]\n    syscall\n    ; newline\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, newline\n    mov rdx, 1\n    syscall\n    ; exit\n    mov rax, 60\n    xor rdi, rdi\n    syscall\n\n; uint_to_str implementation (from Chapter 9)\n; ...",
            "explanation": "Original source retained for comparison; use the completed corrected exercise solution."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 16.5",
            "code": "section .text\nglobal _start\n_start:\n    ; Get current break\n    mov rax, 12\n    xor rdi, rdi\n    syscall\n    mov rbx, rax         ; save current break\n\n    ; Allocate 100 bytes\n    mov rdi, rax\n    add rdi, 100\n    mov rax, 12\n    syscall\n    ; rax = new break (should be rbx+100)\n\n    ; Fill 100 bytes with 0xAA starting at rbx\n    lea rdi, [rbx]\n    mov al, 0xAA\n    mov rcx, 100\n    cld\n    rep stosb\n\n    ; Sum the bytes\n    lea rsi, [rbx]\n    xor rbx, rbx          ; sum\n    mov rcx, 100\nsum_loop:\n    add bl, [rsi]         ; add byte (bl to avoid overflow, but sum=17000, need 16-bit)\n    inc rsi\n    dec rcx\n    jnz sum_loop\n    ; bl will overflow; use 16-bit accumulator\n    ; Let's do properly with 16-bit\n    xor rbx, rbx\n    lea rsi, [rbx]        ; rbx is zero, so rsi=0, not correct. Need to preserve pointer.\n    ; We'll use rsi = original pointer saved before.\n    ; For brevity, assume it works in 16-bit.\n    ; Exit with sum low byte (17000 mod 256 = 104)\n    mov rdi, rbx\n    mov rax, 60\n    syscall",
            "explanation": "Original source retained for comparison; use the completed corrected exercise solution."
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-16-1",
        "title": "Exercise 16.1: Read and Write",
        "description": "Write a program that reads up to 100 bytes from stdin and writes them to stdout, prefixed with \"You entered: \". Handle the case where input is longer than the buffer by reading in a loop (or just read once). Exit with 0.",
        "solution": "section .bss\n    buffer resb 101       ; one extra for newline? Actually 100 bytes max.\nsection .data\n    prompt db 'You entered: '\n    prompt_len equ $ - prompt\nsection .text\nglobal _start\n_start:\n    ; read up to 100 bytes from stdin\n    mov rax, 0\n    mov rdi, 0\n    lea rsi, [buffer]\n    mov rdx, 100\n    syscall\n    test rax, rax\n    js  error\n    mov r12, rax          ; preserve across syscalls\n\n    ; print prompt\n    mov rax, 1\n    mov rdi, 1\n    lea rsi, [prompt]\n    mov rdx, prompt_len\n    call write_all\n    test rax, rax\n    js error\n\n    ; print input\n    mov rdx, r12\n    mov rax, 1\n    mov rdi, 1\n    lea rsi, [buffer]\n    call write_all\n    test rax, rax\n    js error\n\n    ; exit\n    mov rax, 60\n    xor rdi, rdi\n    syscall\nerror:\n    mov rax, 60\n    mov rdi, 1\n    syscall\n\n; RDI=fd, RSI=buffer, RDX=count; RAX=0 success or negative error.\nwrite_all:\n    test rdx, rdx\n    jz .done\n.retry:\n    mov eax, 1\n    syscall\n    cmp rax, -4\n    je .retry\n    test rax, rax\n    js .return\n    jz .stalled\n    add rsi, rax\n    sub rdx, rax\n    jnz .retry\n.done:\n    xor eax, eax\n.return:\n    ret\n.stalled:\n    mov rax, -5\n    ret",
        "solutionLanguage": "nasm",
        "solutionExplanation": "\n\nReads once, at most 100 bytes; R12 preserves the count across the prefix write. Writes exactly the bytes received, including embedded zero bytes. Expected prefix: You entered: ."
      },
      {
        "id": "ex-16-2",
        "title": "Exercise 16.2: File Size",
        "description": "Open a file (e.g., input.txt), seek to the end using lseek, and get the file size (offset). Exit with the size as exit code (mod 256 if large).",
        "solution": "section .data\n    filename db 'input.txt', 0\nsection .text\nglobal _start\n_start:\n    ; open file read-only\n    mov rax, 2\n    lea rdi, [filename]\n    xor rsi, rsi\n    syscall\n    test rax, rax\n    js  error\n    mov rbx, rax          ; fd\n\n    ; lseek to end, offset 0, SEEK_END=2\n    mov rax, 8\n    mov rdi, rbx\n    xor rsi, rsi\n    mov rdx, 2            ; SEEK_END\n    syscall\n    test rax, rax\n    js  error\n    ; rax = size\n    mov r12, rax\n    ; close file\n    mov rax, 3\n    mov rdi, rbx\n    syscall\n    ; exit with size\n    mov rax, 60\n    mov rdi, r12\n    syscall\nerror:\n    mov rax, 60\n    mov rdi, 1\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "\n\nPreserves the seek result in R12 across close; the exit code is file size modulo 256. Seeking is suitable for regular files, not pipes."
      },
      {
        "id": "ex-16-3",
        "title": "Exercise 16.3: Copy File with Error Handling",
        "description": "Enhance the file copy example to handle errors gracefully: if the input file doesn't exist, exit with code 2; if output cannot be created, exit with code 3.",
        "solution": "section .data\n    in_filename db 'input.txt', 0\n    out_filename db 'output.txt', 0\n    buf times 4096 db 0\n    o_rdonly equ 0\n    o_wronly equ 1\n    o_creat equ 64\n    o_trunc equ 512\n\nsection .bss\n    fd_in resq 1\n    fd_out resq 1\n\nsection .text\nglobal _start\n\n_start:\n    ; open input file\n    mov rax, 2\n    lea rdi, [in_filename]\n    mov rsi, o_rdonly\n    syscall\n    test rax, rax\n    js  .input_error\n    mov [fd_in], rax\n\n    ; open output file (create/truncate)\n    mov rax, 2\n    lea rdi, [out_filename]\n    mov rsi, o_wronly | o_creat | o_trunc\n    mov rdx, 0644o      ; permissions (octal)\n    syscall\n    test rax, rax\n    js  .output_error\n    mov [fd_out], rax\n\n.copy_loop:\n    ; read chunk\n    mov rax, 0          ; read\n    mov rdi, [fd_in]\n    lea rsi, [buf]\n    mov rdx, 4096\n    syscall\n    cmp rax, -4\n    je .copy_loop\n    test rax, rax\n    js  .error\n    jz  .copy_done      ; EOF\n\n    ; write chunk\n    mov rdx, rax        ; number of bytes read\n    mov rax, 1          ; write\n    mov rdi, [fd_out]\n    lea rsi, [buf]\n    call write_all\n    test rax, rax\n    js  .error\n    jmp .copy_loop\n\n.copy_done:\n    ; close files\n    mov rax, 3\n    mov rdi, [fd_in]\n    syscall\n    test rax, rax\n    js .error\n    mov rax, 3\n    mov rdi, [fd_out]\n    syscall\n    test rax, rax\n    js .error\n    ; exit success\n    mov rax, 60\n    xor rdi, rdi\n    syscall\n\n.error:\n    ; exit with error code 1\n    mov rax, 60\n    mov rdi, 1\n    syscall\n.input_error:\n    mov edi, 2\n    jmp .exit_status\n.output_error:\n    mov edi, 3\n.exit_status:\n    mov eax, 60\n    syscall\n\n; RDI=fd, RSI=buffer, RDX=count; RAX=0 success or negative error.\nwrite_all:\n    test rdx, rdx\n    jz .done\n.retry:\n    mov eax, 1\n    syscall\n    cmp rax, -4\n    je .retry\n    test rax, rax\n    js .return\n    jz .stalled\n    add rsi, rax\n    sub rdx, rax\n    jnz .retry\n.done:\n    xor eax, eax\n.return:\n    ret\n.stalled:\n    mov rax, -5\n    ret",
        "solutionLanguage": "nasm",
        "solutionExplanation": "Add checks after open calls. If rax < 0, jump to specific error exit.\n\nComplete program: input-open failure exits 2, output-open failure exits 3, I/O/close failure exits 1, success exits 0. Process exit closes remaining descriptors on failure. Output may be partial after an I/O error."
      },
      {
        "id": "ex-16-4",
        "title": "Exercise 16.4: Print Process ID",
        "description": "Use the getpid system call to get the process ID and print it as a decimal string. You may need to implement integer-to-string conversion (see Chapter 9) or use a simple approach for small PIDs.",
        "solution": "section .bss\n    pid_str resb 21\nsection .text\nglobal _start\n\n_start:\n    mov rax, 39         ; getpid\n    syscall\n    ; rax = pid\n    lea rdi, [pid_str]\n    call uint_to_str\n    ; write string\n    mov rdx, rax\n    mov rax, 1\n    mov rdi, 1\n    lea rsi, [pid_str]\n    syscall\n    ; newline\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, newline\n    mov rdx, 1\n    syscall\n    ; exit\n    mov rax, 60\n    xor rdi, rdi\n    syscall\n\n; uint_to_str implementation (from Chapter 9)\n; ...\n\n; Input: RAX = unsigned 64-bit value; RDI = writable buffer of at least 21 bytes.\n; Output: RAX = length, buffer is null-terminated.\n; Clobbers: RCX, RDX, RSI, RDI, R8, R9 and arithmetic flags. DF is cleared.\n; Preserves RBX, RBP, R12-R15 and restores RSP.\nuint_to_str:\n    sub rsp, 32\n    lea r8, [rsp+32]      ; end of the allocated temporary buffer\n    mov r9, r8\n    mov rcx, 10\n.digit_loop:\n    xor rdx, rdx\n    div rcx\n    add dl, '0'\n    dec r9\n    mov [r9], dl\n    test rax, rax\n    jnz .digit_loop       ; zero still produces one digit\n    mov rax, r8\n    sub rax, r9           ; save returned length independently of RCX\n    mov rcx, rax\n    mov rsi, r9\n    cld\n    rep movsb\n    mov byte [rdi], 0\n    add rsp, 32\n    ret\n\nsection .data\nnewline db 10\n",
        "solutionLanguage": "nasm",
        "solutionExplanation": "We'll need a helper to convert integer to decimal string. Use the function from Chapter 9. Here's a simplified version for PID < 100000.\n\nIncludes both the missing conversion routine and newline definition. Prints the actual PID, not a truncated exit value; buffer accommodates any unsigned 64-bit number."
      },
      {
        "id": "ex-16-5",
        "title": "Exercise 16.5: Memory Allocation with `brk`",
        "description": "Allocate 100 bytes using brk, fill it with 0xAA, and then verify by reading back and summing the bytes. Exit with the sum (should be 17000 if all bytes are 0xAA, but exit code is low byte).",
        "solution": "section .text\nglobal _start\n_start:\n    mov eax, 12\n    xor edi, edi\n    syscall\n    mov r12, rax\n    mov rdi, rax\n    add rdi, 100\n    jc error\n    mov r13, rdi\n    mov eax, 12\n    syscall\n    cmp rax, r13\n    jne error\n    mov rdi, r12\n    mov al, 0xaa\n    mov ecx, 100\n    cld\n    rep stosb\n    mov rsi, r12\n    xor ebx, ebx\n    mov ecx, 100\n.sum:\n    movzx eax, byte [rsi]\n    add ebx, eax\n    inc rsi\n    dec ecx\n    jnz .sum\n    cmp ebx, 17000\n    jne error\n    mov edi, ebx\n    mov eax, 60\n    syscall\nerror:\n    mov edi, 1\n    mov eax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "This solution needs a bit of refinement; the key idea is there.\n\nChecks allocation success and preserves the pointer separately from a wide sum. Verifies 17000 internally and exits with low byte 104."
      }
    ],
    "practiceQuestions": [
      {
        "question": "What is a system call? How does a program invoke one on x86-64 Linux?",
        "answer": "A syscall enters the kernel to request an OS operation. Put its Linux x86-64 number in RAX, arguments in the syscall registers, execute SYSCALL, and inspect RAX."
      },
      {
        "question": "Which registers are used for system call arguments? Why is r10 used instead of rcx for the 4th argument?",
        "answer": "Arguments use RDI, RSI, RDX, R10, R8, R9. RCX is overwritten by SYSCALL with the return instruction address, so argument four uses R10. R11 is also clobbered."
      },
      {
        "question": "How do you detect an error from a system call in assembly? What does a negative return value mean?",
        "answer": "cmp rax, -4095; jae error detects the normal raw error range using unsigned comparison. Negate an error to get its positive errno number. Raw brk is exceptional: compare returned and requested breaks."
      },
      {
        "question": "What is the difference between a system call and a library function like printf?",
        "answer": "A library function runs user-space code and may format, buffer, allocate, or make multiple syscalls. printf is not a direct syscall. Raw syscalls return kernel errors without setting libc errno."
      },
      {
        "question": "Write the assembly code to open a file for writing, creating it if it doesn't exist, with permissions 0644.",
        "answer": "mov eax, 2\nlea rdi, [rel filename]\nmov esi, 1 | 64\nmov edx, 0644o\nsyscall\ntest rax, rax\njs error\nCreation permissions are filtered by umask. This does not truncate an existing file; add O_TRUNC only when intended."
      },
      {
        "question": "How does brk work? What argument does it take? How do you allocate memory using brk?",
        "answer": "Query with RDI=0, save the returned break, add the allocation size with overflow checking, call brk again, and verify its return equals the requested end. It changes the process break; it is not a general replacement for a coordinated allocator."
      },
      {
        "question": "What is the purpose of mmap? What are its arguments?",
        "answer": "mmap maps files or anonymous pages. Arguments are address hint, length, protection, flags, fd, and offset in RDI,RSI,RDX,R10,R8,R9. Check the error range and later release with munmap."
      },
      {
        "question": "How would you read the size of a file without reading its contents? Which system call do you use?",
        "answer": "Use lseek(fd,0,SEEK_END) for a seekable file, preserving/restoring the original offset if needed. stat/fstat returns size without moving the offset, using a correctly sized ABI structure."
      },
      {
        "question": "What is a file descriptor? What are the standard descriptors and their numbers?",
        "answer": "A file descriptor is a process-local integer referring to an open file description. Conventionally 0 is stdin, 1 stdout, 2 stderr; descriptors can be redirected and duplicated."
      },
      {
        "question": "Why are system calls relatively slow compared to normal function calls? What can you do to minimize their impact?",
        "answer": "Kernel entry and exit, validation, scheduling and I/O work add overhead. Batch operations, buffer small writes, handle partial results, and avoid repeated calls inside tight loops when one larger operation suffices."
      }
    ],
    "summary": [
      "System calls are the interface between user programs and the kernel.",
      "Linux x86-64 uses syscall instruction with number in rax, args in rdi, rsi, rdx, r10, r8, r9.",
      "Return value in rax; negative indicates error (-errno).",
      "Common calls: read, write, open, close, lseek, exit, brk, mmap, getpid.",
      "Direct system calls avoid C library overhead but require manual error handling.",
      "File I/O uses file descriptors (0=stdin, 1=stdout, 2=stderr).",
      "Memory can be allocated with brk or mmap.",
      "Always check for errors by testing rax for negative values.",
      "In the next chapter, we'll explore debugging with GDB and other tools, essential for diagnosing issues in assembly programs."
    ]
  },
  {
    "id": 17,
    "slug": "chapter-17-debugging-gdb-tools",
    "level": 3,
    "levelTitle": "Intermediate Assembly",
    "title": "Chapter 17: Debugging with GDB and Other Tools",
    "subtitle": "Breakpoints, Stepping, Memory Inspection, TUI Mode, and Tracing Tools",
    "learningObjectives": [
      "Understand the importance of debugging in assembly language development.",
      "Install and set up GDB for debugging 64-bit assembly programs.",
      "Compile assembly code with debugging symbols for GDB.",
      "Use essential GDB commands: breakpoints, stepping, examining registers, memory, and disassembly.",
      "Watch variables and memory locations using watchpoints.",
      "Use GDB's TUI mode and command files for efficient debugging.",
      "Explore other Linux debugging tools: objdump, strace, ltrace, valgrind, and readelf.",
      "Apply debugging techniques to identify and fix common assembly bugs (segfaults, infinite loops, incorrect results)."
    ],
    "prerequisites": [
      "Solid understanding of assembly instructions, registers, and memory layout (Chapters 3, 6, 9).",
      "Familiarity with the build process, NASM, and linking (Chapter 4).",
      "Basic experience writing and running assembly programs.",
      "A Linux environment with GDB installed (sudo apt install gdb)."
    ],
    "keyConcepts": [
      "Debugging symbols (-g option in NASM) embed source-level information in the object file, enabling GDB to show source lines and variable names.",
      "GDB is a powerful command-line debugger for Linux; it can control program execution, inspect state, and modify variables.",
      "Breakpoints pause execution at specific instructions or source lines.",
      "Stepping executes one instruction or source line at a time.",
      "Examining registers and memory is crucial in assembly debugging.",
      "Watchpoints trigger when a memory location changes.",
      "TUI mode provides a split-screen with source and assembly views.",
      "Other tools like objdump (disassembly), strace (system call tracing), and valgrind (memory errors) complement GDB."
    ],
    "diagramType": "gdb_debugging",
    "sections": [
      {
        "id": "sec-17-1",
        "title": "17.1 Introduction to Debugging Assembly",
        "content": "Debugging assembly language presents unique challenges: you operate at the machine level, with no high-level abstractions. Bugs often manifest as segmentation faults, incorrect register values, or unexpected memory contents. A debugger is essential to inspect the state of the CPU and memory at any point.\n\nWhy use GDB?\n- View registers and flags.\n- Examine memory at specific addresses.\n- Disassemble machine code to see exactly what instructions execute.\n- Set breakpoints to pause at critical points.\n- Step through code instruction by instruction.\n- Watch variables and memory for changes.\n- Analyze core dumps from crashed programs.\n\nWhile GDB has a learning curve, mastering it greatly accelerates assembly development."
      },
      {
        "id": "sec-17-2",
        "title": "17.2 Preparing for Debugging",
        "content": "To debug effectively, you need to assemble with debugging information. NASM's -g option includes debug symbols in the object file.\n\nExample:\n\nClarification: Use nasm -f elf64 -g -F dwarf program.asm -o program.o for explicit DWARF debug information; retain symbols when linking. Source labels often lack C type information, so cast memory expressions explicitly.",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "17.2 Preparing for Debugging — listing 1",
            "code": "nasm -f elf64 -g program.asm -o program.o\nld program.o -o program",
            "explanation": "Now GDB can map addresses to source lines and labels."
          }
        ]
      },
      {
        "id": "sec-17-2-1",
        "title": "17.2.1 Starting GDB",
        "content": "Launch GDB with the executable:",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "17.2.1 Starting GDB — listing 1",
            "code": "gdb ./program",
            "explanation": "You'll see the (gdb) prompt. Use quit to exit."
          }
        ]
      },
      {
        "id": "sec-17-2-2",
        "title": "17.2.2 Basic GDB Commands",
        "content": "",
        "tableData": {
          "headers": [
            "Command",
            "Description"
          ],
          "rows": [
            [
              "run / r",
              "Start execution"
            ],
            [
              "break / b",
              "Set breakpoint at function, line, or address"
            ],
            [
              "continue / c",
              "Continue execution until next breakpoint"
            ],
            [
              "nexti / ni",
              "Step one instruction (over calls)"
            ],
            [
              "stepi / si",
              "Step one instruction (into calls)"
            ],
            [
              "print / p",
              "Print value of expression or register"
            ],
            [
              "info registers / i r",
              "Show all registers"
            ],
            [
              "x",
              "Examine memory"
            ],
            [
              "disassemble / disas",
              "Disassemble code"
            ],
            [
              "watch",
              "Set a watchpoint"
            ],
            [
              "list / l",
              "List source code"
            ],
            [
              "quit / q",
              "Exit GDB"
            ]
          ]
        }
      },
      {
        "id": "sec-17-3",
        "title": "17.3 Setting Breakpoints",
        "content": "Breakpoints are essential to pause execution at specific points."
      },
      {
        "id": "sec-17-3-1",
        "title": "17.3.1 Break at a Label or Function",
        "content": "",
        "codeSnippets": [
          {
            "language": "gdb",
            "title": "17.3.1 Break at a Label or Function — listing 1",
            "code": "break _start\nbreak my_function",
            "explanation": "If labels are unique, GDB resolves them."
          }
        ]
      },
      {
        "id": "sec-17-3-2",
        "title": "17.3.2 Break at a Source Line",
        "content": "",
        "codeSnippets": [
          {
            "language": "gdb",
            "title": "17.3.2 Break at a Source Line — listing 1",
            "code": "break program.asm:15",
            "explanation": "This requires debug info."
          }
        ]
      },
      {
        "id": "sec-17-3-3",
        "title": "17.3.3 Break at an Address",
        "content": "\n\nClarification: Example numeric addresses are illustrative and may change with rebuilding or PIE/ASLR. Prefer symbol-based breakpoints or resolve addresses from the current disassembly.",
        "codeSnippets": [
          {
            "language": "gdb",
            "title": "17.3.3 Break at an Address — listing 1",
            "code": "break *0x400080",
            "explanation": "Use * to specify an address. You can find addresses via disassemble."
          }
        ]
      },
      {
        "id": "sec-17-3-4",
        "title": "17.3.4 Conditional Breakpoints",
        "content": "",
        "codeSnippets": [
          {
            "language": "gdb",
            "title": "17.3.4 Conditional Breakpoints — listing 1",
            "code": "break *0x400080 if $rax == 5",
            "explanation": "Pauses only when condition is true."
          }
        ]
      },
      {
        "id": "sec-17-4",
        "title": "17.4 Stepping Through Code",
        "content": "Once paused, use stepping commands to execute instructions one by one.\n\n- stepi (or si) – Step one machine instruction, entering function calls.\n- nexti (or ni) – Step one machine instruction, but treat call as a single step (doesn't go into called function).\n- continue (or c) – Run until next breakpoint or program exit.\n\nExample:",
        "codeSnippets": [
          {
            "language": "gdb",
            "title": "17.4 Stepping Through Code — listing 1",
            "code": "(gdb) break _start\n(gdb) run\n(gdb) si           ; execute first instruction\n(gdb) si\n(gdb) i r rax      ; check rax"
          }
        ]
      },
      {
        "id": "sec-17-5",
        "title": "17.5 Examining Registers and Memory",
        "content": ""
      },
      {
        "id": "sec-17-5-1",
        "title": "17.5.1 Viewing Registers",
        "content": "Use info registers or i r to see all general-purpose registers and RIP, RFLAGS. For specific register:",
        "codeSnippets": [
          {
            "language": "gdb",
            "title": "17.5.1 Viewing Registers — listing 1",
            "code": "p $rax\np/x $rax          ; hex format\np $rsp"
          }
        ]
      },
      {
        "id": "sec-17-5-2",
        "title": "17.5.2 Viewing Flags",
        "content": "info registers eflags or p $eflags. To decode flags, use GDB's p with individual flags like $ZF (but not directly; use p $eflags & 0x40 for ZF). Or use info registers and look at eflags value."
      },
      {
        "id": "sec-17-5-3",
        "title": "17.5.3 Examining Memory with x",
        "content": "The x command prints memory contents.\n\nSyntax: x/nfu address\n- n = number of units\n- f = format (x hex, d decimal, c char, s string, i instruction)\n- u = unit size (b byte, h halfword, w word, g giant/8 bytes)\n\nExamples:\n\nClarification: GDB unit w is four bytes, unlike an x86 word (two bytes). Use x/gd for a signed decimal qword and x/wd for a dword. x/s reads until a null terminator; use a bounded byte dump for non-terminated data.",
        "codeSnippets": [
          {
            "language": "gdb",
            "title": "17.5.3 Examining Memory with x — listing 1",
            "code": "x/8bx $rsp          ; 8 bytes in hex at rsp\nx/4gx $rsp          ; 4 8-byte words in hex\nx/s $rsi            ; print string at address in rsi\nx/i $rip            ; disassemble instruction at rip\nx/10i $rip          ; 10 instructions starting at rip"
          }
        ]
      },
      {
        "id": "sec-17-5-4",
        "title": "17.5.4 Printing Variables and Symbols",
        "content": "If you have debug info and labels, you can print the address or content:",
        "codeSnippets": [
          {
            "language": "gdb",
            "title": "17.5.4 Printing Variables and Symbols — listing 1",
            "code": "p &myvar\np myvar            ; if it's a data label, GDB may know type from debug info? Not always.\nx/d &myvar         ; print decimal at address of myvar"
          }
        ]
      },
      {
        "id": "sec-17-6",
        "title": "17.6 Watchpoints",
        "content": "Watchpoints pause execution when a specified memory location changes. Useful for tracking when a variable is modified.\n\nSet a watchpoint:\n\nClarification: Use watch -l *(unsigned long long *)&counter for an untyped qword label. Hardware watchpoints monitor memory locations and have limited slots and sizes. Register expressions can be software-watchable, but they are not register hardware watchpoints. watch *$rsp does not simply track every PUSH: RSP moves, and a push writes below the old top. Fix an address with a convenience variable and use watch -l with an explicit type.",
        "codeSnippets": [
          {
            "language": "gdb",
            "title": "17.6 Watchpoints — listing 1",
            "code": "watch myvar\nwatch *0x600100",
            "explanation": "Then continue; GDB stops when the value changes, showing old and new values.\n\nTo set a watchpoint on a register (not directly possible), watch the memory the register points to.\n\nExample:"
          },
          {
            "language": "gdb",
            "title": "17.6 Watchpoints — listing 2",
            "code": "break _start\nrun\nwatch *$rsp\ncontinue",
            "explanation": "This triggers when the stack top changes (e.g., after push)."
          },
          {
            "language": "gdb",
            "title": "Original source debugger commands: Exercise 17.2",
            "code": "break _start\nrun\nwatch counter\ncontinue\ncontinue\n...",
            "explanation": "Run as GDB commands, separately from the NASM source."
          }
        ]
      },
      {
        "id": "sec-17-7",
        "title": "17.7 GDB TUI Mode",
        "content": "TUI (Text User Interface) provides a split-screen with source code, assembly, and registers.\n\nEnable TUI:",
        "codeSnippets": [
          {
            "language": "gdb",
            "title": "17.7 GDB TUI Mode — listing 1",
            "code": "layout src\nlayout asm\nlayout regs",
            "explanation": "Or tui enable (newer GDB). You can combine layouts.\n\nExample:"
          },
          {
            "language": "gdb",
            "title": "17.7 GDB TUI Mode — listing 2",
            "code": "(gdb) layout asm\n(gdb) layout regs",
            "explanation": "Navigate with focus commands. To exit TUI, tui disable or Ctrl-x a."
          }
        ]
      },
      {
        "id": "sec-17-8",
        "title": "17.8 GDB Command Files",
        "content": "For repetitive debugging, create a GDB script file with commands.\n\nExample debug.gdb:",
        "codeSnippets": [
          {
            "language": "text",
            "title": "17.8 GDB Command Files — listing 1",
            "code": "break _start\nrun\nstepi\ninfo registers rax rbx\nx/4gx $rsp\ncontinue\nquit",
            "explanation": "Run with:"
          },
          {
            "language": "bash",
            "title": "17.8 GDB Command Files — listing 2",
            "code": "gdb -x debug.gdb ./program",
            "explanation": "You can also define custom commands using define."
          }
        ]
      },
      {
        "id": "sec-17-9",
        "title": "17.9 Disassembling with GDB and objdump",
        "content": "disassemble inside GDB shows instructions around a location.\n\nIn GDB:\n\nClarification: Select set disassembly-flavor intel to match NASM syntax. disassemble /s is useful for source interleaving; /m has limitations with reordered code. Disassembly without DWARF still works, but source mapping does not.",
        "codeSnippets": [
          {
            "language": "gdb",
            "title": "17.9 Disassembling with GDB and objdump — listing 1",
            "code": "disas _start\ndisas /m _start    ; mixed source and assembly\ndisas 0x400080, 0x4000a0",
            "explanation": "Outside GDB, use objdump:"
          },
          {
            "language": "bash",
            "title": "17.9 Disassembling with GDB and objdump — listing 2",
            "code": "objdump -d -M intel program",
            "explanation": "This disassembles the entire text section in Intel syntax.\n\nFor more detail, include source with -S (if debug info):"
          },
          {
            "language": "bash",
            "title": "17.9 Disassembling with GDB and objdump — listing 3",
            "code": "objdump -dS -M intel program"
          },
          {
            "language": "text",
            "title": "Original source: Exercise 17.5 disassembly",
            "code": "400080: b8 01 00 00 00    mov eax,0x1",
            "explanation": "Illustrative address; compare the actual executable."
          }
        ]
      },
      {
        "id": "sec-17-10",
        "title": "17.10 Tracing System Calls with strace",
        "content": "strace shows all system calls made by a program, along with arguments and return values. This is invaluable for finding issues with file I/O, memory, and process management.\n\nExample:\n\nClarification: Trace output usually goes to stderr. Library code may use openat rather than open; include it in filters. ltrace visibility depends on dynamic linkage and call paths, and raw syscalls do not appear as libc calls.",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "17.10 Tracing System Calls with strace — listing 1",
            "code": "strace ./program",
            "explanation": "Output includes lines like:"
          },
          {
            "language": "text",
            "title": "17.10 Tracing System Calls with strace — listing 2",
            "code": "write(1, \"Hello, World!\\n\", 14) = 14\nexit(0) = ?",
            "explanation": "To trace only certain calls:"
          },
          {
            "language": "bash",
            "title": "17.10 Tracing System Calls with strace — listing 3",
            "code": "strace -e trace=open,read,write ./program",
            "explanation": "ltrace is similar but traces library calls (e.g., libc functions). Since our assembly code often bypasses libc, strace is more useful."
          }
        ]
      },
      {
        "id": "sec-17-11",
        "title": "17.11 Memory Debugging with Valgrind",
        "content": "Valgrind detects memory errors like invalid reads/writes, use of uninitialized memory, and leaks. It works on any executable, including assembly.\n\nUsage:\n\nClarification: Memcheck tracks addressability and definedness but does not know every static-array boundary or custom allocator object. A small overrun inside an otherwise mapped .bss region may be missed. Allocation-aware tests or guard pages are more reliable demonstrations; no-error output does not prove absence of a bug.",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "17.11 Memory Debugging with Valgrind — listing 1",
            "code": "valgrind ./program",
            "explanation": "It will report errors with addresses and sometimes stack traces (if symbols available).\n\nFor more detail:"
          },
          {
            "language": "bash",
            "title": "17.11 Memory Debugging with Valgrind — listing 2",
            "code": "valgrind --leak-check=full ./program",
            "explanation": "Note: Valgrind can be slow and may not support all system calls perfectly, but it's excellent for catching memory bugs."
          },
          {
            "language": "nasm",
            "title": "Allocation-aware Memcheck demonstration",
            "code": "section .text\nglobal main\nextern malloc, free\nmain:\n    push rbx\n    mov edi, 10\n    call malloc\n    test rax, rax\n    jz .failed\n    mov rbx, rax\n    mov byte [rbx+10], 'A' ; intentional one-byte overrun for Memcheck\n    mov rdi, rbx\n    call free\n    xor eax, eax\n    pop rbx\n    ret\n.failed:\n    mov eax, 1\n    pop rbx\n    ret\nsection .note.GNU-stack noalloc noexec nowrite progbits",
            "explanation": "Build with nasm -f elf64 -g -F dwarf heap.asm -o heap.o and gcc -no-pie heap.o -o heap. Run valgrind --error-exitcode=99 ./heap. This deliberately invalid write should be reported as one byte beyond a ten-byte allocation."
          }
        ]
      },
      {
        "id": "sec-17-12",
        "title": "17.12 Practical Debugging Example",
        "content": "Let's debug a simple program that intentionally has a bug: it tries to print a string but uses wrong length.\n\nBuggy code (buggy.asm):\n\nClarification: The message has 14 bytes but no null terminator. Use x/14cb $rsi or x/14bx $rsi, not an unbounded x/s, to inspect exactly that object. The failing write length is 9 and prints Hello, Wo. Stop at the write instruction to inspect RDX and then fix the source to len.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "17.12 Practical Debugging Example — listing 1",
            "code": "section .data\n    msg db 'Hello, World!', 0xA\n    len equ $ - msg       ; correct length\n\nsection .text\nglobal _start\n_start:\n    mov rax, 1\n    mov rdi, 1\n    mov rsi, msg\n    mov rdx, len - 5      ; bug: length too short (should be len)\n    syscall\n\n    mov rax, 60\n    xor rdi, rdi\n    syscall",
            "explanation": "Assemble with debug info:"
          },
          {
            "language": "bash",
            "title": "17.12 Practical Debugging Example — listing 2",
            "code": "nasm -f elf64 -g buggy.asm -o buggy.o\nld buggy.o -o buggy"
          },
          {
            "language": "gdb",
            "title": "Original source debugger commands: Exercise 17.1",
            "code": "break _start\nrun\nsi\nsi",
            "explanation": "Run as GDB commands, separately from the NASM source."
          }
        ]
      },
      {
        "id": "sec-Debugging",
        "title": "Debugging Steps in GDB",
        "content": "1. Start GDB: gdb ./buggy\n2. Set breakpoint at _start: break _start\n3. Run: run\n4. Step through instructions until after the mov rdx, len-5:",
        "codeSnippets": [
          {
            "language": "text",
            "title": "Debugging Steps in GDB — listing 1",
            "code": "si\nsi\nsi\nsi",
            "explanation": "5. Check rdx value: p $rdx (should be 9 instead of 14).\n6. Examine the string: x/s $rsi shows full string.\n7. Realize the length is wrong, fix by using mov rdx, len.\n\nThis simple example illustrates the workflow."
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-17-1",
        "title": "Exercise 17.1: Debug a Segmentation Fault",
        "description": "Write a program that dereferences a NULL pointer (e.g., mov rax, [0]). Run it under GDB, observe the crash, and use backtrace (if available) and info registers to find the faulting instruction.",
        "solution": "section .text\nglobal _start\n_start:\n    mov rax, 0\n    mov rax, [rax]   ; dereference NULL -> segfault\n    mov rax, 60\n    xor rdi, rdi\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "Program:\n\nRun in GDB:\n\nWhen it crashes, GDB shows Cannot access memory at address 0x0. Use p $rip to see the instruction address, and disas $rip-10, $rip+10 to see surroundings. info registers shows rax=0 before fault.\n\nExpected: GDB reports SIGSEGV at the null dereference, not necessarily the quoted memory-examine error. Use x/i $rip and info registers rax rip. An _start program may have no useful caller backtrace. This is deliberately faulty training code."
      },
      {
        "id": "ex-17-2",
        "title": "Exercise 17.2: Watch a Variable",
        "description": "Write a program that increments a counter in a loop from 0 to 5, storing it in memory. Use GDB to set a watchpoint on the counter and observe each change.",
        "solution": "section .bss\n    counter resq 1\nsection .text\nglobal _start\n_start:\n    mov qword [counter], 0\n    mov rcx, 5\nloop:\n    inc qword [counter]\n    dec rcx\n    jnz loop\n    mov rax, 60\n    xor rdi, rdi\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "In GDB:\n\nEach continue stops when counter changes.\n\nAssemble with -g -F dwarf. In GDB: break _start; run; watch -l *(unsigned long long *)&counter; continue. Continue five times to observe values 1 through 5. An initialization store of the same value may not trigger a change watchpoint."
      },
      {
        "id": "ex-17-3",
        "title": "Exercise 17.3: Trace System Calls",
        "description": "Run any of your previous programs (e.g., file copy) under strace. Identify the system calls used and their arguments. Note any failed calls.",
        "solution": "strace -e trace=open,openat,read,write,close ./filecopy",
        "solutionLanguage": "bash",
        "solutionExplanation": "Use any program from Chapter 16 (file copy). Run strace ./filecopy input.txt output.txt. Observe open, read, write, close calls.\n\nCorrection: Chapter 16 uses fixed input.txt and output.txt names; the extra arguments are ignored. Create test input in a temporary working directory and use the command shown above. Inspect return values as well as arguments."
      },
      {
        "id": "ex-17-4",
        "title": "Exercise 17.4: Use Valgrind",
        "description": "Write a program that allocates memory with brk, writes to it, but forgets to deallocate (or writes out of bounds). Run under Valgrind and interpret the error report.",
        "solution": "section .bss\n    buffer resb 10\nsection .text\nglobal _start\n_start:\n    ; write 20 bytes into 10-byte buffer -> overflow\n    lea rdi, [buffer]\n    mov al, 'A'\n    mov rcx, 20\n    cld\n    rep stosb\n    mov rax, 60\n    xor rdi, rdi\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "Program that writes out of bounds:\nRun valgrind ./overflow. Valgrind reports invalid write beyond buffer.\n\nClarification: The original .bss overflow is intentional, but Valgrind may not detect an overrun within mapped static storage. Do not interpret an empty report as proof of correctness. The heap-backed demonstration below gives Memcheck allocation boundaries it can track."
      },
      {
        "id": "ex-17-5",
        "title": "Exercise 17.5: Disassemble",
        "description": "Use objdump -d -M intel on a simple program. Identify the machine code for a few instructions (e.g., mov rax, 1). Compare with what you wrote.",
        "solution": "nasm -f elf64 -g -F dwarf -l program.lst program.asm -o program.o\nld program.o -o program\nobjdump -d -M intel program",
        "solutionLanguage": "bash",
        "solutionExplanation": "Use any small program. objdump -d -M intel hello shows:\n400080: b8 01 00 00 00    mov eax,0x1\nCompare with NASM listing (nasm -l listfile).\n\nThe address is illustrative, not fixed. NASM may choose a shorter encoding for a known immediate; inspect the emitted bytes. mov eax,1 zero-extends into RAX."
      }
    ],
    "practiceQuestions": [
      {
        "question": "How do you enable debugging symbols in NASM? Why are they needed?",
        "answer": "Use nasm -f elf64 -g -F dwarf program.asm -o program.o, then link without stripping. Debug information maps instructions to source locations; labels alone may not supply data types."
      },
      {
        "question": "What is the difference between stepi and nexti in GDB?",
        "answer": "STEPi executes one instruction and enters a CALL target; NEXTi normally runs a called function until it returns. Breakpoints or signals can interrupt either operation."
      },
      {
        "question": "How do you examine the contents of the stack in GDB? Provide a command.",
        "answer": "x/4gx $rsp displays four eight-byte stack words in hexadecimal. Use x/16bx $rsp for individual bytes. Inspect only valid memory."
      },
      {
        "question": "What is a watchpoint? How does it differ from a breakpoint?",
        "answer": "A breakpoint stops at an instruction location. A watchpoint stops when a watched expression changes, commonly a memory value. Hardware memory watchpoints are limited; use explicit widths for untyped assembly labels."
      },
      {
        "question": "How can you disassemble code in GDB? What about outside GDB?",
        "answer": "Inside GDB: set disassembly-flavor intel; disassemble _start; x/10i $rip. Outside: objdump -d -M intel program. Source interleaving needs debug information."
      },
      {
        "question": "Explain how strace works and what information it provides.",
        "answer": "strace observes syscall entry/exit and displays numbers as names, arguments, results and errors. It adds overhead and can change timing; it does not trace each user-space instruction."
      },
      {
        "question": "What types of errors does Valgrind detect? Give examples.",
        "answer": "Memcheck detects many invalid memory accesses, uses of undefined data, and allocation leaks. It may miss intra-object or static-buffer overruns, and custom allocation boundaries need annotations or other verification."
      },
      {
        "question": "How do you set a conditional breakpoint in GDB?",
        "answer": "break *address if $rax == 5 sets an instruction breakpoint with a condition. Prefer a current symbol-derived address; stale absolute addresses may not correspond to the same code."
      },
      {
        "question": "Describe the purpose of the TUI mode in GDB. How do you enable it?",
        "answer": "TUI displays source, disassembly and registers in terminal panes. Use layout asm and layout regs or tui enable; toggle with Ctrl-x a. It needs an interactive terminal."
      },
      {
        "question": "What is a core dump? How can you use GDB to analyze one?",
        "answer": "A core dump captures process state at a failure, subject to system settings. Open gdb ./program corefile, inspect info registers, x/i $rip and bt; use the matching executable and debug information."
      }
    ],
    "summary": [
      "Debugging assembly requires a deep understanding of machine state; GDB provides the necessary tools.",
      "Always assemble with -g to include debug symbols.",
      "Use breakpoints, stepping, register examination, and memory inspection to trace execution.",
      "Watchpoints are invaluable for detecting memory changes.",
      "TUI mode offers a more visual debugging experience.",
      "Command files automate repetitive debugging tasks.",
      "objdump gives static disassembly; strace traces system calls; valgrind catches memory errors.",
      "Combining these tools makes assembly development more reliable and efficient.",
      "In the next chapter, we'll dive deeper into CPU architecture: pipelines, caches, and branch prediction—understanding how the hardware executes your code and how to optimize for it."
    ]
  }
];
