import { Chapter } from '../types';

export const CHAPTERS_LEVEL_4: Chapter[] = [
  {
    "id": 18,
    "slug": "chapter-18-cpu-architecture-deep-dive",
    "level": 4,
    "levelTitle": "Advanced Assembly",
    "title": "Chapter 18: CPU Architecture Deep Dive: Pipelines, Caches, Branch Prediction",
    "subtitle": "Superscalar Out-of-Order Execution, Cache Hierarchy, and Branch Prediction",
    "learningObjectives": [
      "Understand how modern CPUs execute instructions: pipelining, superscalar, and out-of-order execution.",
      "Grasp the memory hierarchy: registers, L1/L2/L3 caches, main memory, and their performance characteristics.",
      "Learn how cache lines, associativity, and locality affect assembly performance.",
      "Understand branch prediction and the cost of branch mispredictions.",
      "Apply this knowledge to write assembly code that minimizes stalls, exploits caches, and reduces branch mispredictions.",
      "Use performance analysis tools like perf to measure and identify bottlenecks."
    ],
    "prerequisites": [
      "Solid understanding of assembly instructions, registers, and memory addressing (Chapters 3, 6, 9).",
      "Familiarity with control flow, loops, and procedures (Chapters 8, 10).",
      "Basic knowledge of system calls and debugging (Chapters 16, 17).",
      "Experience writing and optimizing simple assembly programs."
    ],
    "keyConcepts": [
      "Pipelining overlaps execution of multiple instructions by splitting them into stages.",
      "Superscalar CPUs can execute multiple instructions per clock cycle.",
      "Out-of-order execution allows the CPU to reorder instructions to avoid stalls.",
      "Caches are small, fast memories that store frequently used data; organized in lines (typically 64 bytes) and sets.",
      "Locality of reference (temporal and spatial) is critical for cache performance.",
      "Branch prediction guesses the outcome of conditional branches to keep the pipeline full; mispredictions cause penalties.",
      "Speculative execution executes instructions before knowing if they are needed; combined with branch prediction.",
      "Instruction-level parallelism (ILP) is limited by data dependencies; compilers and hand-optimized assembly can increase ILP.",
      "Optimization techniques: loop unrolling, software pipelining, cache blocking, prefetching, branchless code."
    ],
    "diagramType": "cpu_pipeline_cache",
    "sections": [
      {
        "id": "sec-18-1",
        "title": "18.1 Introduction to CPU Microarchitecture",
        "content": "The x86-64 architecture defines the instruction set, but the underlying implementation (microarchitecture) varies greatly between CPU models. Modern CPUs are complex machines designed to execute instructions as fast as possible. Understanding their internal organization helps us write efficient assembly.\n\nKey components:\n\n- Front-end: Fetches and decodes instructions into micro-operations (μops).\n- Execution engine: Executes μops out-of-order using multiple execution units.\n- Memory subsystem: Caches and memory controllers.\n\nThe CPU does not execute instructions one at a time in program order. Instead, it uses pipelining, superscalar execution, and out-of-order processing to keep its execution units busy.\n\nClarification: Microarchitecture differs by CPU: not every processor is out-of-order. The five-stage pipeline is a teaching model, not the actual stage diagram of every x86 core."
      },
      {
        "id": "sec-18-2",
        "title": "18.2 Instruction Pipelining",
        "content": "A pipeline divides instruction execution into stages, like an assembly line. The classic five-stage RISC pipeline:\n\n1. Fetch – Read instruction from memory (or instruction cache).\n2. Decode – Determine operation and operands.\n3. Execute – Perform ALU operation or address calculation.\n4. Memory – Access data memory if needed.\n5. Write-back – Write result to register.\n\nIn a pipelined CPU, each stage processes a different instruction simultaneously. Thus, while one instruction is being executed, the next is being decoded, and the one after is being fetched. This greatly increases throughput."
      },
      {
        "id": "sec-18-2-1",
        "title": "18.2.1 Pipeline Hazards",
        "content": "Hazards prevent the next instruction from executing in the next clock cycle.\n\n- Data hazards: An instruction depends on the result of a previous instruction that hasn't completed. Example:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "18.2.1 Pipeline Hazards — listing 1",
            "code": "add rax, rbx\nsub rcx, rax     ; needs rax from previous add",
            "explanation": "The CPU can use forwarding (bypassing) to pass the result directly to the next instruction without waiting for write-back, but some latency remains.\n\n- Control hazards: Branch instructions change the flow, so the CPU doesn't know which instruction to fetch next until the branch is resolved. Branch prediction mitigates this.\n\n- Structural hazards: Two instructions need the same hardware resource (e.g., one memory port). Superscalar CPUs have multiple ports, but conflicts can still stall."
          }
        ]
      },
      {
        "id": "sec-18-2-2",
        "title": "18.2.2 Pipeline Stalls",
        "content": "When a hazard cannot be resolved, the pipeline stalls (inserts bubbles). Stalls waste cycles. The goal of optimization is to reduce stalls by reordering instructions (either by the compiler or manually) to increase distance between dependent instructions.\n\nExample: Reordering to avoid stall",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original",
            "code": "; Original\nmov rax, [mem1]   ; load (high latency)\nadd rax, 1        ; depends on load\nmov rbx, [mem2]   ; independent load\nadd rbx, 2\n\n; Reordered (by CPU or compiler)\nmov rax, [mem1]\nmov rbx, [mem2]   ; start second load while first is in flight\nadd rax, 1\nadd rbx, 2",
            "explanation": "Modern CPUs do this reordering automatically via out-of-order execution, but understanding helps in manual optimization."
          }
        ]
      },
      {
        "id": "sec-18-3",
        "title": "18.3 Superscalar and Out-of-Order Execution",
        "content": ""
      },
      {
        "id": "sec-18-3-1",
        "title": "18.3.1 Superscalar",
        "content": "A superscalar CPU has multiple execution units (ALUs, load/store units, FPUs) and can issue multiple instructions per clock cycle. For example, an Intel Core CPU can decode up to 4-5 instructions per cycle and dispatch up to 8 μops. This means that independent instructions can execute in parallel.\n\nExample: Two independent additions\n\nClarification: Decode width, dispatch width, cache sizes, latencies and misprediction costs in this chapter are illustrative, not guarantees for all Intel Core or x86 processors. Identify the measured CPU before interpreting counters.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "18.3.1 Superscalar — listing 1",
            "code": "add rax, rbx\nadd rcx, rdx",
            "explanation": "These can be executed simultaneously by different ALUs.\n\nTo exploit superscalar execution, keep instructions independent where possible."
          }
        ]
      },
      {
        "id": "sec-18-3-2",
        "title": "18.3.2 Out-of-Order Execution",
        "content": "Out-of-order (OoO) execution allows the CPU to reorder instructions at runtime to avoid stalls while maintaining the appearance of in-order execution (to the programmer). The CPU uses a reorder buffer (ROB) and reservation stations to track dependencies and issue instructions as soon as their operands are ready.\n\nThis means the CPU can effectively hide some latencies, but it has limits (size of ROB, number of execution units). Long dependency chains can still cause stalls.\n\nImplication for assembly: Even if you write code in a certain order, the CPU may execute it differently. However, you can still influence performance by:\n- Reducing dependency chains.\n- Using registers to break false dependencies (e.g., xor reg, reg instead of mov reg, 0 to avoid a false dependency on the previous value of reg).\n- Increasing instruction-level parallelism (ILP).\n\nClarification: MOV reg,0 does not depend on the old destination either. XOR of a register with itself is often recognized as a dependency-breaking zero idiom and has a compact encoding; its advantages are not that MOV immediate inherently retains an old-value dependency. XOR changes flags, MOV does not."
      },
      {
        "id": "sec-18-4",
        "title": "18.4 Memory Hierarchy and Caches",
        "content": "Memory access is a major bottleneck. The CPU clock runs at gigahertz, but main memory (DRAM) latency is around 50-100 ns (hundreds of cycles). Caches bridge this gap."
      },
      {
        "id": "sec-18-4-1",
        "title": "18.4.1 Cache Levels",
        "content": "- L1 cache: Smallest (32-64 KB), fastest (4-5 cycles latency), split into instruction (L1I) and data (L1D) caches.\n- L2 cache: Larger (256 KB-1 MB), slower (~12 cycles), unified.\n- L3 cache: Even larger (several MB), slower (~40 cycles), shared among cores.\n- Main memory: Very large, very slow.\n\nData is transferred between caches and memory in cache lines, typically 64 bytes on x86. When a byte is accessed, the entire 64-byte line is loaded into cache."
      },
      {
        "id": "sec-18-4-2",
        "title": "18.4.2 Cache Organization",
        "content": "Caches are organized as sets and ways. The details matter for performance but are complex. Key points:\n- Set-associative: A memory address maps to a set, and can be stored in any of the ways within that set. This reduces conflicts.\n- Replacement policy: Usually LRU (least recently used).\n\nClarification: Replacement policies are often approximations or adaptive policies, not exact LRU. Cache misses may overlap with other work; a miss does not necessarily stall the whole core. Shared-cache topology varies by processor."
      },
      {
        "id": "sec-18-4-3",
        "title": "18.4.3 Locality of Reference",
        "content": "- Temporal locality: Recently accessed data is likely to be accessed again soon. Keep frequently used variables in registers; if memory, they stay in cache.\n- Spatial locality: Nearby memory locations are likely to be accessed soon. Access arrays sequentially to utilize the entire cache line."
      },
      {
        "id": "sec-18-4-4",
        "title": "18.4.4 Cache Misses",
        "content": "When data is not in cache, a cache miss occurs, causing a stall. Misses can be:\n- Compulsory (first access)\n- Capacity (working set too large)\n- Conflict (multiple addresses map to same set)\n\nOptimization tips:\n- Access memory sequentially (stride-1) to maximize spatial locality.\n- Reuse data while it's still in cache (temporal locality).\n- Avoid large random accesses; use blocking (tiling) for matrices.\n- Align data to cache line boundaries to avoid split lines."
      },
      {
        "id": "sec-18-4-5",
        "title": "18.4.5 Prefetching",
        "content": "Modern CPUs have hardware prefetchers that detect sequential access patterns and load upcoming cache lines automatically. You can also use software prefetch instructions (prefetcht0, prefetcht1, prefetchnta) to hint the CPU.\n\nExample:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "18.4.5 Prefetching — listing 1",
            "code": "prefetcht0 [rsi + 64]   ; prefetch next cache line"
          }
        ]
      },
      {
        "id": "sec-18-5",
        "title": "18.5 Cache Coherence and False Sharing",
        "content": "In multicore systems, each core has its own L1/L2 caches, and they share L3 and memory. Cache coherence protocols (like MESI) ensure that all cores see a consistent memory view.\n\nFalse sharing: Two different variables that are independent but reside on the same cache line. When one core modifies its variable, the entire cache line is invalidated in other cores, causing unnecessary coherence traffic. This can severely degrade performance in multithreaded programs.\n\nAvoid false sharing by padding variables to separate cache lines or aligning them to 64-byte boundaries.\n\nExample:\n\nClarification: False sharing requires conflicting coherence traffic, typically at least one writer, on a shared line; independent read-only accesses do not cause write invalidations. Padding costs memory. Use alignb in BSS and verify the target cache-line size.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "18.5 Cache Coherence and False Sharing — listing 1",
            "code": "section .bss\n    align 64\n    var1 resq 1\n    align 64\n    var2 resq 1",
            "explanation": "Now var1 and var2 are on different cache lines."
          }
        ]
      },
      {
        "id": "sec-18-6",
        "title": "18.6 Branch Prediction",
        "content": "Branches are a major source of pipeline disruptions. When the CPU fetches a conditional branch, it doesn't yet know whether the branch will be taken. Branch prediction guesses the outcome, allowing the pipeline to continue speculatively. If the guess is correct, execution proceeds smoothly. If wrong, the pipeline must be flushed and restarted, incurring a penalty (typically 15-20 cycles on modern CPUs)."
      },
      {
        "id": "sec-18-6-1",
        "title": "18.6.1 Branch Predictor",
        "content": "Modern CPUs use sophisticated predictors:\n\n- Branch Target Buffer (BTB): Caches the target address of recently executed branches.\n- Pattern History Table (PHT): Records the recent taken/not-taken history of a branch to predict its next outcome.\n- Global history: Uses the outcome of previous branches to predict the current one.\n\nThe predictor works well for loops (e.g., a loop that runs many times is predicted taken until the final iteration). Random or unpredictable branches cause mispredictions."
      },
      {
        "id": "sec-18-6-2",
        "title": "18.6.2 Cost of Misprediction",
        "content": "When a misprediction occurs, all speculatively executed instructions after the branch must be discarded, and the pipeline is flushed. This wastes cycles and energy. In performance-critical code, minimizing unpredictable branches is important."
      },
      {
        "id": "sec-18-6-3",
        "title": "18.6.3 Branchless Programming",
        "content": "Replace conditional branches with arithmetic or conditional moves to avoid mispredictions.\n\nExample: Absolute value without branch\n\nClarification: NEG sets flags from the negated result, so the source CMOVS selects the wrong value. Test the original value after computing its negation, then use CMOVS. INT32_MIN has no positive signed 32-bit representation; its unsigned magnitude is 0x80000000. A procedure using RBX must preserve it.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Branch version",
            "code": "; Branch version\n    test eax, eax\n    jns .positive\n    neg eax\n.positive:\n    ; result in eax\n\n; Branchless using conditional move\n    mov ebx, eax\n    neg ebx\n    cmovs eax, ebx   ; if sign set (negative), use negated value",
            "explanation": "Or using bit tricks:"
          },
          {
            "language": "nasm",
            "title": "18.6.3 Branchless Programming — listing 2",
            "code": "    mov ebx, eax\n    sar ebx, 31      ; sign mask (all ones if negative)\n    xor eax, ebx\n    sub eax, ebx     ; absolute value",
            "explanation": "Branchless code is often faster when the branch is unpredictable, but may be slower if the branch is predictable because it executes extra instructions."
          },
          {
            "language": "nasm",
            "title": "Correct branchless absolute magnitude",
            "code": "; EAX=input; EAX=unsigned magnitude. ECX and flags clobbered.\nmov ecx, eax\nneg ecx\ntest eax, eax\ncmovs eax, ecx",
            "explanation": "Computes the original sign before selecting the negation; INT32_MIN produces unsigned 2147483648, not a representable signed int."
          }
        ]
      },
      {
        "id": "sec-18-6-4",
        "title": "18.6.4 Loop Unrolling to Reduce Branches",
        "content": "Loop unrolling reduces the number of branch instructions by executing multiple iterations per loop. This lowers branch overhead and can increase ILP.\n\nExample: Sum array with loop unrolling (4x)\n\nClarification: Unrolled fragments assume a positive chunk count and omit tails. Guard zero chunks and process length modulo the unroll factor. Four additions to one accumulator still form a dependency chain.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "18.6.4 Loop Unrolling to Reduce Branches — listing 1",
            "code": "    ; rcx = length/4\n.loop:\n    add rax, [rsi]\n    add rax, [rsi+8]\n    add rax, [rsi+16]\n    add rax, [rsi+24]\n    add rsi, 32\n    dec rcx\n    jnz .loop",
            "explanation": "Now only one branch per 4 elements."
          }
        ]
      },
      {
        "id": "sec-18-7",
        "title": "18.7 Impact on Assembly Programming: Optimization Techniques",
        "content": ""
      },
      {
        "id": "sec-18-7-1",
        "title": "18.7.1 Reduce Dependency Chains",
        "content": "Long chains of dependent instructions limit ILP. Break chains by using multiple accumulators.\n\nExample: Sum array with two accumulators",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "18.7.1 Reduce Dependency Chains — listing 1",
            "code": "    xor rax, rax\n    xor rbx, rbx\n.loop:\n    add rax, [rsi]\n    add rbx, [rsi+8]\n    add rsi, 16\n    dec rcx\n    jnz .loop\n    add rax, rbx",
            "explanation": "This allows two additions in parallel."
          }
        ]
      },
      {
        "id": "sec-18-7-2",
        "title": "18.7.2 Use Registers Efficiently",
        "content": "- Avoid false dependencies by zeroing with xor reg, reg instead of mov reg, 0 (which may keep a dependency on the previous value).\n- Use all available registers to hold frequently used values.\n\nClarification: MOV of a full register from immediate zero is independent of its old value. Choose zero idioms based on encoding, flags, and target execution behavior rather than the source claim of a MOV false dependency."
      },
      {
        "id": "sec-18-7-3",
        "title": "18.7.3 Align Data and Code",
        "content": "- Align data to 16 or 64 bytes for SIMD and cache lines.\n- Align branch targets to 16 bytes to improve fetch efficiency (use align 16 before labels in hot loops)."
      },
      {
        "id": "sec-18-7-4",
        "title": "18.7.4 Minimize Memory Access",
        "content": "- Keep data in registers as much as possible.\n- Use movzx/movsx to avoid partial register stalls.\n- Access memory sequentially."
      },
      {
        "id": "sec-18-7-5",
        "title": "18.7.5 Use Prefetching",
        "content": "Insert prefetcht0 for large data streams to hide memory latency."
      },
      {
        "id": "sec-18-7-6",
        "title": "18.7.6 Avoid Unpredictable Branches",
        "content": "Use branchless techniques or convert to lookup tables."
      },
      {
        "id": "sec-18-8",
        "title": "18.8 Tools for Performance Analysis",
        "content": ""
      },
      {
        "id": "sec-18-8-1",
        "title": "18.8.1 perf",
        "content": "perf is a powerful Linux profiler that uses hardware performance counters to measure events like cycles, instructions, cache misses, branch mispredictions.\n\nBasic usage:\n\nClarification: Hardware counters may be unavailable under kernel policy or virtualization. perf stat reports only supported/permitted events; IPC is instructions/cycles, CPI its inverse. Repeat runs, use the same workload, separate setup from the timed region, and do not treat a single short run as evidence of a speedup.",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "18.8.1 perf — listing 1",
            "code": "perf stat ./program",
            "explanation": "This shows summary statistics: cycles, instructions, CPI, cache misses, branch mispredictions, etc.\n\nTo profile which functions are hot:"
          },
          {
            "language": "bash",
            "title": "18.8.1 perf — listing 2",
            "code": "perf record ./program\nperf report"
          }
        ]
      },
      {
        "id": "sec-18-8-2",
        "title": "18.8.2 valgrind --tool=cachegrind",
        "content": "Cachegrind simulates the cache hierarchy and reports cache miss rates. Useful for understanding memory access patterns.",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "18.8.2 valgrind --tool=cachegrind — listing 1",
            "code": "valgrind --tool=cachegrind ./program\ncg_annotate cachegrind.out.<pid>"
          }
        ]
      },
      {
        "id": "sec-18-8-3",
        "title": "18.8.3 likwid (optional)",
        "content": "likwid provides detailed microarchitectural measurements, but requires special setup."
      },
      {
        "id": "sec-18-9",
        "title": "18.9 Practical Example: Optimizing a Sum Loop",
        "content": "We'll write two versions of a sum loop: naive and optimized, and compare performance with perf.\n\nNaive version:\n\nClarification: The supplied million-element inputs are divisible by four, so both source loops return 1000000 modulo 256 = 64. General implementations need empty and tail handling. Time startup, page faults and cold-cache effects separately from a steady-state loop when drawing conclusions.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "sum_naive.asm",
            "code": "; sum_naive.asm\nsection .data\n    array times 1000000 dq 1\n    len equ 1000000\nsection .text\nglobal _start\n_start:\n    xor rax, rax\n    lea rsi, [array]\n    mov rcx, len\n.loop:\n    add rax, [rsi]\n    add rsi, 8\n    dec rcx\n    jnz .loop\n    ; exit with sum\n    mov rdi, rax\n    mov rax, 60\n    syscall",
            "explanation": "Optimized version (unrolled 4x, two accumulators):"
          },
          {
            "language": "nasm",
            "title": "sum_opt.asm",
            "code": "; sum_opt.asm\nsection .data\n    array times 1000000 dq 1\n    len equ 1000000\nsection .text\nglobal _start\n_start:\n    xor rax, rax\n    xor rbx, rbx\n    lea rsi, [array]\n    mov rcx, len / 4\n.loop:\n    add rax, [rsi]\n    add rbx, [rsi+8]\n    add rax, [rsi+16]\n    add rbx, [rsi+24]\n    add rsi, 32\n    dec rcx\n    jnz .loop\n    add rax, rbx\n    mov rdi, rax\n    mov rax, 60\n    syscall",
            "explanation": "Compile both and run perf stat to compare cycles and instructions per cycle."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 18.1",
            "code": "    mov rax, 1\n    mov rcx, 1000000\n.loop:\n    imul rax, 2       ; depends on previous rax\n    add rax, 1\n    dec rcx\n    jnz .loop\n\n    mov rax, 1\n    mov rbx, 1\n    mov rcx, 500000\n.loop:\n    imul rax, 2\n    imul rbx, 3       ; independent of rax\n    add rax, 1\n    add rbx, 1\n    dec rcx\n    jnz .loop",
            "explanation": "Original source exercise material retained. The completed solution below supplies a reproducible program and commands; performance is measured rather than guaranteed."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 18.2",
            "code": "    mov rsi, matrix\n    xor rcx, rcx\n.outer:\n    xor rdx, rdx\n.inner:\n    mov rax, [rsi + rcx*64 + rdx*8]  ; assume 8 columns of qwords\n    inc rdx\n    cmp rdx, 8\n    jl .inner\n    inc rcx\n    cmp rcx, 8\n    jl .outer",
            "explanation": "Original source exercise material retained. The completed solution below supplies a reproducible program and commands; performance is measured rather than guaranteed."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 18.3",
            "code": "Use an array with pattern 0,1,0,1,... (predictable) vs random numbers. Sum only if value is 1. Measure branch-misses in perf stat.",
            "explanation": "Original source exercise material retained. The completed solution below supplies a reproducible program and commands; performance is measured rather than guaranteed."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 18.4",
            "code": "Write three versions of a sum loop with unroll factors 2,4,8. Use perf stat to compare cycles. The optimal factor depends on CPU and code size.",
            "explanation": "Original source exercise material retained. The completed solution below supplies a reproducible program and commands; performance is measured rather than guaranteed."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 18.5",
            "code": "Memory-bound loop that reads a large array. Add prefetcht0 [rsi+64] inside loop before accessing current element. Measure with/without.",
            "explanation": "Original source exercise material retained. The completed solution below supplies a reproducible program and commands; performance is measured rather than guaranteed."
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-18-1",
        "title": "Exercise 18.1: Data Dependency",
        "description": "Write two loops: one with a long dependency chain (e.g., a = a * b + c repeatedly using the same register), and another with independent operations. Measure cycles with perf. Explain the difference.",
        "solution": "#include <stdint.h>\n#include <stdio.h>\n#include <stdlib.h>\nint main(int argc, char **argv) {\n    int independent = argc > 1 && atoi(argv[1]);\n    uint64_t a=1, b=1;\n    for (unsigned i=0; i<10000000; ++i) {\n        if (independent) {\n            __asm__ volatile(\"imul $3,%0; add $1,%0; imul $3,%1; add $1,%1\"\n                             : \"+r\"(a), \"+r\"(b) : : \"cc\");\n        } else {\n            __asm__ volatile(\"imul $3,%0; add $1,%0; imul $3,%0; add $1,%0\"\n                             : \"+r\"(a) : : \"cc\");\n        }\n    }\n    printf(\"%llu %llu\\n\", (unsigned long long)a, (unsigned long long)b);\n    return 0;\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "Dependency chain:\n\nIndependent operations:\n\nUse perf stat to see lower IPC in first due to dependency stalls.\n\nComplete Linux GCC measurement harness. Save as bench.c and build gcc -O2 -fno-tree-vectorize -fno-if-conversion -fno-if-conversion2 bench.c -o bench. Inspect objdump -d -M intel bench to confirm the intended loops; compare perf stat -r 5 -e cycles,instructions,cache-misses,branches,branch-misses ./bench 0 and ./bench 1. Compiler transformations, initialization and process startup influence results; no speedup is promised. Both paths execute two multiplies and two adds per iteration; independent streams intentionally have different checksums. The arithmetic uses low 64-bit results."
      },
      {
        "id": "ex-18-2",
        "title": "Exercise 18.2: Cache Locality",
        "description": "Create a program that accesses a 2D array in row-major order vs column-major order. Measure cache misses and time. Which is faster? Why?",
        "solution": "#include <stdint.h>\n#include <stdio.h>\n#include <stdlib.h>\n#define N 1024\nstatic uint64_t matrix[N][N];\nint main(int argc, char **argv) {\n    int column = argc > 1 && atoi(argv[1]);\n    for (unsigned i=0;i<N;i++) for(unsigned j=0;j<N;j++) matrix[i][j]=i+j;\n    volatile uint64_t *p=&matrix[0][0];\n    uint64_t sum=0;\n    for(unsigned repeat=0;repeat<8;repeat++)\n        for(unsigned i=0;i<N;i++) for(unsigned j=0;j<N;j++)\n            sum += p[column ? j*N+i : i*N+j];\n    printf(\"%llu\\n\",(unsigned long long)sum);\n    return sum == 8ULL*N*N*(N-1) ? 0 : 1;\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "Row-major:\n\nColumn-major: swap index order. Row-major exhibits better spatial locality.\n\nComplete Linux GCC measurement harness. Save as bench.c and build gcc -O2 -fno-tree-vectorize -fno-if-conversion -fno-if-conversion2 bench.c -o bench. Inspect objdump -d -M intel bench to confirm the intended loops; compare perf stat -r 5 -e cycles,instructions,cache-misses,branches,branch-misses ./bench 0 and ./bench 1. Compiler transformations, initialization and process startup influence results; no speedup is promised. The original [rsi+rcx*64+rdx*8] is unencodable. The C harness uses a valid linear index; in NASM combine i*columns+j before applying scale 8. Both traversals must produce the same checksum."
      },
      {
        "id": "ex-18-3",
        "title": "Exercise 18.3: Branch Prediction",
        "description": "Write a program that sums elements of an array where elements are either 0 or 1 based on a random pattern, vs an always-true branch. Measure branch mispredictions.",
        "solution": "#include <stdint.h>\n#include <stdio.h>\n#include <stdlib.h>\n#define N 1000000\nstatic unsigned char data[N];\nint main(int argc, char **argv) {\n    int random = argc > 1 && atoi(argv[1]);\n    uint32_t state=1234567;\n    uint64_t expected=0;\n    for(unsigned i=0;i<N;i++) {\n        state ^= state<<13; state ^= state>>17; state ^= state<<5;\n        data[i]=random ? (state&1) : 1;\n        expected += data[i];\n    }\n    uint64_t sum=0;\n    for(unsigned repeat=0;repeat<20;repeat++)\n        for(unsigned i=0;i<N;i++) if(data[i]) sum++;\n    printf(\"%llu\\n\",(unsigned long long)sum);\n    return sum == expected*20 ? 0 : 1;\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "\n\nComplete Linux GCC measurement harness. Save as bench.c and build gcc -O2 -fno-tree-vectorize -fno-if-conversion -fno-if-conversion2 bench.c -o bench. Inspect objdump -d -M intel bench to confirm the intended loops; compare perf stat -r 5 -e cycles,instructions,cache-misses,branches,branch-misses ./bench 0 and ./bench 1. Compiler transformations, initialization and process startup influence results; no speedup is promised."
      },
      {
        "id": "ex-18-4",
        "title": "Exercise 18.4: Loop Unrolling",
        "description": "Take a simple loop and unroll it by 2, 4, and 8. Measure performance. Find the optimal unroll factor.",
        "solution": "#include <stdint.h>\n#include <stdio.h>\n#include <stdlib.h>\n#ifndef UNROLL\n#define UNROLL 4\n#endif\n#if UNROLL != 2 && UNROLL != 4 && UNROLL != 8\n#error UNROLL must be 2, 4, or 8\n#endif\n#define N 1000003\nstatic uint64_t data[N];\nint main(void) {\n    for(unsigned i=0;i<N;i++) data[i]=1;\n    uint64_t lanes[UNROLL]={0}, sum=0;\n    unsigned i=0;\n    for(;i+UNROLL<=N;i+=UNROLL)\n        for(unsigned j=0;j<UNROLL;j++) lanes[j]+=data[i+j];\n    for(unsigned j=0;j<UNROLL;j++) sum+=lanes[j];\n    for(;i<N;i++) sum+=data[i];\n    printf(\"%llu\\n\",(unsigned long long)sum);\n    return sum==N ? 0 : 1;\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "\n\nComplete Linux GCC measurement harness. Save as bench.c and build gcc -O2 -fno-tree-vectorize -fno-if-conversion -fno-if-conversion2 bench.c -o bench. Inspect objdump -d -M intel bench to confirm the intended loops; compare perf stat -r 5 -e cycles,instructions,cache-misses,branches,branch-misses ./bench 0 and ./bench 1. Compiler transformations, initialization and process startup influence results; no speedup is promised. Build separate binaries with -DUNROLL=2, 4 and 8. All must print 1000003, including the remainder. The compiler may further transform these loops; inspect emitted assembly before attributing results to unroll factor."
      },
      {
        "id": "ex-18-5",
        "title": "Exercise 18.5: Prefetching",
        "description": "Use software prefetching (prefetcht0) in a memory-bound loop and measure performance improvement.",
        "solution": "#include <stdint.h>\n#include <stdio.h>\n#include <stdlib.h>\n#define N 1048576\nstatic uint64_t data[N];\nint main(int argc,char **argv) {\n    int prefetch=argc>1 && atoi(argv[1]);\n    for(unsigned i=0;i<N;i++) data[i]=1;\n    uint64_t sum=0;\n    for(unsigned i=0;i<N;i++) {\n        if(prefetch && i+32<N) __builtin_prefetch(&data[i+32],0,3);\n        sum+=data[i];\n    }\n    printf(\"%llu\\n\",(unsigned long long)sum);\n    return sum==N ? 0 : 1;\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "\n\nComplete Linux GCC measurement harness. Save as bench.c and build gcc -O2 -fno-tree-vectorize -fno-if-conversion -fno-if-conversion2 bench.c -o bench. Inspect objdump -d -M intel bench to confirm the intended loops; compare perf stat -r 5 -e cycles,instructions,cache-misses,branches,branch-misses ./bench 0 and ./bench 1. Compiler transformations, initialization and process startup influence results; no speedup is promised. Hardware prefetch often already handles sequential data. This example tests a hypothesis and may show no benefit or a regression; enlarge data and repeat the timed region when assessing memory bandwidth."
      }
    ],
    "practiceQuestions": [
      {
        "question": "What is instruction pipelining? What are the main pipeline hazards?",
        "answer": "Pipelining overlaps instruction stages to improve throughput. Data dependencies, control changes and shared-resource contention create hazards. Actual pipeline stages vary by microarchitecture."
      },
      {
        "question": "How does out-of-order execution help performance? What are its limits?",
        "answer": "Out-of-order execution issues ready work while other instructions wait, then retires results consistently with architectural rules. Dependencies, execution ports, reorder-window capacity, cache misses and bandwidth limit the benefit."
      },
      {
        "question": "Explain the memory hierarchy. Why are caches necessary?",
        "answer": "Registers are closest to execution, followed by caches and DRAM. Caches exploit reuse and locality to reduce expensive memory traffic; their exact capacities and latency depend on the CPU."
      },
      {
        "question": "What is a cache line? How does spatial locality affect cache performance?",
        "answer": "A cache line is the granularity of cache storage/coherence, commonly 64 bytes on x86. Sequential access uses nearby fetched bytes; large strides can waste bandwidth and increase misses."
      },
      {
        "question": "What is false sharing? How can you avoid it?",
        "answer": "False sharing occurs when independent data on one line causes coherence contention between cores, especially writers. Separate frequently written per-thread fields onto different lines, while weighing extra memory cost."
      },
      {
        "question": "How does branch prediction work? What happens on a misprediction?",
        "answer": "Predictors estimate branch direction and targets before resolution. A wrong prediction discards younger speculative work and redirects fetching; cost depends on CPU and surrounding work."
      },
      {
        "question": "What is branchless programming? When is it beneficial?",
        "answer": "Branchless code replaces control flow with masks, arithmetic or conditional moves. It can help unpredictable branches but can add work or dependencies; predictable branches may be better."
      },
      {
        "question": "How does loop unrolling improve performance? What are its drawbacks?",
        "answer": "Unrolling reduces loop control and exposes independent operations. It increases code size and register pressure and needs remainder handling; there is no universally best factor."
      },
      {
        "question": "What is a dependency chain? How can you break one?",
        "answer": "A dependency chain consists of operations waiting on prior results. Independent accumulators can split reductions into parallel chains, followed by a final combine; floating-point reassociation can change rounding."
      },
      {
        "question": "How can you use perf to measure cache misses and branch mispredictions?",
        "answer": "perf stat -r 5 -e cycles,instructions,cache-misses,branches,branch-misses ./program requests repeated counter measurements. Check permissions and event availability, report workload and CPU, and compare correctness before performance."
      }
    ],
    "summary": [
      "Modern CPUs use pipelining, superscalar, out-of-order execution to maximize instruction throughput.",
      "Memory hierarchy: registers fastest, then L1, L2, L3 caches, then main memory.",
      "Cache lines (64B) transfer data; exploit spatial and temporal locality.",
      "Branch prediction avoids pipeline stalls on branches; mispredictions cost ~15-20 cycles.",
      "Write assembly to reduce dependency chains, increase ILP, use registers, align data, minimize unpredictable branches, and possibly unroll loops or use prefetching.",
      "Tools like perf, cachegrind help identify bottlenecks.",
      "In the next chapter, we'll explore ABI details and register allocation, building on the performance foundations."
    ]
  },
  {
    "id": 19,
    "slug": "chapter-19-abi-details-register-allocation",
    "level": 4,
    "levelTitle": "Advanced Assembly",
    "title": "Chapter 19: ABI Details and Register Allocation",
    "subtitle": "Red Zone Semantics, Frame Pointer Omission, Live Ranges, and Spilling",
    "learningObjectives": [
      "Understand the Application Binary Interface (ABI) and its role in low-level programming.",
      "Master the System V AMD64 ABI specifics: data types, register usage, stack layout, and calling conventions.",
      "Learn about the red zone and its implications for leaf functions.",
      "Grasp register allocation concepts: register pressure, live ranges, spilling, and register classes.",
      "Apply manual register allocation techniques to write efficient assembly.",
      "Recognize how compilers perform register allocation and how to read compiler-generated assembly with this knowledge.",
      "Write assembly functions that correctly interoperate with C code, respecting ABI constraints."
    ],
    "prerequisites": [
      "Solid understanding of assembly instructions, registers, and stack frames (Chapters 3, 6, 10).",
      "Familiarity with procedures, calling conventions, and the stack (Chapter 10).",
      "Basic knowledge of C programming and compilation (optional but helpful).",
      "Understanding of data types and memory layout (Chapters 2, 13)."
    ],
    "keyConcepts": [
      "ABI defines the binary-level interface between program components: data representation, calling conventions, register usage, and stack layout.",
      "System V AMD64 ABI is the standard for 64-bit Linux and other Unix-like systems.",
      "Caller-saved registers: rax, rcx, rdx, rsi, rdi, r8–r11. The caller must preserve them if needed.",
      "Callee-saved registers: rbx, rbp, r12–r15. The callee must preserve them.",
      "Red zone: 128 bytes below rsp that can be used by leaf functions without adjusting the stack pointer.",
      "Stack alignment: The stack pointer must be 16-byte aligned before a call instruction.",
      "Register allocation is the process of assigning program variables to CPU registers; the goal is to minimize memory spills.",
      "Register pressure occurs when there are more live variables than available registers, forcing spills to memory.",
      "Spilling moves a variable from a register to memory (stack) because all registers are in use.",
      "Live range is the portion of code where a variable holds a value that will be used later."
    ],
    "diagramType": "abi_register_alloc",
    "sections": [
      {
        "id": "sec-19-1",
        "title": "19.1 Introduction to ABI",
        "content": "The Application Binary Interface (ABI) is a set of rules that govern how binary code interacts at the machine level. Unlike an API (Application Programming Interface), which is source-level, the ABI defines everything needed for separately compiled object files to link and run together: data type sizes, register usage, stack frame layout, calling conventions, and system call interface.\n\nWhy does ABI matter for assembly programmers?\n- When writing assembly functions that are called from C (or vice versa), you must follow the ABI to ensure correct parameter passing and return values.\n- The ABI dictates which registers you can safely use without saving, and which you must preserve.\n- Understanding the ABI helps you read compiler-generated assembly and debug issues.\n- For hand-optimized assembly, the ABI provides the framework for register usage.\n\nOn 64-bit Linux, the standard ABI is the System V AMD64 ABI. Microsoft Windows uses a different ABI (Microsoft x64), so code is not directly portable."
      },
      {
        "id": "sec-19-2",
        "title": "19.2 System V AMD64 ABI in Depth",
        "content": "Let's examine the key components of the System V AMD64 ABI that affect assembly programming."
      },
      {
        "id": "sec-19-2-1",
        "title": "19.2.1 Data Types and Sizes",
        "content": "When defining structures in assembly that must match C, use these alignment rules. Remember that the structure's total size is padded to the alignment of its most aligned member.",
        "tableData": {
          "headers": [
            "C Type",
            "Size (bytes)",
            "Alignment (bytes)",
            "Notes"
          ],
          "rows": [
            [
              "char",
              "1",
              "1",
              ""
            ],
            [
              "short",
              "2",
              "2",
              ""
            ],
            [
              "int",
              "4",
              "4",
              ""
            ],
            [
              "long",
              "8",
              "8",
              ""
            ],
            [
              "long long",
              "8",
              "8",
              ""
            ],
            [
              "float",
              "4",
              "4",
              "IEEE 754 single"
            ],
            [
              "double",
              "8",
              "8",
              "IEEE 754 double"
            ],
            [
              "pointer",
              "8",
              "8",
              ""
            ],
            [
              "long double",
              "16",
              "16",
              "80-bit extended, padded to 16"
            ]
          ]
        }
      },
      {
        "id": "sec-19-2-2",
        "title": "19.2.2 Register Usage",
        "content": "The ABI classifies registers into two categories:\n\nCaller-saved (volatile): These registers may be freely modified by the called function. If the caller needs their values after the call, it must save them before the call. They are:\n- rax (return value, also used as accumulator)\n- rcx (4th argument, but also used for loop and rep count)\n- rdx (3rd argument, also high half of 128-bit return)\n- rsi (2nd argument)\n- rdi (1st argument)\n- r8 (5th argument)\n- r9 (6th argument)\n- r10 (temporary, also 4th argument for syscalls)\n- r11 (temporary, clobbered by syscall)\n\nCallee-saved (non-volatile): The called function must preserve the original values of these registers. If it wants to use them, it must save them (typically on the stack) in the prologue and restore them in the epilogue. They are:\n- rbx\n- rbp (often used as frame pointer, but can be used as general-purpose if frame pointer omitted)\n- r12\n- r13\n- r14\n- r15\n- rsp (stack pointer, must be restored to original value before return)\n\nSpecial-purpose:\n- rip – instruction pointer, not directly accessible as a general register.\n- rflags – flags register.\n\nFloating-point/SIMD registers (xmm0–xmm15):\n- xmm0–xmm7 are caller-saved and used for passing floating-point arguments and returning values.\n- xmm8–xmm15 are callee-saved in the SysV ABI (unlike Microsoft x64 where all XMM are caller-saved). So if you use xmm8–xmm15 in a function, you must preserve them.\n\nClarification: The source reverses the XMM preservation rules. All XMM0–XMM15 are caller-saved in System V AMD64. Microsoft x64 preserves the low 128 bits of XMM6–XMM15. General-register callee saves remain RBX, RBP, R12–R15, with RSP restored. See the target ABI before crossing platform boundaries."
      },
      {
        "id": "sec-19-2-3",
        "title": "19.2.3 Calling Convention",
        "content": "Integer/pointer arguments:\n- First six: rdi, rsi, rdx, rcx, r8, r9.\n- Additional arguments are passed on the stack, in reverse order (so the 7th argument is at the lowest address of the stack arguments).\n\nFloating-point arguments:\n- First eight: xmm0–xmm7.\n- Additional floating-point arguments are passed on the stack.\n- If a function has both integer and floating-point arguments, they are numbered separately: integer arguments use the integer register sequence, and floating-point arguments use the XMM sequence. The registers are assigned based on the order of arguments in the function signature.\n\nReturn value:\n- Integer/pointer: rax.\n- Floating-point: xmm0.\n- If the return value is a structure, the rules are more complex: if the struct is small (<= 16 bytes) and contains only integer or pointer fields, it may be returned in rax and rdx. Larger structs are returned via a hidden pointer passed as the first argument (rdi).\n\nStack alignment:\n- Before a call instruction, rsp must be 16-byte aligned.\n- At function entry, rsp is 8 mod 16 (because the return address was pushed). The callee's prologue typically subtracts a multiple of 16 (or multiple of 16 + 8) to maintain alignment for nested calls.\n\nRed zone:\n- The 128 bytes below rsp are reserved for use by leaf functions (functions that do not call other functions) without adjusting rsp. This allows small local variables to be stored in the red zone without the overhead of sub rsp/add rsp. However, if the function calls another function, the red zone may be clobbered by the callee, so it cannot be used safely across calls.\n\nClarification: For ordinary scalar calls, entry RSP is 8 modulo 16. A frameless nonleaf can subtract 8 plus a multiple of 16; after PUSH RBP, subtract a multiple of 16. Aggregate return classification depends on field classes and alignment, not only size; a hidden return pointer also shifts integer arguments."
      },
      {
        "id": "sec-19-2-4",
        "title": "19.2.4 Stack Frame Layout",
        "content": "A typical stack frame with a frame pointer:\n\nClarification: [RBP+8] contains the return address, not a spilled sixth argument. The sixth integer argument arrives in R9; if saved, its local slot must be allocated separately. After a standard frame-pointer prologue the seventh qword stack argument is [RBP+16].",
        "codeSnippets": [
          {
            "language": "text",
            "title": "19.2.4 Stack Frame Layout — listing 1",
            "code": "        +------------------------+  Higher addresses\n        |       ...              |\n        | 7th argument (if any)  |  [rbp+16]\n        | 6th argument           |  [rbp+8]  (if spilled)\n        | Return Address         |  [rbp+8]\n        | Saved RBP              |  [rbp]   <-- rbp points here\n        | Local variable 1       |  [rbp-8]\n        | Local variable 2       |  [rbp-16]\n        | ...                    |\n        | Saved callee-saved regs|  [rbp-...]\n        +------------------------+  Lower addresses (rsp after allocation)",
            "explanation": "If the function does not use a frame pointer, it uses rsp-relative addressing, and the offsets shift if rsp changes due to pushes/pops."
          }
        ]
      },
      {
        "id": "sec-19-3",
        "title": "19.3 Register Allocation Concepts",
        "content": "Register allocation is the process of assigning program variables to CPU registers. Since registers are the fastest storage, we want to keep frequently used variables in registers and avoid spilling to memory."
      },
      {
        "id": "sec-19-3-1",
        "title": "19.3.1 Register Pressure",
        "content": "Register pressure is the demand for registers at a given point in the program. When the number of live variables exceeds the number of available registers, some variables must be spilled (stored in memory). High register pressure leads to frequent spills and fills, reducing performance.\n\nExample:\nConsider a function that needs to keep 10 variables alive simultaneously, but only 6 callee-saved registers are available (after preserving some). Two variables must be spilled to the stack.\n\nClarification: Ten simultaneous values and six available registers leave four values without registers, not two. Live caller-saved values may be spilled around calls or recomputed; one need not restrict all variables to callee-saved registers throughout a function."
      },
      {
        "id": "sec-19-3-2",
        "title": "19.3.2 Live Ranges and Interference",
        "content": "A variable's live range is the set of instructions from its definition to its last use. Two variables interfere if their live ranges overlap; they cannot share the same register. Register allocation can be viewed as graph coloring: each variable is a node, edges represent interference, and registers are colors. The compiler (or programmer) tries to color the graph with the available registers."
      },
      {
        "id": "sec-19-3-3",
        "title": "19.3.3 Spilling and Filling",
        "content": "When a variable is spilled, it is stored in memory (usually on the stack). Before each use, it must be loaded back into a register (fill). This adds memory access overhead. The goal is to minimize spills by choosing variables with long live ranges or low usage frequency for spilling.\n\nClarification: A spilled operand may sometimes be consumed directly by a memory-form instruction rather than explicitly loaded first. Allocation decisions weigh use frequency, loop nesting, rematerialization and instruction constraints."
      },
      {
        "id": "sec-19-3-4",
        "title": "19.3.4 Register Classes",
        "content": "The x86-64 architecture has different register classes:\n- General-purpose registers (rax, rbx, etc.) for integers and pointers.\n- Floating-point/SIMD registers (xmm0–xmm15) for floats, doubles, and packed data.\n- Special registers (rsp, rbp, rip, rflags) not used for general variables.\n\nThe choice of register class depends on the variable's type and usage."
      },
      {
        "id": "sec-19-4",
        "title": "19.4 Manual Register Allocation in Assembly",
        "content": "When writing assembly by hand, you act as the register allocator. Here are some guidelines:"
      },
      {
        "id": "sec-19-4-1",
        "title": "19.4.1 Choose Registers Based on Usage Frequency",
        "content": "- Keep the most frequently used variables in registers.\n- Use callee-saved registers (rbx, r12–r15) for variables that must survive function calls, because they are preserved across calls. But you must save/restore them if you use them.\n- Use caller-saved registers for temporary values that do not need to survive calls.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original source: Solution 19.1",
            "code": "my_func:\n    push rbx\n    push r12\n    push r13\n    ; ... use rbx, r12, r13 ...\n    pop r13\n    pop r12\n    pop rbx\n    ret",
            "explanation": "Original exercise fragment retained; the completed solution below supplies a runnable caller and observable result."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 19.2",
            "code": "leaf_func:\n    mov [rsp-8], rdi\n    mov [rsp-16], rsi\n    mov [rsp-24], rdx\n    ; ... use these locals ...\n    ret",
            "explanation": "Original exercise fragment retained; the completed solution below supplies a runnable caller and observable result."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 19.3",
            "code": "my_func:\n    push rbx\n    push r12\n    push r13\n    push r14\n    push r15\n    push rbp\n    mov rbp, rsp\n    sub rsp, 16          ; two spill slots: [rbp-8], [rbp-16]\n    ; assign variables:\n    ; v1 -> rbx\n    ; v2 -> r12\n    ; v3 -> r13\n    ; v4 -> r14\n    ; v5 -> r15\n    ; v6 -> rbp? but we used rbp as frame pointer; instead use rbp as general if we omit frame pointer, but we'll keep frame pointer and spill v6 and v7 to stack.\n    ; For simplicity, we'll spill two variables to [rbp-8] and [rbp-16].\n    ; ...\n    mov rsp, rbp\n    pop rbp\n    pop r15\n    pop r14\n    pop r13\n    pop r12\n    pop rbx\n    ret",
            "explanation": "Original exercise fragment retained; the completed solution below supplies a runnable caller and observable result."
          }
        ]
      },
      {
        "id": "sec-19-4-2",
        "title": "19.4.2 Minimize Spills by Reordering Code",
        "content": "If you need more registers than available, try to reorder operations so that some variables are no longer needed, freeing their registers.\n\nExample:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original: need rbx, rcx, rdx simultaneously, but only two free registers",
            "code": "; Original: need rbx, rcx, rdx simultaneously, but only two free registers\nmov rbx, 10      ; variable A\nmov rcx, 20      ; variable B\nmov rdx, 30      ; variable C\nadd rax, rbx\nadd rax, rcx\nadd rax, rdx\n\n; Reordered: compute partial sums to reduce live variables\nmov rbx, 10\nmov rcx, 20\nadd rax, rbx\nadd rax, rcx      ; now rbx and rcx dead, can reuse\nmov rbx, 30\nadd rax, rbx",
            "explanation": "This second version only needs two registers for the three constants."
          }
        ]
      },
      {
        "id": "sec-19-4-3",
        "title": "19.4.3 Use the Red Zone for Leaf Functions",
        "content": "If a function does not call any other functions (leaf function), you can use the 128-byte red zone below rsp for temporary storage without adjusting rsp. This avoids prologue/epilogue overhead.\n\nClarification: The user-space System V red zone is protected from signal-handler use, but does not survive ordinary nested calls. Kernel/interrupt code has different rules and commonly disables red-zone use. Windows x64 has no System V red zone.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "19.4.3 Use the Red Zone for Leaf Functions — listing 1",
            "code": "my_leaf:\n    ; use [rsp-8], [rsp-16] etc. for locals, no sub rsp needed\n    mov [rsp-8], rdi\n    ; ...\n    ret",
            "explanation": "Be careful: if any interrupt or signal handler runs, it may use the stack and clobber the red zone? Actually, the ABI guarantees that the red zone is not modified by signal handlers, so it's safe."
          }
        ]
      },
      {
        "id": "sec-19-4-4",
        "title": "19.4.4 Use Frame Pointer Omission (FPO) to Free rbp",
        "content": "The frame pointer rbp is often used to access locals and arguments. However, if you use rsp-relative addressing and do not push/pop inside the function (except at prologue/epilogue), you can omit the frame pointer and use rbp as a general-purpose register. This increases available registers by one.\n\nExample:\n\nClarification: Omitting a frame pointer does not make RBP caller-saved: preserve it if modified. SUB RSP,16 alone leaves a normal callee misaligned for nested calls, though it is fine for this leaf fragment.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Without frame pointer",
            "code": "; Without frame pointer\nmy_func:\n    sub rsp, 16          ; allocate locals\n    mov [rsp], rdi       ; local1\n    mov [rsp+8], rsi     ; local2\n    ; ... access via rsp offsets\n    add rsp, 16\n    ret",
            "explanation": "Now rbp is free for other uses."
          }
        ]
      },
      {
        "id": "sec-19-4-5",
        "title": "19.4.5 Example: Register Allocation for a Simple Function",
        "content": "Let's write a function that computes the sum of an array of integers and returns the result. The function receives a pointer to the array in rdi and the length in rsi. We need to allocate registers for the accumulator, loop counter, and array pointer.\n\nClarification: The source sum_and_product mixes qword loads, dword arithmetic and four-byte pointer increments. The corrected version below consistently processes qwords and returns low-64-bit sum/product in RAX/RDX using a documented two-register contract.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "sum_array: sum qword array",
            "code": "; sum_array: sum qword array\n; Inputs: rdi = pointer, rsi = length\n; Output: rax = sum\nsum_array:\n    xor rax, rax          ; accumulator (use rax for return)\n    mov rcx, rsi          ; counter (rcx is caller-saved, fine)\n    add rdi, 0            ; just use rdi as pointer\n.loop:\n    test rcx, rcx\n    jz .done\n    add rax, [rdi]\n    add rdi, 8\n    dec rcx\n    jmp .loop\n.done:\n    ret",
            "explanation": "Here we used rax for accumulator (also return), rcx for counter (caller-saved, no need to preserve), and rdi for the pointer (caller-saved). No callee-saved registers used, so no prologue needed.\n\nIf we needed more variables (e.g., also compute product), we might need callee-saved registers:"
          },
          {
            "language": "nasm",
            "title": "sum_and_product: compute sum and product of array",
            "code": "; sum_and_product: compute sum and product of array\n; Inputs: rdi = pointer, rsi = length\n; Outputs: rax = sum, rdx = product\nsum_and_product:\n    push rbx              ; save callee-saved rbx (use for product)\n    xor eax, eax          ; sum\n    mov ebx, 1            ; product\n    mov ecx, esi          ; counter\n.loop:\n    test ecx, ecx\n    jz .done\n    mov r8, [rdi]\n    add eax, r8d          ; sum\n    imul ebx, r8d         ; product\n    add rdi, 4\n    dec ecx\n    jmp .loop\n.done:\n    mov edx, ebx          ; product in edx\n    pop rbx               ; restore rbx\n    ret",
            "explanation": "Here we used rbx for product (callee-saved, saved/restored), eax for sum, ecx for counter, rdi for pointer."
          },
          {
            "language": "nasm",
            "title": "Corrected qword sum and product",
            "code": "sum_and_product:\n    xor eax, eax\n    mov edx, 1\n    test rsi, rsi\n    jz .done\n.loop:\n    mov rcx, [rdi]\n    add rax, rcx\n    imul rdx, rcx\n    add rdi, 8\n    dec rsi\n    jnz .loop\n.done:\n    ret",
            "explanation": "Empty array returns sum 0 and product 1. No callee-saved registers are modified. Overflow wraps modulo 2^64."
          }
        ]
      },
      {
        "id": "sec-19-5",
        "title": "19.5 Compiler Register Allocation",
        "content": "Compilers like GCC and LLVM perform sophisticated register allocation using algorithms like graph coloring or linear scan. Understanding their choices helps in reading compiler-generated assembly."
      },
      {
        "id": "sec-19-5-1",
        "title": "19.5.1 How Compilers Allocate Registers",
        "content": "- The compiler builds a control flow graph and computes live ranges.\n- It constructs an interference graph.\n- It colors the graph with available registers, possibly spilling some variables.\n- It inserts spill code (stores/loads) as needed."
      },
      {
        "id": "sec-19-5-2",
        "title": "19.5.2 Observing Compiler Register Allocation",
        "content": "Compile a simple C function with -S -fverbose-asm to see the assembly with comments indicating variable names and register choices.\n\nExample:\n\nClarification: Generated assembly varies by compiler, version, flags and surrounding code. Do not infer a stable register assignment from C variable names. Use the emitted instructions as evidence.",
        "codeSnippets": [
          {
            "language": "c",
            "title": "19.5.2 Observing Compiler Register Allocation — listing 1",
            "code": "int add(int a, int b) {\n    int sum = a + b;\n    return sum;\n}",
            "explanation": "Compile with:"
          },
          {
            "language": "bash",
            "title": "19.5.2 Observing Compiler Register Allocation — listing 2",
            "code": "gcc -S -O2 -fverbose-asm add.c",
            "explanation": "The generated add.s might look like:"
          },
          {
            "language": "text",
            "title": "19.5.2 Observing Compiler Register Allocation — listing 3",
            "code": "add:\n    leal    (%rdi,%rsi), %eax\n    ret",
            "explanation": "Here, a is in edi, b in esi, and sum in eax (return register).\n\nFor a more complex function, you might see spills to the stack and moves to/from callee-saved registers."
          }
        ]
      },
      {
        "id": "sec-19-5-3",
        "title": "19.5.3 Impact on Hand-Written Assembly",
        "content": "By studying compiler output, you can learn effective register allocation strategies and apply them in your own code. However, hand-optimized assembly can sometimes beat the compiler by exploiting domain-specific knowledge."
      },
      {
        "id": "sec-19-6",
        "title": "19.6 Practical Examples",
        "content": ""
      },
      {
        "id": "sec-19-6-1",
        "title": "19.6.1 Interfacing with C: Writing an Assembly Function",
        "content": "Let's write an assembly function array_sum that sums an array of int and is called from C. We must follow the ABI.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "array_sum.asm",
            "code": "; array_sum.asm\nglobal array_sum\n\n; int array_sum(int *arr, int len);\narray_sum:\n    xor eax, eax          ; sum = 0\n    test esi, esi         ; check if len <= 0\n    jle .done\n.loop:\n    add eax, [rdi]        ; sum += *arr\n    add rdi, 4            ; arr++\n    dec esi\n    jnz .loop\n.done:\n    ret",
            "explanation": "In C:"
          },
          {
            "language": "c",
            "title": "19.6.1 Interfacing with C: Writing an Assembly Function — listing 2",
            "code": "#include <stdio.h>\nextern int array_sum(int *arr, int len);\nint main() {\n    int arr[] = {1,2,3,4,5};\n    int sum = array_sum(arr, 5);\n    printf(\"Sum: %d\\n\", sum);\n    return 0;\n}",
            "explanation": "Compile:"
          },
          {
            "language": "bash",
            "title": "19.6.1 Interfacing with C: Writing an Assembly Function — listing 3",
            "code": "nasm -f elf64 array_sum.asm -o array_sum.o\ngcc -c main.c -o main.o\ngcc main.o array_sum.o -o program\n./program"
          }
        ]
      },
      {
        "id": "sec-19-6-2",
        "title": "19.6.2 Optimizing a Computational Kernel",
        "content": "Consider a kernel that computes the dot product of two float arrays. We want to use SIMD and minimize register spilling. We'll allocate registers carefully.\n\nClarification: The unrolled source processes four values whenever index < length, even when fewer than four remain. It can overread and its remainder block is missing. The corrected routine below uses a full-vector count and scalar tail. Reassociation changes floating-point rounding; compare within the intended numerical tolerance.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "dot_product: dot product of two float arrays",
            "code": "; dot_product: dot product of two float arrays\n; Inputs: rdi = a, rsi = b, rdx = length\n; Returns: xmm0 = dot product\ndot_product:\n    xorps xmm0, xmm0      ; accumulator\n    xor eax, eax          ; index\n.loop:\n    cmp eax, edx\n    je .done\n    movss xmm1, [rdi + rax*4]\n    mulss xmm1, [rsi + rax*4]\n    addss xmm0, xmm1\n    inc rax\n    jmp .loop\n.done:\n    ret",
            "explanation": "But we can unroll and use multiple accumulators to improve ILP and reduce loop overhead. We'll also keep values in XMM registers (callee-saved if needed? XMM0-7 are caller-saved, so we don't need to preserve them if we use them as temporary inside the function; but we must not assume they survive a call to another function). Since this function doesn't call others, we can use all XMM registers freely.\n\nUnrolled version with 4 accumulators:"
          },
          {
            "language": "nasm",
            "title": "19.6.2 Optimizing a Computational Kernel — listing 2",
            "code": "dot_product:\n    xorps xmm0, xmm0\n    xorps xmm1, xmm1\n    xorps xmm2, xmm2\n    xorps xmm3, xmm3\n    xor eax, eax\n    ; main loop, unroll 4\n.loop:\n    cmp eax, edx\n    jge .remainder\n    movss xmm4, [rdi + rax*4]\n    mulss xmm4, [rsi + rax*4]\n    addss xmm0, xmm4\n    movss xmm5, [rdi + rax*4 + 4]\n    mulss xmm5, [rsi + rax*4 + 4]\n    addss xmm1, xmm5\n    movss xmm6, [rdi + rax*4 + 8]\n    mulss xmm6, [rsi + rax*4 + 8]\n    addss xmm2, xmm6\n    movss xmm7, [rdi + rax*4 + 12]\n    mulss xmm7, [rsi + rax*4 + 12]\n    addss xmm3, xmm7\n    add eax, 4\n    jmp .loop\n.remainder:\n    ; handle remaining elements\n    ; ...\n    ; combine accumulators\n    addss xmm0, xmm1\n    addss xmm2, xmm3\n    addss xmm0, xmm2\n    ret",
            "explanation": "This uses many XMM registers, reducing dependency chains and increasing parallelism."
          },
          {
            "language": "nasm",
            "title": "Corrected dot product with full-vector and scalar tail",
            "code": "dot_product:\n    xorps xmm0, xmm0\n    mov rcx, rdx\n    shr rcx, 2\n    jz .reduce\n.loop:\n    movups xmm1, [rdi]\n    movups xmm2, [rsi]\n    mulps xmm1, xmm2\n    addps xmm0, xmm1\n    add rdi, 16\n    add rsi, 16\n    dec rcx\n    jnz .loop\n.reduce:\n    movaps xmm1, xmm0\n    shufps xmm1, xmm1, 0x4e\n    addps xmm0, xmm1\n    movaps xmm1, xmm0\n    shufps xmm1, xmm1, 0xb1\n    addss xmm0, xmm1\n    and edx, 3\n    jz .done\n.tail:\n    movss xmm1, [rdi]\n    mulss xmm1, [rsi]\n    addss xmm0, xmm1\n    add rdi, 4\n    add rsi, 4\n    dec edx\n    jnz .tail\n.done:\n    ret",
            "explanation": "RDI and RSI point to count floats, RDX is the count; XMM0.low returns the sum. Zero count reads no memory, unaligned arrays are supported, and no callee-saved registers are touched."
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-19-1",
        "title": "Exercise 19.1: Callee-Saved Registers",
        "description": "Write a function that uses rbx, r12, and r13 as temporary variables. Show the necessary prologue and epilogue to preserve these registers.",
        "solution": "section .text\nglobal _start\nmy_func:\n    push rbx\n    push r12\n    push r13\n    mov rbx, 10\n    mov r12, 20\n    mov r13, 30\n    lea rax, [rbx+r12]\n    add rax, r13\n    pop r13\n    pop r12\n    pop rbx\n    ret\n_start:\n    mov rbx, 111\n    mov r12, 222\n    mov r13, 333\n    call my_func\n    cmp rbx, 111\n    jne failure\n    cmp r12, 222\n    jne failure\n    cmp r13, 333\n    jne failure\n    mov rdi, rax\n    mov eax, 60\n    syscall\nfailure:\n    mov edi, 1\n    mov eax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "Make sure to restore in reverse order.\n\nChecks all three saved-register values and exits 60."
      },
      {
        "id": "ex-19-2",
        "title": "Exercise 19.2: Red Zone",
        "description": "Write a leaf function that stores three local variables in the red zone (at [rsp-8], [rsp-16], [rsp-24]) without adjusting rsp. Demonstrate that it works.",
        "solution": "section .text\nglobal _start\nleaf_func:\n    mov [rsp-8], rdi\n    mov [rsp-16], rsi\n    mov [rsp-24], rdx\n    mov rax, [rsp-8]\n    add rax, [rsp-16]\n    add rax, [rsp-24]\n    ret\n_start:\n    mov edi, 10\n    mov esi, 20\n    mov edx, 30\n    mov r12, rsp\n    call leaf_func\n    cmp rsp, r12\n    jne failure\n    mov rdi, rax\n    mov eax, 60\n    syscall\nfailure:\n    mov edi, 1\n    mov eax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "No sub rsp; uses red zone.\n\nReads three independent red-zone locals, checks RSP restoration, exits 60. Do not add a nested call while those locals are live."
      },
      {
        "id": "ex-19-3",
        "title": "Exercise 19.3: Register Pressure",
        "description": "Create a function that needs to keep 8 integer variables live simultaneously. Show how you would allocate registers, and where you would need to spill to the stack. Write the assembly code.",
        "solution": "section .text\nglobal _start\nmy_func:\n    push rbx\n    push rbp\n    push r12\n    push r13\n    push r14\n    push r15\n    sub rsp, 24          ; 16 bytes spills plus 8 alignment padding\n    mov ebx, 1\n    mov ebp, 2\n    mov r12d, 3\n    mov r13d, 4\n    mov r14d, 5\n    mov r15d, 6\n    mov qword [rsp], 7\n    mov qword [rsp+8], 8\n    call scratch\n    lea rax, [rbx+rbp]\n    add rax, r12\n    add rax, r13\n    add rax, r14\n    add rax, r15\n    add rax, [rsp]\n    add rax, [rsp+8]\n    add rsp, 24\n    pop r15\n    pop r14\n    pop r13\n    pop r12\n    pop rbp\n    pop rbx\n    ret\nscratch:\n    xor eax, eax\n    xor ecx, ecx\n    xor edx, edx\n    xor esi, esi\n    xor edi, edi\n    xor r8d, r8d\n    xor r9d, r9d\n    xor r10d, r10d\n    xor r11d, r11d\n    ret\n_start:\n    call my_func\n    mov rdi, rax\n    mov eax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "We need 8 variables. Available callee-saved: rbx, r12-r15 (6), plus rax, rcx, rdx, rsi, rdi, r8-r11 are caller-saved but can be used if not needed across calls. Assume we need to preserve them across a call, so we cannot use caller-saved. Thus we use rbx, r12, r13, r14, r15 (5), plus two spills to stack. Or use rbp as general if no frame pointer: rbx, r12, r13, r14, r15, rbp (6), still need 2 spills. We'll save callee-saved on stack and use all 6, and spill 2 variables to local stack slots.\n\nSix callee-saved registers, including RBP without a frame pointer, hold values 1–6; two allocated slots hold 7–8. An aligned call clobbers all scratch registers, then the result is 36."
      },
      {
        "id": "ex-19-4",
        "title": "Exercise 19.4: Interfacing with C",
        "description": "Write an assembly function max_of_three that takes three int arguments and returns the maximum. Call it from a C program and print the result.",
        "solution": "; File: max.asm\nsection .text\nglobal max_of_three\n\n; int max_of_three(int a, int b, int c);\nmax_of_three:\n    mov eax, edi\n    cmp esi, eax\n    cmovg eax, esi\n    cmp edx, eax\n    cmovg eax, edx\n    ret\n\n; File: main.c\n#include <stdio.h>\nextern int max_of_three(int a, int b, int c);\nint main() {\n    int m = max_of_three(10, 25, 15);\n    printf(\"Max: %d\\n\", m);\n    return 0;\n}",
        "solutionLanguage": "nasm",
        "solutionExplanation": "C program:\nSave the two File blocks separately. nasm -f elf64 max.asm -o max.o; gcc main.c max.o -o max_demo; ./max_demo. Expected output: Max: 25. Add a .note.GNU-stack section to max.asm to mark a non-executable stack.\n\nThe function compares signed 32-bit arguments; test negative inputs and ties too."
      },
      {
        "id": "ex-19-5",
        "title": "Exercise 19.5: Compiler Output",
        "description": "Write a small C function with several local variables and loops. Compile with gcc -S -O2 -fverbose-asm and analyze the register allocation. Identify which variables are kept in registers and which are spilled.",
        "solution": "int compute(int a, int b) {\n    int x = a + b;\n    int y = a * b;\n    int z = x + y;\n    for (int i = 0; i < 10; i++) {\n        z += i;\n    }\n    return z;\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "Example C:\n\nCompile and observe. Likely a in edi, b in esi, x in eax (but reused), y in edx, z in eax, i in ecx. No spills needed. If more variables, some may go to stack.\n\nAt -O2 the fixed loop can be folded to addition of 45, leaving no loop counter at all. Compile and inspect actual output rather than expecting the speculative assignments in the source. Use small inputs to avoid signed C overflow."
      }
    ],
    "practiceQuestions": [
      {
        "question": "What is the difference between an API and an ABI? Why does the ABI matter for assembly?",
        "answer": "An API describes source-level operations and types; an ABI defines binary representations and calling rules. Assembly must honor the ABI so independently compiled code agrees on arguments, returns and preservation."
      },
      {
        "question": "List the caller-saved and callee-saved registers in the System V AMD64 ABI.",
        "answer": "Caller-saved GPRs: RAX,RCX,RDX,RSI,RDI,R8–R11. Callee-saved: RBX,RBP,R12–R15; restore RSP. All XMM0–XMM15 are caller-saved in System V AMD64."
      },
      {
        "question": "What is the red zone? How can it be used? Are there restrictions?",
        "answer": "The 128 bytes below entry/current RSP are protected from user-space signal-handler use under this ABI. Leaf temporaries can live there without moving RSP; do not keep them across calls or assume the guarantee in kernel or Windows code."
      },
      {
        "question": "Explain the stack alignment requirement before a call. How does a function prologue ensure it?",
        "answer": "For scalar calls RSP modulo 16 must be zero before CALL, then is eight at callee entry. PUSH RBP aligns it; allocating a multiple of 16 maintains it. Count all saves and spills before further calls."
      },
      {
        "question": "What is register pressure? What happens when it is high?",
        "answer": "Register pressure is simultaneous demand for registers of usable classes. High pressure can require spills, reloads or recomputation; constraints and live ranges matter more than the number of source variable names."
      },
      {
        "question": "Describe the concept of a live range and how it affects register allocation.",
        "answer": "A value is live while a later computation needs it. Interfering live values cannot occupy the same register simultaneously. Ending or splitting live ranges can reduce allocation pressure."
      },
      {
        "question": "What is spilling? How does it impact performance?",
        "answer": "Spilling stores a live value to memory, with later loads or memory-operand uses. It adds instructions and traffic, but cost depends on placement, cache behavior and available parallelism."
      },
      {
        "question": "How can you reduce the number of registers needed in a function? Provide an example.",
        "answer": "Consume values earlier and reuse dead registers, keep constants as immediates, or recompute cheap expressions. For example, accumulate A and B before loading C into A’s former register."
      },
      {
        "question": "When would you choose to use callee-saved registers instead of caller-saved registers for a variable?",
        "answer": "Use a callee-saved register for a hot value that must survive calls, paying save/restore once in your function. Caller-saved registers suit short-lived temporaries; spills around calls can also be appropriate."
      },
      {
        "question": "How does a compiler typically perform register allocation? What algorithms are used?",
        "answer": "Compilers compute liveness and interference, then allocate registers using target constraints and cost heuristics. Graph-coloring, linear-scan and region-based methods are common, with spill placement, coalescing and rematerialization."
      }
    ],
    "summary": [
      "The System V AMD64 ABI defines register usage, calling conventions, stack layout, and data types.",
      "Caller-saved registers can be freely modified; callee-saved must be preserved.",
      "The red zone allows leaf functions to use up to 128 bytes below rsp without adjusting the stack.",
      "Register allocation is the process of assigning variables to registers, aiming to minimize expensive memory spills.",
      "Manual register allocation involves choosing registers based on usage frequency, reordering code to reduce live variables, and using the red zone or frame pointer omission.",
      "Compilers use sophisticated algorithms (graph coloring, linear scan) to allocate registers.",
      "Understanding the ABI and register allocation is essential for writing efficient assembly and interfacing with high-level languages.",
      "In the next chapter, we'll explore inline assembly and integration with C/C++, allowing you to embed assembly within high-level code."
    ]
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
