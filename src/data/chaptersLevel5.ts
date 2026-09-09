import { Chapter } from '../types';

export const CHAPTERS_LEVEL_5: Chapter[] = [
  {
    id: 23,
    slug: 'chapter-23-executable-formats-elf-pe',
    level: 5,
    levelTitle: 'Low-Level Systems and Reverse Engineering',
    title: 'Chapter 23: Executable Formats: ELF and PE',
    subtitle: 'Binary Anatomy, Program & Section Headers, Relocations, and Dynamic Linking',
    learningObjectives: [
      'Understand the internal structure of ELF64 on Linux and PE32+ on Windows.',
      'Differentiate between sections (linkable units) and segments (loadable units).',
      'Understand Global Offset Table (GOT) and Procedure Linkage Table (PLT).',
      'Parse an ELF header in pure assembly.'
    ],
    prerequisites: ['Chapters 1–22'],
    keyConcepts: [
      'ELF files start with magic 0x7F 45 4C 46 ("\\x7FELF").',
      'PT_LOAD segments instruct the OS loader how to map pages into virtual memory.',
      'PE starts with DOS "MZ" magic followed by the PE header at offset 0x3C.'
    ],
    diagramType: 'executable_elf_pe',
    sections: [
      {
        id: 'sec-23-1',
        title: '23.1 Parsing the ELF64 Header in Pure Assembly',
        content: `Opening a binary file, reading its 64-byte ELF header, and extracting its virtual entry point:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'readelf_header.asm',
            code: `section .data
    msg db 'Entry point: 0x', 0
    msg_len equ $ - msg

section .bss
    fd resq 1
    elf_header resb 64
    buffer resb 16

section .text
    global _start
_start:
    ; argv[1] is at [rsp+16]
    mov rax, 2            ; sys_open
    mov rdi, [rsp+16]     ; filename
    xor rsi, rsi          ; O_RDONLY
    syscall
    mov [fd], rax

    ; read first 64 bytes
    mov rax, 0            ; sys_read
    mov rdi, [fd]
    mov rsi, elf_header
    mov rdx, 64
    syscall

    ; e_entry is at offset 0x18 (8 bytes)
    mov rax, [elf_header + 0x18]
    ; rax now contains entry point address`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-23-1',
        title: 'Exercise 23.1: Inspecting ELF Sections with readelf',
        description: 'Run readelf -h and readelf -S on any compiled binary and identify .text and .data flags.',
        solution: 'readelf -h ./binary && readelf -S ./binary',
        solutionLanguage: 'bash'
      }
    ],
    practiceQuestions: [
      {
        question: 'What is the role of the PLT and GOT in dynamic linking?',
        answer: 'The PLT (Procedure Linkage Table) contains stub code that performs lazy resolution. The GOT (Global Offset Table) holds the resolved function pointers. The first call routes through the dynamic linker, which updates the GOT for all subsequent direct calls.'
      }
    ],
    summary: ['Executable formats standardize binary loading.', 'ELF and PE define program memory maps and dynamic imports.']
  },
  {
    id: 24,
    slug: 'chapter-24-disassembly-reading-compiler-assembly',
    level: 5,
    levelTitle: 'Low-Level Systems and Reverse Engineering',
    title: 'Chapter 24: Disassembly and Reading Compiler-Generated Assembly',
    subtitle: 'Decoding C Constructs: If-Else, Loops, Switch Tables, and Optimizations',
    learningObjectives: [
      'Disassemble binaries using objdump -d -M intel and GDB.',
      'Identify compiler idioms across optimization levels (-O0, -O2, -O3).',
      'Recognize jump tables, loop induction variables, and tail-call jumps.',
      'Read array and struct indexing in compiled assembly.'
    ],
    prerequisites: ['Chapters 1–23'],
    keyConcepts: [
      '-O0 stores variables on stack; -O2 relies heavily on registers and omits frame pointers.',
      'Switch statements compile to dense jump tables or binary decision trees.',
      'Tail-call optimization replaces call/ret with jmp.'
    ],
    diagramType: 'disassembly_analysis',
    sections: [
      {
        id: 'sec-24-1',
        title: '24.1 Switch Statement Jump Table Disassembly',
        content: `How compilers translate a switch statement into an indexed jump table:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'jump_table_disassembly.asm',
            code: `; Compiled from switch(val):
    mov eax, edi
    cmp eax, 3
    ja .Ldefault
    lea rdx, [.Ltable]
    mov rax, [rdx + rax*8]
    jmp rax

.Ltable:
    dq .Lcase0
    dq .Lcase1
    dq .Lcase2
    dq .Lcase3`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-24-1',
        title: 'Exercise 24.1: Compare -O0 and -O2 for a Swap Function',
        description: 'Observe how -O0 generates stack spills while -O2 performs register-only swaps.',
        solution: 'gcc -O0 -S swap.c -> uses [rbp-8]; gcc -O2 -S swap.c -> uses only registers.',
        solutionLanguage: 'bash'
      }
    ],
    practiceQuestions: [
      {
        question: 'How do you spot an array access in disassembled code?',
        answer: 'Look for scaled indexed addressing mode [base + index*scale] where scale is 2, 4, or 8 matching the element size, often preceded by sign-extension (movsxd).'
      }
    ],
    summary: ['Disassembly reveals exact machine execution.', 'Understanding compiler patterns enables effective reverse engineering.']
  },
  {
    id: 25,
    slug: 'chapter-25-stack-frames-prologues-epilogues',
    level: 5,
    levelTitle: 'Low-Level Systems and Reverse Engineering',
    title: 'Chapter 25: Stack Frames, Prologues, and Epilogues',
    subtitle: 'Standard Frames, Frame Pointer Omission (FPO), Alloca, and Red Zone',
    learningObjectives: [
      'Master prologue and epilogue variations across compilers.',
      'Analyze stack layout for functions with more than 6 arguments.',
      'Understand how dynamic allocation (alloca, VLAs) affects stack pointer tracking.',
      'Recognize red zone usage in stripped leaf functions.'
    ],
    prerequisites: ['Chapters 1–24'],
    keyConcepts: [
      'Frame pointer rbp provides constant offset references even when rsp changes.',
      'Without a frame pointer, all variables are accessed relative to rsp.',
      'The 128-byte red zone enables leaf functions to eliminate sub rsp / add rsp.'
    ],
    diagramType: 'stack_frames_prologues',
    sections: [
      {
        id: 'sec-25-1',
        title: '25.1 Dynamic Stack Allocation (alloca Mechanics)',
        content: `Dynamic stack allocation adjusts rsp at runtime, relying on rbp for stable local variable referencing:`,
        codeSnippets: [
          {
            language: 'nasm',
            title: 'dynamic_alloc.asm',
            code: `dynamic_alloc:
    push rbp
    mov rbp, rsp
    sub rsp, rdi          ; allocate N bytes dynamically at runtime
    ; [rsp] points to the dynamic buffer
    ; [rbp-8] still reliably accesses static local variables!
    mov rsp, rbp          ; deallocates entire frame and dynamic buffer instantly!
    pop rbp
    ret`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-25-1',
        title: 'Exercise 25.1: Nine Arguments Stack Layout',
        description: 'Map the stack layout for a function taking 9 arguments.',
        solution: 'Args 1-6 in registers (rdi..r9). Arg 7 at [rbp+16], Arg 8 at [rbp+24], Arg 9 at [rbp+32]. Return address is at [rbp+8], saved rbp at [rbp].'
      }
    ],
    practiceQuestions: [
      {
        question: 'Why does alloca deallocate in O(1) time?',
        answer: 'Because the epilogue simply executes mov rsp, rbp (or leave), which restores the stack pointer to the base pointer, reclaiming all dynamically allocated stack bytes in a single instruction.'
      }
    ],
    summary: ['Stack frames manage execution state and locals.', 'Frame pointers simplify debugging and dynamic allocation.']
  },
  {
    id: 26,
    slug: 'chapter-26-reverse-engineering-fundamentals',
    level: 5,
    levelTitle: 'Low-Level Systems and Reverse Engineering',
    title: 'Chapter 26: Reverse Engineering Fundamentals',
    subtitle: 'Static & Dynamic Triage, Symbol Stripping, Control Flow Graphs, and Ghidra/radare2',
    learningObjectives: [
      'Establish a rigorous reverse engineering workflow from triage to reporting.',
      'Identify function boundaries and entry points in stripped binaries.',
      'Reconstruct high-level data structures from memory access offsets.',
      'Perform dynamic analysis using GDB, radare2, and strace.',
      'Analyze a compiled keygen to extract hidden passcodes.'
    ],
    prerequisites: ['Chapters 1–25'],
    keyConcepts: [
      'Static analysis examines binaries without execution; dynamic analysis observes runtime state.',
      'Stripped binaries remove symbol tables, requiring heuristic function boundary detection.',
      'Tracing system calls with strace rapidly exposes file, network, and process behavior.'
    ],
    diagramType: 'reverse_engineering',
    sections: [
      {
        id: 'sec-26-1',
        title: '26.1 Cracking a Keygen via Dynamic Analysis',
        content: `Setting breakpoints on strcmp in GDB to inspect password arguments:`,
        codeSnippets: [
          {
            language: 'gdb',
            title: 'gdb_keygen_cracking',
            code: `(gdb) break strcmp
(gdb) run wrong_pass
Breakpoint 1, __strcmp_avx2 ()
(gdb) x/s $rdi
0x7fffffffe180: "wrong_pass"
(gdb) x/s $rsi
0x4006c4: "secret_access_key"    # Secret passcode revealed in second argument!`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-26-1',
        title: 'Exercise 26.1: Static Triage Workflow',
        description: 'Run file, checksec, strings, and readelf on an unknown binary.',
        solution: 'file target && checksec --file=target && strings -a target | grep -E "(pass|key|flag)" && readelf -h target',
        solutionLanguage: 'bash'
      }
    ],
    practiceQuestions: [
      {
        question: 'How do you locate the main function in a stripped Linux ELF binary?',
        answer: 'Inspect the ELF entry point _start. _start sets up arguments and calls __libc_start_main. The first argument passed in RDI is the address of the user\'s main function.'
      }
    ],
    summary: ['Reverse engineering unites static disassembly and live runtime debugging.', 'Always conduct analysis within isolated virtual environments.']
  },
  {
    id: 27,
    slug: 'chapter-27-optimized-binaries-malware-analysis',
    level: 5,
    levelTitle: 'Low-Level Systems and Reverse Engineering',
    title: 'Chapter 27: Understanding Optimized Binaries and Basic Malware Analysis',
    subtitle: 'Obfuscation, Anti-Analysis, Persistence Mechanisms, and Simulated Keylogger Triage',
    learningObjectives: [
      'Deconstruct obfuscation techniques: control flow flattening and opaque predicates.',
      'Identify anti-debugging checks: ptrace self-attachment and TracerPid inspection.',
      'Detect virtual machine and sandbox environments (CPUID hypervisor bit).',
      'Analyze malware persistence mechanisms (cron jobs, Run keys, services).',
      'Perform safe dynamic analysis on a simulated Linux keylogger.'
    ],
    prerequisites: ['Chapters 1–26'],
    keyConcepts: [
      'Control flow flattening hides natural function hierarchy with a state machine switch loop.',
      'Anti-debugging detects debuggers through timing anomalies or ptrace collisions.',
      'Indicators of Compromise (IOCs) capture file hashes, registry keys, and network telemetry.'
    ],
    diagramType: 'malware_analysis',
    sections: [
      {
        id: 'sec-27-1',
        title: '27.1 Simulated Linux Keylogger Triage',
        content: `Analyzing a binary that opens /dev/input/event0 and logs keystrokes to /tmp/keys.log:`,
        codeSnippets: [
          {
            language: 'bash',
            title: 'Dynamic strace Analysis',
            code: `$ strace ./keylog
openat(AT_FDCWD, "/dev/input/event0", O_RDONLY) = 3
openat(AT_FDCWD, "/tmp/keys.log", O_WRONLY|O_CREAT|O_APPEND, 0600) = 4
read(3, {type=EV_KEY, code=KEY_H, value=1}, 24) = 24
write(4, "h", 1) = 1`
          }
        ]
      }
    ],
    exercises: [
      {
        id: 'ex-27-1',
        title: 'Exercise 27.1: CPUID Hypervisor Detection',
        description: 'Check bit 31 of ECX using cpuid leaf 1 to detect VM execution.',
        solution: `mov eax, 1\ncpuid\ntest ecx, 0x80000000   ; bit 31 = hypervisor present\njnz .vm_detected`,
        solutionLanguage: 'nasm'
      }
    ],
    practiceQuestions: [
      {
        question: 'How does ptrace(PTRACE_TRACEME) detect an active debugger?',
        answer: 'Linux allows only a single parent process to trace a child at any time. If GDB is already attached, a call to ptrace(PTRACE_TRACEME) fails and returns -1, alerting the program.'
      }
    ],
    summary: ['Malware evades analysis using obfuscation and sandbox checks.', 'Dynamic execution in monitored sandboxes exposes malicious payloads.']
  }
];
