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
