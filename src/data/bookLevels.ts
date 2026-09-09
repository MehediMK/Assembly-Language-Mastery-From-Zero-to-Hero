import { BookLevel } from '../types';

export const BOOK_LEVELS: BookLevel[] = [
  {
    level: 1,
    title: "Foundations",
    tagline: "The Hardware-Software Interface & Machine Code Roots",
    description: "Understand machine code, CPU anatomy, registers, assemblers, linkers, data sizes, and your first x86-64 Linux program.",
    chapterRange: [1, 5]
  },
  {
    level: 2,
    title: "Core Assembly Programming",
    tagline: "Registers, Memory Addressing & Fundamental Control Flow",
    description: "Master data movement, addressing modes, arithmetic/logical instructions, comparisons, conditional jumps, arrays, strings, and stack frames.",
    chapterRange: [6, 11]
  },
  {
    level: 3,
    title: "Intermediate Assembly",
    tagline: "Pointers, Data Structures, SIMD & Operating System Interfaces",
    description: "Dive into advanced pointer manipulation, struct layout with padding, SSE/SIMD vectorization, preprocessor macros, Linux syscalls, and GDB debugging.",
    chapterRange: [12, 17]
  },
  {
    level: 4,
    title: "Advanced Assembly",
    tagline: "Microarchitecture, ABI Nuances & Concurrency",
    description: "Study out-of-order CPU execution, pipeline hazards, cache hierarchies, System V AMD64 ABI, GCC inline assembly, loop optimizations, and atomic instructions.",
    chapterRange: [18, 22]
  },
  {
    level: 5,
    title: "Low-Level Systems & Reverse Engineering",
    tagline: "Binary Anatomy, Disassembly & Binary Analysis",
    description: "Inspect ELF and PE binary headers, decode compiler optimizations, analyze prologues/epilogues, and perform static/dynamic reverse engineering with Ghidra and radare2.",
    chapterRange: [23, 27]
  },
  {
    level: 6,
    title: "Advanced Projects",
    tagline: "Seven Production-Grade Capstones Written in Pure Assembly",
    description: "Build a CLI calculator, a C-compatible string library, array sorting utilities (quicksort/binary search), a heap memory allocator, C interop wrappers, a bytecode virtual machine, and a Linux shell.",
    chapterRange: [28, 34]
  },
  {
    level: 7,
    title: "Embedded Systems & Real-Time Assembly",
    tagline: "Bare-Metal ARM Cortex-M & Peripheral Control",
    description: "Explore microcontroller architecture, Memory-Mapped I/O, UART/GPIO peripheral drivers, NVIC interrupt handling, low-power WFI sleep states, and flash bootloaders.",
    chapterRange: [35, 39]
  },
  {
    level: 8,
    title: "Security & Binary Exploitation",
    tagline: "Offensive Shellcoding, ROP Chains & Defensive Hardening",
    description: "Construct null-free position-independent shellcode, exploit stack buffer overflows, assemble Return-Oriented Programming (ROP) chains, analyze anti-debugging, and implement defensive canaries.",
    chapterRange: [40, 44]
  },
  {
    level: 9,
    title: "Cross-Platform & Alternative Architectures",
    tagline: "ARM64, RISC-V, MIPS & Unified Portable Assembly",
    description: "Master modern 64-bit ARM64 (AArch64), open-standard RISC-V (RV64), classic MIPS32 with delay slots, comparative ISA design trade-offs, and universal portable assembly macros.",
    chapterRange: [45, 49]
  }
];
