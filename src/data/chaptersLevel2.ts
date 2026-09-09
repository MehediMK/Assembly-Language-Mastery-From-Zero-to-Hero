import { Chapter } from '../types';

export const CHAPTERS_LEVEL_2: Chapter[] = [
  {
    id: 6,
    slug: 'chapter-6-data-movement-addressing',
    level: 2,
    levelTitle: 'Core Assembly Programming',
    title: 'Chapter 6: Data Movement and Addressing Modes',
    subtitle: 'Sign Extension, Scale Index Displacement, and Conditional Moves',
    learningObjectives: [
      'Master the mov instruction and its variations (movzx, movsx, movsxd).',
      'Understand and use all x86-64 addressing modes: immediate, register, direct, indirect, base+displacement, indexed, and RIP-relative.',
      'Learn how to compute effective addresses using lea.',
      'Explore stack operations (push, pop) and their effects on rsp.',
      'Use conditional move instructions (cmovcc) to avoid branches.',
      'Understand data alignment and its impact on performance.'
    ],
    prerequisites: ['Chapters 1–5'],
    keyConcepts: [
      'Addressing modes calculate effective memory addresses for operands.',
      'movzx zero-extends unsigned values; movsx sign-extends negative values.',
      'cmovcc copies data based on flags without branch pipeline penalty.',
      'Alignment of 16 bytes on stack prevents execution stalls.'
    ],
    diagramType: 'addressing_modes',
    sections: [
      {
        id: 'sec-6-1',
        title: '6.1 The mov Instruction & Addressing Modes',
        content: `x86-64 supports rich addressing modes combining base registers, index registers, scale factors (1, 2, 4, 8), and displacements:
mov rax, [rbx + rcx*4 + 16]

Conditional Move (cmovcc):
cmovcc destination, source moves data only when condition is met. Because it does not branch, the CPU pipeline avoids costly branch mispredictions:
cmp rax, rbx
cmovg rax, rbx   ; if rax > rbx (signed), rax = rbx`
      },
      {
        id: 'sec-6-2',
        title: '6.2 Addressing Array Sum and Extension Example',
        content: `Demonstrating indexed addressing [array + rcx*4]:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'Indexed Array Traversal',
            code: `section .data
    array dd 1,2,3,4,5,6,7,8,9,10
    len equ 10

section .text
    global _start
_start:
    xor eax, eax          ; sum = 0
    xor rcx, rcx          ; index = 0
loop_start:
    cmp rcx, len
    je done
    add eax, [array + rcx*4]  ; indexed addressing
    inc rcx
    jmp loop_start
done:
    mov rdi, rax          ; exit code = sum (55)
    mov rax, 60
    syscall`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-6-1',
        title: 'Exercise 6.1: Conditional Max Without Jumps',
        description: 'Compute max(rax, rbx) using cmp and cmovg without branches.',
        solution: `cmp rax, rbx\ncmovl rax, rbx    ; if rax < rbx, rax = rbx`,
        solutionLanguage: 'nasm'
      }
    ],
    practiceQuestions: [
      {
        question: 'What is the difference between mov rax, [rbx] and lea rax, [rbx]?',
        answer: 'mov rax, [rbx] dereferences the memory address stored in rbx and loads the 8-byte value at that location into rax. lea rax, [rbx] loads the address itself into rax without touching memory.'
      }
    ],
    summary: ['Addressing modes provide flexible pointer math.', 'cmovcc eliminates branch mispredictions.']
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
