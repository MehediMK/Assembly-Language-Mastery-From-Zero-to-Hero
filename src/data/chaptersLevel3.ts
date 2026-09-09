import { Chapter } from '../types';

export const CHAPTERS_LEVEL_3: Chapter[] = [
  {
    id: 12,
    slug: 'chapter-12-advanced-addressing-pointers',
    level: 3,
    levelTitle: 'Intermediate Assembly',
    title: 'Chapter 12: Advanced Addressing Modes and Pointers',
    subtitle: 'Pointer to Pointer, Dispatch Tables, Complex Arithmetic with LEA',
    learningObjectives: [
      'Master the full range of x86-64 addressing modes.',
      'Use lea for complex non-destructive arithmetic and multiplication by constants.',
      'Manipulate pointer variables, double pointers, and pointer arrays.',
      'Implement function pointer tables (dispatch tables) for calculators and state machines.',
      'Understand position-independent code (PIC) via RIP-relative addressing.'
    ],
    prerequisites: ['Chapters 1–11'],
    keyConcepts: [
      'lea performs arithmetic using addressing hardware without modifying CPU status flags.',
      'Function pointers enable virtual method dispatch and callbacks.',
      'RIP-relative addressing allows binaries to execute at arbitrary load addresses.'
    ],
    diagramType: 'advanced_pointers',
    sections: [
      {
        id: 'sec-12-1',
        title: '12.1 Function Pointer Table (Dispatch Table)',
        content: `Calculator operation dispatching via array of function pointers:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'dispatch_table.asm',
            code: `section .data
    ops dq add_op, sub_op, mul_op, div_op

section .text
    global _start

add_op: mov rax, rdi; add rax, rsi; ret
sub_op: mov rax, rdi; sub rax, rsi; ret
mul_op: mov rax, rdi; imul rax, rsi; ret
div_op: mov rax, rdi; xor rdx, rdx; div rsi; ret

_start:
    mov rdi, 10
    mov rsi, 5
    mov rcx, 2            ; operation index (2 = mul)
    lea rax, [ops]
    mov rbx, [rax + rcx*8] ; load function pointer
    call rbx              ; call mul_op -> rax = 50
    mov rdi, rax
    mov rax, 60
    syscall`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-12-1',
        title: 'Exercise 12.1: Multiply by 7 using LEA and SUB',
        description: 'Multiply rbx by 7 using lea and sub without imul.',
        solution: `lea rax, [rbx*8]    ; rax = 8 * rbx\nsub rax, rbx        ; rax = 7 * rbx`,
        solutionLanguage: 'nasm'
      }
    ],
    practiceQuestions: [
      {
        question: 'What is the advantage of using lea for arithmetic instead of mul/imul?',
        answer: 'lea executes in a single cycle on the address calculation unit, avoids multiplier latency, and does not alter the RFLAGS register.'
      }
    ],
    summary: ['Complex addressing modes streamline multi-dimensional arrays and structs.', 'Dispatch tables optimize multi-way branch selection.']
  },
  {
    id: 13,
    slug: 'chapter-13-structures-memory-manipulation',
    level: 3,
    levelTitle: 'Intermediate Assembly',
    title: 'Chapter 13: Structures and Memory Manipulation',
    subtitle: 'Struct Layout, C ABI Padding, Linked Lists, and Block Memory Functions',
    learningObjectives: [
      'Define structures using NASM struc / endstruc macros.',
      'Access members with base+offset addressing.',
      'Calculate struct padding and alignment to match C ABI.',
      'Manipulate linked lists of structures (insertion, deletion, traversal).',
      'Implement memset, memcpy, and memcmp.'
    ],
    prerequisites: ['Chapters 1–12'],
    keyConcepts: [
      'C compilers insert padding bytes so members land on natural alignment boundaries.',
      'NASM struc defines offsets; memory must still be reserved explicitly.',
      'memmove correctly handles overlapping memory by checking pointer direction.'
    ],
    diagramType: 'structures_memory',
    sections: [
      {
        id: 'sec-13-1',
        title: '13.1 Linked List Deletion with Structs',
        content: `Traversing and deleting a node from a linked list:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'linked_list.asm',
            code: `struc Node
    .value: resq 1
    .next:  resq 1
endstruc

section .data
    n1: dq 10, n2
    n2: dq 20, n3
    n3: dq 30, 0        ; null terminates list

section .text
    global _start
_start:
    ; Delete node n2 (update n1.next -> n3)
    lea rsi, [n1]       ; current node
    lea rbx, [n2]       ; target to delete
.find_loop:
    mov rax, [rsi + Node.next]
    cmp rax, rbx
    je .found
    mov rsi, rax
    jmp .find_loop
.found:
    mov rax, [rbx + Node.next] ; n3
    mov [rsi + Node.next], rax ; n1.next = n3

    ; Verify: sum remaining values (10 + 30 = 40)
    lea rsi, [n1]
    xor rcx, rcx
.sum_loop:
    test rsi, rsi
    jz .done
    add rcx, [rsi + Node.value]
    mov rsi, [rsi + Node.next]
    jmp .sum_loop
.done:
    mov rdi, rcx        ; exit code = 40
    mov rax, 60
    syscall`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-13-1',
        title: 'Exercise 13.1: Calculate Struct Size with Padding',
        description: 'Given struct { char c; int i; short s; }, determine field offsets and total padded size on x86-64.',
        solution: 'offset 0: c (1 byte)\noffset 1-3: padding (3 bytes)\noffset 4-7: i (4 bytes)\noffset 8-9: s (2 bytes)\noffset 10-11: padding (2 bytes)\nTotal size = 12 bytes (padded to multiple of 4, the largest member).',
        solutionLanguage: 'c'
      }
    ],
    practiceQuestions: [
      {
        question: 'Why does C insert padding in structures?',
        answer: 'Modern CPUs read memory far faster when multi-byte types are aligned to addresses divisible by their size. Misaligned access causes penalty or bus exceptions.'
      }
    ],
    summary: ['Structures group related fields contiguously.', 'Alignment padding is critical for C interoperability.']
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
