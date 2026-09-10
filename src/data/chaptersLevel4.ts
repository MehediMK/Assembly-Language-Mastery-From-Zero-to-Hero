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
    "id": 20,
    "slug": "chapter-20-inline-assembly-c-integration",
    "level": 4,
    "levelTitle": "Advanced Assembly",
    "title": "Chapter 20: Inline Assembly and Integration with C/C++",
    "subtitle": "GCC Extended Asm: Constraints, Operands, Clobber Lists, and CPUID",
    "learningObjectives": [
      "Understand the purpose and benefits of inline assembly in C/C++ programs.",
      "Master the GCC extended asm syntax: operands, constraints, clobbers, and volatile.",
      "Learn how to access and modify C variables from inline assembly.",
      "Use inline assembly for low-level operations like cpuid, rdtsc, and SIMD instructions.",
      "Integrate separate assembly source files with C/C++ projects.",
      "Debug mixed C/assembly programs using GDB.",
      "Apply best practices to write correct and efficient inline assembly."
    ],
    "prerequisites": [
      "Solid understanding of assembly programming, registers, and calling conventions (Chapters 3, 10, 19).",
      "Familiarity with C/C++ programming and compilation.",
      "Knowledge of data types, memory layout, and structures (Chapter 13).",
      "Experience with GDB for debugging (Chapter 17)."
    ],
    "keyConcepts": [
      "Inline assembly embeds assembly instructions directly in C/C++ code.",
      "GCC provides an extended asm syntax that allows specifying operands and constraints.",
      "Constraints tell the compiler where to place operands (registers, memory, immediates).",
      "Clobbers list registers that the inline assembly modifies, ensuring the compiler saves/restores them if needed.",
      "Volatile prevents the compiler from optimizing away or reordering the asm block.",
      "Separate assembly files can be linked with C/C++ object files, using extern declarations.",
      "Mixed-language programming requires strict adherence to the ABI."
    ],
    "diagramType": "inline_assembly",
    "sections": [
      {
        "id": "sec-20-1",
        "title": "20.1 Introduction to Inline Assembly",
        "content": "Inline assembly allows embedding assembly instructions directly within C or C++ source code. This is useful for:\n- Accessing special CPU instructions not exposed by high-level languages (e.g., cpuid, rdtsc, rdrand).\n- Optimizing performance-critical sections with hand-tuned assembly.\n- Performing low-level hardware or OS interactions.\n\nGCC supports inline assembly through the asm keyword (or __asm__). There are two forms:\n- Basic asm: Just a string of assembly instructions without operands.\n- Extended asm: Allows specifying output operands, input operands, clobbers, and constraints.\n\nWe will focus on extended asm, which is the recommended and more powerful form."
      },
      {
        "id": "sec-20-2",
        "title": "20.2 Basic Inline Assembly",
        "content": "The basic form is simple: asm(\"assembly code\");\n\nExample:\n\nClarification: The two basic-asm lines are not a safe x86-64 syscall example: INT 0x80 uses the compatibility syscall interface and the compiler is not told which registers change. Do not use them as an exit sequence inside C. Extended asm and normal C calls are preferable for compiler-visible work.",
        "codeSnippets": [
          {
            "language": "c",
            "title": "20.2 Basic Inline Assembly — listing 1",
            "code": "asm(\"movl $1, %eax\");\nasm(\"int $0x80\");",
            "explanation": "This is rarely used because it assumes a fixed register usage and does not interact safely with C variables. It is generally discouraged in favor of extended asm."
          }
        ]
      },
      {
        "id": "sec-20-2-1",
        "title": "20.2.1 Limitations of Basic Asm",
        "content": "- No way to specify operands; you must hard-code registers, which may conflict with the compiler's register allocation.\n- The compiler may not know which registers or memory are modified, leading to incorrect code.\n- Cannot be used in functions that need to be optimized safely.\n\nAvoid basic asm in modern code."
      },
      {
        "id": "sec-20-3",
        "title": "20.3 Extended Inline Assembly Syntax",
        "content": "The extended asm syntax provides a way to interface with C variables using a template and operand constraints."
      },
      {
        "id": "sec-20-3-1",
        "title": "20.3.1 General Syntax",
        "content": "\n\nClarification: The displayed asm [volatile] form is syntax notation, not literal C. The final label list requires asm goto. With no colons a statement is basic asm, whose template rules differ from extended asm.",
        "codeSnippets": [
          {
            "language": "c",
            "title": "20.3.1 General Syntax — listing 1",
            "code": "asm [volatile] ( \n    assembler template \n    : output operands        /* optional */\n    : input operands         /* optional */\n    : clobbered registers    /* optional */\n    : goto labels            /* optional, for asm goto */\n);",
            "explanation": "- Assembler template: A string containing assembly instructions with placeholders %0, %1, etc., referring to operands.\n- Output operands: List of C variables that will be written by the asm. Each has a constraint and a variable.\n- Input operands: List of C expressions read by the asm.\n- Clobber list: Registers that the asm modifies, so the compiler knows to preserve them if needed.\n- Goto labels: Used for asm goto, allowing jumps to C labels.\n\nOperands are numbered sequentially: output operands first, then input operands. In the template, %0 refers to the first operand (output 0), %1 to the next, etc. If there are no operands, the colon separators may be omitted."
          }
        ]
      },
      {
        "id": "sec-20-3-2",
        "title": "20.3.2 Example: Add Two Integers",
        "content": "\n\nClarification: ADD modifies flags; include a cc clobber. A tied input or read-write operand states the dependency explicitly. A simpler version is int result=a; __asm__(\"addl %1,%0\" : \"+r\"(result) : \"r\"(b) : \"cc\");",
        "codeSnippets": [
          {
            "language": "c",
            "title": "20.3.2 Example: Add Two Integers — listing 1",
            "code": "int a = 10, b = 20, result;\nasm (\"addl %%ebx, %%eax\"\n     : \"=a\" (result)        // output: result in eax\n     : \"a\" (a), \"b\" (b)     // inputs: a in eax, b in ebx\n     );",
            "explanation": "Explanation:\n- \"addl %%ebx, %%eax\" is the instruction. %% is used because % is special in format strings.\n- \"=a\" (result) means output in eax (a constraint), and the result is stored in result.\n- \"a\" (a) means input a is placed in eax.\n- \"b\" (b) means input b is placed in ebx.\n- The compiler will generate code to load a into eax, b into ebx, execute addl, and store eax into result.\n\nNote: The addl instruction expects source and destination. Here, eax holds a initially, and ebx holds b. After addl %%ebx, %%eax, eax = a + b. The output constraint \"=a\" tells the compiler that eax is modified and holds the result."
          }
        ]
      },
      {
        "id": "sec-20-3-3",
        "title": "20.3.3 Important: %% vs %",
        "content": "In C strings, % is used for format specifiers. To include a literal % in the assembly template, you must double it (%%). This is a common source of confusion. Alternatively, you can use the % with a single % if you are using asm with a string literal and not printf? Actually, the compiler treats the template string as a format string, so % has special meaning. Therefore, always use %% for register names.\n\nClarification: Percent escaping is GCC extended-asm template syntax, not C string formatting or printf. Literal AT&T register names use %%eax in extended asm; operands use %0 or %[name]. Basic asm uses a single percent. The examples assume GCC’s default AT&T assembler dialect, not -masm=intel."
      },
      {
        "id": "sec-20-4",
        "title": "20.4 Operand Constraints",
        "content": "Constraints specify how operands are assigned to registers, memory, or immediates. Common constraints for x86-64:\n\n\n\nModifiers:\n- = : Write-only output operand.\n- + : Read-write operand (both input and output).\n- & : Early clobber: operand is written before all inputs are read.\n\nClarification: Constraint letters are target-specific. L denotes an immediate 0xff or 0xffff useful for AND zero-extension idioms; MOVZX does not accept an immediate source. Constraints must match legal combinations, not merely list broad alternatives that could create memory-to-memory instructions.",
        "tableData": {
          "headers": [
            "Constraint",
            "Meaning"
          ],
          "rows": [
            [
              "r",
              "General-purpose register"
            ],
            [
              "a",
              "eax/rax"
            ],
            [
              "b",
              "ebx/rbx"
            ],
            [
              "c",
              "ecx/rcx"
            ],
            [
              "d",
              "edx/rdx"
            ],
            [
              "S",
              "esi/rsi"
            ],
            [
              "D",
              "edi/rdi"
            ],
            [
              "m",
              "Memory operand"
            ],
            [
              "o",
              "Offsettable memory address"
            ],
            [
              "V",
              "Memory operand that is not offsettable"
            ],
            [
              "g",
              "Any register, memory, or immediate"
            ],
            [
              "i",
              "Immediate integer operand"
            ],
            [
              "n",
              "Immediate integer operand with known value"
            ],
            [
              "I",
              "Immediate 0..31 (shift counts)"
            ],
            [
              "J",
              "Immediate 0..63 (shift counts for 64-bit)"
            ],
            [
              "K",
              "Immediate signed 8-bit"
            ],
            [
              "L",
              "Immediate 0xFF or 0xFFFF (for movzx)"
            ],
            [
              "M",
              "Immediate 0..3"
            ],
            [
              "N",
              "Immediate 0..255"
            ],
            [
              "X",
              "Any operand"
            ],
            [
              "0, 1, ...",
              "Matching constraint: same as specified operand"
            ]
          ]
        }
      },
      {
        "id": "sec-20-4-1",
        "title": "20.4.1 Register Constraints",
        "content": "Using specific register constraints can be necessary for instructions that only work with certain registers (e.g., mul, div, shift by cl).\n\nExample: Shift by variable",
        "codeSnippets": [
          {
            "language": "c",
            "title": "20.4.1 Register Constraints — listing 1",
            "code": "int value = 100;\nint count = 3;\nasm (\"shll %%cl, %0\"\n     : \"=r\" (value)\n     : \"0\" (value), \"c\" (count)\n     : \"cc\"\n     );",
            "explanation": "- \"0\" (value) means use the same register as operand 0 (read-write). The compiler will put value in some register (say r8), and count in cl. Then shll %%cl, %0 shifts the register by cl."
          }
        ]
      },
      {
        "id": "sec-20-4-2",
        "title": "20.4.2 Memory Constraints",
        "content": "If a variable can be in memory, use \"m\". The compiler may choose to allocate the operand in memory and reference it directly.\n\nExample: Increment a memory variable\n\nClarification: INCL changes condition codes; add : : \"cc\" after the +m output. The explicit memory operand describes that object, so a broad memory clobber is not needed merely because memory is used.",
        "codeSnippets": [
          {
            "language": "c",
            "title": "20.4.2 Memory Constraints — listing 1",
            "code": "int counter = 5;\nasm (\"incl %0\" : \"+m\" (counter));",
            "explanation": "This tells the compiler that counter is a read-write memory operand. The generated assembly will increment the memory location."
          }
        ]
      },
      {
        "id": "sec-20-4-3",
        "title": "20.4.3 Immediate Constraints",
        "content": "Some instructions require immediate constants. Use \"i\" or specific range constraints like \"I\", \"J\", etc.\n\nExample: Shift by immediate 1\n\nClarification: The shift modifies flags; use __asm__(\"shll $1,%0\" : \"+r\"(value) : : \"cc\"). Instructions constrain operand width and valid forms; C type and constraints must agree.",
        "codeSnippets": [
          {
            "language": "c",
            "title": "20.4.3 Immediate Constraints — listing 1",
            "code": "int value = 10;\nasm (\"shll $1, %0\" : \"+r\" (value));",
            "explanation": "Here $1 is an immediate; no input operand needed for the constant."
          }
        ]
      },
      {
        "id": "sec-20-5",
        "title": "20.5 Clobber List",
        "content": "The clobber list tells the compiler which registers are modified by the inline assembly but not listed as operands. This is crucial for correctness. If the compiler assumes a register is unchanged, it may keep a value in it, causing bugs.\n\nCommon clobbers:\n- \"cc\" : Condition codes (flags) are modified.\n- \"memory\" : The asm reads or writes memory in ways not specified by operands. This acts as a memory barrier.\n- Register names (e.g., \"eax\", \"xmm0\") : These registers are clobbered.\n\nExample: Using cpuid\n\nClarification: A memory clobber is a compiler memory barrier, not a CPU fence and not synchronization for C data races. CPUID does not read/write arbitrary memory; use a memory clobber only when compiler memory ordering is part of the intended contract. Outputs already describe their registers; do not also list those registers as clobbers.",
        "codeSnippets": [
          {
            "language": "c",
            "title": "20.5 Clobber List — listing 1",
            "code": "unsigned int eax, ebx, ecx, edx;\nasm volatile (\"cpuid\"\n              : \"=a\"(eax), \"=b\"(ebx), \"=c\"(ecx), \"=d\"(edx)\n              : \"a\"(0)   // leaf 0\n              : \"memory\");",
            "explanation": "Here the outputs are in eax, ebx, ecx, edx (via constraints). No separate clobber list needed for those because they are outputs. But cpuid may modify memory? Typically not, but \"memory\" is often added to be safe."
          }
        ]
      },
      {
        "id": "sec-20-5-1",
        "title": "20.5.1 Volatile",
        "content": "Adding volatile to the asm statement prevents the compiler from optimizing it away or moving it relative to other volatile operations. Use asm volatile when the instruction has side effects (like I/O, cpuid, rdtsc) and must not be eliminated.\n\nExample:\n\nClarification: Volatile prevents deletion of an asm operation that must execute, but it does not prohibit every motion relative to unrelated code and is not a full ordering barrier. Express data dependencies and memory effects. RDTSC is not serializing, and TSC ticks are not necessarily current core cycles.",
        "codeSnippets": [
          {
            "language": "c",
            "title": "20.5.1 Volatile — listing 1",
            "code": "asm volatile (\"rdtsc\" : \"=a\"(lo), \"=d\"(hi));"
          }
        ]
      },
      {
        "id": "sec-20-6",
        "title": "20.6 Using Inline Assembly with C Variables",
        "content": ""
      },
      {
        "id": "sec-20-6-1",
        "title": "20.6.1 Accessing C Variables",
        "content": "You can directly reference C variables in the operand list. The compiler ensures the variable is in the correct location (register or memory) based on the constraint."
      },
      {
        "id": "sec-20-6-2",
        "title": "20.6.2 Multiple Instructions",
        "content": "You can include multiple assembly instructions in the template, separated by \\n\\t or ;.\n\nClarification: Add the cc clobber for ADD. When a multi-instruction template writes an output before consuming every input, use an early-clobber output such as =&r or restructure with a scratch output. Never modify a pure input operand without describing it as an output/read-write operand.",
        "codeSnippets": [
          {
            "language": "c",
            "title": "20.6.2 Multiple Instructions — listing 1",
            "code": "asm (\"movl %1, %%eax\\n\\t\"\n     \"addl %2, %%eax\\n\\t\"\n     \"movl %%eax, %0\"\n     : \"=r\"(result)\n     : \"r\"(a), \"r\"(b)\n     : \"eax\"\n     );"
          }
        ]
      },
      {
        "id": "sec-20-6-3",
        "title": "20.6.3 Labels in Inline Assembly",
        "content": "You can use labels inside the template, but they must be unique across the whole program if not using special syntax. To avoid conflicts, use local labels (numbers) or %= to generate a unique number.\n\nExample:",
        "codeSnippets": [
          {
            "language": "c",
            "title": "20.6.3 Labels in Inline Assembly — listing 1",
            "code": "asm (\"1: ... ; jmp 1b\" : : : );"
          }
        ]
      },
      {
        "id": "sec-20-7",
        "title": "20.7 Integration with C/C++ at File Level",
        "content": "Besides inline assembly, you can write entire functions in separate .asm files and link them with C code. This is often cleaner for larger assembly routines."
      },
      {
        "id": "sec-20-7-1",
        "title": "20.7.1 Assembly Function Definition",
        "content": "",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "myfunc.asm",
            "code": "; myfunc.asm\nglobal myfunc\n\n; int myfunc(int a, int b)\nmyfunc:\n    mov eax, edi\n    add eax, esi\n    ret"
          }
        ]
      },
      {
        "id": "sec-20-7-2",
        "title": "20.7.2 C Declaration and Use",
        "content": "\n\nClarification: The source main needs #include <stdio.h> before calling printf. For C++ use extern \"C\" int myfunc(int,int); to match the assembly symbol rather than C++ name mangling.",
        "codeSnippets": [
          {
            "language": "c",
            "title": "20.7.2 C Declaration and Use — listing 1",
            "code": "// main.c\nextern int myfunc(int a, int b);\nint main() {\n    int result = myfunc(5, 7);\n    printf(\"%d\\n\", result);\n    return 0;\n}"
          }
        ]
      },
      {
        "id": "sec-20-7-3",
        "title": "20.7.3 Build",
        "content": "",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "20.7.3 Build — listing 1",
            "code": "nasm -f elf64 myfunc.asm -o myfunc.o\ngcc -c main.c -o main.o\ngcc main.o myfunc.o -o program"
          }
        ]
      },
      {
        "id": "sec-20-7-4",
        "title": "20.7.4 Makefile Integration",
        "content": "",
        "codeSnippets": [
          {
            "language": "make",
            "title": "20.7.4 Makefile Integration — listing 1",
            "code": "all: program\n\nprogram: main.o myfunc.o\n\tgcc main.o myfunc.o -o program\n\nmain.o: main.c\n\tgcc -c main.c -o main.o\n\nmyfunc.o: myfunc.asm\n\tnasm -f elf64 myfunc.asm -o myfunc.o\n\nclean:\n\trm -f *.o program"
          }
        ]
      },
      {
        "id": "sec-20-8",
        "title": "20.8 Debugging Mixed C/Assembly",
        "content": "GDB can debug both C and assembly simultaneously if both are compiled with debug info.\n\n- Compile C with -g.\n- Assemble ASM with -g.\n\nThen use break on function names or line numbers, and stepi to step through assembly.\n\nExample:",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "20.8 Debugging Mixed C/Assembly — listing 1",
            "code": "nasm -f elf64 -g myfunc.asm -o myfunc.o\ngcc -g -c main.c -o main.o\ngcc main.o myfunc.o -o program\ngdb ./program\nbreak myfunc\nrun\nstepi"
          }
        ]
      },
      {
        "id": "sec-20-9",
        "title": "20.9 Best Practices and Pitfalls",
        "content": "- Always use extended asm, not basic asm.\n- Specify all clobbers: If you modify a register not listed as an output, include it in the clobber list, or use a constraint that makes it an operand.\n- Use volatile for side-effecting instructions to prevent elimination.\n- Be careful with %% in the template string.\n- Prefer separate assembly files for large functions; use inline asm for small snippets.\n- Respect the ABI: When calling C functions from inline asm, ensure correct register usage.\n- Test thoroughly: Inline asm is error-prone; use GDB to verify.\n\nClarification: Hidden CALL instructions in inline asm require modeling all call clobbers, stack alignment, red-zone use and memory effects. Prefer an ordinary C declaration and a separate assembly function for calls. A correct register list alone does not make an arbitrary inline call safe.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Original source: Solution 20.1",
            "code": "#include <stdio.h>\nint main() {\n    int a = 10, b = 20, result;\n    asm (\"addl %%ebx, %%eax\"\n         : \"=a\"(result)\n         : \"a\"(a), \"b\"(b)\n         );\n    printf(\"Sum: %d\\n\", result);\n    return 0;\n}",
            "explanation": "Original source retained for comparison; use the corrected exercise solution and its build instructions."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 20.2",
            "code": "#include <stdio.h>\nint main() {\n    unsigned int eax, ebx, ecx, edx;\n    char vendor[13];\n    asm volatile (\"cpuid\"\n                  : \"=a\"(eax), \"=b\"(ebx), \"=c\"(ecx), \"=d\"(edx)\n                  : \"a\"(0)\n                  );\n    ((unsigned int*)vendor)[0] = ebx;\n    ((unsigned int*)vendor)[1] = edx;\n    ((unsigned int*)vendor)[2] = ecx;\n    vendor[12] = '\\0';\n    printf(\"Vendor: %s\\n\", vendor);\n    return 0;\n}",
            "explanation": "Original source retained for comparison; use the corrected exercise solution and its build instructions."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 20.3",
            "code": "#include <stdio.h>\n#include <stdint.h>\nint main() {\n    uint64_t start_lo, start_hi, end_lo, end_hi;\n    asm volatile (\"rdtsc\" : \"=a\"(start_lo), \"=d\"(start_hi));\n    // some operation\n    for (int i = 0; i < 1000000; i++);\n    asm volatile (\"rdtsc\" : \"=a\"(end_lo), \"=d\"(end_hi));\n    uint64_t start = (start_hi << 32) | start_lo;\n    uint64_t end = (end_hi << 32) | end_lo;\n    printf(\"Cycles: %lu\\n\", end - start);\n    return 0;\n}",
            "explanation": "Original source retained for comparison; use the corrected exercise solution and its build instructions."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 20.4",
            "code": "#include <stdio.h>\nint main() {\n    float a[4] = {1.0, 2.0, 3.0, 4.0};\n    float b[4] = {5.0, 6.0, 7.0, 8.0};\n    float result[4];\n    asm volatile (\n        \"movaps %1, %%xmm0\\n\\t\"\n        \"movaps %2, %%xmm1\\n\\t\"\n        \"addps %%xmm1, %%xmm0\\n\\t\"\n        \"movaps %%xmm0, %0\"\n        : \"=m\"(result)\n        : \"m\"(a), \"m\"(b)\n        : \"xmm0\", \"xmm1\"\n    );\n    printf(\"%f %f %f %f\\n\", result[0], result[1], result[2], result[3]);\n    return 0;\n}",
            "explanation": "Original source retained for comparison; use the corrected exercise solution and its build instructions."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 20.5",
            "code": "global factorial\n\n; int factorial(int n)\nfactorial:\n    mov eax, 1\n    cmp edi, 0\n    je .done\n    mov ecx, edi\n.loop:\n    imul eax, ecx\n    dec ecx\n    jnz .loop\n.done:\n    ret\n\n#include <stdio.h>\nextern int factorial(int n);\nint main() {\n    int n = 5;\n    printf(\"%d! = %d\\n\", n, factorial(n));\n    return 0;\n}\n\nnasm -f elf64 factorial.asm -o factorial.o\ngcc -c main.c -o main.o\ngcc main.o factorial.o -o fact\n./fact",
            "explanation": "Original source retained for comparison; use the corrected exercise solution and its build instructions."
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-20-1",
        "title": "Exercise 20.1: Simple Inline Addition",
        "description": "Write a C program that uses inline assembly to compute the sum of two integers and print the result.",
        "solution": "#include <stdio.h>\nint main(void) {\n    int a=10, b=20, result=a;\n    __asm__(\"addl %1, %0\" : \"+r\"(result) : \"r\"(b) : \"cc\");\n    printf(\"Sum: %d\\n\",result);\n    return result != 30;\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "\n\nSave as add.c; gcc -std=gnu11 -O2 add.c -o add; ./add prints Sum: 30. The +r output and cc clobber express all effects."
      },
      {
        "id": "ex-20-2",
        "title": "Exercise 20.2: `cpuid` Information",
        "description": "Use inline assembly to call cpuid with leaf 0 and print the vendor ID string (stored in EBX, EDX, ECX as 12 characters).",
        "solution": "#include <stdio.h>\n#include <string.h>\nint main() {\n    unsigned int eax, ebx, ecx, edx;\n    char vendor[13];\n    asm volatile (\"cpuid\"\n                  : \"=a\"(eax), \"=b\"(ebx), \"=c\"(ecx), \"=d\"(edx)\n                  : \"a\"(0)\n                  );\n    memcpy(vendor, &ebx, 4);\n    memcpy(vendor+4, &edx, 4);\n    memcpy(vendor+8, &ecx, 4);\n    vendor[12] = '\\0';\n    printf(\"Vendor: %s\\n\", vendor);\n    return 0;\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "\n\nSave as vendor.c; gcc -std=gnu11 -O2 vendor.c -o vendor. memcpy avoids misalignment and strict-aliasing violations from casting the char buffer to unsigned int*. The vendor string is environment-dependent."
      },
      {
        "id": "ex-20-3",
        "title": "Exercise 20.3: `rdtsc` Timing",
        "description": "Use rdtsc in a C program to measure the number of cycles taken by a simple function or loop.",
        "solution": "#include <stdio.h>\n#include <stdint.h>\n#include <inttypes.h>\nstatic uint64_t ticks(void) {\n    uint32_t lo,hi;\n    __asm__ volatile(\"lfence\\n\\trdtsc\\n\\tlfence\"\n                     : \"=a\"(lo), \"=d\"(hi) : : \"memory\");\n    return ((uint64_t)hi<<32)|lo;\n}\nint main(void) {\n    volatile uint64_t sum=0;\n    uint64_t begin=ticks();\n    for(uint64_t i=0;i<1000000;i++) sum+=i;\n    uint64_t end=ticks();\n    printf(\"TSC ticks: %\" PRIu64 \"; sum: %\" PRIu64 \"\\n\",end-begin,sum);\n    return sum != UINT64_C(499999500000);\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "\n\nThe volatile accumulator gives observable work, and compiler memory barriers keep those memory accesses inside the interval. On targets where LFENCE provides execution ordering, the fences bound RDTSC; verify the target’s documented ordering behavior. This measures TSC ticks including loop loads/stores and fence overhead, not a universal core-cycle count. Pinning and repeated trials reduce scheduling noise."
      },
      {
        "id": "ex-20-4",
        "title": "Exercise 20.4: Inline SIMD",
        "description": "Use inline assembly with SSE to add two 4-element float arrays and store result. Use movaps and addps with constraints.",
        "solution": "#include <stdio.h>\nint main() {\n    _Alignas(16) float a[4] = {1.0, 2.0, 3.0, 4.0};\n    _Alignas(16) float b[4] = {5.0, 6.0, 7.0, 8.0};\n    _Alignas(16) float result[4];\n    asm volatile (\n        \"movaps %1, %%xmm0\\n\\t\"\n        \"movaps %2, %%xmm1\\n\\t\"\n        \"addps %%xmm1, %%xmm0\\n\\t\"\n        \"movaps %%xmm0, %0\"\n        : \"=m\"(result)\n        : \"m\"(a), \"m\"(b)\n        : \"xmm0\", \"xmm1\"\n    );\n    printf(\"%f %f %f %f\\n\", result[0], result[1], result[2], result[3]);\n    return 0;\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "\n\nSave as simd.c; gcc -std=gnu11 -O2 simd.c -o simd. Explicit alignment makes MOVAPS legal. Array memory operands describe all 16 bytes and XMM clobbers describe the scratch registers. Expected output: 6, 8, 10, 12."
      },
      {
        "id": "ex-20-5",
        "title": "Exercise 20.5: Separate Assembly File",
        "description": "Write a function in a separate assembly file that computes the factorial of an integer. Call it from C and print result.",
        "solution": "; File: factorial.asm\nsection .text\nglobal factorial\n\n; int factorial(int n)\nfactorial:\n    test edi, edi\n    js .invalid\n    cmp edi, 12\n    ja .invalid\n    mov eax, 1\n    cmp edi, 0\n    je .done\n    mov ecx, edi\n.loop:\n    imul eax, ecx\n    dec ecx\n    jnz .loop\n.done:\n    ret\n.invalid:\n    mov eax, -1\n    ret\nsection .note.GNU-stack noalloc noexec nowrite progbits\n\n; File: main.c\n#include <stdio.h>\nextern int factorial(int n);\nint main() {\n    int n = 5;\n    printf(\"%d! = %d\\n\", n, factorial(n));\n    return 0;\n}",
        "solutionLanguage": "nasm",
        "solutionExplanation": "factorial.asm\n\n\nmain.c\n\n\nBuild:\n\nSave each File block separately. nasm -f elf64 factorial.asm -o factorial.o; gcc main.c factorial.o -o fact; ./fact prints 5! = 120. Corrected int API accepts 0 through 12 and returns -1 for negative or overflowing inputs, avoiding an enormous negative-input loop."
      }
    ],
    "practiceQuestions": [
      {
        "question": "What is the difference between basic and extended inline assembly in GCC?",
        "answer": "Basic asm is just a template with no operand contract. Extended asm lists inputs, outputs and clobbers so the compiler can allocate registers and model effects. Use it when exchanging data with C."
      },
      {
        "question": "Why do you need to double the % in inline assembly templates?",
        "answer": "In extended asm, percent introduces operand references or template escapes, so literal AT&T register names use double percent. It is not a printf rule; basic asm uses single-percent register syntax."
      },
      {
        "question": "Explain the purpose of the clobber list. What happens if you omit a clobbered register?",
        "answer": "Clobbers describe modifications not represented by operands. Omitting one can let the compiler keep a live value in a register that the asm destroys. Describe flags with cc and actual memory effects with operands or memory."
      },
      {
        "question": "What does volatile do in an asm statement? When should you use it?",
        "answer": "Volatile tells GCC the asm must not be discarded merely because outputs are unused. It does not order all unrelated code or provide a hardware fence; model dependencies and memory accesses explicitly."
      },
      {
        "question": "How do you specify a read-write operand in extended asm? Provide an example.",
        "answer": "int result=a; __asm__(\"addl %1,%0\" : \"+r\"(result) : \"r\"(b) : \"cc\"); The plus constraint says the operand is both read and written."
      },
      {
        "question": "What is the \"memory\" clobber? When is it necessary?",
        "answer": "A memory clobber tells the compiler that memory beyond the explicit operands may be accessed. It constrains compiler memory optimization but is not an atomic operation or CPU memory fence. Precise memory operands are preferable when possible."
      },
      {
        "question": "Can inline assembly reference C variables directly? How?",
        "answer": "Use input/output operand lists such as \"r\"(a), \"+r\"(a), or \"+m\"(counter). GCC substitutes the allocated location. Do not reference a C local by an assumed assembler label or silently modify input-only operands."
      },
      {
        "question": "What are the advantages of using separate assembly files over inline assembly?",
        "answer": "Separate functions have explicit ABI boundaries, can be debugged and assembled independently, and avoid complex inline constraints for larger routines. Calls add overhead, but correctness and maintainability often favor this design."
      },
      {
        "question": "How do you link an assembly object file with a C program?",
        "answer": "Assemble NASM with -f elf64, compile the C source, and link both objects with GCC for runtime/library support. Match symbols, signatures and ABI; use extern \"C\" in C++ and appropriate PIE-compatible addressing."
      },
      {
        "question": "Write an inline assembly snippet that multiplies two integers and stores the result in a C variable, using only constraints and no explicit register names.",
        "answer": "int result=a;\n__asm__(\"imull %1,%0\" : \"+r\"(result) : \"r\"(b) : \"cc\");\nThis uses compiler-chosen registers and returns the low 32 bits. Use inputs whose intended signed product fits when signed mathematical semantics are required."
      }
    ],
    "summary": [
      "Inline assembly embeds assembly code in C/C++, useful for special instructions and performance.",
      "GCC extended asm syntax provides operands with constraints, clobbers, and volatile qualifier.",
      "Constraints map operands to registers, memory, or immediates.",
      "Clobber list informs the compiler of modified registers; \"memory\" is a memory barrier.",
      "Volatile prevents optimization of side-effecting instructions.",
      "Separate assembly files can be linked with C code, using extern declarations.",
      "Mixed-language debugging is supported by GDB with debug symbols.",
      "Always follow ABI and best practices to avoid subtle bugs.",
      "In the next chapter, we'll explore performance optimization techniques, building on these foundations."
    ]
  },
  {
    "id": 21,
    "slug": "chapter-21-performance-optimization-techniques",
    "level": 4,
    "levelTitle": "Advanced Assembly",
    "title": "Chapter 21: Performance Optimization Techniques",
    "subtitle": "Loop Unrolling, Strength Reduction, Cache Blocking, and SIMD Kernel",
    "learningObjectives": [
      "Understand the systematic process of optimizing assembly code: profiling, identifying hotspots, and iteratively improving.",
      "Master loop optimization techniques: unrolling, fusion, distribution, invariant code motion, and strength reduction.",
      "Learn how to reduce dependency chains and increase instruction-level parallelism (ILP).",
      "Optimize memory access patterns: cache blocking, prefetching, data alignment, and avoiding false sharing.",
      "Minimize branch misprediction penalties using branchless code, predictable branches, and jump tables.",
      "Select optimal instructions and schedule them to avoid stalls and improve throughput.",
      "Leverage SIMD instructions for data-parallel operations.",
      "Reduce function call overhead and understand when to inline or use leaf functions.",
      "Use profiling tools like perf to measure and guide optimization efforts.",
      "Apply a case study to integrate multiple techniques into a highly optimized routine."
    ],
    "prerequisites": [
      "Solid understanding of x86-64 assembly, registers, and addressing modes (Chapters 1–13).",
      "Knowledge of CPU microarchitecture: pipelines, caches, branch prediction (Chapter 18).",
      "Familiarity with ABI and register allocation (Chapter 19).",
      "Experience with inline assembly or mixing C and assembly (Chapter 20).",
      "Basic proficiency with Linux development tools: GDB, NASM, GCC, perf."
    ],
    "keyConcepts": [
      "Optimization is the process of improving code performance without changing its behavior.",
      "Profiling identifies which parts of the code consume the most time; optimize hotspots, not cold code.",
      "Loop unrolling reduces loop overhead and increases ILP by processing multiple iterations per branch.",
      "Dependency chains limit parallelism; break them with multiple accumulators or reordering.",
      "Cache blocking (tiling) improves data locality for large data sets.",
      "Prefetching hides memory latency by loading data into cache before it is needed.",
      "Branchless code uses conditional moves or arithmetic to avoid branch mispredictions.",
      "Instruction selection matters: some instructions (e.g., lea, xor) are faster or smaller than alternatives.",
      "SIMD processes multiple data elements per instruction, greatly accelerating vectorizable code.",
      "Function inlining eliminates call overhead, but increases code size; leaf functions can use the red zone.",
      "Strength reduction replaces expensive operations with cheaper ones (e.g., multiplication by constant using shifts/adds)."
    ],
    "diagramType": "optimization_techniques",
    "sections": [
      {
        "id": "sec-21-1",
        "title": "21.1 Introduction to Performance Optimization",
        "content": "Writing functionally correct assembly is the first step; making it fast is often the goal in performance-critical applications. Optimization is an iterative process: measure, identify bottlenecks, apply transformations, and re-measure. Without profiling, you may waste time optimizing code that rarely runs. The golden rule: measure first, optimize later.\n\nPerformance optimization in assembly gives you fine-grained control over every instruction. However, modern CPUs are complex; what looks faster may not be due to pipelining, out-of-order execution, and cache effects. Therefore, a deep understanding of the microarchitecture (Chapter 18) is essential.\n\nThis chapter presents a collection of techniques, from high-level loop transformations to low-level instruction scheduling. Always verify improvements with measurement tools like perf or cycle counters."
      },
      {
        "id": "sec-21-2",
        "title": "21.2 Profiling and Identifying Hotspots",
        "content": "Before optimizing, determine where the program spends its time. Use profiling tools:\n\n- perf stat: Provides overall statistics: cycles, instructions, cache misses, branch mispredictions.\n- perf record / perf report: Samples the program to identify hot functions and instructions.\n- valgrind --tool=callgrind: Simulates cache and branch prediction, showing detailed call graphs and miss rates.\n- GDB with timing: Insert rdtsc around code sections (as in Chapter 20) to measure cycle counts.\n\nExample: Profiling a simple sum loop\n\nClarification: The counter output is illustrative. Hardware counters are restricted in this environment, so examples are correctness-tested without claiming measured speedups. RDTSC measures TSC ticks, not necessarily core cycles; use ordering and a retained workload as in Chapter 20.",
        "codeSnippets": [
          {
            "language": "bash",
            "title": "21.2 Profiling and Identifying Hotspots — listing 1",
            "code": "perf stat ./sum_program",
            "explanation": "Output includes:"
          },
          {
            "language": "text",
            "title": "21.2 Profiling and Identifying Hotspots — listing 2",
            "code": "        1,234,567      cycles\n        5,000,000      instructions        # 4.05 insn per cycle\n          50,000      branches\n           1,200      branch-misses       # 2.4% of all branches\n          12,000      cache-misses",
            "explanation": "High cache misses or branch mispredictions indicate areas for improvement."
          }
        ]
      },
      {
        "id": "sec-21-3",
        "title": "21.3 General Optimization Principles",
        "content": ""
      },
      {
        "id": "sec-21-3-1",
        "title": "21.3.1 Optimize Only Hot Code",
        "content": "The 80/20 rule: 80% of execution time is spent in 20% of code. Focus on inner loops and frequently called functions."
      },
      {
        "id": "sec-21-3-2",
        "title": "21.3.2 Keep It Simple",
        "content": "First write clear, correct code; then optimize only if necessary. Overly clever code can be hard to maintain and may not be faster."
      },
      {
        "id": "sec-21-3-3",
        "title": "21.3.3 Use the Right Algorithm",
        "content": "A better algorithm (e.g., O(n log n) vs O(n²)) often yields far greater speedups than micro-optimizations."
      },
      {
        "id": "sec-21-3-4",
        "title": "21.3.4 Exploit Locality",
        "content": "Access memory sequentially to maximize cache hits."
      },
      {
        "id": "sec-21-3-5",
        "title": "21.3.5 Reduce Work",
        "content": "Eliminate redundant calculations, move loop-invariant code out of loops, and avoid unnecessary memory accesses."
      },
      {
        "id": "sec-21-3-6",
        "title": "21.3.6 Increase Parallelism",
        "content": "Modern CPUs can execute multiple instructions per cycle if they are independent. Break dependency chains to expose ILP."
      },
      {
        "id": "sec-21-4",
        "title": "21.4 Loop Optimizations",
        "content": "Loops are prime candidates for optimization because they repeat many times."
      },
      {
        "id": "sec-21-4-1",
        "title": "21.4.1 Loop Unrolling",
        "content": "Motivation: Reduce loop overhead (increment, compare, branch) and enable better instruction scheduling.\n\nExample: Sum array of qwords (original)\n\nClarification: Guard empty loops and handle remainders. The source instruction count already includes the conditional branch, so do not add it a second time. Best unroll factors depend on workload and CPU, not a fixed universal range.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "21.4.1 Loop Unrolling — listing 1",
            "code": "    xor rax, rax\n    mov rcx, len\n.loop:\n    add rax, [rsi]\n    add rsi, 8\n    dec rcx\n    jnz .loop",
            "explanation": "Each iteration does 4 instructions (add, add, dec, jnz). If len=1,000,000, that's 4 million instructions plus branch overhead.\n\nUnrolled 4x:"
          },
          {
            "language": "nasm",
            "title": "21.4.1 Loop Unrolling — listing 2",
            "code": "    xor rax, rax\n    xor rbx, rbx          ; second accumulator\n    mov rcx, len / 4\n.loop:\n    add rax, [rsi]\n    add rbx, [rsi+8]\n    add rax, [rsi+16]\n    add rbx, [rsi+24]\n    add rsi, 32\n    dec rcx\n    jnz .loop\n    add rax, rbx          ; combine accumulators",
            "explanation": "Now one branch per 4 elements, reducing overhead. Two accumulators break dependency chains, allowing parallel execution. The final addition combines results.\n\nConsiderations: Too much unrolling increases code size, possibly causing instruction cache misses. Find the sweet spot (usually 2–8)."
          }
        ]
      },
      {
        "id": "sec-21-4-2",
        "title": "21.4.2 Loop Fusion",
        "content": "Combine two loops that iterate over the same range into one, improving cache reuse and reducing overhead.\n\nBefore:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "loop 1: sum array",
            "code": "; loop 1: sum array\n; loop 2: product array",
            "explanation": "After: compute both in one loop."
          }
        ]
      },
      {
        "id": "sec-21-4-3",
        "title": "21.4.3 Loop Distribution",
        "content": "The opposite: split a loop with independent operations to improve cache locality or enable vectorization. Typically done by compilers, but manual can help."
      },
      {
        "id": "sec-21-4-4",
        "title": "21.4.4 Loop Invariant Code Motion",
        "content": "Move calculations that do not change within the loop outside.\n\nExample:\n\nClarification: Hoisting a load is valid only when no intervening write, alias, atomic/volatile requirement, or concurrent synchronization requires rereading it. Optimization must preserve observable behavior.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "inside loop: mov rdx, [global_const] each iteration -> hoist outside",
            "code": "; inside loop: mov rdx, [global_const] each iteration -> hoist outside"
          }
        ]
      },
      {
        "id": "sec-21-4-5",
        "title": "21.4.5 Strength Reduction",
        "content": "Replace expensive operations with cheaper ones, especially array index computations.\n\nExample: Replace imul for array indexing with pointer increments.\n\nClarification: The indexed memory operand shown does not contain an IMUL instruction: x86 can scale an index by four in addressing. A pointer increment is an alternative, not automatically a strength-reduction win.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Using index:",
            "code": "; Using index:\nmov eax, [array + rcx*4]\n; Using pointer:\nmov eax, [rsi]\nadd rsi, 4"
          }
        ]
      },
      {
        "id": "sec-21-5",
        "title": "21.5 Reducing Dependency Chains",
        "content": "A dependency chain occurs when each instruction depends on the result of the previous one, limiting ILP. The CPU must wait for the chain to complete sequentially.\n\nExample: Long chain\n\nClarification: The two displayed loops start from different sums (1 versus 0), so they are not equivalent as written. Match initialization and work before benchmarking. Two accumulators expose parallelism but do not guarantee a doubling of throughput.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "21.5 Reducing Dependency Chains — listing 1",
            "code": "    mov rax, 1\n.loop:\n    add rax, 1    ; depends on previous rax\n    add rax, 1\n    add rax, 1\n    add rax, 1\n    dec rcx\n    jnz .loop",
            "explanation": "Each add waits for the previous, so the loop runs at the latency of add (1 cycle), even though the CPU could do multiple adds per cycle.\n\nBreak the chain:"
          },
          {
            "language": "nasm",
            "title": "21.5 Reducing Dependency Chains — listing 2",
            "code": "    mov rax, 0\n    mov rbx, 0\n.loop:\n    add rax, 1\n    add rbx, 1    ; independent of rax\n    add rax, 1\n    add rbx, 1\n    dec rcx\n    jnz .loop\n    add rax, rbx",
            "explanation": "Now two independent chains run in parallel, effectively doubling throughput.\n\nUse multiple accumulators as shown earlier. Also, reorder instructions so that independent ones are grouped."
          }
        ]
      },
      {
        "id": "sec-21-6",
        "title": "21.6 Memory Access Optimization",
        "content": "Memory is often the bottleneck. Optimize by maximizing cache hits and minimizing stalls."
      },
      {
        "id": "sec-21-6-1",
        "title": "21.6.1 Cache Blocking (Tiling)",
        "content": "For large data sets that don't fit in cache, process data in blocks that fit.\n\nExample: Matrix multiplication\nInstead of iterating over entire rows/columns, process submatrices that fit in L1/L2 cache. This increases temporal locality."
      },
      {
        "id": "sec-21-6-2",
        "title": "21.6.2 Prefetching",
        "content": "Insert prefetcht0, prefetcht1, or prefetchnta instructions before data is needed.\n\nExample:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "21.6.2 Prefetching — listing 1",
            "code": "    lea rsi, [array]\n    mov rcx, len\n.loop:\n    prefetcht0 [rsi + 64]   ; prefetch next cache line\n    add rax, [rsi]\n    add rsi, 8\n    dec rcx\n    jnz .loop",
            "explanation": "Prefetching hides memory latency but consumes issue slots; use judiciously."
          }
        ]
      },
      {
        "id": "sec-21-6-3",
        "title": "21.6.3 Data Alignment",
        "content": "Align data to 16 or 64 bytes to avoid split cache line accesses and enable aligned SIMD loads/stores.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "21.6.3 Data Alignment — listing 1",
            "code": "section .data\n    align 64\n    buffer times 1024 dq 0"
          }
        ]
      },
      {
        "id": "sec-21-6-4",
        "title": "21.6.4 Avoiding False Sharing",
        "content": "In multithreaded programs, separate variables that are written by different threads should be on different cache lines. Use align 64 and padding."
      },
      {
        "id": "sec-21-6-5",
        "title": "21.6.5 Minimize Memory Access",
        "content": "Keep frequently used variables in registers. Use movzx/movsx to avoid partial loads. Use lea for address calculations instead of loading from memory."
      },
      {
        "id": "sec-21-7",
        "title": "21.7 Branch Optimization",
        "content": "Branches can stall the pipeline if mispredicted. Aim to make branches predictable or eliminate them."
      },
      {
        "id": "sec-21-7-1",
        "title": "21.7.1 Predictable Branches",
        "content": "Loops with fixed trip counts are usually predicted well. Branches that go the same direction most of the time are predictable. If a branch is truly random (e.g., checking if a random number is odd), misprediction will be high."
      },
      {
        "id": "sec-21-7-2",
        "title": "21.7.2 Branchless Code",
        "content": "Replace conditional jumps with conditional moves (cmovcc) or arithmetic.\n\nExample: Max of two integers\n\nClarification: The absolute-value CMOVS snippet tests flags from NEG, which is incorrect. Insert TEST EAX,EAX after NEG to select based on the original sign. INT32_MIN cannot be represented as a positive signed int. The max snippets are signed comparisons.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "Branch version",
            "code": "; Branch version\n    cmp eax, ebx\n    jg  .greater\n    mov eax, ebx\n.greater:\n    ; eax = max\n\n; Branchless with cmov\n    cmp eax, ebx\n    cmovl eax, ebx   ; if eax < ebx (signed), eax = ebx",
            "explanation": "For absolute value:"
          },
          {
            "language": "nasm",
            "title": "21.7.2 Branchless Code — listing 2",
            "code": "    mov ebx, eax\n    neg ebx\n    cmovs eax, ebx   ; if sign set, use negated",
            "explanation": "Bit trick for absolute value (no branches):"
          },
          {
            "language": "nasm",
            "title": "21.7.2 Branchless Code — listing 3",
            "code": "    mov ebx, eax\n    sar ebx, 31      ; sign mask\n    xor eax, ebx\n    sub eax, ebx"
          }
        ]
      },
      {
        "id": "sec-21-7-3",
        "title": "21.7.3 Jump Tables",
        "content": "For multi-way branches (switch statements), use a jump table to avoid long if-else chains.\n\nClarification: Indirect jump targets can also be mispredicted. Bounds-check the index before reading the table and use a valid default target. A pointer table in position-independent code needs appropriate relocations or relative entries.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "21.7.3 Jump Tables — listing 1",
            "code": "    ; rcx = index 0..3\n    lea rax, [jt]\n    mov rax, [rax + rcx*8]\n    jmp rax\njt:\n    dq case0, case1, case2, case3",
            "explanation": "This is efficient and predictable because the jump target is data-dependent but the indirect jump is resolved quickly."
          }
        ]
      },
      {
        "id": "sec-21-8",
        "title": "21.8 Instruction Selection and Scheduling",
        "content": "Choosing the right instructions can reduce execution time and code size."
      },
      {
        "id": "sec-21-8-1",
        "title": "21.8.1 Zeroing Registers",
        "content": "Use xor reg, reg instead of mov reg, 0. xor is shorter, breaks false dependencies, and is equally fast.\n\nClarification: Both XOR reg,reg and MOV reg,0 are independent of the old full-register value. XOR is often a compact recognized zero idiom, but changes flags; MOV preserves them."
      },
      {
        "id": "sec-21-8-2",
        "title": "21.8.2 Using lea for Arithmetic",
        "content": "lea can perform address arithmetic without modifying flags and often in one cycle. Use it for multiplications by constants and adding small offsets.\n\nExample: lea rax, [rbx + rcx*4 + 8] computes rbx + rcx*4 + 8 in one instruction."
      },
      {
        "id": "sec-21-8-3",
        "title": "21.8.3 Avoiding Slow Instructions",
        "content": "- loop instruction is slow on many CPUs; use dec rcx / jnz instead.\n- enter and leave are slower than explicit push rbp; mov rbp,rsp and mov rsp,rbp; pop rbp on some older CPUs, though modern CPUs may be fine.\n- div/idiv are very slow (20–90 cycles); replace with shifts for powers of two, or multiply by reciprocal when possible.\n\nClarification: Instruction costs vary by microarchitecture. A shift is not a drop-in replacement for signed division of negative values: rounding toward minus infinity differs from IDIV truncation toward zero. Reciprocal multiplication requires a proven algorithm and full-width arithmetic."
      },
      {
        "id": "sec-21-8-4",
        "title": "21.8.4 Avoiding Partial Register Stalls",
        "content": "Writing to a 8-bit or 16-bit register (e.g., al, ax) may cause a partial register stall because the CPU must merge with the upper bits. Use movzx/movsx to extend to full register, or write to the full 32-bit register (which zeroes upper 32 bits) when possible.\n\nExample:",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "21.8.4 Avoiding Partial Register Stalls — listing 1",
            "code": "mov al, 5        ; can cause stall if later use eax\n; Better:\nmov eax, 5      ; zeroes upper bits"
          }
        ]
      },
      {
        "id": "sec-21-8-5",
        "title": "21.8.5 Instruction Scheduling",
        "content": "Reorder instructions to hide latency. Modern CPUs do dynamic scheduling, but explicit ordering can help.\n\nExample: Interleave independent loads and computations",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "21.8.5 Instruction Scheduling — listing 1",
            "code": "mov rax, [mem1]\nmov rbx, [mem2]   ; start second load while first is in flight\nadd rax, 1\nadd rbx, 2"
          }
        ]
      },
      {
        "id": "sec-21-9",
        "title": "21.9 SIMD Vectorization",
        "content": "When processing large arrays of data, use SSE/AVX instructions to operate on multiple elements simultaneously. This can yield 2–16x speedups.\n\nExample: Vector addition of two float arrays\n\nClarification: Vector width does not translate directly into end-to-end speedup. Check zero counts, tails, address alignment and all accessed bytes. MOVUPS may be just as fast for aligned data; MOVAPS requires alignment for correctness.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "21.9 SIMD Vectorization — listing 1",
            "code": "    ; assuming 4 floats per iteration, aligned\n.loop:\n    movaps xmm0, [rsi]\n    movaps xmm1, [rdi]\n    addps xmm0, xmm1\n    movaps [rdx], xmm0\n    add rsi, 16\n    add rdi, 16\n    add rdx, 16\n    dec rcx\n    jnz .loop",
            "explanation": "Use aligned loads (movaps) for speed; for unaligned data use movups. Additionally, unroll the loop to increase ILP."
          }
        ]
      },
      {
        "id": "sec-21-10",
        "title": "21.10 Function Call Optimization",
        "content": "Function calls have overhead: pushing arguments, call/ret, prologue/epilogue. For small frequently called functions, consider inlining."
      },
      {
        "id": "sec-21-10-1",
        "title": "21.10.1 Inlining",
        "content": "Replace a function call with the function body. In assembly, you can manually inline by writing the code directly. In C/C++, use inline keyword or compiler optimization flags.\n\nTrade-off: Inlining increases code size, which may hurt instruction cache. Inline only small, hot functions."
      },
      {
        "id": "sec-21-10-2",
        "title": "21.10.2 Leaf Functions and Red Zone",
        "content": "Leaf functions (those that do not call other functions) can use the 128-byte red zone below rsp for locals without adjusting rsp, eliminating prologue/epilogue overhead.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "21.10.2 Leaf Functions and Red Zone — listing 1",
            "code": "my_leaf:\n    mov [rsp-8], rdi   ; store local in red zone\n    ; ...\n    ret"
          }
        ]
      },
      {
        "id": "sec-21-10-3",
        "title": "21.10.3 Minimize Parameter Passing Overhead",
        "content": "For functions called in a loop, pass data via pointers or use registers efficiently. Avoid pushing many stack arguments if possible."
      },
      {
        "id": "sec-21-10-4",
        "title": "21.10.4 Use call/ret Only When Needed",
        "content": "For tail calls, replace call/ret with jmp to avoid stack growth.\n\nClarification: Restore the frame and callee-saved registers before a tail jump. A target must receive arguments and stack layout according to its ABI; replacing arbitrary CALL/RET pairs mechanically is unsafe."
      },
      {
        "id": "sec-21-11",
        "title": "21.11 Case Study: Optimizing a Dot Product",
        "content": "We'll optimize a dot product of two float arrays of length 1000.\n\nBaseline scalar version:\n\nClarification: For length 1000, the original 16-element loop processes only 992 values and omits the final eight; lengths below 16 return zero. The corrected version below reuses the complete SIMD-and-tail routine from Chapter 19. It prioritizes correctness and must be benchmarked before claiming improvement.",
        "codeSnippets": [
          {
            "language": "nasm",
            "title": "21.11 Case Study: Optimizing a Dot Product — listing 1",
            "code": "dot_product:\n    xorps xmm0, xmm0\n    xor eax, eax\n.loop:\n    cmp eax, edx\n    je .done\n    movss xmm1, [rdi + rax*4]\n    mulss xmm1, [rsi + rax*4]\n    addss xmm0, xmm1\n    inc rax\n    jmp .loop\n.done:\n    ret",
            "explanation": "Optimizations applied:\n\n1. Use SIMD packed operations: Process 4 floats per iteration with mulps and addps.\n2. Unroll the loop by 2 or 4 to reduce branch overhead and increase ILP.\n3. Use multiple accumulators to break dependency chains.\n4. Align data for movaps.\n5. Prefetch upcoming cache lines.\n6. Hoist loop-invariant computations.\n\nOptimized version (unrolled 4x, 4 accumulators, prefetch):"
          },
          {
            "language": "nasm",
            "title": "21.11 Case Study: Optimizing a Dot Product — listing 2",
            "code": "dot_product_opt:\n    xorps xmm0, xmm0   ; acc0\n    xorps xmm1, xmm1   ; acc1\n    xorps xmm2, xmm2   ; acc2\n    xorps xmm3, xmm3   ; acc3\n    mov ecx, edx\n    shr ecx, 4         ; number of 16-element blocks (4 unroll * 4 floats)\n    test ecx, ecx\n    jz .remainder\n.loop:\n    prefetcht0 [rdi + 256]\n    prefetcht0 [rsi + 256]\n    movaps xmm4, [rdi]\n    mulps xmm4, [rsi]\n    addps xmm0, xmm4\n    movaps xmm5, [rdi+16]\n    mulps xmm5, [rsi+16]\n    addps xmm1, xmm5\n    movaps xmm6, [rdi+32]\n    mulps xmm6, [rsi+32]\n    addps xmm2, xmm6\n    movaps xmm7, [rdi+48]\n    mulps xmm7, [rsi+48]\n    addps xmm3, xmm7\n    add rdi, 64\n    add rsi, 64\n    dec ecx\n    jnz .loop\n    addps xmm0, xmm1\n    addps xmm2, xmm3\n    addps xmm0, xmm2\n    ; horizontal sum\n    movaps xmm1, xmm0\n    shufps xmm1, xmm1, 0x4E\n    addps xmm0, xmm1\n    movaps xmm1, xmm0\n    shufps xmm1, xmm1, 0xB1\n    addps xmm0, xmm1\n    ret\n.remainder:\n    ; handle remaining elements (not shown)\n    ret",
            "explanation": "This version processes 16 floats per loop iteration, uses four accumulators, and prefetches 256 bytes ahead. It should be significantly faster than the scalar baseline."
          },
          {
            "language": "nasm",
            "title": "Complete SIMD dot product with tail",
            "code": "dot_product:\n    xorps xmm0, xmm0\n    mov rcx, rdx\n    shr rcx, 2\n    jz .reduce\n.loop:\n    movups xmm1, [rdi]\n    movups xmm2, [rsi]\n    mulps xmm1, xmm2\n    addps xmm0, xmm1\n    add rdi, 16\n    add rsi, 16\n    dec rcx\n    jnz .loop\n.reduce:\n    movaps xmm1, xmm0\n    shufps xmm1, xmm1, 0x4e\n    addps xmm0, xmm1\n    movaps xmm1, xmm0\n    shufps xmm1, xmm1, 0xb1\n    addss xmm0, xmm1\n    and edx, 3\n    jz .done\n.tail:\n    movss xmm1, [rdi]\n    mulss xmm1, [rsi]\n    addss xmm0, xmm1\n    add rdi, 4\n    add rsi, 4\n    dec edx\n    jnz .tail\n.done:\n    ret",
            "explanation": "Supports count zero, unaligned arrays and all remainder lengths. RDI/RSI point to float arrays; RDX is count. XMM0.low returns the result. Floating-point reassociation can change rounding."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 21.1",
            "code": "    xor rax, rax\n    mov rcx, len\n.loop:\n    add rax, [rsi]\n    add rsi, 8\n    dec rcx\n    jnz .loop\n\n    xor rax, rax\n    xor rbx, rbx\n    mov rcx, len/2\n.loop:\n    add rax, [rsi]\n    add rbx, [rsi+8]\n    add rsi, 16\n    dec rcx\n    jnz .loop\n    add rax, rbx\n\n    xor rax, rax\n    xor rbx, rbx\n    xor rcx, rcx\n    xor rdx, rdx\n    mov r8, len/4\n.loop:\n    add rax, [rsi]\n    add rbx, [rsi+8]\n    add rcx, [rsi+16]\n    add rdx, [rsi+24]\n    add rsi, 32\n    dec r8\n    jnz .loop\n    add rax, rbx\n    add rcx, rdx\n    add rax, rcx",
            "explanation": "Original exercise fragment retained; the completed harness below supplies missing setup and verifies the result."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 21.2",
            "code": "max_branch:\n    cmp edi, esi\n    jg .done\n    mov edi, esi\n.done:\n    mov eax, edi\n    ret\n\nmax_branchless:\n    mov eax, edi\n    cmp esi, eax\n    cmovg eax, esi\n    ret",
            "explanation": "Original exercise fragment retained; the completed harness below supplies missing setup and verifies the result."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 21.3",
            "code": "for (i=0;i<N;i++)\n  for (j=0;j<N;j++)\n    for (k=0;k<N;k++)\n      C[i][j] += A[i][k]*B[k][j];\n\nfor (i0=0;i0<N;i0+=B)\n  for (j0=0;j0<N;j0+=B)\n    for (k0=0;k0<N;k0+=B)\n      for (i=i0;i<min(i0+B,N);i++)\n        for (j=j0;j<min(j0+B,N);j++)\n          for (k=k0;k<min(k0+B,N);k++)\n            C[i][j] += A[i][k]*B[k][j];",
            "explanation": "Original exercise fragment retained; the completed harness below supplies missing setup and verifies the result."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 21.4",
            "code": "; rax = rbx * 10\nlea rax, [rbx + rbx*4]   ; 5*rbx\nlea rax, [rax + rax]     ; 10*rbx",
            "explanation": "Original exercise fragment retained; the completed harness below supplies missing setup and verifies the result."
          },
          {
            "language": "nasm",
            "title": "Original source: Solution 21.5",
            "code": "    xor rax, rax\n    mov rcx, len\n.loop:\n    prefetcht0 [rsi + 64]   ; try 128, 256\n    add rax, [rsi]\n    add rsi, 8\n    dec rcx\n    jnz .loop",
            "explanation": "Original exercise fragment retained; the completed harness below supplies missing setup and verifies the result."
          }
        ]
      }
    ],
    "exercises": [
      {
        "id": "ex-21-1",
        "title": "Exercise 21.1: Loop Unrolling",
        "description": "Take a simple loop that sums an array of 1,000,000 qwords. Write three versions: no unroll, 2x unroll, 4x unroll. Measure performance with perf stat. Compare cycles and instructions per cycle.",
        "solution": "#include <stdint.h>\n#include <stdio.h>\n#include <stdlib.h>\n#ifndef UNROLL\n#define UNROLL 4\n#endif\n#if UNROLL != 1 && UNROLL != 2 && UNROLL != 4\n#error UNROLL must be 1, 2, or 4\n#endif\n#define N 1000000\nstatic uint64_t data[N];\nint main(void) {\n    for(unsigned i=0;i<N;i++) data[i]=1;\n    uint64_t lanes[UNROLL]={0}, sum=0;\n    unsigned i=0;\n    for(;i+UNROLL<=N;i+=UNROLL)\n        for(unsigned j=0;j<UNROLL;j++) lanes[j]+=data[i+j];\n    for(unsigned j=0;j<UNROLL;j++) sum+=lanes[j];\n    for(;i<N;i++) sum+=data[i];\n    printf(\"%llu\\n\",(unsigned long long)sum);\n    return sum==N ? 0 : 1;\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "No unroll:\n\n2x unroll:\n\n4x unroll:\n\nRun perf stat on each. The unrolled versions should show fewer instructions per element and better IPC.\n\nBuild bench.c with gcc -O2 -fno-tree-vectorize -DUNROLL=1 (then 2 and 4), and compare perf stat -r 5 runs. All must print 1000000. Inspect assembly; compiler transformations can change the source loop shape."
      },
      {
        "id": "ex-21-2",
        "title": "Exercise 21.2: Branchless Max",
        "description": "Write a function that returns the maximum of two signed integers using both branch and branchless (cmov) approaches. Benchmark both in a loop with random inputs (e.g., using rdrand or a pseudo-random sequence). Measure branch mispredictions.",
        "solution": "; File: max.asm\nsection .text\nglobal max_branch, max_branchless\nmax_branch:\n    cmp edi, esi\n    jg .done\n    mov edi, esi\n.done:\n    mov eax, edi\n    ret\nmax_branchless:\n    mov eax, edi\n    cmp esi, eax\n    cmovg eax, esi\n    ret\nsection .note.GNU-stack noalloc noexec nowrite progbits\n\n; File: main.c\n#include <stdint.h>\n#include <stdio.h>\n#include <stdlib.h>\nextern int max_branch(int,int),max_branchless(int,int);\nint main(int argc,char **argv){\n    int (*f)(int,int)=(argc>1 && atoi(argv[1]))?max_branchless:max_branch;\n    uint32_t state=7; int64_t sum=0;\n    for(unsigned i=0;i<1000000;i++){\n        state=state*1664525u+1013904223u; int a=(int)(state%2001)-1000;\n        state=state*1664525u+1013904223u; int b=(int)(state%2001)-1000;\n        int r=f(a,b); if(r!=(a>b?a:b)) return 1; sum+=r;\n    }\n    printf(\"%lld\\n\",(long long)sum); return 0;\n}",
        "solutionLanguage": "nasm",
        "solutionExplanation": "Branch version:\n\nBranchless:\n\nBenchmark by calling in a loop with random inputs. Use perf stat to observe branch misses (branch version will have many).\n\nSave the two File blocks separately; nasm -f elf64 max.asm -o max.o; gcc -O2 main.c max.o -o maxbench. Compare ./maxbench 0 and ./maxbench 1: checksums must match. Measure counters on a permitted host; random input does not guarantee a fixed misprediction rate."
      },
      {
        "id": "ex-21-3",
        "title": "Exercise 21.3: Cache Blocking",
        "description": "Implement matrix multiplication for 100x100 matrices of doubles. First, a naive triple loop. Then, apply cache blocking with block size 20x20. Compare performance.",
        "solution": "#include <stdio.h>\n#define N 100\n#define BLOCK 20\nstatic double A[N][N], B[N][N], C[N][N], D[N][N];\nstatic int min(int a,int b){return a<b?a:b;}\nint main(void){\n    for(int i=0;i<N;i++)for(int j=0;j<N;j++){A[i][j]=(i+j)%7;B[i][j]=(i*3+j)%5;}\n    for(int i=0;i<N;i++)for(int j=0;j<N;j++)for(int k=0;k<N;k++)C[i][j]+=A[i][k]*B[k][j];\n    for(int i0=0;i0<N;i0+=BLOCK)for(int j0=0;j0<N;j0+=BLOCK)for(int k0=0;k0<N;k0+=BLOCK)\n      for(int i=i0;i<min(i0+BLOCK,N);i++)for(int j=j0;j<min(j0+BLOCK,N);j++)\n        for(int k=k0;k<min(k0+BLOCK,N);k++)D[i][j]+=A[i][k]*B[k][j];\n    for(int i=0;i<N;i++)for(int j=0;j<N;j++)if(C[i][j]!=D[i][j])return 1;\n    puts(\"All 10000 results match\");return 0;\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "Naive matrix multiplication (C code for brevity):\n\nBlocked version:\n\nImplement in assembly using loops; measure cycles.\n\nSave as matrix.c; gcc -O2 matrix.c -o matrix; ./matrix checks every result. B is the matrix, BLOCK is the tile size, avoiding the source name collision. For timing, measure each kernel separately with reset output arrays and the same initial cache policy."
      },
      {
        "id": "ex-21-4",
        "title": "Exercise 21.4: Strength Reduction",
        "description": "Replace multiplication by a constant in a loop with shifts and adds (e.g., multiply by 10 using lea). Show the code and explain the speedup.",
        "solution": "section .text\nglobal _start\n_start:\n    mov rbx, 7\n    lea rax, [rbx+rbx*4]\n    lea rax, [rax+rax]\n    imul rcx, rbx, 10\n    cmp rax, rcx\n    jne .fail\n    mov rdi, rax\n    mov eax, 60\n    syscall\n.fail:\n    mov edi, 1\n    mov eax, 60\n    syscall",
        "solutionLanguage": "nasm",
        "solutionExplanation": "Multiply by 10 using lea:\n\nThis uses two lea instructions instead of imul rbx, 10, which is slower.\n\nExpected exit 70. Two LEAs are not universally faster than one IMUL; compare actual target latency, throughput and surrounding dependencies. This program checks equivalence, not a speedup."
      },
      {
        "id": "ex-21-5",
        "title": "Exercise 21.5: Prefetching",
        "description": "Write a memory-bound loop that reads a large array. Add software prefetching at various distances (e.g., 64, 128, 256 bytes ahead). Measure the effect on cache misses and total time.",
        "solution": "#include <stdint.h>\n#include <stdio.h>\n#include <stdlib.h>\n#define N 1048576\n#ifndef DISTANCE\n#define DISTANCE 64\n#endif\nstatic uint64_t data[N];\nint main(int argc,char **argv) {\n    int prefetch=argc>1 && atoi(argv[1]);\n    for(unsigned i=0;i<N;i++) data[i]=1;\n    uint64_t sum=0;\n    for(unsigned i=0;i<N;i++) {\n        if(prefetch && i+DISTANCE/8<N) __builtin_prefetch(&data[i+DISTANCE/8],0,3);\n        sum+=data[i];\n    }\n    printf(\"%llu\\n\",(unsigned long long)sum);\n    return sum==N ? 0 : 1;\n}",
        "solutionLanguage": "c",
        "solutionExplanation": "Memory-bound loop:\n\nMeasure with perf stat for cache misses and runtime.\n\nBuild with -DDISTANCE=64, 128 and 256; run with 0 for no prefetch and 1 for prefetch. The bounds check keeps the C prefetch pointer inside the array. Repeat a sufficiently long measured region; sequential hardware prefetch may make software hints redundant."
      }
    ],
    "practiceQuestions": [
      {
        "question": "What is the first step in optimizing a program? Why is it crucial?",
        "answer": "Measure a representative workload and verify correctness first. Identify hot code and bottlenecks so changes target meaningful costs."
      },
      {
        "question": "How does loop unrolling improve performance? What are the drawbacks?",
        "answer": "Unrolling reduces loop control and can expose independent work, but increases code size, register pressure and tail complexity. Measure the chosen factor."
      },
      {
        "question": "Explain what a dependency chain is and how you can break it.",
        "answer": "A dependency chain makes each operation wait for a previous result. Multiple independent accumulators split a reduction, then combine results; floating-point reassociation changes rounding."
      },
      {
        "question": "What is cache blocking? When is it beneficial?",
        "answer": "Blocking processes submatrices or tiles that can be reused in cache. It helps when repeated working sets otherwise exceed cache, but tile size and loop order need measurement."
      },
      {
        "question": "How does software prefetching work? What are the risks?",
        "answer": "Prefetch issues hints before data is needed. It can waste bandwidth/cache capacity and instructions, arrive too late, or duplicate hardware prefetch. Tune only with evidence."
      },
      {
        "question": "When would you use branchless code instead of conditional jumps?",
        "answer": "Use branchless selection when unpredictable branches dominate and the added work/dependencies are cheaper. Predictable branches and expensive unused work can favor branching."
      },
      {
        "question": "Compare xor reg, reg with mov reg, 0. Why is xor often preferred?",
        "answer": "XOR is compact and often a recognized zero idiom, but changes flags. MOV immediate zero also has no old-destination dependency and preserves flags."
      },
      {
        "question": "What is strength reduction? Provide an example.",
        "answer": "Strength reduction substitutes a proven cheaper expression, such as maintaining a pointer instead of repeatedly multiplying by a nontrivial stride. Two LEAs can compute 10*x, but may not beat IMUL on the target."
      },
      {
        "question": "How do SIMD instructions accelerate array processing?",
        "answer": "SIMD applies arithmetic to several lanes per instruction. Loads, stores, reductions, tails, memory bandwidth and instruction support constrain realized speedup."
      },
      {
        "question": "What is the red zone, and how can it reduce function call overhead?",
        "answer": "The System V user-space red zone is 128 bytes below RSP available for temporary data not live across calls. Leaf functions can avoid allocation instructions; it does not eliminate the CALL itself."
      }
    ],
    "summary": [
      "Optimization is iterative: profile first, then optimize hotspots.",
      "Loop unrolling reduces overhead and enables ILP; use multiple accumulators to break dependency chains.",
      "Cache blocking improves data locality for large working sets.",
      "Prefetching hides memory latency.",
      "Branchless code eliminates misprediction penalties.",
      "Instruction selection (e.g., lea, xor, avoiding slow instructions) matters.",
      "SIMD provides large speedups for data-parallel tasks.",
      "Function call overhead can be reduced via inlining and leaf functions.",
      "Always measure with tools like perf to validate improvements.",
      "In the next chapter, we'll explore atomic operations, multithreading, and concurrency, building on these performance foundations."
    ]
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
