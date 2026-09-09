import { Chapter } from '../types';

export const CHAPTERS_LEVEL_4: Chapter[] = [
  {
    id: 18,
    slug: 'chapter-18-cpu-architecture-deep-dive',
    level: 4,
    levelTitle: 'Advanced Assembly',
    title: 'Chapter 18: CPU Architecture Deep Dive: Pipelines, Caches, Branch Prediction',
    subtitle: 'Superscalar Out-of-Order Execution, Cache Hierarchy, and Branch Prediction',
    learningObjectives: [
      'Understand instruction pipelining and hazards (data, control, structural).',
      'Analyze superscalar out-of-order execution, reorder buffers, and μops.',
      'Grasp the memory hierarchy: L1/L2/L3 caches, cache lines (64 bytes), and false sharing.',
      'Understand branch prediction penalties (15-20 cycles) and branchless programming.',
      'Profile code with Linux perf and cachegrind.'
    ],
    prerequisites: ['Chapters 1–17'],
    keyConcepts: [
      'CPUs execute μops out-of-order to maximize execution port throughput.',
      'Caches operate on 64-byte lines; sequential access preserves spatial locality.',
      'Branch mispredictions flush the pipeline and waste 15–20 CPU cycles.'
    ],
    diagramType: 'cpu_pipeline_cache',
    sections: [
      {
        id: 'sec-18-1',
        title: '18.1 Reducing Dependency Chains with Multiple Accumulators',
        content: `Breaking long dependency chains allows superscalar CPUs to execute additions across parallel ALUs:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'Dual Accumulator Sum',
            code: `; Sum array with two accumulators running in parallel
    xor rax, rax          ; accumulator 1
    xor rbx, rbx          ; accumulator 2
.loop:
    add rax, [rsi]        ; ALU 0
    add rbx, [rsi+8]      ; ALU 1 (independent from rax!)
    add rsi, 16
    dec rcx
    jnz .loop
    add rax, rbx          ; combine at end`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-18-1',
        title: 'Exercise 18.1: Branchless Absolute Value',
        description: 'Implement branchless absolute value using cmovs.',
        solution: `mov ebx, eax\nneg ebx\ncmovs eax, ebx   ; if sign set (negative), use negated value`,
        solutionLanguage: 'nasm'
      }
    ],
    practiceQuestions: [
      {
        question: 'What is false sharing and how is it avoided?',
        answer: 'False sharing occurs when threads on different cores update independent variables residing on the same 64-byte cache line, causing cache line invalidations. It is avoided by aligning shared variables to 64 bytes.'
      }
    ],
    summary: ['CPUs reorder instructions to eliminate bubbles.', 'Break dependency chains and align data to cache line boundaries.']
  },
  {
    id: 19,
    slug: 'chapter-19-abi-details-register-allocation',
    level: 4,
    levelTitle: 'Advanced Assembly',
    title: 'Chapter 19: ABI Details and Register Allocation',
    subtitle: 'Red Zone Semantics, Frame Pointer Omission, Live Ranges, and Spilling',
    learningObjectives: [
      'Master System V AMD64 ABI register assignments and caller/callee preservation.',
      'Utilize the 128-byte red zone in leaf functions without adjusting rsp.',
      'Understand register allocation, live ranges, and memory spilling.',
      'Read compiler register allocation in gcc -S -fverbose-asm.'
    ],
    prerequisites: ['Chapters 1–18'],
    keyConcepts: [
      'The red zone (128 bytes below rsp) can be used by leaf functions without sub rsp.',
      'Register pressure forces live variables into stack memory slots (spilling).',
      'Frame pointer omission (FPO) frees rbp for general computation.'
    ],
    diagramType: 'abi_register_alloc',
    sections: [
      {
        id: 'sec-19-1',
        title: '19.1 Leaf Function Red Zone Usage',
        content: `A leaf function that does not call any other functions can use the red zone directly:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'leaf_red_zone.asm',
            code: `; my_leaf: stores locals in 128-byte red zone without sub rsp
my_leaf:
    mov [rsp-8], rdi     ; store local 1 in red zone
    mov [rsp-16], rsi    ; store local 2 in red zone
    mov rax, [rsp-8]
    add rax, [rsp-16]
    ret                  ; zero prologue/epilogue overhead`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-19-1',
        title: 'Exercise 19.1: Preserve Callee-Saved Registers',
        description: 'Write a prologue and epilogue that safely preserves rbx, r12, and r13.',
        solution: `my_func:\n    push rbx\n    push r12\n    push r13\n    ; ... body ...\n    pop r13\n    pop r12\n    pop rbx\n    ret`,
        solutionLanguage: 'nasm'
      }
    ],
    practiceQuestions: [
      {
        question: 'What is the red zone in x86-64 Linux?',
        answer: 'The red zone is a 128-byte memory space directly below the current stack pointer (rsp) that cannot be clobbered by signals or interrupt handlers, usable by leaf functions without allocating stack space.'
      }
    ],
    summary: ['System V ABI governs register usage.', 'Red zone accelerates leaf function execution.']
  },
  {
    id: 20,
    slug: 'chapter-20-inline-assembly-c-integration',
    level: 4,
    levelTitle: 'Advanced Assembly',
    title: 'Chapter 20: Inline Assembly and Integration with C/C++',
    subtitle: 'GCC Extended Asm: Constraints, Operands, Clobber Lists, and CPUID',
    learningObjectives: [
      'Master GCC extended inline assembly syntax: asm volatile ( ... : out : in : clobber ).',
      'Use operand constraints: "r" (register), "m" (memory), "a" (rax), "cc" (flags).',
      'Avoid clobbering registers without informing the compiler optimizer.',
      'Query processor capabilities using the cpuid instruction.'
    ],
    prerequisites: ['Chapters 1–19'],
    keyConcepts: [
      'Extended asm binds C variables to assembly operands (%0, %1).',
      'The clobber list tells the compiler which registers or memory are modified.',
      'volatile prevents the compiler from optimizing away side-effecting code.'
    ],
    diagramType: 'inline_assembly',
    sections: [
      {
        id: 'sec-20-1',
        title: '20.1 Querying CPU Vendor String with Inline CPUID',
        content: `Reading CPUID leaf 0 to extract the 12-character vendor string ("GenuineIntel" or "AuthenticAMD"):`,
        codeSnippets: [
          {
            language: 'c',
            title: 'cpuid_vendor.c',
            code: `#include <stdio.h>
int main() {
    unsigned int eax, ebx, ecx, edx;
    char vendor[13];
    asm volatile ("cpuid"
                  : "=a"(eax), "=b"(ebx), "=c"(ecx), "=d"(edx)
                  : "a"(0)
                  );
    ((unsigned int*)vendor)[0] = ebx;
    ((unsigned int*)vendor)[1] = edx;
    ((unsigned int*)vendor)[2] = ecx;
    vendor[12] = '\\0';
    printf("CPU Vendor: %s\\n", vendor);
    return 0;
}`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-20-1',
        title: 'Exercise 20.1: Reading Timestamp Counter with RDTSC',
        description: 'Write inline assembly to read the 64-bit cycle count with rdtsc.',
        solution: `uint64_t start_lo, start_hi;\nasm volatile ("rdtsc" : "=a"(start_lo), "=d"(start_hi));\nuint64_t cycles = (start_hi << 32) | start_lo;`,
        solutionLanguage: 'c'
      }
    ],
    practiceQuestions: [
      {
        question: 'Why do you need to write %% in GCC extended asm strings?',
        answer: 'Because % introduces operand placeholders like %0 or %1. To reference a literal hardware register like %%eax, you must escape the percent sign with %%.'
      }
    ],
    summary: ['Extended asm integrates assembly into high-level C programs.', 'Constraints and clobber lists maintain register state correctness.']
  },
  {
    id: 21,
    slug: 'chapter-21-performance-optimization-techniques',
    level: 4,
    levelTitle: 'Advanced Assembly',
    title: 'Chapter 21: Performance Optimization Techniques',
    subtitle: 'Loop Unrolling, Strength Reduction, Cache Blocking, and SIMD Kernel',
    learningObjectives: [
      'Apply systematic profiling with perf stat and perf record.',
      'Implement loop unrolling and loop fusion.',
      'Optimize memory access with cache blocking (tiling) and prefetching.',
      'Construct a highly optimized vector dot product kernel.'
    ],
    prerequisites: ['Chapters 1–20'],
    keyConcepts: [
      'Always profile first: optimize hotspots, not cold code.',
      'Loop unrolling reduces loop branch overhead and increases ILP.',
      'Cache blocking keeps active matrices within L1/L2 cache.'
    ],
    diagramType: 'optimization_techniques',
    sections: [
      {
        id: 'sec-21-1',
        title: '21.1 High-Performance Dot Product Kernel',
        content: `An unrolled 4x kernel with 4 independent SIMD accumulators and prefetching:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'dot_product_opt.asm',
            code: `dot_product_opt:
    xorps xmm0, xmm0     ; acc0
    xorps xmm1, xmm1     ; acc1
    xorps xmm2, xmm2     ; acc2
    xorps xmm3, xmm3     ; acc3
    mov ecx, edx
    shr ecx, 4           ; 16 floats per iteration
    test ecx, ecx
    jz .done
.loop:
    prefetcht0 [rdi + 256]
    prefetcht0 [rsi + 256]
    movaps xmm4, [rdi]
    mulps xmm4, [rsi]
    addps xmm0, xmm4
    movaps xmm5, [rdi+16]
    mulps xmm5, [rsi+16]
    addps xmm1, xmm5
    movaps xmm6, [rdi+32]
    mulps xmm6, [rsi+32]
    addps xmm2, xmm6
    movaps xmm7, [rdi+48]
    mulps xmm7, [rsi+48]
    addps xmm3, xmm7
    add rdi, 64
    add rsi, 64
    dec ecx
    jnz .loop
    addps xmm0, xmm1
    addps xmm2, xmm3
    addps xmm0, xmm2
.done:
    ret`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-21-1',
        title: 'Exercise 21.1: Strength Reduction for Multiply by 10',
        description: 'Replace imul rax, 10 with lea instructions.',
        solution: `lea rax, [rax + rax*4]   ; rax = 5 * rax\nlea rax, [rax + rax]     ; rax = 10 * rax`,
        solutionLanguage: 'nasm'
      }
    ],
    practiceQuestions: [
      {
        question: 'Why is prefetcht0 beneficial in memory-bound loops?',
        answer: 'prefetcht0 informs the CPU memory controller to proactively fetch upcoming cache lines into L1 cache before the program actually accesses them, hiding memory bus latency.'
      }
    ],
    summary: ['Unrolling and multiple accumulators boost instructions per cycle.', 'Prefetching and alignment eliminate memory bottlenecks.']
  },
  {
    id: 22,
    slug: 'chapter-22-atomic-operations-multithreading',
    level: 4,
    levelTitle: 'Advanced Assembly',
    title: 'Chapter 22: Atomic Operations, Multithreading, and Concurrency',
    subtitle: 'Lock Prefix, CMPXCHG, Memory Fences (mfence), Spinlocks, and Futex',
    learningObjectives: [
      'Understand race conditions and the necessity of hardware atomicity.',
      'Master the lock prefix and atomic xchg and cmpxchg instructions.',
      'Apply memory ordering fences: mfence, lfence, sfence.',
      'Implement an efficient assembly spinlock with pause.',
      'Implement sleeping mutexes using the Linux futex system call.'
    ],
    prerequisites: ['Chapters 1–21'],
    keyConcepts: [
      'The lock prefix asserts hardware bus/cache locking for read-modify-write operations.',
      'xchg is implicitly locked when accessing memory operands.',
      'cmpxchg (Compare-and-Swap) is the cornerstone of lock-free data structures.'
    ],
    diagramType: 'atomic_concurrency',
    sections: [
      {
        id: 'sec-22-1',
        title: '22.1 Assembly Spinlock Implementation',
        content: `A high-performance spinlock using test-and-test-and-set and the pause instruction:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'spinlock.asm',
            code: `global spin_lock
global spin_unlock

section .text
spin_lock:
    mov rax, 1
.retry:
    cmp qword [rdi], 0   ; non-atomic test to prevent cache thrashing
    jne .spin
    xchg rax, [rdi]      ; atomic swap (implicitly locked)
    test rax, rax
    jnz .retry           ; if was 1, someone else grabbed it; spin
    ret                  ; lock acquired!
.spin:
    pause                ; de-pipeline spin loop to reduce power/latency
    jmp .retry

spin_unlock:
    mov qword [rdi], 0   ; release lock
    ret`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-22-1',
        title: 'Exercise 22.1: Lock-Free Stack Push',
        description: 'Implement lock-free push onto a singly linked list using cmpxchg in a retry loop.',
        solution: `push_node:\n    mov rax, [rdi]        ; current head\n.retry:\n    mov [rsi + Node.next], rax\n    lock cmpxchg [rdi], rsi\n    jnz .retry\n    ret`,
        solutionLanguage: 'nasm'
      }
    ],
    practiceQuestions: [
      {
        question: 'What does the pause instruction do inside a spinlock loop?',
        answer: 'pause hints to the CPU pipeline that a spin-wait loop is running, reducing power consumption and preventing speculative execution pipeline flushes upon exiting the loop.'
      }
    ],
    summary: ['Atomic instructions guarantee thread safety across CPU cores.', 'Memory fences prevent out-of-order memory reordering bugs.']
  }
];
